export const ANDROID_PACKAGE_ID = "com.way2astro.mobile";
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;

// Set NEXT_PUBLIC_IOS_APP_STORE_URL once the Apple App Store listing is live (e.g. https://apps.apple.com/app/id1234567890)
export const APP_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL || "";

/**
 * Detects whether the visitor is on Android, iOS, or Desktop.
 */
export function detectDevicePlatform() {
    if (typeof window === "undefined") return "desktop";

    const ua = navigator.userAgent || navigator.vendor || "";
    if (/android/i.test(ua)) return "android";

    if (
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    ) {
        return "ios";
    }

    return "desktop";
}

/**
 * Ensures any target redirect path stays strictly on this site (prevents open redirects).
 */
export function sanitizeInternalPath(rawPath) {
    if (!rawPath || typeof rawPath !== "string") return "/";
    const trimmed = rawPath.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
    return trimmed;
}

/**
 * Builds an Android Intent URL that opens the app directly if installed,
 * or falls back cleanly to Google Play Store.
 */
export function buildAndroidIntentUrl(targetPath = "/") {
    const safePath = sanitizeInternalPath(targetPath);
    const cleanPath = safePath.replace(/^\/+/, "");
    const fallbackEncoded = encodeURIComponent(PLAY_STORE_URL);
    return `intent://way2astro.com/${cleanPath}#Intent;scheme=https;package=${ANDROID_PACKAGE_ID};S.browser_fallback_url=${fallbackEncoded};end`;
}
