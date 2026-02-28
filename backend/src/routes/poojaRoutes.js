const express = require('express');
const router = express.Router();
const {
    getTemples,
    getTempleBySlug,
    createBookingOrder,
    verifyPayment,
    createTemple,
    updateTemple,
    deleteTemple,
    getAllBookings,
    exportBookings
} = require('../controllers/poojaController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/temples', getTemples);
router.get('/temples/:slug', getTempleBySlug);

// User Protected Routes
router.post('/booking/create-order', protect, createBookingOrder);
router.post('/booking/verify-payment', protect, verifyPayment);

// Admin Routes
router.post('/admin/temples', protect, admin, createTemple);
router.put('/admin/temples/:id', protect, admin, updateTemple);
router.delete('/admin/temples/:id', protect, admin, deleteTemple);
router.get('/admin/bookings', protect, admin, getAllBookings);
router.get('/admin/bookings/export', protect, admin, exportBookings);

module.exports = router;
