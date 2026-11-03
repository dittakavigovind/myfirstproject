const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const Session = require('../models/Session');
const AstrologerSession = require('../models/AstrologerSession');
const AstrologerOnlineSession = require('../models/AstrologerOnlineSession');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const QueueService = require('../services/QueueService');
const CryptoUtil = require('../utils/cryptoUtil');
const AiInsightService = require('../services/AiInsightService');
const { clearPendingSessionTimer, resetConsecutiveMissed } = require('../controllers/chatController');

const activeSessions = new Map(); // Store interval IDs by roomId
const disconnectTimers = new Map(); // Store timeout IDs for auto-ending sessions
const offlineTimers = new Map(); // Store timeout IDs for 10s grace period before marking offline

let globalIo = null;

function chatSocket(io) {
    globalIo = io;
    // Middleware for Socket Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
            if (!token) return next(new Error('Authentication error: No token provided'));

            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            socket.data.user = user;

            // Validate user exists
            if (socket.user.role === 'astrologer') {
                const astro = await Astrologer.findOne({ userId: socket.user.id });
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
            const astrologerId = socket.astrologerId;
            QueueService.setAstrologerStatus(astrologerId, 'online');
            socket.join(`astro_${astrologerId}`);

            // Clear any pending disconnect timer for Astrologer
            if (disconnectTimers.has(astrologerId)) {
                clearTimeout(disconnectTimers.get(astrologerId));
                disconnectTimers.delete(astrologerId);
                console.log(`[Socket] Cleared disconnect timer for Astrologer ${astrologerId}`);
            }

            // Clear any pending offline timer
            if (offlineTimers.has(astrologerId)) {
                clearTimeout(offlineTimers.get(astrologerId));
                offlineTimers.delete(astrologerId);
                console.log(`[Socket] Cleared offline timer for Astrologer ${astrologerId}`);
            }

            // Restore availability from backup
            const restoreStatus = async () => {
                const astro = await Astrologer.findById(astrologerId);
                if (astro) {
                    const backup = astro.statusBackup;
                    // If backup exists and has keys, use it. Otherwise, assume they stay with what they had, or default to false.
                    if (backup && typeof backup.isChatOnline !== 'undefined') {
                        astro.isChatOnline = backup.isChatOnline;
                        astro.isVoiceOnline = backup.isVoiceOnline;
                        astro.isVideoOnline = backup.isVideoOnline;
                        astro.isOnline = astro.isChatOnline || astro.isVoiceOnline || astro.isVideoOnline;
                    }
                    await astro.save();

                    // Sync User model too!
                    await User.findByIdAndUpdate(astro.userId, {
                        isOnline: astro.isOnline,
                        isChatOnline: astro.isChatOnline,
                        isVoiceOnline: astro.isVoiceOnline,
                        isVideoOnline: astro.isVideoOnline
                    });

                    io.emit('astrologer_status_changed', {
                        astrologerId,
                        isChatOnline: astro.isChatOnline,
                        isVoiceOnline: astro.isVoiceOnline,
                        isVideoOnline: astro.isVideoOnline,
                        isOnline: astro.isOnline,
                        isBusy: astro.isBusy
                    });
                }
            };
            restoreStatus();
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
                    // If it's an audio or video call, and the astrologer joins, activate session!
                    if (socket.user.role === 'astrologer' && (session.sessionType === 'audio' || session.sessionType === 'video' || session.sessionType === 'voice')) {
                        console.log(`[Socket] Astrologer joined call session ${roomId}. Activating call session.`);
                        await activateSession(session, io);
                    }
                } else if (session.status === 'active') {
                    const actualElapsedSeconds = session.startTime
                        ? Math.floor((new Date() - session.startTime) / 1000)
                        : 0;
                    socket.emit('session_restored', {
                        startTime: session.startTime,
                        duration: session.totalDuration,
                        actualElapsedSeconds
                    });

                    // If server restarted, the in-memory billing interval is lost. Restart it.
                    if (socket.user.role === 'astrologer' && !activeSessions.has(roomId)) {
                        console.log(`Restarting billing engine for active room ${roomId} after reconnect.`);
                        startBillingEngine(roomId, session._id, io);
                    }
                } else if (['completed', 'terminated', 'missed', 'failed'].includes(session.status)) {
                    // Do not emit session_ended here, otherwise it kicks the user out of the history view
                    socket.emit('session_read_only', { status: session.status });
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
                console.log(`[Socket] Message attempt in Room ${roomId} by ${socket.user.role}`);

                const session = await Session.findOne({ roomId });
                if (!session || (session.status !== 'active' && session.status !== 'initiated')) {
                    console.log(`[Socket] Message blocked: Session ${roomId} status is ${session?.status}`);
                    return socket.emit('error', 'Session not active');
                }

                // If session is initiated, ONLY start billing if the astrologer sends the first message!
                if (session.status === 'initiated') {
                    if (socket.user.role === 'astrologer') {
                        console.log(`[Socket] Astrologer sent first message. Starting billing for session ${roomId}`);
                        await activateSession(session, io);
                    } else {
                        console.log(`[Socket] User sent message in initiated session ${roomId}. Waiting for Astrologer response to start billing.`);
                    }
                }

                const senderModel = socket.user.role === 'astrologer' ? 'Astrologer' : 'User';

                const senderId = socket.user.role === 'astrologer' ? socket.astrologerId : socket.user.id;

                console.log(`[Socket] Saving message from ${senderModel} (${senderId})`);

                // Encrypt message at rest
                const { encryptedData, iv } = CryptoUtil.encrypt(content);

                const newMessage = new Message({
                    sessionId: session._id,
                    sender: senderId,
                    senderModel,
                    content: encryptedData,
                    isEncrypted: true,
                    iv: iv,
                    status: 'sent'
                });
                await newMessage.save();

                // Decrypt for live broadcast to the room so recipients see it clearly
                const broadcastMessage = newMessage.toObject();
                broadcastMessage.content = content;

                io.to(roomId).emit('receive_session_message', broadcastMessage);
                console.log(`[Socket] Message broadcasted to room ${roomId}`);
            } catch (err) {
                console.error("Socket Message Error:", err);
            }
        });

        // Triggered by frontend when Firebase message is sent (to start timer)
        socket.on('start_chat_session', async ({ roomId }) => {
            console.log(`[Socket] Received start_chat_session for roomId ${roomId} by ${socket.user?.role}`);
            try {
                // SECURITY & BUSINESS RULE: ONLY the astrologer can trigger billing and timer start!
                if (socket.user?.role !== 'astrologer') {
                    console.log(`[Socket] Ignored start_chat_session from user ${socket.user?.id} (${socket.user?.role}). Billing timer only starts when astrologer responds.`);
                    return;
                }

                const session = await Session.findOne({ roomId });
                if (session && session.status === 'initiated') {
                    console.log(`[Socket] Starting billing via Astrologer trigger for session ${roomId}`);
                    await activateSession(session, io);
                }
            } catch (err) {
                console.error("Start Session Error:", err);
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

        socket.on('end_chat_session', async ({ roomId }, callback) => {
            await terminateSession(roomId, io, 'Session ended by ' + socket.user.role, socket.user.role);
            if (typeof callback === 'function') {
                callback({ success: true });
            }
        });

        socket.on('join_waitlist', async ({ astrologerId, sessionType }) => {
            try {
                const status = await QueueService.getAstrologerStatus(astrologerId);
                if (status === 'offline') {
                    return socket.emit('waitlist_error', { message: 'Astrologer is offline' });
                }

                // Check for active blocks
                const UserBlock = require('../models/UserBlock');
                const astro = await Astrologer.findById(astrologerId);
                const blockExists = await UserBlock.findOne({
                    $or: [
                        { blockerId: socket.user.id, blockerModel: 'User', blockedId: astrologerId, blockedModel: 'Astrologer' },
                        { blockerId: astrologerId, blockerModel: 'Astrologer', blockedId: socket.user.id, blockedModel: 'User' },
                        ...(astro ? [{ blockerId: astro.userId, blockerModel: 'Astrologer', blockedId: socket.user.id, blockedModel: 'User' }] : [])
                    ]
                });

                if (blockExists) {
                    return socket.emit('waitlist_error', { message: 'Interaction blocked by user preferences.' });
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
                const astrologerId = socket.astrologerId;

                // Check if they have other active sockets before handling disconnect
                const activeAstroSockets = await io.in(`astro_${astrologerId}`).fetchSockets();

                if (activeAstroSockets.length === 0) {
                    console.log(`[Socket] Astrologer ${astrologerId} app closed/disconnected. Retaining online status for background FCM push alerts.`);

                    // Only handle active ongoing consultations (NOT newly initiated requests, which have their own 60s ring timeout)
                    const activeOngoingSessions = await Session.find({
                        astrologerId,
                        status: 'active'
                    });

                    if (activeOngoingSessions.length > 0) {
                        // Wait 30 seconds before terminating active ongoing consultations (Grace Period for reconnection)
                        const timeoutId = setTimeout(async () => {
                            console.log(`[Socket] Grace period ended for ${astrologerId}. Terminating dropped ongoing sessions.`);
                            try {
                                for (const session of activeOngoingSessions) {
                                    console.log(`[Socket] Forcing termination of active session ${session._id} due to astrologer disconnect`);
                                    await terminateSession(session.roomId, io, 'Astrologer disconnected', 'system');
                                }
                                disconnectTimers.delete(astrologerId);
                            } catch (err) {
                                console.error('Error in Astrologer disconnect timeout:', err);
                            }
                        }, 30000);

                        disconnectTimers.set(astrologerId, timeoutId);
                    }
                }
            }

            // Start a 30-second grace period timer to auto-end session on prolonged disconnect (for Users)
            if (socket.roomId && socket.user.role === 'user') {
                const session = await Session.findOne({ roomId: socket.roomId });
                if (session && (session.status === 'active' || session.status === 'initiated')) {
                    console.log(`Socket disconnected for user in room ${socket.roomId}. Starting 30s auto-end timer.`);

                    // Clear existing timer if any (e.g. multiple tabs disconnecting)
                    if (disconnectTimers.has(socket.roomId)) {
                        clearTimeout(disconnectTimers.get(socket.roomId));
                    }

                    const timeoutId = setTimeout(async () => {
                        console.log(`Auto-ending session ${socket.roomId} due to prolonged disconnect.`);
                        await terminateSession(socket.roomId, io, 'Terminated due to participant disconnection', 'system');
                        disconnectTimers.delete(socket.roomId);
                    }, 30000);

                    disconnectTimers.set(socket.roomId, timeoutId);
                }
            }
        });
    });

    // Expose methods on io
    io.activateSession = (session, startTimeOverride) => activateSession(session, io, startTimeOverride);
    io.startBillingEngine = (roomId, sessionId) => startBillingEngine(roomId, sessionId, io);
    io.stopBillingEngine = (roomId) => stopBillingEngine(roomId);
    io.terminateSession = (roomId, reason, endedBy) => terminateSession(roomId, io, reason, endedBy);
}

    async function performDeduction(roomId, sessionId, io) {
        try {
            const session = await Session.findById(sessionId);
            if (!session || session.status !== 'active') return false;

            const pricePerMinute = session.pricePerMinute;
            const user = await User.findById(session.userId);

            if (user.walletBalance < pricePerMinute) {
                await terminateSession(roomId, io, 'Insufficient wallet balance', 'system');
                return false;
            }

            // Deduct from User
            user.walletBalance -= pricePerMinute;
            await user.save();

            // 1. Fetch Commission Rate (Astro specific or Global Fallback)
            const astrologerInfo = await Astrologer.findById(session.astrologerId).select('commissionRate userId');
            let platformFeePercentage = 40; // Default 40%

            const PricingConfig = require('../models/PricingConfig');
            const pConfig = await PricingConfig.findOne();
            if (pConfig && pConfig.globalRates && pConfig.globalRates.globalPlatformFee !== undefined) {
                platformFeePercentage = pConfig.globalRates.globalPlatformFee;
            }

            if (astrologerInfo.commissionRate !== undefined && astrologerInfo.commissionRate !== null) {
                platformFeePercentage = astrologerInfo.commissionRate;
            }

            const platformFee = (pricePerMinute * platformFeePercentage) / 100;
            const earnings = pricePerMinute - platformFee;

            // Update Session amount and shares
            await Session.findByIdAndUpdate(session._id, {
                $inc: {
                    totalAmountDeducted: pricePerMinute,
                    platformShare: platformFee,
                    astrologerShare: earnings
                }
            });

            // Add to Astrologer earnings
            await Astrologer.findByIdAndUpdate(session.astrologerId, {
                $inc: {
                    totalEarnings: earnings,
                    walletBalance: earnings
                }
            });

            // Also update the User record for the astrologer so the profile page shows the balance
            await User.findByIdAndUpdate(astrologerInfo.userId, {
                $inc: { walletBalance: earnings }
            });

            // Record Transactions
            await Transaction.findOneAndUpdate(
                {
                    user: user._id,
                    referenceModel: 'Session',
                    referenceId: session._id,
                    type: 'debit'
                },
                {
                    $inc: { amount: pricePerMinute },
                    $set: {
                        status: 'success',
                        description: `Chat deduction for session ${roomId}`
                    }
                },
                { upsert: true, new: true }
            );

            await Transaction.findOneAndUpdate(
                {
                    user: astrologerInfo.userId,
                    referenceModel: 'Session',
                    referenceId: session._id,
                    type: 'credit'
                },
                {
                    $inc: { amount: earnings },
                    $set: {
                        status: 'success',
                        description: `Chat earning for session ${roomId}`
                    }
                },
                { upsert: true, new: true }
            );

            // Update Session duration
            session.totalDuration += 60;
            await session.save();

            // Notify Room with actual elapsed time, not billed time
            const actualElapsedSeconds = session.startTime
                ? Math.floor((new Date() - session.startTime) / 1000)
                : 0;

            const socketIo = io || globalIo;
            if (socketIo) {
                socketIo.to(roomId).emit('timer_update', {
                    duration: actualElapsedSeconds,
                    remainingBalance: user.walletBalance,
                    pricePerMinute: pricePerMinute
                });

                if (user.walletBalance <= pricePerMinute * 2) {
                    socketIo.to(roomId).emit('balance_warning', { message: 'Wallet balance is low. Chat will end soon.' });
                }
            }

            return true;
        } catch (err) {
            console.error(`Deduction Error [Room ${roomId}]:`, err);
            return false;
        }
    }

    async function activateSession(session, customIo, startTimeOverride = null) {
        const socketIo = customIo || io;
        if (!session) return null;
        const roomId = session.roomId;

        if (session.status === 'active') {
            console.log(`[SessionActivate] Session ${roomId} is already active.`);
            return session;
        }
        if (['completed', 'terminated', 'failed', 'missed', 'declined'].includes(session.status)) {
            console.log(`[SessionActivate] Session ${roomId} is already ended (${session.status}), cannot activate.`);
            return session;
        }

        console.log(`[SessionActivate] Activating session ${roomId}`);
        clearPendingSessionTimer(roomId);

        // Reset consecutive missed sessions for the astrologer
        try {
            const astro = await Astrologer.findById(session.astrologerId);
            if (astro && astro.userId) {
                await resetConsecutiveMissed(astro.userId);
            }
        } catch (e) {
            console.error('[SessionActivate] Error resetting consecutive missed:', e);
        }

        const sessionStartTime = startTimeOverride ? new Date(startTimeOverride) : new Date();
        session.status = 'active';
        session.startTime = sessionStartTime;
        await session.save();

        // Start billing engine
        startBillingEngine(roomId, session._id, socketIo);

        // Mark Astrologer as Busy
        await Astrologer.findByIdAndUpdate(session.astrologerId, { isBusy: true });
        if (socketIo) {
            socketIo.emit('astrologer_status_changed', { astrologerId: session.astrologerId.toString(), isBusy: true });
            socketIo.to(roomId).emit('session_started', { startTime: session.startTime });
        }

        // Update Firestore chat_sessions doc with status active so mobile / web onSnapshot listeners react instantly
        try {
            require('../config/firebase');
            const { getApps } = require('firebase-admin/app');
            const { getFirestore } = require('firebase-admin/firestore');
            if (getApps().length > 0) {
                await getFirestore().collection('chat_sessions').doc(roomId).set({
                    status: 'active',
                    startTime: session.startTime.getTime(),
                    updatedAt: Date.now()
                }, { merge: true });
            }
        } catch (fsErr) {
            console.error('[SessionActivate] Error updating Firestore on session activate:', fsErr);
        }

        return session;
    }

    async function startBillingEngine(roomId, sessionId, io) {
        if (activeSessions.has(roomId)) return;

        // 1. Immediate first-minute deduction
        const success = await performDeduction(roomId, sessionId, io);
        if (!success) return;

        // 2. Interval for subsequent minutes
        const intervalId = setInterval(async () => {
            await performDeduction(roomId, sessionId, io);
        }, 60000);

        activeSessions.set(roomId, intervalId);
    }

    function stopBillingEngine(roomId) {
        if (activeSessions.has(roomId)) {
            clearInterval(activeSessions.get(roomId));
            activeSessions.delete(roomId);
        }
    }

    async function terminateSession(roomId, io, reason = 'Terminated', endedBy = 'system') {
        const socketIo = io || globalIo;
        stopBillingEngine(roomId);
        clearPendingSessionTimer(roomId);

        let showSessionEndedBy = { toUser: true, toAstrologer: true };
        try {
            const AppConfig = require('../models/AppConfig');
            const config = await AppConfig.findOne({});
            if (config && config.showSessionEndedBy) {
                showSessionEndedBy = config.showSessionEndedBy;
            }
        } catch (err) {
            console.error('Error fetching AppConfig for showSessionEndedBy:', err);
        }

        try {
            const session = await Session.findOneAndUpdate(
                { roomId },
                {
                    status: 'completed',
                    endTime: new Date(),
                    paymentStatus: 'completed',
                    terminationReason: reason,
                    endedBy: endedBy
                },
                { new: true }
            );

            if (session) {
                // Re-calculate exact duration if ending mid-minute?
                // Standard logic just charges by full minute on start/intervals.

                // Check if astrologer has any other active sessions before marking as not busy
                const otherActiveSessions = await Session.countDocuments({
                    astrologerId: session.astrologerId,
                    status: 'active',
                    _id: { $ne: session._id }
                });

                if (otherActiveSessions === 0) {
                    const astro = await Astrologer.findByIdAndUpdate(session.astrologerId, { isBusy: false }, { new: true });
                    if (socketIo) {
                        socketIo.emit('astrologer_status_changed', {
                            astrologerId: session.astrologerId.toString(),
                            isBusy: false,
                            isChatOnline: astro.isChatOnline,
                            isVoiceOnline: astro.isVoiceOnline,
                            isVideoOnline: astro.isVideoOnline,
                            isOnline: astro.isOnline
                        });
                    }
                }

                if (socketIo) {
                    socketIo.to(roomId).emit('session_ended', {
                        reason,
                        endedBy,
                        showSessionEndedBy,
                        totalDuration: session.totalDuration,
                        totalDeducted: session.totalAmountDeducted
                    });

                    // Make all sockets leave the room
                    const sockets = await socketIo.in(roomId).fetchSockets();
                    sockets.forEach(s => s.leave(roomId));
                }

                // Generate AI Insights (asynchronous, don't await so we don't block socket termination)
                AiInsightService.generateSessionSummary(session._id).catch(err => {
                    console.error("AI Insight Generation Error:", err);
                });
            }
        } catch (err) {
            console.error('Session Termination Error:', err);
        }
    }

module.exports = chatSocket;
module.exports.activateSession = (session, customIo, startTimeOverride) => activateSession(session, customIo || globalIo, startTimeOverride);
module.exports.startBillingEngine = (roomId, sessionId, customIo) => startBillingEngine(roomId, sessionId, customIo || globalIo);
module.exports.stopBillingEngine = (roomId) => stopBillingEngine(roomId);
module.exports.terminateSession = (roomId, customIo, reason, endedBy) => terminateSession(roomId, customIo || globalIo, reason, endedBy);
