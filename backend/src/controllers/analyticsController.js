const Interaction = require('../models/Interaction');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.trackInteraction = async (req, res) => {
    try {
        const { type, cardType, action, metadata, guestId } = req.body;
        const userId = req.user ? req.user.id : null;

        const interaction = new Interaction({
            userId,
            guestId,
            type,
            cardType,
            action,
            metadata: metadata || {}
        });

        await interaction.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Analytics Tracking Error:', error);
        res.status(500).json({ success: false, message: 'Failed to log interaction' });
    }
};

exports.getKPIs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};

        if (startDate && endDate) {
            filter.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Interaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { cardType: "$cardType", type: "$type" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Trends (Daily)
        const trends = await Interaction.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        type: "$type"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats,
            trends
        });
    } catch (error) {
        console.error('Get KPIs Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};

exports.getUserMetrics = async (req, res) => {
    try {
        const { userId } = req.params;

        const metrics = await Interaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { cardType: "$cardType", type: "$type" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            metrics
        });
    } catch (error) {
        console.error('Get User Metrics Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user metrics' });
    }
};

exports.getAllUsersMetrics = async (req, res) => {
    try {
        const metrics = await Interaction.aggregate([
            { $match: { userId: { $ne: null } } },
            {
                $group: {
                    _id: { userId: "$userId", cardType: "$cardType", type: "$type" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            metrics
        });
    } catch (error) {
        console.error('Get All Users Metrics Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users metrics' });
    }
};
exports.getInteractionDetails = async (req, res) => {
    try {
        const { cardType, type, startDate, endDate, action } = req.query;
        if (!cardType || !type) {
            return res.status(400).json({ success: false, message: 'cardType and type are required' });
        }

        const match = { cardType, type };
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            match.timestamp = {
                $gte: new Date(startDate),
                $lte: end
            };
        }
        if (action && action !== 'all') {
            match.action = action;
        }

        const details = await Interaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        guestId: "$guestId",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                    },
                    count: { $sum: 1 },
                    actions: { $addToSet: "$action" },
                    lastInteraction: { $max: "$timestamp" }
                }
            },
            { $sort: { lastInteraction: -1 } },
            { $limit: 100 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: { $arrayElemAt: ["$user", 0] },
                    guestId: "$_id.guestId",
                    date: "$_id.date",
                    count: "$count",
                    actions: "$actions",
                    lastInteraction: "$lastInteraction"
                }
            },
            {
                $project: {
                    "userId.password": 0,
                    "userId.token": 0,
                    "userId.__v": 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            details
        });
    } catch (error) {
        console.error('Get Interaction Details Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch interaction details' });
    }
};
