const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    targetAudience: {
        type: String,
        enum: ['all', 'users', 'astrologers', 'specific'],
        default: 'all'
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    actionLink: {
        type: String, // Optional URL to redirect to when clicked
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // The Admin who sent it
        required: true
    },
    // For tracking which specific users have read this broadcast
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }],
    // Indicates if this was dispatched as a Push Notification (FCM) or just in-app
    isPushDispatched: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Basic indexing for faster queries
notificationSchema.index({ targetAudience: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
