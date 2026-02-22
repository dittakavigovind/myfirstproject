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
