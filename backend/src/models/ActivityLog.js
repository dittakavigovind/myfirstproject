const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ['KUNDLI', 'MATCHMAKING', 'DOSHA', 'HOROSCOPE', 'PANCHANG', 'VARGA', 'CALC', 'ASHTAKAVARGA']
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        default: {} // specific details like 'Partner Name' or 'City'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
