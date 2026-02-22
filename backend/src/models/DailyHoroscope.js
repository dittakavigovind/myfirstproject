const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    prediction: { type: String, default: '' },
    luckyColor: { type: String, default: '' },
    luckyNumber: { type: String, default: '' },
    cosmicVibe: { type: Number, default: 3, min: 1, max: 5 }
}, { _id: false, strict: false });

const dailyHoroscopeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    title: { type: String, required: true },
    signs: {
        type: Map,
        of: signSchema,
        default: {}
    }
}, { timestamps: true });

// Using a slightly flexible structure with 'signs' as an object containing keys for each sign
// Since we want to enforce specific keys (aries, etc) we could usually do explicit paths,
// but to ensure we don't have validation issues with 'required' on nested paths, 
// explicit paths with default values are safer. 
// Let's stick to the explicit paths but without required.

const dailyHoroscopeSchemaExplicit = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
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

module.exports = mongoose.model('DailyHoroscope', dailyHoroscopeSchemaExplicit);
