"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, MessageCircle, LogOut, Star, IndianRupee, FileText } from 'lucide-react';

export default function AstrologerSidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    if (!user) return null;

    return (
        <div className="w-72 bg-white border-r border-slate-200 text-slate-700 hidden md:flex flex-col shadow-sm h-screen sticky top-0">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-astro-gold rounded-lg flex items-center justify-center text-white font-bold">
                    <Star size={18} fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-slate-800">Astro Portal</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</div>

                <Link href="/astrologer/dashboard"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/astrologer/dashboard')
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </Link>

                <Link href="/astrologer/profile"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/astrologer/profile')
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <User size={18} />
                    Set Price
                </Link>

                <Link href="/astrologer/chats"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/astrologer/chats')
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <MessageCircle size={18} />
                    Chats
                </Link>

                <Link href="/astrologer/earnings"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/astrologer/earnings')
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <IndianRupee size={18} />
                    Earnings
                </Link>

                <Link href="/astrologer/professional-report"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive('/astrologer/professional-report')
                        ? 'bg-amber-50 text-amber-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <FileText size={18} />
                    Professional Report
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user.name?.[0]
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
