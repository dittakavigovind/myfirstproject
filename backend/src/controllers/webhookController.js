const BillingService = require('../services/BillingService');
const WalletService = require('../services/walletService');
const Transaction = require('../models/Transaction');
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


        const { noticeId, productId, eventType, payload } = body;
        const { channelName, uid } = payload;

        // Agora UIDs are integers. We need to map them to Role/User if possible.
        // Convention: Astrologer UID might be specific, or we look up session by Channel Name.
        // Assuming Channel Name == Unique Session ID or contains it.

        switch (eventType) {
            case 103: // Broadcaster Joined Channel
                // In 1-on-1, Astrologer is usually a Broadcaster
                await BillingService.startBilling(channelName);
                break;

            case 104: // Broadcaster Left Channel
                // If it was the Astrologer, end session
                // We treat any broadcaster leaving as a potential end trigger in 1-on-1
                await BillingService.endSession(channelName, 'astro_left');
                break;

            case 106: // Audience Left Channel (User)
                // If the user was audience
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

/**
 * Razorpay Webhook Handler
 */
exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        
        // Validate signature
        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).send('Invalid Signature');
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        if (event === 'payment.captured') {
            const orderId = payload.order_id;
            const paymentId = payload.id;
            
            // Check if transaction exists and is pending
            const transaction = await Transaction.findOne({ orderId });
            
            if (transaction && transaction.status === 'pending') {
                // Fulfill payment
                await WalletService.creditBalance(
                    transaction.user, 
                    transaction.amount, 
                    paymentId, 
                    orderId, 
                    'Wallet Recharge via Hook'
                );
                
                transaction.status = 'success';
                transaction.paymentId = paymentId;
                await transaction.save();
                console.log(`[Webhook] Razorpay Payment Captured & Wallet Credited: ${paymentId}`);
            }
        } else if (event === 'payment.failed') {
            const orderId = payload.order_id;
            await Transaction.findOneAndUpdate(
                { orderId, status: 'pending' },
                { status: 'failed', description: 'Payment Failed via Webhook' }
            );
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Razorpay Webhook Error:', error);
        res.status(500).send('Server Error');
    }
};
