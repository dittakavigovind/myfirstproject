'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { SERVER_BASE } from '../../../lib/urlHelper';
import toast from 'react-hot-toast';

export default function ChatRoomClient() {
    const [roomId, setRoomId] = useState(null);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [duration, setDuration] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(null);
    const [isAstroTyping, setIsAstroTyping] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Extract Room ID from URL (since this is a catch-all route handled by backend proxy)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const idFromQuery = urlParams.get('id') || urlParams.get('roomId');

            if (idFromQuery) {
                setRoomId(idFromQuery);
                return;
            }

            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const idFromPath = pathParts[pathParts.length - 1];
            if (idFromPath && idFromPath !== 'astrology-session' && idFromPath !== 'chat-session') {
                setRoomId(idFromPath);
            }
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && roomId) {
            const token = user.token || localStorage.getItem('token');
            const newSocket = io(SERVER_BASE, {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                newSocket.emit('join_chat_session', { roomId });
            });

            newSocket.on('session_started', ({ startTime }) => {
                setSessionActive(true);
                toast.success('Chat Session Started');
            });

            newSocket.on('session_restored', ({ startTime, duration }) => {
                setSessionActive(true);
                setDuration(duration);
            });

            newSocket.on('receive_session_message', (message) => {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
                if (message.senderModel !== (user.role === 'astrologer' ? 'Astrologer' : 'User')) {
                    playNotificationSound();
                }
            });

            newSocket.on('timer_update', ({ duration, remainingBalance }) => {
                setDuration(duration);
                setRemainingBalance(remainingBalance);
            });

            newSocket.on('balance_warning', ({ message }) => {
                toast.error(message, { duration: 5000 });
            });

            newSocket.on('user_typing', ({ role }) => {
                if (role !== user.role) setIsAstroTyping(true);
            });

            newSocket.on('user_stop_typing', ({ role }) => {
                if (role !== user.role) setIsAstroTyping(false);
            });

            newSocket.on('session_ended', ({ reason, totalDuration, totalDeducted }) => {
                setSessionActive(false);
                toast.error(`Session Ended: ${reason}`);
            });

            newSocket.on('error', (err) => {
                toast.error(err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, authLoading, roomId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send_session_message', { roomId, content: newMessage });
        setNewMessage('');
        socket.emit('stop_typing', { roomId });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket) {
            socket.emit('typing', { roomId });
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Audio play blocked'));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (authLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!roomId) return <div className="p-8 text-center">Identifying session...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100 pt-20">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                        {user?.role === 'astrologer' ? 'U' : 'A'}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">
                            {user?.role === 'astrologer' ? 'User Interaction' : 'Chat with Astrologer'}
                        </h2>
                        <p className="text-xs text-green-500 font-medium tracking-wide uppercase">
                            {sessionActive ? 'Active Session' : 'Connecting...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Timer</p>
                        <p className="text-xl font-mono font-bold text-gray-800">{formatTime(duration)}</p>
                    </div>
                    {user?.role === 'user' && remainingBalance !== null && (
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold">Balance</p>
                            <p className="text-xl font-bold text-purple-600">₹{remainingBalance.toFixed(2)}</p>
                        </div>
                    )}
                    <button
                        onClick={() => socket?.emit('end_chat_session', { roomId })}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 font-semibold transition-colors"
                    >
                        End Chat
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <p>Starting chat... please wait for a response.</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.senderModel === (user.role === 'astrologer' ? 'Astrologer' : 'User');
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {isAstroTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl border border-gray-100">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white p-4 border-t shadow-[0_-4px_6_rgba(0,0,0,0.01)]">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
