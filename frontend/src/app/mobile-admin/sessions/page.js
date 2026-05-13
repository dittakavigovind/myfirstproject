"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { FileText, Video, Phone, MessageSquare, PlayCircle, Loader2, ArrowRight } from 'lucide-react';

export default function MobileSessionsDashboard() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Bypass Form Logic
    const [bypassForm, setBypassForm] = useState({ astrologerId: '', userId: '', sessionType: 'chat' });
    const [bypassing, setBypassing] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await API.get('/admin/sessions');
            if (res.data.success) {
                setSessions(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center gap-3 text-slate-400"><Loader2 className="animate-spin" /> Fetching Master Ledger...</div>;

    const getSessionIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={18} className="text-purple-400" />;
            case 'voice': return <Phone size={18} className="text-emerald-400" />;
            case 'chat': return <MessageSquare size={18} className="text-blue-400" />;
            default: return <FileText size={18} className="text-slate-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20 animate-pulse">Live Now</span>;
            case 'completed': return <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">Completed</span>;
            case 'failed': return <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20">Failed</span>;
            default: return <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-700">{status}</span>;
        }
    };

    const handleTriggerBypass = async (e) => {
        e.preventDefault();
        if (!bypassForm.astrologerId || !bypassForm.userId) return toast.error("IDs are required");
        setBypassing(true);
        try {
            const res = await API.post('/admin/queue/bypass', bypassForm);
            if(res.data.success) {
                toast.success("Priority Bypass Executed! User moved to position #1.");
                setBypassForm({ astrologerId: '', userId: '', sessionType: 'chat' });
            }
        } catch(err) {
            toast.error("Failed to execute queue override.");
        }
        setBypassing(false);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-blue-500" /> Interaction Log
                    </h1>
                    <p className="text-slate-400 mt-2">Monitor active calls, review completed chats, and access Agora Video S3 recordings.</p>
                </div>
                <button onClick={fetchSessions} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
                    Refresh Logs
                </button>
            </div>

            {/* Waitlist Bypass Injector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 mb-8 mt-4 relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                     <PlayCircle className="text-purple-400" size={18} /> Priority Queue Overrider (Waitlist Bypass)
                 </h3>
                 <form onSubmit={handleTriggerBypass} className="flex flex-col md:flex-row gap-4 items-end relative z-10">
                     <div className="flex-1 w-full">
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Astrologer ID</label>
                         <input required type="text" value={bypassForm.astrologerId} onChange={e=>setBypassForm({...bypassForm, astrologerId: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500/50" placeholder="Paste Astro Mongo ID" />
                     </div>
                     <div className="flex-1 w-full">
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">User ID to Prioritize</label>
                         <input required type="text" value={bypassForm.userId} onChange={e=>setBypassForm({...bypassForm, userId: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500/50" placeholder="Paste User Mongo ID" />
                     </div>
                     <div className="w-full md:w-48">
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Session Type</label>
                         <select value={bypassForm.sessionType} onChange={e=>setBypassForm({...bypassForm, sessionType: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-purple-500/50 uppercase text-xs font-bold">
                             <option value="chat">Chat</option>
                             <option value="voice">Audio Call</option>
                             <option value="video">Video Call</option>
                         </select>
                     </div>
                     <button type="submit" disabled={bypassing} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold transition whitespace-nowrap disabled:opacity-50 h-[46px] flex items-center">
                         {bypassing ? 'Injecting...' : 'Force Bypass'}
                     </button>
                 </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Session Info</th>
                                <th className="px-6 py-4">Entities</th>
                                <th className="px-6 py-4">Timing & Cost</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Records</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {sessions.map(session => (
                                <tr key={session._id} className="hover:bg-slate-800/50 transition duration-150">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                                                {getSessionIcon(session.sessionType)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white capitalize">{session.sessionType} Session</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5" title={session._id}>ID: {...session._id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-blue-400 truncate max-w-[120px]" title={session.userId?.name || 'Unknown User'}>{session.userId?.name || 'User'}</span>
                                            <ArrowRight size={14} className="text-slate-600" />
                                            <span className="font-bold text-purple-400 truncate max-w-[120px]" title={session.astrologerId?.name || 'Unknown Astro'}>{session.astrologerId?.name || 'Astro'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="font-medium text-slate-200">
                                            {session.totalDuration ? `~${Math.floor(session.totalDuration / 60)}m ${session.totalDuration % 60}s` : '0s'}
                                        </div>
                                        <div className="text-xs text-emerald-500 font-bold mt-0.5">₹ {session.totalAmountDeducted || 0} Deducted</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {getStatusBadge(session.status)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {session.recordingUrl ? (
                                            <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                                <PlayCircle size={14} /> View S3 AWS
                                            </a>
                                        ) : session.sessionType === 'chat' ? (
                                            <button className="inline-flex items-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                                <MessageSquare size={14} /> Read Log
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-600 font-medium italic">No Media</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No sessions recorded on the platform yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
