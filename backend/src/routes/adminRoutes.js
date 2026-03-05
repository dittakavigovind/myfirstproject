const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserRole, getAstrologerActivity, getDashboardStats, deleteUser, exportUsersCSV, toggleUserBlock } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

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
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/activity', protect, admin, getAstrologerActivity);

module.exports = router;
