"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CosmicCard from "@/components/CosmicCard";
import { Award, MessageCircle, Phone, Heart, ChevronLeft, Star, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useConsultation } from "@/hooks/useConsultation";
import { useSocket } from "@/context/SocketContext";
import { getImageUrl } from "@/lib/utils";

export default function Following() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { socket } = useSocket();
    const { startChat, startCall, loading: initiating, error: consultError } = useConsultation();
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

    


    useEffect(() => {
        if (!authLoading && user?.role === 'astrologer') {
            router.replace("/");
            return;
        }
        if (user && !user.isGuest) {
            fetchFollowing();
        } else {
            setLoading(false);
            setFollowing([]);
        }

        if (socket) {
            const handleStatusChange = (data) => {
                setFollowing((prev) => 
                    prev.map(astro => 
                        (astro._id === data.astrologerId || astro.id === data.astrologerId) ? { ...astro, ...data } : astro
                    )
                );
            };
            socket.on("astrologer_status_changed", handleStatusChange);
            return () => {
                socket.off("astrologer_status_changed", handleStatusChange);
            };
        }
    }, [user, authLoading, socket]);

    const fetchFollowing = async () => {
        if (!user || user.isGuest) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get("/users/following");
            if (data.success) {
                setFollowing([...(data.following || [])].reverse());
            }
        } catch (error) {
            console.error("Failed to fetch following", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Error Banner for Consultation */}
            {consultError && (
                <div className="fixed top-20 left-4 right-4 z-[40] bg-rose-500/90 backdrop-blur-xl text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top duration-300 border border-white/10">
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{consultError}</span>
                </div>
            )}

            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden pt-safe pb-28">

            <div className="px-4 flex items-center gap-3 pt-3 pb-2">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] backdrop-blur-xl border border-white/10 active:scale-90 transition-all text-white"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Favorite Guides</h1>
                    <p className="text-[10px] text-slate-400 font-medium">Astrologers you follow</p>
                </div>
            </div>

            {/* Astrologer List */}
            <div className="space-y-3 px-4">
                {loading ? (
                    <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-rose-400 animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading your favorites...</p>
                    </div>
                ) : following.length === 0 ? (
                    <div className="text-center py-24 text-slate-400">
                        <div className="w-20 h-20 rounded-[28px] bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
                            <Heart size={36} />
                        </div>
                        <p className="text-base font-black text-white">No followed astrologers yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">Follow your trusted cosmic guides to quickly connect with them anytime.</p>
                        <button 
                            onClick={() => router.push('/explore')}
                            className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-solar-gold to-amber-500 text-black text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-solar-gold/20"
                        >
                            Explore Astrologers
                        </button>
                    </div>
                ) : (
                    following.map((astro, i) => (
                        <div
                            key={astro._id || i}
                            onClick={() => router.push(`/astrologer?id=${astro.slug || astro._id}`)}
                            className="p-3.5 rounded-[22px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98] relative overflow-hidden cursor-pointer"
                        >
                            <div className="flex gap-3 relative z-0 items-center">
                                {/* Left Column: Squircle Avatar */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="relative w-15 h-15 rounded-[18px] p-0.5 bg-gradient-to-br from-white/20 to-white/5 shadow-md">
                                        <div className="w-full h-full rounded-[16px] overflow-hidden border border-white/10 bg-[#0c102a]">
                                            <img 
                                                src={getImageUrl(astro.image || astro.profileImage, astro.gender)} 
                                                alt={astro.displayName || astro.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = getImageUrl(null, astro.gender);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-1.5 gap-[1px]">
                                        <Star size={9} className="text-solar-gold fill-solar-gold" />
                                        <span className="text-[10px] font-bold text-white ml-0.5">{parseFloat(astro.rating || 4.9).toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Center Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-white font-black text-sm truncate">{astro.displayName || astro.name}</h3>
                                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                                            <Check size={9} strokeWidth={3} className="text-blue-400" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-electric-violet mt-0.5 uppercase tracking-wider truncate">
                                        {Array.isArray(astro.skills) ? astro.skills.slice(0, 2).join(", ") : (astro.skills || "Vedic")}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                        {Array.isArray(astro.languages) ? astro.languages.slice(0, 3).join(", ") : "English, Hindi"}
                                    </p>
                                    
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-solar-gold font-black text-xs">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase">/min</span>
                                    </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="flex flex-col items-end justify-center flex-shrink-0 gap-1.5">
                                    {user?.globalFeatures?.chatEnabled !== false && astro?.features?.chatEnabled !== false && (
                                        <button 
                                            disabled={initiating || !astro.isChatOnline || astro.isBusy}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startChat(astro._id, astro.charges?.chatPerMinute || astro.chatRate || 25);
                                            }}
                                            className={`w-[66px] py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                                (astro.isChatOnline && !astro.isBusy) 
                                                    ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/15 active:scale-95 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                                                    : 'border-white/10 text-slate-500 bg-white/5 opacity-60'
                                            }`}
                                        >
                                            <span className="text-[10px] font-black leading-none mb-0.5">Chat</span>
                                            <span className={`text-[8px] font-bold uppercase tracking-wider ${astro.isBusy ? 'text-amber-400' : (!astro.isChatOnline ? 'text-slate-500' : 'text-emerald-400')}`}>
                                                {astro.isBusy ? 'Busy' : (!astro.isChatOnline ? 'Offline' : 'Online')}
                                            </span>
                                        </button>
                                    )}
                                    {user?.globalFeatures?.voiceEnabled !== false && astro?.features?.voiceEnabled !== false && (
                                        <button 
                                            disabled={initiating || !astro.isVoiceOnline || astro.isBusy}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startCall(astro._id, astro.charges?.callPerMinute || astro.callRate || 25);
                                            }}
                                            className={`w-[66px] py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                                (astro.isVoiceOnline && !astro.isBusy) 
                                                    ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/15 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                                    : 'border-white/10 text-slate-500 bg-white/5 opacity-60'
                                            }`}
                                        >
                                            <span className="text-[10px] font-black leading-none mb-0.5">Call</span>
                                            <span className={`text-[8px] font-bold uppercase tracking-wider ${astro.isBusy ? 'text-amber-400' : (!astro.isVoiceOnline ? 'text-slate-500' : 'text-emerald-400')}`}>
                                                {astro.isBusy ? 'Busy' : (!astro.isVoiceOnline ? 'Offline' : 'Online')}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="h-10" />
        </div>
        </>
    );
}
