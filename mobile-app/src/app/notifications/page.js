"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellRing, Trash2, Clock, CheckCircle2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get("/notifications/my");
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await api.put(`/notifications/${id}/read`);
            if (res.data.success) {
                setNotifications(prev => 
                    prev.map(n => n._id === id ? { ...n, readBy: [...(n.readBy || []), user?._id] } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const getIcon = (audience) => {
        switch (audience) {
            case 'astrologers': return <BellRing size={18} className="text-solar-gold" />;
            case 'users': return <Bell size={18} className="text-blue-400" />;
            default: return <Info size={18} className="text-electric-violet" />;
        }
    };

    return (
        <div className="pb-32 animate-in fade-in duration-500 px-4 pt-[var(--safe-area-inset-top)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pt-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 bg-white/5 rounded-full text-white/60 hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-white uppercase tracking-widest">Inbox</h1>
                        {unreadCount > 0 && <p className="text-[10px] text-solar-gold font-bold uppercase tracking-widest">{unreadCount} New Messages</p>}
                    </div>
                </div>
                <button 
                    onClick={fetchNotifications}
                    className="text-[10px] font-black text-electric-violet uppercase tracking-widest px-3 py-1.5 bg-electric-violet/10 rounded-full"
                >
                    Refresh
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 rounded-full border-t-2 border-electric-violet animate-spin" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Checking Stars...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-slate-700 mb-6">
                            <Bell size={40} />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">No Notifications</h3>
                        <p className="text-xs text-slate-500 font-bold px-10">Your celestial journey is calm. We'll alert you for important updates!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((n, index) => {
                            const isRead = n.readBy?.includes(user?._id);
                            return (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => !isRead && markAsRead(n._id)}
                                    className={`relative glass-panel rounded-3xl p-5 border-white/5 transition-all active:scale-[0.98] ${
                                        !isRead ? "bg-white/10 border-electric-violet/30" : "bg-white/5 opacity-80"
                                    }`}
                                >
                                    {!isRead && (
                                        <div className="absolute top-5 right-5 w-2 h-2 bg-solar-gold rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                    )}
                                    
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                            !isRead ? "bg-electric-violet/20" : "bg-slate-800"
                                        }`}>
                                            {getIcon(n.targetAudience)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-black truncate pr-4 ${!isRead ? "text-white" : "text-slate-300"}`}>
                                                    {n.title}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-3 break-words">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                    <Clock size={10} />
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </div>
                                                {isRead && (
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                                                        <CheckCircle2 size={10} />
                                                        Seen
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Bottom Tip */}
            {!loading && notifications.length > 0 && (
                <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-12 pb-10">
                    Showing latest celestial alerts
                </p>
            )}
        </div>
    );
}
