const AstrologerSession = require('../models/AstrologerSession');
const AstrologerDailyStat = require('../models/AstrologerDailyStat');
const mongoose = require('mongoose');

class AnalyticsService {

    /**
     * Run nightly to aggregate stats for a specific date (or today).
     */
    static async aggregateDailyStats(date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all sessions for today to calculate in memory (complex logic harder in pure mongo 4.x)
        const sessions = await AstrologerSession.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            endTime: { $exists: true } // Only completed sessions
        });

        const statsMap = {};

        sessions.forEach(session => {
            const aid = session.astrologerId.toString();
            if (!statsMap[aid]) {
                statsMap[aid] = {
                    totalSessions: 0,
                    successfulSessions: 0, // Assuming all completed with duration > 0 are successful
                    totalDurationMinutes: 0,
                    totalEarnings: 0
                };
            }

            const durationMin = (session.duration || 0) / 60;
            if (durationMin > 0) {
                statsMap[aid].totalSessions += 1;
                statsMap[aid].successfulSessions += 1;
                statsMap[aid].totalDurationMinutes += durationMin;

                // Calculate Earnings
                let sessionEarnings = 0;
                if (session.servicesUsed.includes('chat')) sessionEarnings += durationMin * (session.chatRate || 0);
                if (session.servicesUsed.includes('voice')) sessionEarnings += durationMin * (session.voiceRate || 0);
                if (session.servicesUsed.includes('video')) sessionEarnings += durationMin * (session.videoRate || 0);

                statsMap[aid].totalEarnings += sessionEarnings;
            }
        });

        console.log(`[Analytics] Aggregating stats for ${Object.keys(statsMap).length} astrologers.`);

        for (const [astrologerId, stat] of Object.entries(statsMap)) {
            await AstrologerDailyStat.findOneAndUpdate(
                { astrologerId, date: startOfDay },
                {
                    totalSessions: stat.totalSessions,
                    successfulSessions: stat.successfulSessions,
                    totalDurationMinutes: Math.floor(stat.totalDurationMinutes),
                    totalNetEarnings: Math.floor(stat.totalEarnings * 100) / 100,
                    // Keep others as 0 for now if unused or calc properly
                    missedSessions: 0,
                    totalGrossRevenue: 0,
                    platformCommission: 0
                },
                { upsert: true, new: true }
            );
        }

        return statsMap;
    }

    /**
     * Get Stats for Dashboard
     */
    static async getAstrologerStats(astrologerId, startDate, endDate) {
        // Fetch daily stats within range
        const dailyStats = await AstrologerDailyStat.find({
            astrologerId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        // Fetch Lifetime (Robust: Match String OR ObjectId)
        const allStats = await AstrologerDailyStat.find({
            astrologerId: { $in: [astrologerId, new mongoose.Types.ObjectId(astrologerId)] }
        });


        const lifetime = allStats.reduce((acc, curr) => {
            acc.totalEarnings += (curr.totalNetEarnings || 0);
            acc.totalSessions += (curr.successfulSessions || 0);
            acc.totalDuration += (curr.totalDurationMinutes || 0);
            return acc;
        }, { totalEarnings: 0, totalSessions: 0, totalDuration: 0 });



        return {
            history: dailyStats,
            lifetime
        };
    }
}

module.exports = AnalyticsService;
