const express = require('express');
const router = express.Router();
const { trackInteraction, getKPIs, getUserMetrics, getAllUsersMetrics, getInteractionDetails } = require('../controllers/analyticsController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');

// Public tracking (optional user)
router.post('/track', optionalProtect, trackInteraction);

// Admin-only metrics
router.get('/kpis', protect, admin, getKPIs);
router.get('/user/:userId', protect, admin, getUserMetrics);
router.get('/users-summary', protect, admin, getAllUsersMetrics);
router.get('/details', protect, admin, getInteractionDetails);

module.exports = router;
