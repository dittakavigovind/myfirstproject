const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChats, getMessages, createChat, startPaidChat, getSessionMessages, getSessions, getActiveSession, endAllSessions, endSessionApi, getHistory, getAdminAstrologerSessions, deleteOldChatData, declineSession } = require('../controllers/chatController');

router.get('/', protect, getChats);
router.get('/history', protect, getHistory);
router.get('/session/:roomId/messages', protect, getSessionMessages);
router.get('/astrologer/sessions', protect, getSessions);
router.get('/active-session', protect, getActiveSession);
router.post('/end-all-sessions', protect, endAllSessions);
router.post('/session/:roomId/end', protect, endSessionApi);
router.post('/session/:roomId/decline', protect, declineSession);
router.get('/:chatId/messages', protect, getMessages);
router.post('/', protect, createChat);
router.post('/start-paid', protect, startPaidChat);

// Admin Routes
router.get('/admin/astrologer/:astrologerId/sessions', protect, getAdminAstrologerSessions);
router.delete('/admin/delete-old', protect, deleteOldChatData);

module.exports = router;
