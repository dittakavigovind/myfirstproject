'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { SERVER_BASE } from '../../../lib/urlHelper';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

import { auth, db } from '../../../lib/firebase';
import { signInWithCustomToken } from "firebase/auth";
import { collection, doc, onSnapshot, query, orderBy, setDoc, updateDoc, addDoc } from "firebase/firestore";

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
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const messagesEndRef = useRef(null);

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
                const { data } = await api.get(`/chat/session/${roomId}/messages`);
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
                msgs.push({ _id: document.id, ...document.data() });
            });
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
                if (data.status === 'completed' || data.status === 'terminated') {
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

        try {
            const messagesRef = collection(db, 'chat_sessions', roomId, 'messages');
            await addDoc(messagesRef, {
                content: content,
                senderId: user.astrologerId || user._id,
                senderModel: user.role === 'astrologer' ? 'Astrologer' : 'User',
                status: 'sent',
                createdAt: Date.now()
            });

            const roomRef = doc(db, 'chat_sessions', roomId);
            await setDoc(roomRef, {
                typing: {
                    [user.role === 'astrologer' ? 'Astrologer' : 'User']: false
                }
            }, { merge: true });

            if (user.role === 'astrologer' && socket && !sessionActive) {
                socket.emit("start_chat_session", { roomId });
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
                    const isMe = msg.senderId === user?._id || msg.senderModel === (user.role === 'astrologer' ? 'Astrologer' : 'User');
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                }`}>
                                {msg.mediaUrl && (
                                    <div className="mb-2">
                                        {msg.mediaType?.startsWith('image/') ? (
                                            <img src={msg.mediaUrl} alt="attachment" className="max-h-48 rounded" />
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
                )}
            </div>
        </div>
    );
}
