"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import API from '@/lib/api';
import { motion } from 'framer-motion';
import { Star, CheckCircle, MessageCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatAstrologersPage() {
    const [astrologers, setAstrologers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const { featureFlags } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (featureFlags && featureFlags.enableChat === false) {
            router.push('/');
        }
    }, [featureFlags, router]);

    // Protect Route from Astrologers
    useEffect(() => {
        if (!authLoading && user && user.role === 'astrologer') {
            router.push('/astrologer/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchAstrologers = async () => {
            try {
                const { data } = await API.get('/astro/astrologers');
                if (data.success) {
                    setAstrologers(data.data.filter(a => a.isActive !== false));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAstrologers();
    }, []);

    const handleProfileClick = (astro) => {
        router.push(`/astrologers/${astro.slug || astro._id}`);
    };

    const handleChatClick = (astroId) => {
        router.push(`/chat-with-astrologer/${astroId}`);
    };

    const filteredAstrologers = astrologers.filter(astro =>
        astro.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        astro.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        astro.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Premium Header - Reused with Chat Emphasis */}
            <div className="relative text-white">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-0 overflow-hidden transform scale-x-[1.02]">
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center pt-10 pb-24 md:pb-32 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center text-center"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-astro-yellow text-[10px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-lg shadow-black/10">
                            ✨ Instant Connection
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
                            Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300">Astrologers</span>
                        </h1>
                        <p className="text-slate-300/90 max-w-xl text-sm md:text-base font-medium leading-relaxed mb-8">
                            Connect instantly with top astrologers. Get personalized guidance and remedies through chat.
                        </p>

                        {/* Search Bar */}
                        <div className="w-full max-w-md relative mb-6">
                            <input
                                type="text"
                                placeholder="Search by name, skill, or language..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-astro-yellow/50 focus:bg-white/15 backdrop-blur-md transition-all shadow-xl"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                        </div>

                        <Link href="/my-chats">
                            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-md flex items-center gap-2">
                                <MessageCircle size={16} /> View My Chats
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20 mb-20">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-80 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-astro-navy"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredAstrologers.length > 0 ? (
                            filteredAstrologers.map((astro, index) => (
                                <motion.div
                                    key={astro._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    onClick={() => handleProfileClick(astro)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 p-4 flex gap-4 items-start relative group cursor-pointer"
                                >
                                    {/* Left: Image & Stats */}
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 to-orange-500">
                                                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                                                    <img
                                                        src={astro.image || `https://ui-avatars.com/api/?name=${astro.displayName}`}
                                                        alt={astro.displayName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            {astro.isOnline && (
                                                <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} fill={i < Math.floor(astro.rating) ? "currentColor" : "none"} className={i < Math.floor(astro.rating) ? "" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {astro.reviewCount || 0} orders
                                        </div>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center gap-1 mb-1">
                                            <h3 className="font-bold text-slate-800 text-base truncate pr-1">{astro.displayName}</h3>
                                            <CheckCircle size={14} className="text-green-500 fill-green-50 flex-shrink-0" />
                                        </div>

                                        <div className="space-y-1 text-xs text-slate-500">
                                            <p className="truncate">{astro.skills.slice(0, 3).join(', ')}</p>
                                            <p className="truncate">{astro.languages.slice(0, 3).join(', ')}</p>
                                            <p className="font-medium">Exp: {astro.experienceYears} Years</p>
                                            <p className="font-bold text-slate-900">
                                                ₹{astro.charges.chatPerMinute}<span className="text-slate-400 font-normal">/min</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Action */}
                                    <div className="absolute bottom-4 right-4">
                                        <button
                                            className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-bold py-1.5 px-4 rounded-lg text-xs transition-all bg-white flex items-center justify-center gap-2 hover:scale-105 min-w-[90px]"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent double triggering
                                                handleChatClick(astro._id);
                                            }}
                                        >
                                            <MessageCircle size={14} /> Chat
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl shadow-xl border border-white/20">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Search size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No matches found</h3>
                                <p className="text-slate-500 max-w-xs mx-auto text-center">
                                    We couldn't find any astrologers matching "<span className="font-semibold text-slate-700">{searchTerm}</span>". Try checking for typos.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div >
    );
}
