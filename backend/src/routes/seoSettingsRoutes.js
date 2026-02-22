const express = require('express');
const router = express.Router();
const {
    createSeoSettings,
    getAllSeoSettings,
    getSeoSettings,
    updateSeoSettings,
    deleteSeoSettings,
    getAvailablePages
} = require('../controllers/seoSettingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Specific Protected Routes (Must come before /:slug)
router.get('/available-pages', protect, authorize('admin', 'manager'), getAvailablePages);

// 2. Collection Routes (Protected)
router.get('/', protect, authorize('admin', 'manager'), getAllSeoSettings);
router.post('/', protect, authorize('admin', 'manager'), createSeoSettings);

// 3. ID-based Protected Routes
router.put('/:id', protect, authorize('admin', 'manager'), updateSeoSettings);
router.delete('/:id', protect, authorize('admin'), deleteSeoSettings);

// 4. Public Routes (Dynamic /:slug must be last to avoid catching specific paths)
router.get('/:slug', getSeoSettings);

module.exports = router;
