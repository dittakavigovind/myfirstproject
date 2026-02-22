const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChats, getMessages, createChat } = require('../controllers/chatController');

router.get('/', protect, getChats);
router.get('/:chatId/messages', protect, getMessages);
router.post('/', protect, createChat);

module.exports = router;
