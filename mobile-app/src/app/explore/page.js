"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CosmicCard from "@/components/CosmicCard";
import { Search, Filter, Award, MessageCircle, Phone } from "lucide-react";
import api from "@/lib/api";

export default function Explore() {
    const router = useRouter();
    const [astrologers, setAstrologers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAstrologers();

        // 15s silent background status polling
        const pollInterval = setInterval(fetchAstrologersSilent, 15000);
        return () => clearInterval(pollInterval);
    }, []);

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Search and Filter */}
            <div className="flex gap-3">
                <div className="flex-1 glass-panel rounded-xl flex items-center px-4 py-2 border border-white/10">
                    <Search size={18} className="text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search astrologers, skills..."
                        className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
                    />
                </div>
                <button className="glass-panel rounded-xl p-3 flex items-center justify-center text-electric-violet">
                    <Filter size={18} />
                </button>
            </div>

            {/* Specialty Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {["All", "Tarot", "Vedic", "Numerology", "Vastu", "Palmistry"].map((tag, i) => (
                    <button
                        key={tag}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border ${i === 0 ? 'bg-electric-violet text-white border-electric-violet' : 'glass-pill text-slate-300 border-white/20'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Astrologer List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-t-2 border-electric-violet animate-spin" />
                        <p className="text-sm">Summoning astrologers...</p>
                    </div>
                ) : astrologers.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p className="text-sm">No astrologers found.</p>
                    </div>
                ) : (
                    astrologers.map((astro, i) => (
                        <CosmicCard
                            key={i}
                            delay={0.1 + (i * 0.1)}
                            className="p-4"
                            onClick={() => router.push(`/astrologer/${astro._id || astro.id || i}`)}
                        >
                            <div className="flex gap-4">

                                {/* Profile Image & Status */}
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-electric-violet/30 p-0.5">
                                        <img src={astro.image || astro.profileImage || "https://i.pravatar.cc/150"} alt={astro.displayName || astro.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-cosmic-indigo shadow-[0_0_8px_rgba(0,0,0,0.5)] ${astro.isChatOnline || astro.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' :
                                        astro.isBusy ? 'bg-amber-500' : 'bg-slate-500'
                                        }`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 text-left">
                                            <h3 className="text-white font-bold text-lg leading-tight truncate">{astro.displayName || astro.name}</h3>
                                            <p className="text-electric-violet text-xs font-medium truncate">
                                                {Array.isArray(astro.skills) ? astro.skills.join(", ") : (astro.skills || "Astrologer")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md flex-shrink-0">
                                            <Award size={12} className="text-solar-gold" />
                                            <span className="text-xs text-white font-bold">{astro.rating || "4.9"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                        <span>{astro.experienceYears || astro.experience || "5"} Years</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                        <span className="font-semibold text-slate-200">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-[11px] font-bold">
                                            <MessageCircle size={14} /> Chat
                                        </div>
                                        <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                                            <Phone size={14} /> Call
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CosmicCard>
                    ))
                )}
            </div>

            <div className="h-10" />
        </div>
    );
}
