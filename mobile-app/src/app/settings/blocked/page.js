"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserX, ShieldBan, Unlock } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlockedUsersPage() {
    const router = useRouter();
    const [blockedList, setBlockedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unblockingId, setUnblockingId] = useState(null);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/moderation/blocks');
            if (data.success) {
                setBlockedList(data.blocks);
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            toast.error("Failed to load blocked users");
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (blockedId) => {
        try {
            setUnblockingId(blockedId);
            const { data } = await api.post('/moderation/unblock', { blockedId });
            if (data.success) {
                toast.success("User unblocked successfully");
                setBlockedList(prev => prev.filter(b => b.blockedId?._id !== blockedId));
            }
        } catch (error) {
            console.error("Error unblocking user:", error);
            toast.error("Failed to unblock user");
        } finally {
            setUnblockingId(null);
        }
    };

    return (
        <main className="min-h-screen text-white font-sans flex flex-col pt-safe pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 z-40 relative sticky top-0 bg-[#050716]/80 backdrop-blur-2xl py-3.5 border-b border-white/5">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-all text-white/80 hover:text-white backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-black tracking-tight">Blocked Users</h2>
                    <p className="text-[10px] text-slate-400 font-medium">Privacy Moderation</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-electric-violet rounded-full animate-spin" />
                    </div>
                ) : blockedList.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center text-center mt-20"
                    >
                        <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center mb-4 text-slate-500 shadow-xl">
                            <ShieldBan size={36} />
                        </div>
                        <h3 className="text-lg font-black text-white mb-1.5">No Blocked Users</h3>
                        <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                            You haven't blocked anyone. Restricted users will appear here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {blockedList.map((block) => {
                                const user = block.blockedId;
                                if (!user) return null;

                                return (
                                    <motion.div
                                        key={block._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                                        className="flex items-center justify-between bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-4 rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                                    >
                                        <div className="flex items-center gap-3.5 overflow-hidden">
                                            <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                {user.profilePic || user.avatar || user.image ? (
                                                    <img src={user.profilePic || user.avatar || user.image} alt={user.name || user.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-electric-violet/15 text-electric-violet">
                                                        <UserX size={18} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <h4 className="font-bold text-white text-sm truncate">{user.name || user.displayName || 'Unknown User'}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium capitalize">{block.blockedModel}</p>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleUnblock(user._id)}
                                            disabled={unblockingId === user._id}
                                            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 active:scale-95 transition flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                                        >
                                            {unblockingId === user._id ? (
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Unlock size={13} />
                                            )}
                                            Unblock
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}
