const BlogPost = require('../models/BlogPost');
const BlogCategory = require('../models/BlogCategory');

// @desc    Get all categories
// @route   GET /api/blog/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find({}).lean();

        // Count published posts per category
        const postCounts = await BlogPost.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$categories' },
            { $group: { _id: '$categories', count: { $sum: 1 } } }
        ]);

        const categoriesWithCount = categories.map(cat => {
            const countObj = postCounts.find(p => p._id.toString() === cat._id.toString());
            return { ...cat, postCount: countObj ? countObj.count : 0 };
        });

        res.json({ success: true, count: categoriesWithCount.length, data: categoriesWithCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await BlogCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/blog/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        let category = await BlogCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category = await BlogCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/blog/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await category.deleteOne();

        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all posts (Pagination + Filtering)
// @route   GET /api/blog/posts
// @access  Public
// @desc    Get all posts (Pagination + Filtering)
// @route   GET /api/blog/posts
// @access  Public
exports.getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = { status: 'published' };
        let sort = { createdAt: -1 };

        if (req.query.sort) {
            const sortField = req.query.sort.replace('-', '');
            const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
            sort = { [sortField]: sortOrder };
        }

        if (req.query.category) {
            // Check if category is a valid ObjectId
            const mongoose = require('mongoose');
            let categoryId;

            if (mongoose.Types.ObjectId.isValid(req.query.category)) {
                categoryId = req.query.category;
            } else {
                // Assume it's a slug, find the category first
                const categoryDoc = await BlogCategory.findOne({ slug: req.query.category });
                if (categoryDoc) {
                    categoryId = categoryDoc._id;
                }
            }

            if (categoryId) {
                query.categories = categoryId; // Mongoose handles array query automatically (contains)
            } else {
                // Invalid category, return empty
                return res.json({
                    success: true,
                    count: 0,
                    total: 0,
                    page,
                    pages: 0,
                    data: []
                });
            }
        }

        const posts = await BlogPost.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await BlogPost.countDocuments(query);

        res.json({
            success: true,
            count: posts.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: posts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all posts for Admin (Includes Drafts)
// @route   GET /api/blog/posts/admin
// @access  Private/Admin
exports.getAdminPosts = async (req, res) => {
    try {
        console.log('Admin fetching posts...');
        const posts = await BlogPost.find({})
            .sort({ createdAt: -1 });
        console.log(`Found ${posts.length} posts for admin.`);

        res.json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single post by ID
// @route   GET /api/blog/posts/id/:id
// @access  Public
exports.getPostById = async (req, res) => {
    try {
        console.log(`[DEBUG] getPostById called with ID: ${req.params.id}`);
        const post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single post by slug
// @route   GET /api/blog/posts/:slug
// @access  Public
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // View increment moved to separate endpoint
        // post.views += 1;
        // await post.save({ validateBeforeSave: false });

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Increment post views
// @route   POST /api/blog/posts/view/:id
// @access  Public
exports.incrementPostViews = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        post.views += 1;
        await post.save({ validateBeforeSave: false });
        res.status(200).json({ success: true, views: post.views });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a post
// @route   POST /api/blog/posts
// @access  Private/Admin
exports.createPost = async (req, res) => {
    try {
        // Add author from auth middleware
        req.body.author = req.user.id;

        if (req.body.status === 'published' && !req.body.publishedAt) {
            req.body.publishedAt = Date.now();
        }

        const post = await BlogPost.create(req.body);
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update a post
// @route   PUT /api/blog/posts/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
    try {
        let post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: post });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a post
// @route   DELETE /api/blog/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        await post.deleteOne();

        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
