const express = require('express');
const router = express.Router();
const astrologerPayoutController = require('../controllers/astrologerPayoutController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('astrologer'), astrologerPayoutController.getMyPayouts);

module.exports = router;
