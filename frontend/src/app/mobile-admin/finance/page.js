"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import API from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import {
    ArrowLeft, Download, Search, DollarSign, ArrowUpRight, ArrowDownLeft,
    Clock, CreditCard, Smartphone, Building, Wallet, CheckCircle2,
    XCircle, AlertCircle, RefreshCw, Copy, Check, Filter, ShieldCheck,
    Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

function AdminFinanceDashboardContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, success, pending, failed
    const [typeFilter, setTypeFilter] = useState('all'); // all, gst_recharges, paid_recharges, recharges, sessions, manual
    const [syncingId, setSyncingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Sync query parameters on initial load or change
    useEffect(() => {
        if (!searchParams) return;
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        if (type) setTypeFilter(type);
        if (status) setStatusFilter(status);
    }, [searchParams]);

    useEffect(() => {
        if (!loading) {
            if (!user || !['admin', 'manager', 'finance_admin'].includes(user.role)) {
                router.push('/dashboard');
            } else {
                fetchTransactions();
            }
        }
    }, [user, loading, router]);

    const fetchTransactions = async () => {
        try {
            const res = await API.get('/admin/transactions');
            if (res.data.success) {
                setTransactions(res.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncStatus = async (txId) => {
        try {
            setSyncingId(txId);
            const res = await API.post(`/admin/transactions/${txId}/sync-status`);
            if (res.data.success) {
                toast.success(res.data.message || 'Status synced with Razorpay');
                if (res.data.transaction) {
                    setTransactions(prev => prev.map(t => t._id === txId ? { ...t, ...res.data.transaction } : t));
                }
            } else {
                toast.error(res.data.message || 'Failed to sync with Razorpay');
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error(error.response?.data?.message || 'Error checking Razorpay status');
        } finally {
            setSyncingId(null);
        }
    };

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const recharges = transactions.filter(t => 
            t.referenceModel === 'Recharge' || 
            t.referenceModel === 'WalletRecharge' || 
            (t.description && t.description.toLowerCase().includes('recharge'))
        );

        const successfulRecharges = recharges.filter(t => t.status === 'success');

        // Only count actual user payments via payment gateway (exclude admin manual grants)
        const totalPaidByUsers = successfulRecharges
            .filter(t => !t.description?.toLowerCase().includes('manual'))
            .reduce((acc, t) => {
                const total = t.totalAmount != null ? t.totalAmount : (t.amount + (t.gstAmount || 0));
                return acc + total;
            }, 0);

        const totalRechargeBase = successfulRecharges.reduce((acc, t) => acc + (t.amount || 0), 0);
        
        const totalGST = successfulRecharges.reduce((acc, t) => {
            const isManual = t.description?.toLowerCase().includes('manual');
            if (isManual) return acc;
            const gst = t.gstAmount != null ? t.gstAmount : (t.totalAmount ? (t.totalAmount - t.amount) : 0);
            return acc + (gst > 0 ? gst : 0);
        }, 0);

        const successCount = transactions.filter(t => t.status === 'success').length;
        const pendingCount = transactions.filter(t => t.status === 'pending').length;
        const failedCount = transactions.filter(t => t.status === 'failed').length;

        const gstPaidCount = successfulRecharges.filter(t => {
            const isManual = t.description?.toLowerCase().includes('manual');
            if (isManual) return false;
            const gst = t.gstAmount != null ? t.gstAmount : (t.totalAmount ? (t.totalAmount - t.amount) : 0);
            return gst > 0;
        }).length;

        return {
            totalRechargeBase,
            totalGST,
            totalPaidByUsers,
            rechargesCount: recharges.length,
            gstPaidCount,
            successCount,
            pendingCount,
            failedCount
        };
    }, [transactions]);

    const filteredTransactions = transactions.filter(t => {
        // Status filter
        if (statusFilter !== 'all' && t.status !== statusFilter) {
            return false;
        }

        // Type definitions
        const isManual = Boolean(
            (t.description && t.description.toLowerCase().includes('manual')) ||
            t.referenceModel === 'ManualWallet'
        );
        const isRecharge = Boolean(
            t.referenceModel === 'Recharge' || 
            t.referenceModel === 'WalletRecharge' || 
            (t.description && t.description.toLowerCase().includes('recharge'))
        );
        const gst = t.gstAmount != null ? t.gstAmount : (!isManual && t.totalAmount && t.amount ? (t.totalAmount - t.amount) : 0);
        const hasGst = Boolean(!isManual && gst > 0);
        const isOnlinePaid = Boolean(isRecharge && !isManual && (t.paymentId || t.orderId || hasGst));
        const isSession = Boolean(
            t.referenceModel === 'Session' || 
            (t.description && (t.description.toLowerCase().includes('session') || t.description.toLowerCase().includes('chat')))
        );

        // Type filter
        if (typeFilter === 'gst_recharges') {
            if (!hasGst) return false; // Strictly exclude manual and 0-GST recharges
        } else if (typeFilter === 'paid_recharges') {
            if (!isOnlinePaid) return false; // Exclude manual admin grants
        } else if (typeFilter === 'recharges') {
            if (!isRecharge) return false;
        } else if (typeFilter === 'sessions') {
            if (!isSession) return false;
        } else if (typeFilter === 'manual') {
            if (!isManual) return false;
        }

        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const amountStr = t.amount != null ? Number(t.amount).toFixed(2) : '';
        const totalStr = t.totalAmount != null ? Number(t.totalAmount).toFixed(2) : '';

        const matchesSearch = !searchTerm ||
            t.user?.name?.toLowerCase().includes(searchLower) ||
            t.user?.email?.toLowerCase().includes(searchLower) ||
            t.user?.phone?.includes(searchTerm) ||
            t.description?.toLowerCase().includes(searchLower) ||
            t._id?.toLowerCase().includes(searchLower) ||
            t.paymentId?.toLowerCase().includes(searchLower) ||
            t.orderId?.toLowerCase().includes(searchLower) ||
            t.paymentMethod?.toLowerCase().includes(searchLower) ||
            amountStr.includes(searchTerm) ||
            totalStr.includes(searchTerm);

        // Date filter
        let matchesDate = true;
        if (startDate || endDate) {
            const txDate = new Date(t.createdAt);
            txDate.setHours(0, 0, 0, 0);

            if (startDate && endDate) {
                const sDate = new Date(startDate);
                sDate.setHours(0, 0, 0, 0);
                const eDate = new Date(endDate);
                eDate.setHours(23, 59, 59, 999);
                matchesDate = txDate >= sDate && txDate <= eDate;
            } else if (startDate) {
                const sDate = new Date(startDate);
                sDate.setHours(0, 0, 0, 0);
                matchesDate = txDate >= sDate;
            } else if (endDate) {
                const eDate = new Date(endDate);
                eDate.setHours(23, 59, 59, 999);
                matchesDate = txDate <= eDate;
            }
        }

        return matchesSearch && matchesDate;
    });

    // Dynamic totals for currently filtered transactions
    const filteredTotals = useMemo(() => {
        let totalPaid = 0;
        let totalBase = 0;
        let totalGst = 0;

        filteredTransactions.forEach(t => {
            const isManual = Boolean(
                (t.description && t.description.toLowerCase().includes('manual')) ||
                t.referenceModel === 'ManualWallet'
            );
            const isRecharge = Boolean(
                t.referenceModel === 'Recharge' || 
                t.referenceModel === 'WalletRecharge' || 
                (t.description && t.description.toLowerCase().includes('recharge'))
            );
            const gst = !isManual && t.gstAmount != null ? t.gstAmount : (!isManual && isRecharge && t.totalAmount && t.amount ? (t.totalAmount - t.amount) : 0);
            const total = isManual ? 0 : (t.totalAmount != null ? t.totalAmount : (isRecharge ? ((t.amount || 0) + (gst || 0)) : (t.amount || 0)));

            totalPaid += (total || 0);
            totalBase += (t.amount || 0);
            totalGst += (gst > 0 ? gst : 0);
        });

        return { totalPaid, totalBase, totalGst };
    }, [filteredTransactions]);

    const handleExport = () => {
        try {
            const headers = [
                'Date & Time',
                'Platform Tx ID',
                'Razorpay Payment ID',
                'Razorpay Order ID',
                'Payment Method',
                'User Name',
                'User Email',
                'User Phone',
                'Recharge Amount (Wallet Added)',
                'GST Amount (18%)',
                'Total Paid by User',
                'Type',
                'Category',
                'Status',
                'Description'
            ];

            const rows = filteredTransactions.map(t => {
                const isManual = Boolean(t.description && t.description.toLowerCase().includes('manual'));
                const isRecharge = t.referenceModel === 'Recharge' || t.referenceModel === 'WalletRecharge' || (t.description && t.description.toLowerCase().includes('recharge'));
                const gst = !isManual && t.gstAmount != null ? t.gstAmount : (!isManual && t.totalAmount ? (t.totalAmount - t.amount) : 0);
                const totalPaid = isManual ? 0 : (t.totalAmount != null ? t.totalAmount : (isRecharge ? (t.amount + gst) : t.amount));

                return [
                    new Date(t.createdAt).toLocaleString(),
                    t._id,
                    t.paymentId || 'N/A',
                    t.orderId || 'N/A',
                    isManual ? 'ADMIN MANUAL GRANT' : (t.paymentMethod ? t.paymentMethod.toUpperCase() : (t.paymentId ? 'RAZORPAY' : (isRecharge ? 'N/A' : 'INTERNAL WALLET'))),
                    t.user?.name || 'Unknown',
                    t.user?.email || 'N/A',
                    t.user?.phone || 'N/A',
                    Number(t.amount || 0).toFixed(2),
                    Number(gst || 0).toFixed(2),
                    Number(totalPaid || 0).toFixed(2),
                    t.type,
                    isManual ? 'ManualWallet' : (t.referenceModel || 'Other'),
                    t.status,
                    t.description
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `financial_logs_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Export downloaded successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export failed');
        }
    };

    const renderPaymentMethod = (t) => {
        const isManual = Boolean(t.description && t.description.toLowerCase().includes('manual'));
        if (isManual) {
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Wallet size={10} className="text-amber-400" /> Admin Grant
                </span>
            );
        }

        const method = t.paymentMethod?.toLowerCase();
        if (method === 'upi') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <Smartphone size={11} className="text-purple-400" /> UPI
                </span>
            );
        }
        if (method === 'card') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    <CreditCard size={11} className="text-blue-400" /> Card
                </span>
            );
        }
        if (method === 'netbanking') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <Building size={11} className="text-emerald-400" /> NetBanking
                </span>
            );
        }
        if (method === 'wallet') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Wallet size={11} className="text-amber-400" /> Wallet
                </span>
            );
        }
        if (method) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <CreditCard size={11} /> {method.toUpperCase()}
                </span>
            );
        }
        if (t.paymentId) {
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/80">
                    <CreditCard size={10} /> Razorpay
                </span>
            );
        }
        const isRecharge = t.referenceModel === 'Recharge' || t.referenceModel === 'WalletRecharge' || (t.description && t.description.toLowerCase().includes('recharge'));
        if (isRecharge) {
            return <span className="text-[10px] text-slate-500 italic">Pending Mode</span>;
        }
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800/60 text-slate-400">
                In-App
            </span>
        );
    };

    if (loading || isLoading) {
        return (
            <div className="p-10 flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800">
                <div className="flex items-center gap-3.5">
                    <button 
                        onClick={() => router.push('/mobile-admin')}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
                        title="Back to Mobile Admin"
                    >
                        <ArrowLeft size={18} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white flex items-center gap-2">
                            <DollarSign className="text-green-500" size={22} /> Financial Dashboard
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Real-time platform recharges, GST breakdown, and transaction status logs.
                        </p>
                    </div>
                </div>

                {/* Date filter + Search + Export */}
                <div className="flex items-center gap-2.5 flex-wrap justify-end">
                    <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
                        />
                        <span className="text-slate-500 text-xs">to</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
                        />
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[11px] text-red-400 hover:text-red-300 mx-0.5 font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search user, ID, amount..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-white border border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Interactive KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Total Paid by Users (Online Gateway Recharges) */}
                <div 
                    onClick={() => setTypeFilter(prev => prev === 'paid_recharges' ? 'all' : 'paid_recharges')}
                    className={`border rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                        typeFilter === 'paid_recharges'
                            ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Paid by Users</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            typeFilter === 'paid_recharges' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                        ₹{metrics.totalPaidByUsers.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-500">Gateway collections</span>
                        {typeFilter === 'paid_recharges' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">Filter Active <Check size={10} /></span>
                        ) : (
                            <span className="text-slate-500 hover:text-slate-300">Click to filter</span>
                        )}
                    </div>
                </div>

                {/* 2. Wallet Recharge Base (All Recharges) */}
                <div 
                    onClick={() => setTypeFilter(prev => prev === 'recharges' ? 'all' : 'recharges')}
                    className={`border rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                        typeFilter === 'recharges'
                            ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wallet Recharge Base</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            typeFilter === 'recharges' ? 'bg-blue-500 text-slate-950 font-bold' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                            <Wallet size={16} />
                        </div>
                    </div>
                    <div className="text-xl font-black text-blue-400">
                        ₹{metrics.totalRechargeBase.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-500">Credited to wallets</span>
                        {typeFilter === 'recharges' ? (
                            <span className="text-blue-400 font-bold flex items-center gap-0.5">Filter Active <Check size={10} /></span>
                        ) : (
                            <span className="text-slate-500 hover:text-slate-300">Click to filter</span>
                        )}
                    </div>
                </div>

                {/* 3. Total GST Collected - ONLY GST PAID TRANSACTIONS */}
                <div 
                    onClick={() => setTypeFilter(prev => prev === 'gst_recharges' ? 'all' : 'gst_recharges')}
                    className={`border rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                        typeFilter === 'gst_recharges'
                            ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                            <Receipt size={13} className="text-purple-400" /> Total GST (18%)
                        </span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            typeFilter === 'gst_recharges' ? 'bg-purple-500 text-slate-950 font-bold' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                            <Receipt size={16} />
                        </div>
                    </div>
                    <div className="text-xl font-black text-purple-400">
                        ₹{metrics.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-400">Across {metrics.gstPaidCount} recharges</span>
                        {typeFilter === 'gst_recharges' ? (
                            <span className="text-purple-300 font-bold flex items-center gap-0.5">GST Paid Active <Check size={10} /></span>
                        ) : (
                            <span className="text-purple-400 hover:text-purple-300 font-medium">Click for GST Paid</span>
                        )}
                    </div>
                </div>

                {/* 4. Status Breakdown - Interactive Card */}
                <div className={`border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                    statusFilter !== 'all' ? 'bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/30' : 'bg-slate-900 border-slate-800'
                }`}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Filter</span>
                        {statusFilter !== 'all' ? (
                            <button
                                onClick={() => setStatusFilter('all')}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                            >
                                Reset ({transactions.length})
                            </button>
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                                <Filter size={14} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                        {/* Success Button */}
                        <button
                            onClick={() => setStatusFilter(prev => prev === 'success' ? 'all' : 'success')}
                            className={`flex-1 rounded-xl p-2 text-center transition-all cursor-pointer ${
                                statusFilter === 'success'
                                    ? 'bg-green-500 text-slate-950 font-black shadow-md shadow-green-500/30 scale-[1.02]'
                                    : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400'
                            }`}
                            title="Click to toggle Success filter"
                        >
                            <div className={`text-xs font-black ${statusFilter === 'success' ? 'text-slate-950' : 'text-green-400'}`}>
                                {metrics.successCount}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${statusFilter === 'success' ? 'text-slate-900' : 'text-green-500/90'}`}>
                                Success
                            </div>
                        </button>

                        {/* Pending Button */}
                        <button
                            onClick={() => setStatusFilter(prev => prev === 'pending' ? 'all' : 'pending')}
                            className={`flex-1 rounded-xl p-2 text-center transition-all cursor-pointer ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-[1.02]'
                                    : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400'
                            }`}
                            title="Click to toggle Pending filter"
                        >
                            <div className={`text-xs font-black ${statusFilter === 'pending' ? 'text-slate-950' : 'text-amber-400'}`}>
                                {metrics.pendingCount}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${statusFilter === 'pending' ? 'text-slate-900' : 'text-amber-500/90'}`}>
                                Pending
                            </div>
                        </button>

                        {/* Failed Button */}
                        <button
                            onClick={() => setStatusFilter(prev => prev === 'failed' ? 'all' : 'failed')}
                            className={`flex-1 rounded-xl p-2 text-center transition-all cursor-pointer ${
                                statusFilter === 'failed'
                                    ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/30 scale-[1.02]'
                                    : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400'
                            }`}
                            title="Click to toggle Failed/Cancelled filter"
                        >
                            <div className={`text-xs font-black ${statusFilter === 'failed' ? 'text-white' : 'text-red-400'}`}>
                                {metrics.failedCount}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${statusFilter === 'failed' ? 'text-white' : 'text-red-400'}`}>
                                Failed
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs: Category & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Filter size={12} /> Category:
                    </span>
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            typeFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        All Transactions
                    </button>
                    <button
                        onClick={() => setTypeFilter('gst_recharges')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            typeFilter === 'gst_recharges'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
                        }`}
                    >
                        <Receipt size={12} /> GST Paid Only
                    </button>
                    <button
                        onClick={() => setTypeFilter('paid_recharges')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            typeFilter === 'paid_recharges'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <ShieldCheck size={12} /> Online Paid
                    </button>
                    <button
                        onClick={() => setTypeFilter('recharges')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            typeFilter === 'recharges'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        <Wallet size={12} /> All Recharges
                    </button>
                    <button
                        onClick={() => setTypeFilter('sessions')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            typeFilter === 'sessions'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        Chat Sessions
                    </button>
                    <button
                        onClick={() => setTypeFilter('manual')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            typeFilter === 'manual'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        Manual Wallet
                    </button>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            statusFilter === 'all'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                    >
                        All ({transactions.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('success')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            statusFilter === 'success'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                        }`}
                    >
                        <CheckCircle2 size={12} /> Success ({metrics.successCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            statusFilter === 'pending'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                        }`}
                    >
                        <AlertCircle size={12} /> Pending ({metrics.pendingCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('failed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            statusFilter === 'failed'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                        }`}
                    >
                        <XCircle size={12} /> Cancelled ({metrics.failedCount})
                    </button>
                </div>
            </div>

            {/* Results Count Bar & Live Filtered Totals */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                    <span>
                        Showing <strong className="text-white">{filteredTransactions.length}</strong> of{' '}
                        <strong className="text-slate-400">{transactions.length}</strong> transactions
                    </span>
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate) && (
                        <span className="bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/30 text-[11px]">
                            Filtered: {typeFilter === 'gst_recharges' ? 'GST Paid Only' : typeFilter === 'paid_recharges' ? 'Online Paid Only' : typeFilter}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
                    <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                        <span>Filtered Total: <strong className="text-emerald-400 font-bold font-mono">₹{filteredTotals.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>GST: <strong className="text-purple-400 font-bold font-mono">₹{filteredTotals.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                    </div>

                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate) && (
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setTypeFilter('all');
                                setStartDate('');
                                setEndDate('');
                            }} 
                            className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer text-xs ml-1"
                        >
                            Reset all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Responsive Table - NO horizontal scroll, 5 smart columns */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden w-full">
                <table className="w-full text-left text-sm table-fixed">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                        <tr>
                            <th className="p-3.5 w-[25%]">Transaction / ID</th>
                            <th className="p-3.5 w-[20%]">User</th>
                            <th className="p-3.5 w-[25%]">Description & Method</th>
                            <th className="p-3.5 w-[18%]">Amount & GST</th>
                            <th className="p-3.5 w-[12%] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredTransactions.map(t => {
                            const isManual = Boolean(
                                (t.description && t.description.toLowerCase().includes('manual')) ||
                                t.referenceModel === 'ManualWallet'
                            );
                            const isRecharge = t.referenceModel === 'Recharge' || t.referenceModel === 'WalletRecharge' || (t.description && t.description.toLowerCase().includes('recharge'));
                            const gst = !isManual && t.gstAmount != null ? t.gstAmount : (!isManual && isRecharge && t.totalAmount ? (t.totalAmount - t.amount) : 0);
                            const totalPaid = isManual ? 0 : (t.totalAmount != null ? t.totalAmount : (isRecharge ? (t.amount + gst) : t.amount));

                            return (
                                <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                                    {/* 1. Transaction & IDs */}
                                    <td className="p-3.5 align-top">
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono text-xs font-semibold text-slate-200 truncate max-w-[150px]" title={t._id}>
                                                {t._id}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(t._id, t._id)}
                                                className="text-slate-500 hover:text-white transition p-0.5 flex-shrink-0"
                                                title="Copy Tx ID"
                                            >
                                                {copiedId === t._id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                            </button>
                                        </div>

                                        {/* Gateway ID */}
                                        {t.paymentId && (
                                            <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono mt-0.5 truncate">
                                                <span className="text-slate-500">Pay:</span>
                                                <span className="truncate max-w-[120px]" title={t.paymentId}>{t.paymentId}</span>
                                                <button
                                                    onClick={() => handleCopy(t.paymentId, `pay_${t.paymentId}`)}
                                                    className="text-slate-500 hover:text-white transition p-0.5 flex-shrink-0"
                                                    title="Copy Payment ID"
                                                >
                                                    {copiedId === `pay_${t.paymentId}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                                </button>
                                            </div>
                                        )}

                                        {/* Order ID */}
                                        {t.orderId && !t.paymentId && (
                                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[160px]" title={t.orderId}>
                                                Order: {t.orderId}
                                            </div>
                                        )}

                                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                                            <Clock size={11} className="flex-shrink-0" />
                                            <span className="truncate">{new Date(t.createdAt).toLocaleString()}</span>
                                        </div>
                                    </td>

                                    {/* 2. User */}
                                    <td className="p-3.5 align-top">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700 flex-shrink-0">
                                                {t.user?.name ? t.user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`font-bold text-xs truncate ${t.user?.isDeleted ? 'text-red-400' : 'text-slate-200'}`} title={t.user?.name}>
                                                    {t.user?.name || 'Unknown User'}
                                                </div>
                                                <div className="text-[11px] text-slate-500 truncate" title={t.user?.phone || t.user?.email}>
                                                    {t.user?.phone || t.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 3. Description & Payment Method */}
                                    <td className="p-3.5 align-top">
                                        <div className="text-slate-200 font-medium text-xs break-words leading-snug">
                                            {t.description}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                            {renderPaymentMethod(t)}
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider font-semibold border border-slate-700/60">
                                                {isManual ? 'MANUAL' : (t.referenceModel || 'Recharge')}
                                            </span>
                                            {t.bonusAmount > 0 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                                    +₹{t.bonusAmount}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* 4. Amount & GST Breakdown */}
                                    <td className="p-3.5 align-top">
                                        {isManual ? (
                                            <div>
                                                <div className="flex items-baseline gap-1 text-amber-400 font-bold text-sm">
                                                    <span>₹{Number(t.amount).toFixed(2)}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Manual Grant</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    Admin Added (No GST)
                                                </div>
                                            </div>
                                        ) : isRecharge ? (
                                            <div>
                                                <div className="flex items-baseline gap-1 text-emerald-400 font-black text-sm">
                                                    <span>₹{Number(totalPaid).toFixed(2)}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paid</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">
                                                    <div>Wallet: <strong className="text-slate-200">₹{Number(t.amount).toFixed(2)}</strong></div>
                                                    {gst > 0 ? (
                                                        <div>GST (18%): <strong className="text-purple-300">₹{Number(gst).toFixed(2)}</strong></div>
                                                    ) : (
                                                        <div className="text-slate-500">GST: Exempt / ₹0.00</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className={`font-bold text-sm flex items-center gap-1 ${t.type === 'credit' ? 'text-green-500' : 'text-red-400'}`}>
                                                    {t.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                    ₹{Number(t.amount).toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {t.type === 'credit' ? 'Credit (No GST)' : 'Session Debit'}
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {/* 5. Status & Sync Action */}
                                    <td className="p-3.5 align-top text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                t.status === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                t.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {t.status === 'failed' ? 'Cancelled' : t.status}
                                            </span>

                                            {/* Sync with Razorpay Button for Recharges */}
                                            {(t.orderId || t.paymentId) && (
                                                <button
                                                    onClick={() => handleSyncStatus(t._id)}
                                                    disabled={syncingId === t._id}
                                                    className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded-lg transition disabled:opacity-50"
                                                    title="Check live status from Razorpay"
                                                >
                                                    <RefreshCw size={9} className={syncingId === t._id ? 'animate-spin text-indigo-300' : ''} />
                                                    {syncingId === t._id ? 'Checking' : 'Check'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-10 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <DollarSign size={40} className="mb-2 opacity-20 text-slate-400" />
                                        <p className="text-base font-medium text-slate-400">No transactions found</p>
                                        <p className="text-xs text-slate-600 mt-0.5">Try resetting your filters or date range</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminFinanceDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Loading Financial Dashboard...</span>
                </div>
            </div>
        }>
            <AdminFinanceDashboardContent />
        </Suspense>
    );
}
