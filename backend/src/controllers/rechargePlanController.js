const RechargePlan = require('../models/RechargePlan');
const PricingConfig = require('../models/PricingConfig');

// @desc    Get all active recharge plans (Public/User)
// @route   GET /api/wallet/plans
// @access  Public
exports.getActivePlans = async (req, res) => {
    try {
        const plans = await RechargePlan.find({ isActive: true }).sort({ amount: 1 });
        const config = await PricingConfig.findOne() || {};
        const gst = config.gst || { enabled: false, percentage: 18 };
        res.json({ success: true, data: plans, gst });
    } catch (error) {
        console.error('Get Active Plans Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all recharge plans (Admin)
// @route   GET /api/admin/recharge-plans
// @access  Private/Admin
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await RechargePlan.find().sort({ amount: 1 });
        res.json({ success: true, data: plans });
    } catch (error) {
        console.error('Get All Plans Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new recharge plan
// @route   POST /api/admin/recharge-plans
// @access  Private/Admin
exports.createPlan = async (req, res) => {
    try {
        const { amount, bonus, label, tag, isActive } = req.body;
        const newPlan = new RechargePlan({
            amount, bonus, label, tag, isActive
        });
        await newPlan.save();
        res.status(201).json({ success: true, message: 'Plan created successfully', data: newPlan });
    } catch (error) {
        console.error('Create Plan Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a recharge plan
// @route   PUT /api/admin/recharge-plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res) => {
    try {
        const { amount, bonus, label, tag, isActive } = req.body;
        const plan = await RechargePlan.findByIdAndUpdate(
            req.params.id,
            { amount, bonus, label, tag, isActive },
            { new: true, runValidators: true }
        );
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, message: 'Plan updated successfully', data: plan });
    } catch (error) {
        console.error('Update Plan Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a recharge plan
// @route   DELETE /api/admin/recharge-plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res) => {
    try {
        const plan = await RechargePlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error) {
        console.error('Delete Plan Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
