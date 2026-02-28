const mongoose = require('mongoose');

const templeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a temple name'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    images: [{
        type: String
    }],
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    sevas: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        originalPrice: {
            type: Number
        },
        description: {
            type: String
        },
        image: {
            type: String
        },
        dateSelectionType: {
            type: String,
            enum: ['Fixed', 'Range', 'Any'],
            default: 'Any'
        },
        fixedDate: {
            type: Date
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Pre-save hook to create slug from name if not provided
templeSchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '') // Remove non-word characters except spaces
            .replace(/ +/g, '-')     // Replace spaces with hyphens
            .replace(/^-+|-+$/g, ''); // Trim hyphens
    }
    next();
});

module.exports = mongoose.model('Temple', templeSchema);
