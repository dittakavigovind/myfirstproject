const DailyBlessing = require('../models/DailyBlessing');
const path = require('path');
const fs = require('fs');

// Public API
exports.getTodayBlessing = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        // Find the active blessing for today
        const blessing = await DailyBlessing.findOne({
            status: 'Published',
            startDate: { $lte: endOfToday },
            endDate: { $gte: today }
        })
        .sort({ isSpecialOccasion: -1, priority: -1, updatedAt: -1 })
        .lean();

        if (!blessing) {
            return res.status(200).json({
                success: true,
                blessing: null,
                message: "No blessing scheduled for today"
            });
        }

        // Apply aggressive caching headers (Cache for 1 hour or until end of day)
        res.set('Cache-Control', 'public, max-age=3600');

        return res.status(200).json({
            success: true,
            blessing: {
                id: blessing._id,
                date: today.toISOString().split('T')[0],
                title: blessing.title,
                greeting: blessing.greeting,
                deityName: blessing.deityName,
                message: blessing.message,
                mantra: blessing.mantra,
                imageUrl: blessing.imageUrl,
                shareImageUrl: blessing.shareImageUrl,
                deepLink: `https://way2astro.com/blessing?id=${blessing._id}` // App links compatible format
            }
        });
    } catch (error) {
        console.error('Error fetching today blessing:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Admin APIs
exports.createBlessing = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        if (req.body.status === 'Published') {
            req.body.publishedAt = Date.now();
        }

        const blessing = await DailyBlessing.create(req.body);
        res.status(201).json({ success: true, data: blessing });
    } catch (error) {
        console.error('Error creating blessing:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAdminBlessings = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;

        const total = await DailyBlessing.countDocuments();
        
        const blessings = await DailyBlessing.find()
            .populate('createdBy', 'name email')
            .sort({ startDate: -1, priority: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: blessings.length,
            total,
            pagination: {
                page,
                pages: Math.ceil(total / limit)
            },
            data: blessings
        });
    } catch (error) {
        console.error('Error fetching admin blessings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getBlessing = async (req, res) => {
    try {
        const blessing = await DailyBlessing.findById(req.params.id);
        if (!blessing) {
            return res.status(404).json({ success: false, message: 'Blessing not found' });
        }
        res.status(200).json({ success: true, data: blessing });
    } catch (error) {
        console.error('Error fetching blessing:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateBlessing = async (req, res) => {
    try {
        let blessing = await DailyBlessing.findById(req.params.id);
        
        if (!blessing) {
            return res.status(404).json({ success: false, message: 'Blessing not found' });
        }

        if (req.body.status === 'Published' && blessing.status !== 'Published') {
            req.body.publishedAt = Date.now();
        }

        blessing = await DailyBlessing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: blessing });
    } catch (error) {
        console.error('Error updating blessing:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteBlessing = async (req, res) => {
    try {
        const blessing = await DailyBlessing.findById(req.params.id);
        
        if (!blessing) {
            return res.status(404).json({ success: false, message: 'Blessing not found' });
        }

        await blessing.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting blessing:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
