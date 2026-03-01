const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please provide a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        default: 'PERCENTAGE',
        required: true
    },
    discountValue: {
        type: Number,
        required: [true, 'Please provide a discount value']
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null // Useful for PERCENTAGE discount to cap it
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: [true, 'Please provide an expiry date']
    },
    usageLimit: {
        type: Number,
        default: 100 // Default max overall uses
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    temple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple', // Optional Temple Reference
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
