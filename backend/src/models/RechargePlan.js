const mongoose = require('mongoose');

const rechargePlanSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    bonus: {
        type: Number,
        default: 0
    },
    label: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: ''
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('RechargePlan', rechargePlanSchema);
