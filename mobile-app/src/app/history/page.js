"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, PhoneMissed, PhoneOff, User, MessageCircle, MoreVertical } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('recent');

    const historyData = [
        { name: "MACHKURI HAREESH KUMAR", time: "08:24 PM", status: "Expert missed", date: "Today", type: "missed", avatar: null },
        { name: "Kavitha", time: "01:50 PM", status: "Expert rejected", date: "Today", type: "missed", avatar: null },
        { name: "Vamsi", time: "05:53 AM", status: "User missed", date: "Today", type: "missed", avatar: null },
        { name: "poluru Venkateswarlu", time: "02:22 AM", status: "Expert missed", date: "Yesterday", type: "missed", avatar: null },
        { name: "Shaik Ghouse Basha", time: "10:39 PM", status: "Expert rejected", date: "30th January", type: "missed", avatar: null },
        { name: "lucky", time: "09:28 PM", status: "User rejected", date: "30th January", type: "missed", avatar: null },
    ];

    const filteredData = historyData.filter(item => activeTab === 'missed' ? item.type === 'missed' : true);

    return (
        <div className="min-h-screen bg-cosmic-indigo pb-20 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white uppercase tracking-widest">History</h1>
                </div>
                <div className="glass-pill px-4 py-1.5 flex items-center gap-2 bg-white/10">
                   <span className="text-solar-gold font-bold">₹ 6737.06</span>
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
                    <span className="text-xs font-bold uppercase tracking-tight">Recent Calls</span>
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
                    <span className="text-xs font-bold uppercase tracking-tight">Missed Calls</span>
                </button>
            </div>

            {/* List */}
            <div className="space-y-8">
                {['Today', 'Yesterday', '30th January'].map((dateGroup) => {
                    const groupItems = filteredData.filter(item => item.date === dateGroup);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={dateGroup} className="space-y-4">
                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2">{dateGroup}</h2>
                            <div className="space-y-3">
                                {groupItems.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass-panel p-4 rounded-2xl border-white/5 flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center border border-white/10">
                                            <User size={24} className="text-slate-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-sm mb-0.5">{item.name}</h3>
                                            <div className="flex items-center gap-2 opacity-60">
                                                <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                                <div className="flex items-center gap-1">
                                                    {item.status.includes('missed') ? <PhoneOff size={10} className="text-red-400" /> : <MessageCircle size={10} className="text-slate-400" />}
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
