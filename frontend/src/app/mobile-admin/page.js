"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Activity, Users, DollarSign, Clock, Receipt, X, Video, Phone, List, 
    Radio, CreditCard, Gift, Filter, ShieldCheck, ArrowRight 
} from 'lucide-react';
import API from '../../lib/api';

export default function MobileAdminDashboard() {
    const [stats, setStats] = useState({ 
        users: 0, 
        astrologers: 0, 
        revenue: 0, 
        totalChatMinutes: 0, 
        activeChats: 0, 
        totalUserWallets: 0,
        totalOnlinePaid: 0,
        totalOnlineRechargeBase: 0,
        totalManualRecharge: 0,
        totalGst: 0,
        todayGst: 0,
        totalDormantFunds: 0
    });
    const [vaultFilter, setVaultFilter] = useState('all'); // 'all', 'online', 'manual', 'gst'
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showActiveSessions, setShowActiveSessions] = useState(false);
    const [activeSessionsList, setActiveSessionsList] = useState([]);
    const [loadingActiveSessions, setLoadingActiveSessions] = useState(false);
    const [socketStats, setSocketStats] = useState({
        totalConnections: 0,
        userConnections: 0,
        astrologerConnections: 0,
        totalWaitlistLength: 0,
        activeVideoSessions: 0,
        activeAudioSessions: 0
    });

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

    const handleDownloadDormantFunds = async () => {
        try {
            const res = await API.get('/admin/dormant-funds/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'dormant_funds.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download dormant funds. No dormant users found or server error.');
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

    useEffect(() => {
        let intervalId;
        const fetchSocketStats = async () => {
            try {
                const res = await API.get('/admin/socket-monitor');
                if (res.data.success) {
                    setSocketStats(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching socket stats:", err);
            }
        };

        fetchSocketStats(); // Initial fetch
        intervalId = setInterval(fetchSocketStats, 5000); // Poll every 5s

        return () => clearInterval(intervalId);
    }, []);

    const isFiltered = Boolean(startDate && endDate);

    const vaultConfig = {
        all: {
            title: "Total Ecosystem Vault (Locked User Liquidity)",
            badge: "ALL VAULT LIQUIDITY",
            amount: stats.totalUserWallets || 0,
            description: "Sum total of all active user wallet balances available to be spent across consultations and chats.",
            breakdown: `Includes Gateway Paid (₹${Number(stats.totalOnlineRechargeBase || 0).toFixed(2)}) + Admin Grants (₹${Number(stats.totalManualRecharge || 0).toFixed(2)})`,
            gradient: "from-emerald-950/70 via-slate-900 to-teal-950/50",
            border: "border-emerald-500/40",
            accentText: "text-emerald-400",
            bgIcon: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
            icon: DollarSign,
            link: "/mobile-admin/finance",
            linkText: "View Financial Ledger"
        },
        online: {
            title: "Online Paid Recharges (Gateway Revenue)",
            badge: "RAZORPAY GATEWAY PAID",
            amount: stats.totalOnlinePaid || 0,
            description: "Total gross revenue collected from users through Razorpay (Base wallet credit + 18% statutory GST).",
            breakdown: `Base Wallet: ₹${Number(stats.totalOnlineRechargeBase || 0).toFixed(2)} | 18% GST: ₹${Number(stats.totalGst || 0).toFixed(2)}`,
            gradient: "from-blue-950/70 via-slate-900 to-indigo-950/50",
            border: "border-blue-500/40",
            accentText: "text-blue-400",
            bgIcon: "bg-blue-500/20 border-blue-500/30 text-blue-400",
            icon: CreditCard,
            link: "/mobile-admin/finance?type=paid_recharges&status=success",
            linkText: "View Online Paid Recharges"
        },
        manual: {
            title: "Manual Wallet Grants (Promotional/Free Credits)",
            badge: "ADMIN MANUAL GRANTS",
            amount: stats.totalManualRecharge || 0,
            description: "Promotional and test wallet balances granted manually by admin. Excluded from GST and gateway revenue.",
            breakdown: "100% Platform Sponsored • Zero Gateway Fee • Zero GST",
            gradient: "from-amber-950/70 via-slate-900 to-orange-950/50",
            border: "border-amber-500/40",
            accentText: "text-amber-400",
            bgIcon: "bg-amber-500/20 border-amber-500/30 text-amber-400",
            icon: Gift,
            link: "/mobile-admin/finance?type=manual&status=success",
            linkText: "View Manual Grants Ledger"
        },
        gst: {
            title: "Total GST Collected (18% Statutory Tax)",
            badge: "STATUTORY TAX (18%)",
            amount: stats.totalGst || 0,
            description: "18% Goods & Services Tax collected strictly on online recharges for government compliance.",
            breakdown: "18% Statutory Tax on Online Recharges • Zero Tax on Free Manual Grants",
            gradient: "from-purple-950/70 via-slate-900 to-fuchsia-950/50",
            border: "border-purple-500/40",
            accentText: "text-purple-400",
            bgIcon: "bg-purple-500/20 border-purple-500/30 text-purple-400",
            icon: Receipt,
            link: "/mobile-admin/finance?type=gst_recharges&status=success",
            linkText: "View GST Paid Transactions"
        }
    };
    const currentVault = vaultConfig[vaultFilter] || vaultConfig.all;
    const CurrentVaultIcon = currentVault.icon;

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

            {/* Interactive Ecosystem Vault Card */}
            <div className={`bg-gradient-to-r ${currentVault.gradient} border ${currentVault.border} p-6 sm:p-8 rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden`}>
                {/* Background decorative glow */}
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Filter Tab Bar at Top of Card */}
                <div className="flex items-center justify-between flex-wrap gap-3 pb-5 mb-6 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 mr-1">
                            <Filter size={14} className={currentVault.accentText} /> Vault Filter:
                        </span>
                        <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 flex-wrap gap-1">
                            <button
                                onClick={() => setVaultFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    vaultFilter === 'all'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                                }`}
                            >
                                <DollarSign size={13} /> All Vault
                            </button>
                            <button
                                onClick={() => setVaultFilter('online')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    vaultFilter === 'online'
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50 shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                                }`}
                            >
                                <CreditCard size={13} /> Online Paid
                            </button>
                            <button
                                onClick={() => setVaultFilter('manual')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    vaultFilter === 'manual'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                                }`}
                            >
                                <Gift size={13} /> Manual
                            </button>
                            <button
                                onClick={() => setVaultFilter('gst')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    vaultFilter === 'gst'
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                                }`}
                            >
                                <Receipt size={13} /> GST (18%)
                            </button>
                        </div>
                    </div>

                    <Link
                        href={currentVault.link}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 bg-white/5 hover:bg-white/10 ${currentVault.accentText} border border-white/10 shadow-sm`}
                    >
                        <span>{currentVault.linkText}</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>

                {/* Hero Metric & Description */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-4 sm:gap-6">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 ${currentVault.bgIcon} rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-transform hover:scale-105`}>
                            <CurrentVaultIcon size={36} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-white/10 ${currentVault.accentText}`}>
                                    {currentVault.badge}
                                </span>
                                <span className="text-slate-400 text-xs font-medium">{currentVault.title}</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-white mt-1.5 tracking-tight">
                                ₹ {Number(currentVault.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <p className="text-slate-300 text-sm mt-1.5 max-w-2xl">{currentVault.description}</p>
                            <div className="mt-2.5 flex items-center gap-2 text-xs font-mono text-slate-300 bg-black/30 px-3 py-1 rounded-lg w-fit border border-white/10">
                                <ShieldCheck size={14} className={currentVault.accentText} />
                                <span>{currentVault.breakdown}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive 4-Card Selector Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 relative z-10">
                    {/* 1. All Vault */}
                    <div
                        onClick={() => setVaultFilter('all')}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                            vaultFilter === 'all'
                                ? 'bg-emerald-950/70 border-emerald-500/70 ring-2 ring-emerald-500/50 shadow-lg'
                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                <DollarSign size={12} /> All Vault
                            </span>
                            {vaultFilter === 'all' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">ACTIVE</span>
                            )}
                        </div>
                        <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                            ₹ {Number(stats.totalUserWallets || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">Total Active Liquidity</p>
                    </div>

                    {/* 2. Online Paid */}
                    <div
                        onClick={() => setVaultFilter('online')}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                            vaultFilter === 'online'
                                ? 'bg-blue-950/70 border-blue-500/70 ring-2 ring-blue-500/50 shadow-lg'
                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                                <CreditCard size={12} /> Online Paid
                            </span>
                            {vaultFilter === 'online' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">ACTIVE</span>
                            )}
                        </div>
                        <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                            ₹ {Number(stats.totalOnlinePaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">Razorpay Gross Paid</p>
                    </div>

                    {/* 3. Manual Added */}
                    <div
                        onClick={() => setVaultFilter('manual')}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                            vaultFilter === 'manual'
                                ? 'bg-amber-950/70 border-amber-500/70 ring-2 ring-amber-500/50 shadow-lg'
                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                <Gift size={12} /> Manual Grants
                            </span>
                            {vaultFilter === 'manual' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">ACTIVE</span>
                            )}
                        </div>
                        <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                            ₹ {Number(stats.totalManualRecharge || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">Admin Promotional</p>
                    </div>

                    {/* 4. GST */}
                    <div
                        onClick={() => setVaultFilter('gst')}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                            vaultFilter === 'gst'
                                ? 'bg-purple-950/70 border-purple-500/70 ring-2 ring-purple-500/50 shadow-lg'
                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                                <Receipt size={12} /> Total GST (18%)
                            </span>
                            {vaultFilter === 'gst' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">ACTIVE</span>
                            )}
                        </div>
                        <p className="text-lg sm:text-xl font-black text-white tracking-tight">
                            ₹ {Number(stats.totalGst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">18% Online Tax</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl flex justify-between items-center flex-wrap gap-6">
                <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 border border-slate-700">
                         <DollarSign size={32} />
                     </div>
                     <div>
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Dormant Funds (Deleted Users)</p>
                         <h2 className="text-4xl font-black text-white mt-2 tracking-tight">₹ {(stats.totalDormantFunds || 0).toLocaleString()}</h2>
                         <p className="text-slate-500 text-sm mt-2">Unspent wallet balances retained from users who have deleted their accounts.</p>
                     </div>
                </div>
                <button 
                    onClick={handleDownloadDormantFunds}
                    disabled={!stats.totalDormantFunds || stats.totalDormantFunds === 0}
                    className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
                        (!stats.totalDormantFunds || stats.totalDormantFunds === 0) 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                >
                    <List size={20} /> Download CSV
                </button>
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

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-lg mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Radio size={28} className="text-blue-500 animate-pulse" />
                    <h3 className="text-2xl font-bold text-white">Live Socket Monitor</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Total Connections */}
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col">
                        <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                            <Activity size={16} /> Total WS Connections
                        </div>
                        <h4 className="text-4xl font-black text-white">{socketStats.totalConnections}</h4>
                        <div className="flex gap-4 mt-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Users size={14} className="text-blue-400"/> {socketStats.userConnections} Users</span>
                            <span className="flex items-center gap-1"><Users size={14} className="text-purple-400"/> {socketStats.astrologerConnections} Astros</span>
                        </div>
                    </div>

                    {/* Waitlist */}
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col">
                        <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                            <List size={16} /> Global Waitlist
                        </div>
                        <h4 className="text-4xl font-black text-amber-400">{socketStats.totalWaitlistLength}</h4>
                        <p className="text-sm text-slate-500 mt-4">Users waiting for Astrologers across all queues.</p>
                    </div>

                    {/* Video Sessions */}
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col">
                        <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                            <Video size={16} /> Active Video (Agora)
                        </div>
                        <h4 className="text-4xl font-black text-emerald-400">{socketStats.activeVideoSessions}</h4>
                        <p className="text-sm text-slate-500 mt-4">Ongoing face-to-face sessions.</p>
                    </div>

                    {/* Audio Sessions */}
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col">
                        <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                            <Phone size={16} /> Active Audio (Agora)
                        </div>
                        <h4 className="text-4xl font-black text-orange-400">{socketStats.activeAudioSessions}</h4>
                        <p className="text-sm text-slate-500 mt-4">Ongoing voice call sessions.</p>
                    </div>
                </div>
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
