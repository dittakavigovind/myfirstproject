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
    grossAmount: { type: Number },
    tdsPercentage: { type: Number, default: 10 },
    tdsAmount: { type: Number, default: 0 },
    pgPercentage: { type: Number, default: 2.5 },
    pgAmount: { type: Number, default: 0 },
    netPayableAmount: { type: Number },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'on_hold', 'processing', 'completed', 'cancelled', 'requested', 'rejected'],
        default: 'pending',
        index: true
    },
    cycleStartDate: { type: Date },
    cycleEndDate: { type: Date },
    transactionId: String, // Bank reference or internal ref
    notes: String,
    adminRemarks: String,

    requestedAt: { type: Date, default: Date.now },
    processedAt: Date

}, { timestamps: true });

module.exports = mongoose.model('AstrologerPayout', astrologerPayoutSchema);
