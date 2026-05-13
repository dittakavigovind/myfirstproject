const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
    configVersion: {
        type: Number,
        default: 1
    },
    maintenanceMode: {
        enabled: { type: Boolean, default: false },
        message: { type: String, default: "App is currently under maintenance. Please try again later." }
    },
    features: {
        chatEnabled: { type: Boolean, default: true },
        voiceEnabled: { type: Boolean, default: true },
        videoEnabled: { type: Boolean, default: true }
    },
    disableNewSignups: { type: Boolean, default: false },
    forceUpdate: { type: Boolean, default: false },
    banners: [{
        imageUrl: String,
        targetUrl: String,
        isActive: { type: Boolean, default: true }
    }],
    minimumWalletBalance: {
        type: Number,
        default: 50 // Minimum to start any session
    },
    lowBalanceThreshold: {
        type: Number,
        default: 100 // Show warning below this
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin user who last updated
    }
}, { timestamps: true });

module.exports = mongoose.model('AppConfig', appConfigSchema);
