const Report = require('../models/Report');
const UserBlock = require('../models/UserBlock');
const Session = require('../models/Session');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');

// @desc    Submit a report against a user or astrologer
// @route   POST /api/moderation/report
// @access  Private
exports.submitReport = async (req, res) => {
    try {
        const { reportedId, reportedModel, reason, description } = req.body;
        
        if (!reportedId || !reportedModel || !reason) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const reporterModel = req.user.role === 'astrologer' ? 'Astrologer' : 'User';
        const reporterId = req.user.astrologerId || req.user._id;

        const report = await Report.create({
            reporterId,
            reporterModel,
            reportedId,
            reportedModel,
            reason,
            description
        });

        res.status(201).json({ success: true, message: 'Report submitted successfully', report });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ success: false, message: 'Failed to submit report' });
    }
};

// @desc    Block a user or astrologer
// @route   POST /api/moderation/block
// @access  Private
exports.blockUser = async (req, res) => {
    try {
        const { blockedId, blockedModel, roomId } = req.body;

        if (!blockedId || !blockedModel) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const blockerModel = req.user.role === 'astrologer' ? 'Astrologer' : 'User';
        let blockerId = req.user._id;

        if (req.user.role === 'astrologer') {
            const astro = await Astrologer.findOne({ userId: req.user._id });
            if (astro) {
                blockerId = astro._id;
            }
        }

        let actualBlockedId = blockedId;
        if (typeof blockedId === 'object' && blockedId._id) {
            actualBlockedId = blockedId._id;
        } else if (typeof blockedId === 'object' && blockedId.id) {
            actualBlockedId = blockedId.id;
        }
        
        // Ensure not blocking themselves
        if (blockerId.toString() === actualBlockedId.toString() && blockerModel === blockedModel) {
            return res.status(400).json({ success: false, message: 'You cannot block yourself' });
        }

        // Create the block record (ignore error if it already exists due to unique index)
        try {
            await UserBlock.create({
                blockerId,
                blockerModel,
                blockedId: actualBlockedId,
                blockedModel
            });
        } catch (err) {
            if (err.code !== 11000) { // 11000 is duplicate key error
                console.error("UserBlock creation error:", err);
                throw err;
            }
        }

        if (roomId) {
            const Session = require('../models/Session');
            const session = await Session.findOne({ roomId });
            if (session && (session.status === 'active' || session.status === 'initiated')) {
                const now = new Date();
                let actualElapsedSeconds = 0;
                if (session.startTime) {
                    actualElapsedSeconds = Math.floor((now - new Date(session.startTime)) / 1000);
                }
                
                session.status = 'terminated';
                session.terminationReason = 'blocked_by_user';
                session.endedAt = now;
                session.totalDuration = actualElapsedSeconds;
                await session.save();
                
                const io = req.app.get('io');
                if (io) {
                    io.to(roomId).emit('session_ended', { 
                        reason: 'Interaction blocked by user preferences.',
                        endedBy: req.user.role === 'astrologer' ? 'astrologer' : 'user'
                    });
                }
            }
        }

        res.status(200).json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ success: false, message: 'Failed to block user' });
    }
};

// @desc    Get list of blocked users
// @route   GET /api/moderation/blocks
// @access  Private
exports.getBlockedUsers = async (req, res) => {
    try {
        const blockerModel = req.user.role === 'astrologer' ? 'Astrologer' : 'User';
        const blockerIds = [req.user._id];

        if (req.user.role === 'astrologer') {
            const astro = await Astrologer.findOne({ userId: req.user._id });
            if (astro) {
                blockerIds.push(astro._id);
            }
        }

        console.log(`[getBlockedUsers] blockerModel: ${blockerModel}, blockerIds: ${blockerIds}`);

        const blocks = await UserBlock.find({ 
            blockerId: { $in: blockerIds }, 
            blockerModel 
        })
            .populate('blockedId', 'name displayName email profilePic avatar image role isOnline status')
            .sort({ createdAt: -1 });
            
        console.log(`[getBlockedUsers] Found ${blocks.length} blocks for user ${req.user._id}`);
        res.status(200).json({ success: true, blocks });
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch blocks' });
    }
};

// @desc    Unblock a user or astrologer
// @route   POST /api/moderation/unblock
// @access  Private
exports.unblockUser = async (req, res) => {
    try {
        const { blockedId } = req.body;

        if (!blockedId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const blockerModel = req.user.role === 'astrologer' ? 'Astrologer' : 'User';
        const blockerIds = [req.user._id];

        if (req.user.role === 'astrologer') {
            const astro = await Astrologer.findOne({ userId: req.user._id });
            if (astro) {
                blockerIds.push(astro._id);
            }
        }

        let actualBlockedId = blockedId;
        if (typeof blockedId === 'object' && blockedId._id) {
            actualBlockedId = blockedId._id;
        } else if (typeof blockedId === 'object' && blockedId.id) {
            actualBlockedId = blockedId.id;
        }

        await UserBlock.deleteMany({
            blockerId: { $in: blockerIds },
            blockerModel,
            blockedId: actualBlockedId
        });

        res.status(200).json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ success: false, message: 'Failed to unblock user' });
    }
};
