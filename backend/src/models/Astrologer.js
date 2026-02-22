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
    gallery: [{
        type: String // URLs for gallery images
    }],
    bio: String,
    skills: [{
        type: String, // e.g., 'Vedic', 'Tarot', 'Numerology'
    }],
    languages: [String],
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Astrologer', astrologerSchema);
