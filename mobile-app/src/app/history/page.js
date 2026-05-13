"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, PhoneMissed, PhoneOff, User, MessageCircle, MoreVertical } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
    const router = useRouter();
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
                        const partner = session.astrologerId || session.userId || {};
                        const name = partner.displayName || partner.name || "Unknown User";
                        
                        let type = "recent";
                        let status = session.status;
                        if (status === 'missed' || status === 'failed') {
                            type = "missed";
                        }
                        
                        return {
                            id: session._id,
                            name,
                            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            status,
                            date: dateGroup,
                            type,
                            avatar: partner.image || partner.profileImage
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

        fetchHistory();
    }, []);

    const filteredData = historyData.filter(item => activeTab === 'missed' ? item.type === 'missed' : true);
    
    // Get unique date groups
    const dateGroups = [...new Set(filteredData.map(item => item.date))];

    return (
        <div className="min-h-screen bg-cosmic-indigo pb-20 pt-safe p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white uppercase tracking-widest">History</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setActiveTab('recent')}
                    className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border ${
                        activeTab === 'recent' 
                        ? 'bg-white text-cosmic-indigo border-white scale-[1.02]' 
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}
                >
                    <Phone size={24} />
                    <span className="text-xs font-bold uppercase tracking-tight">Recent Sessions</span>
                </button>
                <button 
                    onClick={() => setActiveTab('missed')}
                    className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border ${
                        activeTab === 'missed' 
                        ? 'bg-solar-gold text-cosmic-indigo border-solar-gold scale-[1.02]' 
                        : 'bg-white/5 text-slate-400 border-white/5'
                    }`}
                >
                    <PhoneMissed size={24} />
                    <span className="text-xs font-bold uppercase tracking-tight">Missed Sessions</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-8">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading history...</div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No {activeTab} sessions found.</div>
                ) : dateGroups.map((dateGroup) => {
                    const groupItems = filteredData.filter(item => item.date === dateGroup);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={dateGroup} className="space-y-4">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2">{dateGroup}</h2>
                            <div className="space-y-3">
                                {groupItems.map((item, i) => (
                                    <motion.div
                                        key={item.id || i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass-panel p-4 rounded-2xl border-white/5 flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center border border-white/10 overflow-hidden">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} className="text-slate-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-sm mb-0.5">{item.name}</h3>
                                            <div className="flex items-center gap-2 opacity-60">
                                                <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                                <div className="flex items-center gap-1">
                                                    {item.type === 'missed' ? <PhoneOff size={10} className="text-red-400" /> : <MessageCircle size={10} className="text-slate-400" />}
                                                    <span className="text-[10px] font-medium text-slate-400 capitalize">{item.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={18} className="text-white" />
                                        </button>
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
