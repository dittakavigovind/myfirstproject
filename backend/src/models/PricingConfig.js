const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema({
    configVersion: {
        type: Number,
        default: 1
    },
    globalRates: {
        audioPerMinute: { type: Number, default: 10 },
        videoPerMinute: { type: Number, default: 20 },
        globalPlatformFee: { type: Number, default: 40 } // % of total transaction taken by Admin
    },
    peakHours: {
        enabled: { type: Boolean, default: false },
        startTime: { type: String, default: "18:00" }, // 24H format string
        endTime: { type: String, default: "22:00" },
        multiplier: { type: Number, default: 1.5 } // 1.5x price during peak hours
    },
    astrologerOverrides: [{
        astrologer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Astrologer'
        },
        audioPerMinute: Number,
        videoPerMinute: Number,
        chatPerMinute: Number
    }],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin user
    }
}, { timestamps: true });

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
