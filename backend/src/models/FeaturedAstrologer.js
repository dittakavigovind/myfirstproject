const mongoose = require('mongoose');

const featuredAstrologerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // URL or base64
        required: true
    },
    mobileNumber: {
        type: String,
        required: false
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    showOnHoroscope: {
        type: Boolean,
        default: false
    },
    socialLinks: {
        instagram: String,
        facebook: String,
        website: String
    }
}, { timestamps: true });

// Ensure only one active at a time? Or just fetch the single document we will maintain?
// Requirement says "Featured Astrologer" (singular), so we might just use a single document approach or always fetch the most recent 'active' one.
// Simplest is to have a singleton-like behavior where we update "the" featured astrologer or finding the one marked active.
// Let's assume we maintain one record or just update the existing one.

module.exports = mongoose.model('FeaturedAstrologer', featuredAstrologerSchema);
