"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Wallet, Info, ChevronRight, TrendingUp, CalendarDays, CalendarCheck, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CosmicCard from "@/components/CosmicCard";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function EarningsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        total: user?.walletBalance || 0,
        todayGross: 0,
        todayPlatform: 0,
        todayNet: 0,
        last7Days: [],
        lastMonth: []
    });
    const [expandedSection, setExpandedSection] = useState('7days'); // '7days' or 'month'
    
    // Calendar state
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDateEarning, setSelectedDateEarning] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/activity/stats/dashboard');
                if (res.data.success) {
                    setStats(prev => ({
                        ...prev,
                        todayGross: res.data.data.todayGross,
                        todayPlatform: res.data.data.todayPlatformShare,
                        todayNet: res.data.data.todayNet,
                        last7Days: res.data.data.last7Days || [],
                        lastMonth: res.data.data.lastMonth || []
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch earnings stats:", err);
            }
        };
        fetchStats();
    }, []);



    const calculateTotal = (dataArray) => {
        return dataArray.reduce((acc, curr) => acc + (curr.net || 0), 0).toFixed(2);
    };

    const getCalendarDays = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = new Date(year, month, 1).getDay(); // 0-6

        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const earning = stats.lastMonth.find(s => s._id === dateStr)?.net || 0;
            days.push({ day: i, dateStr, earning });
        }
        return { year, month, days };
    };

    const calendarData = getCalendarDays();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="min-h-screen pb-28 pt-safe">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 px-4 pt-3">
                <button 
                    onClick={() => router.back()} 
                    className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-all text-white/80 hover:text-white backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Earnings</h1>
                    <p className="text-[10px] text-slate-400 font-medium">Payouts & Revenue</p>
                </div>
            </div>

            <div className="px-4">
                {/* Total Earnings Holographic Card */}
                <div className="rounded-[28px] bg-gradient-to-br from-[#1a1740] via-[#101332] to-[#07091a] border border-white/15 p-6 mb-5 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-solar-gold/15 rounded-full blur-2xl pointer-events-none" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Total Net Earnings</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white tracking-tight">₹{stats.total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Today's Breakdown */}
                <div className="mb-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2.5">Today's Performance</h3>
                    <div className="p-5 rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                        <div className="space-y-3.5">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-medium">Today's Gross</span>
                                <span className="text-white font-bold text-sm">₹{stats.todayGross}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-medium">Platform Share</span>
                                <span className="text-rose-400 font-bold text-sm">- ₹{stats.todayPlatform}</span>
                            </div>
                            <div className="h-px bg-white/5 w-full" />
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400 font-black text-xs uppercase tracking-wider">Your Net Earnings</span>
                                <span className="text-emerald-400 text-2xl font-black">₹{stats.todayNet}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date-wise Performance */}
                <div className="mb-6">
                    {/* Apple Segmented Capsule */}
                    <div className="flex bg-black/40 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/10 mb-4 shadow-inner">
                        <button 
                            onClick={() => setExpandedSection('7days')}
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                                expandedSection === '7days' 
                                ? 'bg-gradient-to-r from-solar-gold to-amber-500 text-black shadow-lg shadow-solar-gold/20' 
                                : 'text-slate-400 font-bold hover:text-white'
                            }`}
                        >
                            Last 7 Days
                        </button>
                        <button 
                            onClick={() => setExpandedSection('month')}
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${
                                expandedSection === 'month' 
                                ? 'bg-gradient-to-r from-solar-gold to-amber-500 text-black shadow-lg shadow-solar-gold/20' 
                                : 'text-slate-400 font-bold hover:text-white'
                            }`}
                        >
                            Last Month
                        </button>
                    </div>

                    <div className="p-5 rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Period Total</span>
                            <span className="text-emerald-400 font-black text-xl">
                                ₹{calculateTotal(expandedSection === '7days' ? stats.last7Days : stats.lastMonth)}
                            </span>
                        </div>
                        
                        {expandedSection === '7days' ? (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                {stats.last7Days.length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center py-6">No earnings logged for this period.</p>
                                ) : (
                                    stats.last7Days.map((day, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                                            <div className="flex items-center gap-2.5">
                                                <CalendarDays size={14} className="text-solar-gold" />
                                                <span className="text-slate-200 text-xs font-bold">{new Date(day._id).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                            <span className="text-emerald-400 font-black text-sm">₹{day.net.toFixed(2)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div 
                                onClick={() => setShowCalendar(true)}
                                className="py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-solar-gold/15 border border-solar-gold/30 flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                                    <CalendarCheck size={28} className="text-solar-gold" />
                                </div>
                                <p className="text-white text-xs font-black uppercase tracking-widest">Monthly Calendar</p>
                                <p className="text-solar-gold text-[10px] mt-1 font-bold">Tap to inspect daily breakdown</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 mb-4 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 italic">For payout queries, reach us at</p>
                    <a href="mailto:info@way2astro.com" className="text-xs text-solar-gold font-bold">info@way2astro.com</a>
                </div>
            </div>

            {/* Calendar Modal */}
            <AnimatePresence>
                {showCalendar && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-astro-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-white font-bold text-lg">{monthNames[calendarData.month]} {calendarData.year}</h3>
                                <button onClick={() => { setShowCalendar(false); setSelectedDateEarning(null); }} className="p-2 text-white/60 hover:text-white bg-white/5 rounded-full">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <div className="p-4">
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarData.days.map((item, idx) => (
                                        <div key={idx} className="aspect-square">
                                            {item ? (
                                                <button
                                                    onClick={() => setSelectedDateEarning(item)}
                                                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm transition-all
                                                        ${item.earning > 0 
                                                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/40' 
                                                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                                        }
                                                        ${selectedDateEarning?.day === item.day ? 'ring-2 ring-solar-gold' : ''}
                                                    `}
                                                >
                                                    {item.day}
                                                </button>
                                            ) : (
                                                <div className="w-full h-full rounded-lg bg-transparent"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {selectedDateEarning && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                {new Date(selectedDateEarning.dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="text-sm font-semibold text-white">Earnings</p>
                                        </div>
                                        <span className="text-xl font-black text-emerald-400">₹{Math.round(selectedDateEarning.earning)}</span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
