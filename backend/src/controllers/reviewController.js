const Review = require('../models/Review');
const Astrologer = require('../models/Astrologer');

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { astrologerId, rating, comment, isAnonymous } = req.body;
        const userId = req.user.id;

        // Check if user has already reviewed this astrologer (optional)
        // const existingReview = await Review.findOne({ userId, astrologerId });
        // if (existingReview) return res.status(400).json({ success: false, message: 'You have already reviewed this astrologer' });

        const review = new Review({
            userId,
            astrologerId,
            rating,
            comment,
            isAnonymous
        });

        await review.save();

        // Update Astrologer's average rating and review count
        const astrologer = await Astrologer.findById(astrologerId);
        if (astrologer) {
            const allReviews = await Review.find({ astrologerId });
            const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
            astrologer.rating = totalRating / allReviews.length;
            astrologer.reviewCount = allReviews.length;
            await astrologer.save();
        }

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get reviews for an astrologer
exports.getAstrologerReviews = async (req, res) => {
    try {
        const { astrologerId } = req.params;
        const reviews = await Review.find({ astrologerId, isPublished: true })
            .populate('userId', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get current astrologer's reviews
exports.getMyReviews = async (req, res) => {
    try {
        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer) return res.status(404).json({ success: false, message: 'Astrologer profile not found' });

        const reviews = await Review.find({ astrologerId: astrologer._id, isPublished: true })
            .populate('userId', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
