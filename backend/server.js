const path = require('path');
const fs = require('fs');

// Global Error Handlers for Diagnostics
process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION:', reason);
});

console.log('Server starting initialization...');

const dotenvPath = path.join(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
    console.log('Loading local .env file...');
    require('dotenv').config({ override: true, path: dotenvPath });
} else {
    console.log('No .env file found; assuming environment variables are provided by host.');
}

console.log('Env variables loaded. Port:', process.env.PORT);

const express = require('express');
console.log('Express loaded');
const http = require('http');
const { Server } = require('socket.io');
console.log('Socket.io loaded');
const cors = require('cors');
const connectDB = require('./src/config/db');
console.log('ConnectDB module loaded');
const { isbot } = require('isbot');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
console.log('Core dependencies loaded');

// Import Route Modules
const authRoutes = require('./src/routes/authRoutes');
const astroRoutes = require('./src/routes/astroRoutes');
const panchangRoutes = require('./src/routes/panchangRoutes');
const horoscopeRoutes = require('./src/routes/horoscopeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const seoSettingsRoutes = require('./src/routes/seoSettingsRoutes');
const horoscopeManagerRoutes = require('./src/routes/horoscopeManagerRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const agoraRoutes = require('./src/routes/agoraRoutes');
const userRoutes = require('./src/routes/userRoutes');
const earningsRoutes = require('./src/routes/earningsRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const poojaRoutes = require('./src/routes/poojaRoutes');

// Initialize App
const app = express();
const server = http.createServer(app);

// Trust proxy for Cloudflare/Reverse proxy (ensures req.protocol is correctly https)
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Static Files - Serving via /api prefix for Hostinger proxy reliability
app.get('/api/uploads/:name', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.name);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
});

// Explicit route for standard /uploads (backup)
app.get('/uploads/:name', (req, res, next) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'uploads', fileName);

    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    next();
});

// Original static for other files (if any)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development ease (prev: 20)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Passport Initialization
app.use(passport.initialize());

// Database Connection
// Database Connection
connectDB().then(async () => {
    // Auto-seed Admin User on Startup (for In-Memory or Demo)
    try {
        const User = require('./src/models/User');
        const bcrypt = require('bcryptjs');

        const adminExists = await User.findOne({ email: 'admin@way2astro.com' });
        if (!adminExists) {
            console.log('Seeding Admin User...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                name: 'System Admin',
                email: 'admin@way2astro.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('--> Admin Created: admin@way2astro.com / admin123');
        }

        // Auto-seed Demo User logic removed.

        // Auto-seed Astrologers logic removed.
    } catch (err) {
        console.error('Seeding Error:', err.message);
    }
}).catch(err => {
    console.error('FAILED TO CONNECT TO DATABASE:', err.message);
    process.exit(1);
});

// Diagnostic route (Remove in production)
app.get('/api/debug/uploads', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    const testFile = 'file-1772830115957.png';
    const testPath = path.join(uploadDir, testFile);

    const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];

    res.json({
        __dirname,
        uploadDir,
        exists: fs.existsSync(uploadDir),
        count: files.length,
        testFile: {
            name: testFile,
            path: testPath,
            exists: fs.existsSync(testPath)
        },
        files: files.slice(-10) // show last 10
    });
});
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for dev
        methods: ["GET", "POST"]
    }
});

// Attach io to app for use in controllers
app.set('io', io);

// Import and initialize specialized socket handlers
require('./src/sockets/chatSocket')(io);



// Basic Route
app.get('/', (req, res) => {
    res.send('Way2Astro Backend is Running');
});

// Diagnostic Route to check uploads
app.get('/api/debug/uploads', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
        return res.json({ exists: false, path: uploadDir });
    }
    const files = fs.readdirSync(uploadDir);
    res.json({ exists: true, path: uploadDir, count: files.length, files: files });
});

// Import Routes
app.use('/api/seo', require('./src/routes/seoSettingsRoutes'));
app.use('/api/horoscope-manager', require('./src/routes/horoscopeManagerRoutes'));
app.use('/api/wallet', require('./src/routes/walletRoutes'));
app.use('/api/agora', require('./src/routes/agoraRoutes'));
// app.use('/api/auth', require('./src/routes/otpRoutes')); // Merged into authRoutes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/astro', astroRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/astro/earnings', earningsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/chats', require('./src/routes/adminChatRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/panchang', panchangRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/site-settings', require('./src/routes/siteSettingsRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/activity', require('./src/routes/activityRoutes'));
app.use('/api/page-content', require('./src/routes/pageContentRoutes'));
app.use('/api/popups', require('./src/routes/popupRoutes'));
app.use('/api/pooja', poojaRoutes);
const seoRoutes = require('./src/routes/seoRoutes');
app.use(seoRoutes);

// --- SEO PROXY SERVER LOGIC ---
// In-memory cache for SEO optimized HTML strings to ensure lightning-fast responses
const seoCache = {};

app.use(async (req, res, next) => {
    // Support for both query parameters (?slug=...) and clean URLs (/blog/slug)
    const isPoojaDetails = req.path.startsWith('/online-pooja/details');
    // We treat /blog/category/article as the old query param style, and /blog/ as the new clean style
    const isBlogArticleQuery = req.path.startsWith('/blog/category/article');
    const isBlogArticleClean = req.path.startsWith('/blog/') && !req.path.startsWith('/blog/category');
    const isAstroSession = req.path.startsWith('/astrology-session/');

    if (!isPoojaDetails && !isBlogArticleQuery && !isBlogArticleClean && !isAstroSession) {
        return next(); // Let normal static serving handle it
    }

    // Extract Slug based on URL Strategy
    let slug = null;
    let htmlPath = '';

    if (isPoojaDetails) {
        slug = req.query.slug;
        htmlPath = path.join(__dirname, '../frontend/out/online-pooja/details/index.html');
    } else if (isBlogArticleQuery) {
        slug = req.query.slug;
        htmlPath = path.join(__dirname, '../frontend/out/blog/category/article/index.html');
    } else if (isBlogArticleClean) {
        // Extract slug from /blog/the-slug-name
        const parts = req.path.split('/');
        slug = parts[parts.length - 1] || parts[parts.length - 2]; // Handle trailing slash
        // The actual React app still lives at the query-parameter location in output: 'export'
        htmlPath = path.join(__dirname, '../frontend/out/blog/category/article/index.html');
    } else if (isAstroSession) {
        // Extract roomId from /astrology-session/ROOM_ID/
        const parts = req.path.split('/');
        slug = parts[parts.length - 1] || parts[parts.length - 2];
        // We use the 'chat-session' static page
        htmlPath = path.join(__dirname, '../frontend/out/astrology-session/chat-session/index.html');
    }

    if (!slug) {
        return next();
    }

    // --- HUMANS (RE-ROUTING) ---
    // Check if the requester is a bot (Google, WhatsApp, Facebook, etc.)
    const userAgent = req.headers['user-agent'] || '';
    if (!isbot(userAgent)) {
        // If a real human visits the clean SEO URL (/blog/slug), we must send them the static HTML 
        // that belongs to the /blog/category/article/index.html file so React can load.
        // We will rewrite the URL so React sees the query parameters it expects.
        if (isBlogArticleClean && fs.existsSync(htmlPath)) {
            req.url = `/blog/category/article/?slug=${slug}`; // Internal Express rewrite
            return res.sendFile(htmlPath);
        }
        if (isAstroSession && fs.existsSync(htmlPath)) {
            // Internal redirect to the dynamic session handler page
            return res.sendFile(htmlPath);
        }
        return next(); // Real humans on standard links get normal static serving
    }

    // Check Cache First
    const cacheKey = req.path + '?slug=' + slug;
    if (seoCache[cacheKey]) {
        console.log(`[SEO Proxy] Serving cached HTML for (BOT): ${cacheKey}`);
        return res.send(seoCache[cacheKey]);
    }

    console.log(`[SEO Proxy] Generating dynamic HTML for (BOT): ${cacheKey}`);
    try {
        if (!fs.existsSync(htmlPath)) {
            return next(); // Pass if file doesn't exist
        }

        let html = fs.readFileSync(htmlPath, 'utf8');

        // Fetch dynamic data based on the route
        let ogTitle = 'Way2Astro';
        let ogDescription = '';
        let ogImage = '';
        let ogUrl = `https://way2astro.com${req.originalUrl}`; // Production URL assumption
        let metaKeywords = '';
        let canonicalUrl = ogUrl;

        if (isPoojaDetails) {
            const Temple = require('./src/models/Temple');
            const temple = await Temple.findOne({ slug });
            if (temple) {
                // Front-end UI uses metaTitle and metaDescription
                ogTitle = temple.metaTitle || temple.name || ogTitle;
                ogDescription = temple.metaDescription || (temple.description ? temple.description.substring(0, 160).replace(/(<([^>]+)>)/gi, "") : '');
                ogImage = temple.ogImage || (temple.images && temple.images.length > 0 ? temple.images[0] : '');
                metaKeywords = temple.metaKeywords || '';
                canonicalUrl = temple.canonicalUrl || ogUrl;
            }
        } else if (isBlogArticleQuery || isBlogArticleClean) {
            const BlogPost = require('./src/models/BlogPost');
            const post = await BlogPost.findOne({ slug });
            if (post) {
                const seo = post.seo || {};

                console.log('\n[DEBUG SEO]');
                console.log('Post Title:', post.title);
                console.log('Post SEO Object:', seo);

                // Prioritize OG -> Meta -> Main Post Data
                ogTitle = seo.ogTitle || seo.metaTitle || post.title || ogTitle;
                console.log('Final Evaluated ogTitle:', ogTitle);
                ogDescription = seo.ogDescription || seo.metaDescription || (post.excerpt ? post.excerpt : '');
                ogImage = seo.ogImage || post.featuredImage || '';
                metaKeywords = seo.metaKeywords || '';
                canonicalUrl = seo.canonicalUrl || ogUrl;
            }
        }

        // Format Image URL if it's a relative path starting with /uploads
        if (ogImage && ogImage.startsWith('/uploads')) {
            // Note: Use full URL if we have it, else construct based on current host
            const host = req.get('host') || 'api.way2astro.com';
            const protocol = req.protocol || 'https';
            ogImage = `${protocol}://${host}${ogImage}`;
        } else if (ogImage && !ogImage.startsWith('http')) {
            const host = req.get('host') || 'api.way2astro.com';
            const protocol = req.protocol || 'https';
            ogImage = `${protocol}://${host}/uploads/${ogImage}`;
        }

        // Clean up the text replacing newlines/quotes that break HTML tags
        if (ogTitle) ogTitle = ogTitle.replace(/[\n\r]+/g, ' ').trim();
        if (ogDescription) ogDescription = ogDescription.replace(/[\n\r]+/g, ' ').trim();

        // Remove existing standard SEO tags from the React export to prevent conflicts
        html = html.replace(/<title>.*?<\/title>/gi, '');
        html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
        html = html.replace(/<meta[^>]*(name|property)=["'](og:|twitter:|description|keywords)[^>]*>/gi, '');

        // Inject the generated meta tags into the <head>
        const metaTags = `
            <title>${ogTitle}</title>
            <meta name="description" content="${ogDescription.replace(/"/g, '&quot;')}" />
            ${metaKeywords ? `<meta name="keywords" content="${metaKeywords.replace(/"/g, '&quot;')}" />` : ''}
            <link rel="canonical" href="${canonicalUrl}" />
            <meta property="og:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
            <meta property="og:description" content="${ogDescription.replace(/"/g, '&quot;')}" />
            <meta property="og:image" content="${ogImage}" />
            <meta property="og:url" content="${ogUrl}" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
            <meta name="twitter:description" content="${ogDescription.replace(/"/g, '&quot;')}" />
            <meta name="twitter:image" content="${ogImage}" />
        `;

        // Insert before closing head tag
        html = html.replace('</head>', `${metaTags}</head>`);

        // Save to cache
        seoCache[cacheKey] = html;

        // Send to Bot
        return res.send(html);
    } catch (err) {
        console.error('[SEO Proxy] Error:', err);
        return next(); // Fallback to normal serving on error
    }
});

// Serve the fully exported Next.js app 
// This should come LAST after api routes and SEO proxy
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Handle client-side routing fallback for the static export
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    const indexHtmlPath = path.join(__dirname, '../frontend/out/index.html');
    if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
    } else {
        next();
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
