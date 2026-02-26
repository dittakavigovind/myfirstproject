"use client";
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAgora } from '../../../context/AgoraContext';
import { useRouter } from 'next/navigation';
import API from '../../../lib/api';
import { Phone, Video, X, Check, MessageSquare, Calendar, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityStats from '../../../components/astrologer/ActivityStats';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";

export default function AstrologerDashboard() {
    const { user, loading } = useAuth();
    const { incomingCall, setIncomingCall, startCall } = useAgora();
    const router = useRouter();

    // --- Status State ---
    const [statusState, setStatusState] = useState({
        isOnline: false, // Computed from channels
        isChatOnline: false,
        isVoiceOnline: false,
        isVideoOnline: false,
        lastOnlineAt: null
    });
    const [sessionTimer, setSessionTimer] = useState('00:00:00');

    // --- History State ---
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [historyData, setHistoryData] = useState({ sessions: [], stats: {} });
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // --- Stats State ---
    const [todayStats, setTodayStats] = useState({
        historyOnlineMinutes: 0,
        totalOnlineMinutes: 0,
        voiceMinutes: 0,
        videoMinutes: 0,
        chatMinutes: 0,
        earnings: 0
    });

    // 1. Sync User Context
    useEffect(() => {
        if (user) {
            setStatusState({
                isOnline: user.isChatOnline || user.isVoiceOnline || user.isVideoOnline,
                isChatOnline: user.isChatOnline || false,
                isVoiceOnline: user.isVoiceOnline || false,
                isVideoOnline: user.isVideoOnline || false,
                lastOnlineAt: user.lastOnlineAt
            });
        }
    }, [user]);

    // 2. Fetch Dashboard Stats (Periodic)
    const fetchStats = async () => {
        try {
            const { data } = await API.get('/activity/stats/dashboard');
            if (data.success) {
                setTodayStats(prev => ({ ...prev, ...data.data }));

                // Sync status from server (source of truth)
                if (data.data.isChatOnline !== undefined) {
                    const isAnyOnline = data.data.isChatOnline || data.data.isVoiceOnline || data.data.isVideoOnline;
                    setStatusState(prev => ({
                        ...prev,
                        isOnline: isAnyOnline,
                        isChatOnline: data.data.isChatOnline,
                        isVoiceOnline: data.data.isVoiceOnline,
                        isVideoOnline: data.data.isVideoOnline,
                        lastOnlineAt: data.data.lastOnlineAt
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
        const timer = setInterval(fetchStats, 60000);
        return () => clearInterval(timer);
    }, []);

    // 3. Session Timer Logic
    useEffect(() => {
        let interval;
        if (statusState.isOnline && statusState.lastOnlineAt) {
            const startTime = new Date(statusState.lastOnlineAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = now - startTime;
                if (diff < 0) {
                    setSessionTimer('00:00:00');
                    return;
                }
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setSessionTimer(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );

                // Update Total Online Time for the top UI card
                const currentSessionSecs = Math.floor(diff / 1000);
                setTodayStats(prev => ({
                    ...prev,
                    totalOnlineSeconds: (prev.historyOnlineSeconds || 0) + currentSessionSecs
                }));
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setSessionTimer('00:00:00');
        }
        return () => clearInterval(interval);
    }, [statusState.isOnline, statusState.lastOnlineAt, todayStats.historyOnlineSeconds]);

    // 4. Fetch History
    const fetchHistory = async (date) => {
        setIsHistoryLoading(true);
        try {
            const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            const { data } = await API.get(`/astro/sessions?date=${dateStr}`);
            if (data.success) {
                setHistoryData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(selectedDate);
    }, [selectedDate]);

    // 5. Handlers
    const handleToggle = async (key, value) => {
        try {
            // Optimistic UI Update
            setStatusState(prev => {
                const newState = { ...prev, [key]: value };
                // Recompute isOnline
                newState.isOnline = newState.isChatOnline || newState.isVoiceOnline || newState.isVideoOnline;
                // If turning online for the first time, set local lastOnlineAt if not present
                if (newState.isOnline && !prev.isOnline) {
                    newState.lastOnlineAt = new Date().toISOString();
                }
                return newState;
            });

            // Call API
            const payload = { [key]: value };
            await API.post('/astro/status/toggle', payload);

            // Sync strictly after success
            fetchStats();
            // Refresh history if we just refreshed page or something
            if (selectedDate.toDateString() === new Date().toDateString()) {
                fetchHistory(selectedDate);
            }

        } catch (error) {
            console.error("Toggle Failed", error);
            // Revert (fetchStats will eventually fix it, but let's be safer?)
            fetchStats();
        }
    };

    const handleAcceptCall = () => {
        if (incomingCall) {
            startCall(incomingCall.channelId, incomingCall.token, incomingCall.uid);
            setIncomingCall(null);
            router.push(`/call/session?id=${incomingCall.channelId}`);
        }
    };

    const handleRejectCall = () => {
        setIncomingCall(null);
    };

    if (loading || !user || user.role !== 'astrologer') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Astrologer Dashboard</h1>

            {/* Top Stats */}
            <ActivityStats stats={todayStats} />

            <div className="flex flex-col lg:flex-row gap-8 mt-8">

                {/* Left: Communication Controls */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <Clock className="text-indigo-500" /> Availability Control
                        </h2>

                        <div className="space-y-4">
                            {/* Chat Toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${statusState.isChatOnline ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${statusState.isChatOnline ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${statusState.isChatOnline ? 'text-blue-800' : 'text-slate-600'}`}>Chat</p>
                                        {statusState.isChatOnline && <p className="text-xs font-mono text-blue-600 font-bold">{sessionTimer}</p>}
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={statusState.isChatOnline} onChange={(e) => handleToggle('isChatOnline', e.target.checked)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Voice Toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${statusState.isVoiceOnline ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${statusState.isVoiceOnline ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${statusState.isVoiceOnline ? 'text-emerald-800' : 'text-slate-600'}`}>Voice Call</p>
                                        {statusState.isVoiceOnline && <p className="text-xs font-mono text-emerald-600 font-bold">{sessionTimer}</p>}
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={statusState.isVoiceOnline} onChange={(e) => handleToggle('isVoiceOnline', e.target.checked)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            {/* Video Toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${statusState.isVideoOnline ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${statusState.isVideoOnline ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${statusState.isVideoOnline ? 'text-purple-800' : 'text-slate-600'}`}>Video Call</p>
                                        {statusState.isVideoOnline && <p className="text-xs font-mono text-purple-600 font-bold">{sessionTimer}</p>}
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={statusState.isVideoOnline} onChange={(e) => handleToggle('isVideoOnline', e.target.checked)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right: Session History */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                                <History className="text-orange-500" /> Session History
                            </h2>
                            <div className="relative">
                                <DatePicker customInput={<CustomDateInput Icon={Calendar} />} selected={selectedDate} onChange={(date) => setSelectedDate(date)} className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 font-medium" dateFormat="dd/MM/yyyy" />

                            </div>
                        </div>

                        {/* Summary for Selected Date */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Time</p>
                                <p className="text-lg font-bold text-slate-800">{Math.floor((historyData.stats?.totalDuration || 0) / 3600)}h {Math.floor(((historyData.stats?.totalDuration || 0) % 3600) / 60)}m</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-500 uppercase font-bold tracking-wider">Chat</p>
                                <p className="text-lg font-bold text-blue-800">{Math.floor((historyData.stats?.chatDuration || 0) / 60)}m</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <p className="text-xs text-emerald-500 uppercase font-bold tracking-wider">Voice</p>
                                <p className="text-lg font-bold text-emerald-800">{Math.floor((historyData.stats?.voiceDuration || 0) / 60)}m</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <p className="text-xs text-purple-500 uppercase font-bold tracking-wider">Video</p>
                                <p className="text-lg font-bold text-purple-800">{Math.floor((historyData.stats?.videoDuration || 0) / 60)}m</p>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Start Time</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">End Time</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Duration</th>
                                        <th className="px-4 py-3 font-semibold text-slate-600">Services</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isHistoryLoading ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-slate-400">Loading history...</td></tr>
                                    ) : historyData.sessions?.length > 0 ? (
                                        historyData.sessions.map((session, i) => (
                                            <tr key={session._id || i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-700">
                                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-green-600 font-bold animate-pulse">Active</span>}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-600">
                                                    {session.duration ? `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        {session.servicesUsed.map(s => (
                                                            <span key={s} className={`px-2 py-0.5 rounded text-xs font-bold uppercase 
                                                                ${s === 'chat' ? 'bg-blue-100 text-blue-700' :
                                                                    s === 'voice' ? 'bg-green-100 text-green-700' :
                                                                        'bg-purple-100 text-purple-700'}`}>
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center py-8 text-slate-400">No sessions recorded for this date.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Incoming Call Modal */}
            <AnimatePresence>
                {incomingCall && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 bg-white p-6 rounded-2xl shadow-2xl border border-astro-gold/20 z-50 w-80"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                {incomingCall.type === 'video' ? <Video className="text-indigo-600" /> : <Phone className="text-indigo-600" />}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Incoming {incomingCall.type} Call</p>
                                <p className="font-bold text-slate-800 text-lg">{incomingCall.callerName}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRejectCall}
                                className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} /> Reject
                            </button>
                            <button
                                onClick={handleAcceptCall}
                                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                            >
                                <Check size={18} /> Accept
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
