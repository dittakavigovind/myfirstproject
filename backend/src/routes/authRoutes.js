const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    sendOtp,
    verifyOtp,
    verifyEmail,
    resendVerification
} = require('../controllers/authController');
const passport = require('../config/passport');
const { protect } = require('../middleware/authMiddleware');

// Email Auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    // Generate token and redirect to frontend
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Pass user info and token via URL (will be handled by frontend)
    const userJson = encodeURIComponent(JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profileImage,
        gender: req.user.gender,
        birthDetails: req.user.birthDetails,
        token
    }));

    res.redirect(`${frontendUrl}/login/?googleAuth=success&userData=${userJson}`);
});

// OTP Auth (Legacy/Email)
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

// WhatsApp OTP (MSG91) - Merged from otpRoutes
const { sendWhatsappOtp, verifyWhatsappOtp } = require('../controllers/otpController');
router.post('/send-whatsapp-otp', sendWhatsappOtp);
router.post('/verify-whatsapp-otp', verifyWhatsappOtp);

module.exports = router;
