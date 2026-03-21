"use client";

import { Bell, Search, Menu, User, Wallet, X, Home, Compass, Sparkles, Sun, FileText, Heart, Star, BookOpen, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function ModernHeader() {
    const { user, logout } = useAuth();
    const { scrollY } = useScroll();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Show only first name or Seeker
    const displayName = user?.name ? user.name.split(' ')[0] : "Seeker";

    // Condense header slightly on scroll
    const background = useTransform(
        scrollY,
        [0, 50],
        ["rgba(11, 16, 38, 0)", "rgba(11, 16, 38, 0.8)"]
    );

    const backdropFilter = useTransform(
        scrollY,
        [0, 50],
        ["blur(0px)", "blur(12px)"]
    );

    const borderBottom = useTransform(
        scrollY,
        [0, 50],
        ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.1)"]
    );

    const menuItems = [
        { name: "Home", route: "/", icon: Home },
        { name: "Explore Astrologers", route: "/explore", icon: Compass, hideForAstro: true },
        { name: "Online Seva (Pooja)", route: "/online-pooja", icon: Sparkles, highlight: true },
        { name: "Daily Panchang", route: "/panchang", icon: Sun },
        { name: "Free Kundli", route: "/kundli", icon: FileText },
        { name: "Matching", route: "/matchmaking", icon: Heart },
        { name: "Horoscope", route: "/horoscope", icon: Star },
        { name: "Cosmic Blogs", route: "/blog", icon: BookOpen },
    ].filter(item => !(user?.role === 'astrologer' && item.hideForAstro));

    const handleNavigation = (route) => {
        setIsMenuOpen(false);
        router.push(route);
    };

    return (
        <>
            <motion.header
                className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between transition-all"
                style={{ 
                    background, 
                    backdropFilter, 
                    borderBottom,
                    paddingTop: 'calc(var(--safe-area-inset-top) + 0.75rem)'
                }}
            >
                <div className="flex items-center gap-3">
                    {/* Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white border-white/5 bg-white/5 active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Profile Avatar - Clickable */}
                    <div
                        onClick={() => router.push('/profile')}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-electric-violet to-solar-gold p-[2px] cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="w-full h-full rounded-full bg-cosmic-indigo flex items-center justify-center overflow-hidden border border-white/20">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-white/80" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/wallet')}
                        className="h-10 px-3 rounded-full glass-panel flex items-center gap-2 text-white hover:bg-white/10 transition-colors border-white/5 bg-white/5"
                    >
                        <Wallet size={16} className="text-solar-gold" />
                        <span className="text-xs font-black">₹{user?.walletBalance || 0}</span>
                    </button>
                    <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/10 transition-colors relative border-white/5 bg-white/5">
                        <Bell size={18} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b1026]" />
                    </button>
                </div>
            </motion.header>

            {/* Sidebar Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-cosmic-indigo border-r border-white/10 z-[70] shadow-2xl flex flex-col pt-[var(--safe-area-inset-top)]"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-electric-violet/20 flex items-center justify-center text-electric-violet">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white leading-none">Way2Astro</h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Celestial Guide</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => handleNavigation(item.route)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all active:scale-95 group ${
                                            item.highlight 
                                            ? "bg-electric-violet/10 text-electric-violet border border-electric-violet/20" 
                                            : "hover:bg-white/5 text-slate-300"
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${item.highlight ? "bg-electric-violet/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-sm font-bold">{item.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 border-t border-white/5 pb-[calc(var(--safe-area-inset-bottom)+1.5rem)]">
                                <button 
                                    onClick={() => { setIsMenuOpen(false); logout(); }}
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all active:scale-95 group"
                                >
                                    <div className="p-2 rounded-xl bg-rose-400/10 group-hover:bg-rose-400/20">
                                        <LogOut size={18} />
                                    </div>
                                    <span className="text-sm font-bold">Log Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
