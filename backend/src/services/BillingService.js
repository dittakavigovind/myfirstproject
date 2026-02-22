const mongoose = require('mongoose');
const AstrologerSession = require('../models/AstrologerSession');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const AstrologerEvent = require('../models/AstrologerEvent');

class BillingService {

    /**
     * Start a new billing session.
     * Called when the session is authorized or initiated.
     */
    static async initiateSession(astrologerId, userId, type, ratePerMinute, agoraChannelId) {
        const session = await AstrologerSession.create({
            astrologerId,
            userId,
            agoraChannelId,
            type,
            ratePerMinute,
            status: 'initiated',
            startTime: new Date()
        });

        // Log Event
        await AstrologerEvent.create({
            astrologerId,
            sessionId: session._id,
            eventType: 'call_started',
            metadata: { type, rate: ratePerMinute }
        });

        return session;
    }

    /**
     * Handle Astrologer Joint Event (BILLING STARTS)
     */
    static async startBilling(agoraChannelId) {
        const session = await AstrologerSession.findOne({ agoraChannelId });
        if (!session) {
            console.error(`Session not found for channel: ${agoraChannelId}`);
            return null;
        }

        if (session.astrologerJoinTime) {
            // Already joined, maybe a reconnect. Ignore to preserve original start time? 
            // OR if strict "pay as you go", we might handle pauses. 
            // Astrotalk rules usually: once joined, billing runs. 
            return session;
        }

        session.astrologerJoinTime = new Date();
        session.status = 'active';
        await session.save();

        await AstrologerEvent.create({
            astrologerId: session.astrologerId,
            sessionId: session._id,
            eventType: 'astro_joined',
            timestamp: session.astrologerJoinTime
        });

        console.log(`[Billing] Started for Session ${session._id} at ${session.astrologerJoinTime}`);
        return session;
    }

    /**
     * End Session and Process Payment
     * Triggered by Disconnect (User/Astro) or Exhaustion
     */
    static async endSession(agoraChannelId, reason = 'unknown') {
        const session = await AstrologerSession.findOne({ agoraChannelId });
        if (!session || session.status === 'completed') {
            return null; // Already processed
        }

        const endTime = new Date();
        session.endTime = endTime;
        session.status = 'completed';
        session.endReason = reason;

        // Determine effective leave time for billing
        // If Astro never joined, request is missed
        if (!session.astrologerJoinTime) {
            session.status = 'missed';
            await session.save();
            await AstrologerEvent.create({
                astrologerId: session.astrologerId,
                sessionId: session._id,
                eventType: 'call_missed'
            });
            return session;
        }

        // Logic: Billing ends when the first person leaves (User or Astro)
        // In simple webhook flow, this function is called when *someone* leaves.
        // We use the current time as the cut-off.

        // Calculate Duration
        const durationMs = endTime.getTime() - session.astrologerJoinTime.getTime();
        const durationSeconds = Math.max(0, Math.floor(durationMs / 1000));

        session.astrologerLeaveTime = endTime; // Effectively
        session.durationInSeconds = durationSeconds;

        // Billing Calculation: CEIL(seconds / 60)
        const billableMinutes = Math.ceil(durationSeconds / 60);
        session.billableMinutes = billableMinutes;

        const grossAmount = billableMinutes * session.ratePerMinute;
        session.deductionAmount = grossAmount;

        // Commission Logic
        const astro = await Astrologer.findById(session.astrologerId);
        const commissionRate = astro.commissionRate || 20;

        const platformFee = (grossAmount * commissionRate) / 100;
        const netEarnings = grossAmount - platformFee;

        session.platformFee = platformFee;
        session.astrologerEarnings = netEarnings;

        // --- ATOMIC TRANSACTION START ---
        const sessionMongo = await mongoose.startSession();
        sessionMongo.startTransaction();

        try {
            // 1. Deduct from User
            const userUpdate = await User.findByIdAndUpdate(
                session.userId,
                { $inc: { walletBalance: -grossAmount } },
                { new: true, session: sessionMongo }
            );

            if (userUpdate.walletBalance < 0) {
                // Edge Case: User ran out of money mid-call (or race condition)
                // In a perfect system, 'force disconnect' happens earlier.
                // Here we record it. Platform might eat the dust or user goes negative.
                // Keeping negative allowed for tracking debt, or cap at 0 and adjust earnings?
                // Astrotalk usually forces disconnect. Let's record as is.
            }

            // 2. Credit Astrologer
            await Astrologer.findByIdAndUpdate(
                session.astrologerId,
                {
                    $inc: {
                        totalEarnings: netEarnings,
                        walletBalance: netEarnings
                    }
                },
                { session: sessionMongo }
            );

            // 3. Save Session
            await session.save({ session: sessionMongo });

            await sessionMongo.commitTransaction();

            console.log(`[Billing] Completed Session ${session._id}. Duration: ${durationSeconds}s, Billed: ${grossAmount}`);
        } catch (error) {
            await sessionMongo.abortTransaction();
            console.error('[Billing] Transaction Failed:', error);
            // Re-throw or handle gracefully (e.g., mark session as 'processing_failed')
            session.status = 'failed';
            await session.save();
        } finally {
            sessionMongo.endSession();
        }
        // --- ATOMIC TRANSACTION END ---

        // Log Event
        await AstrologerEvent.create({
            astrologerId: session.astrologerId,
            sessionId: session._id,
            eventType: 'call_ended',
            metadata: {
                durationSeconds,
                billableMinutes,
                reason,
                grossAmount
            }
        });

        return session;
    }

    /**
     * Calculate Max Duration user can afford
     */
    static calculateMaxDuration(walletBalance, ratePerMinute) {
        if (ratePerMinute <= 0) return 3600; // Free/Test (cap at 1 hr)
        const maxMinutes = Math.floor(walletBalance / ratePerMinute);
        return maxMinutes * 60; // Returns seconds
    }
}

module.exports = BillingService;
