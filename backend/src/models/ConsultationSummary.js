const mongoose = require('mongoose');

const consultationSummarySchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
    sessionType: { type: String, enum: ['chat', 'audio', 'video'], required: true },
    primaryConcerns: [{ type: String }],
    recurringTopics: [{ type: String }],
    emotionalState: { type: String },
    frequentlyAskedQuestions: [{ type: String }],
    importantGuidance: { type: String },
    keyLifeAreas: [{ type: String }],
    overview: { type: String }
}, { timestamps: true });

// Ensure fast queries by astrologer and user
consultationSummarySchema.index({ userId: 1, astrologerId: 1, createdAt: -1 });

module.exports = mongoose.model('ConsultationSummary', consultationSummarySchema);
