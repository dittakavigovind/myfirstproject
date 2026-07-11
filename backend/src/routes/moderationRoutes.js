const express = require('express');
const router = express.Router();
const { submitReport, blockUser, getBlockedUsers, unblockUser } = require('../controllers/moderationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/report', protect, submitReport);
router.post('/block', protect, blockUser);
router.post('/unblock', protect, unblockUser);
router.get('/blocks', protect, getBlockedUsers);

module.exports = router;
