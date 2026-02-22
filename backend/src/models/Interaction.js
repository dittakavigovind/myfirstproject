const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    guestId: {
        type: String, // For anonymous tracking if needed
        index: true
    },
    type: {
        type: String,
        enum: ['VIEW', 'CLICK', 'SHARE'],
        required: true,
        index: true
    },
    cardType: {
        type: String,
        enum: ['PANCHANG', 'CALENDAR', 'SHARE_BUTTON'],
        required: true,
        index: true
    },
    action: {
        type: String, // 'whatsapp', 'download', 'copy_link', etc.
        index: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient KPI calculations
interactionSchema.index({ cardType: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
