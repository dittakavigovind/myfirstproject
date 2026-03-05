const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, mobileNumber } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        let finalName = name;
        if (!finalName || finalName.trim() === '') {
            finalName = email.split('@')[0];
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification OTP (6 digits)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Create user
        const user = await User.create({
            name: finalName,
            email,
            password: hashedPassword,
            mobileNumber,
            authProvider: 'email',
            emailVerified: false,
            verificationToken,
            verificationTokenExpire,
        });

        if (user) {
            // Send verification email
            await emailService.sendVerificationEmail(user, verificationToken);

            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                id: user.id,
                email: user.email,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }


        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been disabled. Please contact support.' });
            }

            // Check if email is verified for email auth
            if (user.authProvider === 'email' && !user.emailVerified) {
                return res.status(401).json({
                    message: 'Email not verified. Please verify your email to login.',
                    emailNotVerified: true,
                    email: user.email
                });
            }
            // Update lastLogin
            user.lastLogin = new Date();
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
                walletBalance: user.walletBalance,
                birthDetails: user.birthDetails,
                profileImage: user.profileImage,
                isOnline: user.isOnline,
                lastLogin: user.lastLogin,
                totalOrders: user.totalOrders || 0,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get user data
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};

/**
 * @desc    Send OTP to Phone
 * @route   POST /api/auth/otp/send
 */
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        await otpService.sendOtp(phone);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

/**
 * @desc    Verify OTP and Login/Register
 * @route   POST /api/auth/otp/verify
 */
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

        const isValid = await otpService.verifyOtp(phone, otp);
        if (!isValid) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // OTP Verified -> Find or Create User
        // Normalize phone for lookups: Ensure it consistently has '+'
        const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

        let user = await User.findOne({ phone: normalizedPhone });

        if (!user) {
            // Create new incomplete user
            user = await User.create({
                phone: normalizedPhone,
                name: 'User', // Placeholder
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been disabled. Please contact support.' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            role: user.role,
            walletBalance: user.walletBalance,
            profileImage: user.profileImage,
            birthDetails: user.birthDetails,
            token: generateToken(user._id),
            isNewUser: user.name === 'User' // Flag to frontend
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
/**
 * @desc    Verify email OTP
 * @route   POST /api/auth/verify-email-otp
 * @access  Public
 */
exports.verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({
            email,
            verificationToken: otp,
            verificationTokenExpire: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been disabled. Please contact support.' });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            role: user.role,
            walletBalance: user.walletBalance,
            birthDetails: user.birthDetails,
            profileImage: user.profileImage,
            isOnline: user.isOnline,
            lastLogin: user.lastLogin,
            totalOrders: user.totalOrders || 0,
            token: generateToken(user._id),
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Verify email address (Legacy Link Route)
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate new 6-digit OTP
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.verificationToken = verificationToken;
        user.verificationTokenExpire = verificationTokenExpire;
        await user.save();

        await emailService.sendVerificationEmail(user, verificationToken);

        res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
