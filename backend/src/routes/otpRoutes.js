const express = require('express');
const router = express.Router();
const { sendWhatsappOtp, verifyWhatsappOtp } = require('../controllers/otpController');

router.post('/send-whatsapp-otp', sendWhatsappOtp);
router.post('/verify-whatsapp-otp', verifyWhatsappOtp);

module.exports = router;
