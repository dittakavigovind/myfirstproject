const mongoose = require('mongoose');

const astrologerEventSchema = new mongoose.Schema({
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        index: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AstrologerSession',
        index: true
    },
    eventType: {
        type: String,
        enum: [
            'call_started',
            'call_ended',
            'astro_joined',
            'astro_left',
            'user_joined',
            'user_left',
            'wallet_deduction',
            'astro_online',
            'astro_offline',
            'payout_requested'
        ],
        required: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    clientIp: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('AstrologerEvent', astrologerEventSchema);
