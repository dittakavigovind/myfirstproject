const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, { _id: false });

const pageContentSchema = new mongoose.Schema({
    pageSlug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    keywords: {
        type: String, // Stored as comma-separated string
        default: ''
    },
    faqs: [faqSchema]
}, { timestamps: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
