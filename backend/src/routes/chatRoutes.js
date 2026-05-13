const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChats, getMessages, createChat, startPaidChat, getSessionMessages, getSessions, getActiveSession, endAllSessions, getHistory } = require('../controllers/chatController');

router.get('/', protect, getChats);
router.get('/history', protect, getHistory);
router.get('/session/:roomId/messages', protect, getSessionMessages);
router.get('/astrologer/sessions', protect, getSessions);
router.get('/active-session', protect, getActiveSession);
router.post('/end-all-sessions', protect, endAllSessions);
router.get('/:chatId/messages', protect, getMessages);
router.post('/', protect, createChat);
router.post('/start-paid', protect, startPaidChat);

module.exports = router;
