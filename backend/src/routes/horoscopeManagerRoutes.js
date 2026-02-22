const express = require('express');
const router = express.Router();
const controller = require('../controllers/horoscopeManagerController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming this exists

// Daily
router.post('/daily', protect, authorize('admin', 'manager'), controller.createDailyHoroscope);
router.get('/daily', controller.getDailyHoroscope);
router.put('/daily/:id', protect, authorize('admin', 'manager'), controller.updateDailyHoroscope);
router.delete('/daily/:id', protect, authorize('admin', 'manager'), controller.deleteDailyHoroscope);

// Weekly
router.post('/weekly', protect, authorize('admin', 'manager'), controller.createWeeklyHoroscope);
router.get('/weekly', controller.getWeeklyHoroscope);
router.put('/weekly/:id', protect, authorize('admin', 'manager'), controller.updateWeeklyHoroscope);
router.delete('/weekly/:id', protect, authorize('admin', 'manager'), controller.deleteWeeklyHoroscope);

// Monthly
router.post('/monthly', protect, authorize('admin', 'manager'), controller.createMonthlyHoroscope);
router.get('/monthly', controller.getMonthlyHoroscope);
router.put('/monthly/:id', protect, authorize('admin', 'manager'), controller.updateMonthlyHoroscope);
router.delete('/monthly/:id', protect, authorize('admin', 'manager'), controller.deleteMonthlyHoroscope);

// Availability
router.get('/daily/availability', protect, authorize('admin', 'manager'), controller.getDailyAvailability);
router.get('/weekly/availability', protect, authorize('admin', 'manager'), controller.getWeeklyAvailability);
router.get('/monthly/availability', protect, authorize('admin', 'manager'), controller.getMonthlyAvailability);

// Featured Astrologer
router.get('/featured-astrologer/availability', protect, authorize('admin', 'manager'), controller.checkFeaturedAvailability);
router.get('/featured-astrologer/search', protect, authorize('admin', 'manager'), controller.getFeaturedAstrologerByName);
router.get('/featured-astrologer/schedules', controller.getAllFeaturedSchedules); // Publicly accessible for frontend
router.get('/featured-astrologer', controller.getFeaturedAstrologer); // Publicly accessible for frontend
router.put('/featured-astrologer', protect, authorize('admin', 'manager'), controller.updateFeaturedAstrologer);

module.exports = router;
