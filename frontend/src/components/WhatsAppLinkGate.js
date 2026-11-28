"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MobileAppLanding from "./MobileAppLanding";
import { detectDevicePlatform } from "../lib/appLinks";

function WhatsAppLinkGateInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [platform, setPlatform] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Avoid doubling up on /open which already renders MobileAppLanding directly
        if (pathname === "/open" || pathname === "/open/") return;

        const source = searchParams?.get("source");
        const openParam = searchParams?.get("open");
        const shouldGateMobile = source === "whatsapp" || openParam === "app";
        if (!shouldGateMobile) return;

        const detected = detectDevicePlatform();
        if (detected === "android" || detected === "ios") {
            setPlatform(detected);
        }
    }, [pathname, searchParams]);

    if (!platform || dismissed) return null;

    const cleanParams = new URLSearchParams(searchParams?.toString() || "");
    cleanParams.delete("source");
    cleanParams.delete("open");
    const qs = cleanParams.toString();
    const targetPath = qs ? `${pathname}?${qs}` : pathname || "/";

    return (
        <MobileAppLanding
            platform={platform}
            targetPath={targetPath}
            onContinueWeb={() => setDismissed(true)}
        />
    );
}

export default function WhatsAppLinkGate() {
    return (
        <Suspense fallback={null}>
            <WhatsAppLinkGateInner />
        </Suspense>
    );
}
