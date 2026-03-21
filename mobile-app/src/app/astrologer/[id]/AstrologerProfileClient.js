"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Star, MessageCircle, Phone,
    ShieldCheck, Award, Clock, Languages,
    Info, CheckCircle2, Heart, Share2, Loader2,
    MessageSquare, PhoneCall
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
    const [showFullBio, setShowFullBio] = useState(false);

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

    const handleShare = () => {
        const url = window.location.href;
        const text = `Consult with ${astro?.displayName || 'this expert'} on way2astro.com! ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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

    return (
        <div className="min-h-screen pb-32 animate-in fade-in duration-700 bg-[#060a1a]">
            {/* Top Navigation - Static Style */}
            <div className="bg-[#0b1026] border-b border-white/5 px-4 pt-4 pb-4 flex items-center justify-between sticky top-0 z-[60]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-white/80 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-white">Profile</h1>
                </div>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl text-white font-bold text-sm border border-white/10 active:scale-95 transition-all"
                >
                    <Share2 size={18} className="text-green-400" />
                    Share
                </button>
            </div>

            {/* Error Banner for Consultation */}
            <AnimatePresence>
                {consultError && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-24 left-4 right-4 z-[70] bg-rose-500 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
                    >
                        <Info size={18} />
                        <span className="text-sm font-bold">{consultError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-4 py-6 space-y-6">
                {/* Main Identity Card */}
                <div className="glass-panel rounded-[2rem] p-6 border-white/5 bg-white/5 overflow-hidden relative">
                    <div className="flex gap-6 items-start">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full p-1 bg-solar-gold">
                                <div className="w-full h-full rounded-full border-4 border-astro-navy overflow-hidden">
                                    <img 
                                        src={astro.image || astro.profileImage || "https://i.pravatar.cc/300"} 
                                        alt={astro.displayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#1c223a] shadow-lg flex items-center justify-center ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-white">{astro.displayName}</h2>
                                    <CheckCircle2 size={18} className="text-emerald-400" fill="currentColor" />
                                </div>
                                <button className="px-3 py-1 bg-solar-gold rounded-full text-[10px] font-black text-astro-navy uppercase shadow-lg shadow-solar-gold/20">
                                    Follow
                                </button>
                            </div>
                            
                            <p className="text-xs font-bold text-slate-400 mb-1">{astro.skills?.[0] || 'Astrology'}</p>
                            <p className="text-xs font-bold text-slate-400 mb-1">
                                {Array.isArray(astro.languages) ? astro.languages.join(", ") : astro.languages}
                            </p>
                            <p className="text-xs font-bold text-slate-400 mb-3">Exp: {astro.experienceYears || astro.experience || 5} Years</p>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} fill={s <= (astro.rating || 5) ? "#facc15" : "none"} className={s <= (astro.rating || 5) ? "text-solar-gold" : "text-slate-600"} />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs line-through">₹{Math.round((astro.charges?.chatPerMinute || 10) * 1.5)}</span>
                                    <span className="text-rose-400 font-bold text-sm">₹{astro.charges?.chatPerMinute || 10}/min</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Divider Line */}
                    <div className="h-px bg-white/5 my-6" />

                    {/* Orders & Minutes Stats */}
                    <div className="flex items-center justify-around">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl text-slate-400">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">{astro.consultationsCount || '10k'}+</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Orders</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl text-slate-400">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">{astro.totalMinutes || '100k'}+</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Mins</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Section */}
                <div className="px-2">
                    <p className={`text-slate-400 text-sm leading-relaxed ${showFullBio ? '' : 'line-clamp-2'}`}>
                        {astro.bio || `${astro.displayName} is a certified Vedic Astrologer from India, having expertise in ${astro.skills?.join(", ")} with over ${astro.experienceYears || 5} years of experience.`}
                    </p>
                    <button 
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-indigo-400 text-xs font-bold mt-2"
                    >
                        {showFullBio ? 'show less' : '...show more'}
                    </button>
                </div>

                {/* Gallery Preview */}
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-shrink-0 w-40 h-40 rounded-3xl overflow-hidden bg-slate-800 border border-white/5">
                            <img 
                                src={astro.image || astro.profileImage || "https://i.pravatar.cc/300"} 
                                alt="Gallery" 
                                className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    ))}
                </div>

                {/* User Reviews Header */}
                <div className="flex items-center justify-between px-2 pt-4">
                    <h3 className="text-lg font-black text-white">User Reviews</h3>
                    <button className="text-xs font-bold text-slate-500">View All</button>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                    {[
                        { name: "Balaji", text: "Thank you so much I got clarity I'll follow your remedies Thank you for your kind words", rating: 5 },
                        { name: "Krishna", text: "Excellent guidance and very accurate predictions.", rating: 5 }
                    ].map((rev, i) => (
                        <div key={i} className="glass-panel p-5 rounded-3xl border-white/5 bg-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                        {rev.name[0]}
                                    </div>
                                    <h4 className="font-bold text-white text-sm">{rev.name}</h4>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={10} fill={s <= rev.rating ? "#facc15" : "none"} className={s <= rev.rating ? "text-solar-gold" : "text-slate-700"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">{rev.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Double Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0b1026] border-t border-white/5 z-50">
                <div className="flex gap-4 max-w-lg mx-auto">
                    <button
                        className={`flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-3 font-black transition-all active:scale-[0.98]
                            ${isOnline ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                        disabled={!isOnline || initiating}
                        onClick={() => startChat(astro._id || id, astro.charges?.chatPerMinute || 10)}
                    >
                        <MessageSquare size={20} className="text-indigo-400" />
                        Chat
                    </button>

                    <button
                        className={`flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-3 font-black transition-all active:scale-[0.98]
                            ${isOnline ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                        disabled={!isOnline || initiating}
                        onClick={() => {/* Call logic placeholder */}}
                    >
                        <PhoneCall size={20} className="text-emerald-400" />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
}

