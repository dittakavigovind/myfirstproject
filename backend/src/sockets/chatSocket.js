const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const ChatSession = require('../models/ChatSession');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');

const activeSessions = new Map(); // Store interval IDs by roomId

module.exports = function (io) {
    // Middleware for Socket Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
            if (!token) return next(new Error('Authentication error: No token provided'));

            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
            socket.user = decoded; // { id, role }

            // Validate user exists
            if (decoded.role === 'astrologer') {
                const astro = await Astrologer.findOne({ userId: decoded.id });
                if (!astro) return next(new Error('Astrologer not found'));
                socket.astrologerId = astro._id.toString();
            }

            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.user.id}, Role: ${socket.user.role})`);

        socket.on('join_chat_session', async ({ roomId }) => {
            try {
                const session = await ChatSession.findOne({ roomId });
                if (!session) return socket.emit('error', 'Session not found');

                socket.join(roomId);
                socket.roomId = roomId;

                if (session.status === 'initiated') {
                    // Start the session properly if an astrologer joins, or both joined.
                    // Usually we start timer when both are connected, but let's say it starts when astrologer sends first message or joins.
                    session.status = 'active';
                    session.startTime = new Date();
                    await session.save();

                    startBillingEngine(roomId, session._id, io);
                    io.to(roomId).emit('session_started', { startTime: session.startTime });
                } else if (session.status === 'active') {
                    socket.emit('session_restored', { startTime: session.startTime, duration: session.totalDuration });
                } else {
                    socket.emit('session_ended', { reason: 'Session already completed' });
                }

                console.log(`${socket.user.role} joined session room: ${roomId}`);
            } catch (err) {
                console.error('Join Chat Error:', err);
                socket.emit('error', 'Internal server error');
            }
        });

        socket.on('send_session_message', async (data) => {
            try {
                const { roomId, content } = data;

                const session = await ChatSession.findOne({ roomId });
                if (!session || session.status !== 'active') return socket.emit('error', 'Session not active');

                const senderModel = socket.user.role === 'astrologer' ? 'Astrologer' : 'User';
                const senderId = socket.user.role === 'astrologer' ? socket.astrologerId : socket.user.id;

                const newMessage = new Message({
                    sessionId: session._id,
                    sender: senderId,
                    senderModel,
                    content
                });
                await newMessage.save();

                io.to(roomId).emit('receive_session_message', newMessage);
            } catch (err) {
                console.error("Socket Message Error:", err);
            }
        });

        socket.on('typing', ({ roomId }) => {
            socket.to(roomId).emit('user_typing', { role: socket.user.role });
        });

        socket.on('stop_typing', ({ roomId }) => {
            socket.to(roomId).emit('user_stop_typing', { role: socket.user.role });
        });

        socket.on('end_chat_session', async ({ roomId }) => {
            await terminateSession(roomId, io, 'Manual termination by ' + socket.user.role);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            // Could add reconnect-timeout logic here if a user disconnects, rather than ending immediately.
        });
    });

    async function startBillingEngine(roomId, sessionId, io) {
        if (activeSessions.has(roomId)) return; // Already running

        // Run every 60 seconds
        const intervalId = setInterval(async () => {
            try {
                const session = await ChatSession.findById(sessionId);
                if (!session || session.status !== 'active') {
                    return stopBillingEngine(roomId);
                }

                const pricePerMinute = session.pricePerMinute;
                const user = await User.findById(session.user);

                if (user.walletBalance < pricePerMinute) {
                    // Insufficient balance, terminate immediately
                    await terminateSession(roomId, io, 'Insufficient wallet balance');
                    return;
                }

                // Deduct from User
                user.walletBalance -= pricePerMinute;
                await user.save();

                // Add to Astrologer earnings
                const astrologer = await Astrologer.findById(session.astrologer);
                const commission = astrologer.commissionRate || 20; // e.g. platform takes 20%
                const earnings = pricePerMinute * ((100 - commission) / 100);

                astrologer.totalEarnings += earnings;
                astrologer.walletBalance += earnings; // Add to payout balance
                await astrologer.save();

                // Record Transaction
                await Transaction.create({
                    user: user._id,
                    amount: pricePerMinute,
                    type: 'debit',
                    status: 'success',
                    description: `Chat deduction for session ${roomId} (1 min)`,
                    referenceModel: 'ChatSession',
                    referenceId: session._id
                });

                // Record Astrologer Earning Transaction
                await Transaction.create({
                    user: astrologer.userId, // Link to astrologer's User account
                    amount: earnings,
                    type: 'credit',
                    status: 'success',
                    description: `Chat earning for session ${roomId} (1 min)`,
                    referenceModel: 'ChatSession',
                    referenceId: session._id
                });

                // Update Session
                session.totalDuration += 60; // seconds
                session.totalAmountDeducted += pricePerMinute;
                await session.save();

                // Notify Room
                io.to(roomId).emit('timer_update', {
                    duration: session.totalDuration,
                    remainingBalance: user.walletBalance
                });

                // Send 1-minute warning if balance is low
                if (user.walletBalance < pricePerMinute * 1.5) {
                    io.to(roomId).emit('balance_warning', { message: 'Wallet balance is low. Chat will end soon.' });
                }

            } catch (err) {
                console.error(`Billing Engine Error [Room ${roomId}]:`, err);
            }
        }, 60000); // 1 minute (60 seconds)

        activeSessions.set(roomId, intervalId);
    }

    function stopBillingEngine(roomId) {
        if (activeSessions.has(roomId)) {
            clearInterval(activeSessions.get(roomId));
            activeSessions.delete(roomId);
        }
    }

    async function terminateSession(roomId, io, reason = 'Terminated') {
        stopBillingEngine(roomId);

        try {
            const session = await ChatSession.findOneAndUpdate(
                { roomId },
                {
                    status: 'completed',
                    endTime: new Date(),
                    paymentStatus: 'completed'
                },
                { new: true }
            );

            if (session) {
                // Re-calculate exact duration if ending mid-minute?
                // Standard logic just charges by full minute on start/intervals.

                io.to(roomId).emit('session_ended', {
                    reason,
                    totalDuration: session.totalDuration,
                    totalDeducted: session.totalAmountDeducted
                });

                // Make all sockets leave the room
                const sockets = await io.in(roomId).fetchSockets();
                sockets.forEach(s => s.leave(roomId));
            }
        } catch (err) {
            console.error('Session Termination Error:', err);
        }
    }
};
