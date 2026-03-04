const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    astrologer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        required: true
    },
    pricePerMinute: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['initiated', 'active', 'completed', 'terminated'],
        default: 'initiated'
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    totalDuration: {
        type: Number, // in seconds
        default: 0
    },
    totalAmountDeducted: {
        type: Number,
        default: 0
    },
    disconnectHistory: [{
        role: { type: String, enum: ['user', 'astrologer'] },
        disconnectedAt: Date,
        reconnectedAt: Date
    }]
}, { timestamps: true });

// Create indexes for efficient querying
chatSessionSchema.index({ user: 1, status: 1 });
chatSessionSchema.index({ astrologer: 1, status: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
