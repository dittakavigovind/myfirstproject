'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { SERVER_BASE } from '../../../lib/urlHelper';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { X, Reply, Smile, Sparkles } from 'lucide-react';

import { auth, db } from '../../../lib/firebase';
import { signInWithCustomToken } from "firebase/auth";
import { collection, doc, onSnapshot, query, orderBy, setDoc, updateDoc, addDoc } from "firebase/firestore";

const ASTRO_EMOJIS = [
    "⭐", "🌟", "✨", "🌙", "☀️", "🪐", "🔮", "🕉️",
    "🪔", "🙏", "📿", "🧿", "♈", "♉", "♊", "♋",
    "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"
];

const EXPRESSION_EMOJIS = [
    "😊", "😇", "🥰", "😍", "🤩", "🤔", "🤫", "🥺",
    "🤍", "❤️", "💖", "💐", "🌺", "👍", "👏", "🙌"
];

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
    const [selectedImage, setSelectedImage] = useState(null);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const handleStartReply = (msg) => {
        if (isReadOnly) return;
        const isTargetMe = msg.senderId === user?._id || msg.senderModel === (user?.role === 'astrologer' ? 'Astrologer' : 'User');
        const targetSenderName = isTargetMe 
            ? 'You' 
            : (msg.senderModel === 'Astrologer' ? 'Astrologer' : 'Seeker');
        
        let snippet = msg.content || '';
        if (!snippet && msg.mediaUrl) {
            snippet = msg.mediaType?.startsWith('image/') ? '📷 Image' : '📄 File';
        }

        setReplyingTo({
            id: msg._id,
            content: snippet,
            senderModel: msg.senderModel || (isTargetMe ? (user?.role === 'astrologer' ? 'Astrologer' : 'User') : (user?.role === 'astrologer' ? 'User' : 'Astrologer')),
            senderName: targetSenderName,
            mediaUrl: msg.mediaUrl || null,
            mediaType: msg.mediaType || null
        });

        setShowEmojiPicker(false);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 50);
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Extract Room ID from URL
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
        // Lock body and html to prevent keyboard from pushing layout up on mobile browsers
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';

        return () => {
            // Restore body/html styles on unmount
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const authWithFirebase = async () => {
            try {
                const { data } = await api.get('/auth/firebase-token');
                if (data.success) {
                    await signInWithCustomToken(auth, data.customToken);
                    setFirebaseReady(true);
                }
            } catch (error) {
                console.error("Firebase auth error:", error);
            }
        };

        if (user && !firebaseReady) {
            authWithFirebase();
        }
    }, [user, authLoading, firebaseReady, router]);

    // Socket listeners for Session/Timer Control
    useEffect(() => {
        if (user && roomId) {
            const token = user.token || localStorage.getItem('token');
            const newSocket = io(SERVER_BASE, {
                auth: { token }
            });

            newSocket.on('connect', () => {
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

            newSocket.on('timer_update', ({ duration, remainingBalance }) => {
                setDuration(duration);
                setRemainingBalance(remainingBalance);
            });

            newSocket.on('balance_warning', ({ message }) => {
                toast.error(message, { duration: 5000 });
            });

            newSocket.on('session_ended', ({ reason }) => {
                setSessionActive(false);
                setIsReadOnly(true);
                // toast.error(`Session Ended: ${reason}`); // Disabled to improve UX
                // setTimeout(() => router.back(), 3000);
            });

            newSocket.on('error', (err) => {
                toast.error(err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, roomId]);

    // Check if session is already completed when loading
    useEffect(() => {
        if (!roomId) return;
        const checkSessionStatus = async () => {
            try {
                const { data } = await api.get(`/chat/session/${roomId}/metadata`);
                if (data.success && data.session) {
                    if (['completed', 'terminated', 'failed', 'missed'].includes(data.session.status)) {
                        setIsReadOnly(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching session status:", err);
            }
        };
        checkSessionStatus();
    }, [roomId]);

    // Firebase listeners for Messages and Typing
    useEffect(() => {
        if (!firebaseReady || !roomId || !user) return;

        const messagesRef = collection(db, 'chat_sessions', roomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            let newMsgCount = 0;
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    // Play sound if not my message
                    if (data.senderId !== user._id) {
                        newMsgCount++;
                    }
                }
            });

            if (newMsgCount > 0) {
                playNotificationSound();
            }

            snapshot.forEach(document => {
                const data = document.data();
                let ts = data.createdAt;
                if (ts && typeof ts === 'object') {
                    if (typeof ts.toMillis === 'function') ts = ts.toMillis();
                    else if (typeof ts.toDate === 'function') ts = ts.toDate().getTime();
                    else if (ts._seconds !== undefined) ts = ts._seconds * 1000 + Math.floor((ts._nanoseconds || 0) / 1000000);
                    else if (ts.seconds !== undefined) ts = ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000);
                } else if (typeof ts === 'string') {
                    const parsed = new Date(ts).getTime();
                    if (!isNaN(parsed)) ts = parsed;
                }
                msgs.push({ _id: document.id, ...data, createdAt: typeof ts === 'number' ? ts : Date.now() });
            });
            msgs.sort((a, b) => a.createdAt - b.createdAt);
            setMessages(msgs);

            msgs.forEach(msg => {
                if (msg.senderId !== user._id && msg.status !== 'seen') {
                    updateDoc(doc(db, 'chat_sessions', roomId, 'messages', msg._id), { status: 'seen' });
                }
            });
        });

        const roomRef = doc(db, 'chat_sessions', roomId);
        const unsubRoom = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Real-time status update from Firestore
                if (data.status === 'active') {
                    setSessionActive(true);
                } else if (data.status === 'completed' || data.status === 'terminated') {
                    setIsReadOnly(true);
                    setSessionActive(false);
                }

                const partnerRole = user.role === 'astrologer' ? 'User' : 'Astrologer';
                if (data.typing && data.typing[partnerRole]) {
                    setIsAstroTyping(true);
                } else {
                    setIsAstroTyping(false);
                }
            }
        });

        // Set online status
        updateDoc(roomRef, {
            [`online.${user.role === 'astrologer' ? 'Astrologer' : 'User'}`]: true
        }).catch(err => {
            // Document might not exist if started quickly, ensure backend initializes it
            setDoc(roomRef, { [`online.${user.role === 'astrologer' ? 'Astrologer' : 'User'}`]: true }, { merge: true });
        });

        return () => {
            unsubscribe();
            unsubRoom();
        };
    }, [firebaseReady, roomId, user]);

    // Local Timer Increment
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !firebaseReady) return;

        const content = newMessage;
        setNewMessage('');

        const currentReply = replyingTo ? {
            id: replyingTo.id || null,
            content: replyingTo.content || '',
            senderModel: replyingTo.senderModel || '',
            senderName: replyingTo.senderName || '',
            mediaUrl: replyingTo.mediaUrl || null,
            mediaType: replyingTo.mediaType || null
        } : null;
        setReplyingTo(null);
        setShowEmojiPicker(false);

        try {
            const messagesRef = collection(db, 'chat_sessions', roomId, 'messages');
            const messagePayload = {
                content: content,
                senderId: user.astrologerId || user._id,
                senderModel: user.role === 'astrologer' ? 'Astrologer' : 'User',
                status: 'sent',
                createdAt: Date.now()
            };
            if (currentReply) {
                messagePayload.replyTo = currentReply;
            }
            await addDoc(messagesRef, messagePayload);

            const roomRef = doc(db, 'chat_sessions', roomId);
            await setDoc(roomRef, {
                typing: {
                    [user.role === 'astrologer' ? 'Astrologer' : 'User']: false
                }
            }, { merge: true });

            if (user.role === 'astrologer') {
                if (socket) socket.emit("start_chat_session", { roomId });
                api.post(`/chat/session/${roomId}/start`).catch(() => {});
                setSessionActive(true);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };

    let typingTimeout = useRef(null);
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (firebaseReady && user) {
            const roomRef = doc(db, 'chat_sessions', roomId);
            setDoc(roomRef, {
                typing: {
                    [user.role === 'astrologer' ? 'Astrologer' : 'User']: true
                }
            }, { merge: true });

            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                setDoc(roomRef, {
                    typing: {
                        [user.role === 'astrologer' ? 'Astrologer' : 'User']: false
                    }
                }, { merge: true });
            }, 2000);
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

    const formatDividerDateTime = (timestamp) => {
        if (!timestamp) return '';
        let ts = timestamp;
        if (typeof ts === 'object') {
            if (typeof ts.toMillis === 'function') ts = ts.toMillis();
            else if (typeof ts.toDate === 'function') ts = ts.toDate().getTime();
            else if (ts._seconds !== undefined) ts = ts._seconds * 1000 + Math.floor((ts._nanoseconds || 0) / 1000000);
            else if (ts.seconds !== undefined) ts = ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000);
        }
        const d = new Date(ts);
        if (isNaN(d.getTime())) return '';
        
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = d.toDateString() === yesterday.toDateString();

        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return `Today, ${timeStr}`;
        } else if (isYesterday) {
            return `Yesterday, ${timeStr}`;
        } else {
            const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            return `${dateStr}, ${timeStr}`;
        }
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
                    {!isReadOnly && (
                        <button
                            onClick={async () => {
                                try {
                                    const roomRef = doc(db, 'chat_sessions', roomId);
                                    await updateDoc(roomRef, {
                                        status: 'completed',
                                        endedAt: Date.now()
                                    });
                                } catch (e) {
                                    console.error("Failed to update firestore status:", e);
                                }
                                socket?.emit('end_chat_session', { roomId });
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 font-semibold transition-colors"
                        >
                            End Chat
                        </button>
                    )}
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
                    if (msg.isDivider || msg.senderId === 'system' || msg.senderRole === 'system') {
                        let rawText = msg.text || msg.content || '';
                        let displayText = '';

                        if (rawText && rawText.includes('•')) {
                            displayText = rawText.replace(/^━━\s*|\s*━━$/g, '').trim();
                        } else {
                            let dividerTime = msg.sessionStartTime || msg.startTime;
                            if (!dividerTime) {
                                const nextMsg = messages.slice(i + 1).find(m => !m.isHistory && !m.isDivider);
                                if (nextMsg && nextMsg.createdAt) {
                                    dividerTime = nextMsg.createdAt;
                                }
                            }
                            const formattedTime = dividerTime ? formatDividerDateTime(dividerTime) : '';
                            displayText = formattedTime 
                                ? `New Consultation • ${formattedTime}`
                                : 'New Consultation';
                        }

                        return (
                            <div key={msg.id || i} className="flex items-center justify-center my-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                    ━━ {displayText} ━━
                                </span>
                            </div>
                        );
                    }
                    const isMe = msg.senderId === user?._id || msg.senderModel === (user.role === 'astrologer' ? 'Astrologer' : 'User');
                    return (
                        <div key={msg._id || i} id={`msg-${msg._id || i}`} className={`flex items-end gap-1.5 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-center gap-1.5 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-full p-3 rounded-2xl shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                    }`}>
                                    {/* Quoted Message Preview */}
                                    {msg.replyTo && (
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (msg.replyTo.id) {
                                                    const el = document.getElementById(`msg-${msg.replyTo.id}`);
                                                    if (el) {
                                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        el.classList.add('ring-2', 'ring-purple-400');
                                                        setTimeout(() => el.classList.remove('ring-2', 'ring-purple-400'), 1500);
                                                    }
                                                }
                                            }}
                                            className={`mb-2 p-2 rounded-xl text-left cursor-pointer transition-colors border-l-4 ${
                                                isMe 
                                                    ? 'bg-black/20 hover:bg-black/30 border-amber-300 text-white' 
                                                    : 'bg-gray-100 hover:bg-gray-200 border-purple-500 text-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <span className={`text-[10px] font-bold tracking-tight truncate ${isMe ? 'text-amber-200' : 'text-purple-600'}`}>
                                                    {msg.replyTo.senderName || (msg.replyTo.senderModel === 'Astrologer' ? 'Astrologer' : 'Seeker')}
                                                </span>
                                                <Reply size={10} className="opacity-60 shrink-0" />
                                            </div>
                                            <p className="text-[11px] opacity-80 truncate line-clamp-1 select-none">
                                                {msg.replyTo.content || (msg.replyTo.mediaUrl ? 'Attachment' : '')}
                                            </p>
                                        </div>
                                    )}

                                    {msg.mediaUrl && (
                                        <div className="mb-2">
                                            {msg.mediaType?.startsWith('image/') ? (
                                                <img 
                                                    src={msg.mediaUrl} 
                                                    alt="attachment" 
                                                    className="max-h-48 rounded cursor-pointer hover:opacity-90 transition-opacity" 
                                                    onClick={() => setSelectedImage(msg.mediaUrl)}
                                                />
                                            ) : (
                                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline">Download File</a>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={() => handleStartReply(msg)}
                                        title="Reply"
                                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0 self-center"
                                    >
                                        <Reply size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {isAstroTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl border border-gray-100">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white p-4 border-t shadow-[0_-4px_6_rgba(0,0,0,0.01)]">
                {isReadOnly ? (
                    <div className="text-center py-2 text-gray-500 font-medium uppercase text-sm">
                        This session has ended.
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-2">
                        {/* Replying Preview Banner */}
                        {replyingTo && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 overflow-hidden flex-1 border-l-4 border-purple-600 pl-2.5">
                                    <Reply size={15} className="text-purple-600 shrink-0" />
                                    <div className="overflow-hidden flex-1 text-left">
                                        <p className="text-[11px] font-bold text-purple-700 leading-tight">
                                            Replying to {replyingTo.senderName}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate leading-snug">
                                            {replyingTo.content}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        )}

                        {/* Quick Emoji Picker Drawer */}
                        {showEmojiPicker && (
                            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
                                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-100">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                                        <Sparkles size={13} /> Emojis & Astro Icons
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(false)}
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Astro & Cosmic</p>
                                        <div className="grid grid-cols-12 gap-1 text-xl">
                                            {ASTRO_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => handleEmojiSelect(emoji)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 active:scale-90 transition transform"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Expressions & Blessings</p>
                                        <div className="grid grid-cols-12 gap-1 text-xl">
                                            {EXPRESSION_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => handleEmojiSelect(emoji)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 active:scale-90 transition transform"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(prev => !prev)}
                                className={`p-3 rounded-xl border transition-colors ${showEmojiPicker ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-gray-50 text-gray-500 border-gray-200 hover:text-purple-600'}`}
                                title="Emojis"
                            >
                                <Smile size={20} />
                            </button>
                            <input
                                ref={inputRef}
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
                )}
            </div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Zoomed attachment" 
                        className="max-w-full max-h-full object-contain rounded-lg cursor-default"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
}
