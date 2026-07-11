"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ban, RefreshCw, Calendar, UserX } from 'lucide-react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';

export default function BlockedUsersPage() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBlocks = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/blocked-users');
            if (res.data.success) {
                setBlocks(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load blocked users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    const getImageUrl = (user) => {
        if (!user) return null;
        return user.profilePic || user.image || user.avatar || null;
    };

    const getName = (user) => {
        if (!user) return 'Unknown';
        return user.displayName || user.name || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Ban className="text-orange-500" />
                        Blocked Users
                    </h1>
                    <p className="text-slate-400 mt-1">Monitor all user and astrologer block actions across the platform.</p>
                </div>
                <button
                    onClick={fetchBlocks}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition flex items-center justify-center shadow-lg active:scale-95"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : blocks.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                    <Ban size={48} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Blocked Users</h3>
                    <p className="text-slate-400 mt-2">No users or astrologers have blocked anyone yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {blocks.map((block) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={block._id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                                <div className="flex items-center gap-2 text-orange-400 font-bold bg-orange-500/10 px-3 py-1.5 rounded-lg w-fit">
                                    <Ban size={16} />
                                    Block Record
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Calendar size={14} />
                                    {new Date(block.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 relative">
                                {/* Direction Arrow for Desktop */}
                                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800 rounded-full items-center justify-center border border-slate-700 z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </div>

                                {/* Blocker */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Blocker (Action By)</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                                            {getImageUrl(block.blockerId) ? (
                                                <img src={getImageUrl(block.blockerId)} alt="Blocker" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500"><UserX size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{getName(block.blockerId)}</div>
                                            <div className="text-xs text-slate-400 capitalize">{block.blockerModel}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Blocked */}
                                <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
                                    <span className="text-xs font-bold text-orange-500/70 uppercase tracking-wider mb-3 block">Blocked (Target)</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-orange-500/20">
                                            {getImageUrl(block.blockedId) ? (
                                                <img src={getImageUrl(block.blockedId)} alt="Blocked" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500"><UserX size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-orange-100">{getName(block.blockedId)}</div>
                                            <div className="text-xs text-orange-400/70 capitalize">{block.blockedModel}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
