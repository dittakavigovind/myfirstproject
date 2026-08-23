const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming authMiddleware exists
const { getWalletBalance, addMoney, getTransactions, verifyPayment, cancelPayment } = require('../controllers/walletController');
const { getActivePlans } = require('../controllers/rechargePlanController');

router.get('/plans', getActivePlans);
router.get('/balance', protect, getWalletBalance);
router.post('/recharge', protect, addMoney);
router.post('/verify-payment', protect, verifyPayment);
router.post('/cancel-payment', protect, cancelPayment);
router.get('/transactions', protect, getTransactions);

module.exports = router;
