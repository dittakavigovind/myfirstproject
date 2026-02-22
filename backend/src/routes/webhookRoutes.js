const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Public route (Agora calls this)
// Ensure you set up Agora Console to hit this URL
router.post('/agora', webhookController.handleAgoraWebhook);

module.exports = router;
