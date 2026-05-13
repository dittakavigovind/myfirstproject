"use client";

import { useEffect, useState } from 'react';
import { Activity, Users, DollarSign, Clock } from 'lucide-react';
import API from '../../lib/api';

export default function MobileAdminDashboard() {
    const [stats, setStats] = useState({ users: 0, astrologers: 0, revenue: 0, totalChatMinutes: 0, activeChats: 0, totalUserWallets: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const res = await API.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, []);

    if (loading) return <div>Loading Analytics...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Live Analytics</h1>
                    <p className="text-slate-400 mt-1">Real-time metrics for the Mobile App ecosystem</p>
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
                    <p className="text-slate-400 text-sm font-medium">Total Deducted Revenue</p>
                    <h2 className="text-3xl font-black text-white mt-1 uppercase">₹ {stats.revenue || 0}</h2>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                        <Clock size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Total Billed Minutes</p>
                    <h2 className="text-3xl font-black text-white mt-1">{stats.totalChatMinutes || 0} Mins</h2>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
                        <Activity size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Active Sessions Now</p>
                    <h2 className="text-3xl font-black text-white mt-1">{stats.activeChats || 0}</h2>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4">
                        <Users size={24} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Total App Users</p>
                    <h2 className="text-3xl font-black text-white mt-1">{stats.users || 0}</h2>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-lg mt-8 flex flex-col items-center justify-center text-center py-16">
                <Activity size={48} className="text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-300">Live Socket Monitor (Coming Soon)</h3>
                <p className="text-slate-500 max-w-md mt-2">
                    Visualizing active WebSocket connections, Waitlist lengths, and Agora Server states across all devices.
                </p>
            </div>
        </div>
    );
}
