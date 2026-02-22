const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const otpService = require('../services/otpService');

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
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                token: generateToken(user._id),
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
        console.log(`[LOGIN ATTEMPT] Email: ${email}, Password Provided: ${password ? 'Yes' : 'No'}`);

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log(`[LOGIN] User found: ${user.email}, Role: ${user.role}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN] Password Match: ${isMatch}`);

        if (isMatch) {
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
            console.log(`[LOGIN FAILED] Password mismatch for ${email}`);
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
