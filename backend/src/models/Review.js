const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Prevent multiple reviews from the same user for the same astrologer (optional, based on requirement)
// reviewSchema.index({ userId: 1, astrologerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
