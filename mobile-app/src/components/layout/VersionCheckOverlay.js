"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AlertTriangle } from "lucide-react";

// Helper function to compare semver versions (e.g., "1.0.5" vs "1.0.0")
// Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
const compareVersions = (v1, v2) => {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    return 0;
};

export default function VersionCheckOverlay() {
    const [needsUpdate, setNeedsUpdate] = useState(false);
    const [storeUrl, setStoreUrl] = useState("");

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // 1. Fetch public config
                const res = await api.get('/auth/public-config');
                const config = res.data.config;

                if (!config) return;

                // 2. If forceUpdate master switch is ON, force immediately
                if (config.forceUpdate) {
                    setStoreUrl(config.playStoreUrl);
                    setNeedsUpdate(true);
                    return;
                }

                // 3. Compare semver version if we are on native app
                if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
                    const { App } = await import("@capacitor/app");
                    const info = await App.getInfo();
                    const currentVersion = info.version; // e.g. "1.0.0"

                    if (config.minimumAppVersion) {
                        const comparison = compareVersions(currentVersion, config.minimumAppVersion);
                        if (comparison < 0) { // current < minimum
                            setStoreUrl(config.playStoreUrl);
                            setNeedsUpdate(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to check app version:", err);
            }
        };

        checkVersion();
    }, []);

    if (!needsUpdate) return null;

    const handleUpdateClick = async () => {
        if (storeUrl && window.Capacitor && window.Capacitor.isNativePlatform()) {
            const { App } = await import("@capacitor/app");
            // Native open url logic. If you have @capacitor/browser, you can use Browser.open.
            // But usually just setting window.location.href works for app store links.
            window.location.href = storeUrl;
        } else if (storeUrl) {
             window.open(storeUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-cosmic-indigo/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 w-full left-0 h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                
                <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} className="text-orange-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Update Required</h2>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    A new version of the app is required to continue. We've added new features and improvements to enhance your experience.
                </p>
                
                <button
                    onClick={handleUpdateClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                >
                    Update Now
                </button>
            </div>
        </div>
    );
}
