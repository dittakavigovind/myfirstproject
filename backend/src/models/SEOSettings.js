const mongoose = require('mongoose');

const seoSettingsSchema = new mongoose.Schema({
    pageSlug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    metaTitle: {
        type: String,
        required: true,
        trim: true
    },
    metaDescription: {
        type: String,
        required: true,
        trim: true
    },
    metaKeywords: {
        type: [String], // Array of strings
        default: []
    },
    metaAuthor: {
        type: String,
        default: 'Way2Astro'
    },
    canonicalUrl: {
        type: String,
        trim: true
    },
    // Open Graph
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    ogType: {
        type: String,
        default: 'website'
    },
    // Twitter Card
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    twitterCard: {
        type: String,
        default: 'summary_large_image'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('SEOSettings', seoSettingsSchema);
