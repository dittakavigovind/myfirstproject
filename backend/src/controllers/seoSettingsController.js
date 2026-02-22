const SEOSettings = require('../models/SEOSettings');

// Create SEO Settings
exports.createSeoSettings = async (req, res) => {
    try {
        const { pageSlug } = req.body;

        const existing = await SEOSettings.findOne({ pageSlug });
        if (existing) {
            return res.status(400).json({ success: false, message: 'SEO settings for this page already exist.' });
        }

        const seo = await SEOSettings.create({
            ...req.body,
            updatedBy: req.user?._id
        });

        res.status(201).json({ success: true, data: seo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { scanRoutes, FRONTEND_APP_DIR } = require('../utils/pageScanner');

// Get All Available Pages from File System
exports.getAvailablePages = async (req, res) => {
    try {
        const pages = scanRoutes(FRONTEND_APP_DIR);
        res.json({ success: true, data: pages });
    } catch (error) {
        console.error('Page Scan Error:', error);
        res.status(500).json({ success: false, message: 'Failed to scan pages' });
    }
};

// Get All SEO Settings
exports.getAllSeoSettings = async (req, res) => {
    try {
        // Fetch DB Settings
        const dbSettings = await SEOSettings.find().sort({ pageSlug: 1 });

        // Scan File System (optional: could be cached or triggered manually)
        // For now, let's keep them separate APIs, or we could merge here.
        // Let's keep separate so the frontend can handle the "Merge" UI logic.

        res.json({ success: true, data: dbSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single SEO Setting by Slug
exports.getSeoSettings = async (req, res) => {
    try {
        const { slug } = req.params;
        const seo = await SEOSettings.findOne({ pageSlug: slug });

        if (!seo) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        res.json({ success: true, data: seo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update SEO Settings
exports.updateSeoSettings = async (req, res) => {
    try {
        const { id } = req.params;

        const seo = await SEOSettings.findByIdAndUpdate(
            id,
            { ...req.body, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        );

        if (!seo) {
            return res.status(404).json({ success: false, message: 'Settings not found' });
        }

        res.json({ success: true, data: seo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete SEO Settings
exports.deleteSeoSettings = async (req, res) => {
    try {
        const { id } = req.params;
        await SEOSettings.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
