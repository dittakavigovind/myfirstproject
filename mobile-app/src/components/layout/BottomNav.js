"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Home, 
    Compass, 
    MessageCircle, 
    User,
    MessageSquareText,
    ScrollText,
    Crown,
    IndianRupee
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: "/profile", icon: User },
];

const astroItems = [
    { name: "Profile", href: "/profile", icon: Crown },
    { name: "Chats", href: "/chat", icon: MessageSquareText },
    { name: "History", href: "/history", icon: ScrollText },
    { name: "Earnings", href: "/profile/earnings", icon: IndianRupee },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    
    // Don't show bottom nav in chat or call rooms
    if (pathname.includes("/chat/") || pathname.includes("/call/")) {
        return null;
    }

    const isAstro = user?.role === 'astrologer';
    const items = isAstro ? astroItems : navItems;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 bg-gradient-to-t from-[#0B0A1F]/90 via-[#0B0A1F]/70 to-transparent pointer-events-none backdrop-blur-sm">
            {/* SVG definitions for gradient icons */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id="user-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d8b4fe" /> {/* fuchsia-300 */}
                        <stop offset="50%" stopColor="#8b5cf6" /> {/* violet-500 */}
                        <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
                    </linearGradient>
                    <linearGradient id="astro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" /> {/* yellow-200 */}
                        <stop offset="50%" stopColor="#eab308" /> {/* yellow-500 */}
                        <stop offset="100%" stopColor="#d97706" /> {/* amber-600 */}
                    </linearGradient>
                </defs>
            </svg>
            <nav className="mx-auto max-w-md rounded-[32px] px-2 py-2 flex items-center justify-between pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 bg-white/5 backdrop-blur-2xl mb-2 relative overflow-hidden">
                {/* Subtle inner glow */}
                <div className={`absolute inset-0 opacity-20 ${isAstro ? 'bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0' : 'bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0'}`}></div>

                {items.map((item, idx) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={`${item.href}-${idx}`}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-[72px] h-[56px] rounded-full cursor-pointer select-none group z-10"
                        >
                            <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-500 ease-out ${isActive ? '-translate-y-1' : 'translate-y-0 opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5'}`}>
                                <Icon 
                                    size={24} 
                                    strokeWidth={isActive ? 2 : 1.5} 
                                    style={{
                                        stroke: isActive ? `url(#${isAstro ? 'astro-gradient' : 'user-gradient'})` : 'currentColor',
                                        filter: isActive ? `drop-shadow(0 4px 6px ${isAstro ? 'rgba(234,179,8,0.4)' : 'rgba(139,92,246,0.4)'})` : 'none',
                                    }}
                                    className={!isActive ? "text-slate-300" : ""}
                                />
                                {/* Subtle text label */}
                                <span className={`absolute -bottom-4 text-[10px] font-semibold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} ${isAstro ? 'text-amber-300' : 'text-violet-300'}`}>
                                    {item.name}
                                </span>
                            </div>

                            {/* Active Indicator Bubble */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className={`absolute inset-0 rounded-3xl border z-0 ${isAstro ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-violet-500/10 border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]'}`}
                                    transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
