const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming authMiddleware exists
const { getWalletBalance, addMoney, getTransactions, verifyPayment } = require('../controllers/walletController');

router.get('/balance', protect, getWalletBalance);
router.post('/recharge', protect, addMoney);
router.post('/verify-payment', protect, verifyPayment);
router.get('/transactions', protect, getTransactions);

module.exports = router;
