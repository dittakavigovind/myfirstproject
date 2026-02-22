"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import API from '../../lib/api';
import PremiumFAQ from '../PremiumFAQ';
import CosmicLoader from '../CosmicLoader';
import PageContentSection from '../common/PageContentSection';
import { motion, AnimatePresence } from 'framer-motion';

// Specific icon imports for better performance
import {
    PlayCircle, MessageCircle, Phone, FileText, Calendar,
    BookOpen, Sparkles, Star, ArrowRight, Activity,
    CheckCircle, Heart, Moon, Sun, Users, Clock,
    Hash, Shield, Zap, AlertTriangle, Briefcase,
    ChevronDown
} from 'lucide-react';

// For dynamic services, we can import what we need or use a map
const LucideIconMap = {
    MessageCircle, Phone, FileText, Calendar, Sparkles,
    Star, ArrowRight, Activity, Heart, Moon, Sun,
    Users, Clock, Hash, Shield, Zap, AlertTriangle,
    Briefcase, PlayCircle, BookOpen
};


export default function HomeClient() {
    const { user, loading: authLoading } = useAuth(); // Get User
    const { navBadges, exploreServices, featureFlags } = useTheme();
    const [astrologers, setAstrologers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const res = await API.get('/astro/astrologers');
                if (res.data.success) {
                    setAstrologers(res.data.data.slice(0, 4)); // Show top 4
                }
            } catch (error) {
                console.error("Failed to fetch astrologers", error);
            } finally {
                // Reduced delay for better UX
                setTimeout(() => setLoading(false), 300);
            }
        };
        fetchData();
    }, []);

    // -------------------------------------------------------------------------
    // HYDRATION & AUTH LOADING
    // -------------------------------------------------------------------------
    if (!mounted || authLoading) {
        return <CosmicLoader size="lg" message="Aligning the Stars..." fullscreen={true} />;
    }

    // -------------------------------------------------------------------------
    // ASTROLOGER VIEW
    // -------------------------------------------------------------------------
    if (user?.role === 'astrologer') {
        return (
            <main className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        {/* Premium Background */}
                        <div className="absolute inset-0 h-[600px] bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-slate-50 z-0 overflow-hidden rounded-b-[3rem]">
                            <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                        </div>

                        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
                            {/* Header */}
                            <div className="text-center mb-16">
                                <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg mb-4">
                                    <span className="text-purple-200 text-xs font-bold tracking-[0.2em] uppercase">Astrologer Portal</span>
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                                    Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200">{user.displayName || user.name?.split(' ')[0]}</span>
                                </h1>
                                <p className="text-indigo-200/80 text-lg font-medium max-w-2xl mx-auto">
                                    Ready to guide souls? Manage your consultations and profile from here.
                                </p>
                            </div>

                            {/* Access Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {/* Dashboard Card */}
                                <Link href="/astrologer/dashboard">
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-2xl shadow-indigo-900/10 group cursor-pointer h-full relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                                <Activity size={28} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors">Dashboard</h3>
                                            <p className="text-slate-500 font-medium">View earnings, recent call logs, and manage your status.</p>
                                        </div>
                                    </motion.div>
                                </Link>

                                {/* Profile Card */}
                                <Link href={`/astrologers/${user._id}`}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-2xl shadow-indigo-900/10 group cursor-pointer h-full relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                <Star size={28} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">My Profile</h3>
                                            <p className="text-slate-500 font-medium">Update your bio, skills, languages, and pricing details.</p>
                                        </div>
                                    </motion.div>
                                </Link>

                                {/* Common Tools */}
                                <div className="space-y-4">
                                    <Link href="/horoscope">
                                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-lg flex items-center gap-4 cursor-pointer hover:bg-white transition-colors">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">Daily Horoscope</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Check Transit</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                    <Link href="/today-panchang">
                                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-lg flex items-center gap-4 cursor-pointer hover:bg-white transition-colors">
                                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">Panchang</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Today's Muhurat</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                    <Link href="/kundli">
                                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-lg flex items-center gap-4 cursor-pointer hover:bg-white transition-colors">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">Free Kundli</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Generate Chart</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            <AnimatePresence mode="wait">
                {loading ? (
                    <CosmicLoader key="loader" size="lg" message="Aligning the Stars..." fullscreen={true} />
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Hero Section */}
                        <div className="relative text-white overflow-hidden">
                            <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-0 overflow-hidden transform scale-x-[1.02]">
                                <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                            </div>

                            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-24 md:pt-12 md:pb-32">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 text-center md:text-left">
                                    {/* LEFT: Content */}
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                                            <Sparkles className="w-4 h-4 text-astro-yellow animate-pulse" />
                                            <span className="text-indigo-100 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                                                India's #1 Astrology Platform
                                            </span>
                                        </div>

                                        <h1 className="text-3xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight text-white">
                                            Your Destiny, Decoded by <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-yellow-200 drop-shadow-sm">
                                                Vedic experts
                                            </span>
                                        </h1>

                                        <p className="text-sm md:text-base text-indigo-100/80 mb-0 md:max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
                                            Get accurate guidance for your future, career, and relationships. Connect with certified astrologers instantly.
                                        </p>
                                    </div>

                                    {/* RIGHT: Actions (Moved from Left) */}
                                    <div className="flex-1 w-full md:max-w-md">
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                                            {/* Subtle Decorative Background */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>

                                            {(featureFlags?.enableChat || featureFlags?.enableCall) ? (
                                                <div className="relative z-10 flex flex-col gap-4">
                                                    <h3 className="text-lg font-bold text-white mb-2 ml-1">Connect with Experts</h3>
                                                    {featureFlags?.enableChat && (
                                                        <Link href="/chat-with-astrologer" className="w-full">
                                                            <button className="w-full bg-gradient-to-r from-astro-yellow to-orange-500 text-astro-navy px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-base">
                                                                <MessageCircle size={20} /> Chat Now
                                                            </button>
                                                        </Link>
                                                    )}
                                                    {featureFlags?.enableCall && (
                                                        <Link href="/astrologers" className="w-full">
                                                            <button className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 text-base">
                                                                <Phone size={20} /> Talk to Astrologer
                                                            </button>
                                                        </Link>
                                                    )}
                                                    <div className="mt-4 flex items-center justify-center gap-6 text-indigo-200/60 text-xs font-bold uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> Secure</span>
                                                        <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> Private</span>
                                                        <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> 24/7</span>
                                                    </div>
                                                </div>
                                            ) : featureFlags?.promotionImage ? (
                                                <div className="absolute inset-0 z-0 cursor-pointer block h-full w-full">
                                                    {featureFlags?.promotionUrl ? (() => {
                                                        const url = featureFlags.promotionUrl;
                                                        const isExternal = url.startsWith('http') || url.startsWith('www');
                                                        const href = url.startsWith('www') ? `https://${url}` : url;

                                                        return (
                                                            <Link href={href} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                                                <img
                                                                    src={featureFlags.promotionImage}
                                                                    alt="Promotion"
                                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                                />
                                                            </Link>
                                                        );
                                                    })() : (
                                                        <img
                                                            src={featureFlags.promotionImage}
                                                            alt="Promotion"
                                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="max-w-7xl mx-auto px-4 relative z-20 -mt-16 md:-mt-24 mb-10">
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-100 p-8 md:p-12 mb-4"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">Explore Services</h3>
                                        <p className="text-slate-500 font-medium">Ancient wisdom meets modern technology.</p>
                                    </div>
                                    <div className="w-full md:w-auto h-1 bg-slate-100 rounded-full flex-1 md:mx-6"></div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                                    {exploreServices && exploreServices.length > 0 ? (
                                        exploreServices
                                            .filter(s => s.enabled)
                                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                                            .map((service, index) => {
                                                const Icon = LucideIconMap[service.icon] || Sparkles;
                                                return (
                                                    <ServiceCard
                                                        key={service.id || index}
                                                        icon={Icon}
                                                        title={service.title}
                                                        desc={service.desc}
                                                        color={service.color}
                                                        href={service.href}
                                                        delay={0.1 + (index * 0.1)}
                                                        badges={navBadges}
                                                    />
                                                );
                                            })
                                    ) : (
                                        <>
                                            <>
                                                {featureFlags?.enableChat && <ServiceCard icon={MessageCircle} title="Chat" desc="First Free" color="blue" href="/chat-with-astrologer" delay={0.1} badges={navBadges} />}
                                                {featureFlags?.enableCall && <ServiceCard icon={Phone} title="Call" desc="Connect Now" color="green" href="/astrologers" delay={0.2} badges={navBadges} />}
                                                <ServiceCard icon={FileText} title="Free Kundli" desc="Full Report" color="purple" href="/kundli" delay={0.3} badges={navBadges} />
                                                <ServiceCard icon={Users} title="Matchmaking" desc="Compatibility" color="indigo" href="/matchmaking" delay={0.4} badges={navBadges} />
                                                <ServiceCard icon={Briefcase} title="Marriage & Career" desc="Timing Analysis" color="pink" href="/calculators/marriage-career" delay={0.45} badges={navBadges} />
                                                <ServiceCard icon={PlayCircle} title="Horoscope" desc="Daily Insights" color="red" href="/horoscope" delay={0.5} badges={navBadges} />
                                                <ServiceCard icon={Calendar} title="Panchang" desc="Muhurat" color="orange" href="/today-panchang" delay={0.5} badges={navBadges} />
                                            </>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Live Astrologers Section */}
                        {featureFlags?.enableTopAstrologers && (
                            <div className="max-w-7xl mx-auto px-6 mt-10">
                                <div className="flex justify-between items-end mb-10">
                                    <div>
                                        <span className="text-emerald-600 font-bold tracking-wider text-xs uppercase mb-2 block flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            Live Now
                                        </span>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Top Astrologers</h3>
                                    </div>
                                    <Link href="/astrologers" className="hidden md:flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors group">
                                        View All Experts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {astrologers.map((astro, index) => (
                                        <motion.div
                                            key={astro._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + (index * 0.1) }}
                                            className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex flex-row gap-5 items-start">
                                                <div className="flex-shrink-0 flex flex-col items-center">
                                                    <div className="relative">
                                                        <div className={`w-24 h-24 rounded-full p-1 border-[3px] ${astro.isOnline ? 'border-emerald-500' : 'border-orange-400'}`}>
                                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                                {astro.image ? (
                                                                    <img src={astro.image} alt={astro.displayName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 font-bold text-2xl">
                                                                        {astro.displayName?.[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {astro.isOnline && <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-10" />}
                                                    </div>
                                                    <div className="mt-2 flex flex-col items-center">
                                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                                            <Star size={12} fill="currentColor" />
                                                            <span>{astro.rating || 4.5}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 pt-1">
                                                    <Link href={`/astrologers/${astro.slug || astro._id}`}>
                                                        <h4 className="font-bold text-lg text-slate-900 mb-0.5 flex items-center gap-1.5 truncate">
                                                            {astro.displayName}
                                                            <CheckCircle size={14} className="text-emerald-500 fill-emerald-50" />
                                                        </h4>
                                                    </Link>
                                                    <p className="text-xs text-slate-500 font-medium truncate mb-1">{astro.skills?.slice(0, 3).join(', ')}</p>
                                                    <p className="text-xs text-slate-500 font-medium mb-3">Exp: {astro.experienceYears || 5} Years</p>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        ₹{astro.charges?.chatPerMinute}<span className="text-slate-400 font-normal text-xs">/min</span>
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-2 w-28">
                                                    {featureFlags?.enableChat && (
                                                        <Link href={`/chat-with-astrologer/${astro._id}`}>
                                                            <button className="w-full py-2 px-3 rounded-xl border border-indigo-500 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5">
                                                                <MessageCircle size={14} /> Chat
                                                            </button>
                                                        </Link>
                                                    )}
                                                    {featureFlags?.enableCall && (
                                                        <Link href={`/astrologers/${astro.slug || astro._id}`}>
                                                            <button className="w-full py-2 px-3 rounded-xl border border-emerald-500 text-emerald-600 font-bold text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5">
                                                                <Phone size={14} /> Call
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dynamic Page Content & FAQs */}
                        <div className="mt-10">
                            <PageContentSection slug="home" />
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </main >
    );
}

function ServiceCard({ icon: Icon, title, desc, color, href, delay, badges }) {
    const colors = {
        blue: 'group-hover:text-blue-600 group-hover:bg-blue-50',
        green: 'group-hover:text-emerald-600 group-hover:bg-emerald-50',
        purple: 'group-hover:text-purple-600 group-hover:bg-purple-50',
        red: 'group-hover:text-red-600 group-hover:bg-red-50',
        orange: 'group-hover:text-orange-600 group-hover:bg-orange-50',
        indigo: 'group-hover:text-indigo-600 group-hover:bg-indigo-50',
    };

    // Find badge for this path
    const normalize = (p) => p?.replace(/\/+$/, '') || '';
    const badge = badges?.find(b => normalize(b.path) === normalize(href) && b.enabled);

    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -5 }}
                className="group cursor-pointer relative"
            >
                <div className={`p-4 md:p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 h-full border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100`}>
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 mb-4 transition-colors duration-300 ${colors[color]}`}>
                        <Icon size={28} />
                    </div>
                    <h4 className="font-bold text-base text-slate-800 mb-1 group-hover:text-indigo-900 transition-colors">{title}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                        {desc}
                    </p>

                    {/* Badge */}
                    {badge && (
                        <span
                            className="absolute -top-2 -right-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize tracking-tight shadow-md animate-pulse z-30 whitespace-nowrap"
                            style={{ backgroundColor: badge.color, color: badge.textColor }}
                        >
                            {badge.text}
                        </span>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}
