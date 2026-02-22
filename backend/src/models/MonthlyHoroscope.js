const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    overview: { type: String, default: '' },
    career: { type: String, default: '' },
    love: { type: String, default: '' },
    health: { type: String, default: '' }
}, { _id: false, strict: false });

const monthlyHoroscopeSchema = new mongoose.Schema({
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
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

// Ensure unique month/year combination
monthlyHoroscopeSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyHoroscope', monthlyHoroscopeSchema);
