"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Settings, DollarSign, Activity, FileText, Smartphone, LogOut, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileAdminSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path) => pathname === path;

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <div className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 hidden md:flex flex-col shadow-xl h-screen sticky top-0">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold text-white">Mobile Admin</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar mt-4">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dashboard</div>

                <Link href="/mobile-admin"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <Activity size={18} />
                    Live Analytics
                </Link>

                <Link href="/mobile-admin/users"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin/users')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <Users size={18} />
                    Users & RBAC
                </Link>

                <div className="px-3 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuration</div>

                <Link href="/mobile-admin/config"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin/config')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <Smartphone size={18} />
                    App Toggles
                </Link>

                <Link href="/mobile-admin/notifications"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin/notifications')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <Activity size={18} />
                    Push Notifications
                </Link>

                <Link href="/mobile-admin/astrologers"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin/astrologers')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <Users size={18} />
                    Astrologers
                </Link>

                <Link href="/mobile-admin/pricing"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin/pricing')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <DollarSign size={18} />
                    Pricing Models
                </Link>

                <div className="px-3 mt-8 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitors</div>

                <Link href="/mobile-admin/sessions"
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/mobile-admin/sessions')
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                >
                    <FileText size={18} />
                    Active Sessions & Records
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all justify-center border border-red-500/20"
                >
                    <LogOut size={16} />
                    Exit Panel
                </button>
            </div>
        </div>
    );
}
