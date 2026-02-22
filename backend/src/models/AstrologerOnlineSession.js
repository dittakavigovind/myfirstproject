const mongoose = require('mongoose');

const astrologerOnlineSessionSchema = new mongoose.Schema({
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        required: true,
        index: true
    },
    loginTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    logoutTime: {
        type: Date
    },
    totalOnlineMinutes: {
        type: Number,
        default: 0
    },
    sessionDate: {
        type: Date,
        required: true,
        index: true
        // stored as midnight timestamp for easy querying
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'auto_closed'],
        default: 'active'
    }
}, { timestamps: true });

// Index for finding active session quickly
astrologerOnlineSessionSchema.index({ astrologerId: 1, status: 1 });

module.exports = mongoose.model('AstrologerOnlineSession', astrologerOnlineSessionSchema);
