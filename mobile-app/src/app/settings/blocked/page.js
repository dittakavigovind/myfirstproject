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
        <main className="min-h-screen bg-[#0b1026] text-white font-sans flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 px-5 z-40 relative sticky top-0 bg-[#0b1026]/90 backdrop-blur-md py-4 border-b border-white/5">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">Blocked Users</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : blockedList.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center text-center mt-20"
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                            <ShieldBan size={40} className="text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Blocked Users</h3>
                        <p className="text-sm text-slate-400 max-w-[250px] mx-auto">
                            You haven't blocked anyone. Users you block will appear here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {blockedList.map((block) => {
                                const user = block.blockedId;
                                // Handle case where user might have been deleted but block record remains
                                if (!user) return null;

                                return (
                                    <motion.div
                                        key={block._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                                        className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                {user.profilePic || user.avatar || user.image ? (
                                                    <img src={user.profilePic || user.avatar || user.image} alt={user.name || user.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500/20 text-indigo-400">
                                                        <UserX size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <h4 className="font-bold text-white text-base truncate">{user.name || user.displayName || 'Unknown User'}</h4>
                                                <p className="text-xs text-slate-400 capitalize">{block.blockedModel}</p>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleUnblock(user._id)}
                                            disabled={unblockingId === user._id}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-white/10 active:scale-95 transition flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                                        >
                                            {unblockingId === user._id ? (
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Unlock size={14} />
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
