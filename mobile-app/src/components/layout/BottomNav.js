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
    IndianRupee,
    LayoutGrid,
    PhoneCall,
    History
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: LayoutGrid },
    { name: "Chat/Call", href: "/explore", icon: PhoneCall },
    { name: "History", href: "/history", icon: History },
    { name: "Profile", href: "/profile", icon: User },
];

const astroItems = [
    { name: "Profile", href: "/profile", icon: Crown },
    { name: "Chats", href: "/chat", icon: MessageSquareText },
    { name: "History", href: "/history", icon: History },
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
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 bg-gradient-to-t from-[#050716]/95 via-[#050716]/75 to-transparent pointer-events-none backdrop-blur-[2px]">
            {/* SVG definitions for gradient icons */}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id="user-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e9d5ff" /> {/* purple-200 */}
                        <stop offset="50%" stopColor="#a855f7" /> {/* purple-500 */}
                        <stop offset="100%" stopColor="#6366f1" /> {/* indigo-500 */}
                    </linearGradient>
                    <linearGradient id="astro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" /> {/* yellow-200 */}
                        <stop offset="50%" stopColor="#eab308" /> {/* yellow-500 */}
                        <stop offset="100%" stopColor="#d97706" /> {/* amber-600 */}
                    </linearGradient>
                </defs>
            </svg>
            <nav className="mx-auto max-w-md rounded-[28px] px-2 py-1.5 flex items-center justify-between gap-0.5 pointer-events-auto shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-white/15 bg-[#090d24]/90 backdrop-blur-3xl mb-1.5 relative overflow-hidden">
                {/* Top specular rim light */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                {/* Subtle inner cosmic glow */}
                <div className={`absolute inset-0 opacity-25 pointer-events-none ${isAstro ? 'bg-gradient-to-r from-amber-500/0 via-amber-500/15 to-amber-500/0' : 'bg-gradient-to-r from-violet-500/0 via-violet-500/15 to-violet-500/0'}`}></div>

                {items.map((item, idx) => {
                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={`${item.href}-${idx}`}
                            href={item.href}
                            className="relative flex-1 min-w-0 h-[52px] rounded-[18px] flex flex-col items-center justify-center cursor-pointer select-none group z-10 active:scale-95 transition-transform"
                        >
                            <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full">
                                <Icon 
                                    size={19} 
                                    strokeWidth={isActive ? 2.2 : 1.7} 
                                    style={{
                                        stroke: isActive ? `url(#${isAstro ? 'astro-gradient' : 'user-gradient'})` : 'currentColor',
                                        filter: isActive ? `drop-shadow(0 2px 6px ${isAstro ? 'rgba(234,179,8,0.5)' : 'rgba(168,85,247,0.5)'})` : 'none',
                                    }}
                                    className={!isActive ? "text-slate-400 group-hover:text-slate-200 transition-colors" : "transition-transform scale-105"}
                                />
                                {/* Fixed text label - always visible */}
                                <span className={`text-[9.5px] tracking-tight leading-none text-center truncate max-w-full px-0.5 transition-colors ${
                                    isActive 
                                        ? (isAstro ? 'font-bold text-amber-300' : 'font-bold text-violet-300') 
                                        : 'font-medium text-slate-400 group-hover:text-slate-200'
                                }`}>
                                    {item.name}
                                </span>
                            </div>

                            {/* Active Indicator Bubble */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className={`absolute inset-0 rounded-[18px] border z-0 ${
                                        isAstro 
                                            ? 'bg-amber-500/15 border-amber-400/30 shadow-[0_0_16px_rgba(245,158,11,0.2)]' 
                                            : 'bg-violet-500/15 border-violet-400/30 shadow-[0_0_16px_rgba(168,85,247,0.2)]'
                                    }`}
                                    transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.7 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
