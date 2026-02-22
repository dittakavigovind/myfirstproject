const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, toggleStatus, getRecentActivity } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/status', protect, toggleStatus);
router.get('/activity', protect, getRecentActivity);

module.exports = router;
