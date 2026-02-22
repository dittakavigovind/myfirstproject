const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Astrologer Routes
router.post('/status/toggle', protect, activityController.toggleOnlineStatus);
router.get('/stats/dashboard', protect, activityController.getDashboardStats);

// Admin Routes
router.get('/reports/admin', protect, authorize('admin', 'manager'), activityController.getAdminActivityReport);

module.exports = router;
