const express = require('express');
const router = express.Router();
const { trackInteraction, getKPIs, getUserMetrics, getAllUsersMetrics, getInteractionDetails, trackSiteVisit, getSiteVisits } = require('../controllers/analyticsController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');

// Public tracking (optional user)
router.post('/track', optionalProtect, trackInteraction);
router.post('/visit', trackSiteVisit);

// Dedicated Daily Blessing Tracking
router.post('/daily-blessing', async (req, res) => {
    try {
        const { action, blessingId } = req.body;
        // In a real scenario, this could be stored in a dedicated DailyBlessingAnalytics collection
        // For now we log it or map to existing interaction models
        console.log(`[Daily Blessing Analytics] Action: ${action}, Blessing: ${blessingId}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error tracking blessing:', error);
        res.status(500).json({ success: false });
    }
});

// Admin-only metrics
router.get('/kpis', protect, admin, getKPIs);
router.get('/user/:userId', protect, admin, getUserMetrics);
router.get('/users-summary', protect, admin, getAllUsersMetrics);
router.get('/details', protect, admin, getInteractionDetails);
router.get('/visits', protect, admin, getSiteVisits);

module.exports = router;
