"use client";

import { 
    Bell, 
    Search, 
    Menu, 
    User, 
    Wallet, 
    X, 
    Home, 
    Compass, 
    Sparkles, 
    Sun, 
    FileText, 
    Heart, 
    Star, 
    BookOpen, 
    LogOut,
    LayoutGrid,
    PhoneCall,
    Calendar,
    Clock,
    Activity,
    Hash,
    Moon,
    AlertTriangle,
    Flower2,
    PlayCircle,
    Shield,
    Crown,
    Briefcase
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils";

export default function ModernHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
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

    

    const menuSections = [
        {
            title: "MAIN",
            items: [
                { name: "Home", route: "/", icon: Home },
                { name: "Explore Services", route: "/services", icon: LayoutGrid, badge: "27+ SERVICES", badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/40" },
                { name: "Chat / Call Astrologers", route: "/explore", icon: PhoneCall, hideForAstro: true },
                { name: "Wallet", route: "/wallet", icon: Wallet },
            ]
        },
        {
            title: "VEDIC CHARTS & MUHURAT",
            items: [
                { name: "Free Kundli (Birth Chart)", route: "/kundli", icon: FileText, badge: "FREE", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" },
                { name: "Kundli Matching (Gun Milan)", route: "/matchmaking", icon: Heart, badge: "PREMIUM", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40" },
                { name: "Daily Panchang & Muhurat", route: "/panchang", icon: Calendar },
                { name: "Daily Horoscope", route: "/horoscope", icon: PlayCircle, badge: "CHECK", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40" },
                { name: "Hora & Choghadiya Muhurat", route: "/calculators/hora-muhurat", icon: Sparkles, badge: "NEW", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40" },
                { name: "Live Planets (Gochar)", route: "/calculators/gochar", icon: Activity, badge: "LIVE", badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40" },
                { name: "Dasha & Planetary Periods", route: "/calculators/dasha-periods", icon: Clock },
                { name: "Ashtakavarga Strengths", route: "/calculators/ashtakavarga", icon: Star },
                { name: "Arudha Lagna (Reputation)", route: "/arudha-lagna", icon: Shield },
            ]
        },
        {
            title: "CALCULATORS & DOSHAS",
            items: [
                { name: "Love Compatibility", route: "/love-calculator", icon: Heart },
                { name: "Moon & Sun Sign Calculator", route: "/calculators/moon-sign", icon: Moon },
                { name: "Sani Effects (Sade Sati)", route: "/dosha?type=sadesati", icon: Activity },
                { name: "Kaalsarp & Mangal Dosha", route: "/dosha?type=kaalsarp", icon: AlertTriangle },
                { name: "Numerology Numbers Guide", route: "/calculators/numerology", icon: Hash },
                { name: "Nakshatra & Lagna Calc", route: "/calculators/nakshatra", icon: Sun },
                { name: "Atmakaraka (Soul Planet)", route: "/calculators/atmakaraka", icon: Crown },
                { name: "Marriage & Career Timing", route: "/calculators/marriage-career", icon: Briefcase },
            ]
        },
        {
            title: "DEVOTION & KNOWLEDGE",
            items: [
                { name: "Online Pooja & Seva", route: "/online-pooja", icon: Flower2 },
                { name: "Cosmic Blogs & Wisdom", route: "/blog", icon: BookOpen },
            ]
        }
    ];

    const handleNavigation = (route) => {
        setIsMenuOpen(false);
        router.push(route);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 px-4 py-2.5 flex items-center justify-between transition-all duration-300 pointer-events-none ${isScrolled ? 'bg-[#050716]/85 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-b border-transparent'}`}
                style={{ 
                    paddingTop: 'calc(var(--safe-area-inset-top) + 0.6rem)'
                }}
            >
                <div className="flex items-center gap-2.5 pointer-events-auto">
                    {/* Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="w-10 h-10 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white active:scale-90 transition-all shadow-sm"
                        aria-label="Open menu"
                    >
                        <Menu size={19} />
                    </button>

                    {/* Profile Avatar - Clickable */}
                    <div
                        onClick={() => router.push('/profile')}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 via-purple-500 to-amber-400 p-[1.5px] cursor-pointer active:scale-90 transition-all shadow-sm"
                    >
                        <div className="w-full h-full rounded-[14px] bg-[#0c102a] flex items-center justify-center overflow-hidden border border-white/10">
                            <img 
                                src={getImageUrl(user?.profileImage, user?.gender)} 
                                alt={displayName} 
                                onError={(e) => { 
                                    e.currentTarget.onerror = null; 
                                    e.currentTarget.src = user?.gender === 'female' ? '/default-avatar-female.svg' : '/default-avatar.svg'; 
                                }}
                                className="w-full h-full object-cover" 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        onClick={() => router.push('/wallet')}
                        className="h-10 px-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 flex items-center gap-2 text-white active:scale-95 transition-all shadow-sm"
                    >
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center">
                            <Wallet size={12} className="text-amber-300" />
                        </div>
                        <span className="text-xs font-extrabold tracking-tight">₹{user?.walletBalance || 0}</span>
                    </button>

                    <button 
                        onClick={() => router.push('/notifications')}
                        className="w-10 h-10 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white relative active:scale-90 transition-all shadow-sm"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {user?.unreadNotifications > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
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
                            transition={{ type: "spring", damping: 28, stiffness: 240, mass: 0.8 }}
                            className="fixed top-0 left-0 bottom-0 w-[82%] max-w-[320px] bg-[#070a1e]/95 backdrop-blur-3xl border-r border-white/15 z-[70] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col pt-[var(--safe-area-inset-top)]"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-amber-400 p-[1.5px]">
                                        <div className="w-full h-full rounded-[14px] bg-[#0c102b] flex items-center justify-center">
                                            <Sparkles size={20} className="text-amber-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-white leading-none">Way2Astro</h2>
                                        <p className="text-[10px] text-violet-300 font-semibold tracking-wider uppercase mt-1">Celestial Guide</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 ios-scroll">
                                {menuSections.map((section, sIdx) => {
                                    const visibleItems = section.items.filter(item => !(user?.role === 'astrologer' && item.hideForAstro));
                                    if (visibleItems.length === 0) return null;

                                    return (
                                        <div key={section.title || sIdx} className="space-y-1">
                                            {section.title && (
                                                <p className="px-3 text-[9px] font-extrabold tracking-widest text-slate-500 uppercase mb-1">
                                                    {section.title}
                                                </p>
                                            )}
                                            {visibleItems.map((item) => {
                                                const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));
                                                return (
                                                    <button
                                                        key={item.name}
                                                        onClick={() => handleNavigation(item.route)}
                                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl transition-all active:scale-95 group cursor-pointer ${
                                                            isActive 
                                                            ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]" 
                                                            : "hover:bg-white/[0.06] text-slate-300"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className={`p-1.5 rounded-xl transition-colors shrink-0 ${isActive ? "bg-violet-500/25 text-violet-200" : "bg-white/[0.05] text-slate-400 group-hover:text-white"}`}>
                                                                <item.icon size={16} />
                                                            </div>
                                                            <span className="text-xs font-semibold tracking-tight truncate text-left">{item.name}</span>
                                                        </div>
                                                        {item.badge && (
                                                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-400/40'} uppercase shrink-0`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-5 border-t border-white/10 pb-[calc(var(--safe-area-inset-bottom)+1.5rem)]">
                                <button 
                                    onClick={() => {
                                        if (user?.role === 'astrologer' && (user?.isChatOnline || user?.isVoiceOnline || user?.isVideoOnline)) {
                                            toast.error("Please turn off Chat, Voice, and Video availability before logging out.");
                                            return;
                                        }
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 transition-all active:scale-95"
                                >
                                    <div className="p-2 rounded-xl bg-rose-500/15">
                                        <LogOut size={16} />
                                    </div>
                                    <span className="text-sm font-semibold">Log Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
