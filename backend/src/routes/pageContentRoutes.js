const express = require('express');
const router = express.Router();
const { getPageContent, updatePageContent } = require('../controllers/pageContentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get content
router.get('/:slug(*)', getPageContent);

// Protected route to update content (Admin/Manager)
router.put('/:slug(*)', protect, admin, updatePageContent);







module.exports = router;
