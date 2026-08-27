const mongoose = require('mongoose');

const dailyBlessingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    greeting: {
        type: String,
        required: [true, 'Greeting is required'],
        trim: true
    },
    deityName: {
        type: String,
        required: [true, 'Deity Name is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    mantra: {
        type: String,
        trim: true
    },
    language: {
        type: String,
        default: 'English',
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'God/Goddess Image URL is required']
    },
    shareImageUrl: {
        type: String,
        required: [true, 'Share Image URL is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        index: true
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        index: true
    },
    priority: {
        type: Number,
        default: 0 // Higher number = higher priority
    },
    occasion: {
        type: String,
        trim: true
    },
    isSpecialOccasion: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Draft', 'Scheduled', 'Published'],
        default: 'Draft',
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create compound index for querying active blessing efficiently
dailyBlessingSchema.index({ status: 1, startDate: 1, endDate: 1, isSpecialOccasion: -1, priority: -1 });

module.exports = mongoose.model('DailyBlessing', dailyBlessingSchema);
