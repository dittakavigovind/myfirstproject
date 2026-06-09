const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    lastUpdated: { type: Date, default: Date.now },
    overallSummary: { type: String, default: '' },
    themes: [{ type: String }], // e.g., marriage, career, finance
    frequentQuestions: [{ type: String }],
    importantGuidance: [{ type: String }],
    consultationCount: { type: Number, default: 0 },
    lastConsultationDate: { type: Date },
    conversationTips: {
        openingQuestions: [{ type: String }],
        followUpAreas: [{ type: String }],
        reminders: [{ type: String }]
    },
    translations: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('UserMemory', userMemorySchema);
