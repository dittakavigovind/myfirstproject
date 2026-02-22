const AnalyticsService = require('../services/AnalyticsService');
const AstrologerSession = require('../models/AstrologerSession');
const AstrologerPayout = require('../models/AstrologerPayout');
const Astrologer = require('../models/Astrologer');

/**
 * Get Analytics for Dashboard
 * GET /api/astro/earnings/analytics
 */
exports.getAnalytics = async (req, res) => {
    try {
        const astroId = req.user.id; // User ID from token
        // We need to resolve Astrologer ID from User ID
        const astro = await Astrologer.findOne({ userId: astroId });
        if (!astro) return res.status(404).json({ msg: 'Astrologer not found' });

        if (!astro) return res.status(404).json({ msg: 'Astrologer not found' });



        const { range } = req.query; // 'today', 'week', 'month', 'all'

        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        if (range === 'week') startDate.setDate(startDate.getDate() - 7);
        else if (range === 'month') startDate.setDate(startDate.getDate() - 30);
        else if (range === 'all') startDate = new Date('2024-01-01'); // Beginning of platform

        const stats = await AnalyticsService.getAstrologerStats(astro._id, startDate, new Date());




        // Also fetch Wallet Balance
        const currentWallet = await Astrologer.findById(astro._id).select('+walletBalance');

        res.json({
            success: true,
            data: {
                ...stats,
                walletBalance: currentWallet.walletBalance || 0
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).send('Server Error');
    }
};

/**
 * Get Session History
 * GET /api/astro/earnings/sessions
 */
exports.getSessions = async (req, res) => {
    try {
        const astroId = req.user.id;
        const astro = await Astrologer.findOne({ userId: astroId });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const sessions = await AstrologerSession.find({ astrologerId: astro._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'name profileImage'); // Show user name

        const total = await AstrologerSession.countDocuments({ astrologerId: astro._id });

        res.json({
            success: true,
            data: sessions,
            pagination: { page, limit, total }
        });
    } catch (error) {
        console.error('Session History Error:', error);
        res.status(500).send('Server Error');
    }
};

/**
 * Request Payout
 * POST /api/astro/earnings/payout
 */
exports.requestPayout = async (req, res) => {
    try {
        const { amount } = req.body;
        const astroId = req.user.id;
        const astro = await Astrologer.findOne({ userId: astroId }).select('+walletBalance');

        if (amount <= 0) return res.status(400).json({ msg: 'Invalid amount' });
        if (astro.walletBalance < amount) return res.status(400).json({ msg: 'Insufficient balance' });

        // Atomic Payout Request
        const session = await Astrologer.startSession();
        session.startTransaction();

        try {
            astro.walletBalance -= amount;
            await astro.save({ session });

            const payout = await AstrologerPayout.create([{
                astrologerId: astro._id,
                amount,
                status: 'requested'
            }], { session });

            await session.commitTransaction();
            res.json({ success: true, data: payout[0] });

        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Payout Request Error:', error);
        res.status(500).send('Server Error');
    }
};
