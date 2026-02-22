const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getPosts,
    getAdminPosts,
    getPostBySlug,
    getPostById,
    incrementPostViews,
    createPost,
    updatePost,
    deletePost
} = require('../controllers/blogController');

// Admin Routes (Protected) - Must be before :slug
router.get('/posts/admin', protect, authorize('admin', 'manager'), getAdminPosts);

// Public Routes
router.get('/categories', getCategories);
router.get('/posts', getPosts);
router.get('/posts/id/:id', getPostById);
router.post('/posts/view/:id', incrementPostViews);
router.get('/posts/:slug', getPostBySlug);
router.post('/categories', protect, authorize('admin', 'manager'), createCategory);
router.put('/categories/:id', protect, authorize('admin', 'manager'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin', 'manager'), deleteCategory);

router.post('/posts', protect, authorize('admin', 'manager'), createPost);
router.put('/posts/:id', protect, authorize('admin', 'manager'), updatePost);
router.delete('/posts/:id', protect, authorize('admin', 'manager'), deletePost);

module.exports = router;
