const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, toggleStatus, getRecentActivity, saveFCMToken, removeFCMToken, toggleFollow, getFollowing, incrementWarning } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/status', protect, toggleStatus);
router.get('/activity', protect, getRecentActivity);
router.put('/fcm-token', protect, saveFCMToken);
router.delete('/fcm-token', protect, removeFCMToken);
router.post('/follow/:astrologerId', protect, toggleFollow);
router.get('/following', protect, getFollowing);
router.post('/warning', protect, incrementWarning);

module.exports = router;
