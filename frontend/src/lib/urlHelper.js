
/**
 * Resolves a potentially relative image path into a full URL.
 * Checks if the path is already absolute, otherwise prepends the backend base URL.
 */
// Build-time environment variables
const envApiUrl = process.env.NEXT_PUBLIC_API_URL; // e.g., 'http://192.168.29.133:5000/api'

// Fallback logic for local development if not set in .env
const fallbackServer = "http://localhost:5000";

let computedApiBase = envApiUrl || `${fallbackServer}/api`;
let computedServerBase = computedApiBase.replace(/\/api$/, '');

export const SERVER_BASE = computedServerBase;
export const API_BASE = computedApiBase;

export const resolveImageUrl = (path) => {
    if (!path) return null;

    // Handle absolute URLs
    if (path.startsWith('http') || path.startsWith('data:')) {
        let transformed = path;

        // 1. Fix localhost leftovers and convert to current SERVER_BASE
        if (transformed.includes('localhost:5000')) {
            transformed = transformed.replace('http://localhost:5000', SERVER_BASE);
        }

        // 2. Fix Mixed Content and ensure /api/uploads prefix for the live API
        if (transformed.includes('api.way2astro.com')) {
            // Force HTTPS
            transformed = transformed.replace('http://api.way2astro.com', 'https://api.way2astro.com');

            // Ensure /api/uploads/ instead of /uploads/ for reliable proxying
            if (transformed.includes('/uploads/') && !transformed.includes('/api/uploads/')) {
                transformed = transformed.replace('/uploads/', '/api/uploads/');
            }
            return transformed;
        }

        return transformed;
    }

    // Ensure path starts with a slash if it's relative
    const relativePath = path.startsWith('/') ? path : `/${path}`;

    // If it's an upload from the backend, prepend SERVER_BASE and ensure /api prefix
    if (relativePath.startsWith('/uploads/')) {
        return `${SERVER_BASE}/api${relativePath}`;
    }

    // Otherwise, assume it's a frontend asset (relative to public folder)
    return relativePath;
};
