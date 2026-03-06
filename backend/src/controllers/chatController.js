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

const ChatSession = require('../models/ChatSession');
const Astrologer = require('../models/Astrologer');
const crypto = require('crypto');

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
            return res.status(400).json({ success: false, message: 'Astrologer is currently offline for chat' });
        }

        const pricePerMinute = astrologer.charges?.chatPerMinute || 10;

        const user = await User.findById(userId);
        if (user.walletBalance < (pricePerMinute * 5)) {
            return res.status(400).json({ success: false, message: `Insufficient balance. Minimum 5 minutes required (₹${pricePerMinute * 5}).` });
        }

        // Create a unique Room ID
        const roomId = crypto.randomBytes(16).toString('hex');

        const session = await ChatSession.create({
            roomId,
            user: userId,
            astrologer: astrologerId,
            pricePerMinute,
            status: 'initiated',
            startTime: new Date()
        });

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
        const session = await ChatSession.findOne({ roomId }).populate({
            path: 'astrologer',
            select: 'displayName image charges'
        });
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const messages = await Message.find({ sessionId: session._id })
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, messages, session });
    } catch (err) {
        console.error('Get Session Messages Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get active sessions for the logged-in astrologer
// @route GET /api/chat/astrologer/sessions
exports.getAstrologerSessions = async (req, res) => {
    try {
        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer profile not found' });

        const sessions = await ChatSession.find({
            astrologer: astrologer._id,
            status: { $in: ['initiated', 'active'] }
        }).populate('user', 'name displayName');

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
        const session = await ChatSession.findOne({
            user: req.user.id,
            status: { $in: ['initiated', 'active'] }
        }).populate({
            path: 'astrologer',
            select: 'displayName image charges'
        });

        if (!session) return res.status(200).json({ success: true, session: null });

        res.status(200).json({ success: true, session });
    } catch (err) {
        console.error('Get Active Session Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
