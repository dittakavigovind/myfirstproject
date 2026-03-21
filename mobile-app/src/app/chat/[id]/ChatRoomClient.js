"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Send, ArrowLeft, Clock, Wallet,
    MoreVertical, Info, AlertCircle, X,
    Calendar, User, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";

export default function ChatRoomClient() {
    // This should match your backend URL (without /api)
    const SOCKET_URL = "http://192.168.29.133:5000";

    const { id: roomId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sessionActive, setSessionActive] = useState(false);
    const [duration, setDuration] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(null);
    const [isAstroTyping, setIsAstroTyping] = useState(false);
    const [astrologer, setAstrologer] = useState(null);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
                    setAstrologer(data.session.astrologer);
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

    // 2. Socket Connection
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth");
            return;
        }

        if (user && roomId) {
            const token = localStorage.getItem("authToken"); // Or however you store it
            // Capacitor Preferences sync might be needed here if not in localStorage

            const newSocket = io(SOCKET_URL, {
                auth: { token: user.token }
            });

            newSocket.on("connect", () => {
                console.log("Connected to Cosmic Socket");
                newSocket.emit("join_chat_session", { roomId });
            });

            newSocket.on("session_started", () => {
                setSessionActive(true);
            });

            newSocket.on("session_restored", ({ duration: d }) => {
                setSessionActive(true);
                setDuration(d);
            });

            newSocket.on("receive_session_message", (message) => {
                setMessages((prev) => [...prev, message]);
                if (message.senderModel !== "User") {
                    // Play subtle sound or haptic feedback if possible
                }
            });

            newSocket.on("timer_update", ({ duration: d, remainingBalance: bal }) => {
                setDuration(d);
                setRemainingBalance(bal);
            });

            newSocket.on("user_typing", ({ role }) => {
                if (role === "astrologer") setIsAstroTyping(true);
            });

            newSocket.on("user_stop_typing", ({ role }) => {
                if (role === "astrologer") setIsAstroTyping(false);
            });

            newSocket.on("session_ended", ({ reason }) => {
                setSessionActive(false);
                // navigate back with a summary maybe?
                setTimeout(() => router.push("/chat"), 3000);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, authLoading, roomId]);

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

    return (
        <div className="flex flex-col h-screen bg-cosmic-indigo overflow-hidden">

            {/* Minimal Header */}
            <div className="glass-panel border-b border-white/5 px-4 py-3 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-slate-400 p-1">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center overflow-hidden">
                        <img src={astrologer?.image || astrologer?.profileImage || "https://i.pravatar.cc/100?u=astro"} alt="Astro" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-sm leading-tight">{astrologer?.displayName || astrologer?.name || "Astrologer Guide"}</h2>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${sessionActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {sessionActive ? 'Live Session' : 'Connecting...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-solar-gold justify-end">
                            <Clock size={12} />
                            <span className="text-xs font-mono font-bold">{formatTime(duration)}</span>
                        </div>
                        {remainingBalance !== null && (
                            <p className="text-[10px] text-slate-500 font-bold">₹{remainingBalance.toFixed(0)} bal</p>
                        )}
                    </div>
                    <button className="text-slate-400">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Warning Banner if balance low */}
            {remainingBalance !== null && remainingBalance < 20 && (
                <div className="bg-amber-500/20 border-b border-amber-500/20 px-4 py-1.5 flex items-center gap-2">
                    <AlertCircle size={12} className="text-amber-500" />
                    <span className="text-[10px] text-amber-200 font-bold">Low balance! Recharge soon to continue.</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
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
                    const isMe = msg.senderModel === "User";
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
                                <div className={`flex items-center justify-end gap-1.5 opacity-60`}>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && <Shield size={8} className="text-white/40" />}
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

            {/* Input Bar */}
            <div className="p-4 bg-gradient-to-t from-cosmic-indigo to-transparent relative z-20">
                <form
                    onSubmit={handleSend}
                    className="glass-panel border-white/10 rounded-2xl p-1.5 flex items-center shadow-2xl"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Ask the stars..."
                        className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 text-sm placeholder:text-slate-500 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${newMessage.trim()
                            ? 'bg-electric-violet text-white shadow-lg shadow-electric-violet/40 scale-100'
                            : 'bg-white/5 text-slate-600 scale-90'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            {/* Safe Area Spacer for iOS/Modern Android */}
            <div className="h-4" />
        </div>
    );
}
