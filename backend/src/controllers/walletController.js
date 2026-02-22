const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (error) {
        console.error('Get Balance Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addMoney = async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    try {
        // Create Razorpay Order
        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Create a Pending Transaction
        const transaction = await Transaction.create({
            user: req.user.id,
            amount: amount,
            type: 'credit',
            status: 'pending',
            description: 'Wallet Recharge - Pending',
            referenceModel: 'Recharge',
            orderId: order.id
        });

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: amount,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID,
            transactionId: transaction._id
        });

    } catch (error) {
        console.error('Add Money (Create Order) Error:', error);
        res.status(500).json({ success: false, message: 'Server error creating order' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            // Payment Success - Update Transaction & User Balance

            // 1. Find the pending transaction
            const transaction = await Transaction.findOne({ orderId: razorpay_order_id });

            if (!transaction) {
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            }

            if (transaction.status === 'success') {
                return res.status(200).json({ success: true, message: 'Payment already verified' });
            }

            // 2. Update Transaction
            transaction.status = 'success';
            transaction.paymentId = razorpay_payment_id;
            transaction.description = 'Wallet Recharge - Success';
            await transaction.save();

            // 3. Update User Balance
            const user = await User.findByIdAndUpdate(
                req.user.id,
                { $inc: { walletBalance: transaction.amount } },
                { new: true }
            );

            res.status(200).json({
                success: true,
                message: 'Payment verified and wallet updated',
                balance: user.walletBalance
            });

        } else {
            // Signature Mismatch
            await Transaction.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'failed', description: 'Wallet Recharge - Failed (Signature Mismatch)' }
            );
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, message: 'Server verification error' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments({ user: req.user.id });

        res.status(200).json({
            success: true,
            transactions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
