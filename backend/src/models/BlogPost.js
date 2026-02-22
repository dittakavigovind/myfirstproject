const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        lowercase: true,
        index: true
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    excerpt: {
        type: String,
        required: [true, 'Please add an excerpt']
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogCategory'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featuredImage: {
        type: String,
        default: '' // URL to image
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        focusKeyword: String,
        metaKeywords: String,
        canonicalUrl: String,
        // Open Graph
        ogTitle: String,
        ogDescription: String,
        ogImage: String
    },
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],
    views: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Populate category and author on find
blogPostSchema.pre(/^find/, function (next) {
    this.populate('categories', 'name slug').populate('author', 'name');
    next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
