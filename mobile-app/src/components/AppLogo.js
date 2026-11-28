"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

const FALLBACK_APP_ICON = "/icons/app-icon.webp";
let cachedIconPromise = null;
let cachedIconUrl = null;

function fetchLiveAppIconUrl() {
    if (cachedIconUrl) return Promise.resolve(cachedIconUrl);
    if (!cachedIconPromise) {
        cachedIconPromise = api
            .get("/site-settings", {
                silent: true,
                headers: { "X-Silent-Error": "true" },
            })
            .then((res) => {
                const rawUrl = res?.data?.settings?.mobileAppIconUrl;
                if (rawUrl) {
                    cachedIconUrl = getImageUrl(rawUrl);
                    return cachedIconUrl;
                }
                return null;
            })
            .catch(() => null);
    }
    return cachedIconPromise;
}

export default function AppLogo({
    alt = "Way2Astro",
    width,
    height,
    className = "w-full h-full object-cover",
    loading = "eager",
}) {
    const [src, setSrc] = useState(cachedIconUrl || FALLBACK_APP_ICON);

    useEffect(() => {
        let active = true;
        fetchLiveAppIconUrl().then((liveUrl) => {
            if (active && liveUrl) {
                setSrc(liveUrl);
            }
        });
        return () => {
            active = false;
        };
    }, []);

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            className={className}
            onError={() => {
                if (src !== FALLBACK_APP_ICON) {
                    setSrc(FALLBACK_APP_ICON);
                }
            }}
        />
    );
}
