"use client";

import { Bell, Search, Menu, User, Wallet, X, Home, Compass, Sparkles, Sun, FileText, Heart, Star, BookOpen, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function ModernHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (!scrollContainer) {
            const handleScroll = () => setIsScrolled(window.scrollY > 20);
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }

        const handleScroll = () => setIsScrolled(scrollContainer.scrollTop > 20);
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const displayName = user?.name ? user.name.split(' ')[0] : "Seeker";

    const getImageUrl = (path, gender = null) => {
        if (!path || path.includes('default-avatar.png')) {
            return gender === 'female' ? "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        }
        if (path.startsWith("http")) return path.replace('localhost:5000', '192.168.29.133:5000');
        const normalizedPath = path.replace(/\\/g, "/");
        return `http://192.168.29.133:5000${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    };

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
            <header
                className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between transition-all duration-300 pointer-events-none ${isScrolled ? 'bg-[#0b1026]/90 backdrop-blur-md border-b border-white/10 header-scrolled' : 'bg-transparent border-b border-transparent'}`}
                style={{ 
                    paddingTop: 'calc(var(--safe-area-inset-top) + 0.75rem)'
                }}
            >
                <div className="flex items-center gap-3 pointer-events-auto">
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
                            <img src={getImageUrl(user?.profileImage, user?.gender)} alt={displayName} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        onClick={() => router.push('/wallet')}
                        className="h-10 px-3 rounded-full glass-panel flex items-center gap-2 text-white hover:bg-white/10 transition-colors border-white/5 bg-white/5"
                    >
                        <Wallet size={16} className="text-rose-500" />
                        <span className="text-xs font-black">₹{user?.walletBalance || 0}</span>
                    </button>
                    <button 
                        onClick={() => router.push('/notifications')}
                        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/10 transition-colors relative border-white/5 bg-white/5 active:scale-95 transition-all"
                    >
                        <Bell size={18} />
                        {user?.unreadNotifications > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b1026]" />
                        )}
                    </button>
                </div>
            </header>

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
                                    onClick={() => {
                                        if (user?.role === 'astrologer' && (user?.isChatOnline || user?.isVoiceOnline || user?.isVideoOnline)) {
                                            alert("Please turn off Chat, Voice, and Video availability before logging out.");
                                            return;
                                        }
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
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
