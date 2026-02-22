const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateAgoraToken } = require('../controllers/agoraController');

router.post('/token', protect, generateAgoraToken);

module.exports = router;
