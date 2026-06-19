const AstrologerPayout = require('../models/AstrologerPayout');
const Astrologer = require('../models/Astrologer');

exports.getMyPayouts = async (req, res) => {
    try {
        const userId = req.user._id;

        const astro = await Astrologer.findOne({ userId });
        if (!astro) {
            return res.status(404).json({ success: false, message: 'Astrologer profile not found.' });
        }

        const payouts = await AstrologerPayout.find({ astrologerId: astro._id })
            .sort({ createdAt: -1 })
            .limit(3);

        res.status(200).json({ success: true, count: payouts.length, data: payouts });
    } catch (error) {
        console.error('Error fetching astrologer payouts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
