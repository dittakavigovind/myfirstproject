"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileAppLanding from "../../components/MobileAppLanding";
import { detectDevicePlatform, sanitizeInternalPath } from "../../lib/appLinks";

function OpenAppContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetPath = sanitizeInternalPath(searchParams?.get("to") || "/");
    const [platform, setPlatform] = useState(null);

    useEffect(() => {
        const detected = detectDevicePlatform();
        if (detected === "desktop") {
            router.replace(targetPath);
            return;
        }
        setPlatform(detected);
    }, [router, targetPath]);

    if (!platform) {
        return (
            <div className="min-h-screen bg-[#050716] text-white flex items-center justify-center p-6">
                <p className="text-sm text-slate-300">Opening Way2Astro...</p>
            </div>
        );
    }

    return (
        <MobileAppLanding
            platform={platform}
            targetPath={targetPath}
            onContinueWeb={() => router.replace(targetPath)}
        />
    );
}

export default function OpenPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#050716] text-white flex items-center justify-center p-6">
                    <p className="text-sm text-slate-300">Loading Way2Astro...</p>
                </div>
            }
        >
            <OpenAppContent />
        </Suspense>
    );
}
