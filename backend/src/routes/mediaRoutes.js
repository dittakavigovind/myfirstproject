const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { protect, admin } = require('../middleware/authMiddleware');
const Media = require('../models/Media');
const BlogPost = require('../models/BlogPost');
const Temple = require('../models/Temple');
const PageContent = require('../models/PageContent');

// Persistent Uploads Path
const isHostinger = __dirname.includes('u189460089');
const uploadDir = isHostinger
    ? '/home/u189460089/domains/api.way2astro.com/uploads'
    : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, 'gallery-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // 10MB limit for gallery
});

// @desc    Get all media with usage counts
// @route   GET /api/media
router.get('/', protect, admin, async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 }).lean();

        // Calculate usage counts for each media item
        const mediaWithUsage = await Promise.all(media.map(async (item) => {
            const filename = item.filename;
            
            // Search in various collections
            const counts = await Promise.all([
                BlogPost.countDocuments({ 
                    $or: [ 
                        { content: { $regex: filename, $options: 'i' } }, 
                        { featuredImage: { $regex: filename, $options: 'i' } }, 
                        { 'seo.ogImage': { $regex: filename, $options: 'i' } } 
                    ] 
                }),
                Temple.countDocuments({ 
                    $or: [ 
                        { images: { $regex: filename, $options: 'i' } }, 
                        { ogImage: { $regex: filename, $options: 'i' } } 
                    ] 
                }),
                PageContent.countDocuments({ 
                    $or: [ 
                        { content: { $regex: filename, $options: 'i' } }, 
                        { imageUrl: { $regex: filename, $options: 'i' } } 
                    ] 
                })
            ]);

            const usageCount = counts.reduce((a, b) => a + b, 0);
            return { ...item, usageCount };
        }));

        res.json({ success: true, count: mediaWithUsage.length, data: mediaWithUsage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Upload media
// @route   POST /api/media/upload
router.post('/upload', protect, admin, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        const filePath = req.file.path;
        const ext = path.extname(filePath).toLowerCase();

        // Optimization
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            const tempPath = filePath + '.tmp';
            await sharp(filePath)
                .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                .toFile(tempPath);
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const mediaUrl = `${baseUrl}/api/uploads/${req.file.filename}`;

        const media = await Media.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: mediaUrl,
            size: fs.statSync(filePath).size,
            mimetype: req.file.mimetype,
            uploadedBy: req.user._id
        });

        res.status(201).json({ success: true, data: media });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete media
// @route   DELETE /api/media/:id
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        // Check usage again before delete
        const filename = media.filename;
        const counts = await Promise.all([
            BlogPost.countDocuments({ $or: [ { content: { $regex: filename } }, { featuredImage: { $regex: filename } } ] }),
            Temple.countDocuments({ $or: [ { images: { $regex: filename } } ] })
        ]);
        const usageCount = counts.reduce((a, b) => a + b, 0);

        if (usageCount > 0 && !req.query.force) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete. Image is used in ${usageCount} place(s).`,
                usageCount 
            });
        }

        // Delete from filesystem
        const filePath = path.join(uploadDir, media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await media.deleteOne();
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
