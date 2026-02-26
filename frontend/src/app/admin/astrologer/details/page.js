"use client";

import { useEffect, useState, Suspense } from 'react';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Shield, Trash2, Save, User as UserIcon, AlertCircle, Sparkles, Star, Phone, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminAstrologerDetailsWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10"><div className="w-16 h-16 border-4 border-astro-navy border-t-transparent rounded-full animate-spin"></div></div>}>
            <AdminAstrologerDetails />
        </Suspense>
    )
}

function AdminAstrologerDetails() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug'); // Using slug from query parameter
    const { user } = useAuth();
    const router = useRouter();
    const [astroData, setAstroData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'manager') {
            router.push('/');
        } else if (user) {
            fetchAstrologer();
        }
    }, [user, slug]);

    const fetchAstrologer = async () => {
        try {
            // Using the existing endpoint that handles ID or Slug
            const res = await API.get(`/astro/astrologers/${slug}`);
            if (res.data.success) {
                setAstroData(res.data.data);
                setIsActive(res.data.data.isActive);
            } else {
                toast.error("Astrologer not found");
            }
        } catch (err) {
            console.error("Fetch Astrologer Error:", err);
            toast.error("Failed to fetch astrologer details");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        setUpdating(true);
        try {
            await API.put(`/astro/astrologers/${astroData._id}`, { isActive: !isActive });
            setIsActive(!isActive);
            toast.success(`Astrologer ${!isActive ? 'activated' : 'deactivated'}`);
            fetchAstrologer(); // Refresh to ensure sync
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this astrologer profile? This action cannot be undone.')) return;
        try {
            await API.delete(`/astro/astrologers/${astroData._id}`);
            toast.success('Astrologer profile deleted');
            router.push('/admin?tab=astrologers');
        } catch (err) {
            toast.error('Failed to delete astrologer');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 border-4 border-astro-navy border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading astrologer profile...</p>
        </div>
    );

    if (!astroData) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Astrologer Not Found</h2>
            <Link href="/admin?tab=astrologers" className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition">
                Return to Directory
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">

            {/* Header Background */}
            <div className="relative text-white h-[400px]">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[4rem] z-0 overflow-hidden">
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col pt-12">
                    <Link href="/admin?tab=astrologers" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors group mb-8 w-fit">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all backdrop-blur-md">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="font-bold tracking-wide">Back to Directory</span>
                    </Link>

                    <div className="text-center md:text-left md:pl-4">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-astro-yellow text-xs font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-lg">
                            Astrologer Profile
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
                            {astroData.displayName}
                        </h1>
                        <p className="text-blue-200 text-lg flex items-center md:items-start justify-center md:justify-start gap-2">
                            <span className="opacity-70">{astroData.specialization || "Vedic Astrologer"}</span>
                            {astroData.isOnline && <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">ONLINE</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/10 border border-white/50 overflow-hidden backdrop-blur-xl">
                    <div className="p-8 md:p-12">
                        {/* Profile Info Section */}
                        <div className="flex flex-col md:flex-row gap-10 items-start border-b border-slate-100 pb-10 mb-10">
                            <div className="relative group mx-auto md:mx-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <div className="w-40 h-40 rounded-[2rem] bg-white p-2 shadow-xl relative z-10">
                                    <img
                                        src={astroData.image || `https://ui-avatars.com/api/?name=${astroData.displayName}`}
                                        alt={astroData.displayName}
                                        className="w-full h-full object-cover rounded-[1.5rem]"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-6 pt-2">
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Experience</p>
                                        <p className="font-bold text-slate-800">{astroData.experienceYears || 0} Years</p>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Rating</p>
                                        <p className="font-bold text-slate-800 flex items-center gap-1">
                                            {astroData.rating || 0} <Star size={14} className="fill-astro-yellow text-astro-yellow" />
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Pricing</p>
                                        <p className="font-bold text-slate-800">₹{astroData.charges?.chatPerMinute || 0}/min</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Contact Info fetched from userId if populated */}
                                    {astroData.userId && (
                                        <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start text-sm text-slate-600">
                                            <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-50">
                                                <Mail size={16} className="text-blue-500" />
                                                {astroData.userId.email}
                                            </div>
                                            {astroData.userId.phone && (
                                                <div className="flex items-center gap-2 bg-green-50/50 px-3 py-1.5 rounded-lg border border-green-50">
                                                    <Phone size={16} className="text-green-500" />
                                                    {astroData.userId.phone}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-center md:justify-start gap-4 pt-2">
                                        <button
                                            onClick={() => astroData.userId && router.push(`/admin/users/details?username=${astroData.userId.username || astroData.userId._id || astroData.userId}`)}
                                            className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            <UserIcon size={16} /> Manage Connected User Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Management Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                            {/* Actions Card */}
                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-white shadow-lg relative overflow-hidden">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <Shield size={20} className="text-indigo-600" />
                                    Account Actions
                                </h3>

                                <div className="space-y-4 relative z-10 w-full">
                                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-800">Profile Status</p>
                                            <p className={`text-xs font-bold uppercase ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                {isActive ? 'Active & Visible' : 'Hidden / Inactive'}
                                            </p>
                                        </div>
                                        <div onClick={handleToggleActive} className="cursor-pointer">
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleDelete}
                                        className="w-full py-4 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-red-100 hover:border-red-200 shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                        Permanently Delete Profile
                                    </button>
                                </div>
                            </div>

                            {/* Skills & Bio */}
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 group shadow-lg">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <Sparkles className="text-amber-500" size={20} />
                                    Expertise & Bio
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {astroData.skills?.map(s => (
                                                <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{s}</span>
                                            ))}
                                            {(!astroData.skills || astroData.skills.length === 0) && <span className="text-slate-400 text-sm italic">No skills listed</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Languages</p>
                                        <div className="flex flex-wrap gap-2">
                                            {astroData.languages?.map(l => (
                                                <span key={l} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</p>
                                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {astroData.about || astroData.bio || "No bio available."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Stats Wrapper */}
                        <div className="mt-10 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="text-blue-600" size={24} />
                                Performance Metrics
                            </h3>
                            <ActivityPerformanceWrapper astrologerId={astroData._id} />
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
                const res = await API.get(`/activity/reports/admin?astrologerId=${astrologerId}`);
                if (res.data.success && res.data.data) {
                    const total = res.data.data.reduce((acc, curr) => ({
                        online: acc.online + (curr.onlineDurationMinutes || 0),
                        voice: acc.voice + (curr.totalVoiceMinutes || 0),
                        video: acc.video + (curr.totalVideoMinutes || 0),
                        chat: acc.chat + (curr.totalChatMinutes || 0),
                        calls: acc.calls + (curr.totalCallsCount || 0),
                        earnings: acc.earnings + (curr.totalNetEarnings || 0)
                    }), { online: 0, voice: 0, video: 0, chat: 0, calls: 0, earnings: 0 });
                    setStats(total);
                } else {
                    setStats({ online: 0, voice: 0, video: 0, chat: 0, calls: 0, earnings: 0 });
                }
            } catch (e) {
                console.error("Failed to fetch activity stats", e);
                setStats({ online: 0, voice: 0, video: 0, chat: 0, calls: 0, earnings: 0 });
            }
        };
        fetchStats();
    }, [astrologerId]);

    if (!stats) return <div className="text-slate-400 text-sm animate-pulse">Loading detailed metrics...</div>;

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
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-xl font-bold ${color}`}>{value}</span>
        </div>
    );
}
