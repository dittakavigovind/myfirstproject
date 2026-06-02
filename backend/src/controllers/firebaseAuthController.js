const admin = require('../config/firebase');

exports.getCustomToken = async (req, res) => {
    try {
        if (!admin || admin.apps.length === 0) {
            return res.status(500).json({ success: false, message: 'Firebase Admin SDK not initialized on server' });
        }

        let uid = req.user.id.toString(); // Use the MongoDB ObjectId as Firebase UID
        let astrologerId = null;

        if (req.user.role === 'astrologer') {
            const Astrologer = require('../models/Astrologer');
            const astro = await Astrologer.findOne({ userId: req.user.id });
            if (astro) {
                astrologerId = astro._id.toString();
                // Optionally, we could use astrologerId as uid, or pass it in claims
                // It is safer to use the astrologerId as uid because the Chat session document uses astrologerId
                uid = astrologerId;
            }
        }
        
        // You can add additional claims if needed, like role
        const additionalClaims = {
            role: req.user.role,
            ...(astrologerId && { astrologerId })
        };

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);

        res.status(200).json({
            success: true,
            customToken
        });
    } catch (error) {
        console.error('Error creating custom token:', error);
        res.status(500).json({ success: false, message: 'Failed to generate Firebase token' });
    }
};
