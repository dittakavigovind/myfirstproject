
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Persistent Uploads Path (Hostinger specific absolute path vs Local relative path)
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
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error("Upload Middleware Error:", err);
            return res.status(400).json({ message: 'File upload failed', error: err.message });
        }

        // Image optimization
        if (req.file) {
            try {
                const filePath = req.file.path;
                const ext = path.extname(filePath).toLowerCase();

                // Only compress common image formats
                if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                    const tempPath = filePath + '.tmp';

                    let sharpInstance = sharp(filePath)
                        .resize({
                            width: 1920,
                            height: 1920,
                            fit: 'inside',
                            withoutEnlargement: true
                        });

                    if (ext === '.jpg' || ext === '.jpeg') {
                        sharpInstance = sharpInstance.jpeg({ quality: 80, progressive: true });
                    } else if (ext === '.png') {
                        sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 9 });
                    } else if (ext === '.webp') {
                        sharpInstance = sharpInstance.webp({ quality: 80 });
                    }

                    await sharpInstance.toFile(tempPath);

                    // Replace original with compressed version
                    fs.unlinkSync(filePath);
                    fs.renameSync(tempPath, filePath);

                    // Update file size in req.file for accurate logging if needed
                    const stats = fs.statSync(filePath);
                    req.file.size = stats.size;
                }
            } catch (sharpErr) {
                console.error("Sharp optimization error:", sharpErr);
                // Continue despite optimization error to avoid blocking the upload
            }
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
    const filePath = `${baseUrl}/api/uploads/${req.file.filename}`;

    res.json({
        success: true,
        filePath: filePath,
        message: 'File uploaded successfully'
    });
});

module.exports = router;
