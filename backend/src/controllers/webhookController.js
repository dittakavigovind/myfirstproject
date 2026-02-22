const BillingService = require('../services/BillingService');
const crypto = require('crypto');

/**
 * Agora NCS Webhook Handler
 * Documentation: https://docs.agora.io/en/Agora%20Platform/ncs_webhook
 */
exports.handleAgoraWebhook = async (req, res) => {
    try {
        const signature = req.headers['agora-signature'];
        const body = req.body;

        // TODO: Validate Signature in Production
        // const isValid = verifyAgoraSignature(signature, body);
        // if (!isValid) return res.status(401).send('Invalid Signature');

        console.log('[Agora Webhook]', JSON.stringify(body));

        const { noticeId, productId, eventType, payload } = body;
        const { channelName, uid } = payload;

        // Agora UIDs are integers. We need to map them to Role/User if possible.
        // Convention: Astrologer UID might be specific, or we look up session by Channel Name.
        // Assuming Channel Name == Unique Session ID or contains it.

        switch (eventType) {
            case 103: // Broadcaster Joined Channel
                // In 1-on-1, Astrologer is usually a Broadcaster
                console.log(`[Agora] Broadcaster ${uid} joined channel ${channelName}`);
                await BillingService.startBilling(channelName);
                break;

            case 104: // Broadcaster Left Channel
                console.log(`[Agora] Broadcaster ${uid} left channel ${channelName}`);
                // If it was the Astrologer, end session
                // We treat any broadcaster leaving as a potential end trigger in 1-on-1
                await BillingService.endSession(channelName, 'astro_left');
                break;

            case 106: // Audience Left Channel (User)
                // If the user was audience
                console.log(`[Agora] User (Audience) ${uid} left channel ${channelName}`);
                await BillingService.endSession(channelName, 'user_left');
                break;

            case 105: // Audience Joined
                // Optional: Log user join time for analytics
                break;

            default:
            // console.log('Unhandled Event:', eventType);
        }

        res.status(200).json({ msg: 'Received' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Server Error');
    }
};
