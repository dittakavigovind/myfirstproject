"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Search, Loader2, Save, X, Edit, Calendar, Clock, Trash2, Pin } from 'lucide-react';

export default function PinnedAstrologersDashboard() {
    const [astros, setAstros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Form state
    const [editingAstro, setEditingAstro] = useState(null);
    const [editForm, setEditForm] = useState({
        isPinned: false,
        pinOrder: 0,
        pinStartTime: '',
        pinEndTime: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAstrologers();
    }, []);

    const fetchAstrologers = async () => {
        try {
            const res = await API.get('/astro/astrologers');
            if (res.data && res.data.success) {
                setAstros(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch astrologers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const targetId = typeof editingAstro.userId === 'object' ? editingAstro.userId._id : editingAstro.userId;

            const payload = {
                isPinned: editForm.isPinned,
                pinOrder: editForm.pinOrder,
            };

            if (editForm.isPinned) {
                if (!editForm.pinStartTime || !editForm.pinEndTime) {
                    toast.error("Please provide both start and end times.");
                    setSaving(false);
                    return;
                }
                payload.pinStartTime = new Date(editForm.pinStartTime).toISOString();
                payload.pinEndTime = new Date(editForm.pinEndTime).toISOString();
            }

            await API.put(`/admin/astrologers/${targetId}/settings`, payload);
            toast.success("Pin schedule deployed successfully!");

            // local update
            setAstros(prev => prev.map(a =>
                (a._id === editingAstro._id) ? {
                    ...a,
                    isPinned: payload.isPinned,
                    pinOrder: payload.pinOrder,
                    pinStartTime: payload.pinStartTime,
                    pinEndTime: payload.pinEndTime
                } : a
            ));

            setEditingAstro(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to commit schedule. Check for conflicts.");
            console.error(error);
        }
        setSaving(false);
    };

    const handleUnpin = async (astro) => {
        if(!confirm(`Are you sure you want to unschedule ${astro.displayName}?`)) return;
        try {
            const targetId = typeof astro.userId === 'object' ? astro.userId._id : astro.userId;
            await API.put(`/admin/astrologers/${targetId}/settings`, { isPinned: false });
            toast.success("Astrologer unpinned successfully");
            setAstros(prev => prev.map(a => (a._id === astro._id) ? { ...a, isPinned: false } : a));
        } catch (error) {
            toast.error("Failed to unpin");
        }
    }

    const pinnedAstrologers = astros.filter(a => a.isPinned);
    
    // Sort logic for display: currently active pins first, then upcoming
    const sortedPinned = pinnedAstrologers.sort((a, b) => {
        const aActive = new Date(a.pinStartTime) <= new Date() && new Date(a.pinEndTime) >= new Date();
        const bActive = new Date(b.pinStartTime) <= new Date() && new Date(b.pinEndTime) >= new Date();
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return (a.pinOrder || 0) - (b.pinOrder || 0);
    });

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (loading) return <div className="flex items-center gap-3 text-amber-400 p-8"><Loader2 className="animate-spin" /> Fetching Master Schedule...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">Pin Scheduler</h1>
                    <p className="text-slate-400 mt-1">Automate promotions to the top of the astrologer list</p>
                </div>
                <button 
                    onClick={() => {
                        // Open a modal to select ANY astrologer and schedule
                        setEditingAstro({ isNewSelection: true });
                        setEditForm({
                            isPinned: true,
                            pinOrder: 0,
                            pinStartTime: '',
                            pinEndTime: ''
                        });
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                    <Calendar size={18} /> Schedule New Pin
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
                    <Pin size={18} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-200">Currently Scheduled Pins</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-5 font-bold">Astrologer</th>
                                <th className="p-5 font-bold">Priority</th>
                                <th className="p-5 font-bold">Time Window</th>
                                <th className="p-5 font-bold">Status</th>
                                <th className="p-5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {sortedPinned.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">No active or upcoming pins scheduled.</td>
                                </tr>
                            )}
                            {sortedPinned.map(astro => {
                                const now = new Date();
                                const start = new Date(astro.pinStartTime);
                                const end = new Date(astro.pinEndTime);
                                const isActive = start <= now && end >= now;
                                const isExpired = end < now;

                                return (
                                <tr key={astro._id} className="hover:bg-slate-800/30 transition text-slate-300">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden">
                                                <img src={astro.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Astro" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-white">{astro.displayName || astro.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-md font-mono font-bold text-amber-400">Order: {astro.pinOrder || 0}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-1.5 text-slate-300"><Clock size={12} className="text-emerald-400" /> Start: <span className="font-bold">{formatDateTime(astro.pinStartTime)}</span></div>
                                            <div className="flex items-center gap-1.5 text-slate-400"><Clock size={12} className="text-rose-400" /> End: <span className="font-medium">{formatDateTime(astro.pinEndTime)}</span></div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        {isActive ? (
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Live</span>
                                        ) : isExpired ? (
                                            <span className="text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Expired</span>
                                        ) : (
                                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Upcoming</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                // Convert ISO string to format required by datetime-local input (YYYY-MM-DDThh:mm)
                                                const formatForInput = (isoString) => {
                                                    if (!isoString) return '';
                                                    const d = new Date(isoString);
                                                    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
                                                };

                                                setEditingAstro(astro);
                                                setEditForm({
                                                    isPinned: true,
                                                    pinOrder: astro.pinOrder || 0,
                                                    pinStartTime: formatForInput(astro.pinStartTime),
                                                    pinEndTime: formatForInput(astro.pinEndTime)
                                                });
                                            }}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleUnpin(astro)}
                                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition border border-rose-500/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Editing/Creation Modal */}
            {editingAstro && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl w-full max-w-md relative flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                        <button
                            onClick={() => setEditingAstro(null)}
                            className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <Calendar size={20} className="text-amber-500" />
                                {editingAstro.isNewSelection ? 'Schedule New Pin' : `Edit Schedule`}
                            </h3>
                            <p className="text-slate-400 text-xs">Configure exactly when the astrologer appears at the top.</p>
                        </div>

                        <div className="space-y-4">
                            {editingAstro.isNewSelection && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Astrologer</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/50 text-sm font-medium"
                                        onChange={(e) => {
                                            const astro = astros.find(a => a._id === e.target.value);
                                            setEditingAstro({ ...astro, isNewSelection: true });
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Choose an Astrologer...</option>
                                        {astros.filter(a => !a.isPinned).map(a => (
                                            <option key={a._id} value={a._id}>{a.displayName || a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {!editingAstro.isNewSelection && editingAstro.displayName && (
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                                        <img src={editingAstro.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt="Astro" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-bold text-white text-lg">{editingAstro.displayName || editingAstro.name}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Priority (Order)</label>
                                <input
                                    type="number" min="0" step="1"
                                    value={editForm.pinOrder}
                                    onChange={(e) => setEditForm({ ...editForm, pinOrder: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/50 text-base font-bold"
                                    placeholder="0 (Highest priority)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.pinStartTime}
                                        onChange={(e) => setEditForm({ ...editForm, pinStartTime: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:ring-2 focus:ring-amber-500/50 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.pinEndTime}
                                        onChange={(e) => setEditForm({ ...editForm, pinEndTime: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-xl focus:ring-2 focus:ring-amber-500/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-800">
                            <button
                                onClick={() => setEditingAstro(null)}
                                className="px-5 py-2.5 text-slate-300 font-medium hover:text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || (!editingAstro._id && editingAstro.isNewSelection)}
                                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-amber-500/20"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Confirm Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
