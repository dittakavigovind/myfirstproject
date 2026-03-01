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
    exportBookings,
    validateCoupon,
    getCoupons,
    getActiveCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    updateBookingStatus,
    getUserBookings,
    updateBookingAddress
} = require('../controllers/poojaController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/temples', getTemples);
router.get('/temples/:slug', getTempleBySlug);
router.get('/coupons/active', getActiveCoupons);

// User Protected Routes
router.get('/booking/my-bookings', protect, getUserBookings);
router.post('/booking/create-order', protect, createBookingOrder);
router.post('/booking/verify-payment', protect, verifyPayment);
router.post('/coupons/validate', protect, validateCoupon);
router.put('/booking/:id/address', protect, updateBookingAddress);

// Admin Routes
router.post('/admin/temples', protect, admin, createTemple);
router.put('/admin/temples/:id', protect, admin, updateTemple);
router.delete('/admin/temples/:id', protect, admin, deleteTemple);
router.get('/admin/bookings', protect, admin, getAllBookings);
router.get('/admin/bookings/export', protect, admin, exportBookings);
router.put('/admin/bookings/:id/status', protect, admin, updateBookingStatus);

// Admin Coupon Routes
router.route('/admin/coupons')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route('/admin/coupons/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

module.exports = router;
