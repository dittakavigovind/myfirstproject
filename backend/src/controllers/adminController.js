const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const AstrologerActivity = require('../models/AstrologerActivity');
const Session = require('../models/Session');
const AppConfig = require('../models/AppConfig');
const QueueService = require('../services/QueueService');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: new Date(startDate), $lte: end } };
        }

        const users = await User.countDocuments({ role: 'user', ...dateFilter });
        const astrologers = await User.countDocuments({ role: 'astrologer', ...dateFilter });

        // Lifetime / Period Revenue
        const revenueAggregate = await Session.aggregate([
            { $match: { status: 'completed', ...dateFilter } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmountDeducted' }, totalDuration: { $sum: '$totalDuration' } } }
        ]);

        // Today's / Period Revenue
        let todayFilter = {};
        if (startDate && endDate) {
            todayFilter = dateFilter;
        } else {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            todayFilter = { createdAt: { $gte: startOfToday } };
        }

        // Fetch Global Commission Fallback for calculation of legacy sessions
        const PricingConfig = require('../models/PricingConfig');
        const pConfig = await PricingConfig.findOne();
        const globalFee = pConfig?.globalRates?.globalPlatformFee || 40;

        const todayRevenueAggregate = await Session.aggregate([
            {
                $match: {
                    status: { $in: ['completed', 'active'] },
                    ...todayFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmountDeducted' },
                    platformShare: { $sum: { $ifNull: ["$platformShare", { $multiply: ["$totalAmountDeducted", (globalFee / 100)] }] } },
                    astrologerShare: { $sum: { $ifNull: ["$astrologerShare", { $multiply: ["$totalAmountDeducted", ((100 - globalFee) / 100)] }] } }
                }
            }
        ]);

        const activeChats = await Session.countDocuments({ status: 'active' });

        // Calculate total locked liquidity across all user wallets
        const walletAggregate = await User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: null, totalBalance: { $sum: '$walletBalance' } } }
        ]);

        const gstAggregate = await Transaction.aggregate([
            { $match: { status: 'success', referenceModel: { $in: ['Recharge', 'WalletRecharge'] }, ...dateFilter } },
            { $group: { _id: null, totalGst: { $sum: '$gstAmount' } } }
        ]);

        const todayGstAggregate = await Transaction.aggregate([
            {
                $match: {
                    status: 'success',
                    referenceModel: { $in: ['Recharge', 'WalletRecharge'] },
                    ...todayFilter
                }
            },
            { $group: { _id: null, todayGst: { $sum: '$gstAmount' } } }
        ]);

        res.json({
            users,
            astrologers,
            revenue: revenueAggregate[0]?.totalRevenue || 0,
            todayRevenue: todayRevenueAggregate[0]?.totalRevenue || 0,
            todayPlatformShare: todayRevenueAggregate[0]?.platformShare || 0,
            todayAstrologerShare: todayRevenueAggregate[0]?.astrologerShare || 0,
            activeChats,
            totalChatMinutes: Math.floor((revenueAggregate[0]?.totalDuration || 0) / 60),
            totalUserWallets: walletAggregate[0]?.totalBalance || 0,
            totalGst: gstAggregate[0]?.totalGst || 0,
            todayGst: todayGstAggregate[0]?.todayGst || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Astrologer Settings (Commission, Verified, Verification Status)
// @route   PUT /api/admin/astrologers/:id/settings
// @access  Private/Admin
exports.updateAstrologerSettings = async (req, res) => {
    try {
        const astrologer = await Astrologer.findOne({ userId: req.params.id });
        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer not found' });
        }

        const { commissionRate, isVerified, verificationStatus, fakeFollowers, badgeText, features, isPinned, pinOrder, pinStartTime, pinEndTime, tdsPercentage, pgPercentage } = req.body;

        if (isPinned === true) {
            const start = pinStartTime ? new Date(pinStartTime) : (astrologer.pinStartTime || new Date());
            const end = pinEndTime ? new Date(pinEndTime) : (astrologer.pinEndTime || new Date(Date.now() + 365*24*60*60*1000));
            const targetOrder = pinOrder !== undefined ? Number(pinOrder) : (astrologer.pinOrder || 0);

            // Validation: Ensure no overlap in the same pinOrder
            const overlappingPin = await Astrologer.findOne({
                _id: { $ne: astrologer._id },
                isPinned: true,
                pinOrder: targetOrder,
                pinStartTime: { $lt: end },
                pinEndTime: { $gt: start }
            });

            if (overlappingPin) {
                return res.status(400).json({
                    success: false,
                    message: `Conflict! '${overlappingPin.displayName || overlappingPin.name}' is already pinned at Order ${targetOrder} from ${new Date(overlappingPin.pinStartTime).toLocaleString()} to ${new Date(overlappingPin.pinEndTime).toLocaleString()}`
                });
            }
        }

        if (commissionRate !== undefined) astrologer.commissionRate = commissionRate;
        if (isVerified !== undefined) astrologer.isVerified = isVerified;
        if (verificationStatus !== undefined) astrologer.verificationStatus = verificationStatus;
        if (fakeFollowers !== undefined) astrologer.fakeFollowers = Number(fakeFollowers);
        if (badgeText !== undefined) astrologer.badgeText = badgeText;
        if (features !== undefined) astrologer.features = { ...astrologer.features, ...features };
        if (isPinned !== undefined) astrologer.isPinned = isPinned;
        if (pinOrder !== undefined) astrologer.pinOrder = Number(pinOrder);
        if (pinStartTime !== undefined) astrologer.pinStartTime = pinStartTime;
        if (pinEndTime !== undefined) astrologer.pinEndTime = pinEndTime;

        await astrologer.save();

        if (tdsPercentage !== undefined || pgPercentage !== undefined) {
            const user = await User.findById(req.params.id);
            if (user) {
                if (tdsPercentage !== undefined) user.tdsPercentage = Number(tdsPercentage);
                if (pgPercentage !== undefined) user.pgPercentage = Number(pgPercentage);
                await user.save();
            }
        }

        res.json({ success: true, message: 'Astrologer settings updated', data: astrologer });
    } catch (error) {
        console.error('Update Astrologer Settings Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Live and Completed Sessions
// @route   GET /api/admin/sessions
// @access  Private/Admin
exports.getAllSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }

        const sessions = await Session.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email phone')
            .populate('astrologerId', 'displayName email');

        const total = await Session.countDocuments(query);

        res.json({
            success: true,
            data: sessions,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GetAllSessions Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bypass Waitlist for Priority Routing
// @route   POST /api/admin/queue/bypass
// @access  Private/Admin/Manager
exports.bypassWaitlist = async (req, res) => {
    try {
        const { astrologerId, userId, sessionType } = req.body;
        if (!astrologerId || !userId || !sessionType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        await QueueService.bypassQueue(astrologerId, userId, sessionType);
        res.json({ success: true, message: 'User forcefully moved to front of the queue via system override.' });
    } catch (error) {
        console.error('Waitlist Bypass Error:', error);
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
        
        // Check if there is an astrologer profile associated with this user
        const astrologerProfile = await Astrologer.findOne({ userId: user._id });
        
        const userData = user.toObject();
        if (astrologerProfile) {
            userData.astrologerProfile = astrologerProfile;
        }

        res.json(userData);
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
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = 'Deleted User';
        user.email = '';
        user.phone = 'deleted_' + Date.now();
        user.mobileNumber = 'deleted_' + Date.now();
        user.gender = undefined;
        user.profileImage = 'default-avatar.png';
        user.fcmTokens = [];
        user.birthDetails = undefined;
        user.isDeleted = true;
        user.isOnline = false;
        user.isChatOnline = false;
        user.isVoiceOnline = false;
        user.isVideoOnline = false;

        if (user.role === 'astrologer') {
            const astro = await Astrologer.findOne({ userId: user._id });
            if (astro) {
                astro.displayName = 'Deleted Astrologer';
                astro.email = 'deleted_' + Date.now() + '@way2astro.com';
                astro.phone = 'deleted_' + Date.now();
                astro.bio = '';
                astro.image = 'default-avatar.png';
                astro.isActive = false;
                astro.isOnline = false;
                astro.isChatOnline = false;
                astro.isVoiceOnline = false;
                astro.isVideoOnline = false;
                await astro.save();
            }
        }

        await user.save();
        res.json({ success: true, message: 'User soft-deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
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

// @desc    Get Socket Monitor Stats
// @route   GET /api/admin/socket-monitor
// @access  Private/Admin
exports.getSocketMonitorStats = async (req, res) => {
    try {
        const io = req.app.get('io');
        let totalConnections = 0;
        let userConnections = 0;
        let astrologerConnections = 0;

        if (io) {
            totalConnections = io.engine.clientsCount;
            const sockets = await io.fetchSockets();
            sockets.forEach(socket => {
                const user = socket.user || (socket.data && socket.data.user);
                if (user) {
                    if (user.role === 'astrologer') astrologerConnections++;
                    else if (user.role === 'user') userConnections++;
                }
            });
        }

        // Waitlist Lengths
        const redis = require('../config/redis');
        let totalWaitlistLength = 0;
        if (redis) {
            const keys = await redis.keys('astro:queue:*');
            for (const key of keys) {
                const length = await redis.zcard(key);
                totalWaitlistLength += length;
            }
        }

        // Agora Server States (Active video/audio sessions)
        const activeVideoSessions = await Session.countDocuments({ status: 'active', sessionType: 'video' });
        const activeAudioSessions = await Session.countDocuments({ status: 'active', sessionType: 'call' });

        res.json({
            success: true,
            data: {
                totalConnections,
                userConnections,
                astrologerConnections,
                totalWaitlistLength,
                activeVideoSessions,
                activeAudioSessions
            }
        });
    } catch (error) {
        console.error('Socket Monitor Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const Report = require('../models/Report');
const UserBlock = require('../models/UserBlock');

// @desc    Get All Reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporterId', 'name displayName email phone role profilePic image')
            .populate('reportedId', 'name displayName email phone role profilePic image')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('GetAllReports Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all transactions for Financial Dashboard
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'name email phone role isDeleted')
            .sort({ createdAt: -1 });

        res.json({ success: true, transactions });
    } catch (error) {
        console.error('GetAllTransactions Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Blocked Users
// @route   GET /api/admin/blocked-users
// @access  Private/Admin
exports.getAllBlockedUsers = async (req, res) => {
    try {
        const blocks = await UserBlock.find()
            .populate('blockerId', 'name displayName email phone role profilePic image')
            .populate('blockedId', 'name displayName email phone role profilePic image')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: blocks });
    } catch (error) {
        console.error('GetAllBlockedUsers Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
