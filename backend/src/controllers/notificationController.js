const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create and Broadcast Notification (Admin Only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res) => {
    try {
        const { title, message, targetAudience, targetUsers, actionLink } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        const notification = await Notification.create({
            title,
            message,
            targetAudience: targetAudience || 'all',
            targetUsers: targetUsers || [],
            actionLink,
            sender: req.user._id,
            isPushDispatched: false // Will update below if successful
        });

        // -----------------------------------------------------
        // FIREBASE CLOUD MESSAGING (FCM) INTEGRATION
        // -----------------------------------------------------
        const adminFirebase = require('../config/firebase');
        let pushSentCount = 0;
        let pushDispatched = false;

        if (adminFirebase && adminFirebase.apps.length > 0) {
            try {
                const messagePayload = {
                    notification: {
                        title: title,
                        body: message
                    },
                    data: {
                        actionLink: actionLink || '',
                        notifId: notification._id.toString()
                    }
                };

                let userQuery = {};
                if (targetAudience === 'users') userQuery.role = 'user';
                if (targetAudience === 'astrologers') userQuery.role = 'astrologer';
                if (targetAudience === 'specific' && Array.isArray(targetUsers) && targetUsers.length > 0) {
                    userQuery._id = { $in: targetUsers };
                }

                // Gather all active hardware tokens for the target audience
                const users = await User.find(userQuery).select('fcmTokens');
                let tokens = [];
                users.forEach(u => {
                    if (u.fcmTokens && u.fcmTokens.length > 0) {
                        tokens.push(...u.fcmTokens);
                    }
                });

                if (tokens.length > 0) {
                    messagePayload.tokens = tokens;
                    // Chunk tokens if there are more than 500 (FCM limit)
                    if (tokens.length <= 500) {
                        await adminFirebase.messaging().sendEachForMulticast(messagePayload);
                    } else {
                        for (let i = 0; i < tokens.length; i += 500) {
                            const chunk = tokens.slice(i, i + 500);
                            await adminFirebase.messaging().sendEachForMulticast({ ...messagePayload, tokens: chunk });
                        }
                    }
                    pushSentCount = tokens.length;
                    pushDispatched = true;
                }

                if (pushDispatched) {
                    notification.isPushDispatched = true;
                    await notification.save();
                    console.log(`FCM Payload Dispatched (Tokens: ${pushSentCount})`);
                }

            } catch (fcmError) {
                console.error('FCM Dispatch Error:', fcmError);
                // We don't fail the request, we just log it. The in-app notification still saved.
            }
        }

        // For now, if socket.io is active, we can emit realistically to connected clients
        const io = req.app.get('io');
        if (io) {
            if (targetAudience === 'all') {
                io.emit('new_announcement', notification);
            } else if (targetAudience === 'astrologers') {
                io.to('astrologers_room').emit('new_announcement', notification); // Assuming rooms are used
            } else if (targetAudience === 'users') {
                io.to('users_room').emit('new_announcement', notification);
            } else if (targetAudience === 'specific' && Array.isArray(targetUsers)) {
                targetUsers.forEach(userId => {
                    io.to(userId.toString()).emit('new_announcement', notification);
                });
            }
        }

        res.status(201).json({ success: true, notification, message: 'Notification broadcasted successfully' });
    } catch (error) {
        console.error('Create Notification Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Notifications for Logged In User
// @route   GET /api/notifications/my
// @access  Private
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role; // 'user', 'astrologer', 'admin'

        // Build the OR query based on Audience type
        const query = {
            $or: [
                { targetAudience: 'all' },
                { targetAudience: role === 'astrologer' ? 'astrologers' : 'users' },
                { targetAudience: 'specific', targetUsers: userId }
            ]
        };

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 for performance

        // Compute unread count on the fly
        const unreadCount = notifications.filter(n => !n.readBy.includes(userId)).length;

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error('Get My Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Add user to readBy array if not already there
        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('Mark Notification Read Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get All Notifications (Admin Dashboard)
// @route   GET /api/notifications
// @access  Private/Admin
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('sender', 'name email')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Get All Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete Notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
