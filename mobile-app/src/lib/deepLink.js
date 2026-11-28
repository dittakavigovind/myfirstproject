const WEB_TO_MOBILE_PATH_MAP = {
    "/daily-horoscope": "/horoscope",
    "/weekly-horoscope": "/horoscope",
    "/monthly-horoscope": "/horoscope",
    "/astrologers": "/explore",
    "/chat-with-astrologer": "/explore",
    "/talk-to-astrologer": "/explore",
    "/astrologers/details": "/astrologer",
    "/today-panchang": "/panchang",
    "/kaalsarp-dosha": "/dosha",
    "/mangal-dosha": "/dosha",
    "/privacy-policy": "/privacy",
    "/astrology-session": "/explore",
};

const KNOWN_MOBILE_PREFIXES = [
    "/about",
    "/arudha-lagna",
    "/astrologer",
    "/astrologer-terms",
    "/auth",
    "/blog",
    "/calculators",
    "/call",
    "/chat",
    "/disclaimer",
    "/dosha",
    "/explore",
    "/following",
    "/history",
    "/horoscope",
    "/kundli",
    "/love-calculator",
    "/matchmaking",
    "/notifications",
    "/online-pooja",
    "/panchang",
    "/privacy",
    "/profile",
    "/services",
    "/settings",
    "/support",
    "/terms",
    "/wallet",
];

const TRACKING_PARAMS = ["source", "open", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

/**
 * Resolves an incoming Universal/App Link URL (e.g. https://way2astro.com/open?to=/horoscope)
 * into an internal mobile-app Next.js route.
 */
export function resolveDeepLinkTarget(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return null;

    try {
        const parsed = new URL(rawUrl);
        if (!["way2astro.com", "www.way2astro.com"].includes(parsed.hostname.toLowerCase())) {
            return null;
        }

        let pathname = parsed.pathname.replace(/\/+$/, "") || "/";
        const params = new URLSearchParams(parsed.search);

        // Handle smart-link wrapper: https://way2astro.com/open?to=/horoscope
        if (pathname === "/open") {
            const toParam = params.get("to");
            if (toParam && toParam.startsWith("/")) {
                const nested = new URL(toParam, "https://way2astro.com");
                pathname = nested.pathname.replace(/\/+$/, "") || "/";
                nested.searchParams.forEach((val, key) => {
                    if (!params.has(key)) params.set(key, val);
                });
            } else {
                pathname = "/";
            }
            params.delete("to");
        }

        // Strip tracking params before navigating inside the app
        TRACKING_PARAMS.forEach((key) => params.delete(key));

        // Normalize web-only paths to mobile-app equivalents
        if (WEB_TO_MOBILE_PATH_MAP[pathname]) {
            pathname = WEB_TO_MOBILE_PATH_MAP[pathname];
        } else if (pathname.startsWith("/blog/article/")) {
            pathname = pathname.replace("/blog/article/", "/blog/");
        }

        // Ensure route exists in mobile-app static export; otherwise fall back to home
        const isKnownRoute =
            pathname === "/" ||
            KNOWN_MOBILE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

        if (!isKnownRoute) {
            pathname = "/";
        }

        const qs = params.toString();
        return qs ? `${pathname}?${qs}` : pathname;
    } catch {
        return null;
    }
}
