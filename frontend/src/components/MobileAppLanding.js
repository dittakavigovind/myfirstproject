"use client";

import { Smartphone, Download, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import {
    PLAY_STORE_URL,
    APP_STORE_URL,
    buildAndroidIntentUrl,
    sanitizeInternalPath,
} from "../lib/appLinks";

export default function MobileAppLanding({
    platform = "android",
    targetPath = "/",
    onContinueWeb,
}) {
    const safeTarget = sanitizeInternalPath(targetPath);
    const androidIntentUrl = buildAndroidIntentUrl(safeTarget);

    return (
        <div className="fixed inset-0 z-[1000] min-h-screen bg-gradient-to-b from-[#0b1026] via-[#13183b] to-[#050716] text-white flex flex-col items-center justify-center p-5 overflow-y-auto">
            {/* Ambient Cosmic Glow */}
            <div className="fixed top-[-15%] left-[-10%] w-72 h-72 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-15%] right-[-10%] w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-7 shadow-2xl backdrop-blur-xl text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    Open in Way2Astro App
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    Get your personalized Kundli, daily horoscope, panchang, and instant consultations with verified astrologers.
                </p>

                {platform === "android" && (
                    <div className="space-y-3">
                        <a
                            href={PLAY_STORE_URL}
                            className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-amber-500/25 hover:opacity-95 transition-opacity"
                        >
                            <Download className="w-5 h-5" />
                            <span>Install on Google Play</span>
                        </a>

                        <a
                            href={androidIntentUrl}
                            className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold py-3 px-5 rounded-2xl text-sm transition-colors"
                        >
                            <Smartphone className="w-4 h-4 text-amber-300" />
                            <span>Already Installed? Open App</span>
                        </a>
                    </div>
                )}

                {platform === "ios" && (
                    <div className="space-y-3">
                        {APP_STORE_URL ? (
                            <a
                                href={APP_STORE_URL}
                                className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-amber-500/25 hover:opacity-95 transition-opacity"
                            >
                                <Download className="w-5 h-5" />
                                <span>Download on the App Store</span>
                            </a>
                        ) : (
                            <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-center">
                                <p className="text-sm font-semibold text-amber-300 mb-1">
                                    Apple App Store — Coming Soon
                                </p>
                                <p className="text-xs text-slate-300">
                                    Our iOS app is launching shortly. You can continue seamlessly on Way2Astro mobile web right now.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 pt-5 border-t border-white/10">
                    {onContinueWeb ? (
                        <button
                            type="button"
                            onClick={onContinueWeb}
                            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            <span>Continue on Mobile Website</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <a
                            href={safeTarget}
                            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            <span>Continue on Mobile Website</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
