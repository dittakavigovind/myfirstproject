const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const earningsController = require('../controllers/earningsController');

// All routes protected and for Astrologers only
router.use(protect);
router.use(authorize('astrologer'));

router.get('/analytics', earningsController.getAnalytics);
router.get('/sessions', earningsController.getSessions);
router.post('/payout', earningsController.requestPayout);

module.exports = router;
