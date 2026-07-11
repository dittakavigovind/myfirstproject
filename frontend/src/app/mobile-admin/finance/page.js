"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Download, Search, DollarSign, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFinanceDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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

    const filteredTransactions = transactions.filter(t => {
        const searchLower = searchTerm.toLowerCase();
        const amountStr = t.amount != null ? Number(t.amount).toFixed(2) : '';
        
        const matchesSearch = 
            t.user?.name?.toLowerCase().includes(searchLower) ||
            t.user?.email?.toLowerCase().includes(searchLower) ||
            t.user?.phone?.includes(searchTerm) ||
            t.description?.toLowerCase().includes(searchLower) ||
            t._id?.includes(searchTerm) ||
            amountStr.includes(searchTerm);

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

    const handleExport = () => {
        try {
            // Create CSV content
            const headers = ['Date', 'Transaction ID', 'User Name', 'User Email', 'User Phone', 'Amount', 'Type', 'Status', 'Description'];
            const rows = filteredTransactions.map(t => [
                new Date(t.createdAt).toLocaleString(),
                t._id,
                t.user?.name || 'Unknown',
                t.user?.email || 'N/A',
                t.user?.phone || 'N/A',
                t.amount,
                t.type,
                t.status,
                t.description
            ]);

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
            toast.error('Export failed');
        }
    };

    if (loading || isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="w-full p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/mobile-admin')}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <DollarSign className="text-green-500" /> Financial Dashboard
                        </h1>
                        <p className="text-sm text-slate-400">View and export all platform transactions securely.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-end">
                    <div className="flex gap-3 items-center bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-900 text-white border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
                        />
                        <span className="text-slate-500 text-sm">to</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-900 text-white border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
                        />
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-xs text-red-400 hover:text-red-300 mx-1 font-bold px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search user, tx ID or amount..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                        />
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr>
                                <th className="p-4">Transaction / Date</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredTransactions.map(t => (
                                <tr key={t._id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-200">{t._id}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Clock size={12} /> {new Date(t.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                                                {t.user?.name ? t.user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${t.user?.isDeleted ? 'text-red-400' : 'text-slate-200'}`}>
                                                    {t.user?.name || 'Unknown User'} {t.user?.isDeleted && '(Deleted)'}
                                                </div>
                                                <div className="text-xs text-slate-500">{t.user?.phone || t.user?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-300 font-medium">{t.description}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{t.referenceModel}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-bold flex items-center gap-1 ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            ₹{t.amount.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            t.status === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                            t.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                                            'bg-red-500/20 text-red-400 border border-red-500/20'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <DollarSign size={48} className="mb-4 opacity-20 text-slate-400" />
                                            <p className="text-lg font-medium text-slate-400">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
