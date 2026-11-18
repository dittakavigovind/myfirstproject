"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, PhoneMissed, PhoneOff, User, MessageCircle, MoreVertical } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { maskUserName } from "@/utils/maskUtils";
import { getImageUrl } from "@/lib/utils";

export default function HistoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('recent');
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { default: api } = await import("@/lib/api");
                const { data } = await api.get('/chat/history');
                if (data.success && data.sessions) {
                    const formattedData = data.sessions.map(session => {
                        const dateObj = new Date(session.createdAt || session.startTime || Date.now());
                        
                        // Grouping logic
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        let dateGroup = "Older";
                        if (dateObj.toDateString() === today.toDateString()) {
                            dateGroup = "Today";
                        } else if (dateObj.toDateString() === yesterday.toDateString()) {
                            dateGroup = "Yesterday";
                        } else {
                            dateGroup = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
                        }

                        // Determine name and status
                        let partner = {};
                        if (session.astrologerId && typeof session.astrologerId === 'object') {
                            partner = session.astrologerId;
                        } else if (session.userId && typeof session.userId === 'object') {
                            partner = session.userId;
                        }

                        let name = partner.displayName || partner.name || "Unknown User";
                        if (user?.role === 'astrologer') {
                            name = maskUserName(name);
                        }
                        
                        let type = "recent";
                        let status = session.status;
                        let displayStatus = status;
                        if (status === 'missed' || status === 'failed') {
                            type = "missed";
                            if (session.terminationReason === 'declined_by_astrologer') {
                                displayStatus = 'declined';
                            } else {
                                displayStatus = 'missed';
                            }
                        }
                        
                        return {
                            id: session._id,
                            roomId: session.roomId,
                            name,
                            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            status: displayStatus,
                            date: dateGroup,
                            type,
                            avatar: partner.image || partner.profileImage,
                            gender: partner.gender,
                            duration: session.totalDuration || 0,
                            partnerId: partner._id,
                            isAstrologerSession: !!(session.astrologerId && typeof session.astrologerId === 'object'),
                            sessionType: session.sessionType || 'chat'
                        };
                    });
                    setHistoryData(formattedData);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && !user.isGuest) {
            fetchHistory();
        } else {
            setLoading(false);
            setHistoryData([]);
        }
    }, [user]);

    const filteredData = historyData.filter(item => activeTab === 'missed' ? item.type === 'missed' : true);
    
    // Get unique date groups
    const dateGroups = [...new Set(filteredData.map(item => item.date))];

    return (
        <div className="min-h-screen pb-28 pt-safe px-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pt-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Session History</h1>
                        <p className="text-[10px] text-slate-400 font-medium">Calls & Chats Log</p>
                    </div>
                </div>
            </div>

            {/* Apple Segmented Control Tabs */}
            <div className="flex bg-black/40 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/10 mb-6 shadow-inner">
                <button 
                    onClick={() => setActiveTab('recent')}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                        activeTab === 'recent' 
                        ? 'bg-gradient-to-r from-solar-gold to-amber-500 text-black font-black shadow-lg shadow-solar-gold/20' 
                        : 'text-slate-400 font-bold hover:text-white'
                    }`}
                >
                    <Phone size={15} />
                    <span className="text-xs uppercase tracking-wider">Recent</span>
                </button>
                <button 
                    onClick={() => setActiveTab('missed')}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                        activeTab === 'missed' 
                        ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/25' 
                        : 'text-slate-400 font-bold hover:text-white'
                    }`}
                >
                    <PhoneMissed size={15} />
                    <span className="text-xs uppercase tracking-wider">Missed</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-electric-violet animate-spin" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading history...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p className="text-sm font-semibold">No {activeTab} sessions found.</p>
                        <p className="text-xs text-slate-500 mt-1">Your past consultations will appear here.</p>
                    </div>
                ) : dateGroups.map((dateGroup) => {
                    const groupItems = filteredData.filter(item => item.date === dateGroup);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={dateGroup} className="space-y-3">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{dateGroup}</h2>
                            <div className="space-y-2.5">
                                {groupItems.map((item, i) => (
                                    <motion.div
                                        key={item.id || i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => {
                                            if (item.roomId && item.sessionType !== 'audio') {
                                                router.push(`/chat/room?id=${item.roomId}`);
                                            }
                                        }}
                                        className={`p-4 rounded-[22px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center gap-3.5 group active:scale-[0.98] transition-all ${item.sessionType !== 'audio' ? 'cursor-pointer hover:border-white/20' : ''}`}
                                    >
                                        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-sm">
                                            <img src={getImageUrl(item.avatar, item.gender)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 
                                                className="text-white font-bold text-sm leading-snug truncate hover:text-electric-violet transition cursor-pointer"
                                                onClick={(e) => {
                                                    if (item.isAstrologerSession) {
                                                        e.stopPropagation();
                                                        router.push(`/astrologer?id=${item.partnerDetails?.slug || item.partnerId}`);
                                                    }
                                                }}
                                            >
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                                                <span>{item.time}</span>
                                                {item.duration > 0 && (
                                                    <>
                                                        <span className="opacity-40">•</span>
                                                        <span className="text-emerald-400 font-medium">
                                                            {Math.floor(item.duration / 60)}m {Math.floor(item.duration % 60)}s
                                                        </span>
                                                    </>
                                                )}
                                                <span className="opacity-40">•</span>
                                                <div className="flex items-center gap-1">
                                                    {item.type === 'missed' ? (
                                                        <PhoneOff size={11} className="text-rose-400" />
                                                    ) : item.sessionType === 'audio' ? (
                                                        <Phone size={11} className="text-emerald-400" />
                                                    ) : (
                                                        <MessageCircle size={11} className="text-blue-400" />
                                                    )}
                                                    <span className="capitalize text-[10px] font-medium text-slate-300">
                                                        {item.sessionType === 'audio' ? 'Audio' : 'Chat'} ({item.status})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
