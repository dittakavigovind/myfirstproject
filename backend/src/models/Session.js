const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    sessionType: {
        type: String,
        enum: ['chat', 'audio', 'video'],
        default: 'chat',
        required: true
    },
    callType: {
        type: String, 
        enum: ['private', 'public'], // Public typically for free broadcast audio
        default: 'private'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    astrologerId: {
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
        enum: ['initiated', 'active', 'completed', 'terminated', 'failed'],
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
    agoraChannelId: {
        type: String
    },
    agoraResourceId: {
        type: String // For Cloud Recording
    },
    agoraSid: {
        type: String // For Cloud Recording
    },
    recordingUrl: {
        type: String // To store final recording path
    },
    disconnectHistory: [{
        role: { type: String, enum: ['user', 'astrologer'] },
        disconnectedAt: Date,
        reconnectedAt: Date
    }]
}, { timestamps: true });

// Create indexes for efficient querying
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ astrologerId: 1, status: 1 });
sessionSchema.index({ sessionType: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
