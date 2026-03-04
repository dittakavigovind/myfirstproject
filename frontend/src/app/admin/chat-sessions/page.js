'use client';

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import { MessageSquare, Download, StopCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChatSessions() {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({ totalSessions: 0, totalRevenue: 0, activeNow: 0 });
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const [sessionsRes, statsRes] = await Promise.all([
                API.get('/admin/chats'),
                API.get('/admin/chats/stats')
            ]);

            if (sessionsRes.data.success) {
                setSessions(sessionsRes.data.sessions);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch admin chat data:', error);
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    const handleForceEnd = async (sessionId) => {
        if (!confirm('Are you sure you want to force-end this session?')) return;
        try {
            const res = await API.post(`/admin/chats/${sessionId}/force-end`);
            if (res.data.success) {
                toast.success('Session terminated');
                fetchSessions();
            }
        } catch (error) {
            toast.error('Failed to terminate session');
        }
    };

    const handleExport = async (sessionId) => {
        try {
            const res = await API.get(`/admin/chats/${sessionId}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `chat_log_${sessionId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to export logs');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading sessions...</div>;

    return (
        <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Chat Session Monitoring</h1>
                <div className="flex gap-4">
                    <button onClick={fetchSessions} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MessageSquare /></div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Sessions</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.totalSessions}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp /></div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">₹{stats.totalRevenue?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl animate-pulse"><Users /></div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Active Now</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.activeNow}</p>
                    </div>
                </div>
            </div>

            {/* Session Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600">Session ID</th>
                            <th className="px-6 py-4 font-bold text-slate-600">User</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Astrologer</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Duration</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Billing</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sessions.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-12 text-slate-400">No chat sessions found.</td></tr>
                        ) : (
                            sessions.map((session) => (
                                <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{session.roomId}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{session.user?.displayName || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">{session.user?.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{session.astrologer?.displayName || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">Rate: ₹{session.pricePerMinute}/min</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${session.status === 'active' ? 'bg-green-100 text-green-700 animate-pulse' :
                                            session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {Math.floor(session.totalDuration / 60)}m {session.totalDuration % 60}s
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">₹{session.totalDeducted?.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleExport(session._id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Export Logs"
                                            >
                                                <Download size={18} />
                                            </button>
                                            {session.status === 'active' && (
                                                <button
                                                    onClick={() => handleForceEnd(session._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Force Terminate"
                                                >
                                                    <StopCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
