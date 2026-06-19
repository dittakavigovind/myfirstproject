const cron = require('node-cron');
const Astrologer = require('../models/Astrologer');
const AstrologerPayout = require('../models/AstrologerPayout');
const mongoose = require('mongoose');

const generatePayouts = async () => {
    console.log(`[Payout Cron] Starting payout generation for cycle...`);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find all 'on_hold' payouts and mark them as 'cancelled' so they roll over
        await AstrologerPayout.updateMany(
            { status: 'on_hold' },
            { 
                $set: { 
                    status: 'cancelled', 
                    adminRemarks: 'Automatically cancelled and merged into next cycle.' 
                } 
            },
            { session }
        );

        // 2. Find all astrologers with wallet balance > 300
        const eligibleAstrologers = await Astrologer.find({ 
            walletBalance: { $gt: 300 }, 
            isActive: true 
        }).populate('userId').select('+walletBalance').session(session);
        
        if (eligibleAstrologers.length === 0) {
            console.log(`[Payout Cron] No eligible astrologers found for this cycle.`);
            await session.commitTransaction();
            session.endSession();
            return;
        }

        const now = new Date();
        // Determine cycle dates based on current day
        let cycleStartDate, cycleEndDate;
        const day = now.getDate();
        const month = now.getMonth();
        const year = now.getFullYear();

        if (day >= 5 && day < 20) {
            // Cycle generated on 5th: covers up to 4th
            cycleEndDate = new Date(year, month, 4, 23, 59, 59, 999);
            // approximate previous 20th
            cycleStartDate = new Date(year, month - 1, 20, 0, 0, 0, 0); 
        } else {
            // Generated on 20th: covers 5th to 19th
            cycleEndDate = new Date(year, month, 19, 23, 59, 59, 999);
            cycleStartDate = new Date(year, month, 5, 0, 0, 0, 0);
        }

        const payoutsToCreate = [];

        for (const astro of eligibleAstrologers) {
            const grossAmount = astro.walletBalance - 300;
            if (grossAmount <= 0) continue;

            const tdsPercentage = astro.userId?.tdsPercentage !== undefined ? astro.userId.tdsPercentage : 10;
            const pgPercentage = astro.userId?.pgPercentage !== undefined ? astro.userId.pgPercentage : 2.5;

            const tdsAmount = (grossAmount * tdsPercentage) / 100;
            const pgAmount = (grossAmount * pgPercentage) / 100;
            const netPayableAmount = grossAmount - tdsAmount - pgAmount;

            payoutsToCreate.push({
                astrologerId: astro._id,
                amount: netPayableAmount, // For legacy compatibility
                grossAmount: grossAmount,
                tdsPercentage: tdsPercentage,
                tdsAmount: tdsAmount,
                pgPercentage: pgPercentage,
                pgAmount: pgAmount,
                netPayableAmount: netPayableAmount,
                status: 'pending',
                cycleStartDate: cycleStartDate,
                cycleEndDate: cycleEndDate,
            });
        }

        if (payoutsToCreate.length > 0) {
            await AstrologerPayout.insertMany(payoutsToCreate, { session });
            console.log(`[Payout Cron] Generated ${payoutsToCreate.length} pending payouts.`);
        }

        await session.commitTransaction();
    } catch (error) {
        console.error(`[Payout Cron] Error generating payouts:`, error);
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
};

const initPayoutCron = () => {
    // Runs at 00:01 on the 5th and 20th of every month
    cron.schedule('1 0 5,20 * *', generatePayouts);
    console.log('[Cron] Astrologer Payout Cron initialized (runs 5th & 20th at 00:01)');
};

module.exports = { initPayoutCron, generatePayouts };
