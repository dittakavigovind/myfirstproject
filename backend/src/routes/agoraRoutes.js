const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateAgoraToken } = require('../controllers/agoraController');
const { acquireRecordingResource, startRecording, stopRecording } = require('../controllers/agoraRecordingController');

router.post('/token', protect, generateAgoraToken);

router.post('/recording/acquire', protect, acquireRecordingResource);
router.post('/recording/start', protect, startRecording);
router.post('/recording/stop', protect, stopRecording);

module.exports = router;
