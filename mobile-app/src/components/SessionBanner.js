"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle, Clock, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SessionBanner() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [activeSession, setActiveSession] = useState(null);
    const [duration, setDuration] = useState(0);

    // Don't show on the chat page itself
    const isChatPage = pathname.includes("/chat/");

    useEffect(() => {
        if (user && !isChatPage) {
            checkActiveSession();
            const interval = setInterval(checkActiveSession, 30000); // Check every 30s
            return () => clearInterval(interval);
        } else {
            setActiveSession(null);
        }
    }, [user, pathname]);

    // Internal timer for local UI update
    useEffect(() => {
        let timer;
        if (activeSession && activeSession.status === 'active') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [activeSession]);

    const checkActiveSession = async () => {
        try {
            const { data } = await api.get("/chat/active-session");
            if (data.success && data.session) {
                setActiveSession(data.session);
                if (data.session.status === 'active' && data.session.startTime) {
                    const start = new Date(data.session.startTime);
                    const now = new Date();
                    setDuration(Math.floor((now - start) / 1000));
                } else {
                    setDuration(0);
                }
            } else {
                setActiveSession(null);
            }
        } catch (err) {
            console.error("Failed to check active session", err);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!activeSession || isChatPage) return null;

    const isAstrologer = user?.role === 'astrologer';
    const partner = isAstrologer ? activeSession.userId : activeSession.astrologerId;
    const partnerName = partner?.displayName || partner?.name || "Partner";
    const partnerImage = partner?.image || partner?.profileImage || `https://ui-avatars.com/api/?name=${partnerName}&background=random`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 z-[999]"
            >
                <div
                    className="glass-panel border-electric-violet/30 bg-electric-violet/10 backdrop-blur-xl p-4 rounded-3xl flex items-center justify-between shadow-2xl shadow-electric-violet/20"
                    onClick={() => {
                        if (!activeSession.roomId) {
                            alert("Error: Room ID is missing from active session!");
                            return;
                        }
                        router.push(`/chat/room?id=${activeSession.roomId}`);
                        setTimeout(() => {
                            if (!window.location.pathname.includes('/chat/room')) {
                                window.location.href = `/chat/room?id=${activeSession.roomId}`;
                            }
                        }, 500);
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-electric-violet overflow-hidden">
                                <img
                                    src={partnerImage}
                                    alt={partnerName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-cosmic-indigo animate-pulse" />
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-electric-violet mb-0.5">Active Consultation</p>
                            <h4 className="text-white font-bold text-sm leading-tight">{partnerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-xs font-mono font-bold text-slate-300">{formatTime(duration)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-electric-violet text-white p-2.5 rounded-2xl shadow-lg shadow-electric-violet/40">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
