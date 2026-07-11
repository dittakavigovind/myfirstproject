"use client";

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    User, 
    Settings as SettingsIcon, 
    Bell, 
    Moon, 
    Globe, 
    Trash2, 
    Star, 
    ChevronRight,
    Shield,
    Smartphone,
    LogOut,
    AlertTriangle,
    Sun,
    Monitor
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/lib/api";

export default function SettingsPage() {
    const router = useRouter();
    const { logout } = useAuth() || {};
    
    // States for toggles
    const [horoscopeAlerts, setHoroscopeAlerts] = useState(true);
    const [notifications, setNotifications] = useState(true);
    
    // State for language
    const [language, setLanguage] = useState("English");
    
    // State for theme
    const [theme, setTheme] = useState("dark");
    
    // States for modals
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // State for cache clearing
    const [isClearing, setIsClearing] = useState(false);
    const [cacheCleared, setCacheCleared] = useState(false);

    // Initialize Language and Theme from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("app_language");
        if (savedLang) setLanguage(savedLang);
        
        const savedTheme = localStorage.getItem("app_theme");
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        localStorage.setItem("app_language", newLang);
        alert(`Language changed to ${newLang}. Please restart the app to apply changes globally.`);
    };

    const applyTheme = (selectedTheme) => {
        if (selectedTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
            }
        } else if (selectedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    };

    const handleThemeChange = (e) => {
        const newTheme = e.target.value;
        setTheme(newTheme);
        localStorage.setItem("app_theme", newTheme);
        applyTheme(newTheme);
    };

    const handleClearCache = () => {
        if (isClearing || cacheCleared) return;
        setIsClearing(true);
        setTimeout(() => {
            setIsClearing(false);
            setCacheCleared(true);
            setTimeout(() => setCacheCleared(false), 3000);
        }, 1500);
    };

    const handleLogout = () => {
        if (logout) {
            logout();
        } else {
            router.push('/login');
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await api.delete('/users/me');
            if (res.data.success) {
                setIsDeleting(false);
                setShowDeleteConfirm(false);
                setShowAccountModal(false);
                if (logout) logout();
                router.push('/login');
            } else {
                setIsDeleting(false);
                alert('Failed to delete account');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            setIsDeleting(false);
            alert('Failed to delete account. Please try again.');
        }
    };

    // Helper component for Toggle Switch
    const ToggleSwitch = ({ enabled, onChange }) => (
        <button 
            onClick={() => onChange(!enabled)}
            className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${enabled ? 'bg-indigo-500' : 'bg-white/10'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    );

    return (
        <main className="min-h-screen bg-[#0b1026] text-white pb-24 font-sans dark:bg-[#0b1026] light:bg-slate-50 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 px-5 z-40 relative sticky top-0 bg-[#0b1026]/90 header-scrolled backdrop-blur-md py-4 border-b border-white/5">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">Settings</h2>
            </div>

            <div className="px-5 py-6 space-y-8">
                
                {/* 1. Account & Profile */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 px-2">Account & Profile</h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        {/* Edit Profile */}
                        <div 
                            onClick={() => router.push('/profile/edit')}
                            className="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <User size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-200">Edit Profile</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-500" />
                        </div>
                        {/* Account Management */}
                        <div 
                            onClick={() => setShowAccountModal(true)}
                            className="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Shield size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-200">Account Management</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-500" />
                        </div>
                        {/* Blocked Users */}
                        <div 
                            onClick={() => router.push('/settings/blocked')}
                            className="flex items-center justify-between p-4 active:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                                    <AlertTriangle size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-200">Blocked Users</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-500" />
                        </div>
                    </div>
                </section>

                {/* 2. Notifications & Alerts */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 px-2">Notifications & Alerts</h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        {/* Daily Horoscope */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                    <Star size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-200">Daily Horoscope Alerts</span>
                            </div>
                            <ToggleSwitch enabled={horoscopeAlerts} onChange={setHoroscopeAlerts} />
                        </div>
                        {/* General Notifications */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Push Notifications</p>
                                    <p className="text-[10px] text-slate-400">Offers, reminders & updates</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={notifications} onChange={setNotifications} />
                        </div>
                    </div>
                </section>

                {/* 3. Preferences & App Experience */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 px-2">Preferences & App Experience</h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        {/* Language */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 relative">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Globe size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-200">Language</span>
                            </div>
                            <select 
                                value={language}
                                onChange={handleLanguageChange}
                                className="bg-transparent text-sm text-slate-300 font-medium outline-none appearance-none pr-4 cursor-pointer"
                            >
                                <option value="English" className="bg-[#0b1026]">English</option>
                                <option value="Hindi" className="bg-[#0b1026]">Hindi</option>
                                <option value="Telugu" className="bg-[#0b1026]">Telugu</option>
                                <option value="Tamil" className="bg-[#0b1026]">Tamil</option>
                            </select>
                        </div>
                        {/* Theme */}
                        <div className="flex items-center justify-between p-4 relative">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                                    {theme === 'light' ? <Sun size={16} /> : theme === 'system' ? <Monitor size={16} /> : <Moon size={16} />}
                                </div>
                                <span className="text-sm font-medium text-slate-200">Theme</span>
                            </div>
                            <select 
                                value={theme}
                                onChange={handleThemeChange}
                                className="bg-transparent text-sm text-slate-300 font-medium outline-none appearance-none pr-4 cursor-pointer text-right"
                            >
                                <option value="dark" className="bg-[#0b1026]">Dark (Default)</option>
                                <option value="light" className="bg-[#0b1026]">Light</option>
                                <option value="system" className="bg-[#0b1026]">System Default</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 4. App Information */}
                <section>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 px-2">App Information</h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        {/* Clear Cache */}
                        <div 
                            onClick={handleClearCache}
                            className="flex items-center justify-between p-4 border-b border-white/5 active:bg-white/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                    <Trash2 size={16} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-slate-200">Clear Cache</span>
                                    {cacheCleared && <p className="text-[10px] text-emerald-400 mt-0.5">Cache cleared successfully!</p>}
                                </div>
                            </div>
                            {isClearing ? (
                                <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="text-xs text-slate-500">12.4 MB</span>
                            )}
                        </div>
                        {/* Rate the App */}
                        <div className="flex items-center justify-between p-4 active:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                    <Smartphone size={16} />
                                </div>
                                <span className="text-sm font-medium text-slate-200">Rate the App</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-500" />
                        </div>
                    </div>
                </section>

                {/* Version Info */}
                <div className="pt-6 pb-2 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Version 1.1.465</p>
                </div>

            </div>

            {/* Account Management Modal */}
            <AnimatePresence>
                {showAccountModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setShowAccountModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-[#111827] border border-white/10 p-6 rounded-3xl z-10 overflow-hidden shadow-2xl"
                        >
                            {!showDeleteConfirm ? (
                                <>
                                    <h3 className="text-xl font-bold text-white mb-6">Account Management</h3>
                                    
                                    <div className="space-y-3 mb-6">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><LogOut size={18} /></div>
                                                <span className="font-bold text-white">Log Out</span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500" />
                                        </button>

                                        <button 
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={18} /></div>
                                                <div className="text-left">
                                                    <span className="font-bold text-red-400 block">Delete Account</span>
                                                    <span className="text-[10px] text-red-400/60 uppercase tracking-wider">Permanent Action</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-red-400/50" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setShowAccountModal(false)}
                                        className="w-full py-4 text-slate-400 font-bold hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-red-400 mb-2 uppercase tracking-tight">Delete Account?</h3>
                                        <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                            This action is permanent and cannot be undone. All your data, wallet balance, and chat history will be permanently deleted.
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                            className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-white border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className="flex-1 py-4 bg-red-500 rounded-2xl font-black text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all flex justify-center items-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Delete Forever</>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </main>
    );
}
