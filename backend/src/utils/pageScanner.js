const fs = require('fs');
const path = require('path');

const FRONTEND_APP_DIR = process.env.FRONTEND_APP_DIR || path.join(__dirname, '../../../frontend/src/app');

const CORE_PAGES = [
    { slug: 'home', path: '/', isDynamic: false, name: 'Home Page' },
    { slug: 'talk-to-astrologer', path: '/talk-to-astrologer', isDynamic: false, name: 'Talk to Astrologer' },
    { slug: 'online-pooja', path: '/online-pooja', isDynamic: false, name: 'Online Pooja' },
    { slug: 'blog', path: '/blog', isDynamic: false, name: 'Blog' },
    { slug: 'panchang', path: '/panchang', isDynamic: false, name: 'Panchang' },
    { slug: 'kundli', path: '/kundli', isDynamic: false, name: 'Kundli' },
    { slug: 'horoscope', path: '/horoscope', isDynamic: false, name: 'Horoscope' },
    { slug: 'today-panchang', path: '/today-panchang', isDynamic: false, name: 'Today Panchang' },
    { slug: 'login', path: '/login', isDynamic: false, name: 'Login' },
    { slug: 'register', path: '/register', isDynamic: false, name: 'Register' },
    { slug: 'about-us', path: '/about-us', isDynamic: false, name: 'About Us' },
    { slug: 'contact-us', path: '/contact-us', isDynamic: false, name: 'Contact Us' },
    { slug: 'privacy-policy', path: '/privacy-policy', isDynamic: false, name: 'Privacy Policy' },
    { slug: 'terms', path: '/terms', isDynamic: false, name: 'Terms' },
    // Calculators
    { slug: 'calculators/ascendant-calculator', path: '/calculators/ascendant-calculator', isDynamic: false, name: 'Calculators > Ascendant Calculator' },
    { slug: 'calculators/ashtakavarga', path: '/calculators/ashtakavarga', isDynamic: false, name: 'Calculators > Ashtakavarga' },
    { slug: 'calculators/atmakaraka', path: '/calculators/atmakaraka', isDynamic: false, name: 'Calculators > Atmakaraka' },
    { slug: 'calculators/dasha-periods', path: '/calculators/dasha-periods', isDynamic: false, name: 'Calculators > Dasha Periods' },
    { slug: 'calculators/friendship-calculator', path: '/calculators/friendship-calculator', isDynamic: false, name: 'Calculators > Friendship Calculator' },
    { slug: 'calculators/gochar', path: '/calculators/gochar', isDynamic: false, name: 'Calculators > Gochar' },
    { slug: 'calculators/indian-calendar', path: '/calculators/indian-calendar', isDynamic: false, name: 'Calculators > Indian Calendar' },
    { slug: 'calculators/love-calculator', path: '/calculators/love-calculator', isDynamic: false, name: 'Calculators > Love Calculator' },
    { slug: 'calculators/marriage-career', path: '/calculators/marriage-career', isDynamic: false, name: 'Calculators > Marriage Career' },
    { slug: 'calculators/moon-sign-calculator', path: '/calculators/moon-sign-calculator', isDynamic: false, name: 'Calculators > Moon Sign Calculator' },
    { slug: 'calculators/nakshatra-calculator', path: '/calculators/nakshatra-calculator', isDynamic: false, name: 'Calculators > Nakshatra Calculator' },
    { slug: 'calculators/numerology-calculator', path: '/calculators/numerology-calculator', isDynamic: false, name: 'Calculators > Numerology Calculator' },
    { slug: 'calculators/sade-sati-calculator', path: '/calculators/sade-sati-calculator', isDynamic: false, name: 'Calculators > Sade Sati Calculator' },
    { slug: 'calculators/sun-sign-calculator', path: '/calculators/sun-sign-calculator', isDynamic: false, name: 'Calculators > Sun Sign Calculator' },
    { slug: 'calculators/yogini-dasha', path: '/calculators/yogini-dasha', isDynamic: false, name: 'Calculators > Yogini Dasha' }
];

function scanRoutes(dir, baseUrl = '') {
    let routes = [];

    if (!fs.existsSync(dir)) {
        console.warn(`[PageScanner] Directory not found: ${dir}`);
        return baseUrl === '' ? CORE_PAGES : [];
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            const folderName = item.name;

            // Skip hidden folders, API routes, admin, or group folders (parentheses)
            if (folderName.startsWith('.') || folderName === 'api' || folderName === 'admin' || folderName.startsWith('_')) continue;

            // EXCLUSION: Skip Blog Dynamic Routes (managed separately in Blog module)
            // If we are in the root 'blog' folder, we might want to skip traversing deep into [category]/[slug]
            if (baseUrl === '' && folderName === 'blog') {
                // We still want 'blog' page itself, but maybe not the deep dynamic ones? 
                // Actually, the user specifically pointed to 'blog/[category]/[slug]'
            }

            const fullPath = path.join(dir, folderName);

            // Check if directory contains page.js or page.tsx
            const hasPage = fs.existsSync(path.join(fullPath, 'page.js')) || fs.existsSync(path.join(fullPath, 'page.tsx'));

            // Handle Route Groups (e.g. (auth)) -> they don't add to URL
            let routeSegment = folderName;
            if (folderName.startsWith('(') && folderName.endsWith(')')) {
                routeSegment = ''; // Flatten
            }

            // Construct new URL base
            const newBaseUrl = baseUrl + (routeSegment ? `/${routeSegment}` : '');

            if (hasPage) {
                // Determine slug
                let slug = newBaseUrl;
                if (slug === '') slug = 'home'; // Root
                if (slug.startsWith('/')) slug = slug.substring(1); // Remove leading slash

                // EXCLUSION: Specifically skip 'blog/[category]/[slug]' and 'astrologer'
                if (slug === 'blog/[category]/[slug]' || slug === 'astrologer') {
                    continue; // Skip adding this route
                }

                // Identify dynamic routes
                const isDynamic = slug.includes('[') || slug.includes(']');

                routes.push({
                    slug: slug,
                    path: newBaseUrl || '/',
                    isDynamic: isDynamic,
                    name: formatRouteName(slug)
                });
            }

            // Recurse
            routes = routes.concat(scanRoutes(fullPath, newBaseUrl));
        } else if (item.name === 'page.js' || item.name === 'page.tsx') {
            // Root page case (if called on root)
            if (baseUrl === '') {
                routes.push({
                    slug: 'home',
                    path: '/',
                    isDynamic: false,
                    name: 'Home'
                });
            }
        }
    }

    // Deduplicate based on slug
    const uniqueRoutes = [];
    const map = new Map();
    for (const item of routes) {
        if (!map.has(item.slug)) {
            map.set(item.slug, true);
            uniqueRoutes.push(item);
        }
    }

    // If no routes found, return CORE_PAGES as fallback
    if (uniqueRoutes.length === 0 || uniqueRoutes.length === 1 && uniqueRoutes[0].slug === 'home') {
        return CORE_PAGES;
    }

    return uniqueRoutes.sort((a, b) => a.slug.localeCompare(b.slug));
}

function formatRouteName(slug) {
    if (slug === 'home') return 'Home Page';
    return slug
        .split('/')
        .map(segment => {
            if (segment.startsWith('[') && segment.endsWith(']')) {
                return segment.toUpperCase(); // [ID]
            }
            return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        })
        .join(' > ');
}

module.exports = { scanRoutes, FRONTEND_APP_DIR };
