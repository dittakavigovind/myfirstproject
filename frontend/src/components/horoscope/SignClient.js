"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import API from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Palette, Star, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignClient() {
    const params = useParams();
    const sign = params.sign;
    const [activeTab, setActiveTab] = useState('daily');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [featuredAstrologer, setFeaturedAstrologer] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Horoscope Data
                let res;
                const date = new Date();
                const signKey = sign?.toLowerCase();

                if (activeTab === 'daily') {
                    res = await API.get(`/horoscope-manager/daily?date=${date.toISOString()}`);
                } else if (activeTab === 'tomorrow') {
                    const tomorrow = new Date(date);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    res = await API.get(`/horoscope-manager/daily?date=${tomorrow.toISOString()}`);
                } else if (activeTab === 'weekly') {
                    res = await API.get(`/horoscope-manager/weekly?date=${date.toISOString()}`);
                } else if (activeTab === 'monthly') {
                    res = await API.get(`/horoscope-manager/monthly?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
                }

                // Fetch Featured Astrologer
                try {
                    const featuredRes = await API.get('/horoscope-manager/featured-astrologer');
                    if (featuredRes.data.success && featuredRes.data.data && featuredRes.data.data.showOnHoroscope) {
                        setFeaturedAstrologer(featuredRes.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch featured astrologer", err);
                }

                if (res.data.success) {
                    const signData = res.data.data.signs[signKey];

                    if (signData) {
                        let mappedData = {
                            date: res.data.data.date || res.data.data.weekStartDate || new Date(),
                            title: signData.title || res.data.data.title, // Sign specific title or global fallback
                            prediction: signData.prediction || signData.overview,
                            // Daily
                            luckyColor: signData.luckyColor,
                            luckyNumber: signData.luckyNumber,
                            rating: signData.cosmicVibe,
                            // Weekly
                            advice: signData.advice,
                            // Monthly
                            career: signData.career,
                            love: signData.love,
                            health: signData.health
                        };
                        setData(mappedData);
                    } else {
                        setData(null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch horoscope:", error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        if (sign) fetchData();
    }, [sign, activeTab]);

    const zodiacInfo = {
        aries: { color: 'from-red-500 to-orange-600', shadow: 'shadow-orange-500/30', accent: 'text-red-500', bg: 'bg-red-50' },
        taurus: { color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/30', accent: 'text-emerald-500', bg: 'bg-emerald-50' },
        gemini: { color: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-500/30', accent: 'text-amber-500', bg: 'bg-amber-50' },
        cancer: { color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/30', accent: 'text-cyan-500', bg: 'bg-cyan-50' },
        leo: { color: 'from-orange-500 to-red-600', shadow: 'shadow-red-500/30', accent: 'text-orange-500', bg: 'bg-orange-50' },
        virgo: { color: 'from-emerald-600 to-teal-700', shadow: 'shadow-emerald-500/30', accent: 'text-teal-600', bg: 'bg-teal-50' },
        libra: { color: 'from-indigo-400 to-pink-500', shadow: 'shadow-pink-500/30', accent: 'text-pink-500', bg: 'bg-pink-50' },
        scorpio: { color: 'from-purple-600 to-indigo-700', shadow: 'shadow-purple-500/30', accent: 'text-purple-600', bg: 'bg-purple-50' },
        sagittarius: { color: 'from-red-600 to-rose-700', shadow: 'shadow-rose-500/30', accent: 'text-rose-600', bg: 'bg-rose-50' },
        capricorn: { color: 'from-slate-600 to-gray-700', shadow: 'shadow-slate-500/30', accent: 'text-slate-600', bg: 'bg-slate-50' },
        aquarius: { color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/30', accent: 'text-sky-600', bg: 'bg-sky-50' },
        pisces: { color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30', accent: 'text-blue-500', bg: 'bg-blue-50' },
    };

    const currentTheme = zodiacInfo[sign?.toLowerCase()] || { color: 'from-astro-navy to-indigo-900', shadow: 'shadow-indigo-500/30', accent: 'text-indigo-600', bg: 'bg-indigo-50' };

    if (!sign) return null; // Or loader

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">
            {/* Header / Hero */}
            <div className={`relative bg-gradient-to-br ${currentTheme.color} text-white pb-32 pt-12 rounded-b-[4rem] shadow-2xl overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-black/10 rounded-full blur-[80px] pointer-events-none"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 mb-4">
                    <Link href="/horoscope" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-all bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-bold border border-white/10 shadow-lg">
                        <ArrowLeft size={18} /> Back to Zodiacs
                    </Link>
                </div>

                <div className="relative z-10 text-center px-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="inline-block"
                    >
                        <h1 className="text-6xl md:text-8xl font-black capitalize mb-2 drop-shadow-xl tracking-tighter">{sign}</h1>
                        <div className="flex flex-col items-center justify-center gap-3 opacity-90">
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-px w-8 bg-white/40"></div>
                                <p className="text-lg md:text-xl text-white font-bold uppercase tracking-[0.3em]">Horoscope</p>
                                <div className="h-px w-8 bg-white/40"></div>
                            </div>

                            {/* Featured Astrologer Credit */}
                            {featuredAstrologer && (
                                <motion.p
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-white/80 font-medium italic mt-1 flex items-center gap-2"
                                >
                                    by <span className="font-bold">{featuredAstrologer.name}</span>
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-20">
                <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/50 grid grid-cols-2 md:flex md:justify-center gap-2 mb-10 mx-auto max-w-2xl">
                    {['daily', 'tomorrow', 'weekly', 'monthly'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full md:w-auto px-4 md:px-6 py-3 md:py-3.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 relative overflow-hidden ${activeTab === tab
                                ? `bg-gradient-to-r ${currentTheme.color} text-white shadow-lg transform scale-105`
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            {tab === 'daily' ? 'Today' : tab === 'tomorrow' ? 'Tomorrow' : tab}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab + (loading ? 'load' : 'data')}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {loading ? (
                            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-2xl border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
                                <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6 border-slate-200 bg-gradient-to-r ${currentTheme.color} bg-clip-border`}></div>
                                <p className="text-slate-400 font-bold text-lg animate-pulse tracking-wide">Aligning the stars...</p>
                            </div>
                        ) : data ? (
                            <div className="flex flex-col gap-6">
                                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${currentTheme.color}`}></div>
                                    <div className="p-8 md:p-12">
                                        <div className="flex flex-col items-center mb-10 text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-100 mb-6">
                                                <Calendar size={14} />
                                                {activeTab === 'monthly' ? (
                                                    new Date(data.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                                                ) : activeTab === 'weekly' ? (
                                                    (() => {
                                                        const current = new Date(data.date);
                                                        const day = current.getDay();
                                                        const diff = current.getDate() - day;
                                                        const start = new Date(current);
                                                        start.setDate(diff);
                                                        const end = new Date(start);
                                                        end.setDate(start.getDate() + 6);
                                                        return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
                                                    })()
                                                ) : (
                                                    new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                                )}
                                            </span>
                                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 capitalize leading-tight">
                                                Your {activeTab} Forecast
                                            </h2>
                                            {/* Display Theme/Title Here - For Daily, Weekly, and Monthly */}
                                            {data.title && (
                                                <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mb-6 max-w-2xl mx-auto italic">
                                                    {data.title}
                                                </h3>
                                            )}
                                            <p className="text-slate-600 leading-loose text-lg md:text-xl text-center font-medium max-w-3xl mx-auto">
                                                {data.prediction}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {['daily', 'tomorrow'].includes(activeTab) && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border border-slate-100 shadow-xl transition-all relative overflow-hidden group">
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${currentTheme.color}`}></div>
                                            <div className={`w-14 h-14 rounded-2xl ${currentTheme.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <Palette className={`w-7 h-7 ${currentTheme.accent}`} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lucky Color</span>
                                            <span className="text-2xl font-black text-slate-800 capitalize">{data.luckyColor || 'N/A'}</span>
                                        </motion.div>
                                        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border border-slate-100 shadow-xl transition-all relative overflow-hidden group">
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${currentTheme.color}`}></div>
                                            <div className={`w-14 h-14 rounded-2xl ${currentTheme.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <Zap className={`w-7 h-7 ${currentTheme.accent}`} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lucky Number</span>
                                            <span className="text-2xl font-black text-slate-800">{data.luckyNumber || 'N/A'}</span>
                                        </motion.div>
                                        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center border border-slate-100 shadow-xl transition-all relative overflow-hidden group">
                                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${currentTheme.color}`}></div>
                                            <div className={`w-14 h-14 rounded-2xl ${currentTheme.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <Star className={`w-7 h-7 ${currentTheme.accent} fill-current`} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cosmic Vibe</span>
                                            <div className="flex gap-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < (data.rating || 3) ? `bg-gradient-to-br ${currentTheme.color}` : 'bg-slate-200'}`}></div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {activeTab === 'weekly' && data.advice && (
                                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Sparkles className="text-orange-500" /> Special Advice
                                        </h3>
                                        <p className="text-slate-600 text-lg leading-relaxed italic">
                                            {data.advice}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'monthly' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2">Career</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">{data.career || 'See administrative overview'}</p>
                                        </div>
                                        <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2">Love</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">{data.love || 'See administrative overview'}</p>
                                        </div>
                                        <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2">Health</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">{data.health || 'See administrative overview'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-lg border border-slate-100">
                                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium text-lg">Unable to load horoscope data.</p>
                                <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-700 underline">Try Again</button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
