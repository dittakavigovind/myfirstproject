
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists in project root
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// File Filter (Images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 50 } // 50MB limit
});

/**
 * @route POST /api/upload
 * @desc Upload an image/file
 * @access Public (or protected if needed)
 */
const uploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error("Upload Middleware Error:", err);
            return res.status(400).json({ message: 'File upload failed', error: err.message });
        }
        next();
    });
};

router.post('/', uploadMiddleware, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct accessible URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const filePath = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
        success: true,
        filePath: filePath,
        message: 'File uploaded successfully'
    });
});

module.exports = router;
