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
    referenceModel: {
        type: String,
        enum: ['Consultation', 'Report', 'ECommerce', 'Recharge'],
        default: 'Recharge'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
