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
        const { astrologerId } = req.body;
        const userId = req.user.id;

        const astrologer = await Astrologer.findById(astrologerId);
        if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer not found' });

        // Ensure astrologer is active and online
        if (!astrologer.isChatOnline) {
            console.error(`[StartPaidChat] 400 Error: Astrologer ${astrologer.displayName} is offline for chat.`);
            return res.status(400).json({ success: false, message: 'Astrologer is currently offline for chat' });
        }

        const pricePerMinute = astrologer.charges?.chatPerMinute || 10;

        const user = await User.findById(userId);
        if (user.walletBalance < (pricePerMinute * 5)) {
            console.error(`[StartPaidChat] 400 Error: Insufficient balance. User ${user.phone} has ₹${user.walletBalance}, needs ₹${pricePerMinute * 5}`);
            return res.status(400).json({ success: false, message: `Insufficient balance. Minimum 5 minutes required (₹${pricePerMinute * 5}).` });
        }

        // Create a unique Room ID
        const roomId = crypto.randomBytes(16).toString('hex');

        const session = await Session.create({
            roomId,
            userId,
            astrologerId,
            pricePerMinute,
            sessionType: 'chat',
            status: 'initiated',
            startTime: new Date()
        });

        // Emit Socket Event for Real-Time Foreground Alert
        const io = req.app.get('io');
        if (io) {
            io.to(`astro_${astrologerId}`).emit('incoming_session', {
                roomId,
                sessionType: 'chat',
                userId,
                userName: user.name || 'User',
                timestamp: new Date()
            });
        }

        // Send FCM Push Notification for Background Alert
        try {
            const adminFirebase = require('../config/firebase');
            if (adminFirebase && adminFirebase.apps.length > 0) {
                const astroUser = await User.findOne({ _id: astrologer.userId }).select('fcmTokens');
                if (astroUser && astroUser.fcmTokens && astroUser.fcmTokens.length > 0) {
                    const messagePayload = {
                        notification: {
                            title: 'New Chat Request!',
                            body: `${user.name || 'A Seeker'} has initiated a chat with you. Tap to join.`
                        },
                        data: {
                            actionLink: `/chat/room?id=${roomId}`,
                            type: 'incoming_chat'
                        },
                        android: {
                            notification: {
                                channelId: 'astro_chat_alerts',
                                sound: 'chat_alert' // This requires chat_alert.wav in res/raw on Android
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'chat_alert.wav'
                                }
                            }
                        },
                        tokens: astroUser.fcmTokens
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
                select: 'name birthDetails profileImage gender'
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

        res.status(200).json({ success: true, messages, session });
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
        }).populate('userId', 'name displayName');

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

        const session = await Session.findOne({
            ...query,
            status: { $in: ['initiated', 'active'] }
        }).populate({
            path: populatePath,
            select: populateSelect
        });

        if (!session) return res.status(200).json({ success: true, session: null });

        res.status(200).json({ success: true, session });
    } catch (err) {
        console.error('Get Active Session Error:', err);
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
                populateSelect = 'name displayName profileImage phone';
            }
        }

        const sessions = await Session.find({
            ...query,
            status: { $in: ['active', 'initiated', 'completed', 'terminated', 'failed', 'missed'] }
        })
        .populate({
            path: populatePath,
            select: populateSelect
        })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50 for now

        res.status(200).json({ success: true, sessions });
    } catch (err) {
        console.error('Get History Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
