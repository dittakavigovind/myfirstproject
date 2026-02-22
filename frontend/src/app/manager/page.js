"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import API from '../../lib/api';
import {
    LayoutDashboard, Users, UserCog, Star, FileText, PenTool, Layers, LogOut,
    TrendingUp, DollarSign, Activity, FileCheck, ShieldAlert, Pencil, Trash2, CheckCircle, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import BlogManager from '../../components/admin/BlogManager';

export default function ManagerDashboard() {
    const { user, loading } = useAuth();
    const { fetchAdminStats } = useAdmin();
    const router = useRouter();

    // State
    const [stats, setStats] = useState({ users: 0, astrologers: 0, revenue: 0, activeChats: 0 });
    const [reqList, setReqList] = useState([]);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'manager') {
                router.push('/admin'); // If admin, go to admin. If user, protected will kick out.
            } else {
                fetchData();
            }
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        try {
            // Fetch relevant stats for manager
            try {
                const reqRes = await API.get('/requests/admin/all');
                if (reqRes.data.success) {
                    setReqList(reqRes.data.data);
                }
            } catch (e) { console.error("Requests fetch error", e); }
        } catch (error) {
            console.error("Manager Access Error", error);
        }
    };

    if (loading || !user || user.role !== 'manager') return <div className="p-10 text-center">Checking Privileges...</div>;

    return (
        <div className="w-full p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 capitalize">Manager Dashboard</h1>
                    <p className="text-sm text-slate-500">Welcome back, {user.name}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-slate-700">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Requests Card */}
                <div onClick={() => router.push('/admin?tab=requests')} className="cursor-pointer transition hover:-translate-y-1">
                    <StatCard label="Pending Requests" value={reqList.length} icon={FileCheck} color="bg-pink-500" />
                </div>

                {/* Content Card */}
                <div className="cursor-pointer transition hover:-translate-y-1" onClick={() => router.push('/admin/blog')}>
                    <StatCard label="Content" value="Manage" icon={FileText} color="bg-indigo-500" />
                </div>

                {/* Horoscope Card - THIS IS THE REQUESTED FEATURE */}
                <div className="cursor-pointer transition hover:-translate-y-1" onClick={() => router.push('/admin/horoscope')}>
                    <StatCard label="Horoscope" value="Update" icon={Sparkles} color="bg-rose-500" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-700 mb-2">Quick Actions</h3>
                <p className="text-slate-500 mb-6">Select an option above to get started.</p>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between transition hover:shadow-md">
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );
}
