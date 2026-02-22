const express = require('express');
const router = express.Router();
const { getSiteSettings, updateSiteSettings } = require('../controllers/siteSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSiteSettings);
router.put('/', protect, admin, updateSiteSettings);

module.exports = router;
