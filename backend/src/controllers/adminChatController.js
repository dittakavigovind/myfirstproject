const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');

// @desc Get all chat sessions (active/completed)
// @route GET /api/admin/chats
exports.getAllSessions = async (req, res) => {
    try {
        const { status, limit = 50, page = 1 } = req.query;
        const query = status ? { status } : {};

        const sessions = await ChatSession.find(query)
            .populate('user', 'name email phone')
            .populate('astrologer', 'displayName')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await ChatSession.countDocuments(query);

        res.status(200).json({
            success: true,
            sessions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Admin Get Sessions Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Force end a session
// @route POST /api/admin/chats/:sessionId/force-end
exports.forceEndSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await ChatSession.findById(sessionId);

        if (!session || session.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Active session not found' });
        }

        // We need to trigger termination in the socket manager.
        // We'll use the io instance attached to app
        const io = req.app.get('io');

        // This is a bit tricky since terminateSession is local to chatSocket.js
        // We can emit a specific event that chatSocket listens for on the 'admin' level,
        // or just perform the DB update here and the billing engine will eventually stop (or we tell it to).
        // Best: Emit an internal event.

        io.to(session.roomId).emit('session_ended', { reason: 'Force terminated by Admin' });

        session.status = 'terminated';
        session.endTime = new Date();
        await session.save();

        res.status(200).json({ success: true, message: 'Session terminated' });
    } catch (err) {
        console.error('Force End Session Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Download chat logs as CSV
// @route GET /api/admin/chats/:sessionId/export
exports.exportChatLogs = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await Message.find({ sessionId })
            .populate('sender', 'name role')
            .sort('createdAt');

        if (!messages.length) {
            return res.status(404).json({ success: false, message: 'No logs found for this session' });
        }

        const data = messages.map(m => ({
            Time: m.createdAt.toISOString(),
            Sender: m.sender?.name || 'Unknown',
            Role: m.senderModel,
            Content: m.content
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`chat_logs_${sessionId}.csv`);
        return res.send(csv);
    } catch (err) {
        console.error('Export Chat Logs Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc Get chat revenue analytics
// @route GET /api/admin/chats/stats
exports.getChatStats = async (req, res) => {
    try {
        const statsAggregation = await ChatSession.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmountDeducted' },
                    totalDuration: { $sum: '$totalDuration' },
                    totalSessions: { $sum: 1 }
                }
            }
        ]);

        const activeNow = await ChatSession.countDocuments({ status: 'active' });

        const stats = statsAggregation[0] || { totalRevenue: 0, totalDuration: 0, totalSessions: 0 };
        stats.activeNow = activeNow;

        const recentTransactions = await Transaction.find({ referenceModel: 'ChatSession' })
            .populate('user', 'name')
            .sort('-createdAt')
            .limit(10);

        res.status(200).json({
            success: true,
            stats: stats,
            recentTransactions
        });
    } catch (err) {
        console.error('Admin Chat Stats Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
