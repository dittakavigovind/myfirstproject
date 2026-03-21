const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const sharp = require('sharp');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;
const isHostinger = __dirname.includes('u189460089');
const uploadDir = isHostinger
    ? '/home/u189460089/domains/api.way2astro.com/uploads'
    : path.join(__dirname, '../../uploads');

const backupDir = path.join(uploadDir, 'backups');

const DRY_RUN = process.argv.includes('--dry-run');

if (!MONGO_URI) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
}

// Import Models
const Media = require('../models/Media');
const BlogPost = require('../models/BlogPost');
const Temple = require('../models/Temple');
const Astrologer = require('../models/Astrologer');
const SiteSettings = require('../models/SiteSettings');
const Popup = require('../models/Popup');

async function connectDB() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
}

async function convertToWebp() {
    try {
        await connectDB();

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const files = fs.readdirSync(uploadDir);
        const imageFiles = files.filter(f => ['.jpg', '.jpeg', '.png'].includes(path.extname(f).toLowerCase()));

        console.log(`Found ${imageFiles.length} images to convert.`);
        if (DRY_RUN) console.log('--- DRY RUN MODE ---');

        let convertedCount = 0;

        for (const file of imageFiles) {
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const newFile = `${baseName}.webp`;
            
            const oldPath = path.join(uploadDir, file);
            const newPath = path.join(uploadDir, newFile);

            console.log(`Processing ${file} -> ${newFile}`);

            if (!DRY_RUN) {
                try {
                    // 1. Convert to WebP
                    await sharp(oldPath)
                        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toFile(newPath);

                    // 2. Update Database References
                    const oldUrlPart = file;
                    const newUrlPart = newFile;

                    // Media
                    const mediaItems = await Media.find({ filename: file });
                    for (const item of mediaItems) {
                        item.filename = newFile;
                        item.url = item.url.replace(file, newFile);
                        await item.save();
                    }

                    // BlogPost (Content + FeaturedImage + SEO)
                    await BlogPost.updateMany(
                        { featuredImage: { $regex: file } },
                        [{ $set: { featuredImage: { $replaceOne: { input: "$featuredImage", find: file, replacement: newFile } } } }]
                    );
                    await BlogPost.updateMany(
                        { "seo.ogImage": { $regex: file } },
                        [{ $set: { "seo.ogImage": { $replaceOne: { input: "$seo.ogImage", find: file, replacement: newFile } } } }]
                    );
                    // BlogPost Content (HTML)
                    const postsWithContent = await BlogPost.find({ content: { $regex: file } });
                    for (const post of postsWithContent) {
                        post.content = post.content.split(file).join(newFile);
                        await post.save();
                    }

                    // Temple
                    const temples = await Temple.find({ 
                        $or: [
                            { images: { $regex: file } },
                            { ogImage: { $regex: file } },
                            { "sevas.image": { $regex: file } }
                        ]
                    });
                    for (const temple of temples) {
                        temple.images = temple.images.map(img => img.includes(file) ? img.replace(file, newFile) : img);
                        if (temple.ogImage && temple.ogImage.includes(file)) {
                            temple.ogImage = temple.ogImage.replace(file, newFile);
                        }
                        temple.sevas = temple.sevas.map(seva => {
                            if (seva.image && seva.image.includes(file)) {
                                seva.image = seva.image.replace(file, newFile);
                            }
                            return seva;
                        });
                        await temple.save();
                    }

                    // Astrologer
                    const astrologers = await Astrologer.find({
                        $or: [
                            { image: { $regex: file } },
                            { gallery: { $regex: file } }
                        ]
                    });
                    for (const astro of astrologers) {
                        if (astro.image && astro.image.includes(file)) {
                            astro.image = astro.image.replace(file, newFile);
                        }
                        astro.gallery = astro.gallery.map(img => img.includes(file) ? img.replace(file, newFile) : img);
                        await astro.save();
                    }

                    // SiteSettings
                    const settings = await SiteSettings.find();
                    for (const s of settings) {
                        let changed = false;
                        if (s.logoDesktop && s.logoDesktop.includes(file)) { s.logoDesktop = s.logoDesktop.replace(file, newFile); changed = true; }
                        if (s.logoMobile && s.logoMobile.includes(file)) { s.logoMobile = s.logoMobile.replace(file, newFile); changed = true; }
                        if (s.logoReport && s.logoReport.includes(file)) { s.logoReport = s.logoReport.replace(file, newFile); changed = true; }
                        if (s.promotionImage && s.promotionImage.includes(file)) { s.promotionImage = s.promotionImage.replace(file, newFile); changed = true; }
                        if (s.panchangSharePromo && s.panchangSharePromo.includes(file)) { s.panchangSharePromo = s.panchangSharePromo.replace(file, newFile); changed = true; }
                        if (s.heroSection?.carouselImages) {
                            s.heroSection.carouselImages = s.heroSection.carouselImages.map(ci => {
                                if (ci.image && ci.image.includes(file)) {
                                    ci.image = ci.image.replace(file, newFile);
                                    changed = true;
                                }
                                return ci;
                            });
                        }
                        if (changed) await s.save();
                    }

                    // Popup
                    await Popup.updateMany(
                        { imageUrl: { $regex: file } },
                        [{ $set: { imageUrl: { $replaceOne: { input: "$imageUrl", find: file, replacement: newFile } } } }]
                    );

                    // 3. Move original to backup
                    fs.renameSync(oldPath, path.join(backupDir, file));
                    
                    convertedCount++;
                } catch (err) {
                    console.error(`Error processing ${file}:`, err.message);
                }
            } else {
                convertedCount++;
            }
        }

        console.log(`\nConversion complete. Processed ${convertedCount} images.`);
        if (DRY_RUN) console.log('This was a dry run. No files were changed.');
        
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

convertToWebp();
