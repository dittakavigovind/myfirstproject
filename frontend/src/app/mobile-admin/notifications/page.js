"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Send, Users, Activity, BellRing, Sparkles, AlertCircle, History, User } from 'lucide-react';

export default function MobileAdminNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetAudience: 'all'
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/notifications');
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load notifications history");
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.message) {
            return toast.error("Title and Message are required");
        }

        setSending(true);
        try {
            const res = await API.post('/notifications', formData);
            if (res.data.success) {
                toast.success("Broadcast dispatched successfully!");
                setFormData({ title: '', message: '', targetAudience: 'all' });
                fetchNotifications(); // Refresh history
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to dispatch broadcast");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this broadcast record?")) return;
        try {
            await API.delete(`/notifications/${id}`);
            toast.success("Broadcast record deleted");
            fetchNotifications();
        } catch (error) {
            toast.error("Failed to delete record");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BellRing className="text-blue-500" /> Push Notifications Setup
                </h1>
                <p className="text-slate-400 mt-2">Broadcast alerts and system messages directly to Users and Astrologers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CREATE BROADCAST PANEL */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative h-fit">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                            <Send size={20} className="text-emerald-400" /> New Broadcast
                        </h2>
                        
                        <form onSubmit={handleSendNotification} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Announcement Title</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="e.g. Server Maintenance, Discount Offer!"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Message Payload</label>
                                <textarea 
                                    value={formData.message} 
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/50 min-h-[120px]"
                                    placeholder="The main text of your notification..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Audience</label>
                                <select 
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="all">Everyone (Global Broadcast)</option>
                                    <option value="users">Only Users (Clients)</option>
                                    <option value="astrologers">Only Astrologers</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold transition disabled:opacity-50 mt-4"
                            >
                                {sending ? 'Dispatching...' : <><Sparkles size={18} /> Send Broadcast Now</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* BROADCAST HISTORY */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                            <History size={20} className="text-blue-400" /> Dispatch History
                        </h2>

                        {loading ? (
                            <div className="text-center py-12 text-slate-400">Loading history...</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 italic">No broadcasts have been sent yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notif) => (
                                    <div key={notif._id} className="p-5 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-start justify-between hover:border-slate-700 transition">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                                                {notif.targetAudience === 'astrologers' ? <Activity size={18} /> : 
                                                 notif.targetAudience === 'users' ? <User size={18} /> : <Users size={18} />}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">{notif.title}</h4>
                                                <p className="text-slate-400 text-sm mt-1">{notif.message}</p>
                                                
                                                <div className="flex flex-wrap gap-3 mt-3">
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium tracking-wide">
                                                        To: {notif.targetAudience.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                                                        Reads: {notif.readBy?.length || 0}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded font-medium ${notif.isPushDispatched ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                        {notif.isPushDispatched ? 'FCM Sent' : 'In-App Only'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(notif._id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded transition text-sm font-medium shrink-0"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
