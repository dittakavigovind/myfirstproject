"use client";

import { useEffect, useState } from 'react';
import { Activity, Users, DollarSign, Clock, Receipt, X } from 'lucide-react';
import API from '../../lib/api';

export default function MobileAdminDashboard() {
    const [stats, setStats] = useState({ users: 0, astrologers: 0, revenue: 0, totalChatMinutes: 0, activeChats: 0, totalUserWallets: 0 });
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showActiveSessions, setShowActiveSessions] = useState(false);
    const [activeSessionsList, setActiveSessionsList] = useState([]);
    const [loadingActiveSessions, setLoadingActiveSessions] = useState(false);

    const handleActiveSessionsClick = async () => {
        setShowActiveSessions(true);
        setLoadingActiveSessions(true);
        try {
            const res = await API.get('/admin/sessions', { params: { status: 'active' } });
            if (res.data.success) {
                setActiveSessionsList(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch active sessions:", err);
        } finally {
            setLoadingActiveSessions(false);
        }
    };

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoading(true);
            try {
                const params = {};
                if (startDate && endDate) {
                    params.startDate = startDate;
                    params.endDate = endDate;
                }
                const res = await API.get('/admin/stats', { params });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, [startDate, endDate]);

    const isFiltered = Boolean(startDate && endDate);

    if (loading) return <div>Loading Analytics...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Live Analytics</h1>
                    <p className="text-slate-400 mt-1">Real-time metrics for the Mobile App ecosystem</p>
                </div>
                <div className="flex gap-4 items-center bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-lg">
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-950 text-white border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none [color-scheme:dark]"
                    />
                    <span className="text-slate-500">to</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-950 text-white border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none [color-scheme:dark]"
                    />
                    {(startDate || endDate) && (
                        <button 
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="text-xs text-red-400 hover:text-red-300 ml-2 font-bold px-3 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl flex items-center gap-6">
                 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                     <DollarSign size={32} />
                 </div>
                 <div>
                     <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Total Ecosystem Vault (Locked User Liquidity)</p>
                     <h2 className="text-5xl font-black text-white mt-2 tracking-tight">₹ {(stats.totalUserWallets || 0).toLocaleString()}</h2>
                     <p className="text-slate-400 text-sm mt-2">Sum total of all active user wallet balances available to be spent on the platform.</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">{isFiltered ? 'Period Deducted Revenue' : 'Total Deducted Revenue'}</p>
                    <h2 className="text-3xl font-black text-white mt-1 uppercase">₹ {stats.revenue || 0}</h2>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                        <Clock size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">{isFiltered ? 'Period Billed Minutes' : 'Total Billed Minutes'}</p>
                    <h2 className="text-3xl font-black text-white mt-1">{stats.totalChatMinutes || 0} Mins</h2>
                </div>

                <div 
                    onClick={handleActiveSessionsClick}
                    className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-slate-800 hover:border-green-500/50 transition relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 relative z-10">
                        <Activity size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium relative z-10">Active Sessions Now</p>
                    <h2 className="text-3xl font-black text-white mt-1 relative z-10">{stats.activeChats || 0}</h2>
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-green-400/50 text-xs font-bold uppercase tracking-widest">
                        View Details
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Total App Users</p>
                    <h2 className="text-3xl font-black text-white mt-1">{stats.users || 0}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white/[0.02] to-transparent">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{isFiltered ? 'Period Total Revenue' : "Today's Total Revenue"}</p>
                    <h2 className="text-3xl font-black text-white">₹ {stats.todayRevenue || 0}</h2>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white/[0.02] to-transparent">
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">{isFiltered ? 'Period Platform Share' : "Today's Platform Share"}</p>
                    <h2 className="text-3xl font-black text-white">₹ {stats.todayPlatformShare || 0}</h2>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-purple-500" style={{ width: `${(stats.todayPlatformShare / stats.todayRevenue * 100) || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white/[0.02] to-transparent">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{isFiltered ? 'Period Astrologer Share' : "Today's Astrologer Share"}</p>
                    <h2 className="text-3xl font-black text-white">₹ {stats.todayAstrologerShare || 0}</h2>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500" style={{ width: `${(stats.todayAstrologerShare / stats.todayRevenue * 100) || 0}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-amber-900/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{isFiltered ? 'Period Total GST' : 'Total GST Collected (Lifetime)'}</p>
                            <h2 className="text-3xl font-black text-white">₹ {stats.totalGst || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg bg-gradient-to-br from-amber-900/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{isFiltered ? 'Period GST Collected' : "Today's GST Collected"}</p>
                            <h2 className="text-3xl font-black text-white">₹ {stats.todayGst || 0}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-lg mt-8 flex flex-col items-center justify-center text-center py-16">
                <Activity size={48} className="text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-300">Live Socket Monitor (Coming Soon)</h3>
                <p className="text-slate-500 max-w-md mt-2">
                    Visualizing active WebSocket connections, Waitlist lengths, and Agora Server states across all devices.
                </p>
            </div>

            {showActiveSessions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-4 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-green-500" size={20} /> Active Sessions
                            </h3>
                            <button onClick={() => setShowActiveSessions(false)} className="text-slate-400 hover:text-white p-2 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-slate-950/50">
                            {loadingActiveSessions ? (
                                <div className="text-center text-slate-500 py-12 flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                    <p>Loading active sessions...</p>
                                </div>
                            ) : activeSessionsList.length === 0 ? (
                                <div className="text-center text-slate-500 py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                                    <Activity className="mx-auto mb-3 opacity-20" size={32} />
                                    <p>No active sessions right now.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeSessionsList.map((session, i) => (
                                        <div key={i} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 transition shadow-md">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                                        session.sessionType === 'video' ? 'bg-indigo-500/20 text-indigo-400' :
                                                        session.sessionType === 'call' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-green-500/20 text-green-400'
                                                    }`}>
                                                        {session.sessionType || 'chat'}
                                                    </span>
                                                    <span className="text-slate-500 text-xs font-mono">{session.roomId}</span>
                                                </div>
                                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-center">
                                                    <span className="text-slate-500 text-sm">User:</span>
                                                    <span className="text-blue-400 font-medium">{session.userId?.name || 'Unknown'} <span className="text-slate-600 text-xs ml-1">({session.userId?.phone || 'No phone'})</span></span>
                                                    
                                                    <span className="text-slate-500 text-sm">Astro:</span>
                                                    <span className="text-purple-400 font-medium">{session.astrologerId?.name || session.astrologerId?.displayName || 'Unknown'}</span>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                                                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Started At</p>
                                                <p className="text-white font-mono text-sm">
                                                    {session.startTime ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Pending'}
                                                </p>
                                                <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between md:justify-end items-center gap-3">
                                                    <span className="text-slate-500 text-xs">Rate:</span>
                                                    <span className="text-emerald-400 text-sm font-bold">₹ {session.pricePerMinute || 0}/min</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
