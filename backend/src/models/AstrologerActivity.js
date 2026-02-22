const mongoose = require('mongoose');

const astrologerActivitySchema = new mongoose.Schema({
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['ONLINE', 'OFFLINE'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Optional: Duration of session if action is OFFLINE
    durationMinutes: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('AstrologerActivity', astrologerActivitySchema);
