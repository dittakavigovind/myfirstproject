const express = require('express');
const router = express.Router();
const UserMemory = require('../models/UserMemory');
const ConsultationSummary = require('../models/ConsultationSummary');
const { protect } = require('../middleware/authMiddleware');
const Astrologer = require('../models/Astrologer');

// Middleware to ensure user is an astrologer
const isAstrologer = async (req, res, next) => {
    try {
        if (req.user.role !== 'astrologer') {
            return res.status(403).json({ success: false, message: 'Access denied. Astrologer only.' });
        }
        
        const astro = await Astrologer.findOne({ userId: req.user.id });
        if (!astro) {
            return res.status(403).json({ success: false, message: 'Astrologer profile not found.' });
        }
        req.astrologerId = astro._id;
        next();
    } catch (error) {
        console.error("Astrologer middleware error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/astrologer/ai-insights/:userId
router.get('/:userId', protect, isAstrologer, async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user memory
        const memory = await UserMemory.findOne({ userId });

        // Fetch latest consultation summary (just to have it, though UserMemory is the main thing)
        const latestSummary = await ConsultationSummary.findOne({ userId })
            .sort({ createdAt: -1 })
            .populate('sessionId', 'sessionDate sessionType totalDuration');

        if (!memory && !latestSummary) {
            return res.json({
                success: true,
                data: null, // No insights available yet
                message: "No AI insights available for this user."
            });
        }

        res.json({
            success: true,
            data: {
                memory: memory ? memory.toObject() : null,
                latestSummary: latestSummary ? latestSummary.toObject() : null
            }
        });
    } catch (error) {
        console.error("Error fetching AI Insights:", error);
        res.status(500).json({ success: false, message: 'Server error fetching AI Insights' });
    }
});

// POST /api/astrologer/ai-insights/:userId/translate
router.post('/:userId/translate', protect, isAstrologer, async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, targetLanguage } = req.body;
        if (!data || !targetLanguage) {
            return res.status(400).json({ success: false, message: 'Missing data or targetLanguage' });
        }

        // Check cache in UserMemory
        const memory = await UserMemory.findOne({ userId });
        if (memory && memory.translations && memory.translations.has(targetLanguage)) {
            console.log(`[AI Insights] Serving ${targetLanguage} translation from cache.`);
            return res.json({
                success: true,
                data: memory.translations.get(targetLanguage)
            });
        }

        console.log(`[AI Insights] Cache miss for ${targetLanguage}. Requesting OpenAI translation...`);
        const AiInsightService = require('../services/AiInsightService');
        const translatedData = await AiInsightService.translateInsights(data, targetLanguage);

        // Save translation back to DB for future requests
        if (memory) {
            if (!memory.translations) {
                memory.translations = new Map();
            }
            memory.translations.set(targetLanguage, translatedData);
            memory.markModified('translations');
            await memory.save();
            console.log(`[AI Insights] Saved ${targetLanguage} translation to cache.`);
        }

        res.json({
            success: true,
            data: translatedData
        });
    } catch (error) {
        console.error("Error translating AI Insights:", error);
        res.status(500).json({ success: false, message: 'Server error translating AI Insights' });
    }
});

module.exports = router;
