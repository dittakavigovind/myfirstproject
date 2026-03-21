const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
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
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

        let updates = {};
        const { status, isChatOnline, isVoiceOnline, isVideoOnline } = req.body;

        // 1. Handle Master Status Change
        if (status !== undefined) {
            const turningOnline = status === true || status === 'true';
            updates.isOnline = turningOnline;
            if (turningOnline) {
                updates.lastOnlineAt = new Date();
            } else {
                // Cascading OFF: If master is turned off, all sub-channels go off
                updates.isChatOnline = false;
                updates.isVoiceOnline = false;
                updates.isVideoOnline = false;
            }
        }

        // 2. Handle Granular Status Change
        if (isChatOnline !== undefined) updates.isChatOnline = isChatOnline === true || isChatOnline === 'true';
        if (isVoiceOnline !== undefined) updates.isVoiceOnline = isVoiceOnline === true || isVoiceOnline === 'true';
        if (isVideoOnline !== undefined) updates.isVideoOnline = isVideoOnline === true || isVideoOnline === 'true';

        // 3. APPLY BUSINESS RULE:
        // A) If turning ANY channel ON -> Master becomes ON
        const turningAnyOn = (isChatOnline === true || isChatOnline === 'true') ||
                             (isVoiceOnline === true || isVoiceOnline === 'true') ||
                             (isVideoOnline === true || isVideoOnline === 'true');
        
        if (turningAnyOn) {
            updates.isOnline = true;
            updates.lastOnlineAt = new Date();
        }

        // B) If turning OFF result in ALL 3 channels being OFF -> Master becomes OFF
        if (isChatOnline !== undefined || isVoiceOnline !== undefined || isVideoOnline !== undefined) {
             const finalChat = isChatOnline !== undefined ? (isChatOnline === true || isChatOnline === 'true') : currentUser.isChatOnline;
             const finalVoice = isVoiceOnline !== undefined ? (isVoiceOnline === true || isVoiceOnline === 'true') : currentUser.isVoiceOnline;
             const finalVideo = isVideoOnline !== undefined ? (isVideoOnline === true || isVideoOnline === 'true') : currentUser.isVideoOnline;

             if (!finalChat && !finalVoice && !finalVideo) {
                 updates.isOnline = false;
             }
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });

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

        res.status(200).json({
            success: true,
            user: {
                isOnline: user.isOnline,
                isChatOnline: user.isChatOnline,
                isVoiceOnline: user.isVoiceOnline,
                isVideoOnline: user.isVideoOnline,
                lastOnlineAt: user.lastOnlineAt
            },
            message: `Status updated successfully`
        });

    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        delete updates.role;
        delete updates.walletBalance;
        delete updates.password;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'astrologer') {
            await Astrologer.findOneAndUpdate(
                { userId: userId },
                {
                    'charges.chatPerMinute': user.chatPrice,
                    'charges.callPerMinute': user.callPrice,
                    'charges.videoPerMinute': user.videoPrice
                }
            );
        }

        res.status(200).json({ success: true, message: 'Profile updated', user });
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
