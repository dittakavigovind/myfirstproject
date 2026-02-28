"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import API from '../../lib/api';
import {
    LayoutDashboard, Users, UserCog, Star, FileText, PenTool, Layers, LogOut,
    TrendingUp, DollarSign, Activity, FileCheck, ShieldAlert, Pencil, Trash2, CheckCircle, Sparkles, Phone, Monitor, Settings, Share2, LayoutGrid, X, Loader2
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast from 'react-hot-toast';
import { SERVER_BASE } from '../../lib/urlHelper';
import { useAdmin } from '../../context/AdminContext';
import BlogManager from '../../components/admin/BlogManager';
import LogoSettings from '../../components/admin/LogoSettings';
import NavigationSettings from '../../components/admin/NavigationSettings';
import PopupManager from '../../components/admin/PopupManager';
import PageDescriptionManager from '../../components/admin/PageDescriptionManager';
import FAQPageManager from '../../components/admin/FAQPageManager';
import ExploreServicesSettings from '../../components/admin/ExploreServicesSettings';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const { fetchAdminStats } = useAdmin();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    // State
    const [stats, setStats] = useState({ users: 0, astrologers: 0, revenue: 0, activeChats: 0 });
    const [userList, setUserList] = useState([]);
    const [allMembers, setAllMembers] = useState([]); // All users for "All Members" tab
    const [astroList, setAstroList] = useState([]);
    const [reqList, setReqList] = useState([]);
    const [managerList, setManagerList] = useState([]);
    const [interactionStats, setInteractionStats] = useState([]);
    const [userInteractions, setUserInteractions] = useState({});
    const [showAstroForm, setShowAstroForm] = useState(false);
    const [editingAstro, setEditingAstro] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null); // State for detailed view modal

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDanger: false,
        confirmText: 'Confirm'
    });

    const openConfirm = (title, message, action, isDanger = false, confirmText = 'Confirm') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: async () => {
                await action();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger,
            confirmText
        });
    };

    useEffect(() => {
        if (!loading) {
            if (!user || !['admin', 'manager'].includes(user.role)) {
                router.push('/dashboard');
            } else {
                fetchData();
            }
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        try {
            if (user.role === 'admin' || user.role === 'manager') {
                try {
                    const statsRes = await API.get('/admin/stats');
                    setStats(statsRes.data);
                } catch (e) { console.error("Stats error", e); }

                try {
                    const usersRes = await API.get('/admin/users');
                    const allUsers = usersRes.data;
                    setAllMembers(allUsers); // Store all
                    setUserList(allUsers.filter(u => u.role === 'user'));
                    setManagerList(allUsers.filter(u => u.role === 'manager'));
                } catch (e) { console.error("Users error", e); }

                try {
                    const astroRes = await API.get('/astro/astrologers?includeInactive=true');
                    if (astroRes.data.success) {
                        setAstroList(astroRes.data.data);
                    }
                } catch (e) { console.error("Astro fetch error", e); }

                try {
                    const reqRes = await API.get('/requests/admin/all');
                    if (reqRes.data.success) {
                        setReqList(reqRes.data.data);
                    }
                } catch (e) { console.error("Requests fetch error", e); }

                try {
                    const kpiRes = await API.get('/analytics/kpis');
                    if (kpiRes.data.success) {
                        setInteractionStats(kpiRes.data.stats);
                    }
                } catch (e) { console.error("KPIs fetch error", e); }

                try {
                    const userMetricsRes = await API.get('/analytics/users-summary');
                    if (userMetricsRes.data.success) {
                        // Transform array to map for easy lookup: { userId: { PANCHANG: { CLICK: 5 }, ... } }
                        const map = {};
                        userMetricsRes.data.metrics.forEach(m => {
                            if (!map[m._id.userId]) map[m._id.userId] = {};
                            if (!map[m._id.userId][m._id.cardType]) map[m._id.userId][m._id.cardType] = {};
                            map[m._id.userId][m._id.cardType][m._id.type] = m.count;
                        });
                        setUserInteractions(map);
                    }
                } catch (e) { console.error("User metrics fetch error", e); }
            }
        } catch (error) {
            console.error("Admin Access Error", error);
        }
    };

    if (loading || !user || !['admin', 'manager'].includes(user.role)) return <div className="p-10 text-center">Checking Privileges...</div>;

    const handleDeleteUser = (id) => {
        openConfirm(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            async () => {
                try {
                    await API.delete(`/admin/users/${id}`);
                    toast.success('User deleted');
                    fetchData();
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to delete user');
                }
            },
            true,
            'Delete User'
        );
    };

    const handleRoleUpdate = (id, newRole) => {
        openConfirm(
            'Update Role',
            `Are you sure you want to change this user's role to ${newRole}?`,
            async () => {
                try {
                    await API.put(`/admin/users/${id}/role`, { role: newRole });
                    toast.success('Role updated');
                    fetchData();
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to update role');
                }
            },
            false,
            'Update Role'
        );
    };

    const handleDeleteAstro = (id) => {
        openConfirm(
            'Delete Astrologer',
            'Are you sure you want to delete this astrologer profile? This will also remove the linked user account.',
            async () => {
                try {
                    await API.delete(`/astro/astrologers/${id}`);
                    toast.success('Astrologer deleted');
                    fetchData();
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to delete astrologer');
                }
            },
            true,
            'Delete Profile'
        );
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await API.put(`/astro/astrologers/${id}`, { isActive: !currentStatus });
            // Optimistic update
            setAstroList(prev => prev.map(a => a._id === id ? { ...a, isActive: !currentStatus } : a));
        } catch (err) {
            console.error("Toggle error", err);
            alert("Failed to update status");
        }
    };

    const handleApprove = (id) => {
        openConfirm(
            'Approve Request',
            'Are you sure you want to approve this request? The user will be promoted to an Astrologer.',
            async () => {
                try {
                    await API.post(`/requests/admin/approve/${id}`);
                    toast.success('Request Approved');
                    setReqList(prev => prev.filter(req => req._id !== id)); // Optimistic update
                    setSelectedRequest(null); // Close detail modal if open
                    fetchData();
                    fetchAdminStats(); // Refresh sidebar badge
                } catch (err) {
                    toast.error('Approval failed');
                }
            },
            false,
            'Approve'
        );
    };

    const handleReject = (id) => {
        openConfirm(
            'Reject Request',
            'Are you sure you want to reject this request?',
            async () => {
                try {
                    await API.post(`/requests/admin/reject/${id}`);
                    toast.success('Request Rejected');
                    setReqList(prev => prev.filter(req => req._id !== id)); // Optimistic update
                    setSelectedRequest(null); // Close detail modal if open
                    fetchData();
                    fetchAdminStats(); // Refresh sidebar badge
                } catch (err) {
                    toast.error('Rejection failed');
                }
            },
            true,
            'Reject'
        );
    };

    const [drilldownModal, setDrilldownModal] = useState({
        isOpen: false, data: [], loading: false, title: '', cardType: '', type: '',
        filters: { startDate: '', endDate: '', action: 'all' }
    });

    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (!loading && user && ['admin', 'manager'].includes(user.role)) {
            fetchActivityLogs();
        }
    }, [user, loading]);

    const fetchActivityLogs = async () => {
        try {
            const res = await API.get('/admin/activity');
            if (res.data.success) {
                setActivities(res.data.logs);
            }
        } catch (e) { console.error(e); }
    };

    // Calculate dynamic stats
    const revenueValue = stats ? stats.revenue : 0;
    const usersCount = stats ? stats.users : 0;
    const astroCount = stats ? stats.astrologers : 0;

    const fetchInteractionDetails = async (cardType = null, type = null, title = null, customFilters = null) => {
        const targetCardType = cardType || drilldownModal.cardType;
        const targetType = type || drilldownModal.type;
        const targetTitle = title || drilldownModal.title;
        let filters = customFilters || drilldownModal.filters;

        // Validation: Ensure end date is not before start date
        if (filters.startDate && filters.endDate && new Date(filters.endDate) < new Date(filters.startDate)) {
            filters = { ...filters, endDate: filters.startDate };
        }

        setDrilldownModal(prev => ({
            ...prev,
            isOpen: true,
            loading: true,
            title: targetTitle,
            cardType: targetCardType,
            type: targetType,
            filters: filters
        }));

        try {
            let url = `/analytics/details?cardType=${targetCardType}&type=${targetType}`;
            if (filters.startDate) url += `&startDate=${filters.startDate}`;
            if (filters.endDate) url += `&endDate=${filters.endDate}`;
            if (filters.action && filters.action !== 'all') url += `&action=${filters.action}`;

            const res = await API.get(url);
            if (res.data.success) {
                setDrilldownModal(prev => ({ ...prev, data: res.data.details, loading: false }));
            }
        } catch (error) {
            console.error('Error fetching interaction details:', error);
            setDrilldownModal(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="w-full p-8 max-w-7xl mx-auto space-y-8">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
                confirmText={confirmModal.confirmText}
            />
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
                    <p className="text-sm text-slate-500">Manage your platform efficiently</p>
                </div>

                {/* Navigation Tabs (Basic implementation for now, relying on URL params or just links) */}
                <div className="flex gap-2">
                    <button onClick={() => router.push('?tab=overview')} className={`px-3 py-1 rounded text-sm ${activeTab === 'overview' ? 'bg-slate-200' : ''}`}>Overview</button>
                    <button onClick={() => router.push('?tab=all-members')} className={`px-3 py-1 rounded text-sm ${activeTab === 'all-members' ? 'bg-slate-200' : ''}`}>Members</button>
                    <button onClick={() => router.push('?tab=astrologers')} className={`px-3 py-1 rounded text-sm ${activeTab === 'astrologers' ? 'bg-slate-200' : ''}`}>Astrologers</button>
                    <button onClick={() => router.push('?tab=activity')} className={`px-3 py-1 rounded text-sm ${activeTab === 'activity' ? 'bg-slate-200 font-bold text-blue-600' : ''}`}>Logs</button>
                    <button onClick={() => router.push('?tab=faqs')} className={`px-3 py-1 rounded text-sm ${activeTab === 'faqs' ? 'bg-slate-200 font-bold text-blue-600' : ''}`}>FAQs</button>
                    <button onClick={() => router.push('?tab=page-descriptions')} className={`px-3 py-1 rounded text-sm ${activeTab === 'page-descriptions' ? 'bg-slate-200 font-bold text-blue-600' : ''}`}>Descriptions</button>
                    {user.role === 'admin' && (
                        <button onClick={() => router.push('?tab=settings')} className={`px-3 py-1 rounded text-sm ${activeTab === 'settings' ? 'bg-slate-200 font-bold text-astro-navy' : ''}`}>Settings</button>
                    )}
                </div>

                <div className="text-right">
                    <p className="font-bold text-slate-700">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                </div>
            </div>

            {activeTab === 'activity' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-700">Astrologer Activity Logs</h2>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="p-4">Astrologer</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activities.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium">
                                        {log.astrologerId?.name || 'Unknown'}
                                        <div className="text-xs text-slate-400">{log.astrologerId?.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {(() => {
                                            const d = new Date(log.timestamp);
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            const year = d.getFullYear();
                                            const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                            return `${day}-${month}-${year}, ${time}`;
                                        })()}
                                    </td>
                                </tr>
                            ))}
                            {activities.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-400">No activity logs found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Existing Tabs ... */}


            {activeTab === 'overview' && (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* User Card */}
                        {user.role === 'admin' ? (
                            <a href="?tab=users" className="block transition hover:-translate-y-1">
                                <StatCard label="Total Users" value={usersCount} icon={Users} color="bg-blue-500" />
                            </a>
                        ) : (
                            <div className="opacity-80 cursor-default">
                                <StatCard label="Total Users" value={usersCount} icon={Users} color="bg-blue-500 grayscale-[0.5]" />
                            </div>
                        )}

                        {/* Astrologer Card */}
                        {user.role === 'admin' ? (
                            <a href="?tab=astrologers" className="block transition hover:-translate-y-1">
                                <StatCard label="Astrologers" value={astroCount} icon={Star} color="bg-purple-500" />
                            </a>
                        ) : (
                            <div className="opacity-80 cursor-default">
                                <StatCard label="Astrologers" value={astroCount} icon={Star} color="bg-purple-500 grayscale-[0.5]" />
                            </div>
                        )}

                        {/* Requests Card */}
                        {['admin', 'manager'].includes(user.role) ? (
                            <a href="?tab=requests" className="block transition hover:-translate-y-1">
                                <StatCard label="Pending Requests" value={reqList.length} icon={FileCheck} color="bg-pink-500" />
                            </a>
                        ) : (
                            <div className="opacity-80 cursor-default">
                                <StatCard label="Pending Requests" value={reqList.length} icon={FileCheck} color="bg-pink-500 grayscale-[0.5]" />
                            </div>
                        )}

                        {/* Managers Card */}
                        {user.role === 'admin' ? (
                            <a href="?tab=managers" className="block transition hover:-translate-y-1">
                                <StatCard label="Managers" value={managerList.length} icon={UserCog} color="bg-orange-500" />
                            </a>
                        ) : (
                            <div className="opacity-80 cursor-default">
                                <StatCard label="Managers" value={managerList.length} icon={UserCog} color="bg-orange-500 grayscale-[0.5]" />
                            </div>
                        )}

                        <div className="block cursor-pointer transition hover:-translate-y-1" onClick={() => router.push('/admin/blog')}>
                            <StatCard label="Content" value="Manage" icon={FileText} color="bg-indigo-500" />
                        </div>

                        <div className="block cursor-pointer transition hover:-translate-y-1" onClick={() => router.push('/admin/horoscope')}>
                            <StatCard label="Horoscope" value="Update" icon={Sparkles} color="bg-rose-500" />
                        </div>
                    </div>

                    {/* Online Pooja Section */}
                    {['admin', 'manager'].includes(user.role) && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-astro-navy flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-astro-yellow rounded-full"></div>
                                Online Pooja Management
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div
                                    onClick={() => router.push('/admin/online-pooja/temples')}
                                    className="group bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-astro-yellow hover:shadow-xl transition-all duration-300 cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">🛕</span>
                                    </div>
                                    <h3 className="text-lg font-black text-astro-navy mb-2">Temple Management</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Add, edit and manage temples and their available sevas.</p>
                                </div>

                                <div
                                    onClick={() => router.push('/admin/online-pooja/bookings')}
                                    className="group bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-astro-yellow hover:shadow-xl transition-all duration-300 cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">📜</span>
                                    </div>
                                    <h3 className="text-lg font-black text-astro-navy mb-2">Pooja Bookings</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Track bookings, verify payments and export devotee lists.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Real-time Interaction KPIs */}
                    <div className="space-y-4">
                        <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" />
                            Card Interaction Analytics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                icon={Monitor}
                                label="Panchang Card Views"
                                value={interactionStats?.find(s => s._id.cardType === 'PANCHANG' && s._id.type === 'VIEW')?.count || 0}
                                color="bg-emerald-500"
                                onClick={() => fetchInteractionDetails('PANCHANG', 'VIEW', 'Panchang Card Views')}
                            />
                            <StatCard
                                icon={Share2}
                                label="Panchang Shares"
                                value={interactionStats?.find(s => s._id.cardType === 'PANCHANG' && s._id.type === 'SHARE')?.count || 0}
                                color="bg-amber-500"
                                onClick={() => fetchInteractionDetails('PANCHANG', 'SHARE', 'Panchang Shares')}
                            />
                            <StatCard
                                icon={LayoutGrid}
                                label="Calendar Clicks"
                                value={interactionStats?.find(s => s._id.cardType === 'CALENDAR' && s._id.type === 'CLICK')?.count || 0}
                                color="bg-indigo-500"
                                onClick={() => fetchInteractionDetails('CALENDAR', 'CLICK', 'Calendar Clicks')}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* All Members Tab */}
            {activeTab === 'all-members' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-700">All Portal Members</h2>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Total: {allMembers.length}</span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email / Phone</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Interactions</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allMembers.length > 0 ? allMembers.map(u => (
                                <tr key={u._id} onClick={() => router.push(`/admin/users/details?username=${u.username || u._id}`)} className="hover:bg-slate-50/50 transition group cursor-pointer">
                                    <td className="p-4 font-medium text-slate-700">{u.name}</td>
                                    <td className="p-4 text-slate-500">
                                        {u.email || (
                                            <span className="text-green-600 font-medium flex items-center gap-1">
                                                <Phone size={12} /> {u.phone}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            u.role === 'manager' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                u.role === 'astrologer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400">
                                        {(() => {
                                            const d = new Date(u.createdAt);
                                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-[10px]">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="font-bold w-12 text-slate-400 uppercase tracking-tighter">Panchang:</span>
                                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100" title="Views">{userInteractions[u._id]?.PANCHANG?.VIEW || 0}V</span>
                                                <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100" title="Shares">{userInteractions[u._id]?.PANCHANG?.SHARE || 0}S</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="font-bold w-12 text-slate-400 uppercase tracking-tighter">Calendar:</span>
                                                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100" title="Clicks">{userInteractions[u._id]?.CALENDAR?.CLICK || 0}C</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'admin' && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }} className="text-red-500 hover:text-red-700 transition" title="Delete User"><Trash2 size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">No members found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email / Phone</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Interactions</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {userList.map(u => (
                                <tr key={u._id} onClick={() => router.push(`/admin/users/details?username=${u.username || u._id}`)} className="hover:bg-slate-50/50 transition cursor-pointer group">
                                    <td className="p-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                            {u.profileImage ? (
                                                <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400">{u.name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {u.email || (
                                            <span className="text-green-600 font-medium flex items-center gap-1">
                                                <Phone size={12} /> {u.phone}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">User</span>
                                    </td>
                                    <td className="p-4 text-slate-400">
                                        {(() => {
                                            const d = new Date(u.createdAt);
                                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-[10px]">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="font-bold w-12 text-slate-400 uppercase tracking-tighter">Panchang:</span>
                                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100" title="Views">{userInteractions[u._id]?.PANCHANG?.VIEW || 0}V</span>
                                                <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100" title="Shares">{userInteractions[u._id]?.PANCHANG?.SHARE || 0}S</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="font-bold w-12 text-slate-400 uppercase tracking-tighter">Calendar:</span>
                                                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100" title="Clicks">{userInteractions[u._id]?.CALENDAR?.CLICK || 0}C</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded transition">
                                                <LogOut size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'content' && (
                <BlogManager />
            )}

            {activeTab === 'managers' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email / Phone</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Interactions</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {managerList.map(u => (
                                <tr key={u._id} onClick={() => router.push(`/admin/users/details?username=${u.username || u._id}`)} className="hover:bg-slate-50/50 transition cursor-pointer group">
                                    <td className="p-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{u.name}</td>
                                    <td className="p-4 text-slate-500">
                                        {u.email || (
                                            <span className="text-green-600 font-medium flex items-center gap-1">
                                                <Phone size={12} /> {u.phone}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded text-xs font-bold">Manager</span>
                                    </td>
                                    <td className="p-4 text-slate-400">
                                        {(() => {
                                            const d = new Date(u.createdAt);
                                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-[10px]">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="font-bold w-12 text-slate-400 uppercase tracking-tighter">Panchang:</span>
                                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100" title="Views">{userInteractions[u._id]?.PANCHANG?.VIEW || 0}V</span>
                                                <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100" title="Shares">{userInteractions[u._id]?.PANCHANG?.SHARE || 0}S</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="font-bold w-12 text-slate-400 uppercase tracking-tighter">Calendar:</span>
                                                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100" title="Clicks">{userInteractions[u._id]?.CALENDAR?.CLICK || 0}C</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            disabled={user.role !== 'admin'}
                                            value={u.role}
                                            onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                            className={`px-2 py-1.5 rounded text-xs border border-slate-200 cursor-pointer bg-white text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 ${user.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="user">Demote to User</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Promote to Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {managerList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">No managers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {reqList.length === 0 ? <div className="p-8 text-center text-slate-500">No pending requests</div> : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Skills</th>
                                    <th className="p-4">Exp</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reqList.map(req => (
                                    <tr key={req._id} onClick={() => setSelectedRequest(req)} className="hover:bg-slate-50/50 transition cursor-pointer group">
                                        <td className="p-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{req.name}</td>
                                        <td className="p-4 text-slate-500">{req.email}</td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">{req.skills.join(', ')}</td>
                                        <td className="p-4 text-slate-600">{req.experience}y</td>
                                        <td className="p-4 flex gap-2">
                                            {['admin', 'manager'].includes(user.role) ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleApprove(req._id); }} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100 transition shadow-sm">Approve</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleReject(req._id); }} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition shadow-sm">Reject</button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Read Only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Request Details Modal */}
                    {selectedRequest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}>
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-lg font-bold text-slate-800">Application Details</h3>
                                    <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
                                        <LogOut size={18} className="rotate-180" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Header Info */}
                                    <div className="flex gap-6 items-start">
                                        <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                                            {selectedRequest.image ? (
                                                <img src={selectedRequest.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                                                    {selectedRequest.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedRequest.name}</h2>
                                            <div className="space-y-1 text-sm text-slate-500">
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-700">Email:</span> {selectedRequest.email}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-700">Phone:</span> {selectedRequest.phone || 'N/A'}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-700">Experience:</span> {selectedRequest.experience} Years
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills & Langs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedRequest.skills.map(s => (
                                                    <span key={s} className="bg-white text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-blue-100">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3">Languages</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedRequest.languages.map(l => (
                                                    <span key={l} className="bg-white text-purple-600 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border border-purple-100">{l}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-2">About / Bio</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {selectedRequest.bio || "No description provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Unique ID for debugging/reference */}
                                <div className="px-8 pb-2 text-[10px] text-slate-300 font-mono">
                                    Request ID: {selectedRequest._id}
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        onClick={() => handleReject(selectedRequest._id)}
                                        className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition"
                                    >
                                        Reject Application
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedRequest._id)}
                                        className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-md shadow-green-200 transition"
                                    >
                                        Approve & Promote
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'astrologers' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="font-bold text-xl text-slate-800">Astrologers Directory</h2>
                            <p className="text-sm text-slate-500">Manage expert profiles</p>
                        </div>
                        {user.role === 'admin' && (
                            <button
                                onClick={() => {
                                    if (showAstroForm || editingAstro) {
                                        setShowAstroForm(false);
                                        setEditingAstro(null);
                                    } else {
                                        setShowAstroForm(true);
                                    }
                                }}
                                className="bg-astro-navy text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md hover:bg-slate-800 transition flex items-center gap-2"
                            >
                                {showAstroForm || editingAstro ? <><LogOut size={16} /> Cancel</> : <><PenTool size={16} /> Add Astrologer</>}
                            </button>
                        )}
                    </div>

                    {(showAstroForm || editingAstro) && (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-8">
                            <h3 className="font-bold text-xl text-slate-800 mb-6 border-b border-slate-100 pb-4">{editingAstro ? 'Edit Astrologer Profile' : 'Add New Astrologer'}</h3>
                            <AddAstrologerForm
                                initialData={editingAstro}
                                onSuccess={() => {
                                    setShowAstroForm(false);
                                    setEditingAstro(null);
                                    fetchData();
                                }}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {astroList.map(a => (
                            <div
                                key={a._id}
                                onClick={() => router.push(`/admin/astrologer/${a.slug || a._id}`)}
                                className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 p-4 flex gap-4 items-start group cursor-pointer"
                            >
                                {/* Left: Image & Stats */}
                                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-orange-500">
                                            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                                                <img
                                                    src={a.image || `https://ui-avatars.com/api/?name=${a.displayName}`}
                                                    alt={a.displayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        {/* Status Dot */}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full z-10 ${a.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < Math.floor(a.rating) ? "currentColor" : "none"} className={i < Math.floor(a.rating) ? "" : "text-slate-200"} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                        {a.reviewCount || 0} orders
                                    </div>
                                </div>

                                {/* Middle: Info */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm truncate">{a.displayName}</h3>
                                            <CheckCircle size={14} className="text-green-500 fill-green-50 flex-shrink-0" />
                                        </div>
                                        {/* Toggle Active Switch */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <label className="relative inline-flex items-center cursor-pointer scale-75">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={a.isActive !== false}
                                                    onChange={() => handleToggleActive(a._id, a.isActive !== false)}
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-0.5 text-xs text-slate-500">
                                        <p className="truncate block" title={a.skills.join(', ')}>{a.skills.slice(0, 2).join(', ')}{a.skills.length > 2 && '...'}</p>
                                        <p className="truncate block" title={a.languages.join(', ')}>{a.languages.slice(0, 2).join(', ')}</p>
                                        <p className="font-medium mt-1">Exp: {a.experienceYears} Years</p>
                                        <p className="font-bold text-slate-900">
                                            ₹{a.charges?.chatPerMinute}<span className="text-slate-400 font-normal">/min</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Admin Actions */}
                                {user.role === 'admin' && (
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingAstro(a); }}
                                            className="border border-blue-500 text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAstro(a._id); }}
                                            className="border border-red-500 text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )
            }

            {activeTab === 'logo-settings' && user.role === 'admin' && (
                <LogoSettings />
            )}

            {activeTab === 'nav-badges' && user.role === 'admin' && (
                <NavigationSettings />
            )}

            {activeTab === 'explore-services' && user.role === 'admin' && (
                <ExploreServicesSettings />
            )}

            {activeTab === 'popups' && (
                <PopupManager />
            )}

            {activeTab === 'faqs' && (
                <FAQPageManager />
            )}

            {activeTab === 'page-descriptions' && (
                <PageDescriptionManager />
            )}

            {activeTab === 'settings' && user.role === 'admin' && (
                <div className="space-y-8">
                    <LogoSettings />
                    <NavigationSettings />
                </div>
            )}

            <InteractionDetailModal
                isOpen={drilldownModal.isOpen}
                onClose={() => setDrilldownModal(prev => ({ ...prev, isOpen: false }))}
                data={drilldownModal.data}
                loading={drilldownModal.loading}
                title={drilldownModal.title}
                filters={drilldownModal.filters}
                onFilterChange={(newFilters) => fetchInteractionDetails(null, null, null, newFilters)}
            />
        </div >
    );
}

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200 transition-all active:scale-[0.98]' : ''}`}
    >
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const InteractionDetailModal = ({ isOpen, onClose, data, loading, title, filters, onFilterChange }) => {
    if (!isOpen) return null;

    // Extract unique actions from data for the filter dropdown
    const availableActions = ['all', ...new Set(data.flatMap(item => item.actions || []))];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" /> {title} Details
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={filters.startDate}
                            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">End Date</label>
                        <input
                            type="date"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={filters.endDate}
                            min={filters.startDate}
                            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Action Type</label>
                        <select
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={filters.action}
                            onChange={(e) => onFilterChange({ ...filters, action: e.target.value })}
                        >
                            <option value="all">All Actions</option>
                            <option value="whatsapp_share">WhatsApp Share</option>
                            <option value="instagram_share">Instagram Share</option>
                            <option value="download_image">Download Image</option>
                            <option value="copy_to_clipboard">Copy Link</option>
                            <option value="modal_open">Modal Open</option>
                            <option value="load_results">Page Load</option>
                        </select>
                    </div>
                    <button
                        onClick={() => onFilterChange({ startDate: '', endDate: '', action: 'all' })}
                        className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Reset
                    </button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 size={32} className="text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Loading interaction logs...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No interaction logs found for this selection.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Daily Count</th>
                                        <th className="px-4 py-3">Actions</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3">
                                                {item.userId ? (
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{item.userId.name}</p>
                                                        <p className="text-xs text-slate-500">{item.userId.email}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-slate-600 font-medium">Guest (Anonymous)</p>
                                                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{item.guestId}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                    {item.count} interaction{item.count > 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.actions.map((act, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-slate-200 text-slate-500">
                                                            {act.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 tabular-nums">
                                                {new Date(item.date).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <p className="text-xs text-slate-400 italic">Showing up to 100 grouped records</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

function AddAstrologerForm({ onSuccess, initialData }) {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        displayName: '', bio: '', image: '', skills: '', languages: '', rating: '4.5', experienceYears: '5',
        chatCharge: '15', callCharge: '15', videoCharge: '15'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: '', email: '', password: '',
                displayName: initialData.displayName || '',
                bio: initialData.bio || '',
                image: initialData.image || '',
                skills: initialData.skills ? initialData.skills.join(', ') : '',
                languages: initialData.languages ? initialData.languages.join(', ') : '',
                rating: initialData.rating || '4.5',
                experienceYears: initialData.experienceYears || '5',
                chatCharge: initialData.charges?.chatPerMinute || '15',
                callCharge: initialData.charges?.callPerMinute || '15',
                videoCharge: initialData.charges?.videoPerMinute || '15'
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation: Charges cannot be less than 15 if enabled (greater than 0)
        const chatC = parseFloat(formData.chatCharge) || 0;
        const callC = parseFloat(formData.callCharge) || 0;
        const videoC = parseFloat(formData.videoCharge) || 0;

        if (chatC > 0 && chatC < 15) {
            alert('Chat Charge cannot be less than ₹15');
            setLoading(false);
            return;
        }
        if (callC > 0 && callC < 15) {
            alert('Voice Call Charge cannot be less than ₹15');
            setLoading(false);
            return;
        }
        if (videoC > 0 && videoC < 15) {
            alert('Video Call Charge cannot be less than ₹15');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...(!initialData && {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
                displayName: formData.displayName,
                image: formData.image,
                bio: formData.bio,
                skills: formData.skills.split(',').map(s => s.trim()),
                languages: formData.languages.split(',').map(s => s.trim()),
                rating: parseFloat(formData.rating),
                experienceYears: parseInt(formData.experienceYears),
                charges: {
                    chatPerMinute: chatC,
                    callPerMinute: callC,
                    videoPerMinute: videoC
                }
            };

            if (initialData) {
                await API.put(`/astro/astrologers/${initialData._id}`, payload);
                alert('Astrologer Updated Successfully!');
            } else {
                await API.post('/astro/astrologers', payload);
                alert('Astrologer Added Successfully!');
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to save astrologer: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setLoading(true);
            const res = await API.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                let fullUrl = res.data.filePath;
                if (!fullUrl.startsWith('http')) {
                    fullUrl = SERVER_BASE + fullUrl;
                }
                setFormData(prev => ({ ...prev, image: fullUrl }));
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Image upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto">
            <Section title="Account Information">
                {!initialData && (
                    <>
                        <InputGroup label="Full Name" name="name" value={formData.name} placeholder="John Doe" onChange={handleChange} required />
                        <InputGroup label="Email ID" name="email" value={formData.email} type="email" placeholder="john@example.com" onChange={handleChange} required />
                        <InputGroup label="Password" name="password" value={formData.password} type="password" placeholder="••••••••" onChange={handleChange} required />
                    </>
                )}
                {initialData && <div className="md:col-span-2 text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">Account credentials (email/password) cannot be changed here. Contact support for resets.</div>}
            </Section>

            <Section title="Professional Profile">
                <InputGroup label="Display Name" name="displayName" value={formData.displayName} placeholder="e.g. Astro Raj" onChange={handleChange} required />
                <InputGroup label="Experience (Years)" name="experienceYears" value={formData.experienceYears} type="number" placeholder="e.g. 5" onChange={handleChange} required />

                <div className="md:col-span-2">
                    <InputGroup label="Skills (Comma separate)" name="skills" value={formData.skills} placeholder="Vedic, Tarot, Numerology..." onChange={handleChange} required />
                </div>
                <div className="md:col-span-2">
                    <InputGroup label="Languages (Comma separate)" name="languages" value={formData.languages} placeholder="Hindi, English, Telugu..." onChange={handleChange} required />
                </div>

                <InputGroup label="Rating (0-5)" name="rating" value={formData.rating} type="number" step="0.1" max="5" placeholder="4.5" onChange={handleChange} required />

                {/* Pricing Fields */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputGroup label="Chat Charge (Min ₹15)" name="chatCharge" value={formData.chatCharge} type="number" placeholder="Min 15" onChange={handleChange} required />
                    <InputGroup label="Voice Call (Min ₹15)" name="callCharge" value={formData.callCharge} type="number" placeholder="Min 15" onChange={handleChange} />
                    <InputGroup label="Video Call (Min ₹15)" name="videoCharge" value={formData.videoCharge} type="number" placeholder="Min 15" onChange={handleChange} />
                </div>
            </Section>

            <Section title="Profile Media & Bio">
                <div className="md:col-span-2 mb-4">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Profile Photo <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-6 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                        <div className="relative group cursor-pointer w-20 h-20 flex-shrink-0">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="w-full h-full rounded-full object-cover shadow-sm border border-slate-200" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                    <PenTool size={24} />
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <div className="flex-1">
                            <h5 className="font-medium text-slate-700 mb-1">Upload Photo</h5>
                            <p className="text-xs text-slate-400">Allowed *.jpeg, *.jpg, *.png, *.webp</p>
                            <label className="mt-3 inline-block bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-50 shadow-sm transition">
                                Choose File
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Description / Bio <span className="text-red-500">*</span></label>
                    <textarea required name="bio" value={formData.bio} placeholder="Write a professional description..." onChange={handleChange} className="w-full border border-slate-200 bg-slate-50/50 p-4 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-200 transition-all shadow-sm h-32 resize-none"></textarea>
                </div>
            </Section>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="submit" disabled={loading} className="bg-astro-navy text-white px-8 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold shadow-md shadow-blue-900/10 flex items-center gap-2">
                    {loading ? <Activity className="animate-spin" size={18} /> : <FileCheck size={18} />}
                    {loading ? 'Saving...' : (initialData ? 'Update Profile' : 'Create Profile')}
                </button>
            </div>
        </form>
    );
}

const Section = ({ title, children }) => (
    <div className="mb-8">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
);

const InputGroup = ({ label, required, ...props }) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{label} {required && <span className="text-red-500">*</span>}</label>
        <input {...props} required={required} className="w-full border border-slate-200 bg-slate-50/50 p-3 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-200 transition-all shadow-sm placeholder:text-slate-300" />
    </div>
);
