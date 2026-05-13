"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, User, History } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Profile", href: "/profile", icon: User },
];

const astroItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Chats", href: "/chat", icon: MessageCircle },
    { name: "History", href: "/history", icon: History },
    { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    
    const items = user?.role === 'astrologer' ? astroItems : navItems;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 bg-gradient-to-t from-cosmic-indigo via-cosmic-indigo/90 to-transparent pointer-events-none">
            <nav className="glass-panel mx-auto max-w-md rounded-full px-2 py-2 flex items-center justify-between pointer-events-auto shadow-2xl shadow-electric-violet/10">
                {items.map((item, idx) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={`${item.href}-${idx}`}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-16 h-12 rounded-full cursor-pointer select-none"
                        >
                            <div className={`relative z-10 p-2 rounded-full transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {/* Active Indicator Bubble */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute inset-1 rounded-full bg-electric-violet/30 border border-electric-violet/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] z-0"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
