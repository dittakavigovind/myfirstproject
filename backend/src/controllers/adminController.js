const User = require('../models/User');
const AstrologerActivity = require('../models/AstrologerActivity');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
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

// @desc    Export all users to CSV
// @route   GET /api/admin/users/export
// @access  Private/Admin
exports.exportUsersCSV = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        const fields = [
            { label: 'Name', value: 'name' },
            { label: 'Email', value: 'email' },
            {
                label: 'Phone',
                value: (row) => row.phone ? `\t${row.phone}` : ''
            },
            { label: 'Role', value: 'role' },
            {
                label: 'Joined',
                value: (row) => {
                    if (!row.createdAt) return '';
                    const d = new Date(row.createdAt);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                }
            },
            { label: 'Wallet Balance', value: 'walletBalance' },
            { label: 'Gender', value: 'gender' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(users);

        res.header('Content-Type', 'text/csv');
        res.attachment(`users_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle user block status
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private/Admin
exports.toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ success: true, isBlocked: user.isBlocked, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
