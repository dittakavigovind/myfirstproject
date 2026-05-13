const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const MatchmakingPurchase = require('../models/MatchmakingPurchase');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Check if a specific couple's report has been purchased by the user
router.get('/check-status/:coupleId', protect, async (req, res) => {
    try {
        const { coupleId } = req.params;
        const purchase = await MatchmakingPurchase.findOne({
            user: req.user._id,
            coupleId: coupleId,
            status: 'paid'
        });

        if (purchase) {
            return res.json({ isPaid: true });
        }
        res.json({ isPaid: false });
    } catch (error) {
        console.error('Error checking matchmaking status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a Razorpay order for Rs 99
router.post('/create-order', protect, async (req, res) => {
    try {
        const { coupleId } = req.body;
        if (!coupleId) {
            return res.status(400).json({ message: 'Couple ID is required' });
        }

        const amount = 99; // Rs 99

        const options = {
            amount: amount * 100, // paise
            currency: 'INR',
            receipt: `mm_rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save to DB
        await MatchmakingPurchase.create({
            user: req.user._id,
            coupleId,
            razorpayOrderId: order.id,
            amount: amount,
            status: 'created'
        });

        res.json({
            ...order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating matchmaking order:', error);
        res.status(500).json({ message: 'Failed to create order' });
    }
});

// Verify payment
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const purchase = await MatchmakingPurchase.findOne({ razorpayOrderId: razorpay_order_id });
        if (!purchase) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            purchase.status = 'paid';
            purchase.razorpayPaymentId = razorpay_payment_id;
            await purchase.save();

            return res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            purchase.status = 'failed';
            await purchase.save();
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying matchmaking payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
