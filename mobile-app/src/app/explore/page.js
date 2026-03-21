"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CosmicCard from "@/components/CosmicCard";
import { Search, Filter, Award, MessageCircle, Phone, X } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useConsultation } from "@/hooks/useConsultation";

export default function Explore() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { startChat, startCall, loading: initiating, error: consultError } = useConsultation();
    const [astrologers, setAstrologers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");

    const getImageUrl = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        if (path.startsWith("http")) return path;
        return `http://192.168.29.133:5000${path.startsWith("/") ? "" : "/"}${path}`;
    };

    useEffect(() => {
        if (!authLoading && user?.role === 'astrologer') {
            router.replace("/");
            return;
        }
        fetchAstrologers();
        const pollInterval = setInterval(fetchAstrologersSilent, 15000);
        return () => clearInterval(pollInterval);
    }, [user, authLoading]);

    const fetchAstrologers = async () => {
        try {
            const { data } = await api.get("/astro/astrologers");
            setAstrologers(data.data || []);
        } catch (error) {
            console.error("Failed to fetch astrologers", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAstrologersSilent = async () => {
        try {
            const { data } = await api.get("/astro/astrologers");
            if (data && data.success) {
                setAstrologers(data.data || []);
            }
        } catch (error) {
            console.error("Silent status poll failed", error);
        }
    };

    const filteredAstrologers = useMemo(() => {
        return astrologers.filter(astro => {
            const nameMatch = (astro.displayName || astro.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            const skillsMatch = Array.isArray(astro.skills) 
                ? astro.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                : (astro.skills || "").toLowerCase().includes(searchQuery.toLowerCase());
            const languageMatch = Array.isArray(astro.languages)
                ? astro.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
                : (astro.languages || "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSearch = nameMatch || skillsMatch || languageMatch;

            if (selectedFilter === "All") return matchesSearch;
            
            const matchesFilter = Array.isArray(astro.skills)
                ? astro.skills.some(s => s.toLowerCase() === selectedFilter.toLowerCase())
                : (astro.skills || "").toLowerCase() === selectedFilter.toLowerCase();
            
            return matchesSearch && matchesFilter;
        });
    }, [astrologers, searchQuery, selectedFilter]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">

            {/* Error Banner for Consultation */}
            {consultError && (
                <div className="fixed top-20 left-4 right-4 z-[70] bg-rose-500 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top duration-300">
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{consultError}</span>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex gap-3">
                <div className="flex-1 glass-panel rounded-xl flex items-center px-4 py-2.5 border border-white/10 active:border-electric-violet/50 transition-all">
                    <Search size={18} className="text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search astrologers, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => {}} // Could open a more detailed filter modal
                    className="glass-panel rounded-xl px-4 flex items-center justify-center text-electric-violet border border-white/5"
                >
                    <Filter size={18} />
                </button>
            </div>

            {/* Specialty Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-1 px-1">
                {["All", "Tarot", "Vedic", "Numerology", "Vastu", "Palmistry"].map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setSelectedFilter(tag)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 border ${
                            selectedFilter === tag 
                            ? 'bg-electric-violet text-white border-electric-violet shadow-lg shadow-electric-violet/20 scale-105' 
                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 active:scale-95'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Astrologer List */}
            <div className="space-y-5">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-electric-violet animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Summoning astrologers...</p>
                    </div>
                ) : filteredAstrologers.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Search size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-300 tracking-wide">No results for "{searchQuery}"</p>
                        <p className="text-xs text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredAstrologers.map((astro, i) => (
                        <CosmicCard
                            key={astro._id || i}
                            delay={0.1 + (i * 0.05)}
                            className="p-5 transition-transform active:scale-[0.98] border-white/5 hover:border-white/10"
                            onClick={() => router.push(`/astrologer?id=${astro._id || astro.id || i}`)}
                        >
                            <div className="flex gap-5">
                                {/* Profile Image & Status */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-electric-violet/20 p-0.5">
                                        <img 
                                            src={getImageUrl(astro.image || astro.profileImage)} 
                                            alt={astro.displayName || astro.name} 
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                            }}
                                        />
                                    </div>
                                    <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-[#0b1026] shadow-lg ${
                                        astro.isChatOnline || astro.isOnline ? 'bg-emerald-500' :
                                        astro.isBusy ? 'bg-amber-500' : 'bg-slate-500'
                                    }`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="min-w-0 pr-2">
                                            <h3 className="text-white font-black text-lg leading-none truncate mb-1.5">{astro.displayName || astro.name}</h3>
                                            <p className="text-electric-violet text-[10px] font-black leading-none uppercase tracking-wider">
                                                {Array.isArray(astro.skills) ? astro.skills.slice(0, 3).join(", ") : (astro.skills || "Expert")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-solar-gold/10 px-2 py-0.5 rounded-lg flex-shrink-0 border border-solar-gold/10">
                                            <Award size={12} className="text-solar-gold fill-solar-gold/20" />
                                            <span className="text-xs text-solar-gold font-black">{astro.rating || "4.9"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold">
                                        <span>{astro.experienceYears || astro.experience || "5"}+ Years</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="text-white">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</span>
                                    </div>

                                    <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide truncate">
                                        {Array.isArray(astro.languages) ? astro.languages.join(", ") : "English, Hindi, Telugu"}
                                    </p>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
                                        <button 
                                            disabled={initiating}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startChat(astro._id, astro.charges?.chatPerMinute || 25);
                                            }}
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <MessageCircle size={14} /> Chat
                                        </button>
                                        <button 
                                            disabled={initiating}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startCall(astro._id, astro.charges?.chatPerMinute || 25);
                                            }}
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Phone size={14} /> Call
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CosmicCard>
                    ))
                )}
            </div>

            <div className="h-20" />
        </div>
    );
}
