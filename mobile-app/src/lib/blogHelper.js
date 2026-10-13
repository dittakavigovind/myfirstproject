/**
 * Cleans and normalizes blog HTML content for the mobile app's dark cosmic theme.
 * Strips out light-theme background gradients, hardcoded dark text colors,
 * and inline styles that prevent text from being visible on dark backgrounds.
 */
export function cleanBlogContent(content) {
    if (!content || typeof content !== 'string') return '';

    return content
        // 1. Remove inline color/background/alignment styles forcing dark text, white backgrounds, or left alignment
        .replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styleBody) => {
            const cleaned = styleBody
                .replace(/color\s*:\s*(rgb\([0-9,\s]+\)|#[0-9a-fA-F]{3,6}|black|darkgray|dimgray)\s*;?/gi, '')
                .replace(/background(-color)?\s*:\s*(rgb\([0-9,\s]+\)|#[0-9a-fA-F]{3,6}|white|#fff|#ffffff|#f8fafc|#f1f5f9)\s*;?/gi, '')
                .replace(/(box-shadow|backdrop-filter)\s*:\s*[^;]+;?/gi, '')
                .replace(/text-align\s*:\s*(left|start)\s*;?/gi, '');
            return cleaned.trim() ? `style="${cleaned.trim()}"` : '';
        })
        // 2. Remove light-theme background classes embedded in articles
        .replace(/\b(bg-gradient-to-[a-z0-9-]+|from-[a-z0-9-]+|to-[a-z0-9-]+|via-[a-z0-9-]+)\b/g, '')
        .replace(/\b(bg-white|bg-slate-[0-9]+|bg-gray-[0-9]+)\b/g, '')
        // 3. Normalize dark text classes (text-gray-800, text-slate-700, etc.) to light colors
        .replace(/\b(text-gray-[5-9]00|text-slate-[5-9]00|text-black)\b/g, 'text-slate-200')
        .replace(/\b(text-indigo-[7-9]00|text-purple-[7-9]00)\b/g, 'text-white')
        // 4. Remove heavy article padding that restricts mobile width
        .replace(/\b(px-4|px-6|px-8|px-10|px-12|px-16|px-20|md:px-[0-9]+|lg:px-[0-9]+)\b/g, '')
        // 5. Remove text-left/text-start classes so justification is preserved
        .replace(/\b(text-left|text-start)\b/g, '');
}
