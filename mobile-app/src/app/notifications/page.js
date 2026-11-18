"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Clock, CheckCircle2, X, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        if (user?._id && !user.isGuest) {
            fetchNotifications();
        } else {
            setLoading(false);
            setNotifications([]);
        }
    }, [user?._id, user?.isGuest]);

    const fetchNotifications = async () => {
        if (!user || user.isGuest) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await api.get("/notifications/my");
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unreadCount || 0);
                if (setUser) {
                    setUser(prev => {
                        if (!prev || prev.unreadNotifications === res.data.unreadCount) return prev;
                        return { ...prev, unreadNotifications: res.data.unreadCount || 0 };
                    });
                }
            }
        } catch (error) {
            console.warn("Notice: Failed to fetch notifications:", error);
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
                setSelectedNotification(prev =>
                    prev && prev._id === id ? { ...prev, readBy: [...(prev.readBy || []), user?._id] } : prev
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                if (setUser) {
                    setUser(prevUser => prevUser ? {
                        ...prevUser,
                        unreadNotifications: Math.max(0, (prevUser.unreadNotifications || 1) - 1)
                    } : prevUser);
                }
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleNotificationClick = (n) => {
        setSelectedNotification(n);
        const isRead = Array.isArray(n.readBy) && user?._id ? n.readBy.includes(user._id) : false;
        if (!isRead) {
            markAsRead(n._id);
        }
    };

    // Format date strictly as dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format date with time for popup modal: dd/mm/yyyy at hh:mm AM/PM
    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const formattedHours = String(hours).padStart(2, '0');
        return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
    };

    // Extract first link found in message or explicit actionLink
    const extractLink = (message, actionLink) => {
        if (actionLink && typeof actionLink === 'string' && actionLink.trim()) {
            return actionLink.trim();
        }
        if (!message) return null;
        const match = message.match(/(https?:\/\/[^\s]+)/i);
        return match ? match[0] : null;
    };

    const getCtaDetails = (url) => {
        if (!url) return null;
        const lower = url.toLowerCase();
        if (lower.includes('whatsapp.com') || lower.includes('chat.whatsapp') || lower.includes('wa.me')) {
            return {
                label: 'Join WhatsApp Channel',
                bg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
            };
        }
        if (lower.includes('form') || lower.includes('forms.gle')) {
            return {
                label: 'Open Form',
                bg: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40'
            };
        }
        if (lower.includes('t.me') || lower.includes('telegram')) {
            return {
                label: 'Join Telegram Channel',
                bg: 'bg-sky-600 hover:bg-sky-500 shadow-sky-950/40'
            };
        }
        return {
            label: 'Open Link',
            bg: 'bg-electric-violet hover:bg-purple-600 shadow-purple-950/40'
        };
    };

    const handleOpenLink = (url) => {
        if (!url) return;
        const trimmed = url.trim();
        if (/^(https?:\/\/|whatsapp:\/\/|intent:\/\/)/i.test(trimmed)) {
            window.open(trimmed, '_blank');
        } else {
            router.push(trimmed.startsWith('/') ? trimmed : `/${trimmed}`);
            setSelectedNotification(null);
        }
    };

    // Render text with clickable links
    const renderMessageWithLinks = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(part, '_blank');
                        }}
                        className="text-solar-gold font-bold underline break-all hover:text-yellow-300 transition-colors inline-flex items-center gap-1 mx-1"
                    >
                        <span>{part}</span>
                        <ExternalLink size={12} className="inline shrink-0" />
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="min-h-screen pb-32 animate-in fade-in duration-500 px-4 pt-safe">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pt-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Cosmic Alerts</h1>
                        {unreadCount > 0 ? (
                            <p className="text-[10px] text-solar-gold font-bold uppercase tracking-widest mt-0.5">{unreadCount} Unread</p>
                        ) : (
                            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">All caught up</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={fetchNotifications}
                    className="text-[10px] font-black text-electric-violet uppercase tracking-widest px-3.5 py-2 bg-electric-violet/15 border border-electric-violet/30 rounded-full active:scale-95 transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                >
                    Refresh
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-electric-violet animate-spin" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Checking Stars...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center text-slate-500 mb-5 shadow-2xl">
                            <Bell size={36} />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">No Notifications</h3>
                        <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">Your celestial journey is serene. We will alert you whenever the cosmos has news for you!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((n, index) => {
                            const isRead = Array.isArray(n.readBy) && user?._id ? n.readBy.includes(user._id) : false;
                            return (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`relative rounded-[22px] p-4.5 border transition-all active:scale-[0.98] cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${
                                        !isRead
                                            ? "bg-[#101438]/80 border-electric-violet/40 ring-1 ring-electric-violet/30"
                                            : "bg-white/[0.03] border-white/10 hover:border-white/20 opacity-90"
                                    }`}
                                >
                                    {/* Card Header: Title & New Badge */}
                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <h4 className={`text-sm font-bold leading-snug line-clamp-1 flex-1 ${!isRead ? "text-white" : "text-slate-200"}`}>
                                            {n.title}
                                        </h4>
                                        {!isRead && (
                                            <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-solar-gold/20 text-solar-gold border border-solar-gold/30 shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-solar-gold animate-pulse" />
                                                New
                                            </span>
                                        )}
                                    </div>

                                    {/* Limited strictly to first 3 lines */}
                                    <p
                                        className="text-xs text-slate-400 leading-relaxed mb-3 break-words line-clamp-3"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {n.message}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium tracking-wide">
                                                <Clock size={11} className="opacity-70" />
                                                {formatDate(n.createdAt)}
                                            </div>
                                            {isRead && (
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium tracking-wide">
                                                    <CheckCircle2 size={11} />
                                                    Seen
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-electric-violet hover:text-purple-300 font-bold uppercase tracking-wider flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                            Read More <ChevronRight size={12} />
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Bottom Tip */}
            {!loading && notifications.length > 0 && (
                <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-8 pb-10">
                    Showing latest celestial alerts
                </p>
            )}

            {/* Notification Popup Modal */}
            <AnimatePresence>
                {selectedNotification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNotification(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md bg-[#0c102a]/95 border border-white/15 rounded-[28px] p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-left backdrop-blur-3xl"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 inline-block mb-1.5 border border-white/10">
                                        {selectedNotification.targetAudience === 'astrologers'
                                            ? 'Astrologer Alert'
                                            : selectedNotification.targetAudience === 'users'
                                            ? 'Special Update'
                                            : 'Announcement'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                        <Clock size={11} />
                                        <span>
                                            {formatDateTime(selectedNotification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center active:scale-90 transition-all border border-white/15 shrink-0"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Full Title */}
                            <h3 className="text-base sm:text-lg font-black text-white leading-snug mb-3 pr-2">
                                {selectedNotification.title}
                            </h3>

                            {/* Full Message with Clickable Links (Scrollable) */}
                            <div className="overflow-y-auto max-h-[46vh] my-1 pr-1 text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap border-y border-white/10 py-3.5 custom-scrollbar">
                                {renderMessageWithLinks(selectedNotification.message)}
                            </div>

                            {/* CTA Button if a URL is present */}
                            {(() => {
                                const actionUrl = extractLink(selectedNotification.message, selectedNotification.actionLink);
                                if (!actionUrl) return null;
                                const cta = getCtaDetails(actionUrl);
                                return (
                                    <button
                                        onClick={() => handleOpenLink(actionUrl)}
                                        className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 mt-3 ${cta.bg}`}
                                    >
                                        <span>{cta.label}</span>
                                        <ExternalLink size={14} />
                                    </button>
                                );
                            })()}

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-98 text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-all mt-2.5 border border-white/10"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

