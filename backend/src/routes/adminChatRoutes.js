const express = require('express');
const router = express.Router();
const { getAllSessions, forceEndSession, exportChatLogs, getChatStats } = require('../controllers/adminChatController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllSessions);
router.get('/stats', protect, admin, getChatStats);
router.get('/:sessionId/export', protect, admin, exportChatLogs);
router.post('/:sessionId/force-end', protect, admin, forceEndSession);

module.exports = router;
