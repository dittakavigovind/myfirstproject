"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Send, ArrowLeft, Clock, Wallet,
    MoreVertical, Info, AlertCircle, X,
    Calendar, User, Shield, Sparkles,
    Check, CheckCheck
} from "lucide-react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";
import UserKundliModal from "./UserKundliModal";

export default function ChatRoomClient() {
    // This should match your backend URL (without /api)
    const SOCKET_URL = "http://192.168.29.133:5000";

    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();

    console.log("ChatRoomClient MOUNTED! roomId:", roomId, "user:", user?.role);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sessionActive, setSessionActive] = useState(false);
    const [duration, setDuration] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(null);
    const [isAstroTyping, setIsAstroTyping] = useState(false);
    const [astrologer, setAstrologer] = useState(null);
    const [chatUser, setChatUser] = useState(null);
    const [showKundli, setShowKundli] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showLeavePrompt, setShowLeavePrompt] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleBack = () => {
        if (sessionActive) {
            setShowLeavePrompt(true);
        } else {
            router.back();
        }
    };

    const confirmEndSession = () => {
        if (socket) {
            socket.emit("end_chat_session", { roomId });
        }
        setShowLeavePrompt(false);
        // We wait for the 'session_ended' event to navigate back, or navigate immediately
        router.back();
    };

    // 1. Fetch Session & Astrologer Details
    useEffect(() => {
        if (user && roomId) {
            fetchSessionData();
        }
    }, [user, roomId]);

    const fetchSessionData = async () => {
        try {
            // We need to find which astrologer this session is with
            // In a real app, you'd have an endpoint GET /chat/session/:roomId
            // For now, let's assume we can get it or we just show "Astrologer"
            const { data } = await api.get(`/chat/session/${roomId}/messages`);
            if (data.success) {
                setMessages(data.messages || []);
                // If the session object is available in the response (need to check backend)
                if (data.session) {
                    setAstrologer(data.session.astrologerId || data.session.astrologer);
                    setChatUser(data.session.userId);
                }
            }
        } catch (err) {
            console.error("Failed to fetch session data", err);
        } finally {
            setLoading(false);
        }
    };

    // If session doesn't include astrologer details, fetch them separately
    useEffect(() => {
        if (!astrologer && messages.length > 0) {
            // Find astrologer ID from messages or session
            // For now, let's keep it minimal or add a fetch if needed
        }
    }, [messages, astrologer]);

    // 2. Socket Connection Listeners
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth");
            return;
        }

        if (user && roomId && socket) {
            socket.emit("join_chat_session", { roomId });

            const handleSessionStarted = ({ startTime }) => {
                setSessionActive(true);
                if (startTime) {
                    const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
                    setDuration(elapsed > 0 ? elapsed : 0);
                } else {
                    setDuration(0);
                }
            };

            const handleSessionRestored = ({ startTime, duration: d }) => {
                setSessionActive(true);
                if (startTime) {
                    const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
                    setDuration(elapsed > d ? elapsed : d);
                } else {
                    setDuration(d);
                }
            };

            const handleReceiveMessage = (message) => {
                setMessages((prev) => {
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                
                if (message.senderModel !== (user?.role === 'astrologer' ? 'Astrologer' : 'User')) {
                    socket.emit("message_delivered", { messageId: message._id });
                    if (document.hasFocus()) {
                        socket.emit("message_seen", { messageId: message._id });
                    }
                }
            };

            const handleStatusUpdate = ({ messageId, status }) => {
                setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, status } : m));
            };

            const handleTimerUpdate = ({ duration: d, remainingBalance: bal }) => {
                setDuration(prev => d > prev ? d : prev);
                setRemainingBalance(bal);
            };

            const handleUserTyping = ({ role }) => {
                if (role === "astrologer") setIsAstroTyping(true);
            };

            const handleUserStopTyping = ({ role }) => {
                if (role === "astrologer") setIsAstroTyping(false);
            };

            const handleSessionEnded = ({ reason }) => {
                setSessionActive(false);
                setTimeout(() => router.back(), 3000);
            };

            socket.on("session_started", handleSessionStarted);
            socket.on("session_restored", handleSessionRestored);
            socket.on("receive_session_message", handleReceiveMessage);
            socket.on("message_status_update", handleStatusUpdate);
            socket.on("timer_update", handleTimerUpdate);
            socket.on("user_typing", handleUserTyping);
            socket.on("user_stop_typing", handleUserStopTyping);
            socket.on("session_ended", handleSessionEnded);

            return () => {
                socket.off("session_started", handleSessionStarted);
                socket.off("session_restored", handleSessionRestored);
                socket.off("receive_session_message", handleReceiveMessage);
                socket.off("message_status_update", handleStatusUpdate);
                socket.off("timer_update", handleTimerUpdate);
                socket.off("user_typing", handleUserTyping);
                socket.off("user_stop_typing", handleUserStopTyping);
                socket.off("session_ended", handleSessionEnded);
                // Also leave room or emit something if needed? Handled on disconnect/end.
            };
        }
    }, [user, authLoading, roomId, socket]);
    
    // 3. Local UI Timer for smooth updates
    useEffect(() => {
        let interval;
        if (sessionActive) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive]);

    useEffect(scrollToBottom, [messages, isAstroTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit("send_session_message", { roomId, content: newMessage });
        setNewMessage("");
        socket.emit("stop_typing", { roomId });
        inputRef.current?.focus();
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket) {
            socket.emit("typing", { roomId });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading || authLoading) return <CosmicLoader message="Opening the cosmic portal..." />;

    const partner = user?.role === 'astrologer' ? chatUser : astrologer;

    return (
        <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-cosmic-indigo overflow-hidden relative">
            {/* Header */}
            <div className="flex-none z-30 glass-panel border-b border-white/5 px-3 pb-3 pt-safe flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={handleBack} className="text-slate-400 p-1 shrink-0">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={partner?.image || partner?.profileImage || "https://i.pravatar.cc/100?u=astro"} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <h2 className="text-white font-bold text-xs leading-tight truncate">
                            {partner?.displayName || partner?.name || (user?.role === 'astrologer' ? "Seeker" : "Astrologer Guide")}
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1 h-1 rounded-full ${sessionActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                {sessionActive ? 'Live' : 'Connect'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {user?.role === 'astrologer' && chatUser && (
                        <button onClick={() => setShowKundli(true)} className="text-electric-violet bg-electric-violet/10 p-1.5 rounded-lg border border-electric-violet/30 flex items-center gap-1 active:scale-95 transition-transform">
                            <Sparkles size={12} />
                            <span className="text-[8px] font-black uppercase">Kundali</span>
                        </button>
                    )}
                    
                    <div className="flex flex-col items-end mr-1">
                        <div className="flex items-center gap-1 text-solar-gold">
                            <Clock size={10} className={sessionActive ? "animate-pulse" : ""} />
                            <span className="text-[11px] font-mono font-black tabular-nums">{formatTime(duration)}</span>
                        </div>
                        {remainingBalance !== null && (
                            <span className="text-[7px] text-slate-500 font-bold uppercase">₹{remainingBalance.toFixed(0)}</span>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setShowLeavePrompt(true)}
                        className="bg-rose-500 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-lg shadow-rose-500/20"
                    >
                        End
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {showLeavePrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-500/20 blur-[50px] rounded-full pointer-events-none" />
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                                    <AlertCircle size={28} className="text-rose-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">End Consultation?</h3>
                                <p className="text-sm text-slate-400 mb-6 font-medium">
                                    Leaving this screen will permanently end the current session. Are you sure you want to leave?
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={confirmEndSession}
                                        className="w-full py-3.5 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30 active:scale-95 transition-transform"
                                    >
                                        Yes, End Session
                                    </button>
                                    <button
                                        onClick={() => setShowLeavePrompt(false)}
                                        className="w-full py-3.5 rounded-xl bg-white/5 text-slate-300 font-bold text-sm border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                                    >
                                        Cancel, Stay Here
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Warning Banner if balance low */}
            {remainingBalance !== null && remainingBalance < 20 && (
                <div className="bg-amber-500/20 border-b border-amber-500/20 px-4 py-1.5 flex items-center gap-2">
                    <AlertCircle size={12} className="text-amber-500" />
                    <span className="text-[10px] text-amber-200 font-bold">Low balance! Recharge soon to continue.</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth">
                {messages.length === 0 && !isAstroTyping && (
                    <div className="text-center py-20 opacity-30 select-none">
                        <div className="w-16 h-16 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-4">
                            <Shield size={24} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white">Secure Cosmic Channel</p>
                        <p className="text-[10px] text-slate-400 mt-2 px-10">Your consultation is private and protected by the stars.</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isMe = msg.senderModel === (user?.role === 'astrologer' ? 'Astrologer' : 'User');
                    const isSent = msg.status === 'sent';
                    const isDelivered = msg.status === 'delivered';
                    const isSeen = msg.status === 'seen';
                    
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl relative shadow-2xl transition-all ${isMe
                                ? 'bg-gradient-to-br from-electric-violet to-purple-600 text-white rounded-tr-none border border-white/10'
                                : 'glass-panel bg-white/5 border border-white/10 text-slate-100 rounded-tl-none'
                                }`}>
                                <p className="text-[13px] font-medium leading-relaxed mb-1">{msg.content}</p>
                                <div className={`flex items-center ${isMe ? 'justify-end' : 'justify-start'} gap-1.5 opacity-60`}>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        <span className="flex items-center">
                                            {isSeen ? (
                                                <CheckCheck size={12} className="text-sky-300" />
                                            ) : isDelivered ? (
                                                <CheckCheck size={12} className="text-white/70" />
                                            ) : (
                                                <Check size={12} className="text-white/50" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Typing Indicator */}
                <AnimatePresence>
                    {isAstroTyping && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-electric-violet rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-electric-violet rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-electric-violet rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Bar - WhatsApp Style */}
            <div className="flex-none z-30 px-3 pt-2 pb-safe bg-cosmic-indigo/90 backdrop-blur-xl border-t border-white/5">
                <form
                    onSubmit={handleSend}
                    className="flex items-end gap-2 max-w-md mx-auto mb-2"
                >
                    <div className="flex-1 glass-panel border-white/10 rounded-[24px] p-1.5 flex items-center shadow-2xl min-h-[48px]">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={newMessage}
                            onChange={(e) => {
                                handleTyping(e);
                                e.target.style.height = 'inherit';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            placeholder="Ask the stars..."
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 text-sm placeholder:text-slate-500 font-medium resize-none max-h-32"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${newMessage.trim()
                            ? 'bg-electric-violet text-white shadow-lg shadow-electric-violet/40 scale-100 rotate-0'
                            : 'bg-white/10 text-slate-600 scale-90 -rotate-12'
                            }`}
                    >
                        <Send size={20} className={newMessage.trim() ? "translate-x-0.5" : ""} />
                    </button>
                </form>
            </div>

            {/* Safe Area Spacer removed in favor of pb-safe */}

            {/* Astrologer Kundali Modal */}
            <UserKundliModal 
                isOpen={showKundli} 
                onClose={() => setShowKundli(false)} 
                chatUser={chatUser} 
            />
        </div>
    );
}
