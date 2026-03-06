const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadDir = path.join(__dirname, '../../uploads');

async function compressExisting() {
    console.log(`Starting compression in: ${uploadDir}`);

    if (!fs.existsSync(uploadDir)) {
        console.error('Upload directory does not exist.');
        return;
    }

    const files = fs.readdirSync(uploadDir);
    let processed = 0;
    let totalSaved = 0;

    for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const ext = path.extname(file).toLowerCase();

        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            try {
                const stats = fs.statSync(filePath);
                const originalSize = stats.size;

                // Skip files smaller than 100KB unless they are huge in dimensions
                if (originalSize < 100 * 1024) continue;

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

                const newStats = fs.statSync(tempPath);
                const newSize = newStats.size;

                if (newSize < originalSize) {
                    fs.unlinkSync(filePath);
                    fs.renameSync(tempPath, filePath);
                    const saved = originalSize - newSize;
                    totalSaved += saved;
                    console.log(`Optimized ${file}: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB (Saved ${(saved / 1024 / 1024).toFixed(2)}MB)`);
                } else {
                    fs.unlinkSync(tempPath);
                    console.log(`Skipped ${file}: No size reduction`);
                }

                processed++;
            } catch (err) {
                console.error(`Error processing ${file}:`, err.message);
            }
        }
    }

    console.log(`\nFinished processing ${processed} images.`);
    console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

compressExisting().catch(console.error);
