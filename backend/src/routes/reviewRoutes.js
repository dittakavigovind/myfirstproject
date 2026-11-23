const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.createReview);
router.get('/astrologer/:astrologerId', reviewController.getAstrologerReviews);
router.get('/me', protect, reviewController.getMyReviews);

// Astrologer reply routes (Protected: only the respective astrologer can reply once and modify once)
router.post('/:id/reply', protect, reviewController.replyToReview);
router.put('/:id/reply', protect, reviewController.updateReviewReply);

// Admin Routes (Can be protected by an admin middleware if available, 
// but we'll use `protect` to ensure req.user exists)
router.post('/admin', protect, reviewController.addReviewAdmin);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
