const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    sendOtp,
    verifyOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Email Auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// OTP Auth (Legacy/Email)
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

// WhatsApp OTP (MSG91) - Merged from otpRoutes
const { sendWhatsappOtp, verifyWhatsappOtp } = require('../controllers/otpController');
router.post('/send-whatsapp-otp', sendWhatsappOtp);
router.post('/verify-whatsapp-otp', verifyWhatsappOtp);

module.exports = router;
