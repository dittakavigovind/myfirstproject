const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserRole, getAstrologerActivity, getDashboardStats, deleteUser, exportUsersCSV, toggleUserBlock, updateAstrologerSettings, getAllSessions, bypassWaitlist } = require('../controllers/adminController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const { getAppConfig, updateAppConfig, getPricingConfig, updatePricingConfig } = require('../controllers/adminConfigController');

// Middleware to ensure admin
// Assuming 'protect' adds user to req, and we need an 'admin' middleware to check role.
// If 'admin' middleware doesn't exist, I'll restrict it here or create it.
// Let's assume protect is enough for now but check role in controller or add middleware.
// I will create a simple inline middleware or update authMiddleware later if needed.
// For now, I'll use a check inside the route or assume 'admin' function exists in authMiddleware. 
// I'll check authMiddleware file next. For now I'll define routes.

router.get('/users/export', protect, admin, exportUsersCSV);
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/users/:id', protect, admin, getUserById);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/toggle-block', protect, admin, toggleUserBlock);
router.put('/astrologers/:id/settings', protect, admin, authorize('super_admin', 'support_admin', 'admin', 'manager'), updateAstrologerSettings);
router.delete('/users/:id', protect, admin, authorize('super_admin', 'admin'), deleteUser);
router.get('/activity', protect, admin, getAstrologerActivity);
router.get('/sessions', protect, admin, getAllSessions);
router.post('/queue/bypass', protect, admin, authorize('super_admin', 'support_admin', 'manager', 'admin'), bypassWaitlist);

// Configurations
router.get('/config/app', protect, admin, getAppConfig);
router.put('/config/app', protect, admin, updateAppConfig);

router.get('/config/pricing', protect, admin, getPricingConfig);
router.put('/config/pricing', protect, admin, updatePricingConfig);

module.exports = router;
