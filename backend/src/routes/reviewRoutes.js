const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.createReview);
router.get('/astrologer/:astrologerId', reviewController.getAstrologerReviews);
router.get('/me', protect, reviewController.getMyReviews);

module.exports = router;
