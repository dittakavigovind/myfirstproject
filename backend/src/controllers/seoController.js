const BlogPost = require('../models/BlogPost');
const Temple = require('../models/Temple');
const Astrologer = require('../models/Astrologer');
const SEOSettings = require('../models/SEOSettings');
const PageContent = require('../models/PageContent');
const axios = require('axios');

/**
 * Generate a standard XML sitemap
 */
exports.generateSitemap = async (req, res) => {
    try {
        // Prioritize FRONTEND_URL for sitemap links to point to the main site
        const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'https://way2astro.com';
        let urls = [];

        // 1. Static & Core Routes
        const coreRoutes = [
            { url: '/', priority: 1.0, changefreq: 'daily' },
            { url: '/talk-to-astrologer/', priority: 0.9, changefreq: 'daily' },
            { url: '/online-pooja/', priority: 0.9, changefreq: 'daily' },
            { url: '/blog/', priority: 0.8, changefreq: 'daily' },
            { url: '/panchang/', priority: 0.8, changefreq: 'daily' },
            { url: '/kundli/', priority: 0.8, changefreq: 'daily' },
            { url: '/horoscope/', priority: 0.8, changefreq: 'daily' },
            { url: '/today-hora-muhurat/', priority: 0.8, changefreq: 'daily' },
            { url: '/today-choghadiya-muhurat/', priority: 0.8, changefreq: 'daily' }
        ];
        urls.push(...coreRoutes);

        // 2. Blog Posts
        const blogs = await BlogPost.find({ status: 'published' }).select('slug updatedAt');
        blogs.forEach(post => {
            urls.push({
                url: `/blog/${post.slug}/`,
                lastmod: post.updatedAt ? post.updatedAt.toISOString().split('T')[0] : null,
                priority: 0.7,
                changefreq: 'weekly'
            });
        });

        // 3. Temples (Online Pooja)
        const temples = await Temple.find({}).select('slug updatedAt');
        temples.forEach(temple => {
            urls.push({
                url: `/online-pooja/details?slug=${temple.slug}`,
                lastmod: temple.updatedAt ? temple.updatedAt.toISOString().split('T')[0] : null,
                priority: 0.7,
                changefreq: 'weekly'
            });
        });

        // 4. Astrologer Profiles
        const astrologers = await Astrologer.find({ isActive: true }).select('slug updatedAt');
        astrologers.forEach(astro => {
            urls.push({
                url: `/astrologers/details?id=${astro.slug || astro._id}`,
                lastmod: astro.updatedAt ? astro.updatedAt.toISOString().split('T')[0] : null,
                priority: 0.6,
                changefreq: 'weekly'
            });
        });

        // 5. Custom Pages (PageContent)
        const customPages = await PageContent.find({}).select('pageSlug updatedAt');
        customPages.forEach(page => {
            // Avoid duplicates with core routes
            if (!coreRoutes.some(r => r.url === `/${page.pageSlug}/`)) {
                urls.push({
                    url: `/${page.pageSlug}/`,
                    lastmod: page.updatedAt ? page.updatedAt.toISOString().split('T')[0] : null,
                    priority: 0.5,
                    changefreq: 'monthly'
                });
            }
        });

        // 6. Horoscopes
        const signs = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        signs.forEach(sign => {
            urls.push({
                url: `/horoscope/${sign}/`,
                priority: 0.6,
                changefreq: 'daily'
            });
        });

        // 7. Calculators
        const calculators = [
            'ascendant-calculator', 'ashtakavarga', 'atmakaraka', 'dasha-periods',
            'friendship-calculator', 'gochar', 'indian-calendar', 'love-calculator',
            'marriage-career', 'moon-sign-calculator', 'nakshatra-calculator',
            'numerology-calculator', 'sade-sati-calculator', 'sun-sign-calculator',
            'yogini-dasha'
        ];
        calculators.forEach(calc => {
            urls.push({
                url: `/calculators/${calc}/`,
                priority: 0.5,
                changefreq: 'monthly'
            });
        });

        // XML Construction
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        urls.forEach(item => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${item.url}</loc>\n`;
            if (item.lastmod) xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
            if (item.changefreq) xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
            if (item.priority) xml += `    <priority>${item.priority.toFixed(1)}</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        res.set('X-Robots-Tag', 'noindex, follow');
        res.status(200).send(xml.trim());
    } catch (error) {
        console.error('Sitemap Generation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate sitemap' });
    }
};

/**
 * Generate a dynamic robots.txt file
 */
exports.generateRobotsTxt = async (req, res) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'https://way2astro.com';
        const enableIndexing = process.env.ENABLE_INDEXING === 'true';

        let robots = '';

        if (!enableIndexing) {
            // Disallow all if indexing is disabled (e.g., development/staging)
            robots += 'User-agent: *\n';
            robots += 'Disallow: /\n';
        } else {
            // Production configuration
            robots += 'User-agent: *\n';

            // Allow all public sections
            robots += 'Allow: /sitemap.xml\n';
            robots += 'Allow: /robots.txt\n';
            robots += 'Allow: /\n';
            robots += 'Allow: /blog/\n';
            robots += 'Allow: /online-pooja/\n';
            robots += 'Allow: /astrologers/\n';
            robots += 'Allow: /horoscope/\n';
            robots += 'Allow: /calculators/\n';

            // Disallow private/internal sections
            robots += 'Disallow: /admin/\n';
            robots += 'Disallow: /api/\n';
            robots += 'Disallow: /login\n';
            robots += 'Disallow: /register\n';
            robots += 'Disallow: /dashboard/\n';
            robots += 'Disallow: /astrologer/dashboard/\n';
            robots += 'Disallow: /astrologer/profile/\n';
            robots += 'Disallow: /my-profile/\n';
            robots += 'Disallow: /checkout/\n';
            robots += 'Disallow: /payment-status/\n';
            robots += 'Disallow: /astrology-session/\n';
            robots += 'Disallow: /chat/\n';
            robots += 'Disallow: /video/\n';
            robots += 'Disallow: /tmp/\n';
        }

        // Add sitemap reference
        robots += `\nSitemap: ${baseUrl}/sitemap.xml\n`;

        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600');
        res.set('X-Robots-Tag', 'noindex, follow');
        res.status(200).send(robots.trim());
    } catch (error) {
        console.error('Robots.txt Generation Error:', error);
        res.header('Cache-Control', 'no-cache');
        res.header('X-Robots-Tag', 'noindex, nofollow');
        res.status(500).send('User-agent: *\nDisallow: /');
    }
};

/**
 * Ping search engines to notify of sitemap update
 */
exports.pingSearchEngines = async () => {
    try {
        const sitemapUrl = `${process.env.BASE_URL || 'https://way2astro.com'}/sitemap.xml`;

        // Google retired their sitemap ping service in late 2023. 
        // The recommended way now is robots.txt (already done) or Search Console API.
        // Bing still supports it.
        const pingUrls = [
            `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
        ];

        console.log('[SEO] Pinging search engines for sitemap update...');

        const results = await Promise.allSettled(pingUrls.map(url => axios.get(url)));

        results.forEach((res, idx) => {
            if (res.status === 'fulfilled') {
                console.log(`[SEO] Successfully pinged: ${pingUrls[idx].split('?')[0]}`);
            } else {
                // If it's a 404/410, it's likely just deprecated
                const status = res.reason.response?.status;
                if (status === 404 || status === 410) {
                    console.log(`[SEO] Ping endpoint retired (expected): ${pingUrls[idx].split('?')[0]}`);
                } else {
                    console.warn(`[SEO] Failed to ping: ${pingUrls[idx].split('?')[0]} - ${res.reason.message}`);
                }
            }
        });

        return true;
    } catch (error) {
        console.error('[SEO] Error pinging search engines:', error.message);
        return false;
    }
};
