const mongoose = require('mongoose');

const matchmakingPurchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coupleId: {
        type: String,
        required: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true,
        default: 99
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    }
}, { timestamps: true });

module.exports = mongoose.model('MatchmakingPurchase', matchmakingPurchaseSchema);
