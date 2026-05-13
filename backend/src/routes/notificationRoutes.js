const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createNotification,
    getMyNotifications,
    markAsRead,
    getAllNotifications,
    deleteNotification
} = require('../controllers/notificationController');

// User Routes
router.get('/my', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);

// Admin Routes
router.route('/')
    .post(protect, admin, createNotification)
    .get(protect, admin, getAllNotifications);

router.delete('/:id', protect, admin, deleteNotification);

module.exports = router;
