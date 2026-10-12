/**
 * Cleans and normalizes blog HTML content for the mobile app's dark cosmic theme.
 * Strips out light-theme background gradients, hardcoded dark text colors,
 * and inline styles that prevent text from being visible on dark backgrounds.
 */
export function cleanBlogContent(content) {
    if (!content || typeof content !== 'string') return '';

    return content
        // 1. Remove inline color/background styles forcing dark text or white backgrounds
        .replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleBody) => {
            const cleaned = styleBody
                .replace(/color\s*:\s*(rgb\([0-9,\s]+\)|#[0-9a-fA-F]{3,6}|black|darkgray|dimgray)\s*;?/gi, '')
                .replace(/background(-color)?\s*:\s*(rgb\([0-9,\s]+\)|#[0-9a-fA-F]{3,6}|white|#fff|#ffffff|#f8fafc|#f1f5f9)\s*;?/gi, '');
            return cleaned.trim() ? `style="${cleaned.trim()}"` : '';
        })
        // 2. Remove light-theme background classes embedded in articles
        .replace(/\b(bg-gradient-to-[a-z0-9-]+|from-[a-z0-9-]+|to-[a-z0-9-]+|via-[a-z0-9-]+)\b/g, '')
        .replace(/\b(bg-white|bg-slate-[0-9]+|bg-gray-[0-9]+)\b/g, '')
        // 3. Normalize dark text classes (text-gray-800, text-slate-700, etc.) to light colors
        .replace(/\b(text-gray-[5-9]00|text-slate-[5-9]00|text-black)\b/g, 'text-slate-200')
        .replace(/\b(text-indigo-[7-9]00|text-purple-[7-9]00)\b/g, 'text-white');
}
