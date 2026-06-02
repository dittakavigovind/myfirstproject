const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, toggleStatus, getRecentActivity, saveFCMToken, toggleFollow, getFollowing } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/status', protect, toggleStatus);
router.get('/activity', protect, getRecentActivity);
router.put('/fcm-token', protect, saveFCMToken);
router.post('/follow/:astrologerId', protect, toggleFollow);
router.get('/following', protect, getFollowing);

module.exports = router;
