"use client";

import { useState, useEffect, useRef } from "react";
import CosmicCard from "@/components/CosmicCard";
import { 
    ArrowLeft, 
    Sparkles, 
    Sun, 
    Moon, 
    Hash, 
    Droplet, 
    Star, 
    Calendar, 
    Share2, 
    Briefcase, 
    Heart, 
    Activity, 
    Compass, 
    Zap 
} from "lucide-react";
import { Share } from "@capacitor/share";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function HoroscopeDetailContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeSignRef = useRef(null);
    
    const [timeframe, setTimeframe] = useState("daily"); // "daily" | "weekly" | "monthly"
    const [dailyData, setDailyData] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [activeSign, setActiveSign] = useState("aries");
    const [loading, setLoading] = useState(true);

    const zodiacData = [
        { id: "aries", icon: "♈", name: "Aries" },
        { id: "taurus", icon: "♉", name: "Taurus" },
        { id: "gemini", icon: "♊", name: "Gemini" },
        { id: "cancer", icon: "♋", name: "Cancer" },
        { id: "leo", icon: "♌", name: "Leo" },
        { id: "virgo", icon: "♍", name: "Virgo" },
        { id: "libra", icon: "♎", name: "Libra" },
        { id: "scorpio", icon: "♏", name: "Scorpio" },
        { id: "sagittarius", icon: "♐", name: "Sagittarius" },
        { id: "capricorn", icon: "♑", name: "Capricorn" },
        { id: "aquarius", icon: "♒", name: "Aquarius" },
        { id: "pisces", icon: "♓", name: "Pisces" }
    ];

    // Set active sign from query param or user profile
    useEffect(() => {
        const sign = searchParams.get('sign');
        if (sign) {
            setActiveSign(sign.toLowerCase());
        } else if (user?.birthDetails?.moonSign) {
            setActiveSign(user.birthDetails.moonSign.toLowerCase());
        }
    }, [user, searchParams]);

    // Fetch horoscope according to selected timeframe
    const fetchHoroscopeData = async (type) => {
        try {
            setLoading(true);
            if (type === "daily") {
                const res = await api.get("/horoscope-manager/daily");
                if (res.data?.success && res.data.data) {
                    setDailyData(res.data.data);
                }
            } else if (type === "weekly") {
                const res = await api.get("/horoscope-manager/weekly");
                if (res.data?.success && res.data.data) {
                    setWeeklyData(res.data.data);
                }
            } else if (type === "monthly") {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                const res = await api.get(`/horoscope-manager/monthly?month=${month}&year=${year}`);
                if (res.data?.success && res.data.data) {
                    setMonthlyData(res.data.data);
                }
            }
        } catch (error) {
            console.error(`Error fetching ${type} horoscope data:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (timeframe === "daily" && !dailyData) {
            fetchHoroscopeData("daily");
        } else if (timeframe === "weekly" && !weeklyData) {
            fetchHoroscopeData("weekly");
        } else if (timeframe === "monthly" && !monthlyData) {
            fetchHoroscopeData("monthly");
        }
    }, [timeframe]);

    // Scroll active sign into view
    useEffect(() => {
        if (activeSignRef.current) {
            activeSignRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeSign, loading]); 

    // Extract current sign horoscope content based on active timeframe
    const currentData = 
        timeframe === "daily" 
            ? dailyData?.signs?.[activeSign] 
            : timeframe === "weekly" 
                ? weeklyData?.signs?.[activeSign] 
                : monthlyData?.signs?.[activeSign];

    // Compute title & banner text
    const getHeaderInfo = () => {
        if (timeframe === "daily") {
            const dateStr = dailyData?.date 
                ? new Date(dailyData.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) 
                : "Today";
            return {
                badge: dateStr,
                title: dailyData?.title || "A Day for Confidence, Clarity, and Connection"
            };
        }
        if (timeframe === "weekly") {
            let badge = "This Week";
            if (weeklyData?.weekStartDate && weeklyData?.weekEndDate) {
                const start = new Date(weeklyData.weekStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const end = new Date(weeklyData.weekEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                badge = `${start} - ${end}`;
            }
            return {
                badge,
                title: currentData?.title || weeklyData?.title || "Weekly Cosmic Guidance"
            };
        }
        if (timeframe === "monthly") {
            let badge = "This Month";
            if (monthlyData?.month && monthlyData?.year) {
                badge = new Date(monthlyData.year, monthlyData.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
            }
            return {
                badge,
                title: currentData?.title || monthlyData?.title || "Monthly Cosmic Forecast"
            };
        }
        return { badge: "", title: "" };
    };

    const headerInfo = getHeaderInfo();

    // Share Horoscope with Way2Astro Branding Text
    const handleShareHoroscope = async () => {
        const signObj = zodiacData.find(z => z.id === activeSign);
        const signName = signObj?.name || "Zodiac";
        const signIcon = signObj?.icon || "✨";

        let shareTitle = "";
        let shareText = "";
        let shareUrl = "https://way2astro.com/daily-horoscope";

        if (timeframe === "daily") {
            const dateStr = dailyData?.date 
                ? new Date(dailyData.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) 
                : "Today";
            shareTitle = `Way2Astro • Daily Horoscope for ${signName}`;
            shareText = `🔮 Way2Astro • Daily Horoscope 🔮\n${signIcon} ${signName} • ${dateStr}\n\n✨ "${headerInfo.title}"\n\n📜 Today's Prediction:\n${currentData?.prediction || ''}\n\n🎲 Lucky Number: ${currentData?.luckyNumber || '7'}\n🎨 Lucky Color: ${currentData?.luckyColor || 'Cosmic Blue'}\n🌟 Cosmic Vibe: ${'⭐'.repeat(currentData?.cosmicVibe || 4)}\n\n✨ Read your full daily, weekly & monthly Vedic horoscope on Way2Astro:`;
            shareUrl = `https://way2astro.com/daily-horoscope?sign=${activeSign}`;
        } else if (timeframe === "weekly") {
            shareTitle = `Way2Astro • Weekly Horoscope for ${signName}`;
            shareText = `🔮 Way2Astro • Weekly Horoscope 🔮\n${signIcon} ${signName} • ${headerInfo.badge}\n\n✨ "${headerInfo.title}"\n\n📜 Weekly Guidance:\n${currentData?.prediction || ''}\n\n🍀 Luck: ${currentData?.luck || '95%'}\n⚡ Energy: ${currentData?.energy || 'High'}\n🧭 Cosmic Advice: ${currentData?.advice || 'Stay positive.'}\n\n✨ Read your weekly Vedic horoscope on Way2Astro:`;
            shareUrl = `https://way2astro.com/weekly-horoscope?sign=${activeSign}`;
        } else {
            shareTitle = `Way2Astro • Monthly Horoscope for ${signName}`;
            shareText = `🔮 Way2Astro • Monthly Horoscope 🔮\n${signIcon} ${signName} • ${headerInfo.badge}\n\n✨ "${headerInfo.title}"\n\n📜 Overview:\n${currentData?.overview || currentData?.prediction || ''}\n\n💼 Career: ${currentData?.career || 'Progressive developments.'}\n💍 Love: ${currentData?.love || 'Harmony and mutual support.'}\n🌿 Health: ${currentData?.health || 'Balance and vitality.'}\n\n✨ Discover your Vedic forecasts & Kundli analysis on Way2Astro:`;
            shareUrl = `https://way2astro.com/monthly-horoscope?sign=${activeSign}`;
        }

        const shareOptions = {
            title: shareTitle,
            text: `${shareText}\n${shareUrl}`,
            url: shareUrl,
            dialogTitle: `Share ${signName} Horoscope`
        };

        try {
            const canShare = await Share.canShare().catch(() => ({ value: false }));
            if (canShare && canShare.value) {
                await Share.share(shareOptions);
                return;
            }
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share(shareOptions);
                return;
            }
        } catch (err) {
            if (err && err.name !== 'AbortError') console.error(err);
            else return;
        }

        try {
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                toast.success(`${signName} Horoscope copied to clipboard!`);
                return;
            }
        } catch (e) {}
        toast.success("Horoscope ready to share!");
    };

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
            <main className="relative z-10 px-4 space-y-5">

                {/* Top Nav: Back Button, Title, Share Button */}
                <div className="flex items-center justify-between pt-1">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm cursor-pointer"
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="text-center">
                        <span className="text-[9px] font-black uppercase text-purple-300 tracking-[0.2em] block">
                            Vedic Astrology
                        </span>
                        <h1 className="text-sm font-black text-white uppercase tracking-wider">
                            Horoscope Forecast
                        </h1>
                    </div>
                    <button
                        onClick={handleShareHoroscope}
                        className="w-10 h-10 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm cursor-pointer"
                        aria-label="Share Horoscope"
                    >
                        <Share2 size={16} className="text-purple-300" />
                    </button>
                </div>

                {/* Timeframe Tabs: Daily, Weekly, Monthly */}
                <div className="flex p-1.5 bg-white/[0.06] rounded-2xl border border-white/10 gap-1.5 shadow-inner">
                    <button
                        onClick={() => setTimeframe("daily")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            timeframe === "daily"
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400/40"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                        <Sun size={13} className={timeframe === "daily" ? "text-amber-300" : "text-slate-500"} />
                        <span>Daily</span>
                    </button>
                    <button
                        onClick={() => setTimeframe("weekly")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            timeframe === "weekly"
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400/40"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                        <Sparkles size={13} className={timeframe === "weekly" ? "text-purple-300" : "text-slate-500"} />
                        <span>Weekly</span>
                    </button>
                    <button
                        onClick={() => setTimeframe("monthly")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            timeframe === "monthly"
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400/40"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                        <Moon size={13} className={timeframe === "monthly" ? "text-cyan-300" : "text-slate-500"} />
                        <span>Monthly</span>
                    </button>
                </div>

                {/* Date / Title */}
                <div className="text-center pt-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest mb-1.5 shadow-sm">
                        {headerInfo.badge}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                        {headerInfo.title}
                    </h2>
                </div>

                {/* Zodiac Selector */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar snap-x px-1">
                    {zodiacData.map((sign) => {
                        const isActive = activeSign === sign.id;
                        return (
                            <button
                                key={sign.id}
                                ref={activeSign === sign.id ? activeSignRef : null}
                                onClick={() => setActiveSign(sign.id)}
                                className={`snap-center flex-shrink-0 px-4 py-3 rounded-[22px] flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 cursor-pointer ${isActive
                                        ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-[0_6px_22px_rgba(139,92,246,0.4)] border border-violet-400/50 scale-100'
                                        : 'bg-white/[0.05] text-slate-400 border border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <span className={`text-2xl ${isActive ? 'text-white' : 'text-amber-300/80'}`}>{sign.icon}</span>
                                <span className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-white' : 'text-slate-400'}`}>{sign.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 gap-4"
                        >
                            <div className="w-10 h-10 rounded-full border-t-2 border-electric-violet animate-spin" />
                            <p className="text-slate-400 font-medium text-xs">Reading the stars for {zodiacData.find(z => z.id === activeSign)?.name}...</p>
                        </motion.div>
                    ) : !currentData ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="text-center py-20 text-slate-400 space-y-2"
                        >
                            <Droplet size={36} className="text-purple-400/40 mx-auto" />
                            <p className="text-sm">Cosmic insights are currently obscured by nebulas.</p>
                            <p className="text-xs text-slate-500">Please try again or check other timeframes.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`${timeframe}-${activeSign}`}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* 1. DAILY HOROSCOPE VIEW */}
                            {timeframe === "daily" && (
                                <>
                                    {/* Main Reading Card */}
                                    <CosmicCard className="bg-white/5 border-white/10 p-6 relative overflow-hidden" noHover>
                                        <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-5 pointer-events-none">
                                            {zodiacData.find(z => z.id === activeSign)?.icon}
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <Moon className="text-electric-violet" size={18} />
                                            Prediction
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line font-medium">
                                            {currentData.prediction || "Embrace the unknown today. Your energies are balanced and open to fresh possibilities."}
                                        </p>
                                    </CosmicCard>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Lucky Number */}
                                        <CosmicCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5" noHover>
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-0.5">
                                                <Hash size={20} />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lucky Number</span>
                                            <span className="text-xl font-black text-white">{currentData.luckyNumber || "7"}</span>
                                        </CosmicCard>

                                        {/* Lucky Color */}
                                        <CosmicCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5" noHover>
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-0.5">
                                                <Droplet size={20} />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lucky Color</span>
                                            <span className="text-xl font-black text-white capitalize">{currentData.luckyColor || "Cosmic Blue"}</span>
                                        </CosmicCard>
                                    </div>

                                    {/* Cosmic Vibe */}
                                    <CosmicCard className="p-5 flex items-center justify-between" noHover>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-solar-gold/10 flex items-center justify-center text-solar-gold">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cosmic Vibe</span>
                                                <span className="text-sm font-black text-white capitalize">
                                                    {currentData.cosmicVibe >= 4 ? "Excellent" : currentData.cosmicVibe === 3 ? "Neutral" : "Challenging"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={`${star <= (currentData.cosmicVibe || 3) ? 'text-solar-gold fill-solar-gold' : 'text-slate-600'} transition-colors`}
                                                />
                                            ))}
                                        </div>
                                    </CosmicCard>
                                </>
                            )}

                            {/* 2. WEEKLY HOROSCOPE VIEW */}
                            {timeframe === "weekly" && (
                                <>
                                    {/* Main Reading Card */}
                                    <CosmicCard className="bg-white/5 border-white/10 p-6 relative overflow-hidden" noHover>
                                        <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-5 pointer-events-none">
                                            {zodiacData.find(z => z.id === activeSign)?.icon}
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <Sparkles className="text-electric-violet" size={18} />
                                            Weekly Guidance
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line font-medium">
                                            {currentData.prediction || "Cosmic insights are aligning for your week ahead. Move forward with mindful steps."}
                                        </p>
                                    </CosmicCard>

                                    {/* Stats Grid: Luck & Energy */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <CosmicCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5" noHover>
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-300 mb-0.5">
                                                <Sparkles size={20} />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Luck</span>
                                            <span className="text-xl font-black text-white">{currentData.luck || "95%"}</span>
                                        </CosmicCard>

                                        <CosmicCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5" noHover>
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-300 mb-0.5">
                                                <Zap size={20} />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Energy Level</span>
                                            <span className="text-xl font-black text-white uppercase">{currentData.energy || "High"}</span>
                                        </CosmicCard>
                                    </div>

                                    {/* Cosmic Advice */}
                                    {currentData.advice && (
                                        <CosmicCard className="p-4 flex items-start gap-3 bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-transparent border-violet-400/25" noHover>
                                            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300 shrink-0">
                                                <Compass size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-violet-300 font-black uppercase tracking-wider block">Cosmic Advice</span>
                                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                    {currentData.advice}
                                                </p>
                                            </div>
                                        </CosmicCard>
                                    )}
                                </>
                            )}

                            {/* 3. MONTHLY HOROSCOPE VIEW */}
                            {timeframe === "monthly" && (
                                <>
                                    {/* Monthly Overview Card */}
                                    <CosmicCard className="bg-white/5 border-white/10 p-6 relative overflow-hidden" noHover>
                                        <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-5 pointer-events-none">
                                            {zodiacData.find(z => z.id === activeSign)?.icon}
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <Moon className="text-electric-violet" size={18} />
                                            Monthly Overview
                                        </h3>
                                        <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line font-medium">
                                            {currentData.overview || currentData.prediction || "A transformative month unfolds for your celestial sign."}
                                        </p>
                                    </CosmicCard>

                                    {/* Categories: Career, Love, Health */}
                                    <div className="space-y-3">
                                        {currentData.career && (
                                            <CosmicCard className="p-4 space-y-1.5 bg-white/[0.04] border-white/10" noHover>
                                                <div className="flex items-center gap-2 text-blue-300">
                                                    <Briefcase size={16} />
                                                    <h4 className="text-xs font-black uppercase tracking-wider">Career & Ambitions</h4>
                                                </div>
                                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                    {currentData.career}
                                                </p>
                                            </CosmicCard>
                                        )}

                                        {currentData.love && (
                                            <CosmicCard className="p-4 space-y-1.5 bg-white/[0.04] border-white/10" noHover>
                                                <div className="flex items-center gap-2 text-rose-300">
                                                    <Heart size={16} />
                                                    <h4 className="text-xs font-black uppercase tracking-wider">Love & Relationships</h4>
                                                </div>
                                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                    {currentData.love}
                                                </p>
                                            </CosmicCard>
                                        )}

                                        {currentData.health && (
                                            <CosmicCard className="p-4 space-y-1.5 bg-white/[0.04] border-white/10" noHover>
                                                <div className="flex items-center gap-2 text-emerald-300">
                                                    <Activity size={16} />
                                                    <h4 className="text-xs font-black uppercase tracking-wider">Health & Vitality</h4>
                                                </div>
                                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                                    {currentData.health}
                                                </p>
                                            </CosmicCard>
                                        )}

                                        {currentData.advice && (
                                            <CosmicCard className="p-4 flex items-start gap-3 bg-violet-500/10 border-violet-400/25" noHover>
                                                <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-300 shrink-0">
                                                    <Compass size={16} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-violet-300 font-black uppercase tracking-wider block">Monthly Guidance</span>
                                                    <p className="text-xs text-violet-100/90 leading-relaxed font-medium mt-0.5">
                                                        {currentData.advice}
                                                    </p>
                                                </div>
                                            </CosmicCard>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Share Horoscope Action Button with Branding */}
                            <button
                                onClick={handleShareHoroscope}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
                            >
                                <Share2 size={16} />
                                Share {zodiacData.find(z => z.id === activeSign)?.name} {timeframe === "daily" ? "Daily" : timeframe === "weekly" ? "Weekly" : "Monthly"} Horoscope
                            </button>

                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-10" />
            </main>
        </div>
    );
}
