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
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from '../../../components/common/CustomDateInput';

function AdminFinanceDashboardContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
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

    // Metrics calculation
    const metrics = useMemo(() => {
        const recharges = transactions.filter(t => 
            t.referenceModel === 'Recharge' || 
            t.referenceModel === 'WalletRecharge' || 
            (t.description && t.description.toLowerCase().includes('recharge'))
        );

        const successfulRecharges = recharges.filter(t => t.status === 'success');

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
        if (statusFilter !== 'all' && t.status !== statusFilter) {
            return false;
        }

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

        if (typeFilter === 'gst_recharges') {
            if (!hasGst) return false;
        } else if (typeFilter === 'paid_recharges') {
            if (!isOnlinePaid) return false;
        } else if (typeFilter === 'recharges') {
            if (!isRecharge) return false;
        } else if (typeFilter === 'sessions') {
            if (!isSession) return false;
        } else if (typeFilter === 'manual') {
            if (!isManual) return false;
        }

        const searchLower = searchTerm.toLowerCase();
        const amountStr = t.amount?.toString() || '';
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
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Wallet size={10} className="text-amber-600" /> Admin Grant
                </span>
            );
        }

        const method = t.paymentMethod?.toLowerCase();
        if (method === 'upi') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <Smartphone size={11} className="text-purple-600" /> UPI
                </span>
            );
        }
        if (method === 'card') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <CreditCard size={11} className="text-blue-600" /> Card
                </span>
            );
        }
        if (method === 'netbanking') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Building size={11} className="text-emerald-600" /> NetBanking
                </span>
            );
        }
        if (method === 'wallet') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Wallet size={11} className="text-amber-600" /> Wallet
                </span>
            );
        }
        if (method) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <CreditCard size={11} /> {method.toUpperCase()}
                </span>
            );
        }
        if (t.paymentId) {
            return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <CreditCard size={10} /> Razorpay
                </span>
            );
        }
        const isRecharge = t.referenceModel === 'Recharge' || t.referenceModel === 'WalletRecharge' || (t.description && t.description.toLowerCase().includes('recharge'));
        if (isRecharge) {
            return <span className="text-[10px] text-slate-400 italic">Pending Mode</span>;
        }
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500">
                In-App
            </span>
        );
    };

    if (loading || isLoading) {
        return (
            <div className="p-10 flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3.5">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <DollarSign className="text-emerald-600" size={22} /> Financial Dashboard
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time platform recharges, GST breakdown, and transaction status logs.
                        </p>
                    </div>
                </div>

                {/* Date filter + Search + Export */}
                <div className="flex items-center gap-2.5 flex-wrap justify-end">
                    <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Start Date"
                            customInput={<CustomDateInput />}
                            isClearable
                        />
                        <span className="text-slate-400 text-xs">to</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="End Date"
                            customInput={<CustomDateInput />}
                            isClearable
                        />
                    </div>

                    <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search user, ID, amount..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
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
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/50'
                            : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Paid by Users</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            typeFilter === 'paid_recharges' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div className="text-xl font-black text-emerald-600">
                        ₹{metrics.totalPaidByUsers.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-400">Gateway collections</span>
                        {typeFilter === 'paid_recharges' ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">Filter Active <Check size={10} /></span>
                        ) : (
                            <span className="text-slate-400 hover:text-slate-600">Click to filter</span>
                        )}
                    </div>
                </div>

                {/* 2. Wallet Recharge Base (All Recharges) */}
                <div 
                    onClick={() => setTypeFilter(prev => prev === 'recharges' ? 'all' : 'recharges')}
                    className={`border rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                        typeFilter === 'recharges'
                            ? 'bg-white border-blue-500 ring-2 ring-blue-500/50'
                            : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Wallet Recharge Base</span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            typeFilter === 'recharges' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-100 text-blue-600'
                        }`}>
                            <Wallet size={16} />
                        </div>
                    </div>
                    <div className="text-xl font-black text-blue-600">
                        ₹{metrics.totalRechargeBase.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-400">Credited to wallets</span>
                        {typeFilter === 'recharges' ? (
                            <span className="text-blue-600 font-bold flex items-center gap-0.5">Filter Active <Check size={10} /></span>
                        ) : (
                            <span className="text-slate-400 hover:text-slate-600">Click to filter</span>
                        )}
                    </div>
                </div>

                {/* 3. Total GST Collected - ONLY GST PAID TRANSACTIONS */}
                <div 
                    onClick={() => setTypeFilter(prev => prev === 'gst_recharges' ? 'all' : 'gst_recharges')}
                    className={`border rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                        typeFilter === 'gst_recharges'
                            ? 'bg-white border-purple-500 ring-2 ring-purple-500/50'
                            : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                            <Receipt size={13} className="text-purple-600" /> Total GST (18%)
                        </span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            typeFilter === 'gst_recharges' ? 'bg-purple-600 text-white font-bold' : 'bg-purple-100 text-purple-600'
                        }`}>
                            <Receipt size={16} />
                        </div>
                    </div>
                    <div className="text-xl font-black text-purple-600">
                        ₹{metrics.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-400">Across {metrics.gstPaidCount} recharges</span>
                        {typeFilter === 'gst_recharges' ? (
                            <span className="text-purple-600 font-bold flex items-center gap-0.5">GST Paid Active <Check size={10} /></span>
                        ) : (
                            <span className="text-purple-600 hover:text-purple-800 font-medium">Click for GST Paid</span>
                        )}
                    </div>
                </div>

                {/* 4. Status Breakdown - Interactive Card */}
                <div className={`border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                    statusFilter !== 'all' ? 'bg-white border-indigo-500 ring-1 ring-indigo-500/30' : 'bg-white border-slate-100'
                }`}>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Filter</span>
                        {statusFilter !== 'all' ? (
                            <button
                                onClick={() => setStatusFilter('all')}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                            >
                                Reset ({transactions.length})
                            </button>
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                <Filter size={14} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <button
                            onClick={() => setStatusFilter(prev => prev === 'success' ? 'all' : 'success')}
                            className={`flex-1 rounded-xl p-2 text-center transition-all cursor-pointer ${
                                statusFilter === 'success'
                                    ? 'bg-green-600 text-white font-black shadow-md shadow-green-600/30 scale-[1.02]'
                                    : 'bg-green-50 hover:bg-green-100 border border-green-200 text-green-700'
                            }`}
                            title="Click to toggle Success filter"
                        >
                            <div className="text-xs font-black">
                                {metrics.successCount}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${statusFilter === 'success' ? 'text-white' : 'text-green-600'}`}>
                                Success
                            </div>
                        </button>

                        <button
                            onClick={() => setStatusFilter(prev => prev === 'pending' ? 'all' : 'pending')}
                            className={`flex-1 rounded-xl p-2 text-center transition-all cursor-pointer ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/30 scale-[1.02]'
                                    : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700'
                            }`}
                            title="Click to toggle Pending filter"
                        >
                            <div className="text-xs font-black">
                                {metrics.pendingCount}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${statusFilter === 'pending' ? 'text-white' : 'text-amber-600'}`}>
                                Pending
                            </div>
                        </button>

                        <button
                            onClick={() => setStatusFilter(prev => prev === 'failed' ? 'all' : 'failed')}
                            className={`flex-1 rounded-xl p-2 text-center transition-all cursor-pointer ${
                                statusFilter === 'failed'
                                    ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/30 scale-[1.02]'
                                    : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-700'
                            }`}
                            title="Click to toggle Failed/Cancelled filter"
                        >
                            <div className="text-xs font-black">
                                {metrics.failedCount}
                            </div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${statusFilter === 'failed' ? 'text-white' : 'text-red-600'}`}>
                                Failed
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs: Category & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <Filter size={12} /> Category:
                    </span>
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            typeFilter === 'all'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        All Transactions
                    </button>
                    <button
                        onClick={() => setTypeFilter('gst_recharges')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            typeFilter === 'gst_recharges'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                        }`}
                    >
                        <Receipt size={12} /> GST Paid Only
                    </button>
                    <button
                        onClick={() => setTypeFilter('paid_recharges')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            typeFilter === 'paid_recharges'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <ShieldCheck size={12} /> Online Paid
                    </button>
                    <button
                        onClick={() => setTypeFilter('recharges')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            typeFilter === 'recharges'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        <Wallet size={12} /> All Recharges
                    </button>
                    <button
                        onClick={() => setTypeFilter('sessions')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            typeFilter === 'sessions'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        Chat Sessions
                    </button>
                    <button
                        onClick={() => setTypeFilter('manual')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            typeFilter === 'manual'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        Manual Wallet
                    </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            statusFilter === 'all'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                    >
                        All ({transactions.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('success')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            statusFilter === 'success'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                    >
                        <CheckCircle2 size={12} /> Success ({metrics.successCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            statusFilter === 'pending'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                    >
                        <AlertCircle size={12} /> Pending ({metrics.pendingCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('failed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            statusFilter === 'failed'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                    >
                        <XCircle size={12} /> Cancelled ({metrics.failedCount})
                    </button>
                </div>
            </div>

            {/* Results Count Bar & Live Filtered Totals */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600">
                <div className="flex items-center gap-2 flex-wrap">
                    <span>
                        Showing <strong className="text-slate-900 font-bold">{filteredTransactions.length}</strong> of{' '}
                        <strong className="text-slate-500">{transactions.length}</strong> transactions
                    </span>
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate) && (
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                            Filtered: {typeFilter === 'gst_recharges' ? 'GST Paid Only' : typeFilter === 'paid_recharges' ? 'Online Paid Only' : typeFilter}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] shadow-sm">
                        <span>Filtered Total: <strong className="text-emerald-600 font-bold font-mono">₹{filteredTotals.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                        <span className="text-slate-300">|</span>
                        <span>GST: <strong className="text-purple-600 font-bold font-mono">₹{filteredTotals.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
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
                            className="text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer text-xs ml-1"
                        >
                            Reset all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Responsive Table - NO horizontal scroll, 5 smart columns */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
                <table className="w-full text-left text-sm table-fixed">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                        <tr>
                            <th className="p-3.5 w-[25%]">Transaction / ID</th>
                            <th className="p-3.5 w-[20%]">User</th>
                            <th className="p-3.5 w-[25%]">Description & Method</th>
                            <th className="p-3.5 w-[18%]">Amount & GST</th>
                            <th className="p-3.5 w-[12%] text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTransactions.map(t => {
                            const isManual = Boolean(
                                (t.description && t.description.toLowerCase().includes('manual')) ||
                                t.referenceModel === 'ManualWallet'
                            );
                            const isRecharge = t.referenceModel === 'Recharge' || t.referenceModel === 'WalletRecharge' || (t.description && t.description.toLowerCase().includes('recharge'));
                            const gst = !isManual && t.gstAmount != null ? t.gstAmount : (!isManual && isRecharge && t.totalAmount ? (t.totalAmount - t.amount) : 0);
                            const totalPaid = isManual ? 0 : (t.totalAmount != null ? t.totalAmount : (isRecharge ? (t.amount + gst) : t.amount));

                            return (
                                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3.5 align-top">
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono text-xs font-semibold text-slate-700 truncate max-w-[150px]" title={t._id}>
                                                {t._id}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(t._id, t._id)}
                                                className="text-slate-400 hover:text-slate-700 transition p-0.5 flex-shrink-0"
                                                title="Copy Tx ID"
                                            >
                                                {copiedId === t._id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                            </button>
                                        </div>

                                        {t.paymentId && (
                                            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-mono mt-0.5 truncate">
                                                <span className="text-slate-400">Pay:</span>
                                                <span className="truncate max-w-[120px]" title={t.paymentId}>{t.paymentId}</span>
                                                <button
                                                    onClick={() => handleCopy(t.paymentId, `pay_${t.paymentId}`)}
                                                    className="text-slate-400 hover:text-slate-700 transition p-0.5 flex-shrink-0"
                                                    title="Copy Payment ID"
                                                >
                                                    {copiedId === `pay_${t.paymentId}` ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                                                </button>
                                            </div>
                                        )}

                                        {t.orderId && !t.paymentId && (
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px]" title={t.orderId}>
                                                Order: {t.orderId}
                                            </div>
                                        )}

                                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                                            <Clock size={11} className="flex-shrink-0" />
                                            <span className="truncate">{new Date(t.createdAt).toLocaleString()}</span>
                                        </div>
                                    </td>

                                    <td className="p-3.5 align-top">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                                                {t.user?.name ? t.user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`font-bold text-xs truncate ${t.user?.isDeleted ? 'text-red-500' : 'text-slate-800'}`} title={t.user?.name}>
                                                    {t.user?.name || 'Unknown User'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate" title={t.user?.phone || t.user?.email}>
                                                    {t.user?.phone || t.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-3.5 align-top">
                                        <div className="text-slate-700 font-medium text-xs break-words leading-snug">
                                            {t.description}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                            {renderPaymentMethod(t)}
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border border-slate-200">
                                                {isManual ? 'MANUAL' : (t.referenceModel || 'Recharge')}
                                            </span>
                                            {t.bonusAmount > 0 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                                    +₹{t.bonusAmount}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-3.5 align-top">
                                        {isManual ? (
                                            <div>
                                                <div className="flex items-baseline gap-1 text-amber-600 font-bold text-sm">
                                                    <span>₹{Number(t.amount).toFixed(2)}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Manual Grant</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    Admin Added (No GST)
                                                </div>
                                            </div>
                                        ) : isRecharge ? (
                                            <div>
                                                <div className="flex items-baseline gap-1 text-emerald-600 font-black text-sm">
                                                    <span>₹{Number(totalPaid).toFixed(2)}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paid</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                                                    <div>Wallet: <strong className="text-slate-700">₹{Number(t.amount).toFixed(2)}</strong></div>
                                                    {gst > 0 ? (
                                                        <div>GST (18%): <strong className="text-purple-600">₹{Number(gst).toFixed(2)}</strong></div>
                                                    ) : (
                                                        <div className="text-slate-400">GST: Exempt / ₹0.00</div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className={`font-bold text-sm flex items-center gap-1 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                    ₹{Number(t.amount).toFixed(2)}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {t.type === 'credit' ? 'Credit (No GST)' : 'Session Debit'}
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-3.5 align-top text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                t.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                t.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {t.status === 'failed' ? 'Cancelled' : t.status}
                                            </span>

                                            {(t.orderId || t.paymentId) && (
                                                <button
                                                    onClick={() => handleSyncStatus(t._id)}
                                                    disabled={syncingId === t._id}
                                                    className="text-[10px] flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition disabled:opacity-50"
                                                    title="Check live status from Razorpay"
                                                >
                                                    <RefreshCw size={9} className={syncingId === t._id ? 'animate-spin text-indigo-600' : ''} />
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
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <DollarSign size={40} className="mb-2 opacity-20" />
                                        <p className="text-base font-medium">No transactions found</p>
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
