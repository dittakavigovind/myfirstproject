const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Filename is required']
    },
    originalName: {
        type: String
    },
    url: {
        type: String,
        required: [true, 'URL is required']
    },
    size: {
        type: Number
    },
    mimetype: {
        type: String
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);
