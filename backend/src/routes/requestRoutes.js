const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/check-name', protect, requestController.checkNameAvailability);
router.post('/submit', protect, requestController.submitRequest);
router.get('/my-status', protect, requestController.checkRequestStatus);
router.get('/admin/all', protect, admin, requestController.getRequests);
router.post('/admin/approve/:id', protect, admin, requestController.approveRequest);
router.post('/admin/reject/:id', protect, admin, requestController.rejectRequest);

module.exports = router;
