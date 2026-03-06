const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.join(__dirname, '..');
const pathsToOptimize = [
    path.join(rootDir, 'public'),
    path.join(rootDir, '../mobile-app/public')
];

async function optimizeStatic() {
    console.log('Starting static asset optimization...');
    let totalSaved = 0;

    for (const baseDir of pathsToOptimize) {
        if (!fs.existsSync(baseDir)) {
            console.warn(`Directory not found: ${baseDir}`);
            continue;
        }

        const files = getAllFiles(baseDir);
        for (const filePath of files) {
            const ext = path.extname(filePath).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                try {
                    const stats = fs.statSync(filePath);
                    const originalSize = stats.size;
                    const tempPath = filePath + '.tmp';

                    let sharpInstance = sharp(filePath);

                    if (ext === '.jpg' || ext === '.jpeg') {
                        sharpInstance = sharpInstance.jpeg({ quality: 85, progressive: true });
                    } else if (ext === '.png') {
                        sharpInstance = sharpInstance.png({ quality: 85, compressionLevel: 9 });
                    } else if (ext === '.webp') {
                        sharpInstance = sharpInstance.webp({ quality: 85 });
                    }

                    await sharpInstance.toFile(tempPath);
                    const newStats = fs.statSync(tempPath);
                    const newSize = newStats.size;

                    if (newSize < originalSize) {
                        fs.unlinkSync(filePath);
                        fs.renameSync(tempPath, filePath);
                        totalSaved += (originalSize - newSize);
                        console.log(`Optimized ${path.basename(filePath)}: Saved ${((originalSize - newSize) / 1024).toFixed(2)}KB`);
                    } else {
                        fs.unlinkSync(tempPath);
                    }
                } catch (err) {
                    console.error(`Error optimizing ${filePath}:`, err.message);
                }
            }
        }
    }

    console.log(`\nStatic asset optimization complete. Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

optimizeStatic().catch(console.error);
