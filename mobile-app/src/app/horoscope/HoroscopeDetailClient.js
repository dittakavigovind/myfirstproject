"use client";

import { useState, useEffect, useRef } from "react";
import CosmicCard from "@/components/CosmicCard";
import { ArrowLeft, Sparkles, Sun, Moon, Hash, Droplet, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function HoroscopeDetailContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeSignRef = useRef(null);
    
    const [horoscope, setHoroscope] = useState(null);
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

    useEffect(() => {
        fetchDailyHoroscope();
    }, []);

    // Scroll active sign into view
    useEffect(() => {
        if (activeSignRef.current) {
            activeSignRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeSign, loading]); 

    const fetchDailyHoroscope = async () => {
        try {
            setLoading(true);
            const res = await api.get("/horoscope-manager/daily");
            if (res.data && res.data.data) {
                setHoroscope(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching detailed horoscope data:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentData = horoscope?.signs?.[activeSign] || null;

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <main className="relative z-10 px-4 space-y-6">

                {/* Date / Title */}
                <div className="text-center">
                    <p className="text-electric-violet font-semibold text-sm mb-1 uppercase tracking-widest">
                        {horoscope ? new Date(horoscope.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Today"}
                    </p>
                    <h2 className="text-2xl font-bold text-white">{horoscope?.title || "Cosmic Alignment"}</h2>
                </div>

                {/* Zodiac Selector */}
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
                    {zodiacData.map((sign) => {
                        const isActive = activeSign === sign.id;
                        return (
                            <button
                                key={sign.id}
                                ref={activeSign === sign.id ? activeSignRef : null}
                                onClick={() => setActiveSign(sign.id)}
                                className={`snap-center flex-shrink-0 px-5 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-br from-electric-violet to-indigo-600 shadow-[0_4px_20px_rgba(139,92,246,0.4)] scale-100 border border-white/20'
                                        : 'glass-panel text-slate-400 scale-95 hover:bg-white/5 border border-white/5'
                                    }`}
                            >
                                <span className={`text-2xl ${isActive ? 'text-white' : ''}`}>{sign.icon}</span>
                                <span className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? 'text-white' : ''}`}>{sign.name}</span>
                            </button>
                        )
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
                            <p className="text-slate-400 font-medium">Reading the stars...</p>
                        </motion.div>
                    ) : !currentData ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="text-center py-20 text-slate-400"
                        >
                            <p>Cosmic insights are currently obscured by nebulas. Try again later.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeSign}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Main Reading Card */}
                            <CosmicCard className="bg-white/5 border-white/10 p-6 relative overflow-hidden" noHover>
                                <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-5 pointer-events-none">
                                    {zodiacData.find(z => z.id === activeSign)?.icon}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Moon className="text-electric-violet" size={18} />
                                    Prediction
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                                    {currentData.prediction || "Embrace the unknown today. Your energies are balanced but unpredictable."}
                                </p>
                            </CosmicCard>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Lucky Number */}
                                <CosmicCard className="p-4 flex flex-col items-center justify-center text-center gap-2" noHover>
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1">
                                        <Hash size={20} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lucky Number</span>
                                    <span className="text-xl font-bold text-white">{currentData.luckyNumber || "7"}</span>
                                </CosmicCard>

                                {/* Lucky Color */}
                                <CosmicCard className="p-4 flex flex-col items-center justify-center text-center gap-2" noHover>
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-1">
                                        <Droplet size={20} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lucky Color</span>
                                    <span className="text-xl font-bold text-white capitalize">{currentData.luckyColor || "Cosmic Blue"}</span>
                                </CosmicCard>
                            </div>

                            {/* Cosmic Vibe */}
                            <CosmicCard className="p-5 flex items-center justify-between" noHover>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-solar-gold/10 flex items-center justify-center text-solar-gold">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Cosmic Vibe</span>
                                        <span className="text-sm font-bold text-white capitalize">
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

                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-10" />
            </main>
        </div>
    );
}
