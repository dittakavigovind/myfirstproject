const Astrologer = require('../models/Astrologer');
const AstrologerOnlineSession = require('../models/AstrologerOnlineSession');
const AstrologerDailyStat = require('../models/AstrologerDailyStat');
const AstrologerSession = require('../models/AstrologerSession');

// Helper to get today's midnight date
const getTodayDate = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Toggle Online Status
 * POST /api/activity/status/toggle
 * Body: { isOnline: boolean }
 */
exports.toggleOnlineStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        const astrologerId = req.user.astrologerId || astrologer?._id;

        console.log(`[TOGGLE] User: ${req.user.id}, AstrologerId: ${astrologerId}, Action: ${isOnline ? 'Online' : 'Offline'}`);

        if (!astrologerId) {
            return res.status(404).json({ message: 'Astrologer profile not found' });
        }

        // 1. Update Astrologer Profile
        await Astrologer.findByIdAndUpdate(astrologerId, {
            isOnline,
            lastOnlineAt: isOnline ? new Date() : undefined
        });

        // 1b. Update User Profile (Critical for userController logic)
        const User = require('../models/User'); // Ensure imported if not already at top, or use mongoose.model
        await User.findByIdAndUpdate(req.user.id, {
            isOnline,
            lastOnlineAt: isOnline ? new Date() : undefined
        });

        const today = getTodayDate();

        if (isOnline) {
            // GOING ONLINE: Create new active session
            // Close any existing open sessions first to be safe (prevent duplicates)
            await AstrologerOnlineSession.updateMany(
                { astrologerId, status: 'active' },
                {
                    $set: {
                        status: 'auto_closed',
                        logoutTime: new Date()
                        // Logic to calculate minutes for auto_closed ones? 
                        // For now let's just close them. Ideally we calculate diff.
                    }
                }
            );

            await AstrologerOnlineSession.create({
                astrologerId,
                loginTime: new Date(),
                status: 'active',
                sessionDate: today
            });

        } else {
            // GOING OFFLINE: Close active session
            const activeSession = await AstrologerOnlineSession.findOne({
                astrologerId,
                status: 'active'
            });

            if (activeSession) {
                const logoutTime = new Date();
                const durationMs = logoutTime - activeSession.loginTime;
                const durationMinutes = Math.floor(durationMs / 60000); // Minutes
                const durationSeconds = Math.floor(durationMs / 1000); // Seconds

                activeSession.logoutTime = logoutTime;
                activeSession.totalOnlineMinutes = durationMinutes;
                activeSession.status = 'completed';
                await activeSession.save();

                // Calculate Session Earnings
                let sessionEarnings = 0;
                const durationMin = durationMinutes + (durationSeconds % 60) / 60; // meaningful fraction

                // Use rates from the active session snapshot
                if (activeSession.servicesUsed.includes('chat')) sessionEarnings += durationMin * (activeSession.chatRate || 0);
                if (activeSession.servicesUsed.includes('voice')) sessionEarnings += durationMin * (activeSession.voiceRate || 0);
                if (activeSession.servicesUsed.includes('video')) sessionEarnings += durationMin * (activeSession.videoRate || 0);

                sessionEarnings = Math.floor(sessionEarnings * 100) / 100;

                // Update Daily Stats
                await AstrologerDailyStat.findOneAndUpdate(
                    { astrologerId, date: today },
                    {
                        $inc: {
                            onlineDurationMinutes: durationMinutes,
                            onlineDurationSeconds: durationSeconds,
                            totalNetEarnings: sessionEarnings
                        },
                        $set: {
                            totalSessions: (await AstrologerSession.countDocuments({ astrologerId, sessionDate: activeSession.sessionDate }))
                        }
                    },
                    { upsert: true, new: true }
                );
            }
        }

        res.json({ success: true, isOnline });

    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Dashboard Stats (Live)
 * GET /api/activity/stats/dashboard
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const astrologer = await Astrologer.findOne({ userId: req.user.id });

        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer profile not found' });
        }

        const astrologerId = astrologer._id;

        // Construct Date String DD/MM/YYYY
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

        // 1. Get Today's Sessions (for history stats)
        const sessions = await AstrologerSession.find({
            astrologerId,
            sessionDate: dateStr
        });

        // 2. Get Active Session (Separate query to ensure we catch it even if date differs)
        const activeSession = await AstrologerSession.findOne({
            astrologerId,
            endTime: { $exists: false }
        });

        // 3. Calculate History (Completed sessions today)
        // duration is stored in seconds in AstrologerSession
        const historySeconds = sessions
            .filter(s => s.endTime) // Only completed ones
            .reduce((acc, curr) => acc + (curr.duration || 0), 0);

        // 3. Calculate Current Session Duration
        let currentSessionSeconds = 0;
        if (activeSession) {
            const nowTime = new Date().getTime();
            const startTime = new Date(activeSession.startTime).getTime();
            currentSessionSeconds = Math.floor((nowTime - startTime) / 1000);
        }

        const totalOnlineSeconds = historySeconds + currentSessionSeconds;
        const totalOnlineMinutes = Math.floor(totalOnlineSeconds / 60);

        // 4. Calculate Service Breakdown (approximate based on session config)
        // If a session had multiple services, we count it for all? 
        // Or do we split? The schema has `servicesUsed: [String]`.
        // For simplicity: if a session is 10 mins and services=['chat', 'voice'], 
        // usually that means they were available for both. 
        // We will sum durations for each service type independently.

        const calculateServiceDuration = (serviceName) => {
            let seconds = 0;
            // Completed sessions
            seconds += sessions
                .filter(s => s.endTime && s.servicesUsed.includes(serviceName))
                .reduce((acc, s) => acc + (s.duration || 0), 0);

            // Active session
            if (activeSession && activeSession.servicesUsed.includes(serviceName)) {
                seconds += currentSessionSeconds;
            }
            return Math.floor(seconds / 60); // Minutes
        };

        const chatMinutes = calculateServiceDuration('chat');
        const voiceMinutes = calculateServiceDuration('voice');
        const videoMinutes = calculateServiceDuration('video');

        const calculateEarnings = () => {
            let totalEarnings = 0;

            // 1. Completed Sessions
            sessions.forEach(s => {
                const durationMinutes = (s.duration || 0) / 60;
                // If multiple services were used, we assume simultaneous availability? 
                // Or max rate? Let's assume sum for now based on user request "session-based price... consistently".
                // If it's availability, we sum up if they enabled multiple.
                if (s.servicesUsed.includes('chat')) totalEarnings += durationMinutes * (s.chatRate || 0);
                if (s.servicesUsed.includes('voice')) totalEarnings += durationMinutes * (s.voiceRate || 0);
                if (s.servicesUsed.includes('video')) totalEarnings += durationMinutes * (s.videoRate || 0);
            });

            // 2. Active Session
            if (activeSession) {
                const currentDurationMinutes = currentSessionSeconds / 60;
                if (activeSession.servicesUsed.includes('chat')) totalEarnings += currentDurationMinutes * (activeSession.chatRate || 0);
                if (activeSession.servicesUsed.includes('voice')) totalEarnings += currentDurationMinutes * (activeSession.voiceRate || 0);
                if (activeSession.servicesUsed.includes('video')) totalEarnings += currentDurationMinutes * (activeSession.videoRate || 0);
            }

            return Math.floor(totalEarnings * 100) / 100; // Round to 2 decimals
        };

        console.log(`[STATS DEBUG] Fetching stats for Astro ID: ${astrologerId}`);
        console.log(`[STATS DEBUG] Flags from DB -> Chat: ${astrologer.isChatOnline}, Voice: ${astrologer.isVoiceOnline}, Video: ${astrologer.isVideoOnline}`);
        console.log(`[STATS DEBUG] Active Session Found: ${!!activeSession}`);

        res.json({
            success: true,
            data: {
                isOnline: !!activeSession,
                isChatOnline: astrologer.isChatOnline || false,
                isVoiceOnline: astrologer.isVoiceOnline || false,
                isVideoOnline: astrologer.isVideoOnline || false,
                // Fallback to astrologer profile flags if needed, but session is truth

                lastOnlineAt: activeSession?.startTime || null,

                historyOnlineSeconds: historySeconds,
                totalOnlineSeconds: totalOnlineSeconds,
                totalOnlineMinutes: totalOnlineMinutes, // Backup

                chatMinutes,
                voiceMinutes,
                videoMinutes,

                earnings: calculateEarnings(),
                callsCount: 0,
                chatsCount: 0
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Admin Activity Report
 * GET /api/activity/reports/admin
 * Query: from, to, astrologerId
 */
exports.getAdminActivityReport = async (req, res) => {
    try {
        const { from, to, astrologerId } = req.query;

        let query = {};
        if (astrologerId) query.astrologerId = astrologerId;

        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }

        const reports = await AstrologerDailyStat.find(query)
            .populate('astrologerId', 'displayName email mobile')
            .sort({ date: -1 });

        res.json({ success: true, data: reports });

    } catch (error) {
        console.error('Admin Report Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
