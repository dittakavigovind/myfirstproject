const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    attemptCount: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// TTL Index: Automatically expire documents 5 minutes after 'updatedAt' 
// Actually we want to rely on 'expiresAt'. MongoDB TTL works on a Date field.
// Alternatively, we can set expireAfterSeconds on createdAt if we want fixed duration.
// Let's use expiresAt logic for query, and TTL for cleanup.
// Cleanup after 10 minutes to be safe/debug.
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
