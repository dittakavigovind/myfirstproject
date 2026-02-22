const { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = require('agora-access-token');

exports.generateAgoraToken = async (req, res) => {
    try {
        const { channelName, uid } = req.body;

        if (!channelName) {
            return res.status(400).json({ success: false, message: 'Channel name is required' });
        }

        const appID = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;

        if (!appID || !appCertificate) {
            return res.status(500).json({ success: false, message: 'Agora credentials missing' });
        }

        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = 3600; // 1 hour
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Generate RTC Token (Video/Audio)
        // If uid is 0, it works for any user, but better to be specific if possible.
        // UID can be 0 or integer. If using string userIds, use logic to map/hash them if needed, 
        // OR allow 0 for general access if your security allows. 
        // Assuming Way2Astro uses Mongodb ObjectIds which are strings, 
        // Agora RTC UIDs must be INTs (or you use string account method).
        // For simplicity, we create a numeric UID or generate a random one for the FE to handle, 
        // OR we use the string user account method (buildTokenWithAccount).

        // Using buildTokenWithAccount for String IDs (like Mongo IDs)
        const rtcToken = RtcTokenBuilder.buildTokenWithAccount(
            appID,
            appCertificate,
            channelName,
            uid || req.user.id, // Account
            role,
            privilegeExpiredTs
        );

        // Generate RTM Token (Chat/Signaling)
        const rtmToken = RtmTokenBuilder.buildToken(
            appID,
            appCertificate,
            uid || req.user.id,
            RtmRole.Rtm_User,
            privilegeExpiredTs
        );

        res.status(200).json({
            success: true,
            rtcToken,
            rtmToken,
            channelName,
            appID,
            uid: uid || req.user.id
        });

    } catch (error) {
        console.error('Agora Token Error:', error);
        res.status(500).json({ success: false, message: 'Token generation failed' });
    }
};
