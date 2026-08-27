const express = require('express');
const router = express.Router();
const {
    getTodayBlessing,
    createBlessing,
    getAdminBlessings,
    getBlessing,
    updateBlessing,
    deleteBlessing
} = require('../controllers/dailyBlessingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route (Highly Cacheable)
router.get('/today', getTodayBlessing);
router.get('/public/:id', getBlessing); // Re-use getBlessing as public, it just fetches the data

// Admin Routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.route('/')
    .get(getAdminBlessings)
    .post(createBlessing);

router.route('/:id')
    .get(getBlessing)
    .put(updateBlessing)
    .delete(deleteBlessing);

module.exports = router;
