
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
        // Fix localhost leftovers
        if (path.includes('localhost:5000')) {
            return path.replace('http://localhost:5000', SERVER_BASE);
        }
        // Fix Mixed Content (HTTP on HTTPS site) for the live API
        if (path.includes('api.way2astro.com') && path.startsWith('http:')) {
            return path.replace('http:', 'https:');
        }
        return path;
    }

    // Ensure path starts with a slash if it's relative
    const relativePath = path.startsWith('/') ? path : `/${path}`;

    // If it's an upload from the backend, prepend SERVER_BASE
    if (relativePath.startsWith('/uploads/')) {
        return `${SERVER_BASE}${relativePath}`;
    }

    // Otherwise, assume it's a frontend asset (relative to public folder)
    return relativePath;
};
