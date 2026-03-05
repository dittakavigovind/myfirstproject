const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');

// Sitemap XML route
router.get('/sitemap.xml', seoController.generateSitemap);

// Robots.txt route
router.get('/robots.txt', seoController.generateRobotsTxt);

module.exports = router;
