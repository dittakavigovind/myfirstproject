const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all chats for the logged-in user
exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        })
            .populate('participants', 'name email role')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Get messages for a specific chat
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create or fetch existing chat with a user/astrologer
exports.createChat = async (req, res) => {
    const { partnerId } = req.body;

    try {
        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, partnerId] }
        });

        if (chat) {
            return res.json(chat);
        }

        // Create new chat
        chat = new Chat({
            participants: [req.user.id, partnerId],
            status: 'active'
        });

        await chat.save();

        // Populate for frontend consistency
        chat = await Chat.findById(chat._id).populate('participants', 'name email role');

        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const Session = require('../models/Session');
const Astrologer = require('../models/Astrologer');
const crypto = require('crypto');
const CryptoUtil = require('../utils/cryptoUtil');

// @desc Start a paid chat session
// @route POST /api/chat/start-paid
exports.startPaidChat = async (req, res) => {
    try {
        const { astrologerId, sessionType = 'chat' } = req.body;
        const userId = req.user.id;

        const astrologer = await Astrologer.findById(astrologerId);
        if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer not found' });

        // Ensure astrologer is active and online
        if (sessionType === 'audio') {
            if (!astrologer.isVoiceOnline) {
                console.error(`[StartPaidChat] 400 Error: Astrologer ${astrologer.displayName} is offline for voice.`);
                return res.status(400).json({ success: false, message: 'Astrologer is currently offline for calls' });
            }
        } else {
            if (!astrologer.isChatOnline) {
                console.error(`[StartPaidChat] 400 Error: Astrologer ${astrologer.displayName} is offline for chat.`);
                return res.status(400).json({ success: false, message: 'Astrologer is currently offline for chat' });
            }
        }

        const pricePerMinute = sessionType === 'audio' 
            ? (astrologer.charges?.callPerMinute || 20) 
            : (astrologer.charges?.chatPerMinute || 10);

        const user = await User.findById(userId);
        if (user.walletBalance < (pricePerMinute * 3)) {
            console.error(`[StartPaidChat] 400 Error: Insufficient balance. User ${user.phone} has ₹${user.walletBalance}, needs ₹${pricePerMinute * 3}`);
            return res.status(400).json({ success: false, message: `Insufficient balance. Minimum 3 minutes required (₹${pricePerMinute * 3}).` });
        }

        // Create a unique Room ID
        const roomId = crypto.randomBytes(16).toString('hex');

        const session = await Session.create({
            roomId,
            userId,
            astrologerId,
            pricePerMinute,
            sessionType: sessionType,
            status: 'initiated',
            startTime: new Date()
        });

        // Emit Socket Event for Real-Time Foreground Alert
        const io = req.app.get('io');
        if (io) {
            io.to(`astro_${astrologerId}`).emit('incoming_session', {
                roomId,
                sessionType: sessionType,
                userId,
                userName: user.name || 'User',
                timestamp: new Date()
            });
        }

        // Send FCM Push Notification for Background Alert
        try {
            const adminFirebase = require('../config/firebase');
            if (adminFirebase && adminFirebase.apps.length > 0) {
                // 1. Initialize Firestore Chat Room
                try {
                    await adminFirebase.firestore().collection('chat_sessions').doc(roomId).set({
                        roomId: roomId,
                        astrologerId: astrologerId.toString(),
                        userId: userId.toString(),
                        status: 'active',
                        createdAt: adminFirebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: adminFirebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`[StartPaidChat] Firestore room ${roomId} initialized`);
                } catch (fsErr) {
                    console.error('Failed to initialize Firestore room:', fsErr);
                }

                // 2. Send Push Notification
                const astroUser = await User.findOne({ _id: astrologer.userId }).select('fcmTokens');
                if (astroUser && astroUser.fcmTokens && astroUser.fcmTokens.length > 0) {
                    const messagePayload = {
                        notification: {
                            title: sessionType === 'audio' ? 'New Audio Call Request!' : 'New Chat Request!',
                            body: `${user.name || 'A Seeker'} has initiated a ${sessionType === 'audio' ? 'call' : 'chat'} with you. Tap to join.`
                        },
                        data: {
                            actionLink: sessionType === 'audio' ? `/call/room?id=${roomId}` : `/chat/room?id=${roomId}`,
                            type: sessionType === 'audio' ? 'incoming_call' : 'incoming_chat'
                        },
                        android: {
                            notification: {
                                channelId: 'astro_chat_alerts_v3',
                                sound: 'chat_alert' // This requires chat_alert.mp3 in res/raw on Android
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'chat_alert.wav'
                                }
                            }
                        },
                        tokens: [...new Set(astroUser.fcmTokens)]
                    };
                    await adminFirebase.messaging().sendEachForMulticast(messagePayload);
                    console.log(`[StartPaidChat] Push Notification sent to Astrologer`);
                }
            }
        } catch (pushErr) {
            console.error('Failed to send Push Notification for new chat:', pushErr);
        }

        res.status(200).json({ success: true, roomId, session });
    } catch (err) {
        console.error('Start Paid Chat Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc Get messages for a specific session
// @route GET /api/chat/session/:roomId/messages
exports.getSessionMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const session = await Session.findOne({ roomId })
            .populate({
                path: 'astrologerId',
                select: 'displayName image charges'
            })
            .populate({
                path: 'userId',
                select: 'name birthDetails profileImage gender phone mobileNumber'
            });
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        let messages = await Message.find({ sessionId: session._id })
            .sort({ createdAt: 1 });

        // Decrypt messages before sending to client
        messages = messages.map(msg => {
            const m = msg.toObject();
            if (m.isEncrypted && m.iv) {
                m.content = CryptoUtil.decrypt(m.content, m.iv);
            }
            return m;
        });

        // Fallback to Firebase if MongoDB has no messages
        if (messages.length === 0) {
            try {
                const admin = require('../config/firebase');
                if (admin && admin.apps && admin.apps.length > 0) {
                    const db = admin.firestore();
                    const snapshot = await db.collection('chat_sessions')
                        .doc(roomId)
                        .collection('messages')
                        .orderBy('createdAt', 'asc')
                        .get();
                    
                    if (!snapshot.empty) {
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            // Safely handle Firestore Timestamps
                            if (data.createdAt) {
                                if (typeof data.createdAt.toDate === 'function') {
                                    data.createdAt = data.createdAt.toDate();
                                } else if (data.createdAt._seconds !== undefined) {
                                    data.createdAt = new Date(data.createdAt._seconds * 1000);
                                }
                            }
                            messages.push({ _id: doc.id, ...data });
                        });
                    }
                }
            } catch (fbError) {
                console.error("Firebase admin fetch error:", fbError);
            }
        }

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

        res.status(200).json({ success: true, messages, session, showSessionEndedBy });
    } catch (err) {
        console.error('Get Session Messages Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get active sessions for the logged-in astrologer
// @route GET /api/chat/astrologer/sessions
exports.getSessions = async (req, res) => {
    try {
        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer profile not found' });

        const sessions = await Session.find({
            astrologerId: astrologer._id,
            status: { $in: ['initiated', 'active'] }
        }).populate({ path: 'userId', select: 'name displayName', strictPopulate: false });

        res.status(200).json({ success: true, sessions });
    } catch (err) {
        console.error('Get Astrologer Sessions Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc Get active session for the logged-in user
// @route GET /api/chat/active-session
exports.getActiveSession = async (req, res) => {
    try {
        let query = { userId: req.user.id };
        let populatePath = 'astrologerId';
        let populateSelect = 'displayName image charges profileImage name';

        if (req.user.role === 'astrologer') {
            const astrologer = await Astrologer.findOne({ userId: req.user.id });
            if (astrologer) {
                query = { astrologerId: astrologer._id };
                populatePath = 'userId';
                populateSelect = 'name displayName profileImage phone';
            }
        }

        // Clean up orphaned initiated sessions older than 5 minutes
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        await Session.updateMany(
            { ...query, status: 'initiated', createdAt: { $lt: fiveMinsAgo } },
            { $set: { status: 'failed', terminationReason: 'Timeout' } }
        );

        const session = await Session.findOne({
            ...query,
            status: { $in: ['initiated', 'active'] }
        })
        .sort({ createdAt: -1 })
        .populate({
            path: populatePath,
            select: populateSelect,
            strictPopulate: false
        });

        if (!session) return res.status(200).json({ success: true, session: null });

        res.status(200).json({ success: true, session });
    } catch (err) {
        console.error('Get Active Session Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc End a specific session by roomId reliably
// @route POST /api/chat/session/:roomId/end
exports.endSessionApi = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { reason = 'Session ended by ' + req.user.role, astrologerEndReason } = req.body;
        const io = req.app.get('io');
        
        // Find session first to verify ownership
        const session = await Session.findOne({ roomId });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Perform the exact same DB update as the socket terminateSession does
        const updatedSession = await Session.findOneAndUpdate(
            { roomId, status: { $in: ['initiated', 'active'] } },
            {
                status: 'completed',
                endTime: new Date(),
                paymentStatus: 'completed',
                terminationReason: reason,
                endedBy: req.user.role,
                ...(req.user.role === 'astrologer' && astrologerEndReason ? { astrologerEndReason } : {})
            },
            { new: true }
        );

        if (updatedSession) {
            const otherActiveSessions = await Session.countDocuments({
                astrologerId: updatedSession.astrologerId,
                status: 'active',
                _id: { $ne: updatedSession._id }
            });

            if (otherActiveSessions === 0) {
                const astro = await Astrologer.findByIdAndUpdate(updatedSession.astrologerId, { isBusy: false }, { new: true });
                if (astro && io) {
                    io.emit('astrologer_status_changed', { 
                        astrologerId: updatedSession.astrologerId.toString(), 
                        isBusy: false,
                        isChatOnline: astro.isChatOnline,
                        isVoiceOnline: astro.isVoiceOnline,
                        isVideoOnline: astro.isVideoOnline,
                        isOnline: astro.isOnline
                    });
                }
            }

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

            if (io) {
                io.to(roomId).emit('session_ended', {
                    reason,
                    endedBy: req.user.role,
                    showSessionEndedBy,
                    totalDuration: updatedSession.totalDuration,
                    totalDeducted: updatedSession.totalAmountDeducted
                });
                const sockets = await io.in(roomId).fetchSockets();
                sockets.forEach(s => s.leave(roomId));
            }
            
            // Also explicitly stop the billing engine from chatSocket if possible
            // We can emit an internal server event to stop it, or just let it naturally die
            // since the DB status is now 'completed', the next tick will see it and stop.
        }

        res.status(200).json({ success: true, message: 'Session terminated successfully' });
    } catch (err) {
        console.error('End Session API Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Decline an incoming session by astrologer
// @route POST /api/chat/session/:roomId/decline
exports.declineSession = async (req, res) => {
    try {
        const { roomId } = req.params;
        const io = req.app.get('io');
        
        // Find session
        const session = await Session.findOne({ roomId, status: 'initiated' });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found or already active/completed' });
        }

        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer || session.astrologerId.toString() !== astrologer._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to decline this session' });
        }

        // Update session status
        const updatedSession = await Session.findByIdAndUpdate(
            session._id,
            {
                status: 'failed',
                endTime: new Date(),
                terminationReason: 'declined_by_astrologer',
                endedBy: 'astrologer'
            },
            { new: true }
        );

        // Increment missed sessions for the astrologer user
        await User.findByIdAndUpdate(req.user.id, { $inc: { missedSessions: 1 } });

        // Update Astrologer to not busy
        await Astrologer.findByIdAndUpdate(astrologer._id, { isBusy: false });
        if (io) {
            io.emit('astrologer_status_changed', { 
                astrologerId: astrologer._id.toString(), 
                isBusy: false,
                isChatOnline: astrologer.isChatOnline,
                isVoiceOnline: astrologer.isVoiceOnline,
                isVideoOnline: astrologer.isVideoOnline,
                isOnline: astrologer.isOnline
            });
        }

        // Notify user
        if (io) {
            io.to(roomId).emit('session_ended', {
                reason: 'Astrologer declined the session',
                endedBy: 'astrologer',
                totalDuration: 0,
                totalDeducted: 0
            });
            const sockets = await io.in(roomId).fetchSockets();
            sockets.forEach(s => s.leave(roomId));
        }

        // Update Firestore if using it for background alerts
        try {
            const adminFirebase = require('../config/firebase');
            if (adminFirebase && adminFirebase.apps.length > 0) {
                await adminFirebase.firestore().collection('chat_sessions').doc(roomId).update({
                    status: 'failed',
                    updatedAt: adminFirebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (fsErr) {
            console.error('Failed to update Firestore room on decline:', fsErr);
        }

        res.status(200).json({ success: true, message: 'Session declined successfully' });
    } catch (err) {
        console.error('Decline Session API Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc End all active sessions for the logged-in user
// @route POST /api/chat/end-all-sessions
exports.endAllSessions = async (req, res) => {
    try {
        const io = req.app.get('io');
        let query = { userId: req.user.id };

        if (req.user.role === 'astrologer') {
            const astrologer = await Astrologer.findOne({ userId: req.user.id });
            if (astrologer) {
                query = { $or: [{ userId: req.user.id }, { astrologerId: astrologer._id }] };
            }
        }

        const activeSessions = await Session.find({
            ...query,
            status: { $in: ['initiated', 'active'] }
        });

        for (let session of activeSessions) {
            session.status = 'completed';
            session.endTime = new Date();
            await session.save();

            if (io) {
                io.to(session.roomId).emit('session_ended', {
                    reason: 'User logged out',
                    totalDuration: session.totalDuration,
                    totalDeducted: session.totalAmountDeducted
                });
                const sockets = await io.in(session.roomId).fetchSockets();
                sockets.forEach(s => s.leave(session.roomId));
            }
        }
        res.status(200).json({ success: true, message: 'All active sessions ended' });
    } catch (err) {
        console.error('End All Sessions Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get past sessions (history)
// @route GET /api/chat/history
exports.getHistory = async (req, res) => {
    try {
        let query = { userId: req.user.id };
        let populatePath = 'astrologerId';
        let populateSelect = 'displayName image charges profileImage name';

        if (req.user.role === 'astrologer') {
            const astrologer = await Astrologer.findOne({ userId: req.user.id });
            if (astrologer) {
                query = { astrologerId: astrologer._id };
                populatePath = 'userId';
                populateSelect = 'name displayName profileImage phone mobileNumber';
            }
        }

        const sessions = await Session.find({
            ...query,
            status: { $in: ['active', 'initiated', 'completed', 'terminated', 'failed', 'missed'] }
        })
        .populate({
            path: populatePath,
            select: populateSelect,
            strictPopulate: false
        })
        .sort({ createdAt: -1 })
        .limit(100); // Limit query for performance, then filter in memory

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filteredSessions = sessions.filter((session, index) => {
            return index < 5 || new Date(session.createdAt) >= sevenDaysAgo;
        });

        res.status(200).json({ success: true, sessions: filteredSessions });
    } catch (err) {
        console.error('Get History Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get 3-month chat sessions for a specific astrologer (Admin)
// @route GET /api/chat/admin/astrologer/:astrologerId/sessions
exports.getAdminAstrologerSessions = async (req, res) => {
    try {
        const { astrologerId } = req.params;
        
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const sessions = await Session.find({
            astrologerId: astrologerId,
            createdAt: { $gte: threeMonthsAgo }
        })
        .populate({ path: 'userId', select: 'name displayName', strictPopulate: false })
        .sort({ createdAt: -1 });

        res.status(200).json({ success: true, sessions });
    } catch (err) {
        console.error('Get Admin Astrologer Sessions Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Delete old chat data based on a date range (Admin)
// @route DELETE /api/chat/admin/delete-old
exports.deleteOldChatData = async (req, res) => {
    try {
        const { beforeDate } = req.body;
        if (!beforeDate) return res.status(400).json({ success: false, message: 'beforeDate is required' });

        const dateLimit = new Date(beforeDate);

        // Delete all messages created before this date
        // Note: messages might be tied to sessions, so if we delete sessions we should delete messages too.
        // We'll delete both Sessions and Messages before this date.
        
        const sessionsToDelete = await Session.find({ createdAt: { $lt: dateLimit } }, '_id');
        const sessionIds = sessionsToDelete.map(s => s._id);

        const msgRes = await require('../models/Message').deleteMany({ sessionId: { $in: sessionIds } });
        const sesRes = await Session.deleteMany({ createdAt: { $lt: dateLimit } });

        res.status(200).json({ 
            success: true, 
            message: `Deleted ${sesRes.deletedCount} sessions and ${msgRes.deletedCount} messages before ${dateLimit.toDateString()}` 
        });
    } catch (err) {
        console.error('Delete Old Chat Data Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
