"use client";

import { useState, useEffect, useMemo } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { 
    FileText, Video, Phone, MessageSquare, PlayCircle, Loader2, 
    ArrowRight, X, Search, Calendar, Filter, CheckCircle2, 
    AlertCircle, XCircle, Copy, Check, RotateCcw, ChevronDown, 
    ChevronUp, Download, ShieldCheck, UserCheck, Clock, DollarSign
} from 'lucide-react';

export default function MobileSessionsDashboard() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all, audio, chat, video
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed, missed, failed
    const [copiedId, setCopiedId] = useState(null);

    // Bypass Form Logic & Toggle
    const [showBypass, setShowBypass] = useState(false);
    const [bypassForm, setBypassForm] = useState({ astrologerId: '', userId: '', sessionType: 'chat' });
    const [bypassing, setBypassing] = useState(false);
    
    // Lookup Data
    const [astrologers, setAstrologers] = useState([]);
    const [users, setUsers] = useState([]);

    // Chat Log Viewer
    const [selectedChatSession, setSelectedChatSession] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
        fetchAstrologersAndUsers();
    }, []);

    const fetchAstrologersAndUsers = async () => {
        try {
            const [astroRes, userRes] = await Promise.all([
                API.get('/admin/astrologers'),
                API.get('/admin/users')
            ]);
            if (astroRes.data?.success) setAstrologers(astroRes.data.data);
            if (userRes.data?.success) setUsers(userRes.data.data);
        } catch(error) {
            console.error("Failed to fetch lookup data", error);
        }
    };

    const fetchSessions = async (searchParams = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('limit', '500'); // Load comprehensive ledger
            if (searchParams.search || searchTerm) params.append('search', searchParams.search || searchTerm);
            if (searchParams.startDate || startDate) params.append('startDate', searchParams.startDate || startDate);
            if (searchParams.endDate || endDate) params.append('endDate', searchParams.endDate || endDate);
            if (searchParams.type && searchParams.type !== 'all') params.append('sessionType', searchParams.type);
            if (searchParams.status && searchParams.status !== 'all') params.append('status', searchParams.status);

            const res = await API.get(`/admin/sessions?${params.toString()}`);
            if (res.data.success) {
                setSessions(res.data.data || []);
            }
        } catch (error) {
            console.error("Fetch sessions error:", error);
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openChatHistory = async (roomId) => {
        if (!roomId) return toast.error("No valid chat room ID found");
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

    const handleTriggerBypass = async (e) => {
        e.preventDefault();
        if (!bypassForm.astrologerId || !bypassForm.userId) return toast.error("IDs are required");
        setBypassing(true);
        try {
            const res = await API.post('/admin/queue/bypass', bypassForm);
            if (res.data.success) {
                toast.success("Priority Bypass Executed! User moved to position #1.");
                setBypassForm({ astrologerId: '', userId: '', sessionType: 'chat' });
            }
        } catch(err) {
            toast.error("Failed to execute queue override.");
        }
        setBypassing(false);
    };

    // Client-side Instant Filter over loaded sessions
    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            // Type filter
            if (typeFilter !== 'all') {
                if (typeFilter === 'audio') {
                    if (session.sessionType !== 'audio' && session.sessionType !== 'voice') return false;
                } else if (session.sessionType !== typeFilter) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (session.status !== statusFilter) return false;
            }

            // Date filter
            if (startDate || endDate) {
                const sDateObj = new Date(session.createdAt || session.startTime);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (sDateObj < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (sDateObj > end) return false;
                }
            }

            // Search query filter (user, astro, phone, IDs, reasons)
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim();
                const userName = session.userId?.name?.toLowerCase() || '';
                const userPhone = session.userId?.phone || '';
                const userEmail = session.userId?.email?.toLowerCase() || '';
                const astroName = (session.astrologerId?.displayName || session.astrologerId?.name || '').toLowerCase();
                const astroEmail = session.astrologerId?.email?.toLowerCase() || '';
                const sessionId = session._id?.toLowerCase() || '';
                const roomId = session.roomId?.toLowerCase() || '';
                const reason = (session.terminationReason || session.astrologerEndReason || '').toLowerCase();
                const endedBy = (session.endedBy || '').toLowerCase();

                const matches = userName.includes(term) ||
                    userPhone.includes(term) ||
                    userEmail.includes(term) ||
                    astroName.includes(term) ||
                    astroEmail.includes(term) ||
                    sessionId.includes(term) ||
                    roomId.includes(term) ||
                    reason.includes(term) ||
                    endedBy.includes(term);

                if (!matches) return false;
            }

            return true;
        });
    }, [sessions, typeFilter, statusFilter, startDate, endDate, searchTerm]);

    // Financial & Duration Totals for Filtered View
    const filteredMetrics = useMemo(() => {
        let totalDurationSec = 0;
        let totalDeducted = 0;
        let totalAstroShare = 0;
        let totalPlatformShare = 0;

        filteredSessions.forEach(s => {
            totalDurationSec += (s.totalDuration || 0);
            totalDeducted += (s.totalAmountDeducted || 0);
            totalAstroShare += (s.astrologerShare || 0);
            totalPlatformShare += (s.platformShare || 0);
        });

        return {
            count: filteredSessions.length,
            totalDurationSec,
            totalDeducted,
            totalAstroShare,
            totalPlatformShare
        };
    }, [filteredSessions]);

    const handleExportCSV = () => {
        try {
            const headers = [
                'Date & Time (IST)',
                'Session ID',
                'Room ID',
                'Type',
                'User Name',
                'User Phone',
                'Astrologer Name',
                'Duration (s)',
                'Duration Formatted',
                'Rate (/min)',
                'Total Deducted (₹)',
                'Astrologer Share (₹)',
                'Platform Share (₹)',
                'Status',
                'Ended By',
                'Termination Reason'
            ];

            const rows = filteredSessions.map(s => {
                const dateIST = s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '';
                const durMin = Math.floor((s.totalDuration || 0) / 60);
                const durSec = (s.totalDuration || 0) % 60;
                return [
                    `"${dateIST}"`,
                    `"${s._id || ''}"`,
                    `"${s.roomId || ''}"`,
                    `"${s.sessionType || ''}"`,
                    `"${s.userId?.name || 'Unknown'}"`,
                    `"${s.userId?.phone || ''}"`,
                    `"${s.astrologerId?.displayName || s.astrologerId?.name || 'Unknown'}"`,
                    s.totalDuration || 0,
                    `"${durMin}m ${durSec}s"`,
                    s.pricePerMinute || 0,
                    (s.totalAmountDeducted || 0).toFixed(2),
                    (s.astrologerShare || 0).toFixed(2),
                    (s.platformShare || 0).toFixed(2),
                    `"${s.status || ''}"`,
                    `"${s.endedBy || 'system'}"`,
                    `"${(s.terminationReason || s.astrologerEndReason || '').replace(/"/g, '""')}"`
                ].join(',');
            });

            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `Interaction_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV Export downloaded successfully");
        } catch (err) {
            console.error("Export Error:", err);
            toast.error("Failed to export CSV");
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setTypeFilter('all');
        setStatusFilter('all');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getSessionIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={18} className="text-purple-400" />;
            case 'voice':
            case 'audio': return <Phone size={18} className="text-emerald-400" />;
            case 'chat': return <MessageSquare size={18} className="text-blue-400" />;
            default: return <FileText size={18} className="text-slate-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Live Now
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                        Completed
                    </span>
                );
            case 'missed':
                return (
                    <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                        Missed
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                        {status}
                    </span>
                );
        }
    };

    const getEndedByBadge = (endedBy) => {
        switch (endedBy) {
            case 'user':
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">User</span>;
            case 'astrologer':
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">Astrologer</span>;
            case 'admin':
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">Admin</span>;
            default:
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">System</span>;
        }
    };

    const formatSeconds = (totalSec) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const hasActiveFilters = Boolean(searchTerm || startDate || endDate || typeFilter !== 'all' || statusFilter !== 'all');

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <FileText className="text-blue-500" /> Interaction Log
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Monitor active calls, audit past sessions, investigate user/astrologer disputes, and access recordings.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button 
                        onClick={() => setShowBypass(!showBypass)} 
                        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                        <PlayCircle size={14} /> Waitlist Bypass {showBypass ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button 
                        onClick={handleExportCSV} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                    <button 
                        onClick={() => fetchSessions()} 
                        disabled={loading}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Refresh
                    </button>
                </div>
            </div>

            {/* Collapsible Waitlist Bypass Injector */}
            {showBypass && (
                <div className="bg-slate-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl p-6 relative transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <PlayCircle className="text-purple-400" size={16} /> Priority Queue Overrider (Waitlist Bypass)
                        </h3>
                        <button onClick={() => setShowBypass(false)} className="text-slate-500 hover:text-slate-300">
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={handleTriggerBypass} className="flex flex-col md:flex-row gap-4 items-end relative z-10">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Astrologer</label>
                            <select 
                                required 
                                value={bypassForm.astrologerId} 
                                onChange={e => setBypassForm({...bypassForm, astrologerId: e.target.value})} 
                                className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                                <option value="">Select Astrologer...</option>
                                {astrologers.map(a => <option key={a._id} value={a._id}>{a.displayName || a.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">User to Prioritize</label>
                            <select 
                                required 
                                value={bypassForm.userId} 
                                onChange={e => setBypassForm({...bypassForm, userId: e.target.value})} 
                                className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                                <option value="">Select User...</option>
                                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.phoneNumber || u.phone || 'No phone'})</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Session Type</label>
                            <select 
                                value={bypassForm.sessionType} 
                                onChange={e => setBypassForm({...bypassForm, sessionType: e.target.value})} 
                                className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-lg text-xs uppercase font-bold focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                                <option value="chat">Chat</option>
                                <option value="voice">Audio Call</option>
                                <option value="video">Video Call</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={bypassing} 
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap disabled:opacity-50 h-[38px] flex items-center justify-center"
                        >
                            {bypassing ? <Loader2 size={14} className="animate-spin" /> : 'Force Bypass'}
                        </button>
                    </form>
                </div>
            )}

            {/* Filter Controls: Date Range, Search, Type, Status */}
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[260px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search user name, phone, astrologer, session ID, room ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-xl self-start lg:self-auto">
                        <Calendar size={14} className="text-slate-400 ml-1.5 shrink-0" />
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
                            title="From Date"
                        />
                        <span className="text-slate-500 text-xs">to</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none [color-scheme:dark]"
                            title="To Date"
                        />
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[11px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Pills: Type & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    {/* Session Type Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                            <Filter size={11} /> Type:
                        </span>
                        <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                typeFilter === 'all'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            All ({sessions.length})
                        </button>
                        <button
                            onClick={() => setTypeFilter('audio')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                typeFilter === 'audio'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
                            }`}
                        >
                            <Phone size={12} /> Audio Call
                        </button>
                        <button
                            onClick={() => setTypeFilter('chat')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                typeFilter === 'chat'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-blue-400/80 hover:text-blue-300 border border-slate-800'
                            }`}
                        >
                            <MessageSquare size={12} /> Chat
                        </button>
                        <button
                            onClick={() => setTypeFilter('video')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                typeFilter === 'video'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-slate-950 text-purple-400/80 hover:text-purple-300 border border-slate-800'
                            }`}
                        >
                            <Video size={12} /> Video
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'active'
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                            }`}
                        >
                            Live Now
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'completed'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                            }`}
                        >
                            <CheckCircle2 size={12} /> Completed
                        </button>
                        <button
                            onClick={() => setStatusFilter('missed')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'missed'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                            }`}
                        >
                            <AlertCircle size={12} /> Missed
                        </button>
                        <button
                            onClick={() => setStatusFilter('failed')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                statusFilter === 'failed'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            }`}
                        >
                            <XCircle size={12} /> Failed
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count & Investigation Audit Totals */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                    <span>
                        Showing <strong className="text-white font-bold">{filteredSessions.length}</strong> of{' '}
                        <strong className="text-slate-400">{sessions.length}</strong> sessions
                    </span>
                    {hasActiveFilters && (
                        <span className="bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-500/30 text-[11px]">
                            Filters Active
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
                    <div className="flex items-center gap-3 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                        <span>Duration: <strong className="text-white font-bold">{formatSeconds(filteredMetrics.totalDurationSec)}</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>Total Deducted: <strong className="text-emerald-400 font-bold">₹{filteredMetrics.totalDeducted.toFixed(2)}</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>Astro: <strong className="text-sky-400 font-bold">₹{filteredMetrics.totalAstroShare.toFixed(2)}</strong></span>
                    </div>

                    {hasActiveFilters && (
                        <button 
                            onClick={resetFilters} 
                            className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer text-xs ml-1"
                        >
                            Reset all filters
                        </button>
                    )}
                </div>
            </div>

            {/* Session Ledger Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 sticky top-0">
                            <tr>
                                <th className="px-5 py-4 w-[28%]">Session & Date</th>
                                <th className="px-5 py-4 w-[24%]">Entities</th>
                                <th className="px-5 py-4 w-[20%]">Timing & Cost</th>
                                <th className="px-5 py-4 w-[16%]">Status & Audit</th>
                                <th className="px-5 py-4 w-[12%] text-right">Records</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-indigo-500" size={18} />
                                            <span>Fetching session records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No sessions found matching the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map(session => (
                                    <tr key={session._id} className="hover:bg-slate-800/40 transition duration-150">
                                        {/* 1. Session Info & Date */}
                                        <td className="px-5 py-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                                    {getSessionIcon(session.sessionType)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white capitalize text-xs flex items-center gap-1.5">
                                                        <span>{session.sessionType || 'chat'} Session</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                                        {formatDateTime(session.createdAt || session.startTime)}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                                                        <span 
                                                            className="hover:text-slate-300 transition cursor-pointer flex items-center gap-0.5" 
                                                            title="Click to copy Session ID"
                                                            onClick={() => handleCopy(session._id, session._id)}
                                                        >
                                                            ID: {session._id.substring(0, 8)}...
                                                            {copiedId === session._id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                                        </span>
                                                        <span>•</span>
                                                        <span 
                                                            className="hover:text-slate-300 transition cursor-pointer flex items-center gap-0.5" 
                                                            title="Click to copy Room ID"
                                                            onClick={() => handleCopy(session.roomId, session.roomId)}
                                                        >
                                                            Room: {session.roomId ? session.roomId.substring(0, 6) + '...' : '-'}
                                                            {copiedId === session.roomId ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Entities (User & Astrologer) */}
                                        <td className="px-5 py-4 align-top">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">User:</span>
                                                    <span className="font-medium text-blue-400 truncate max-w-[150px] text-xs" title={session.userId?.name || 'Unknown User'}>
                                                        {session.userId?.name || 'Unknown User'}
                                                    </span>
                                                </div>
                                                {session.userId?.phone && (
                                                    <div className="text-[10px] text-slate-500 font-mono pl-8">
                                                        {session.userId.phone}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                    <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Astro:</span>
                                                    <span className="font-bold text-purple-400 truncate max-w-[150px] text-xs" title={session.astrologerId?.displayName || session.astrologerId?.name || 'Unknown'}>
                                                        {session.astrologerId?.displayName || session.astrologerId?.name || 'Astrologer'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 3. Timing & Cost Split */}
                                        <td className="px-5 py-4 align-top">
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-white text-xs font-mono">
                                                    {session.totalDuration ? formatSeconds(session.totalDuration) : '0s'}
                                                    {session.pricePerMinute ? <span className="text-slate-500 font-normal ml-1 text-[11px]">(@ ₹{session.pricePerMinute}/m)</span> : null}
                                                </div>
                                                <div className="text-xs font-bold text-emerald-400 font-mono">
                                                    ₹ {(session.totalAmountDeducted || 0).toFixed(2)} Deducted
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 pt-0.5">
                                                    <span className="text-sky-400">Astro: ₹{(session.astrologerShare || 0).toFixed(2)}</span>
                                                    <span className="text-slate-600">|</span>
                                                    <span className="text-slate-400">Platform: ₹{(session.platformShare || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Status & Dispute Audit Details */}
                                        <td className="px-5 py-4 align-top">
                                            <div className="space-y-1.5">
                                                <div>{getStatusBadge(session.status)}</div>
                                                <div className="flex items-center gap-1 text-[10px]">
                                                    <span className="text-slate-500">Ended by:</span>
                                                    {getEndedByBadge(session.endedBy)}
                                                </div>
                                                {(session.terminationReason || session.astrologerEndReason) && (
                                                    <div 
                                                        className="text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 max-w-[180px] truncate" 
                                                        title={session.terminationReason || session.astrologerEndReason}
                                                    >
                                                        {session.terminationReason || session.astrologerEndReason}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 5. Records & Transcripts */}
                                        <td className="px-5 py-4 align-top text-right">
                                            {session.recordingUrl ? (
                                                <a 
                                                    href={session.recordingUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:bg-blue-600/40 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                                                >
                                                    <PlayCircle size={13} /> S3 Video
                                                </a>
                                            ) : session.sessionType === 'chat' ? (
                                                <button 
                                                    onClick={() => openChatHistory(session.roomId)} 
                                                    className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition"
                                                >
                                                    <MessageSquare size={13} /> Transcript
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-600 font-medium italic">No Media</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chat Transcript Modal */}
            {selectedChatSession && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col h-[80vh]">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                            <div>
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <MessageSquare size={18} className="text-blue-400" /> Chat Transcript
                                </h2>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Room ID: {selectedChatSession}</p>
                            </div>
                            <button onClick={() => setSelectedChatSession(null)} className="text-slate-400 hover:text-white transition p-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                            {chatLoading ? (
                                <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                                    <Loader2 className="animate-spin text-blue-500" /> Loading Transcript...
                                </div>
                            ) : chatMessages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    No messages recorded in this session.
                                </div>
                            ) : (
                                chatMessages.map((msg, i) => {
                                    const isAstro = msg.senderModel === 'Astrologer' || msg.senderRole === 'astrologer';
                                    const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    return (
                                        <div key={i} className={`flex flex-col ${isAstro ? 'items-end' : 'items-start'}`}>
                                            <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-2">
                                                <span className={isAstro ? "text-purple-400 font-bold" : "text-blue-400 font-bold"}>
                                                    {isAstro ? 'Astrologer' : 'User'}
                                                </span>
                                                <span className="text-[9px] text-slate-600">{timeStr}</span>
                                            </div>
                                            <div className={`px-4 py-2 text-sm rounded-2xl max-w-[80%] ${
                                                isAstro 
                                                    ? 'bg-purple-600/20 text-purple-100 border border-purple-500/30 rounded-tr-sm' 
                                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                            }`}>
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
