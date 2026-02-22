const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    prediction: { type: String, default: '' },
    advice: { type: String, default: '' },
    luck: { type: String, default: '' },
    energy: { type: String, default: '' }
}, { _id: false, strict: false });

const weeklyHoroscopeSchema = new mongoose.Schema({
    weekStartDate: {
        type: Date,
        required: true
    },
    weekEndDate: {
        type: Date,
        required: true
    },
    title: { type: String, required: true },
    signs: {
        aries: { type: signSchema, default: () => ({}) },
        taurus: { type: signSchema, default: () => ({}) },
        gemini: { type: signSchema, default: () => ({}) },
        cancer: { type: signSchema, default: () => ({}) },
        leo: { type: signSchema, default: () => ({}) },
        virgo: { type: signSchema, default: () => ({}) },
        libra: { type: signSchema, default: () => ({}) },
        scorpio: { type: signSchema, default: () => ({}) },
        sagittarius: { type: signSchema, default: () => ({}) },
        capricorn: { type: signSchema, default: () => ({}) },
        aquarius: { type: signSchema, default: () => ({}) },
        pisces: { type: signSchema, default: () => ({}) }
    }
}, { timestamps: true });

// Ensure unique week range
weeklyHoroscopeSchema.index({ weekStartDate: 1, weekEndDate: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyHoroscope', weeklyHoroscopeSchema);
