"use client";

import { motion } from "framer-motion";
import { Sparkles, Star, Sun, Moon } from "lucide-react";

export default function CosmicLoader({
    size = "md",
    message = "Reading the Stars...",
    fullscreen = true,
    transparent = false
}) {
    // Size config
    const sizes = {
        sm: { container: "w-16 h-16", icon: 20, ring: "w-16 h-16", text: "text-xs" },
        md: { container: "w-32 h-32", icon: 32, ring: "w-32 h-32", text: "text-sm" },
        lg: { container: "w-48 h-48", icon: 48, ring: "w-48 h-48", text: "text-xl" },
    };
    const s = sizes[size] || sizes.md;
    if (!s) return null; // Additional safety

    const Content = () => (
        <div className="flex flex-col items-center justify-center relative z-50">
            {/* Spinning Rings */}
            <div className={`relative flex items-center justify-center ${s.container}`}>
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 rounded-full border border-dashed border-indigo-400/30 ${s.ring}`}
                />

                {/* Middle Ring (Reverse) */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-4 rounded-full border border-dotted border-astro-yellow/40`}
                />

                {/* Inner Ring (Fast) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-8 rounded-full border-2 border-transparent border-t-indigo-500 border-b-purple-500 opacity-80`}
                />

                {/* Central Pulsing Sun/Orb */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-600 rounded-full p-3 shadow-lg shadow-orange-500/50"
                >
                    <Sun size={s.icon} className="text-white" fill="currentColor" />
                </motion.div>

                {/* Orbiting Planet 1 */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div className="w-3 h-3 bg-blue-400 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-sm shadow-blue-400/50"></div>
                </motion.div>

                {/* Orbiting Planet 2 */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 w-auto h-auto"
                >
                    <div className="w-2 h-2 bg-purple-400 rounded-full absolute top-1/2 -right-1 shadow-sm shadow-purple-400/50"></div>
                </motion.div>
            </div>

            {/* Message Text */}
            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-pulse ${s.text} text-center`}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${transparent ? "bg-black/80 backdrop-blur-sm" : "bg-[#0f0c29]"}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f0c29] to-black pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                <Content />
            </div>
        );
    }

    return <Content />;
}
