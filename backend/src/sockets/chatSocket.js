const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const QueueService = require('../services/QueueService');
const CryptoUtil = require('../utils/cryptoUtil');

const activeSessions = new Map(); // Store interval IDs by roomId
const disconnectTimers = new Map(); // Store timeout IDs for auto-ending sessions
module.exports = function (io) {
    // Middleware for Socket Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
            if (!token) return next(new Error('Authentication error: No token provided'));

            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id).select('-password');
            if (!user) return next(new Error('User not found'));
            
            socket.user = user;

            // Validate user exists
            if (socket.user.role === 'astrologer') {
                const astro = await Astrologer.findOne({ userId: socket.user._id });
                if (!astro) return next(new Error('Astrologer not found'));
                socket.astrologerId = astro._id.toString();
            }

            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        // Handle presence
        if (socket.user.role === 'astrologer') {
            QueueService.setAstrologerStatus(socket.astrologerId, 'online');
            socket.join(`astro_${socket.astrologerId}`); // Channel for their own notifications
        } else {
            // Join user-specific channel
            socket.join(`user_${socket.user.id}`);
        }

        socket.on('join_chat_session', async ({ roomId }) => {
            try {
                const session = await Session.findOne({ roomId });
                if (!session) return socket.emit('error', 'Session not found');

                socket.join(roomId);
                socket.roomId = roomId;

                // Clear any pending disconnect timer
                if (disconnectTimers.has(roomId)) {
                    clearTimeout(disconnectTimers.get(roomId));
                    disconnectTimers.delete(roomId);
                    console.log(`Cleared disconnect timer for room ${roomId}`);
                }

                if (session.status === 'initiated') {
                    // Do not activate session here.
                    // The session will become active when the astrologer sends the first message.
                } else if (session.status === 'active') {
                    socket.emit('session_restored', { startTime: session.startTime, duration: session.totalDuration });
                } else {
                    socket.emit('session_ended', { reason: 'Session already completed' });
                }

            } catch (err) {
                console.error('Join Chat Error:', err);
                socket.emit('error', 'Internal server error');
            }
        });

        socket.on('send_session_message', async (data) => {
            try {
                const { roomId, content } = data;

                const session = await Session.findOne({ roomId });
                if (!session || (session.status !== 'active' && session.status !== 'initiated')) {
                    return socket.emit('error', 'Session not active');
                }

                // If sender is Astrologer and session is initiated, start it!
                if (socket.user.role === 'astrologer' && session.status === 'initiated') {
                    session.status = 'active';
                    session.startTime = new Date();
                    await session.save();

                    startBillingEngine(roomId, session._id, io);
                    io.to(roomId).emit('session_started', { startTime: session.startTime });
                }

                const senderModel = socket.user.role === 'astrologer' ? 'Astrologer' : 'User';
                const senderId = socket.user.role === 'astrologer' ? socket.astrologerId : socket.user.id;

                // Encrypt message at rest
                const { encryptedData, iv } = CryptoUtil.encrypt(content);

                const newMessage = new Message({
                    sessionId: session._id,
                    sender: senderId,
                    senderModel,
                    content: encryptedData,
                    isEncrypted: true,
                    iv: iv,
                    status: 'sent' // Default to sent, wait for client ack for delivered
                });
                await newMessage.save();

                // Decrypt for live broadcast to the room so recipients see it clearly
                const broadcastMessage = newMessage.toObject();
                broadcastMessage.content = content; 

                io.to(roomId).emit('receive_session_message', broadcastMessage);
            } catch (err) {
                console.error("Socket Message Error:", err);
            }
        });

        // Read Receipts & Delivery Ack
        socket.on('message_delivered', async ({ messageId }) => {
            await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
            // Notify original sender
            const msg = await Message.findById(messageId).populate('sessionId');
            if (msg && msg.sessionId) {
                io.to(msg.sessionId.roomId).emit('message_status_update', { messageId, status: 'delivered' });
            }
        });

        socket.on('message_seen', async ({ messageId }) => {
            await Message.findByIdAndUpdate(messageId, { status: 'seen' });
            const msg = await Message.findById(messageId).populate('sessionId');
            if (msg && msg.sessionId) {
                io.to(msg.sessionId.roomId).emit('message_status_update', { messageId, status: 'seen' });
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

        socket.on('join_waitlist', async ({ astrologerId, sessionType }) => {
            try {
                const status = await QueueService.getAstrologerStatus(astrologerId);
                if (status === 'offline') {
                    return socket.emit('waitlist_error', { message: 'Astrologer is offline' });
                }

                const position = await QueueService.enqueueUser(astrologerId, socket.user.id, sessionType);
                socket.emit('waitlist_update', { position, message: 'You are in the queue' });

                // Notify Astrologer
                io.to(`astro_${astrologerId}`).emit('waitlist_new_user', {
                    userId: socket.user.id,
                    sessionType,
                    queueLength: await QueueService.getFullWaitlist(astrologerId).then(q => q.length)
                });
            } catch (err) {
                console.error("Waitlist Error:", err);
            }
        });

        socket.on('set_status', async ({ status }) => {
            if (socket.user.role === 'astrologer') {
                await QueueService.setAstrologerStatus(socket.astrologerId, status);
                io.emit('astrologer_status_changed', { astrologerId: socket.astrologerId, status });
            }
        });

        socket.on('disconnect', async () => {
            if (socket.user.role === 'astrologer') {
                QueueService.setAstrologerStatus(socket.astrologerId, 'offline');
                io.emit('astrologer_status_changed', { astrologerId: socket.astrologerId, status: 'offline' });
            }

            // Start a 30-second grace period timer to auto-end session on prolonged disconnect
            if (socket.roomId) {
                const session = await Session.findOne({ roomId: socket.roomId });
                if (session && (session.status === 'active' || session.status === 'initiated')) {
                    console.log(`Socket disconnected for room ${socket.roomId}. Starting 30s auto-end timer.`);
                    
                    // Clear existing timer if any (e.g. multiple tabs disconnecting)
                    if (disconnectTimers.has(socket.roomId)) {
                        clearTimeout(disconnectTimers.get(socket.roomId));
                    }

                    const timeoutId = setTimeout(async () => {
                        console.log(`Auto-ending session ${socket.roomId} due to prolonged disconnect.`);
                        await terminateSession(socket.roomId, io, 'Terminated due to participant disconnection');
                        disconnectTimers.delete(socket.roomId);
                    }, 30000);
                    
                    disconnectTimers.set(socket.roomId, timeoutId);
                }
            }
        });
    });

    async function startBillingEngine(roomId, sessionId, io) {
        if (activeSessions.has(roomId)) return; // Already running

        // Run every 60 seconds
        const intervalId = setInterval(async () => {
            try {
                const session = await Session.findById(sessionId);
                if (!session || session.status !== 'active') {
                    return stopBillingEngine(roomId);
                }

                const pricePerMinute = session.pricePerMinute;
                const user = await User.findById(session.userId);

                if (user.walletBalance < pricePerMinute) {
                    // Insufficient balance, terminate immediately
                    await terminateSession(roomId, io, 'Insufficient wallet balance');
                    return;
                }

                // Deduct from User
                user.walletBalance -= pricePerMinute;
                await user.save();

                // Add to Astrologer earnings
                const astrologer = await Astrologer.findById(session.astrologerId);
                const commission = astrologer.commissionRate || 20; // e.g. platform takes 20%
                const earnings = pricePerMinute * ((100 - commission) / 100);

                astrologer.totalEarnings = (astrologer.totalEarnings || 0) + earnings;
                astrologer.walletBalance = (astrologer.walletBalance || 0) + earnings; // Add to payout balance
                await astrologer.save();

                // Record Transaction
                await Transaction.create({
                    user: user._id,
                    amount: pricePerMinute,
                    type: 'debit',
                    status: 'success',
                    description: `Chat deduction for session ${roomId} (1 min)`,
                    referenceModel: 'Session',
                    referenceId: session._id
                });

                // Record Astrologer Earning Transaction
                await Transaction.create({
                    user: astrologer.userId, // Link to astrologer's User account
                    amount: earnings,
                    type: 'credit',
                    status: 'success',
                    description: `Chat earning for session ${roomId} (1 min)`,
                    referenceModel: 'Session',
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
            const session = await Session.findOneAndUpdate(
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
