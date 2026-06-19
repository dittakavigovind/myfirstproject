"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { DollarSign, Search, Loader2 } from 'lucide-react';

export default function PayoutsDashboard() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modals state
    const [actionModal, setActionModal] = useState(null); // { type: 'hold'|'edit'|'pay', payout: {} }
    const [actionInput, setActionInput] = useState('');

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await API.get('/admin/payouts');
            if (res.data?.data) {
                setPayouts(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load payouts");
        } finally {
            setLoading(false);
        }
    };

    const handleActionSubmit = async () => {
        if (!actionModal) return;
        const { type, payout } = actionModal;

        try {
            if (type === 'hold') {
                if (!actionInput) return toast.error("Remarks required to hold");
                await API.put(`/admin/payouts/${payout._id}/hold`, { adminRemarks: actionInput });
                toast.success("Payout placed on hold");
            } else if (type === 'edit') {
                if (!actionInput) return toast.error("New amount and remarks required");
                const [amt, remarks] = actionInput.split('|');
                if (!amt || !remarks) return toast.error("Format: Amount|Remarks");
                await API.put(`/admin/payouts/${payout._id}/edit`, { newGrossAmount: Number(amt), adminRemarks: remarks });
                toast.success("Payout updated");
            } else if (type === 'pay') {
                await API.post(`/admin/payouts/${payout._id}/mark-paid`, { transactionId: actionInput || `PAY_${Date.now()}` });
                toast.success("Payout marked as paid!");
            }
            fetchPayouts();
            setActionModal(null);
            setActionInput('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const handleRelease = async (payout) => {
        try {
            await API.put(`/admin/payouts/${payout._id}/release`);
            toast.success("Hold released");
            fetchPayouts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await API.get('/admin/payouts/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payouts_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Export successful!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export CSV");
        }
    };

    const filteredPayouts = payouts.filter(p => {
        const matchesSearch = (p.astrologerId?.displayName || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex items-center gap-3 text-slate-400"><Loader2 className="animate-spin" /> Fetching Payouts...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'on_hold': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <DollarSign className="text-emerald-500" /> Payouts & Billing
                    </h1>
                    <p className="text-slate-400 mt-2">Manage automated and manual payouts to Astrologers.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button onClick={handleExportCSV} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shrink-0 border border-slate-700">Export CSV</button>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Astrologer..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition"
                    >
                        <option value="All">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Astrologer</th>
                                <th className="px-6 py-4">Cycle Period</th>
                                <th className="px-6 py-4">Amounts</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Remarks</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredPayouts.map(payout => (
                                <tr key={payout._id} className="hover:bg-slate-800/50 transition duration-150">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-white capitalize">{payout.astrologerId?.displayName || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-slate-300 text-xs">
                                            {payout.cycleStartDate ? new Date(payout.cycleStartDate).toLocaleDateString() : 'N/A'} - 
                                            {payout.cycleEndDate ? new Date(payout.cycleEndDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-slate-400 text-xs mb-1">Gross: ₹{payout.grossAmount?.toFixed(2)}</div>
                                        <div className="text-slate-500 text-[10px] mb-1">TDS: ₹{payout.tdsAmount?.toFixed(2)} | PG: ₹{payout.pgAmount?.toFixed(2)}</div>
                                        <div className="text-emerald-400 font-bold">Net: ₹{payout.netPayableAmount?.toFixed(2) || payout.amount?.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(payout.status)}`}>
                                            {payout.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-slate-400 max-w-xs truncate">
                                        {payout.adminRemarks || '-'}
                                    </td>
                                    <td className="px-6 py-5 text-right space-x-2">
                                        {payout.status === 'pending' && (
                                            <>
                                                <button onClick={() => setActionModal({ type: 'pay', payout })} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1 rounded text-xs border border-emerald-500/20">Pay</button>
                                                <button onClick={() => setActionModal({ type: 'hold', payout })} className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-3 py-1 rounded text-xs border border-orange-500/20">Hold</button>
                                                <button onClick={() => setActionModal({ type: 'edit', payout })} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1 rounded text-xs border border-blue-500/20">Edit</button>
                                            </>
                                        )}
                                        {payout.status === 'on_hold' && (
                                            <button onClick={() => handleRelease(payout)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded text-xs border border-slate-600">Release Hold</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredPayouts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">No payouts found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4 capitalize">{actionModal.type} Payout</h3>
                        
                        {actionModal.type === 'pay' && (
                            <input 
                                type="text" 
                                placeholder="Transaction ID (Optional)" 
                                value={actionInput} 
                                onChange={e => setActionInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white mb-4 outline-none focus:border-blue-500"
                            />
                        )}
                        {actionModal.type === 'hold' && (
                            <input 
                                type="text" 
                                placeholder="Reason for hold..." 
                                value={actionInput} 
                                onChange={e => setActionInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white mb-4 outline-none focus:border-orange-500"
                            />
                        )}
                        {actionModal.type === 'edit' && (
                            <input 
                                type="text" 
                                placeholder="NewGrossAmount|Reason for change" 
                                value={actionInput} 
                                onChange={e => setActionInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white mb-4 outline-none focus:border-blue-500"
                            />
                        )}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setActionModal(null); setActionInput(''); }} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
                            <button onClick={handleActionSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
