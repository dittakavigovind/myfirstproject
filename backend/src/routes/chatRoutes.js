const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChats, getMessages, createChat, startPaidChat, getSessionMessages, getAstrologerSessions, getActiveSession } = require('../controllers/chatController');

router.get('/', protect, getChats);
router.get('/session/:roomId/messages', protect, getSessionMessages);
router.get('/astrologer/sessions', protect, getAstrologerSessions);
router.get('/active-session', protect, getActiveSession);
router.get('/:chatId/messages', protect, getMessages);
router.post('/', protect, createChat);
router.post('/start-paid', protect, startPaidChat);

module.exports = router;
