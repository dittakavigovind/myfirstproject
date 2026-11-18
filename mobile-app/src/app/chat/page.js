"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, Edit, User, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";
import { maskUserName } from "@/utils/maskUtils";

export default function Chat() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [allConversations, setAllConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedPartnerId, setExpandedPartnerId] = useState(null);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchConversations();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/chat/history');
            if (data.success && data.sessions) {
                // Group by unique partner to show latest conversation per person
                const uniqueConversations = [];
                const seenPartners = new Set();

                for (const session of data.sessions) {
                    const partner = user?.role === 'astrologer' ? session.userId : session.astrologerId;
                    const partnerId = partner?._id || partner;
                    if (partnerId && !seenPartners.has(partnerId)) {
                        seenPartners.add(partnerId);
                        uniqueConversations.push(session);
                    }
                }
                setAllConversations(data.sessions);
                setConversations(uniqueConversations);
            } else {
                setConversations([]);
            }
        } catch (err) {
            console.warn("Failed to fetch conversations", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(session => {
            const partner = user?.role === 'astrologer' ? session.userId : session.astrologerId;
            const p = partner || {};
            const nameMatch = (p.name || p.displayName || "").toLowerCase().includes(searchQuery.toLowerCase());
            return nameMatch;
        });
    }, [conversations, searchQuery, user]);

    const getChatPartner = (session) => {
        const partner = user?.role === 'astrologer' ? session.userId : session.astrologerId;
        const p = partner || {};
        let name = p.displayName || p.name || p.phone || p.mobileNumber || "Unknown User";
        if (user?.role === 'astrologer') {
            name = maskUserName(name);
        }
        return {
            ...p,
            name,
            profileImage: p.image || p.profileImage
        };
    };

    if (authLoading || loading) return <CosmicLoader message="Fetching cosmic signals..." />;

    const isAstrologer = user?.role === 'astrologer';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Messages</h2>
            </div>

            {/* Search */}
            <div className="rounded-2xl backdrop-blur-xl bg-white/[0.06] flex items-center px-4 py-2.5 border border-white/12 focus-within:border-violet-400/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-sm">
                <Search size={18} className="text-slate-400 mr-2.5 shrink-0" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500 font-medium"
                />
            </div>

            {/* Conversation List */}
            <div className="space-y-2.5">
                {filteredConversations.map((chat) => {
                    const partner = getChatPartner(chat);
                    return (
                        <div key={chat._id} className="flex flex-col">
                            <div 
                                onClick={() => setExpandedPartnerId(expandedPartnerId === partner._id ? null : partner._id)}
                                className={`rounded-[24px] backdrop-blur-2xl p-3.5 flex gap-3.5 items-center relative overflow-hidden group cursor-pointer border transition-all active:scale-[0.98] ${
                                    expandedPartnerId === partner._id 
                                        ? 'border-violet-400/50 bg-violet-600/15 shadow-[0_4px_20px_rgba(139,92,246,0.2)]' 
                                        : 'border-white/12 bg-white/[0.05] hover:bg-white/[0.08]'
                                }`}
                            >
                                {/* Top specular rim light */}
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                                <div className="relative shrink-0">
                                    <div className="w-[52px] h-[52px] rounded-[18px] overflow-hidden border border-white/15 bg-[#0c102a] flex items-center justify-center shadow-sm">
                                        {partner.profileImage ? (
                                            <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={22} className="text-slate-400" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className="text-white font-bold text-sm truncate tracking-tight">{partner.name}</h3>
                                        <span className="text-[10px] text-slate-400 font-semibold tracking-tight">
                                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
                                        </span>
                                    </div>
                                    <p className="text-xs truncate font-medium text-slate-400">
                                        {chat.status === 'active' ? (
                                            <span className="text-emerald-300 flex items-center gap-1.5 font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                                Live Consultation
                                            </span>
                                        ) : chat.status === 'initiated' ? (
                                            <span className="text-amber-300 flex items-center gap-1.5 font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                                Connecting...
                                            </span>
                                        ) : (
                                            <span className="capitalize text-slate-400 text-xs">Tap to view session history</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Expanded 5 Recent Sessions */}
                            {expandedPartnerId === partner._id && (
                                <div className="mt-2 space-y-2 pl-6 pr-2 py-2 border-l-2 border-electric-violet/30 ml-7 animate-in slide-in-from-top-2 duration-200">
                                    <h4 className="text-[10px] text-electric-violet font-black uppercase tracking-widest mb-2">Recent Sessions</h4>
                                    {allConversations
                                        .filter(s => {
                                            const p = user?.role === 'astrologer' ? s.userId : s.astrologerId;
                                            return (p?._id || p) === partner._id;
                                        })
                                        .slice(0, 5)
                                        .map(s => {
                                            const sDate = new Date(s.createdAt || s.startTime || Date.now());
                                            const durationStr = s.totalDuration ? `${Math.floor(s.totalDuration / 60)}m ${s.totalDuration % 60}s` : '0m 0s';
                                            const amountStr = user?.role === 'astrologer' 
                                                ? (s.astrologerShare ? `₹${s.astrologerShare}` : '₹0')
                                                : (s.totalAmountDeducted ? `₹${s.totalAmountDeducted}` : '₹0');

                                            return (
                                                <div 
                                                    key={s._id} 
                                                    onClick={() => {
                                                        if (s.sessionType !== 'audio') {
                                                            router.push(`/chat/room?id=${s.roomId}`);
                                                        } else {
                                                            setToastMessage("Audio call history cannot be replayed.");
                                                            setTimeout(() => setToastMessage(""), 3000);
                                                        }
                                                    }}
                                                    className={`p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center transition-colors cursor-pointer ${s.sessionType !== 'audio' ? 'active:bg-white/10' : ''}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-200">
                                                            {s.sessionType ? s.sessionType.charAt(0).toUpperCase() + s.sessionType.slice(1) : 'Session'}
                                                            <span className="text-slate-500 font-normal ml-1">
                                                                • {sDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} {sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                                s.status === 'completed' ? 'text-emerald-400' :
                                                                s.status === 'active' ? 'text-blue-400 animate-pulse' :
                                                                s.status === 'failed' || s.status === 'terminated' || s.status === 'missed' ? 'text-rose-400' :
                                                                'text-amber-400'
                                                            }`}>{s.status}</span>
                                                            {s.status === 'completed' && (
                                                                <>
                                                                    <span className="text-slate-600 text-[10px]">•</span>
                                                                    <span className="text-[10px] text-slate-400 font-medium">{durationStr}</span>
                                                                    <span className="text-slate-600 text-[10px]">•</span>
                                                                    <span className="text-[10px] text-amber-400 font-bold">{amountStr}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {s.sessionType !== 'audio' && (
                                                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                                                            <ChevronRight size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredConversations.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500 mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <p className="text-slate-400 font-medium font-bold uppercase tracking-widest text-xs">No conversations found</p>
                    </div>
                )}
            </div>

            <div className="h-10" />

            {/* Custom Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                        className="fixed top-1/2 left-1/2 z-50 px-6 py-4 bg-[#1e2337] border border-solar-gold/30 rounded-2xl shadow-2xl shadow-black flex items-center justify-center min-w-[280px]"
                    >
                        <span className="text-sm font-medium text-white text-center">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
