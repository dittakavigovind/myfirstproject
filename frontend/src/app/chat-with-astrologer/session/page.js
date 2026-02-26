"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Smile } from 'lucide-react';
import API from '@/lib/api';
import { SERVER_BASE } from '@/lib/urlHelper';
import ConfirmationModal from '@/components/ConfirmationModal';

let socket;

export default function ChatPageWrapper() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-50 text-astro-navy font-bold">Loading Secure Chat...</div>}>
            <ChatPage />
        </Suspense>
    );
}

function ChatPage() {
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get('id');
    const router = useRouter();
    const { user, loading } = useAuth();
    const { featureFlags } = useTheme();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('Connecting...');
    const [astrologer, setAstrologer] = useState(null);
    const [chatSession, setChatSession] = useState(null);
    const [showEndChatModal, setShowEndChatModal] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Protect Route from Astrologers
    useEffect(() => {
        if (!loading && user && user.role === 'astrologer') {
            router.push('/astrologer/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Fetch Astrologer & Initialize Chat Session
    useEffect(() => {
        const initChat = async () => {
            if (!user || !astrologerId) return;

            try {
                // Fetch Astrologer
                const astroRes = await API.get(`/astro/astrologers/${astrologerId}`);
                if (astroRes.data.success) {
                    const astroData = astroRes.data.data;
                    setAstrologer(astroData);

                    // Resolve Partner ID (User ID) from Astrologer Profile
                    // Support both populated object and direct ID
                    const partnerId = astroData.userId._id || astroData.userId;

                    // Get or Create Chat Session
                    const chatRes = await API.post('/chat', { partnerId });
                    const chatData = chatRes.data;
                    setChatSession(chatData);

                    // Fetch Message History
                    const msgRes = await API.get(`/chat/${chatData._id}/messages`);
                    // Transform DB messages to UI format
                    const formattedMessages = msgRes.data.map(msg => ({
                        text: msg.content,
                        isUser: msg.sender._id === user._id || msg.sender === user._id, // handle populated or ID
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                    setMessages(formattedMessages);
                } else {
                    console.error("Astrologer not found");
                    router.push('/astrologers'); // Fallback
                }
                // Transform DB messages to UI format
                const formattedMessages = msgRes.data.map(msg => ({
                    text: msg.content,
                    isUser: msg.sender._id === user._id || msg.sender === user._id, // handle populated or ID
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(formattedMessages);

            } catch (err) {
                console.error("Failed to initialize chat", err);
            }
        };

        if (user && !loading) {
            initChat();
        }
    }, [astrologerId, user, loading]);

    // 2. Auth Check
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // 3. Socket Connection
    useEffect(() => {
        if (!user || !chatSession) return;

        socket = io(SERVER_BASE);

        socket.on('connect', () => {
            setStatus('Online');
            socket.emit('join_chat', chatSession._id);
            console.log("Joined room:", chatSession._id);
        });

        socket.on('receive_message', (msg) => {
            // Check if message is already in list (optional dedup) or just append
            // Transform incoming live message
            const newMsg = {
                text: msg.content,
                isUser: (msg.sender._id === user._id || msg.sender === user._id),
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, newMsg]);
        });

        socket.on('disconnect', () => setStatus('Offline'));

        return () => {
            socket.disconnect();
        };
    }, [user, chatSession]);

    if (loading || !user) return <div className="h-screen flex items-center justify-center bg-slate-50 text-astro-navy font-bold">Loading Secure Chat...</div>;

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !chatSession) return;

        const msgPayload = {
            roomId: chatSession._id,
            senderId: user._id,
            content: input
        };

        // Optimistic UI Update
        const optimisticMsg = {
            text: input,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        socket.emit('send_message', msgPayload);
        setInput('');
    };

    const handleStartCall = (type) => {
        if (!chatSession) return;
        // Use Chat Session ID as Channel Name
        router.push(`/call/session?id=${chatSession._id}&type=${type}`);
    };

    const confirmEndChat = () => {
        if (socket) {
            socket.disconnect();
        }
        setShowEndChatModal(false);
        router.push('/astrologers');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-100 !overflow-hidden relative">
            <ConfirmationModal
                isOpen={showEndChatModal}
                onClose={() => setShowEndChatModal(false)}
                onConfirm={confirmEndChat}
                title="End Confirmation"
                message="Are you sure you want to end this session? Your chat history will be saved."
                confirmText="End Chat"
                isDanger={true}
            />

            {/* Premium Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white px-4 py-4 shadow-xl z-30 flex justify-between items-center relative flex-shrink-0 border-b border-white/5">
                {/* Background Details */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10 transition-all cursor-pointer group" onClick={() => router.back()}>
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition backdrop-blur-md border border-white/5 group-hover:-translate-x-1 duration-300">
                        <ArrowLeft size={18} />
                    </button>

                    <div className="relative">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-astro-yellow via-amber-400 to-orange-500 shadow-lg shadow-orange-500/20">
                            <img
                                src={astrologer?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                className="w-full h-full rounded-full border-2 border-slate-900 object-cover"
                                alt="Astro"
                            />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[3px] border-slate-900 ${status === 'Online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`}></div>
                    </div>

                    <div>
                        <h1 className="font-bold text-base md:text-lg leading-tight tracking-tight text-white mb-0.5">{astrologer?.displayName || "Astrologer"}</h1>
                        <p className="text-[11px] md:text-xs text-indigo-200 font-medium flex items-center gap-1.5 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full w-fit backdrop-blur-sm border border-white/5">
                            {status === 'Online' ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                                </>
                            ) : status}
                            {astrologer && <span className="opacity-50">|</span>}
                            {astrologer && <span>₹{astrologer.charges.chatPerMinute}/min</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    {featureFlags?.enableCall && (
                        <>
                            <button
                                onClick={() => handleStartCall('audio')}
                                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition backdrop-blur-md border border-white/5 text-indigo-200 hover:text-white"
                                title="Voice Call"
                            >
                                <Phone size={18} />
                            </button>
                            <button
                                onClick={() => handleStartCall('video')}
                                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition backdrop-blur-md border border-white/5 text-indigo-200 hover:text-white"
                                title="Video Call"
                            >
                                <Video size={18} />
                            </button>
                            <div className="h-8 w-px bg-white/10 mx-1"></div>
                        </>
                    )}
                    <button
                        onClick={() => setShowEndChatModal(true)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-200 px-5 py-2 rounded-full text-xs font-bold transition border border-red-500/20 hover:border-red-500/40 uppercase tracking-wider backdrop-blur-md"
                    >
                        End Session
                    </button>
                </div>
            </div>

            {/* Messages Area - Premium Background */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 relative scroll-smooth" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #e2e8f0 1px, transparent 1px), radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.05), transparent 60%)`,
                backgroundSize: '24px 24px, 100% 100%'
            }}>
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {!msg.isUser && (
                                <img src={astrologer?.image} className="w-8 h-8 rounded-full border border-white shadow-sm mr-3 self-end mb-1 hidden md:block" alt="" />
                            )}
                            <div className={`max-w-[80%] md:max-w-[65%] p-4 rounded-[20px] shadow-sm text-sm relative group transition-all duration-300 ${msg.isUser
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-sm shadow-indigo-500/20'
                                : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100 shadow-slate-200/50'
                                }`}>
                                <p className="leading-relaxed tracking-wide">{msg.text}</p>
                                <span className={`text-[10px] mt-1.5 block text-right font-medium tracking-wider ${msg.isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {msg.time}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            {/* Premium Input Area - Grounded Glass Bar */}
            <div className="p-0 z-20 pointer-events-none relative">
                {/* Gradient Fade from chat area */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-100 via-slate-100/80 to-transparent pointer-events-none"></div>

                <div className="p-4 md:p-6 relative z-10">
                    {featureFlags?.enableChat ? (
                        <form onSubmit={sendMessage} className="pointer-events-auto max-w-5xl mx-auto flex items-end gap-3 bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300">
                            <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 transition rounded-full hover:bg-indigo-50 active:scale-95 flex-shrink-0">
                                <Paperclip size={20} />
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 py-3 text-sm md:text-base font-medium max-h-32"
                            />

                            <button type="button" className="p-3 text-slate-400 hover:text-amber-500 transition rounded-full hover:bg-amber-50 active:scale-95 hidden sm:block flex-shrink-0">
                                <Smile size={20} />
                            </button>

                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className={`p-3 md:p-3.5 rounded-[1.5rem] shadow-lg transition-all duration-300 flex items-center justify-center flex-shrink-0 ${input.trim()
                                    ? 'bg-gradient-to-r from-astro-navy to-indigo-600 text-white hover:shadow-indigo-500/30 hover:scale-105 active:scale-95'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                            </button>
                        </form>
                    ) : (
                        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-xl text-center shadow-lg border border-red-100 max-w-lg mx-auto pointer-events-auto">
                            <p className="text-slate-500 font-bold">Chat feature is currently disabled.</p>
                        </div>
                    )}
                    <div className="text-center mt-3 pointer-events-auto">
                        <p className="text-[10px] text-slate-400 font-bold tracking-wide flex items-center justify-center gap-1.5 opacity-60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            Encrypted & Secure
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
