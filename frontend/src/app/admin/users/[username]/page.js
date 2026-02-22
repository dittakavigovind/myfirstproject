"use client";

import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Shield, Trash2, Save, User as UserIcon, CheckCircle, AlertCircle, Sparkles, Phone } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDetails() {
    const { username } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/');
        } else if (user && user.role === 'admin') {
            fetchUser();
        }
    }, [user, username]);

    const fetchUser = async () => {
        try {
            console.log("Fetching user details for:", username);
            const res = await API.get(`/admin/users/${username}`);
            if (res.data) {
                setUserData(res.data);
                setRole(res.data.role);
            }
        } catch (err) {
            console.error("Fetch User Error:", err);
            // Only alert if it's NOT a 404 (Not Found)
            if (err.response && err.response.status !== 404) {
                alert('Failed to fetch user details: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async () => {
        setUpdating(true);
        try {
            await API.put(`/admin/users/${username}/role`, { role });
            alert('Role updated successfully');
            fetchUser();
        } catch (err) {
            alert('Failed to update role');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this user?')) return;
        try {
            await API.delete(`/admin/users/${username}`);
            alert('User deleted');
            router.push('/admin?tab=users');
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 border-4 border-astro-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading profile...</p>
        </div>
    );

    if (!userData) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">User Not Found</h2>
            <Link href="/admin?tab=users" className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">
                Return to Users
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">

            {/* Premium Header Background (Matches Panchang) */}
            <div className="relative text-white h-[400px]">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[4rem] z-0 overflow-hidden">
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                {/* Header Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col pt-12">
                    <Link href="/admin?tab=users" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors group mb-8 w-fit">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all backdrop-blur-md">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-bold tracking-wide">Back to Users</span>
                    </Link>

                    <div className="text-center md:text-left md:pl-4">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-astro-yellow text-xs font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-lg">
                            Admin Control
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
                            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300">Profile</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content Card - Floating Overlap */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/10 border border-white/50 overflow-hidden backdrop-blur-xl">
                    <div className="p-8 md:p-12">
                        {/* Profile Identity Section */}
                        <div className="flex flex-col md:flex-row gap-10 items-start border-b border-slate-100 pb-10 mb-10">
                            <div className="relative group mx-auto md:mx-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <div className="w-40 h-40 rounded-[2rem] bg-white p-2 shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-105">
                                    {userData.profileImage || userData.astrologerProfile?.image ? (
                                        <img
                                            src={userData.profileImage || userData.astrologerProfile?.image}
                                            alt={userData.name}
                                            className="w-full h-full object-cover rounded-[1.5rem]"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-300">
                                            <UserIcon size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute -bottom-4 -right-4 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5 z-20 border-[4px] border-white transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 ${userData.role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                                    userData.role === 'astrologer' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                        'bg-slate-600'
                                    }`}>
                                    {userData.role === 'astrologer' && <Sparkles size={12} fill="currentColor" />}
                                    {userData.role}
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4 pt-4">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">{userData.astrologerProfile?.displayName || userData.name}</h2>
                                    <div className="flex flex-col gap-2 items-center md:items-start">
                                        {userData.email && (
                                            <p className="text-lg text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 bg-slate-50 w-fit px-4 py-1.5 rounded-full mx-auto md:mx-0 border border-slate-100">
                                                <Mail size={16} className="text-indigo-500" /> {userData.email}
                                            </p>
                                        )}
                                        {userData.phone && (
                                            <p className="text-lg text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 bg-slate-50 w-fit px-4 py-1.5 rounded-full mx-auto md:mx-0 border border-slate-100">
                                                <Phone size={16} className="text-green-500" /> {userData.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 border border-blue-100 shadow-sm">
                                        <Calendar size={18} className="text-blue-500" />
                                        Joined {new Date(userData.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </div>

                                    <button
                                        onClick={handleDelete}
                                        className="px-6 py-2.5 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border border-red-100 hover:border-red-200 shadow-sm hover:shadow-md"
                                    >
                                        <Trash2 size={18} />
                                        <span>Delete Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Management Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Role Manager */}
                            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 rounded-[2.5rem] p-8 border border-white shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>

                                <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Shield size={20} fill="currentColor" className="opacity-20 absolute" />
                                        <Shield size={20} />
                                    </div>
                                    Access Control
                                </h3>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Current Role</label>
                                        <div className="flex gap-3 mb-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
                                            {['user', 'astrologer', 'manager', 'admin'].map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setRole(r)}
                                                    className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-300 relative overflow-hidden ${role === r
                                                        ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-900/5 transform scale-[1.02]'
                                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                        }`}
                                                >
                                                    {role === r && (
                                                        <motion.div
                                                            layoutId="activeRole"
                                                            className="absolute inset-0 border-2 border-indigo-100 rounded-xl"
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}
                                                    <span className="relative z-10">{r}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="overflow-hidden">
                                        <AnimatePresence>
                                            {role !== userData.role && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 text-orange-800 mb-4"
                                                >
                                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm font-medium leading-relaxed">
                                                        Confirm change from <span className="font-bold border-b border-orange-300">{userData.role}</span> to <span className="font-bold border-b border-orange-300">{role}</span>? This may affect user permissions.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <motion.button
                                        layout
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        onClick={handleRoleUpdate}
                                        disabled={role === userData.role || updating}
                                        className="w-full py-4 bg-astro-navy text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:shadow-none disabled:transform-none transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                                        {updating ? (
                                            <span className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Update Role
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Additional Info / Security Log Placeholder */}
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 group">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <Sparkles className="text-amber-500" size={24} />
                                    Data Insights
                                </h3>

                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Astrologer Profile</p>
                                            <p className="font-bold text-slate-700">{userData.astrologerProfile ? 'Active' : 'Not Setup'}</p>
                                        </div>
                                        {userData.astrologerProfile && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Login</p>
                                            <p className="font-bold text-slate-700">
                                                {userData.lastLogin
                                                    ? new Date(userData.lastLogin).toLocaleString(undefined, {
                                                        weekday: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : 'Never'}
                                            </p>
                                        </div>
                                        <div className="text-slate-300"><UserIcon size={16} /></div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                                            <p className="font-bold text-slate-700">{userData.totalOrders || 0}</p>
                                        </div>
                                        <div className="text-slate-300"><CheckCircle size={16} /></div>
                                    </div>
                                </div>
                            </div>
                            {/* Activity Stats (For Astrologers) */}
                            {userData.role === 'astrologer' && (
                                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 group mt-10 lg:mt-0 lg:col-span-2">
                                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                        <Sparkles className="text-blue-500" size={24} />
                                        Activity Performance (Lifetime)
                                    </h3>

                                    {/* Ideally we fetch real aggregate stats here. For now using what's available or placeholders if API not ready for lifetime */}
                                    {/* We can use the ActivityReport API to get data for this astrologer */}
                                    <ActivityPerformanceWrapper astrologerId={userData.astrologerProfile?._id} />
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityPerformanceWrapper({ astrologerId }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!astrologerId) return;

        const fetchStats = async () => {
            try {
                // Fetch report for ALL time
                const { data } = await API.get(`/activity/reports/admin?astrologerId=${astrologerId}`);
                if (data.success && data.data) {
                    // Aggregate client-side for "Lifetime" or "Total" view
                    const total = data.data.reduce((acc, curr) => ({
                        online: acc.online + (curr.onlineDurationMinutes || 0),
                        voice: acc.voice + (curr.totalVoiceMinutes || 0),
                        video: acc.video + (curr.totalVideoMinutes || 0),
                        chat: acc.chat + (curr.totalChatMinutes || 0),
                        calls: acc.calls + (curr.totalCallsCount || 0),
                        earnings: acc.earnings + (curr.totalNetEarnings || 0)
                    }), { online: 0, voice: 0, video: 0, chat: 0, calls: 0, earnings: 0 });
                    setStats(total);
                }
            } catch (e) {
                console.error("Failed to fetch activity stats", e);
            }
        };
        fetchStats();
    }, [astrologerId]);

    if (!stats) return <div className="text-slate-400 text-sm">Loading activity data...</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatBox label="Online Hours" value={(stats.online / 60).toFixed(1)} />
            <StatBox label="Voice Mins" value={stats.voice} />
            <StatBox label="Video Mins" value={stats.video} />
            <StatBox label="Chat Mins" value={stats.chat} />
            <StatBox label="Total Calls" value={stats.calls} />
            <StatBox label="Earnings" value={`₹${stats.earnings.toFixed(0)}`} color="text-green-600" />
        </div>
    );
}

function StatBox({ label, value, color = "text-slate-800" }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-xl font-bold ${color}`}>{value}</span>
        </div>
    );
}
