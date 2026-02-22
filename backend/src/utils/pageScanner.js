const fs = require('fs');
const path = require('path');

const FRONTEND_APP_DIR = path.join(__dirname, '../../../frontend/src/app');

function scanRoutes(dir, baseUrl = '') {
    let routes = [];

    if (!fs.existsSync(dir)) {
        console.warn(`[PageScanner] Directory not found: ${dir}`);
        return [];
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
