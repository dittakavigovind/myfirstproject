const mongoose = require('mongoose');

const astrologerDailyStatSchema = new mongoose.Schema({
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        required: true,
        index: true
    },
    date: {
        type: Date, // usage: set to midnight of the day
        required: true,
        index: true
    },

    // Activity
    totalSessions: { type: Number, default: 0 },
    totalDurationMinutes: { type: Number, default: 0 },

    // Activity Breakdown
    onlineDurationMinutes: { type: Number, default: 0 }, // Total time "Online"
    onlineDurationSeconds: { type: Number, default: 0 }, // Precise "Online" time
    totalVoiceMinutes: { type: Number, default: 0 },
    totalVideoMinutes: { type: Number, default: 0 },
    totalChatMinutes: { type: Number, default: 0 },

    totalCallsCount: { type: Number, default: 0 },
    totalChatCount: { type: Number, default: 0 },

    // Performance
    successfulSessions: { type: Number, default: 0 },
    missedSessions: { type: Number, default: 0 },
    rejectedSessions: { type: Number, default: 0 },

    // Financials
    totalGrossRevenue: { type: Number, default: 0 },
    totalNetEarnings: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 },

    // Quality
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 } // Weighted average for the day

}, { timestamps: true });

// Create compound index for easy lookup
astrologerDailyStatSchema.index({ astrologerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AstrologerDailyStat', astrologerDailyStatSchema);
