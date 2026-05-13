const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');
const AppConfig = require('../models/AppConfig');

class WalletService {
    /**
     * Deduct specific amount from user wallet
     */
    static async deductBalance(userId, amount, description, referenceId = null, referenceModel = 'Session') {
        const user = await User.findById(userId);
        if (!user || user.walletBalance < amount) {
            throw new Error('Insufficient balance');
        }

        user.walletBalance -= amount;
        await user.save();

        const transaction = await Transaction.create({
            user: userId,
            amount,
            type: 'debit',
            status: 'success',
            description,
            referenceId,
            referenceModel
        });

        return { user, transaction };
    }

    /**
     * Check if user has sufficient balance for min required minutes
     * Defaults to 5 minutes at pricePerMinute rate if not restricted by AppConfig
     */
    static async validatePreSessionBalance(userId, pricePerMinute) {
        const user = await User.findById(userId);
        const config = await AppConfig.findOne().sort({ createdAt: -1 });
        
        const minReq = config ? config.minimumWalletBalance : (pricePerMinute * 5); // Fallback to 5 mins

        if (!user || user.walletBalance < minReq) {
            return {
                valid: false,
                reason: `Insufficient Balance. Minimum ₹${minReq} required to start the session.`,
                currentBalance: user ? user.walletBalance : 0
            };
        }

        return { valid: true, currentBalance: user.walletBalance };
    }

    /**
     * Auto-disconnect handler for when balance hits 0 or < perMinuteRate during a live call/chat.
     * This will be called via an interval loop per active session in the memory or via Redis TTLs.
     */
    static async processLiveDeduction(sessionId, durationInSeconds) {
        const session = await Session.findById(sessionId).populate('user');
        if (!session || session.status !== 'active') return null;

        const pricePerSecond = session.pricePerMinute / 60;
        const totalCost = (durationInSeconds - session.totalDuration) * pricePerSecond;

        if (totalCost <= 0) return session;

        const user = session.user;
        const config = await AppConfig.findOne().sort({ createdAt: -1 });
        const lowBalanceLevel = config ? config.lowBalanceThreshold : session.pricePerMinute * 2;

        let warning = false;
        let forceDisconnect = false;

        // Note: Real-time systems usually lock balance internally. 
        // Here we do a fast check, but rely on socket logic to halt the actual session.

        if (user.walletBalance - totalCost < session.pricePerMinute) {
            forceDisconnect = true; // Not enough for the next minute
        } else if (user.walletBalance - totalCost <= lowBalanceLevel) {
            warning = true;
        }

        // Apply deduction atomically
        // Mongoose $inc is atomic, avoiding race conditions
        await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: -totalCost } });
        
        session.totalAmountDeducted += totalCost;
        session.totalDuration = durationInSeconds; // store total processed so far
        await session.save();

        return { session, warning, forceDisconnect, amountDeducted: totalCost, remainingBalance: user.walletBalance - totalCost };
    }

    /**
     * Add funds (e.g. from Razorpay webhook)
     */
    static async creditBalance(userId, amount, paymentId, orderId, description = 'Wallet Recharge') {
        const user = await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: amount }
        }, { new: true });

        const transaction = await Transaction.create({
            user: userId,
            amount: amount,
            type: 'credit',
            status: 'success',
            description,
            paymentId,
            orderId,
            referenceModel: 'WalletRecharge'
        });

        return { user, transaction };
    }
}

module.exports = WalletService;
