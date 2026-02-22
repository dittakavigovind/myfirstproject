const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    redirectUrl: {
        type: String,
        required: true
    },
    displayPages: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: false
    },
    showOncePerSession: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    impressions: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Popup', popupSchema);
