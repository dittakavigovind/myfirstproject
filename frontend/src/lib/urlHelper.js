
/**
 * Resolves a potentially relative image path into a full URL.
 * Checks if the path is already absolute, otherwise prepends the backend base URL.
 */
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const SERVER_BASE = isLocal ? 'http://localhost:5000' : 'http://192.168.29.133:5000';
export const API_BASE = `${SERVER_BASE}/api`;

export const resolveImageUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL (starts with http or data:), return as is
    if (path.startsWith('http') || path.startsWith('data:')) {
        if (path.includes('localhost:5000')) {
            return path.replace('http://localhost:5000', SERVER_BASE);
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
