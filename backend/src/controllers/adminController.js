const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const AstrologerActivity = require('../models/AstrologerActivity');
const Session = require('../models/Session');
const AppConfig = require('../models/AppConfig');
const QueueService = require('../services/QueueService');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const ArchivedUser = require('../models/ArchivedUser');

// @desc    Add wallet balance manually
// @route   POST /api/admin/manual-wallet
// @access  Private/Admin
exports.addManualWalletBalance = async (req, res) => {
    try {
        const { searchKey, amount, description } = req.body;
        const trimmedKey = String(searchKey || '').trim();
        const parsedAmount = Number(amount);

        if (!trimmedKey || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid search key or amount' });
        }

        const escapedKey = trimmedKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchPattern = new RegExp(escapedKey, 'i');
        const digitsOnly = trimmedKey.replace(/\D/g, '');
        const orConditions = [
            { phone: { $regex: searchPattern } },
            { mobileNumber: { $regex: searchPattern } },
            { email: { $regex: searchPattern } },
            { name: { $regex: searchPattern } }
        ];

        if (digitsOnly.length >= 6) {
            const last10 = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
            const digitsRegex = new RegExp(`${last10}$`);
            orConditions.push(
                { phone: { $regex: digitsRegex } },
                { mobileNumber: { $regex: digitsRegex } }
            );
        }

        const user = await User.findOne({ $or: orConditions });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User/Astrologer not found' });
        }

        user.walletBalance = (user.walletBalance || 0) + parsedAmount;
        await user.save();

        const transaction = await Transaction.create({
            user: user._id,
            amount: parsedAmount,
            totalAmount: parsedAmount,
            type: 'credit',
            status: 'success',
            description: (description && String(description).trim()) || 'Manual Wallet Recharge',
            referenceModel: 'ManualWallet'
        });

        res.json({ success: true, message: 'Wallet balance added successfully', user, transaction });
    } catch (error) {
        console.error('Manual Wallet Add Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Manual Wallet Transactions
// @route   GET /api/admin/manual-wallet/transactions
// @access  Private/Admin
exports.getManualWalletTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { referenceModel: 'ManualWallet' },
                { referenceModel: 'WalletRecharge', paymentId: null, orderId: null },
                { description: { $regex: /Manual/i } }
            ]
        })
            .populate('user', 'name email phone role')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Manual Wallet Transactions Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

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

        // Online Paid Recharges (Gateway transactions, excluding manual admin adjustments)
        const onlineRechargeAgg = await Transaction.aggregate([
            {
                $match: {
                    status: 'success',
                    referenceModel: { $in: ['Recharge', 'WalletRecharge'] },
                    description: { $not: /manual/i },
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaid: {
                        $sum: {
                            $ifNull: [
                                '$totalAmount',
                                { $add: ['$amount', { $ifNull: ['$gstAmount', 0] }] }
                            ]
                        }
                    },
                    totalBase: { $sum: '$amount' },
                    totalGst: { $sum: { $ifNull: ['$gstAmount', 0] } }
                }
            }
        ]);

        // Manual Wallet Recharges granted by admin (no payment gateway / GST)
        const manualRechargeAgg = await Transaction.aggregate([
            {
                $match: {
                    status: 'success',
                    $or: [
                        { description: /manual/i },
                        { referenceModel: 'ManualWallet' }
                    ],
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalManual: { $sum: '$amount' }
                }
            }
        ]);

        const gstAggregate = await Transaction.aggregate([
            { $match: { status: 'success', referenceModel: { $in: ['Recharge', 'WalletRecharge'] }, description: { $not: /manual/i }, ...dateFilter } },
            { $group: { _id: null, totalGst: { $sum: '$gstAmount' } } }
        ]);

        const todayGstAggregate = await Transaction.aggregate([
            {
                $match: {
                    status: 'success',
                    referenceModel: { $in: ['Recharge', 'WalletRecharge'] },
                    description: { $not: /manual/i },
                    ...todayFilter
                }
            },
            { $group: { _id: null, todayGst: { $sum: '$gstAmount' } } }
        ]);

        const dormantAggregate = await User.aggregate([
            { $match: { isDeleted: true, walletBalance: { $gt: 0 } } },
            { $group: { _id: null, totalDormantFunds: { $sum: '$walletBalance' } } }
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
            totalOnlinePaid: onlineRechargeAgg[0]?.totalPaid || 0,
            totalOnlineRechargeBase: onlineRechargeAgg[0]?.totalBase || 0,
            totalManualRecharge: manualRechargeAgg[0]?.totalManual || 0,
            totalGst: onlineRechargeAgg[0]?.totalGst || gstAggregate[0]?.totalGst || 0,
            todayGst: todayGstAggregate[0]?.todayGst || 0,
            totalDormantFunds: dormantAggregate[0]?.totalDormantFunds || 0
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
        const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 200;
        const skip = limit > 0 ? (page - 1) * limit : 0;

        const query = {};

        // Status filter
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        // Session Type filter
        if (req.query.sessionType && req.query.sessionType !== 'all') {
            if (req.query.sessionType === 'voice' || req.query.sessionType === 'audio') {
                query.sessionType = { $in: ['voice', 'audio'] };
            } else {
                query.sessionType = req.query.sessionType;
            }
        }

        // Date range filter on createdAt
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                const sDate = new Date(req.query.startDate);
                sDate.setHours(0, 0, 0, 0);
                query.createdAt.$gte = sDate;
            }
            if (req.query.endDate) {
                const eDate = new Date(req.query.endDate);
                eDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = eDate;
            }
        }

        // Search filter across user name/phone/email, astrologer name/displayName, roomId, and ObjectId
        if (req.query.search && req.query.search.trim()) {
            const searchTerm = req.query.search.trim();
            const searchRegex = new RegExp(searchTerm, 'i');

            // Find matching users
            const matchingUsers = await User.find({
                $or: [
                    { name: searchRegex },
                    { phone: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            // Find matching astrologers
            const matchingAstros = await Astrologer.find({
                $or: [
                    { displayName: searchRegex },
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            }).select('_id');
            const astroIds = matchingAstros.map(a => a._id);

            const orConditions = [
                { roomId: searchRegex }
            ];

            if (mongoose.Types.ObjectId.isValid(searchTerm)) {
                orConditions.push({ _id: new mongoose.Types.ObjectId(searchTerm) });
            }
            if (userIds.length > 0) {
                orConditions.push({ userId: { $in: userIds } });
            }
            if (astroIds.length > 0) {
                orConditions.push({ astrologerId: { $in: astroIds } });
            }

            query.$or = orConditions;
        }

        let sessionQuery = Session.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email phone')
            .populate('astrologerId', 'displayName name email phone image');

        if (limit > 0) {
            sessionQuery = sessionQuery.skip(skip).limit(limit);
        }

        const sessions = await sessionQuery;
        const total = await Session.countDocuments(query);

        res.json({
            success: true,
            data: sessions,
            pagination: { total, page, pages: limit > 0 ? Math.ceil(total / limit) : 1 }
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
        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
        const mappedUsers = users.map(u => {
            if (!u.firstLoginPlatform || u.firstLoginPlatform === 'Unknown') {
                const ua = (u.deviceInfo?.userAgent || '').toLowerCase();
                const isApp = ua.includes('; wv') || ua.includes('wv;') || ua.includes('capacitor') || (ua.includes('android') && ua.includes('version/4.0')) || !!u.deviceInfo?.appVersion;
                u.firstLoginPlatform = isApp ? 'APP' : 'Website';
            }
            return u;
        });
        res.json(mappedUsers);
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
        if (!userData.firstLoginPlatform || userData.firstLoginPlatform === 'Unknown') {
            const ua = (userData.deviceInfo?.userAgent || '').toLowerCase();
            const isApp = ua.includes('; wv') || ua.includes('wv;') || ua.includes('capacitor') || (ua.includes('android') && ua.includes('version/4.0')) || !!userData.deviceInfo?.appVersion;
            userData.firstLoginPlatform = isApp ? 'APP' : 'Website';
        }

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

        let astro = null;
        if (user.role === 'astrologer') {
            astro = await Astrologer.findOne({ userId: user._id });
        }

        // Archive user data before scrubbing
        const archiveData = {
            originalUserId: user._id,
            role: user.role,
            userData: user.toObject(),
            deletedBy: 'admin'
        };
        if (astro) {
            archiveData.astrologerData = astro.toObject();
        }
        await ArchivedUser.create(archiveData);

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
                label: 'First Login Platform',
                value: (row) => {
                    if (row.firstLoginPlatform && row.firstLoginPlatform !== 'Unknown') return row.firstLoginPlatform;
                    const ua = (row.deviceInfo?.userAgent || '').toLowerCase();
                    const isApp = ua.includes('; wv') || ua.includes('wv;') || ua.includes('capacitor') || (ua.includes('android') && ua.includes('version/4.0')) || !!row.deviceInfo?.appVersion;
                    return isApp ? 'APP' : 'Website';
                }
            },
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

// @desc    Sync / Check transaction status with Razorpay
// @route   POST /api/admin/transactions/:id/sync-status
// @access  Private/Admin
exports.syncTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id).populate('user', 'name email phone role isDeleted');
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        let updated = false;
        let razorpayInfo = null;

        // 1. If paymentId exists, fetch directly from Razorpay
        if (transaction.paymentId) {
            try {
                const payment = await razorpay.payments.fetch(transaction.paymentId);
                if (payment) {
                    razorpayInfo = {
                        paymentId: payment.id,
                        status: payment.status,
                        method: payment.method,
                        amount: payment.amount / 100
                    };

                    if (payment.method && transaction.paymentMethod !== payment.method) {
                        transaction.paymentMethod = payment.method;
                        updated = true;
                    }

                    if (payment.status === 'captured' && transaction.status !== 'success') {
                        transaction.status = 'success';
                        transaction.description = 'Wallet Recharge - Success (Synced)';
                        await User.findByIdAndUpdate(
                            transaction.user._id,
                            { $inc: { walletBalance: transaction.amount + (transaction.bonusAmount || 0) } }
                        );
                        updated = true;
                    } else if (payment.status === 'failed' && transaction.status === 'pending') {
                        transaction.status = 'failed';
                        transaction.description = 'Wallet Recharge - Failed (Synced)';
                        updated = true;
                    }
                }
            } catch (pErr) {
                console.warn('Sync payment fetch error:', pErr.message);
            }
        }

        // 2. If orderId exists and (pending or missing paymentMethod)
        if (transaction.orderId) {
            try {
                const orderPayments = await razorpay.orders.fetchPayments(transaction.orderId);
                if (orderPayments && orderPayments.items && orderPayments.items.length > 0) {
                    const capturedPayment = orderPayments.items.find(p => p.status === 'captured');
                    if (capturedPayment) {
                        transaction.paymentId = capturedPayment.id;
                        transaction.paymentMethod = capturedPayment.method;
                        razorpayInfo = {
                            paymentId: capturedPayment.id,
                            status: capturedPayment.status,
                            method: capturedPayment.method,
                            amount: capturedPayment.amount / 100
                        };

                        if (transaction.status !== 'success') {
                            transaction.status = 'success';
                            transaction.description = 'Wallet Recharge - Success (Synced via Order)';
                            await User.findByIdAndUpdate(
                                transaction.user._id,
                                { $inc: { walletBalance: transaction.amount + (transaction.bonusAmount || 0) } }
                            );
                        }
                        updated = true;
                    } else {
                        const allFailed = orderPayments.items.every(p => p.status === 'failed');
                        if (allFailed && transaction.status === 'pending') {
                            transaction.status = 'failed';
                            transaction.description = 'Wallet Recharge - Failed (All attempts failed)';
                            const latestPayment = orderPayments.items[0];
                            if (latestPayment?.method) transaction.paymentMethod = latestPayment.method;
                            updated = true;
                        }
                    }
                } else if (transaction.status === 'pending') {
                    const ageInMs = Date.now() - new Date(transaction.createdAt).getTime();
                    if (ageInMs > 30 * 60 * 1000) {
                        transaction.status = 'failed';
                        transaction.description = 'Wallet Recharge - Expired (Checkout Abandoned)';
                        updated = true;
                    }
                }
            } catch (oErr) {
                console.warn('Sync order payments fetch error:', oErr.message);
            }
        }

        if (updated) {
            await transaction.save();
        }

        res.json({
            success: true,
            updated,
            message: updated ? 'Transaction status synced with Razorpay' : 'Transaction already up to date',
            transaction,
            razorpayInfo
        });
    } catch (error) {
        console.error('Sync Transaction Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error syncing transaction status' });
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

// @desc    Export Dormant Funds to CSV
// @route   GET /api/admin/dormant-funds/export
// @access  Private/Admin
exports.exportDormantFundsCSV = async (req, res) => {
    try {
        const dormantUsers = await User.find({ isDeleted: true, walletBalance: { $gt: 0 } }).lean();

        if (!dormantUsers || dormantUsers.length === 0) {
            return res.status(404).json({ message: 'No dormant users found with a balance.' });
        }

        const { parse } = require('json2csv');
        const fields = ['_id', 'walletBalance', 'updatedAt'];
        const opts = { fields };

        try {
            const csv = parse(dormantUsers, opts);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=dormant_funds.csv');
            return res.status(200).send(csv);
        } catch (err) {
            console.error('CSV Parse Error:', err);
            return res.status(500).json({ message: 'Error generating CSV' });
        }

    } catch (error) {
        console.error('Export Dormant Funds Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
