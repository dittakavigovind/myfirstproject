"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, Edit, User, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";

export default function Chat() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [allConversations, setAllConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedPartnerId, setExpandedPartnerId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchConversations();
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
            console.error("Failed to fetch conversations", err);
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
        return {
            ...p,
            name: p.displayName || p.name || p.phone || p.mobileNumber || "Unknown User",
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
            <div className="glass-panel rounded-xl flex items-center px-4 py-3 border border-white/10 shadow-lg">
                <Search size={18} className="text-slate-400 mr-3" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
                />
            </div>

            {/* Conversation List */}
            <div className="space-y-3">
                {filteredConversations.map((chat) => {
                    const partner = getChatPartner(chat);
                    return (
                        <div key={chat._id} className="flex flex-col">
                            <div 
                                onClick={() => setExpandedPartnerId(expandedPartnerId === partner._id ? null : partner._id)}
                                className={`glass-panel rounded-xl p-4 flex gap-4 items-center relative overflow-hidden group cursor-pointer ${expandedPartnerId === partner._id ? 'border-electric-violet/50 bg-white/10' : 'border-white/10'}`}
                            >
                                {/* Highlight on touch/hover */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
                                        {partner.profileImage ? (
                                            <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} className="text-slate-500" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-white font-bold text-base truncate">{partner.name}</h3>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                            {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm truncate font-medium text-slate-400">
                                        {chat.status === 'active' ? (
                                            <span className="text-emerald-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Live Session
                                            </span>
                                        ) : chat.status === 'initiated' ? (
                                            <span className="text-amber-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                Connecting...
                                            </span>
                                        ) : (
                                            <span className="capitalize text-slate-500 text-xs">Tap to view recent sessions</span>
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
                                                    onClick={() => s.sessionType !== 'audio' && router.push(`/chat/room?id=${s.roomId}`)}
                                                    className={`p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center transition-colors ${s.sessionType !== 'audio' ? 'active:bg-white/10 cursor-pointer' : ''}`}
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
        </div>
    );
}
