const cron = require('node-cron');
const User = require('../models/User');
const DailyHoroscope = require('../models/DailyHoroscope');
const adminFirebase = require('../config/firebase');
const moment = require('moment-timezone');

exports.initDailyHoroscopeCron = () => {
    // Run daily at 8:00 AM IST
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('[Daily Horoscope Cron] Starting daily horoscope push notifications...');
            
            // Get today's start and end in IST
            const now = moment().tz('Asia/Kolkata');
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();

            // Find today's daily horoscope
            const todayHoroscope = await DailyHoroscope.findOne({
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (!todayHoroscope) {
                console.log('[Daily Horoscope Cron] No horoscope found for today, skipping notifications.');
                return;
            }

            // Fetch users with fcmTokens
            const users = await User.find({
                fcmTokens: { $exists: true, $not: { $size: 0 } },
                // Exclude users who blocked notifications if we have such a flag, but we assume default is opt-in for this feature
            }).select('_id fcmTokens birthDetails.moonSign');

            if (!users || users.length === 0) {
                console.log('[Daily Horoscope Cron] No users with FCM tokens found.');
                return;
            }

            // Group users by moon sign for batch processing
            const usersBySign = {
                generic: []
            };

            const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
            signs.forEach(sign => usersBySign[sign] = []);

            users.forEach(user => {
                let sign = user.birthDetails?.moonSign?.toLowerCase();
                if (sign && signs.includes(sign)) {
                    usersBySign[sign].push(user);
                } else {
                    usersBySign.generic.push(user);
                }
            });

            const { getApps } = require('firebase-admin/app');
            const { getMessaging } = require('firebase-admin/messaging');

            if (getApps().length === 0) {
                console.warn('[Daily Horoscope Cron] Firebase admin not initialized, skipped push notifications.');
                return;
            }

            const messaging = getMessaging();
            let totalSent = 0;

            // Process each group
            for (const [sign, signUsers] of Object.entries(usersBySign)) {
                if (signUsers.length === 0) continue;

                // Collect tokens for this group
                let tokens = [];
                signUsers.forEach(u => {
                    if (u.fcmTokens && u.fcmTokens.length > 0) {
                        tokens.push(...u.fcmTokens);
                    }
                });

                if (tokens.length === 0) continue;

                // Deduplicate tokens
                tokens = [...new Set(tokens)];

                let title = "Your Daily Horoscope is Ready! 🌟";
                let body = "Check what the stars have aligned for you today!";
                
                if (sign !== 'generic' && todayHoroscope.signs && todayHoroscope.signs[sign] && todayHoroscope.signs[sign].prediction) {
                    const prediction = todayHoroscope.signs[sign].prediction;
                    // Truncate prediction for the notification body (around 100 chars)
                    body = prediction.length > 100 ? prediction.substring(0, 100) + '...' : prediction;
                    title = `${sign.charAt(0).toUpperCase() + sign.slice(1)} Daily Horoscope ✨`;
                }

                const messagePayload = {
                    notification: {
                        title: title,
                        body: body
                    },
                    data: {
                        type: 'daily_horoscope',
                        actionLink: '/horoscope'
                    }
                };

                // Chunk tokens if more than 500
                if (tokens.length <= 500) {
                    await messaging.sendEachForMulticast({ ...messagePayload, tokens });
                } else {
                    for (let i = 0; i < tokens.length; i += 500) {
                        const chunk = tokens.slice(i, i + 500);
                        await messaging.sendEachForMulticast({ ...messagePayload, tokens: chunk });
                    }
                }
                
                totalSent += tokens.length;
            }

            console.log(`[Daily Horoscope Cron] Sent daily horoscope notifications to ${totalSent} devices.`);

        } catch (error) {
            console.error('[Daily Horoscope Cron] General Error:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};
