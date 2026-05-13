const mongoose = require('mongoose');
const Session = require('../models/Session');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const AstrologerEvent = require('../models/AstrologerEvent');
const PricingConfig = require('../models/PricingConfig');
const WalletService = require('./walletService');

class BillingService {

    /**
     * Start a new billing session.
     * Called when the session is authorized or initiated.
     */
    static async initiateSession(astrologerId, userId, sessionType, pricePerMinute, agoraChannelId) {
        const session = await Session.create({
            astrologerId,
            userId,
            agoraChannelId,
            sessionType,
            pricePerMinute,
            status: 'initiated',
            startTime: new Date()
        });

        // Log Event
        await AstrologerEvent.create({
            astrologerId,
            sessionId: session._id,
            eventType: 'call_started',
            metadata: { sessionType, rate: pricePerMinute }
        });

        return session;
    }

    /**
     * Handle Astrologer Joint Event (BILLING STARTS)
     */
    static async startBilling(agoraChannelId) {
        const session = await Session.findOne({ agoraChannelId });
        if (!session) {
            console.error(`Session not found for channel: ${agoraChannelId}`);
            return null;
        }

        if (session.startTime && session.status === 'active') {
            return session;
        }

        session.startTime = new Date();
        session.status = 'active';
        await session.save();

        await AstrologerEvent.create({
            astrologerId: session.astrologerId,
            sessionId: session._id,
            eventType: 'astro_joined',
            timestamp: session.startTime
        });

        console.log(`[Billing] Started for Session ${session._id} at ${session.startTime}`);
        return session;
    }

    /**
     * End Session and Process Payment using WalletService per-second accuracy
     */
    static async endSession(agoraChannelId, reason = 'unknown') {
        const session = await Session.findOne({ agoraChannelId });
        if (!session || session.status === 'completed') {
            return null; // Already processed
        }

        const endTime = new Date();
        session.endTime = endTime;
        session.status = 'completed';

        // Waitlist logic if Astro never joined
        if (!session.startTime) {
            session.status = 'failed';
            await session.save();
            await AstrologerEvent.create({
                astrologerId: session.astrologerId,
                sessionId: session._id,
                eventType: 'call_missed'
            });
            return session;
        }

        // Calculate Duration in seconds precisely
        const durationMs = endTime.getTime() - session.startTime.getTime();
        const durationSeconds = Math.max(0, Math.floor(durationMs / 1000));
        
        session.totalDuration = durationSeconds;

        // Billing Calculation: EXACT PER-SECOND BILLING
        const ratePerSecond = session.pricePerMinute / 60;
        const exactCost = durationSeconds * ratePerSecond;
        const netDeduction = parseFloat(exactCost.toFixed(2));

        session.totalAmountDeducted = netDeduction;

        // Commission Logic
        const astro = await Astrologer.findById(session.astrologerId);
        let platformFeePercentage = 40; // Hard default
        
        // Fetch Global Config
        const pConfig = await PricingConfig.findOne();
        if (pConfig && pConfig.globalRates && pConfig.globalRates.globalPlatformFee !== undefined) {
            platformFeePercentage = pConfig.globalRates.globalPlatformFee;
        }

        // Apply Astrologer Specific Override if differing from default 20/0
        // If an astrologer has a specific negotiated rate stored, we override the global default
        if (astro.commissionRate !== undefined && astro.commissionRate !== null) {
            platformFeePercentage = astro.commissionRate;
        }

        const platformFee = (netDeduction * platformFeePercentage) / 100;
        const netEarnings = netDeduction - platformFee;

        // Save session final state
        await session.save();

        if (netDeduction > 0) {
            try {
                // Deduct from User via WalletService
                await WalletService.deductBalance(
                    session.userId, 
                    netDeduction, 
                    `${session.sessionType} session with ${astro.name}`,
                    session._id,
                    'Session'
                );

                // Credit Astrologer
                await Astrologer.findByIdAndUpdate(
                    session.astrologerId,
                    {
                        $inc: {
                            totalEarnings: netEarnings,
                            walletBalance: netEarnings
                        }
                    }
                );
                
                console.log(`[Billing] Completed Session ${session._id}. Duration: ${durationSeconds}s, Billed: ₹${netDeduction}`);
            } catch (error) {
                console.error('[Billing] Wallet deduction failed:', error);
            }
        }

        // Log Event
        await AstrologerEvent.create({
            astrologerId: session.astrologerId,
            sessionId: session._id,
            eventType: 'call_ended',
            metadata: {
                durationSeconds,
                reason,
                grossAmount: netDeduction
            }
        });

        return session;
    }

    /**
     * Calculate Max Duration user can afford locally (for UI timers)
     */
    static calculateMaxDuration(walletBalance, ratePerMinute) {
        if (ratePerMinute <= 0) return 3600; // Cap at 1 hr for free
        const ratePerSecond = ratePerMinute / 60;
        return Math.floor(walletBalance / ratePerSecond); // Returns exact affordable seconds
    }
}

module.exports = BillingService;
