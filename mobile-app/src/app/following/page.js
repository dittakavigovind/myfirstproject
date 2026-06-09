"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CosmicCard from "@/components/CosmicCard";
import { Award, MessageCircle, Phone, Heart, ChevronLeft, Star, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useConsultation } from "@/hooks/useConsultation";
import { useSocket } from "@/context/SocketContext";

export default function Following() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { socket } = useSocket();
    const { startChat, startCall, loading: initiating, error: consultError } = useConsultation();
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

        const getImageUrl = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        
        // If it's a full URL, ensure localhost is rewritten to the real network IP
        if (path.startsWith("http")) {
            return path.replace('localhost:5000', '192.168.29.133:5000');
        }
        
        const normalizedPath = path.replace(/\\/g, "/");
        return `http://192.168.29.133:5000${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    };


    useEffect(() => {
        if (!authLoading && user?.role === 'astrologer') {
            router.replace("/");
            return;
        }
        if (user) {
            fetchFollowing();
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
                <div className="fixed top-[88px] left-4 right-4 z-[40] bg-rose-500 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top duration-300">
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{consultError}</span>
                </div>
            )}

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden pt-6">

            <div className="px-4 flex items-center gap-3 pb-2 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 active:scale-95 transition-all"
                >
                    <ChevronLeft size={20} className="text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white">My Following</h1>
                    <p className="text-xs text-slate-400 font-medium">Astrologers you follow</p>
                </div>
            </div>

            {/* Astrologer List */}
            <div className="space-y-5 px-4">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-rose-400 animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading your favorites...</p>
                    </div>
                ) : following.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-rose-400/10 flex items-center justify-center mx-auto mb-4 text-rose-400">
                            <Heart size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-300 tracking-wide">No followed astrologers yet</p>
                        <p className="text-xs text-slate-500 mt-2">Go to an astrologer's profile to follow them.</p>
                        <button 
                            onClick={() => router.push('/explore')}
                            className="mt-6 px-6 py-2.5 rounded-full bg-rose-400/10 text-rose-400 border border-rose-400/20 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
                        >
                            Explore Astrologers
                        </button>
                    </div>
                ) : (
                    following.map((astro, i) => (
                        <CosmicCard
                            key={astro._id || i}
                            delay={0.1 + (i * 0.05)}
                            className="px-4 py-3.5 transition-transform active:scale-[0.98] border-white/5 hover:border-white/10"
                            onClick={() => router.push(`/astrologer?id=${astro.slug || astro._id}`)}
                        >
                            <div className="flex gap-3 relative">
                                {/* Left Column: Avatar & Stars */}
                                <div className="flex flex-col items-center flex-shrink-0 w-20">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 p-0.5 relative">
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
                                    <div className="flex items-center mt-2 gap-[1px]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className={i < Math.floor(astro.rating || 4.5) ? "text-solar-gold fill-solar-gold" : "text-slate-600 fill-slate-600"} />
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-1 font-medium">{astro.orders || '5k+'} orders</p>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center py-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-white font-bold text-base truncate">{astro.displayName || astro.name}</h3>
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0 mt-0.5">
                                            <Check size={10} strokeWidth={3} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                                        {Array.isArray(astro.skills) ? astro.skills.slice(0, 3).join(", ") : (astro.skills || "Expert")}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                        {Array.isArray(astro.languages) ? astro.languages.join(", ") : "English, Hindi, Telugu"}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Exp- {astro.experienceYears || astro.experience || "5"} Years</p>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <span className="text-slate-500 line-through text-[11px]">₹{Math.floor((astro.charges?.chatPerMinute || astro.chatRate || 25) * 1.5)}</span>
                                        <span className="text-rose-400 font-bold text-[13px]">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                                {user?.globalFeatures?.chatEnabled !== false && astro?.features?.chatEnabled !== false && (
                                    <button 
                                        disabled={initiating || !astro.isChatOnline || astro.isBusy}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startChat(astro._id, astro.charges?.chatPerMinute || astro.chatRate || 25);
                                        }}
                                        className={`w-full py-2 rounded-lg border flex flex-row items-center justify-center gap-1.5 transition-all ${
                                            (astro.isChatOnline && !astro.isBusy) 
                                                ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 active:scale-95' 
                                                : 'border-white/10 text-slate-400 bg-white/5'
                                        }`}
                                    >
                                        <span className="text-[11px] font-bold">Chat</span>
                                        <span className={`text-[10px] font-medium ${astro.isBusy ? 'text-amber-400' : (!astro.isChatOnline ? 'text-slate-400' : '')}`}>
                                            • {astro.isBusy ? 'Busy' : (!astro.isChatOnline ? 'Offline' : 'Available')}
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
                                        className={`w-full py-2 rounded-lg border flex flex-row items-center justify-center gap-1.5 transition-all ${
                                            (astro.isVoiceOnline && !astro.isBusy) 
                                                ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 active:scale-95' 
                                                : 'border-white/10 text-slate-400 bg-white/5'
                                        }`}
                                    >
                                        <span className="text-[11px] font-bold">Call</span>
                                        <span className={`text-[10px] font-medium ${astro.isBusy ? 'text-amber-400' : (!astro.isVoiceOnline ? 'text-slate-400' : '')}`}>
                                            • {astro.isBusy ? 'Busy' : (!astro.isVoiceOnline ? 'Offline' : 'Available')}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </CosmicCard>
                    ))
                )}
            </div>

            <div className="h-20" />
        </div>
        </>
    );
}
