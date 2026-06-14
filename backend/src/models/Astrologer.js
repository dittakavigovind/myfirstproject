const mongoose = require('mongoose');

const astrologerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    displayName: {
        type: String,
        required: true,
        unique: true, // Enforce unique public name
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    image: {
        type: String, // URL to image
        default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    },
    badgeText: {
        type: String,
        trim: true,
        default: ''
    },
    gallery: [{
        type: String // URLs for gallery images
    }],
    bio: String,
    skills: [{
        type: String, // e.g., 'Vedic', 'Tarot', 'Numerology'
    }],
    languages: [String],
    location: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    experienceYears: Number,
    charges: {
        chatPerMinute: Number,
        callPerMinute: Number,
        videoPerMinute: Number,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    followersCount: {
        type: Number,
        default: 0,
    },
    fakeFollowers: {
        type: Number,
        default: 0,
    },
    warningCount: {
        type: Number,
        default: 0,
    },
    violationDetails: {
        phone: { type: Number, default: 0 },
        email: { type: Number, default: 0 },
        abusive: { type: Number, default: 0 }
    },
    features: {
        chatEnabled: { type: Boolean, default: true },
        voiceEnabled: { type: Boolean, default: true },
        videoEnabled: { type: Boolean, default: true }
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    pinOrder: {
        type: Number,
        default: 0,
    },
    pinStartTime: Date,
    pinEndTime: Date,
    isTopChoice: {
        type: Boolean,
        default: false,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    isChatOnline: { type: Boolean, default: false },
    isVoiceOnline: { type: Boolean, default: false },
    isVideoOnline: { type: Boolean, default: false },
    lastOnlineAt: Date,
    totalEarnings: {
        type: Number,
        default: 0,
        select: false, // Private
    },
    walletBalance: { // Available for payout
        type: Number,
        default: 0,
        select: false
    },
    commissionRate: {
        type: Number,
        default: 20 // 20% platform fee by default
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBusy: {
        type: Boolean,
        default: false
    },
    statusBackup: {
        isChatOnline: { type: Boolean, default: false },
        isVoiceOnline: { type: Boolean, default: false },
        isVideoOnline: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('Astrologer', astrologerSchema);
