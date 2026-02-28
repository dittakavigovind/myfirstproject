"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, UserCog, Star, FileText, PenTool, Layers, LogOut,
    TrendingUp, DollarSign, Activity, FileCheck, ShieldAlert, HelpCircle,
    ChevronDown, ChevronRight, Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminSidebar({ pendingRequestsCount = 0 }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'overview';

    // State for dropdowns
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Auto-expand settings if on a settings sub-tab
    useEffect(() => {
        if (currentTab === 'logo-settings' || currentTab === 'nav-badges' || currentTab === 'explore-services') {
            setIsSettingsOpen(true);
        }
    }, [currentTab]);

    // Helper to check active state
    const isActive = (path, tab) => {
        if (path && pathname === path) return true;
        if (tab && pathname === '/admin' && currentTab === tab) return true;
        return false;
    };

    if (!user) return null;

    return (
        <div className="w-72 bg-white border-r border-slate-200 text-slate-700 hidden md:flex flex-col shadow-sm h-screen sticky top-0">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-astro-navy rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-xl font-bold text-astro-navy">Admin Portal</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</div>

                <Link href="/admin?tab=overview"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'overview')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <LayoutDashboard size={18} />
                    Overview
                </Link>

                {/* Admin Management Links */}
                {/* Admin Management Links */}
                {['admin', 'manager'].includes(user.role) && (
                    <>
                        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</div>

                        {user.role === 'admin' && (
                            <>
                                <Link href="/admin?tab=all-members"
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'all-members') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Users size={18} />
                                    All Members
                                </Link>

                                <Link href="/admin?tab=users"
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'users') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Users size={18} />
                                    Users
                                </Link>

                                <Link href="/admin?tab=managers"
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'managers') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <UserCog size={18} />
                                    Managers
                                </Link>

                                <Link href="/admin?tab=astrologers"
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'astrologers') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Star size={18} />
                                    Astrologers
                                </Link>
                            </>
                        )}

                        <Link href="/admin?tab=requests"
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all justify-between ${isActive(null, 'requests') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <FileCheck size={18} />
                                <span>Requests</span>
                            </div>
                            {pendingRequestsCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{pendingRequestsCount}</span>
                            )}
                        </Link>

                        <Link href="/admin/professional-report"
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/admin/professional-report' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <FileText size={18} />
                            Professional Report
                        </Link>

                        <Link href="/admin?tab=activity"
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'activity') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Activity size={18} />
                            Activity Logs
                        </Link>
                    </>
                )}

                <Link href="/admin/horoscope"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname.startsWith('/admin/horoscope') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <Star size={18} />
                    Horoscope
                </Link>

                {/* Content Links - Actual Routes */}
                <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Content</div>

                <Link href="/admin/blog"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/admin/blog' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <FileText size={18} />
                    Manage Posts
                </Link>

                <Link href="/admin/blog/create"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/admin/blog/create' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <PenTool size={18} />
                    Write New Post
                </Link>

                <Link href="/admin/blog/categories"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/admin/blog/categories' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <Layers size={18} />
                    Categories
                </Link>

                <Link href="/admin?tab=page-descriptions"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'page-descriptions') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <Star size={18} />
                    Page Descriptions
                </Link>

                <Link href="/admin?tab=faqs"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(null, 'faqs') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <HelpCircle size={18} />
                    FAQs
                </Link>

                <Link href="/admin/seo"
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/admin/seo' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <TrendingUp size={18} />
                    SEO Settings
                </Link>

                {/* Online Pooja Section */}
                {['admin', 'manager'].includes(user.role) && (
                    <>
                        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Online Pooja</div>
                        <Link href="/admin/online-pooja/temples"
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname.startsWith('/admin/online-pooja/temples') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <PenTool size={18} />
                            Temple Management
                        </Link>
                        <Link href="/admin/online-pooja/bookings"
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname.startsWith('/admin/online-pooja/bookings') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <PenTool size={18} />
                            Pooja Bookings
                        </Link>
                    </>
                )}

                {/* Settings Dropdown */}
                {user.role === 'admin' && (
                    <div className="pt-2">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isSettingsOpen ? 'text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Settings size={18} />
                                <span>Settings</span>
                            </div>
                            {isSettingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {isSettingsOpen && (
                            <div className="mt-1 ml-4 pl-4 border-l border-slate-100 space-y-1">
                                <Link href="/admin?tab=logo-settings"
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive(null, 'logo-settings')
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    Logo Settings
                                </Link>
                                <Link href="/admin?tab=nav-badges"
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive(null, 'nav-badges')
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    Navigation Badges
                                </Link>
                                <Link href="/admin?tab=explore-services"
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive(null, 'explore-services')
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    Explore Services
                                </Link>
                                <Link href="/admin?tab=popups"
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive(null, 'popups')
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    Promotional Popups
                                </Link>
                                <Link href="/admin/settings/features"
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${pathname === '/admin/settings/features'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    Feature Management
                                </Link>
                                <Link href="/admin/settings/ads"
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${pathname === '/admin/settings/ads'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    Ads Configuration
                                </Link>
                                <div className="px-3 py-2 text-[10px] text-slate-400 italic">
                                    More adding soon...
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {user.name?.[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
