"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Star, MessageCircle, Phone,
    ShieldCheck, Award, Clock, Languages,
    Info, CheckCircle2, Heart, Share2, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConsultation } from "@/hooks/useConsultation";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";
import CosmicCard from "@/components/CosmicCard";

export default function AstrologerProfile() {
    const { id } = useParams();
    const router = useRouter();
    const { startChat, loading: initiating, error: consultError } = useConsultation();
    const [astro, setAstro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAstroDetails();
    }, [id]);

    const fetchAstroDetails = async () => {
        try {
            const { data } = await api.get(`/astro/astrologers/${id}`);
            if (data && data.success) {
                setAstro(data.data);
            } else {
                setError("Unable to find this guide in the stars.");
            }
        } catch (err) {
            console.error(err);
            setError("The cosmic connection was interrupted.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CosmicLoader size="lg" message="Consulting the heavens..." />;

    if (error || !astro) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
                    <Info size={40} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Guide Not Found</h2>
                <p className="text-slate-400 mb-8">{error || "This astrologer is currently unavailable."}</p>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-white/5 rounded-2xl text-white font-bold border border-white/10"
                >
                    Return to Explore
                </button>
            </div>
        );
    }

    const isOnline = astro.isChatOnline || astro.isOnline;
    const isBusy = false; // Placeholder if busy state is implemented later

    return (
        <div className="min-h-screen pb-32 animate-in fade-in duration-700">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-cosmic-indigo/80 backdrop-blur-md rounded-2xl text-white shadow-xl border border-white/10 pointer-events-auto active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <button
                    className="p-3 bg-cosmic-indigo/80 backdrop-blur-md rounded-2xl text-white shadow-xl border border-white/10 pointer-events-auto active:scale-95 transition-all"
                >
                    <Share2 size={20} />
                </button>
            </div>

            {/* Error Banner for Consultation */}
            <AnimatePresence>
                {consultError && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-4 right-4 z-[60] bg-rose-500 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-rose-500/40"
                    >
                        <Info size={18} />
                        <span className="text-sm font-bold">{consultError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <div className="relative h-80 w-full overflow-hidden">
                <img
                    src={astro.image || astro.profileImage || "https://i.pravatar.cc/300"}
                    alt={astro.displayName || astro.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1026] via-[#0b1026]/40 to-transparent" />

                {/* Profile Floating Info */}
                <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : isBusy ? 'bg-amber-500' : 'bg-slate-500'}`} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                    {isOnline ? 'Online Now' : isBusy ? 'Busy' : 'Offline'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-white leading-none">{astro.displayName || astro.name}</h1>
                            <p className="text-rose-400 text-sm font-bold mt-2 flex items-center gap-1.5">
                                <Award size={14} />
                                {astro.skills?.slice(0, 2).join(", ")}
                            </p>
                        </div>
                        <div className="bg-solar-gold rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-lg shadow-solar-gold/20">
                            <Award size={16} className="text-astro-navy" />
                            <span className="text-astro-navy font-black text-sm">{astro.rating || "4.9"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-4 -mt-4 relative z-10">
                <div className="glass-panel rounded-3xl p-5 border-white/5 flex justify-between divide-x divide-white/5">
                    <div className="flex-1 text-center">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Experience</p>
                        <p className="text-white font-black">{astro.experienceYears || astro.experience || "5"}+ Years</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Language</p>
                        <p className="text-white font-black">
                            {astro.languages
                                ? (Array.isArray(astro.languages) ? astro.languages[0] : astro.languages.split(",")[0])
                                : "Hindi"}
                        </p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Consults</p>
                        <p className="text-white font-black">{astro.consultationsCount || "1.2k"}+</p>
                    </div>
                </div>
            </div>

            {/* Bio & Details */}
            <div className="px-6 mt-10 space-y-8">
                <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">About the Guide</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                        {astro.bio || `Specializing in ${astro.skills?.join(", ")} for over ${astro.experience || 5} years, I've guided thousands through their celestial journey using ancient Vedic wisdom.`}
                    </p>
                </div>

                <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Core Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                        {astro.skills?.map((skill) => (
                            <span key={skill} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Languages Spoken</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <Languages size={16} className="text-rose-400" />
                            {astro.languages
                                ? (Array.isArray(astro.languages) ? astro.languages.join(", ") : astro.languages)
                                : "Hindi, English"}
                        </div>
                    </div>
                </div>

                {/* Trust Badge */}
                <CosmicCard className="bg-emerald-500/5 border-emerald-500/10">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-emerald-400 font-bold text-sm mb-1">Safe & Trusted Guide</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                This astrologer has been verified by Way2Astro for premium guidance and professionalism.
                            </p>
                        </div>
                    </div>
                </CosmicCard>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0b1026] via-[#0b1026] to-transparent z-50">
                <div className="flex gap-3 max-w-lg mx-auto">
                    <button
                        className="flex-[1.5] h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-white font-black text-sm active:scale-95 transition-all"
                        onClick={() => router.push(`/wallet`)}
                    >
                        <Clock size={18} className="text-solar-gold" />
                        ₹{astro.charges?.chatPerMinute || astro.chatRate || 10}/min
                    </button>

                    <button
                        className={`flex-[3] h-14 rounded-2xl flex items-center justify-center gap-3 font-black shadow-xl shadow-rose-600/20 active:scale-[0.98] transition-all
                            ${isOnline ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                        disabled={!isOnline || initiating}
                        onClick={() => startChat(astro._id || id, astro.charges?.chatPerMinute || astro.chatRate || 10)}
                    >
                        {initiating ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
                        {initiating ? "Initializing..." : "Start Consultation"}
                    </button>
                </div>
            </div>
        </div>
    );
}
