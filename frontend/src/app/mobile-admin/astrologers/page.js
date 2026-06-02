"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Search, Loader2, Save, X, Edit, Percent, Heart, PhoneOff } from 'lucide-react';

export default function MobileAstroDashboard() {
    const [astros, setAstros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [editingAstro, setEditingAstro] = useState(null);
    const [editForm, setEditForm] = useState({ commissionRate: 20, features: { chatEnabled: true, voiceEnabled: true, videoEnabled: true } });
    const [saving, setSaving] = useState(false);

    const [appConfig, setAppConfig] = useState(null);

    const [viewingStatsAstro, setViewingStatsAstro] = useState(null);

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
            const configRes = await API.get('/admin/config/app');
            if (configRes.data) {
                setAppConfig(configRes.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
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
                commissionRate: Number(editForm.commissionRate),
                fakeFollowers: Number(editForm.fakeFollowers || 0),
                badgeText: editForm.badgeText,
                features: editForm.features
            });
            toast.success("Astrologer logic overridden successfully!");

            // local update
            setAstros(prev => prev.map(a =>
                (a._id === editingAstro._id) ? {
                    ...a,
                    commissionRate: editForm.commissionRate,
                    fakeFollowers: Number(editForm.fakeFollowers || 0),
                    badgeText: editForm.badgeText,
                    features: editForm.features
                } : a
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
                                                <button
                                                    onClick={() => setViewingStatsAstro(astro)}
                                                    className="font-bold text-white hover:text-emerald-400 transition underline decoration-dashed underline-offset-4 text-left"
                                                >
                                                    {astro.displayName || astro.name}
                                                </button>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                                                        <Heart size={12} className="fill-rose-400" /> {(astro.followersCount || 0) + (astro.fakeFollowers || 0)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono blur-[2px] hover:blur-none transition">SYS_ID: {astro.userId?._id || astro.userId}</div>
                                                    {astro.userId?.missedSessions > 0 && (
                                                        <div className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-md border border-rose-500/20 font-bold ml-1 flex items-center gap-1">
                                                            <PhoneOff size={10} /> {astro.userId.missedSessions} Missed
                                                        </div>
                                                    )}
                                                </div>
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
                                                setEditForm({
                                                    commissionRate: astro.commissionRate !== undefined ? astro.commissionRate : '',
                                                    fakeFollowers: astro.fakeFollowers || 0,
                                                    badgeText: astro.badgeText || '',
                                                    features: astro.features || { chatEnabled: true, voiceEnabled: true, videoEnabled: true }
                                                });
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition text-sm font-medium border border-slate-700"
                                        >
                                            <Edit size={16} /> Settings
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <button
                            onClick={() => setEditingAstro(null)}
                            className="absolute top-5 right-5 text-slate-500 hover:text-white transition z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="shrink-0 mb-4">
                            <h3 className="text-xl font-bold text-white mb-1 pr-6">{editingAstro.displayName || editingAstro.name}</h3>
                            <p className="text-slate-400 text-xs">Override the Global Platform Fee specifically for this Astrologer.</p>
                        </div>

                        <div className="space-y-4 overflow-y-auto pr-2 -mr-2 flex-1 styled-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Platform Cut Override (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        max="100" min="0" step="1"
                                        value={editForm.commissionRate}
                                        onChange={(e) => setEditForm({ commissionRate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 pl-10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-base font-bold"
                                        placeholder="Globally Fallbacks if empty..."
                                    />
                                    <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    This forces the Billing Engine to deduct precisely this percentage per transaction for this astrologer, ignoring the global `/mobile-admin/pricing` rules.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Fake Followers Boost</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0" step="1"
                                        value={editForm.fakeFollowers}
                                        onChange={(e) => setEditForm({ ...editForm, fakeFollowers: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 pl-10 rounded-xl focus:ring-2 focus:ring-rose-500/50 text-base font-bold"
                                        placeholder="Add followers..."
                                    />
                                    <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 fill-slate-500" size={16} />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    This number will be added to the astrologer's real follower count.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Badge Text (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={editForm.badgeText || ''}
                                        onChange={(e) => setEditForm({ ...editForm, badgeText: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/50 text-base font-bold"
                                        placeholder="e.g. Celebrity"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    Adds a diagonal sash badge to the astrologer card on explore.
                                </p>
                            </div>

                            <div className="mt-4 border-t border-slate-800 pt-4">
                                <h4 className="text-xs font-bold text-slate-300 mb-3">Module Permissions</h4>
                                <div className="space-y-2">
                                    {['chat', 'voice', 'video'].map(mod => {
                                        const globalEnabled = appConfig?.features?.[`${mod}Enabled`] !== false;
                                        return (
                                            <div key={mod} className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-800 ${globalEnabled ? 'bg-slate-800/50' : 'bg-slate-900 opacity-50'}`}>
                                                <div>
                                                    <span className="font-bold text-slate-200 capitalize text-sm">{mod}</span>
                                                    {!globalEnabled && <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider mt-0.5">Disabled Globally</p>}
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={editForm.features?.[`${mod}Enabled`] ?? true}
                                                        disabled={!globalEnabled}
                                                        onChange={(e) => setEditForm({
                                                            ...editForm,
                                                            features: { ...editForm.features, [`${mod}Enabled`]: e.target.checked }
                                                        })}
                                                    />
                                                    <div className={`w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${globalEnabled ? 'peer-checked:bg-emerald-500' : 'peer-checked:bg-slate-500 cursor-not-allowed'}`}></div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-4 shrink-0">
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
            )}

            {/* Stats / Performance Modal */}
            {viewingStatsAstro && (
                <AstroStatsModal
                    astro={viewingStatsAstro}
                    onClose={() => setViewingStatsAstro(null)}
                />
            )}
        </div>
    );
}

function AstroStatsModal({ astro, onClose }) {
    const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' or 'reviews'
    const [sessions, setSessions] = useState([]);
    const [dailyStats, setDailyStats] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [endedByFilter, setEndedByFilter] = useState("all");
    const [newReview, setNewReview] = useState({ reviewerName: '', rating: 5, comment: '', reviewerGender: 'Female' });
    const [addingReview, setAddingReview] = useState(false);

    const [selectedChatSession, setSelectedChatSession] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    const openChatHistory = async (roomId) => {
        setSelectedChatSession(roomId);
        setChatLoading(true);
        try {
            const res = await API.get(`/chat/session/${roomId}/messages`);
            if (res.data?.success) {
                setChatMessages(res.data.messages || []);
            }
        } catch (error) {
            toast.error("Failed to load chat history");
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchSessions();
            fetchDailyStats();
        } else if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [astro, activeTab]);

    const fetchDailyStats = async () => {
        try {
            const res = await API.get(`/activity/reports/admin?astrologerId=${astro._id}`);
            if (res.data.success) {
                setDailyStats(res.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch daily stats", error);
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await API.get(`/chat/admin/astrologer/${astro._id}/sessions`);
            if (res.data.success) {
                setSessions(res.data.sessions || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch session history");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/reviews/astrologer/${astro._id}`);
            if (res.data.success) {
                setReviews(res.data.data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!newReview.reviewerName || !newReview.comment) {
            return toast.error("Name and comment are required");
        }
        setAddingReview(true);
        try {
            const res = await API.post('/reviews/admin', {
                astrologerId: astro._id,
                ...newReview,
                reviewerGender: newReview.reviewerGender || 'Female'
            });
            if (res.data.success) {
                toast.success("Review added successfully");
                setNewReview({ reviewerName: '', rating: 5, comment: '', reviewerGender: 'Female' });
                fetchReviews();
            }
        } catch (err) {
            toast.error("Failed to add review");
        } finally {
            setAddingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Delete this review?')) return;
        try {
            const res = await API.delete(`/reviews/${reviewId}`);
            if (res.data.success) {
                toast.success("Review deleted");
                fetchReviews();
            }
        } catch (err) {
            toast.error("Failed to delete review");
        }
    };

    const handleDeleteOld = async () => {
        if (!confirm('Are you sure you want to delete chat sessions and messages older than 3 months? This is irreversible.')) return;
        setDeleting(true);
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const res = await API.delete('/chat/admin/delete-old', {
                data: { beforeDate: threeMonthsAgo.toISOString() }
            });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchSessions();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete old data");
        } finally {
            setDeleting(false);
        }
    };

    const getLocalDateString = (dateInput) => {
        const d = new Date(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const filteredSessions = sessions.filter(s => {
        const sessionDate = getLocalDateString(s.createdAt);
        if (fromDate && sessionDate < fromDate) return false;
        if (toDate && sessionDate > toDate) return false;
        if (endedByFilter !== "all" && s.endedBy !== endedByFilter) {
            // handle case where endedBy is null/undefined but filter is system or something else
            if (!s.endedBy && endedByFilter !== 'system' && endedByFilter !== 'unknown') return false;
            if (s.endedBy && s.endedBy !== endedByFilter) return false;
        }
        return true;
    });

    const attendedCount = filteredSessions.filter(s => s.status === 'completed' || s.status === 'terminated').length;
    const missedCount = filteredSessions.filter(s => s.status === 'missed' || (s.status === 'initiated' && (!s.totalDuration || s.totalDuration === 0))).length;
    const endedByAstroCount = filteredSessions.filter(s => s.endedBy === 'astrologer').length;
    const endedByUserCount = filteredSessions.filter(s => s.endedBy === 'user').length;
    const endedBySystemCount = filteredSessions.filter(s => s.endedBy === 'system' || !s.endedBy).length;

    const totalPlatformShare = filteredSessions.reduce((acc, curr) => acc + (curr.platformShare || 0), 0);
    const totalAstroShare = filteredSessions.reduce((acc, curr) => acc + (curr.astrologerShare || 0), 0);
    const totalEarned = filteredSessions.reduce((acc, curr) => acc + (curr.totalAmountDeducted || 0), 0);

    const totalDurationSeconds = filteredSessions.reduce((acc, curr) => acc + (curr.totalDuration || 0), 0);
    const m = Math.floor(totalDurationSeconds / 60);
    const s = totalDurationSeconds % 60;
    const totalDurationStr = `${m}m ${s}s`;

    const filteredDailyStats = dailyStats.filter(stat => {
        const statDate = getLocalDateString(stat.date);
        if (fromDate && statDate < fromDate) return false;
        if (toDate && statDate > toDate) return false;
        return true;
    });

    const totalOnlineDurationMinutes = filteredDailyStats.reduce((acc, curr) => acc + (curr.onlineDurationMinutes || 0), 0);
    const totalOnlineDurationSeconds = filteredDailyStats.reduce((acc, curr) => acc + (curr.onlineDurationSeconds || 0), 0);
    const totalOnlineTimeMinutes = totalOnlineDurationMinutes + Math.floor(totalOnlineDurationSeconds / 60);
    const totalOnlineTimeHours = Math.floor(totalOnlineTimeMinutes / 60);
    const totalOnlineTimeRemainderMinutes = totalOnlineTimeMinutes % 60;
    const onlineDurationStr = `${totalOnlineTimeHours}h ${totalOnlineTimeRemainderMinutes}m`;

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const handleExport = () => {
        const headers = ["Date", "User", "Status", "Ended By", "Astrologer Reason", "Session Duration (s)", "Rate", "Astro Share", "Total Deducted"];
        const rows = filteredSessions.map(s => [
            formatDate(s.createdAt),
            s.userId?.name || 'Unknown',
            s.status,
            s.endedBy || 'system',
            s.astrologerEndReason ? `"${s.astrologerEndReason}"` : '',
            s.totalDuration || 0,
            s.pricePerMinute || 0,
            s.astrologerShare || 0,
            s.totalAmountDeducted || 0
        ]);

        // Add Summary Stats at the bottom
        rows.push([]);
        rows.push(["--- SUMMARY STATS ---"]);
        rows.push(["Total Sessions:", filteredSessions.length]);
        rows.push(["Online Time:", onlineDurationStr]);
        rows.push(["Platform Share:", totalPlatformShare.toFixed(2)]);
        rows.push(["Astro Share:", totalAstroShare.toFixed(2)]);
        rows.push(["Total Earned:", totalEarned.toFixed(2)]);

        // Add Day-wise Online Time at the bottom
        if (filteredDailyStats.length > 0) {
            rows.push([]);
            rows.push(["--- DAY-WISE ONLINE TIME ---"]);
            rows.push(["Date", "Time Online"]);

            filteredDailyStats.forEach(stat => {
                const totalMins = (stat.onlineDurationMinutes || 0) + Math.floor((stat.onlineDurationSeconds || 0) / 60);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                rows.push([formatDate(stat.date), `${h}h ${m}m`]);
            });
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sessions_${astro.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                >
                    <X size={24} />
                </button>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{astro.displayName || astro.name}</h3>
                    <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                        <button
                            onClick={() => setActiveTab('sessions')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'sessions' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Sessions
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'reviews' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Reviews
                        </button>
                    </div>
                </div>

                {activeTab === 'sessions' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-slate-400 text-sm">Showing session data for the last 3 months.</p>
                            <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                                <label className="text-xs font-bold text-slate-400 uppercase">From:</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                                />
                                <label className="text-xs font-bold text-slate-400 uppercase ml-2">To:</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                                />
                                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Ended By:</label>
                                <select
                                    value={endedByFilter}
                                    onChange={(e) => setEndedByFilter(e.target.value)}
                                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="all">All</option>
                                    <option value="user">User</option>
                                    <option value="astrologer">Astrologer</option>
                                    <option value="system">System</option>
                                </select>
                                {(fromDate || toDate || endedByFilter !== 'all') && (
                                    <button onClick={() => { setFromDate(""); setToDate(""); setEndedByFilter("all"); }} className="text-xs text-rose-400 hover:text-rose-300 px-2 font-bold">Clear</button>
                                )}
                                <button onClick={handleExport} className="ml-4 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-9 gap-4 mb-6 shrink-0">
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Online Time</p>
                                <p className="text-lg font-bold text-violet-400 mt-1">{onlineDurationStr}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sessions</p>
                                <p className="text-lg font-bold text-white mt-1">{filteredSessions.length}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                                <p className="text-lg font-bold text-blue-400 mt-1">{totalDurationStr}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Ended By Astro</p>
                                <p className="text-lg font-bold text-sky-400 mt-1">{endedByAstroCount}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Ended By User</p>
                                <p className="text-lg font-bold text-emerald-400 mt-1">{endedByUserCount}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Missed/System</p>
                                <p className="text-lg font-bold text-rose-400 mt-1">{missedCount + endedBySystemCount}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Platform Share</p>
                                <p className="text-lg font-bold text-amber-400 mt-1">₹{totalPlatformShare.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Astro Share</p>
                                <p className="text-lg font-bold text-sky-400 mt-1">₹{totalAstroShare.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Earned</p>
                                <p className="text-lg font-bold text-emerald-400 mt-1">₹{totalEarned.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-950 border border-slate-800 rounded-xl">
                            {loading ? (
                                <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" /> Fetching records...
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No sessions found in the last 3 months.</div>
                            ) : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 shadow-sm">
                                        <tr>
                                            <th className="p-4 font-medium text-slate-400">Date</th>
                                            <th className="p-4 font-medium text-slate-400">User</th>
                                            <th className="p-4 font-medium text-slate-400">Status</th>
                                            <th className="p-4 font-medium text-slate-400">Ended By</th>
                                            <th className="p-4 font-medium text-slate-400">Reason</th>
                                            <th className="p-4 font-medium text-slate-400 text-right">Duration</th>
                                            <th className="p-4 font-medium text-slate-400 text-right">Rate (/min)</th>
                                            <th className="p-4 font-medium text-slate-400 text-right">Astro Share</th>
                                            <th className="p-4 font-medium text-slate-400 text-right">Total Earnings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {filteredSessions.map(s => (
                                            <tr key={s._id} className="hover:bg-slate-800/30 transition text-slate-300 cursor-pointer" onClick={() => openChatHistory(s.roomId)}>
                                                <td className="p-4 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                                                <td className="p-4 font-medium">{s.userId?.name || 'Unknown User'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${s.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        s.status === 'missed' || (s.status === 'initiated' && (!s.totalDuration || s.totalDuration === 0)) ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                            'bg-slate-700 text-slate-300'
                                                        }`}>
                                                        {(s.status === 'initiated' && (!s.totalDuration || s.totalDuration === 0)) ? 'MISSED' : s.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs font-bold uppercase tracking-wider">
                                                    {s.endedBy === 'user' ? (
                                                        <span className="text-emerald-400">User</span>
                                                    ) : s.endedBy === 'astrologer' ? (
                                                        <span className="text-sky-400">Astrologer</span>
                                                    ) : s.endedBy === 'admin' ? (
                                                        <span className="text-purple-400">Admin</span>
                                                    ) : (
                                                        <span className="text-slate-500">System</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs text-slate-400 max-w-[150px] truncate" title={s.astrologerEndReason || ''}>
                                                    {s.astrologerEndReason || '-'}
                                                </td>
                                                <td className="p-4 text-right font-mono">
                                                    {s.totalDuration ? `${Math.floor(s.totalDuration / 60)}m ${s.totalDuration % 60}s` : '0m 0s'}
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-400">
                                                    ₹{s.pricePerMinute || 0}
                                                </td>
                                                <td className="p-4 text-right font-bold text-sky-400/80">
                                                    ₹{(s.astrologerShare || 0).toFixed(2)}
                                                </td>
                                                <td className="p-4 text-right font-bold text-emerald-400">
                                                    ₹{(s.totalAmountDeducted || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="mt-6 flex justify-between items-center shrink-0 border-t border-slate-800 pt-6">
                            <button
                                onClick={handleDeleteOld}
                                disabled={deleting}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-bold transition flex items-center gap-2"
                            >
                                {deleting ? <Loader2 className="animate-spin" size={16} /> : null}
                                Delete Data Older Than 3 Months
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'reviews' && (
                    <div className="flex gap-6 h-full min-h-[400px]">
                        <div className="w-1/3 border-r border-slate-800 pr-6">
                            <h4 className="text-white font-bold mb-4">Add Manual Review</h4>
                            <form onSubmit={handleAddReview} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Reviewer Name</label>
                                    <input
                                        type="text"
                                        value={newReview.reviewerName}
                                        onChange={e => setNewReview({ ...newReview, reviewerName: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 mt-1 focus:border-blue-500 outline-none"
                                        placeholder="E.g. Priya S."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Reviewer Gender</label>
                                    <select
                                        value={newReview.reviewerGender}
                                        onChange={e => setNewReview({ ...newReview, reviewerGender: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 mt-1 focus:border-blue-500 outline-none"
                                    >
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Rating (1-5)</label>
                                    <input
                                        type="number" min="1" max="5"
                                        value={newReview.rating}
                                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 mt-1 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Comment</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 mt-1 focus:border-blue-500 outline-none"
                                        rows="3"
                                        placeholder="Write review text here..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingReview}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2"
                                >
                                    {addingReview && <Loader2 className="animate-spin" size={16} />}
                                    Add Review
                                </button>
                            </form>
                        </div>
                        <div className="w-2/3 flex flex-col">
                            <h4 className="text-white font-bold mb-4 flex justify-between">
                                Existing Reviews
                                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">{reviews.length} total</span>
                            </h4>
                            <div className="flex-1 overflow-auto bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                                {loading ? (
                                    <div className="text-slate-500 text-center py-8 flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" /> Fetching reviews...
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-slate-500 text-center py-8">No reviews found for this astrologer.</div>
                                ) : (
                                    reviews.map(rev => (
                                        <div key={rev._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white">
                                                        {rev.reviewerName}
                                                        {rev.reviewerGender && (
                                                            <span className="ml-2 text-[10px] uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                                                {rev.reviewerGender}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-yellow-500 text-xs flex items-center">
                                                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                    </span>
                                                    <span className="text-slate-500 text-xs ml-2">
                                                        {new Date(rev.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm">{rev.comment}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteReview(rev._id)}
                                                className="self-start text-rose-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded transition"
                                                title="Delete Review"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className={`${activeTab === 'reviews' ? 'mt-6' : 'mt-0'} flex justify-end items-center shrink-0 border-t border-slate-800 pt-6`}>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Chat History Modal */}
            {selectedChatSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col h-[80vh]">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Chat Transcript
                            </h2>
                            <button onClick={() => setSelectedChatSession(null)} className="text-slate-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatLoading ? (
                                <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                                    <Loader2 className="animate-spin" /> Loading Transcript...
                                </div>
                            ) : chatMessages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    No messages in this session.
                                </div>
                            ) : (
                                chatMessages.map((msg, i) => {
                                    const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    return (
                                        <div key={i} className={`flex flex-col ${msg.senderModel === 'Astrologer' ? 'items-end' : 'items-start'}`}>
                                            <div className={`text-[10px] text-slate-500 mb-1 flex items-center gap-2`}>
                                                {msg.senderModel === 'Astrologer' ? (
                                                    <><span className="text-[9px] text-slate-600 font-medium">{timeStr}</span> <span>{msg.senderModel}</span></>
                                                ) : (
                                                    <><span>{msg.senderModel}</span> <span className="text-[9px] text-slate-600 font-medium">{timeStr}</span></>
                                                )}
                                            </div>
                                            <div className={`px-4 py-2 text-sm rounded-2xl max-w-[80%] ${msg.senderModel === 'Astrologer' ? 'bg-sky-500/20 text-sky-100 border border-sky-500/30 rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
