const express = require('express');
const router = express.Router();
const adminPayoutController = require('../controllers/adminPayoutController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, adminPayoutController.getPayouts);
router.get('/export', protect, admin, adminPayoutController.exportPayoutsCSV);
router.put('/:id/hold', protect, admin, adminPayoutController.putOnHold);
router.put('/:id/release', protect, admin, adminPayoutController.releaseHold);
router.put('/:id/edit', protect, admin, adminPayoutController.editPayout);
router.post('/:id/mark-paid', protect, admin, adminPayoutController.markPaid);

module.exports = router;
