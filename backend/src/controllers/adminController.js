const User = require('../models/User');
const AstrologerActivity = require('../models/AstrologerActivity');
const mongoose = require('mongoose');
// const Transaction = require('../models/Transaction'); // If I need revenue stats

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const users = await User.countDocuments({ role: 'user' });
        const astrologers = await User.countDocuments({ role: 'astrologer' });
        // Calculate revenue if Transaction model exists, else 0
        // const revenue = await Transaction.aggregate(...) 
        const revenue = 0;

        res.json({
            users,
            astrologers,
            revenue,
            activeChats: 0 // Placeholder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (Compatible Format)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        // Frontend expects ARRAY directly? 
        // "const allUsers = usersRes.data;" in Line 78 of admin/page.js
        // If I return res.json(users), then usersRes.data IS the array.
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        console.log("getUserById called with params:", req.params);
        let user;
        const { id } = req.params;

        // Check if ID is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id).select('-password');
        }

        // If not found by ID (or invalid ID), try finding by email or username
        if (!user) {
            user = await User.findOne({
                $or: [
                    { email: id },
                    { username: id }
                ]
            }).select('-password');
        }

        if (!user) {
            console.log("User not found for ID/Email/Username:", id);
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error("getUserById ERROR:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = req.body.role || user.role;
        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Astrologer Online/Offline Activity Logs
// @route   GET /api/admin/activity
// @access  Private/Admin
exports.getAstrologerActivity = async (req, res) => {
    try {
        const logs = await AstrologerActivity.find()
            .populate('astrologerId', 'name email')
            .sort({ timestamp: -1 });

        // Frontend for activity expects: "const activityRes = await API.get('/admin/activity'); setActivities(activityRes.data.logs);"
        // Wait, I am implementing the frontend part for activity in the EXISTING page now.
        // So I can decide the format. I will stick to { logs: [] } or just []
        // My previous implementation returned { success: true, logs }. 
        // I will stick to that for the new feature.
        res.json({ success: true, logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
