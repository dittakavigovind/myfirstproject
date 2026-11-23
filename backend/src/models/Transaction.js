const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    gstAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number
    },
    bonusAmount: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    description: {
        type: String,
        required: true
    },
    paymentId: { // Razorpay/Stripe Payment ID
        type: String,
    },
    orderId: { // Razorpay/Stripe Order ID
        type: String,
    },
    paymentMethod: { // upi, card, netbanking, wallet, etc.
        type: String,
        default: null
    },
    referenceModel: {
        type: String,
        enum: ['Consultation', 'Report', 'ECommerce', 'Recharge', 'Session', 'WalletRecharge', 'AstrologerPayout'],
        default: 'Recharge'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
