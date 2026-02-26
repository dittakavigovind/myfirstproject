const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    logoDesktop: {
        type: String,
        trim: true,
        default: '/logo.svg' // Default fallback
    },
    logoMobile: {
        type: String,
        trim: true,
        default: '/logo.svg' // Default fallback
    },
    logoReport: {
        type: String,
        trim: true,
        default: '/logo.svg' // Default fallback for professional reports
    },
    favicon: {
        type: String,
        trim: true,
        default: '/favicon.ico'
    },
    promotionImage: {
        type: String,
        trim: true,
        default: ''
    },
    promotionUrl: {
        type: String,
        trim: true,
        default: ''
    },
    promotionType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    promotionVideoUrl: {
        type: String,
        trim: true,
        default: ''
    },
    googleAdsId: {
        type: String,
        trim: true,
        default: ''
    },
    googleAnalyticsId: {
        type: String,
        trim: true,
        default: ''
    },
    featureFlags: {
        enableChat: {
            type: Boolean,
            default: true
        },
        enableCall: {
            type: Boolean,
            default: true
        },
        enableTopAstrologers: {
            type: Boolean,
            default: true
        }
    },
    themeColors: {
        primary: { type: String, default: '#1e1b4b' }, // astro-navy
        secondary: { type: String, default: '#fbbf24' }, // astro-yellow
        accent: { type: String, default: '#3b82f6' }    // blue-500
    },
    useCustomColors: {
        type: Boolean,
        default: false
    },
    customColors: {
        primary: { type: String, default: '#1e1b4b' },
        secondary: { type: String, default: '#fbbf24' },
        accent: { type: String, default: '#3b82f6' }
    },
    navBadges: [{
        path: { type: String, trim: true },
        text: { type: String, default: 'New' },
        color: { type: String, default: '#ef4444' }, // red-500
        textColor: { type: String, default: '#ffffff' },
        enabled: { type: Boolean, default: true }
    }],
    exploreServices: [{
        id: { type: String, trim: true },
        title: { type: String, trim: true },
        desc: { type: String, trim: true },
        icon: { type: String, trim: true }, // lucide icon name
        color: { type: String, trim: true },
        href: { type: String, trim: true },
        enabled: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
    }],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Ensure only one document exists - we can enforce this in controller, 
// but singleton pattern logic is usually handled in application layer.
module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
