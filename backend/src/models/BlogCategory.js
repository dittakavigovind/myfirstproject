const mongoose = require('mongoose');

const blogCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
