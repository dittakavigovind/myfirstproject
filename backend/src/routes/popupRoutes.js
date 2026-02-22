const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popupController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', popupController.getPublicPopup);
router.post('/impression/:id', popupController.trackImpression);
router.post('/click/:id', popupController.trackClick);

// Admin routes
router.get('/admin', protect, admin, popupController.getPopups);
router.post('/', protect, admin, popupController.createPopup);
router.put('/:id', protect, admin, popupController.updatePopup);
router.delete('/:id', protect, admin, popupController.deletePopup);

module.exports = router;
