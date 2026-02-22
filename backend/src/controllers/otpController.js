const OtpVerification = require('../models/OtpVerification');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.sendWhatsappOtp = async (req, res) => {
    try {
        const { mobile_number } = req.body;

        if (!mobile_number) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        // 1. Rate Limiting Check (Simple 5 req/hour per number)
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const count = await OtpVerification.countDocuments({
            mobileNumber: mobile_number,
            createdAt: { $gte: hourAgo }
        });

        if (count >= 5) {
            return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Hash OTP
        const salt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, salt);

        // 4. Store in DB
        await OtpVerification.create({
            mobileNumber: mobile_number,
            otpHash: otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        // 4b. Hardcoded OTP for Testing (9948505111, 9491537320, 9849097924)
        const purePhone = mobile_number.replace(/\+/g, '').trim();
        const testNumbers = ['919948505111', '919491537320', '919849097924'];

        if (testNumbers.includes(purePhone)) {
            console.log(`Test number ${purePhone} detected. Skipping MSG91 API. Use OTP: 123456`);
            return res.status(200).json({ success: true, message: 'Test OTP generated (123456)' });
        }

        // 5. Send via MSG91 WhatsApp API
        const msg91AuthKey = process.env.MSG91_AUTH_KEY;
        const templateId = process.env.MSG91_WHATSAPP_TEMPLATE_ID;
        const senderId = process.env.MSG91_SENDER_ID;

        // Construct Payload for MSG91 WhatsApp (Based on user's known working structure)
        const whatsappPayload = {
            integrated_number: senderId,
            content_type: "template",
            payload: {
                messaging_product: "whatsapp",
                to: mobile_number.replace('+', ''),
                type: "template",
                template: {
                    name: templateId,
                    language: {
                        code: "en",
                        policy: "deterministic"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: otp
                                }
                            ]
                        },
                        {
                            type: "button",
                            sub_type: "url",
                            index: "0",
                            parameters: [
                                {
                                    type: "text",
                                    text: otp
                                }
                            ]
                        }
                    ]
                }
            }
        };

        console.log('MSG91 Payload:', JSON.stringify(whatsappPayload, null, 2));

        const response = await axios.post(
            'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
            whatsappPayload,
            { headers: { authkey: msg91AuthKey, 'Content-Type': 'application/json' } }
        );

        console.log('MSG91 Response:', response.data);

        res.status(200).json({ success: true, message: 'OTP sent via WhatsApp' });

    } catch (error) {
        console.error('Send OTP Error Detailed:', {
            error: error.response?.data || error.message,
            status: error.response?.status,
            config: error.config?.data
        });
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.response?.data?.message || error.message });
    }
};

exports.verifyWhatsappOtp = async (req, res) => {
    try {
        const { mobile_number, otp } = req.body;

        if (!mobile_number || !otp) {
            return res.status(400).json({ success: false, message: 'Mobile number and OTP required' });
        }

        // 1. Find latest valid OTP record
        const purePhone = mobile_number.replace(/\+/g, '').trim();
        const testNumbers = ['919948505111', '919491537320', '919849097924'];
        const isTestNumber = testNumbers.includes(purePhone) && otp === '123456';

        let record = null;
        if (!isTestNumber) {
            record = await OtpVerification.findOne({
                mobileNumber: mobile_number,
                expiresAt: { $gt: new Date() },
                isVerified: false
            }).sort({ createdAt: -1 });

            if (!record) {
                return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
            }

            // 2. Check Attempts
            if (record.attemptCount >= 3) {
                return res.status(400).json({ success: false, message: 'Too many failed attempts. Request a new OTP.' });
            }

            // 3. Verify Hash
            const isMatch = await bcrypt.compare(otp, record.otpHash);

            if (!isMatch) {
                record.attemptCount += 1;
                await record.save();
                return res.status(400).json({ success: false, message: 'Incorrect OTP' });
            }

            // 4. Success - Mark Verified
            record.isVerified = true;
            await record.save();
        }

        // 5. Auth Logic (Find or Create User)
        const phoneVariants = [`+${purePhone}`, purePhone];

        let user = await User.findOne({ phone: { $in: phoneVariants } });

        if (!user) {
            user = await User.create({
                phone: `+${purePhone}`, // Store in E.164 format
                name: 'User',
            });
        } else {
            // Ensure phone is normalized to + format if it wasn't
            if (!user.phone.startsWith('+')) {
                user.phone = `+${purePhone}`;
            }
            // Ensure name isn't 'New User' from old controller logic
            if (user.name === 'New User') {
                user.name = 'User';
            }
        }

        user.lastLogin = new Date();
        await user.save();

        // Check if profile is complete (Mandatory: name, gender, dob)
        // Note: New users are created with name 'User' by default
        const isProfileComplete =
            user.name &&
            user.name !== 'User' &&
            user.gender &&
            user.birthDetails &&
            user.birthDetails.date;

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            gender: user.gender,
            role: user.role,
            walletBalance: user.walletBalance,
            profileImage: user.profileImage,
            birthDetails: user.birthDetails,
            lastLogin: user.lastLogin,
            token: generateToken(user._id),
            needsProfileSetup: !isProfileComplete
        });

    } catch (error) {
        console.error('Verify OTP Error Detailed:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
};
