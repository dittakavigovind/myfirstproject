"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmationModal from './ConfirmationModal';
import { resolveImageUrl, API_BASE } from '../lib/urlHelper';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { navBadges, featureFlags } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logoSettings, setLogoSettings] = useState({ desktop: '/logo.svg', mobile: '/logo.svg' });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // Fetch Logo Settings
        const fetchSettings = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const res = await fetch(`${API_BASE}/site-settings`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const data = await res.json();
                if (data.success && data.settings) {
                    setLogoSettings({
                        desktop: data.settings.logoDesktop || '/logo.svg',
                        mobile: data.settings.logoMobile || '/logo.svg'
                    });
                }
            } catch (error) {
                console.error("Failed to fetch site settings", error?.name === 'AbortError' ? 'Request timed out' : error);
            }
        };
        fetchSettings();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <>
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                title="Sign Out"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                isDanger={true}
            />

            <nav
                className={`sticky top-0 z-[100] transition-all duration-300 shadow-md ${scrolled ? 'bg-[#0b1c3d]' : 'bg-[#0b1c3d]'} pt-[env(safe-area-inset-top,0px)]`}
                style={{ backgroundColor: '#0b1c3d' }}
            >
                {/* TOP ROW: Logo and Actions */}
                <div
                    className="bg-[#0b1c3d] border-b border-slate-700/30"
                    style={{ backgroundColor: '#0b1c3d', borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}
                >
                    <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                        {/* 1. Logo Section */}
                        <div className="flex-shrink-0 relative group flex items-center">
                            <Link href="/" className="relative z-10 block">
                                {/* Desktop Logo */}
                                <img
                                    src={resolveImageUrl(logoSettings.desktop)}
                                    alt="Way2Astro"
                                    className="hidden md:block h-12 md:h-14 w-auto object-contain hover:scale-110 transition-all duration-500 ease-out"
                                    style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
                                />
                                {/* Mobile Logo */}
                                <img
                                    src={resolveImageUrl(logoSettings.mobile)}
                                    alt="Way2Astro"
                                    className="block md:hidden h-10 w-auto object-contain hover:scale-110 transition-all duration-500 ease-out"
                                    style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                                />
                            </Link>
                        </div>

                        {/* 2. Top Right Actions (Search, Login, etc.) */}
                        <div className="flex items-center gap-4">
                            {/* Desktop Actions */}
                            <div className="hidden lg:flex items-center gap-4">
                                {user?.role !== 'astrologer' && (
                                    <>
                                        {featureFlags?.enableChat && (
                                            <Link href="/chat-with-astrologer">
                                                <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 hover:border-astro-yellow/30 transition-all group">
                                                    <MessageCircle size={16} className="text-astro-yellow group-hover:scale-110 transition-transform" />
                                                    <span>Chat with Astrologer</span>
                                                </button>
                                            </Link>
                                        )}
                                        {featureFlags?.enableCall && (
                                            <Link href="/talk-to-astrologer">
                                                <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-slate-700 text-slate-200 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 hover:border-astro-yellow/30 transition-all group">
                                                    <Phone size={16} className="text-astro-yellow group-hover:scale-110 transition-transform" />
                                                    <span>Talk to Astrologer</span>
                                                </button>
                                            </Link>
                                        )}
                                    </>
                                )}

                                {/* User Profile / Login */}
                                {user ? (
                                    <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                                        <Link href="/dashboard" className="flex items-center gap-3 group">
                                            <div className="text-right">
                                                <p className="text-base font-bold text-white leading-none">{user.name?.split(' ')[0]}</p>
                                                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Dashboard</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border border-slate-700 p-0.5 group-hover:border-astro-yellow transition-colors relative">
                                                {(user.role === 'admin' || user.role === 'manager') && (
                                                    <span className={`absolute -top-1 -right-1 w-3 h-3 ${user.role === 'admin' ? 'bg-red-500' : 'bg-green-500'} rounded-full border-2 border-[#0b1c3d]`}></span>
                                                )}
                                                <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
                                            title="Logout"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <Link href="/login">
                                        <button className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/20">
                                            Login
                                        </button>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Toggle */}
                            <div className="lg:hidden flex items-center gap-4">
                                {user && (
                                    <Link href="/dashboard" className="w-8 h-8 rounded-full bg-astro-yellow text-astro-navy flex items-center justify-center font-bold text-xs shadow-md overflow-hidden relative">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0)
                                        )}
                                    </Link>
                                )}
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Navigation Links (Yellow Background) */}
                <div className="hidden lg:block bg-astro-yellow shadow-inner">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-center h-11">
                            {/* 1. Left Spacer (to balance portals on the right) */}
                            <div className="flex-1"></div>

                            {/* 2. Centered Navigation Items */}
                            <div className="flex items-center">
                                {[
                                    { name: 'HOME', path: '/' },
                                    { name: 'FREE KUNDLI', path: '/kundli' },
                                    { name: 'DIVISIONAL CHARTS', path: '/divisional-charts' },
                                    { name: 'DASHA PERIODS', path: '/calculators/dasha-periods' },
                                    {
                                        name: 'HOROSCOPES', path: '/horoscope', hasDropdown: true, dropdownItems: [
                                            { name: 'Daily Horoscope', path: '/daily-horoscope' },
                                            { name: 'Weekly Horoscope', path: '/weekly-horoscope' },
                                            { name: 'Monthly Horoscope', path: '/monthly-horoscope' },
                                            { name: 'All Horoscopes', path: '/horoscope' }
                                        ]
                                    },
                                    { name: 'PANCHANG', path: '/panchang' },
                                    { name: 'CALENDAR', path: '/calculators/indian-calendar' },
                                    { name: 'GOCHAR', path: '/calculators/gochar' },
                                    {
                                        name: 'CALCULATORS', path: '#', hasDropdown: true, dropdownItems: [
                                            { name: 'Love Calculator', path: '/calculators/love-calculator' },
                                            { name: 'Moon Sign Calculator', path: '/calculators/moon-sign-calculator' },
                                            { name: 'Shani Sade Sati', path: '/calculators/sade-sati-calculator' },
                                            { name: 'Yogini Dasha', path: '/calculators/yogini-dasha' },
                                            { name: 'Matchmaking', path: '/matchmaking' },
                                            { name: 'Planetary Transit - Gochar', path: '/calculators/gochar' },
                                            { name: 'Sun Sign Calculator', path: '/calculators/sun-sign-calculator' },
                                            { name: 'Numerology Calculator', path: '/calculators/numerology-calculator' },
                                            { name: 'Friendship Calculator', path: '/calculators/friendship-calculator' },
                                            { name: 'Kaal Sarp Dosha', path: '/kaalsarp-dosha' },
                                            { name: 'Mangal Dosha', path: '/mangal-dosha' },
                                            { name: 'Arudha Lagna', path: '/arudha-lagna' },
                                            { name: 'Marriage & Career Timing', path: '/calculators/marriage-career' },
                                            { name: 'Atmakaraka Calculator', path: '/calculators/atmakaraka' },
                                        ]
                                    },
                                    { name: 'BLOG', path: '/blog' },
                                ].map((item) => {
                                    // Normalize path matching
                                    const normalize = (p) => p?.replace(/\/+$/, '') || '';
                                    let badge = navBadges?.find(b => normalize(b.path) === normalize(item.path) && b.enabled);

                                    return (
                                        <div key={item.name} className="relative group px-3.5 h-11 flex items-center">
                                            {item.hasDropdown ? (
                                                <div className="relative group/sub flex items-center h-full">
                                                    <button className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-wide text-astro-navy hover:text-white transition-colors">
                                                        <span>{item.name}</span>
                                                        <ChevronDown size={14} className="group-hover/sub:rotate-180 transition-transform duration-300" />
                                                    </button>
                                                    <div className="absolute top-full left-0 w-56 bg-white border border-slate-100 rounded-b-xl shadow-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-[110] overflow-hidden transform origin-top pt-2">
                                                        {item.dropdownItems?.map((subItem) => (
                                                            <Link
                                                                key={subItem.name}
                                                                href={subItem.path}
                                                                className="block px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-astro-navy hover:bg-astro-yellow/10 transition-colors border-b border-slate-50 last:border-0"
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.path}
                                                    className={`text-[12px] font-bold uppercase tracking-wide transition-colors hover:text-white ${pathname === item.path ? 'text-astro-navy' : 'text-astro-navy'
                                                        }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            )}
                                            {badge && (
                                                <span
                                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold capitalize tracking-tight shadow-md animate-pulse z-[110] whitespace-nowrap"
                                                    style={{ backgroundColor: badge.color, color: badge.textColor }}
                                                >
                                                    {badge.text}
                                                </span>
                                            )}

                                            {/* Vertical Divider - Bold Navy Blue */}
                                            {item.name !== 'BLOG' && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[18px] w-[1.5px] bg-[#0b1c3d]/30"></div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* 3. Portals in the yellow bar - Balanced to the right */}
                            <div className="flex-1 flex items-center justify-end gap-2">
                                {user?.role === 'admin' && (
                                    <Link href="/admin" className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-white px-4 py-1.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm border border-red-100">
                                        Admin Portal
                                    </Link>
                                )}
                                {user?.role === 'manager' && (
                                    <Link href="/admin" className="text-[11px] font-bold uppercase tracking-wider text-green-600 bg-white px-4 py-1.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm border border-green-100">
                                        Manager Portal
                                    </Link>
                                )}
                                {user?.role === 'astrologer' && (
                                    <Link href="/astrologer/dashboard" className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-white px-4 py-1.5 rounded-full hover:bg-slate-50 transition-colors shadow-sm border border-purple-100">
                                        Astrologer Portal
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-100 absolute top-full left-0 right-0 shadow-2xl p-4 max-h-[80vh] overflow-y-auto">
                        {user?.role !== 'astrologer' && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {featureFlags?.enableChat && (
                                    <Link href="/chat-with-astrologer" onClick={() => setIsMenuOpen(false)} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-indigo-100 transition">
                                        <MessageCircle size={20} className="text-indigo-600 mb-2" />
                                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Chat</span>
                                    </Link>
                                )}
                                {featureFlags?.enableCall && (
                                    <Link href="/talk-to-astrologer" onClick={() => setIsMenuOpen(false)} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-emerald-100 transition">
                                        <Phone size={20} className="text-emerald-600 mb-2" />
                                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Talk</span>
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="space-y-1">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Kundli', path: '/kundli' },
                                { name: 'Divisional Charts', path: '/divisional-charts' },
                                { name: 'Dasha Periods', path: '/calculators/dasha-periods' },
                                { name: 'Matchmaking', path: '/matchmaking' },
                                { name: 'Horoscope', path: '/horoscope' },
                                { name: 'Panchang', path: '/panchang' },
                                { name: 'Calendar', path: '/calculators/indian-calendar' },
                                { name: 'Planetary Transit', path: '/calculators/gochar' },
                                { name: 'Blog', path: '/blog' },
                            ].map((item) => {
                                const normalize = (p) => p?.replace(/\/+$/, '') || '';
                                let badge = navBadges?.find(b => normalize(b.path) === normalize(item.path) && b.enabled);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="relative block px-4 py-3 rounded-lg text-sm font-semibold text-slate-700 hover:text-astro-navy hover:bg-astro-yellow/20 transition-colors"
                                    >
                                        {item.name}
                                        {badge && (
                                            <span
                                                className="inline-block ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold capitalize tracking-tight shadow-sm animate-pulse align-middle"
                                                style={{ backgroundColor: badge.color, color: badge.textColor }}
                                            >
                                                {badge.text}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}

                            {[
                                // { name: 'Wallet', path: '/wallet' }, // Hidden for now
                                ...(user?.role === 'admin'
                                    ? [{ name: 'Admin Portal', path: '/admin', highlight: 'text-red-600 bg-red-50' }]
                                    : user?.role === 'manager'
                                        ? [{ name: 'Manager Portal', path: '/admin', highlight: 'text-green-600 bg-green-50' }]
                                        : user?.role === 'astrologer'
                                            ? [{ name: 'Astrologer Portal', path: '/astrologer', highlight: 'text-purple-600 bg-purple-50' }]
                                            : [{ name: 'Join as Astrologer', path: '/join-astrologer' }]
                                ),
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${item.highlight ? item.highlight : 'text-slate-700 hover:text-astro-navy hover:bg-astro-yellow/20'}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 mt-6 pt-6">
                            {!user ? (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <button className="w-full py-3 bg-astro-navy text-white rounded-xl font-bold text-sm uppercase tracking-wide">
                                        Login / Sign Up
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { handleLogoutClick(); setIsMenuOpen(false); }}
                                    className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
