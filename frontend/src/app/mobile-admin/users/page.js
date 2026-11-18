"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Users, Shield, Ban, CheckCircle, Search, Save, Loader2, Smartphone, Globe } from 'lucide-react';

export default function MobileUsersDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [osFilter, setOsFilter] = useState('All');
    const [platformFilter, setPlatformFilter] = useState('All');

    const getImageUrl = (path, gender = null) => {
        if (!path || path.includes('default-avatar.png')) {
            return gender === 'female' ? "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        }
        if (path.startsWith("http")) return path.replace('localhost:5000', '192.168.29.133:5000');
        const normalizedPath = path.replace(/\\/g, "/");
        return `http://192.168.29.133:5000${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else if (res.data.data) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users for RBAC mapping");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user role");
        }
    };

    const handleToggleBlock = async (userId, currentStatus) => {
        try {
            await API.put(`/admin/users/${userId}/toggle-block`);
            toast.success(currentStatus ? "User Unblocked" : "User Blocked");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to sequence block action");
        }
    };

    const filteredUsers = users.filter(u => {
        const searchLower = search.toLowerCase();
        const countryName = u.deviceInfo?.location?.country ? new Intl.DisplayNames(['en'], { type: 'region' }).of(u.deviceInfo.location.country).toLowerCase() : '';
        
        const matchesSearch = (u.name || '').toLowerCase().includes(searchLower) || 
            (u.email || '').toLowerCase().includes(searchLower) ||
            (u.phone || '').includes(search) ||
            (u.mobileNumber || '').includes(search) ||
            (u.firstLoginPlatform || '').toLowerCase().includes(searchLower) ||
            (u.deviceInfo?.os || '').toLowerCase().includes(searchLower) ||
            (u.deviceInfo?.deviceMake || '').toLowerCase().includes(searchLower) ||
            (u.deviceInfo?.deviceModel || '').toLowerCase().includes(searchLower) ||
            (u.deviceInfo?.location?.city || '').toLowerCase().includes(searchLower) ||
            countryName.includes(searchLower);
        
        const userOs = u.deviceInfo?.os || 'Unknown';
        const matchesOs = osFilter === 'All' || userOs === osFilter;
        const matchesPlatform = platformFilter === 'All' || (u.firstLoginPlatform || 'Website') === platformFilter;
        
        return matchesSearch && matchesOs && matchesPlatform;
    });

    const uniqueOS = ['All', ...new Set(users.map(u => u.deviceInfo?.os || 'Unknown'))];

    if (loading) return <div className="flex items-center gap-3 text-slate-400"><Loader2 className="animate-spin" /> Fetching Master Roster...</div>;

    const roleOptions = ['user', 'astrologer', 'manager', 'admin', 'finance_admin', 'support_admin', 'super_admin'];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-blue-500" /> Identity & RBAC Engine
                    </h1>
                    <p className="text-slate-400 mt-2">Manage strict Role-Based Access Controls and explicitly block abusive users.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search name, phone, platform..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition text-sm"
                        />
                    </div>
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition text-xs font-semibold"
                        title="Filter by First Login Platform"
                    >
                        <option value="All">All Platforms</option>
                        <option value="APP">📱 App Only</option>
                        <option value="Website">🌐 Website Only</option>
                    </select>
                    <select
                        value={osFilter}
                        onChange={(e) => setOsFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition text-xs font-semibold"
                        title="Filter by OS"
                    >
                        {uniqueOS.map(os => (
                            <option key={os} value={os}>{os}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Live Search Results Counter Bar */}
            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800 px-4 py-3 rounded-xl shadow-inner">
                <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-slate-400 font-medium">Search Results:</span>
                    <span className="bg-blue-500/20 text-blue-400 font-bold px-2.5 py-1 rounded-md border border-blue-500/30">
                        {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} found
                    </span>
                    {(search || platformFilter !== 'All' || osFilter !== 'All') && (
                        <span className="text-slate-500 text-[11px]">
                            (filtered from {users.length} total)
                        </span>
                    )}
                </div>
                {(search || platformFilter !== 'All' || osFilter !== 'All') && (
                    <button
                        onClick={() => { setSearch(''); setPlatformFilter('All'); setOsFilter('All'); }}
                        className="text-xs text-blue-400 hover:text-blue-300 underline font-medium transition cursor-pointer"
                    >
                        Reset filters
                    </button>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Contact Logic</th>
                                <th className="px-6 py-4">Device Info</th>
                                <th className="px-6 py-4">Wallet Bal.</th>
                                <th className="px-6 py-4">RBAC Role Assignment</th>
                                <th className="px-6 py-4 text-right">Moderation Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-800/50 transition duration-150">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img src={getImageUrl(user.profileImage, user.gender)} alt="PFP" className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                                            <div>
                                                <div className="font-bold text-white capitalize">{user.name || 'Anonymous User'}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5" title={user._id}>ID: {...user._id.substring(user._id.length-6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-blue-400 font-medium truncate max-w-[150px]">{user.email || 'No Email'}</div>
                                        <div className="text-xs text-slate-500 mt-1">{user.phone || 'No Phone'}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                                {(user.firstLoginPlatform || 'Website') === 'APP' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm" title="First Login: Mobile App">
                                                        <Smartphone size={11} /> APP
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm" title="First Login: Website">
                                                        <Globe size={11} /> Website
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-slate-300">{user.deviceInfo?.os || 'Unknown OS'}</span>
                                            </div>
                                            {user.deviceInfo ? (
                                                <>
                                                    <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">{user.deviceInfo.deviceMake ? `${user.deviceInfo.deviceMake} ` : ''}{user.deviceInfo.deviceModel || '-'}</div>
                                                    <div className="text-[10px] text-slate-600 mt-0.5 flex justify-between">
                                                        <span>v{user.deviceInfo.appVersion || '-'}</span>
                                                    </div>
                                                    {user.deviceInfo.location && (
                                                        <div className="text-[10px] text-emerald-500 mt-1 truncate max-w-[150px] font-medium" title={user.deviceInfo.location.ip}>
                                                            📍 {(() => {
                                                                const loc = user.deviceInfo.location;
                                                                if (loc.ip === '127.0.0.1') return 'Local';
                                                                const countryName = loc.country ? new Intl.DisplayNames(['en'], { type: 'region' }).of(loc.country) : '';
                                                                return [loc.city, countryName].filter(Boolean).join(', ') || loc.ip;
                                                            })()}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-slate-600">No hardware info</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-emerald-400 font-bold">₹ {user.walletBalance || 0}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className={`bg-slate-950 border text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 transition-colors uppercase tracking-wider ${
                                                user.role.includes('admin') ? 'border-purple-500/50 text-purple-400' : 
                                                user.role === 'astrologer' ? 'border-orange-500/50 text-orange-400' :
                                                'border-slate-700 text-slate-300'
                                            }`}
                                        >
                                            {roleOptions.map(r => (
                                                <option key={r} value={r} className="bg-slate-900 text-slate-300">{r.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {user.isBlocked ? (
                                            <button 
                                                onClick={() => handleToggleBlock(user._id, true)}
                                                className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-500/20"
                                            >
                                                <Ban size={14} /> Unblock
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleToggleBlock(user._id, false)}
                                                className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-slate-700"
                                            >
                                                <CheckCircle size={14} className="text-emerald-500" /> Active
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        {search ? `No users found matching "${search}" (0 results).` : 'No users found matching filter criteria.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
