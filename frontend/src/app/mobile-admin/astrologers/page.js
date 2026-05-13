"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Search, Loader2, Save, X, Edit, Percent } from 'lucide-react';

export default function MobileAstroDashboard() {
    const [astros, setAstros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [editingAstro, setEditingAstro] = useState(null);
    const [editForm, setEditForm] = useState({ commissionRate: 20 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAstrologers();
    }, []);

    const fetchAstrologers = async () => {
        try {
            const res = await API.get('/astro/astrologers');
            if (res.data) {
                // If the response holds it under a 'data' key or directly as array
                setAstros(Array.isArray(res.data) ? res.data : res.data.data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch astrologers");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // updateAstrologerSettings needs the 'userId' string representation if the backend expects the Astrologer's userId
            // The route says: '/api/admin/astrologers/:id/settings'
            // The controller does: Astrologer.findOne({ userId: req.params.id })
            const targetId = typeof editingAstro.userId === 'object' ? editingAstro.userId._id : editingAstro.userId;
            
            await API.put(`/admin/astrologers/${targetId}/settings`, { 
                commissionRate: Number(editForm.commissionRate) 
            });
            toast.success("Astrologer logic overridden successfully!");
            
            // local update
            setAstros(prev => prev.map(a => 
                (a._id === editingAstro._id) ? { ...a, commissionRate: editForm.commissionRate } : a
            ));
            
            setEditingAstro(null);
        } catch (error) {
            toast.error("Failed to commit override");
            console.error(error);
        }
        setSaving(false);
    };

    const filtered = astros.filter(a => 
        (a.displayName || a.name || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex items-center gap-3 text-emerald-400"><Loader2 className="animate-spin" /> Gathering Astrologer Network...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">Astrologer Nodes</h1>
                    <p className="text-slate-400 mt-1">Manage platform experts and customize independent revenue splits</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by Public Name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50"
                />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-sm uppercase">
                                <th className="p-5 font-medium whitespace-nowrap">Astrologer Identity</th>
                                <th className="p-5 font-medium">Pricing Layer (/min)</th>
                                <th className="p-5 font-medium">Split Ratio</th>
                                <th className="p-5 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">No astrologers found matching search signature.</td>
                                </tr>
                            )}
                            {filtered.map(astro => (
                                <tr key={astro._id} className="hover:bg-slate-800/30 transition text-slate-300">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 overflow-hidden">
                                                {astro.image && astro.image.includes('http') ? (
                                                    <img src={astro.image} alt={astro.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-emerald-400 font-bold">{(astro.displayName || astro.name || '?').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{astro.displayName || astro.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-1 blur-[2px] hover:blur-none transition">SYS_ID: {astro.userId?._id || astro.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                       <div className="text-xs space-y-1">
                                            <div className="flex justify-between w-28"><span className="text-slate-500">Call:</span> <span className="font-bold">₹{astro.charges?.callPerMinute || 0}</span></div>
                                            <div className="flex justify-between w-28"><span className="text-slate-500">Video:</span> <span className="font-bold">₹{astro.charges?.videoPerMinute || 0}</span></div>
                                            <div className="flex justify-between w-28"><span className="text-blue-500">Chat:</span> <span className="font-bold text-blue-400">₹{astro.charges?.chatPerMinute || 0}</span></div>
                                       </div>
                                    </td>
                                    <td className="p-5">
                                        {astro.commissionRate !== undefined && astro.commissionRate !== null ? (
                                             <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                                <Percent size={12} /> Platform takes {astro.commissionRate}%
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs border border-slate-700">
                                                Global Default
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => {
                                                setEditingAstro(astro);
                                                setEditForm({ commissionRate: astro.commissionRate !== undefined ? astro.commissionRate : '' });
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-sm font-medium border border-slate-700"
                                        >
                                            <Edit size={16} /> Override Split
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Editing Modal */}
            {editingAstro && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <button 
                            onClick={() => setEditingAstro(null)} 
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-2">{editingAstro.displayName || editingAstro.name}</h3>
                        <p className="text-slate-400 text-sm mb-8">Override the Global Platform Fee specifically for this Astrologer.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Platform Cut Override (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        max="100" min="0" step="1"
                                        value={editForm.commissionRate}
                                        onChange={(e) => setEditForm({ commissionRate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-4 pl-12 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-xl font-bold"
                                        placeholder="Globally Fallbacks if empty..."
                                    />
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    This forces the Billing Engine to deduct precisely this percentage per transaction for this astrologer, ignoring the global `/mobile-admin/pricing` rules.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button 
                                    onClick={() => setEditingAstro(null)}
                                    className="px-5 py-2.5 text-slate-300 font-medium hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving || editForm.commissionRate === ''}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Deploy Logic
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
