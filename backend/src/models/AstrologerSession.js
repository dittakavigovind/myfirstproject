const mongoose = require('mongoose');

const astrologerSessionSchema = new mongoose.Schema({
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        required: true
    },
    sessionDate: {
        type: String, // Format: DD/MM/YYYY
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // In seconds
        default: 0
    },
    servicesUsed: {
        type: [String], // ['chat', 'voice', 'video']
        default: []
    },
    chatRate: { type: Number, default: 0 },
    voiceRate: { type: Number, default: 0 },
    videoRate: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for efficient lookup of an astrologer's open session
astrologerSessionSchema.index({ astrologerId: 1, endTime: 1 });

module.exports = mongoose.model('AstrologerSession', astrologerSessionSchema);
