const Popup = require('../models/Popup');

exports.createPopup = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'Start date must be before end date' });
        }

        const popup = new Popup({
            ...req.body,
            createdBy: req.user._id
        });
        await popup.save();
        res.status(201).json({ success: true, data: popup });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getPopups = async (req, res) => {
    try {
        const popups = await Popup.find().sort({ createdAt: -1 });
        res.json({ success: true, data: popups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicPopup = async (req, res) => {
    try {
        const { path } = req.query;
        const now = new Date();

        // Find active popups that match the path and are within the schedule
        const popup = await Popup.findOne({
            isActive: true,
            $or: [
                { displayPages: 'all' },
                { displayPages: path }
            ],
            $and: [
                { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }, { startDate: null }] },
                { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }, { endDate: null }] }
            ]
        }).sort({ updatedAt: -1 });

        res.json({ success: true, data: popup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePopup = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ success: false, message: 'Start date must be before end date' });
        }

        const popup = await Popup.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
        res.json({ success: true, data: popup });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePopup = async (req, res) => {
    try {
        const popup = await Popup.findByIdAndDelete(req.params.id);
        if (!popup) return res.status(404).json({ success: false, message: 'Popup not found' });
        res.json({ success: true, message: 'Popup deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.trackImpression = async (req, res) => {
    try {
        await Popup.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.trackClick = async (req, res) => {
    try {
        await Popup.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
