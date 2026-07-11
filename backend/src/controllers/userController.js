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

        if (currentUser.role === 'astrologer') {
            const turningAnyOn = (status === true || status === 'true') ||
                                 (isChatOnline === true || isChatOnline === 'true') ||
                                 (isVoiceOnline === true || isVoiceOnline === 'true') ||
                                 (isVideoOnline === true || isVideoOnline === 'true');
            if (turningAnyOn) {
                const astro = await Astrologer.findOne({ userId });
                if (astro && astro.isActive === false) {
                    return res.status(403).json({ success: false, message: 'Your account has been deactivated by Admin.' });
                }
            }
        }

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

        // Ensure fallback to false if undefined in DB to prevent frontend UI toggles from resetting
        const finalIsChatOnline = user.isChatOnline === true;
        const finalIsVoiceOnline = user.isVoiceOnline === true;
        const finalIsVideoOnline = user.isVideoOnline === true;

        if (user.role === 'astrologer') {
            const updatedAstro = await Astrologer.findOneAndUpdate(
                { userId: userId },
                {
                    isOnline: user.isOnline === true,
                    isChatOnline: finalIsChatOnline,
                    isVoiceOnline: finalIsVoiceOnline,
                    isVideoOnline: finalIsVideoOnline,
                    lastOnlineAt: user.lastOnlineAt,
                    'statusBackup.isChatOnline': finalIsChatOnline,
                    'statusBackup.isVoiceOnline': finalIsVoiceOnline,
                    'statusBackup.isVideoOnline': finalIsVideoOnline
                }
            );

            // Track Session Duration
            if (updatedAstro && currentUser.isOnline !== (user.isOnline === true)) {
                const AstrologerOnlineSession = require('../models/AstrologerOnlineSession');
                const AstrologerDailyStat = require('../models/AstrologerDailyStat');
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (user.isOnline === true) {
                    await AstrologerOnlineSession.updateMany(
                        { astrologerId: updatedAstro._id, status: 'active' },
                        { $set: { status: 'auto_closed', logoutTime: new Date() } }
                    );
                    await AstrologerOnlineSession.create({
                        astrologerId: updatedAstro._id,
                        loginTime: new Date(),
                        status: 'active',
                        sessionDate: today
                    });
                } else {
                    const activeSession = await AstrologerOnlineSession.findOne({ astrologerId: updatedAstro._id, status: 'active' });
                    if (activeSession) {
                        const logoutTime = new Date();
                        const durationMs = logoutTime - activeSession.loginTime;
                        const durationMinutes = Math.floor(durationMs / 60000);
                        const durationSeconds = Math.floor(durationMs / 1000);

                        activeSession.logoutTime = logoutTime;
                        activeSession.totalOnlineMinutes = durationMinutes;
                        activeSession.status = 'completed';
                        await activeSession.save();

                        await AstrologerDailyStat.findOneAndUpdate(
                            { astrologerId: updatedAstro._id, date: today },
                            { $inc: { onlineDurationMinutes: durationMinutes, onlineDurationSeconds: durationSeconds } },
                            { upsert: true, new: true }
                        );
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            user: {
                isOnline: user.isOnline === true,
                isChatOnline: finalIsChatOnline,
                isVoiceOnline: finalIsVoiceOnline,
                isVideoOnline: finalIsVideoOnline,
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

        if (updates.displayName && !updates.name) {
            updates.name = updates.displayName;
        }

        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'astrologer') {
            const astrologerUpdates = {};
            if (updates.name) astrologerUpdates.displayName = updates.name;
            if (updates.displayName) astrologerUpdates.displayName = updates.displayName;
            if (updates.bio) astrologerUpdates.bio = updates.bio;
            if (updates.profileImage || user.profileImage) astrologerUpdates.image = updates.profileImage || user.profileImage;
            
            if (updates.chatPrice !== undefined) astrologerUpdates['charges.chatPerMinute'] = updates.chatPrice;
            if (updates.callPrice !== undefined) astrologerUpdates['charges.callPerMinute'] = updates.callPrice;
            if (updates.videoPrice !== undefined) astrologerUpdates['charges.videoPerMinute'] = updates.videoPrice;
            
            await Astrologer.findOneAndUpdate(
                { userId: userId },
                { $set: astrologerUpdates }
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

exports.saveFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ success: false, message: 'Token is required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.fcmTokens) user.fcmTokens = [];
        if (!user.fcmTokens.includes(fcmToken)) {
            user.fcmTokens.push(fcmToken);
            await user.save();
        }

        res.status(200).json({ success: true, message: 'FCM Token registered successfully' });
    } catch (error) {
        console.error('Save FCM Token Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.removeFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ success: false, message: 'Token is required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.fcmTokens && user.fcmTokens.includes(fcmToken)) {
            user.fcmTokens = user.fcmTokens.filter(t => t !== fcmToken);
            await user.save();
        }

        res.status(200).json({ success: true, message: 'FCM Token removed successfully' });
    } catch (error) {
        console.error('Remove FCM Token Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.toggleFollow = async (req, res) => {
    try {
        const { astrologerId } = req.params;
        const user = await User.findById(req.user.id);
        
        const Astrologer = require('../models/Astrologer');
        const astrologer = await Astrologer.findById(astrologerId);
        
        if (!astrologer) {
            return res.status(404).json({ success: false, message: 'Astrologer not found' });
        }

        const isFollowing = user.following.some(id => id.toString() === astrologerId.toString());

        if (isFollowing) {
            user.following = user.following.filter(id => id.toString() !== astrologerId.toString());
            astrologer.followersCount = Math.max(0, astrologer.followersCount - 1);
        } else {
            if (!user.following.some(id => id.toString() === astrologerId.toString())) {
                user.following.push(astrologerId);
                astrologer.followersCount += 1;
            }
        }

        await user.save();
        await astrologer.save();

        // Emit socket event so Astrologer Dashboard and User Profile pages update immediately
        const io = req.app.get('io');
        if (io) {
            io.emit('astrologer_follower_update', {
                astrologerId: astrologer._id.toString(),
                followersCount: astrologer.followersCount
            });
        }

        res.status(200).json({ success: true, isFollowing: !isFollowing });
    } catch (error) {
        console.error('Toggle Follow Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'following',
            populate: { path: 'userId', select: 'name profileImage email' }
        });
        
        res.status(200).json({ success: true, following: user.following });
    } catch (error) {
        console.error('Get Following Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.incrementWarning = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { type } = req.body;

        user.warningCount = (user.warningCount || 0) + 1;
        
        if (!user.violationDetails) {
            user.violationDetails = { phone: 0, email: 0, abusive: 0 };
        }
        if (type === 'phone') user.violationDetails.phone = (user.violationDetails.phone || 0) + 1;
        if (type === 'email') user.violationDetails.email = (user.violationDetails.email || 0) + 1;
        if (type === 'abusive') user.violationDetails.abusive = (user.violationDetails.abusive || 0) + 1;

        await user.save();

        res.json({ success: true, warningCount: user.warningCount, violationDetails: user.violationDetails });
    } catch (error) {
        console.error('Increment User Warning Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteMyAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Overwrite PII for soft deletion
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
            const astro = await Astrologer.findOne({ userId });
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

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete My Account Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
