"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Search, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobileManualWalletDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    const [searchKey, setSearchKey] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'manager') {
                router.replace('/admin/login');
            } else {
                fetchTransactions();
            }
        }
    }, [user, loading, router]);

    const fetchTransactions = async () => {
        try {
            const res = await API.get('/admin/manual-wallet/transactions');
            if (res.data.success) {
                setTransactions(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch transactions");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBalance = async (e) => {
        e.preventDefault();
        if (!searchKey || !amount) {
            return toast.error("Please provide search key and amount");
        }
        
        setIsAdding(true);
        try {
            const res = await API.post('/admin/manual-wallet', {
                searchKey,
                amount: Number(amount),
                description: description || "Manual Wallet Recharge"
            });
            
            if (res.data.success) {
                toast.success(`Successfully added ${amount} to ${res.data.user.name || res.data.user.phone}'s wallet`);
                setSearchKey('');
                setAmount('');
                setDescription('');
                fetchTransactions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add balance");
        } finally {
            setIsAdding(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (!filterTerm) return true;
        const term = filterTerm.toLowerCase();
        return (
            t.user?.name?.toLowerCase().includes(term) ||
            t.user?.phone?.includes(term) ||
            t.user?.email?.toLowerCase().includes(term) ||
            t.description?.toLowerCase().includes(term)
        );
    });

    if (loading || isLoading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner text-emerald-500 loading-lg"></span></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition bg-slate-900 border border-slate-800 p-2 rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manual Wallet Recharge</h1>
                        <p className="text-slate-400 mt-1">Add funds directly to user or astrologer wallets</p>
                    </div>
                </div>
            </div>

            {/* Add Balance Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6">Add Balance</h2>
                <form onSubmit={handleAddBalance} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-300">User/Astrologer (Phone/Email/Name)</span></label>
                        <input
                            type="text"
                            placeholder="Enter phone or name"
                            className="bg-slate-950 text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-300">Amount to Add</span></label>
                        <input
                            type="number"
                            placeholder="Amount"
                            className="bg-slate-950 text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-300">Description (Optional)</span></label>
                        <input
                            type="text"
                            placeholder="Reason..."
                            className="bg-slate-950 text-white border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-control pb-1">
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white w-full p-3 rounded-xl font-bold transition flex items-center justify-center shadow-lg shadow-emerald-900/20" disabled={isAdding}>
                            {isAdding ? <span className="loading loading-spinner w-5 h-5"></span> : <PlusCircle className="w-5 h-5 mr-2" />}
                            Add Balance
                        </button>
                    </div>
                </form>
            </div>

            {/* Records Section */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-white">Recharge Records</h2>
                    <div className="relative w-full md:w-96 flex items-center bg-slate-950 border border-slate-700 rounded-xl p-2 px-3">
                        <Search className="w-5 h-5 text-slate-500 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search records by name, phone..."
                            className="bg-transparent text-white w-full ml-3 outline-none"
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800/50 text-slate-400 font-medium">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">User Info</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredTransactions.map(tx => (
                                <tr key={tx._id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{tx.user?.name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-500 mt-1">{tx.user?.phone || tx.user?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${tx.user?.role === 'astrologer' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {tx.user?.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-emerald-400">+{tx.amount}</span>
                                    </td>
                                    <td className="p-4 text-slate-400">{tx.description}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-medium border border-emerald-500/20">
                                            <CheckCircle className="w-3 h-3" />
                                            Success
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-500">
                                        No records found
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
