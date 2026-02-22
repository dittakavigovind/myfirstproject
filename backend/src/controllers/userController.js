const User = require('../models/User');
const Astrologer = require('../models/Astrologer'); // Add this import
const AstrologerActivity = require('../models/AstrologerActivity');
const ActivityLog = require('../models/ActivityLog');

exports.getRecentActivity = async (req, res) => {
    try {
        const activities = await ActivityLog.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(4);
        res.json({ success: true, data: activities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        let updates = {};

        // 1. Fetch current user state to determine Auto-Offline
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

        // Handle Master Status
        if (req.body.status !== undefined) {
            const isOnline = req.body.status === true || req.body.status === 'true';
            updates.isOnline = isOnline;
            if (isOnline) {
                updates.lastOnlineAt = new Date();
            } else {
                // If turning Offline, FORCE all granular channels to OFF
                updates.isChatOnline = false;
                updates.isVoiceOnline = false;
                updates.isVideoOnline = false;
            }
        }

        // Handle Granular Statuses (Only applied if not effectively offline)
        // If master is offline (from updates or current), these should stay false.
        const effectiveIsOnline = updates.isOnline !== undefined ? updates.isOnline : (currentUser ? currentUser.isOnline : false);

        if (effectiveIsOnline) {
            if (req.body.isChatOnline !== undefined) updates.isChatOnline = req.body.isChatOnline;
            if (req.body.isVoiceOnline !== undefined) updates.isVoiceOnline = req.body.isVoiceOnline;
            if (req.body.isVideoOnline !== undefined) updates.isVideoOnline = req.body.isVideoOnline;
        } else {
            // Ensure they stay false if offline
            updates.isChatOnline = false;
            updates.isVoiceOnline = false;
            updates.isVideoOnline = false;
        }

        // Auto-Offline Logic Removed as per user request ("if we stop vc or chat it should not go offline")
        // const finalChat = updates.isChatOnline !== undefined ? updates.isChatOnline : currentUser.isChatOnline;
        // const finalVoice = updates.isVoiceOnline !== undefined ? updates.isVoiceOnline : currentUser.isVoiceOnline;
        // const finalVideo = updates.isVideoOnline !== undefined ? updates.isVideoOnline : currentUser.isVideoOnline;

        // If all channels are OFF, force Master OFF -> DISABLED
        // if (!finalChat && !finalVoice && !finalVideo) {
        //     updates.isOnline = false;
        // }

        // Determine Action for Logging
        let action = null;
        const finalIsOnline = updates.isOnline !== undefined ? updates.isOnline : currentUser.isOnline;

        if (finalIsOnline !== currentUser.isOnline) {
            action = finalIsOnline ? 'ONLINE' : 'OFFLINE';
            if (finalIsOnline && !updates.lastOnlineAt) {
                updates.lastOnlineAt = new Date();
            }
        }

        // 2. Update User Status
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });

        // 3. Sync to Astrologer Profile if applicable
        if (user.role === 'astrologer') {
            await Astrologer.findOneAndUpdate(
                { userId: userId },
                {
                    isOnline: user.isOnline,
                    isChatOnline: user.isChatOnline,
                    isVoiceOnline: user.isVoiceOnline,
                    isVideoOnline: user.isVideoOnline,
                    lastOnlineAt: user.lastOnlineAt
                }
            );
        }

        // 2. Log Activity (Only if Master Status changed)
        if (action) {
            await AstrologerActivity.create({
                astrologerId: userId,
                action: action,
                timestamp: new Date()
            });
        }

        res.status(200).json({
            success: true,
            user: {
                isOnline: user.isOnline,
                isChatOnline: user.isChatOnline,
                isVoiceOnline: user.isVoiceOnline,
                isVideoOnline: user.isVideoOnline,
                lastOnlineAt: user.lastOnlineAt
            }, // Return updated fields
            message: `Status updated`
        });

    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        // req.user.id comes from auth middleware
        const userId = req.user.id;
        const updates = req.body;

        // Security: Prevent updating role or balance directly from here if needed
        delete updates.role;
        delete updates.walletBalance;
        delete updates.password;

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isProfileComplete =
            user.name &&
            user.name !== 'User' &&
            user.gender &&
            user.birthDetails &&
            user.birthDetails.date;

        res.status(200).json({
            success: true,
            message: 'Profile updated',
            user,
            needsProfileSetup: !isProfileComplete
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
