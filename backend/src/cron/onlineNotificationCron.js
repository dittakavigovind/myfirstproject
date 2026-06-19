const cron = require('node-cron');
const Astrologer = require('../models/Astrologer');
const User = require('../models/User');
const Session = require('../models/Session');
const adminFirebase = require('../config/firebase');

exports.initOnlineNotificationCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Find astrologers who:
            // 1. Are currently online
            // 2. Have been online for at least 1 minute (lastOnlineAt <= oneMinuteAgo)
            // 3. Haven't had a notification sent in the last 2 hours (lastOnlineNotificationSentAt is null or < twoHoursAgo)
            const eligibleAstrologers = await Astrologer.find({
                isOnline: true,
                lastOnlineAt: { $lte: oneMinuteAgo },
                $or: [
                    { lastOnlineNotificationSentAt: { $exists: false } },
                    { lastOnlineNotificationSentAt: null },
                    { lastOnlineNotificationSentAt: { $lt: twoHoursAgo } }
                ]
            });

            if (eligibleAstrologers.length === 0) {
                return;
            }

            for (const astrologer of eligibleAstrologers) {
                try {
                    // 1. Find Followers
                    const followers = await User.find({ following: astrologer._id }).select('_id fcmTokens');
                    
                    // 2. Find Recent Clients (last 30 days)
                    const recentSessions = await Session.find({
                        astrologerId: astrologer._id,
                        createdAt: { $gte: thirtyDaysAgo }
                    }).distinct('userId');
                    
                    const recentClients = await User.find({ _id: { $in: recentSessions } }).select('_id fcmTokens');

                    // 3. Combine unique users and collect FCM tokens
                    const userMap = new Map();
                    followers.forEach(u => userMap.set(u._id.toString(), u));
                    recentClients.forEach(u => userMap.set(u._id.toString(), u));

                    const uniqueUsers = Array.from(userMap.values());
                    let tokens = [];

                    uniqueUsers.forEach(u => {
                        if (u.fcmTokens && u.fcmTokens.length > 0) {
                            tokens.push(...u.fcmTokens);
                        }
                    });

                    if (tokens.length > 0) {
                        // Deduplicate tokens
                        tokens = [...new Set(tokens)];

                        const messagePayload = {
                            notification: {
                                title: 'Good News!',
                                body: `${astrologer.displayName} is now online. Get guidance instantly!`
                            },
                            data: {
                                type: 'astrologer_online',
                                astrologerId: astrologer._id.toString(),
                                actionLink: `/astrologer/${astrologer.slug || astrologer._id}`
                            }
                        };

                        if (adminFirebase && adminFirebase.apps.length > 0) {
                            // Chunk tokens if more than 500
                            if (tokens.length <= 500) {
                                await adminFirebase.messaging().sendEachForMulticast({ ...messagePayload, tokens });
                            } else {
                                for (let i = 0; i < tokens.length; i += 500) {
                                    const chunk = tokens.slice(i, i + 500);
                                    await adminFirebase.messaging().sendEachForMulticast({ ...messagePayload, tokens: chunk });
                                }
                            }
                            console.log(`[Online Cron] Sent online notification for ${astrologer.displayName} to ${tokens.length} devices.`);
                        } else {
                            console.warn('[Online Cron] Firebase admin not initialized, skipped push notification.');
                        }
                    }

                    // 4. Update the astrologer's last notification time
                    astrologer.lastOnlineNotificationSentAt = new Date();
                    await astrologer.save();

                } catch (astroError) {
                    console.error(`[Online Cron] Error processing astrologer ${astrologer._id}:`, astroError);
                }
            }
        } catch (error) {
            console.error('[Online Cron] General Error:', error);
        }
    });
};
