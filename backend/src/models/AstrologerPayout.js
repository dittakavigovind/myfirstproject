const mongoose = require('mongoose');

const astrologerPayoutSchema = new mongoose.Schema({
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Astrologer',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['requested', 'processing', 'completed', 'rejected'],
        default: 'requested',
        index: true
    },
    transactionId: String, // Bank reference or internal ref
    notes: String,

    requestedAt: { type: Date, default: Date.now },
    processedAt: Date

}, { timestamps: true });

module.exports = mongoose.model('AstrologerPayout', astrologerPayoutSchema);
