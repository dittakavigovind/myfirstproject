"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Send, ArrowLeft, Clock, Wallet,
    MoreVertical, Info, AlertCircle, X,
    Calendar, User, Shield, Sparkles, Grid,
    Check, CheckCheck, Paperclip, Star
} from "lucide-react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";
import UserKundliModal from "./UserKundliModal";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import { maskUserName, containsContactInfo, getContactViolationType, containsAbusiveLanguage } from "@/utils/maskUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from '@capacitor/keyboard';
import toast from 'react-hot-toast';

import { auth, db, storage } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { collection, doc, onSnapshot, query, orderBy, setDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function ChatRoomClient() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId") || searchParams.get("id");
    const { user, loading: authLoading, checkUser } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sessionActive, setSessionActive] = useState(false);
    const [duration, setDuration] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(null);
    const [viewportHeight, setViewportHeight] = useState('100dvh');

    // Ref to track status transitions for robust end-session detection
    const previousStatusRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.visualViewport) {
            const handleResize = () => {
                setViewportHeight(`${window.visualViewport.height}px`);
            };
            window.visualViewport.addEventListener('resize', handleResize);
            handleResize();
            return () => window.visualViewport.removeEventListener('resize', handleResize);
        }
    }, []);
    const [isAstroTyping, setIsAstroTyping] = useState(false);
    const [astrologer, setAstrologer] = useState(null);
    const [chatUser, setChatUser] = useState(null);
    const [showKundli, setShowKundli] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showLeavePrompt, setShowLeavePrompt] = useState(false);
    const [showEndedPopup, setShowEndedPopup] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    const [showAstroLeavePrompt, setShowAstroLeavePrompt] = useState(false);
    const [astroEndReason, setAstroEndReason] = useState("");
    const [customAstroReason, setCustomAstroReason] = useState("");
    const [sessionTerminationReason, setSessionTerminationReason] = useState(null);

    // Low Balance
    const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
    const [lowBalanceMinutes, setLowBalanceMinutes] = useState(2);
    const hasShown2MinPromptRef = useRef(false);
    const hasShown1MinPromptRef = useRef(false);
    const [rechargeProcessing, setRechargeProcessing] = useState(false);

    const isEndingSessionRef = useRef(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    
    const [firebaseReady, setFirebaseReady] = useState(false);

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const localStartTimeRef = useRef(null);
    const isReadOnlyRef = useRef(false);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    const handleBack = () => {
        if (sessionActive) {
            if (user?.role === 'astrologer') {
                router.back();
            } else {
                setShowLeavePrompt(true);
            }
        } else {
            router.back();
        }
    };

    const handleEndClick = () => {
        if (user?.role === 'astrologer') {
            if (duration < 180) {
                toast.error("You cannot end the session before 3 minutes.");
                return;
            }
            setShowAstroLeavePrompt(true);
        } else {
            setShowLeavePrompt(true);
        }
    };

    const confirmEndSession = async () => {
        isEndingSessionRef.current = true;
        try {
            // Update Firestore first so the user sees it immediately
            const roomRef = doc(db, 'chat_sessions', roomId);
            await updateDoc(roomRef, {
                status: 'completed',
                endedAt: Date.now(),
                endedByRole: user.role
            });
        } catch (e) {
            console.error("Failed to update firestore status:", e);
        }

        try {
            let payload = {};
            if (user?.role === 'astrologer') {
                const finalReason = astroEndReason === 'Other' ? customAstroReason : astroEndReason;
                payload.astrologerEndReason = finalReason || 'Session completed';
            }
            await api.post(`/chat/session/${roomId}/end`, payload);
        } catch (err) {
            console.error("API end session error:", err);
        }

        if (socket) {
            socket.emit("end_chat_session", { roomId });
        }
        
        setShowLeavePrompt(false);
        setShowAstroLeavePrompt(false);
        if (checkUser) checkUser();

        if (user.role !== 'astrologer') {
            setShowReviewModal(true);
        } else {
            router.replace('/history');
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth/login");
        }
    }, [user, authLoading, router]);

    // 1. Firebase Auth
    useEffect(() => {
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
    }, [user, firebaseReady]);

    useEffect(() => {
        if (user && roomId) {
            fetchSessionData();
        } else if (!authLoading && !roomId) {
            setLoading(false);
        }
    }, [user, roomId, authLoading]);

    const fetchSessionData = async () => {
        try {
            const { data } = await api.get(`/chat/session/${roomId}/messages`);
            if (data.success) {
                if (data.session) {
                    setAstrologer(data.session.astrologerId || data.session.astrologer);
                    setChatUser(data.session.userId);
                    
                    if (data.session.status === 'active' && data.session.startTime) {
                        const start = new Date(data.session.startTime).getTime();
                        const elapsed = Math.floor((Date.now() - start) / 1000);
                        setDuration(elapsed);
                        localStartTimeRef.current = Date.now() - (elapsed * 1000);
                        setSessionActive(true);
                    } else if (data.session.totalDuration) {
                        setDuration(data.session.totalDuration);
                        localStartTimeRef.current = Date.now() - (data.session.totalDuration * 1000);
                    }

                    if (data.session.status === 'active') {
                        setSessionActive(true);
                    }

                    // If session is already finished, set to read-only
                    if (['completed', 'terminated', 'failed', 'missed'].includes(data.session.status)) {
                        setIsReadOnly(true);
                        isReadOnlyRef.current = true;
                        setSessionActive(false);
                        
                        let endMsg = "THIS SESSION HAS ENDED";
                        const canSee = data.showSessionEndedBy 
                            ? (user.role === 'astrologer' ? data.showSessionEndedBy.toAstrologer : data.showSessionEndedBy.toUser)
                            : true; // fallback

                        if (data.session.terminationReason === 'declined_by_astrologer') {
                            endMsg = "THIS SESSION HAS BEEN DECLINED BY ASTROLOGER";
                            setSessionTerminationReason('declined_by_astrologer');
                        } else if (canSee && data.session.endedBy) {
                            endMsg = `THIS SESSION HAS ENDED BY ${data.session.endedBy === 'user' ? 'USER' : data.session.endedBy === 'astrologer' ? 'ASTROLOGER' : 'SYSTEM'}`;
                        } else if (data.session.terminationReason) {
                            endMsg = data.session.terminationReason;
                        }
                        setShowEndedPopup(endMsg);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch session data", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Firebase Firestore Listeners (Messages, Read Receipts, Typing)
    useEffect(() => {
        if (!firebaseReady || !roomId || !user) return;

        const messagesRef = collection(db, 'chat_sessions', roomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach(document => {
                msgs.push({ _id: document.id, ...document.data() });
            });
            setMessages(msgs);

            // Mark unread messages as seen if they belong to the partner
            msgs.forEach(msg => {
                if (msg.senderId !== user._id && msg.status !== 'seen') {
                    updateDoc(doc(db, 'chat_sessions', roomId, 'messages', msg._id), { status: 'seen' })
                        .catch(err => console.error("Failed to update message status:", err));
                }
            });

            // If we see an astrologer message, the session is active!
            const hasAstroMessage = msgs.some(m => m.senderModel === 'Astrologer');
            if (hasAstroMessage && !isReadOnlyRef.current) {
                setSessionActive(prev => {
                    if (!prev && !isReadOnlyRef.current) {
                        localStartTimeRef.current = Date.now();
                        setDuration(0);
                        return true;
                    }
                    return prev;
                });
            }

        }, (error) => {
            console.error("Firebase messages snapshot error:", error);
        });

        const roomRef = doc(db, 'chat_sessions', roomId);
        const unsubRoom = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const currentStatus = data.status;
                
                // Real-time status update from Firestore
                if (currentStatus === 'completed' || currentStatus === 'terminated') {
                    setIsReadOnly(true);
                    isReadOnlyRef.current = true;
                    setSessionActive(false);
                    
                    // Fallback: If it transitioned from active/initiated to completed while we were watching, navigate away
                    if (previousStatusRef.current === 'active' || previousStatusRef.current === 'initiated') {
                        if (!isEndingSessionRef.current) {
                            if (checkUser) checkUser();
                            if (user.role !== 'astrologer') {
                                setShowReviewModal(true);
                            } else {
                                setShowEndedPopup(true);
                                setTimeout(() => {
                                    router.replace('/history');
                                }, 3500);
                            }
                        }
                    }
                }

                previousStatusRef.current = currentStatus;

                const partnerRole = user.role === 'astrologer' ? 'User' : 'Astrologer';
                if (data.typing && data.typing[partnerRole]) {
                    setIsAstroTyping(true);
                } else {
                    setIsAstroTyping(false);
                }
            }
        }, (error) => {
            console.error("Firebase room snapshot error:", error);
        });

        // Set online status
        updateDoc(roomRef, {
            [`online.${user.role === 'astrologer' ? 'Astrologer' : 'User'}`]: true
        }).catch(err => {
            // Document might not exist if started quickly, ensure backend initializes it
            setDoc(roomRef, { [`online.${user.role === 'astrologer' ? 'Astrologer' : 'User'}`]: true }, { merge: true })
                .catch(e => console.error("Firebase setDoc failed:", e));
        });

        return () => {
            unsubscribe();
            unsubRoom();
            // Optional: Set offline
            updateDoc(doc(db, 'chat_sessions', roomId), {
                [`online.${user.role === 'astrologer' ? 'Astrologer' : 'User'}`]: false
            }).catch(() => {});
        };
    }, [firebaseReady, roomId, user]);

    // 3.5 Prevent Body Scroll to Keep Header Fixed on Keyboard Open
    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyPosition = document.body.style.position;
        const originalBodyHeight = document.body.style.height;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.height = '100%';
        document.body.style.width = '100%';

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.position = originalBodyPosition;
            document.body.style.height = originalBodyHeight;
            document.body.style.width = '';
        };
    }, []);

    // 4. Socket Listeners for Timer and Session Status ONLY
    useEffect(() => {
        if (user && roomId && socket) {
            socket.emit("join_chat_session", { roomId });

            const handleSessionStarted = ({ startTime }) => {
                setSessionActive(true);
                setDuration(0); // Always 0 when it just starts
                localStartTimeRef.current = Date.now();
            };

            const handleSessionRestored = ({ startTime, duration: d, actualElapsedSeconds }) => {
                setSessionActive(true);
                let currentDuration = d;
                if (actualElapsedSeconds !== undefined) {
                    currentDuration = actualElapsedSeconds;
                } else if (startTime) {
                    // Fallback just in case
                    const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
                    currentDuration = elapsed > d ? elapsed : d;
                }
                setDuration(currentDuration);
                localStartTimeRef.current = Date.now() - (currentDuration * 1000);
            };

            const handleTimerUpdate = ({ duration: d, remainingBalance: bal, pricePerMinute: ppm }) => {
                setDuration(d); // Always trust the server's elapsed time
                localStartTimeRef.current = Date.now() - (d * 1000); // Resync local reference
                setRemainingBalance(bal);
                
                if (user?.role === 'user' && ppm) {
                    if (bal <= ppm && !hasShown1MinPromptRef.current) {
                        setLowBalanceMinutes(1);
                        setShowLowBalanceModal(true);
                        hasShown1MinPromptRef.current = true;
                    } else if (bal <= ppm * 2 && bal > ppm && !hasShown2MinPromptRef.current) {
                        setLowBalanceMinutes(2);
                        setShowLowBalanceModal(true);
                        hasShown2MinPromptRef.current = true;
                    }
                }
            };

            const handleSessionEnded = ({ reason, endedBy, showSessionEndedBy }) => {
                if (isEndingSessionRef.current) return;
                setSessionActive(false);
                if (checkUser) checkUser();
                setIsReadOnly(true);
                isReadOnlyRef.current = true;
                
                let endMsg = "THIS SESSION HAS ENDED";
                const canSee = showSessionEndedBy 
                    ? (user.role === 'astrologer' ? showSessionEndedBy.toAstrologer : showSessionEndedBy.toUser)
                    : true; // fallback

                if (reason === 'Astrologer declined the session' || reason === 'declined_by_astrologer') {
                    endMsg = "THIS SESSION HAS BEEN DECLINED BY ASTROLOGER";
                    setSessionTerminationReason('declined_by_astrologer');
                } else if (canSee && endedBy) {
                    endMsg = `THIS SESSION HAS ENDED BY ${endedBy === 'user' ? 'USER' : endedBy === 'astrologer' ? 'ASTROLOGER' : 'SYSTEM'}`;
                } else if (reason) {
                    endMsg = reason;
                }
                setShowEndedPopup(endMsg);
                
                if (user.role !== 'astrologer') {
                    setTimeout(() => {
                        setShowEndedPopup(false);
                        setShowReviewModal(true);
                    }, 3500);
                } else {
                    setTimeout(() => {
                        router.replace('/history');
                    }, 3500);
                }
            };

            const handleSessionReadOnly = ({ status }) => {
                setSessionActive(false);
                setIsReadOnly(true);
                isReadOnlyRef.current = true;
            };

            socket.on("session_started", handleSessionStarted);
            socket.on("session_restored", handleSessionRestored);
            socket.on("timer_update", handleTimerUpdate);
            socket.on("session_ended", handleSessionEnded);
            socket.on("session_read_only", handleSessionReadOnly);

            return () => {
                socket.off("session_started", handleSessionStarted);
                socket.off("session_restored", handleSessionRestored);
                socket.off("timer_update", handleTimerUpdate);
                socket.off("session_ended", handleSessionEnded);
                socket.off("session_read_only", handleSessionReadOnly);
            };
        }
    }, [user, authLoading, roomId, socket]);
    
    useEffect(() => {
        let interval;
        if (sessionActive) {
            if (!localStartTimeRef.current) {
                // Initial fallback if not set by handlers
                localStartTimeRef.current = Date.now();
            }
            interval = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - localStartTimeRef.current) / 1000);
                setDuration(elapsed);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive]);

    useEffect(scrollToBottom, [messages, isAstroTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !firebaseReady) return;

        const content = newMessage;

        // Check recent messages combined to prevent "govind at" ... "gmail" circumvention
        const myRecentMessages = messages
            .filter(m => m.senderId === (user.astrologerId || user._id))
            .slice(-3)
            .map(m => m.content)
            .join(' ');
            
        const combinedContent = myRecentMessages + ' ' + content;

        const sendWarning = (type) => {
            const endpoint = user.role === 'astrologer' ? '/astro/me/warning' : '/users/warning';
            try {
                api.post(endpoint, { type }).catch(e => console.error("Warning log error", e));
            } catch (e) {
                console.error("Failed to log warning", e);
            }
        };

        if (containsAbusiveLanguage(content) || containsAbusiveLanguage(combinedContent)) {
            toast.error("Please refrain from using abusive language on this platform.", {
                icon: '⚠️',
                duration: 4000
            });
            sendWarning('abusive');
            return;
        }

        if (containsContactInfo(content) || containsContactInfo(combinedContent)) {
            toast.error("Sharing contact details like phone numbers or emails is strictly prohibited.", {
                icon: '🛡️',
                duration: 4000
            });
            const violationType = getContactViolationType(content) || getContactViolationType(combinedContent) || 'unknown';
            sendWarning(violationType);
            return;
        }

        setNewMessage("");

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

            // If it's the astrologer, emit to backend to start the timer
            if (user.role === 'astrologer' && socket && !sessionActive) {
                socket.emit("start_chat_session", { roomId });
                // Optimistically start the timer locally so it immediately shows up
                setSessionActive(true);
                localStartTimeRef.current = Date.now();
                setDuration(0);
                // The timer interval will now kick in automatically
            }

        } catch (error) {
            console.error("Error sending message:", error);
        }
        inputRef.current?.focus();
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !firebaseReady) return;
        
        const fileRef = ref(storage, `chat_media/${roomId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        uploadTask.on('state_changed', 
            (snapshot) => {
                // You could add upload progress UI here
            },
            (error) => console.error("Upload error:", error),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const messagesRef = collection(db, 'chat_sessions', roomId, 'messages');
                await addDoc(messagesRef, {
                    content: file.type.startsWith('image/') ? '📷 Image attached' : '📄 File attached',
                    mediaUrl: downloadURL,
                    mediaType: file.type,
                    senderId: user._id,
                    senderModel: user.role === 'astrologer' ? 'Astrologer' : 'User',
                    status: 'sent',
                    createdAt: Date.now()
                });
            }
        );
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading || authLoading) return <CosmicLoader message="Opening the cosmic portal..." />;

    const partner = user?.role === 'astrologer' ? chatUser : astrologer;

    const handlePartnerClick = () => {
        if (user?.role !== 'astrologer' && partner) {
            const partnerId = partner._id || partner.id;
            if (partnerId) {
                router.push(`/astrologer?id=${partnerId}`);
            }
        }
    };

    const handleReviewSubmit = async () => {
        setSubmittingReview(true);
        try {
            const astrologerId = partner?._id || partner?.id || partner;
            await api.post('/reviews', {
                astrologerId: typeof astrologerId === 'object' ? astrologerId._id : astrologerId,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                isAnonymous: false
            });
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setSubmittingReview(false);
            setShowReviewModal(false);
            router.replace('/history');
        }
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        router.replace('/history');
    };

    return (
        <div 
            className="fixed top-0 left-0 w-full z-50 flex flex-col mx-auto bg-cosmic-indigo overflow-hidden sm:max-w-md sm:left-1/2 sm:-translate-x-1/2"
            style={{ height: viewportHeight }}
        >


            {/* Review Modal */}
            <AnimatePresence>
                {showReviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
                        >
                            <button onClick={closeReviewModal} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border border-white/10">
                                    <img src={partner?.image || partner?.profileImage || "https://i.pravatar.cc/100?u=astro"} alt="Astrologer" className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Rate your session</h3>
                                <p className="text-sm text-slate-400">with {partner?.displayName || partner?.name || "Astrologer"}</p>
                            </div>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                        className="focus:outline-none transition-transform active:scale-90"
                                    >
                                        <Star size={32} className={`${star <= reviewForm.rating ? "text-solar-gold fill-solar-gold" : "text-slate-600"} drop-shadow-md`} />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="How was your experience?"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-electric-violet/50 mb-6 min-h-[100px] resize-none"
                            ></textarea>

                            <button 
                                onClick={handleReviewSubmit}
                                disabled={submittingReview}
                                className="w-full py-3.5 bg-electric-violet hover:bg-electric-violet/90 text-[#ffffff] font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-electric-violet/20 disabled:opacity-50"
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex-none z-30 glass-panel border-b border-white/5 px-3 pb-3 pt-safe flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={handleBack} className="text-slate-400 p-1 shrink-0">
                        <ArrowLeft size={20} />
                    </button>
                    <div 
                        className={`w-9 h-9 rounded-full bg-electric-violet/20 border border-electric-violet/30 flex items-center justify-center overflow-hidden shrink-0 ${user?.role !== 'astrologer' ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={handlePartnerClick}
                    >
                        <img src={partner?.image || partner?.profileImage || "https://i.pravatar.cc/100?u=astro"} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div 
                        className={`min-w-0 flex flex-col justify-center ${user?.role !== 'astrologer' ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={handlePartnerClick}
                    >
                        <h2 className="text-white font-bold text-xs leading-tight truncate">
                            {user?.role === 'astrologer' 
                                ? maskUserName(partner?.displayName || partner?.name || partner?.phone || partner?.mobileNumber || "Seeker")
                                : (partner?.displayName || partner?.name || partner?.phone || partner?.mobileNumber || "Astrologer Guide")}
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1 h-1 rounded-full ${sessionActive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                {sessionActive ? 'Live' : (sessionTerminationReason === 'declined_by_astrologer' || showEndedPopup === 'THIS SESSION HAS BEEN DECLINED BY ASTROLOGER') ? 'Declined' : isReadOnly ? 'Connect Now' : 'Connecting...'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {user?.role === 'astrologer' && chatUser && (
                        <>
                            <button onClick={() => setShowAIInsights(true)} className="text-electric-violet bg-electric-violet/10 p-2 rounded-lg border border-electric-violet/30 flex items-center justify-center active:scale-95 transition-transform shadow-sm">
                                <Sparkles size={18} />
                            </button>
                            <button onClick={() => setShowKundli(true)} className="text-electric-violet bg-electric-violet/10 p-2 rounded-lg border border-electric-violet/30 flex items-center justify-center active:scale-95 transition-transform shadow-sm">
                                <Grid size={18} />
                            </button>
                        </>
                    )}
                    
                    <div className="flex flex-col items-end mr-1">
                        <div className="flex items-center gap-1 text-[#d97706] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock size={10} className={sessionActive ? "animate-pulse" : ""} />
                            <span className="text-[11px] font-mono font-black tabular-nums">{formatTime(duration)}</span>
                        </div>
                        {remainingBalance !== null && (
                            <span className="text-[7px] text-slate-500 font-bold uppercase">₹{remainingBalance.toFixed(0)}</span>
                        )}
                    </div>
                    
                    {!isReadOnly && (
                        <button 
                            onClick={handleEndClick}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${user?.role === 'astrologer' && duration < 180 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-rose-500 text-[#ffffff] active:scale-95 shadow-lg shadow-rose-500/20'}`}
                        >
                            End
                        </button>
                    )}
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
                                    Leaving this screen will permanently end the current consultation. Are you sure you want to leave?
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={confirmEndSession}
                                        className="w-full py-3.5 rounded-xl bg-rose-500 text-[#ffffff] font-bold text-sm shadow-lg shadow-rose-500/30 active:scale-95 transition-transform"
                                    >
                                        Yes, End Consultation
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

            <AnimatePresence>
                {showAstroLeavePrompt && (
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
                            className="bg-cosmic-indigo border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                            <h3 className="text-xl font-bold text-white mb-2">End Consultation?</h3>
                            <p className="text-xs text-slate-400 mb-4">Please specify the reason for ending this session. This will be recorded for quality purposes.</p>
                            
                            <div className="space-y-2 mb-6 overflow-y-auto pr-1 flex-1">
                                {["Session completed", "Abusive Language", "User not Responding", "Low internet speed at me", "Other"].map(reason => (
                                    <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${astroEndReason === reason ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
                                        <input 
                                            type="radio" 
                                            name="astroReason" 
                                            value={reason}
                                            checked={astroEndReason === reason}
                                            onChange={(e) => setAstroEndReason(e.target.value)}
                                            className="w-4 h-4 text-blue-500 bg-slate-950 border-slate-700 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className={`text-sm font-bold ${astroEndReason === reason ? 'text-blue-400' : 'text-slate-300'}`}>{reason}</span>
                                    </label>
                                ))}
                                
                                {astroEndReason === 'Other' && (
                                    <input 
                                        type="text" 
                                        placeholder="Please specify..."
                                        value={customAstroReason}
                                        onChange={(e) => setCustomAstroReason(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm mt-2"
                                    />
                                )}
                            </div>
                            
                            <div className="space-y-3 shrink-0">
                                <button
                                    onClick={confirmEndSession}
                                    disabled={!astroEndReason || (astroEndReason === 'Other' && !customAstroReason)}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit & End Session
                                </button>
                                <button
                                    onClick={() => setShowAstroLeavePrompt(false)}
                                    className="w-full py-3.5 rounded-xl bg-white/5 text-slate-300 font-bold text-sm border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    Cancel
                                </button>
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
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-none p-4 space-y-4 relative scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                    const isMe = msg.senderId === (user?.astrologerId || user?._id) || msg.senderModel === (user?.role === 'astrologer' ? 'Astrologer' : 'User');
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
                                ? 'bg-gradient-to-br from-electric-violet to-purple-600 text-[#ffffff] rounded-tr-none border border-white/10'
                                : 'glass-panel bg-white/5 border border-white/10 text-slate-100 rounded-tl-none'
                                }`}>
                                {msg.mediaUrl && (
                                    <div className="mb-2 rounded-xl overflow-hidden">
                                        {msg.mediaType?.startsWith('image/') ? (
                                            <img src={msg.mediaUrl} alt="attachment" className="w-full h-auto max-h-48 object-cover rounded-lg" />
                                        ) : (
                                            <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline flex items-center gap-1">
                                                <Paperclip size={14} /> Download File
                                            </a>
                                        )}
                                    </div>
                                )}
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
                                    <span className="w-1.5 h-1.5 bg-electric-violet rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-electric-violet rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-electric-violet rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Bar - WhatsApp Style */}
            <div className="flex-none z-30 px-3 pt-2 pb-safe bg-cosmic-indigo/90 backdrop-blur-xl border-t border-white/5">
                {isReadOnly ? (
                    <div className="text-center py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        {typeof showEndedPopup === 'string' ? showEndedPopup : "THIS SESSION HAS ENDED"}
                    </div>
                ) : (
                    <form
                        onSubmit={handleSend}
                        className="flex items-end gap-2 max-w-md mx-auto mb-2"
                    >
                        <div className="flex-1 glass-panel border-white/10 rounded-[24px] p-1.5 flex items-center shadow-2xl min-h-[48px] overflow-hidden">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*,.pdf,.doc,.docx"
                            />
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
                                className="flex-1 bg-transparent border-none outline-none text-white px-2 py-2 text-sm placeholder:text-slate-500 font-medium resize-none max-h-32"
                                onFocus={() => {
                                    setTimeout(() => scrollToBottom(), 100);
                                }}
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
                )}
            </div>

            {/* Astrologer Kundali Modal */}
            <UserKundliModal 
                isOpen={showKundli} 
                onClose={() => setShowKundli(false)} 
                chatUser={chatUser} 
            />

            {/* AI Insights Modal */}
            <AIInsightsPanel
                isOpen={showAIInsights}
                onClose={() => setShowAIInsights(false)}
                userId={chatUser}
                onTipSelect={(tip) => {
                    setNewMessage(tip);
                    setShowAIInsights(false);
                    // optionally, focus the input if possible
                    if (inputRef.current) {
                        inputRef.current.focus();
                    }
                }}
            />

            {/* Low Balance Recharge Modal */}
            <AnimatePresence>
                {showLowBalanceModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 rounded-full p-3 shadow-lg">
                                <Wallet size={24} className="text-white" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white text-center mt-6 mb-2">Low Balance Warning</h3>
                            <p className="text-slate-300 text-sm text-center mb-6">
                                Your balance will be empty in about {lowBalanceMinutes} minute{lowBalanceMinutes > 1 ? 's' : ''}. Quick recharge now to continue your cosmic connection without interruption!
                            </p>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={async () => {
                                        setRechargeProcessing(true);
                                        try {
                                            const res = await api.post('/wallet/recharge', { amount: 500 });
                                            if (res.data.success) {
                                                alert(`Razorpay Order Created: ${res.data.order_id}\nReady for Native Checkout Plugin Integration.`);
                                                setShowLowBalanceModal(false);
                                            } else {
                                                alert('Recharge initialization failed: ' + (res.data.message || 'Unknown error'));
                                            }
                                        } catch(e) {
                                            console.error('Recharge Error:', e);
                                            alert('Recharge initialization failed');
                                        } finally {
                                            setRechargeProcessing(false);
                                        }
                                    }}
                                    disabled={rechargeProcessing}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {rechargeProcessing ? 'Processing...' : 'Quick Recharge'}
                                </button>
                                
                                <button
                                    onClick={() => setShowLowBalanceModal(false)}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-colors"
                                >
                                    Close & Continue Chat
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
