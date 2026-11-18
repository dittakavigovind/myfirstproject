"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, AlertCircle, UserRound, Grid } from "lucide-react";
import toast from "react-hot-toast";
import { AudioToggle } from '@anuradev/capacitor-audio-toggle';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import AIInsightsPanel from "@/components/AIInsightsPanel";
import UserKundliModal from "../../chat/room/UserKundliModal";
import { maskUserName } from "@/utils/maskUtils";
import { getImageUrl } from "@/lib/utils";

let AgoraRTC = null;
const getAgoraRTC = () => {
    if (!AgoraRTC && typeof window !== "undefined") {
        try {
            AgoraRTC = require("agora-rtc-sdk-ng");
            if (AgoraRTC && typeof AgoraRTC.setLogLevel === 'function') {
                AgoraRTC.setLogLevel(3);
            }
        } catch (e) {
            console.warn("AgoraRTC load failed:", e);
        }
    }
    return AgoraRTC;
};

export default function CallRoomClient({ globalRoomId, onMinimize, onCallEnded }) {
    const { user, checkUser } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = globalRoomId || searchParams.get("id");

    const [loading, setLoading] = useState(true);
    const [sessionActive, setSessionActive] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [duration, setDuration] = useState(0);
    const [remoteUserJoined, setRemoteUserJoined] = useState(false);

    // Call state
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [connectionState, setConnectionState] = useState("Connecting...");
    const [callData, setCallData] = useState(null); // astrologer or user details
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [showKundli, setShowKundli] = useState(false);

    const clientRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const remoteAudioTrackRef = useRef(null);
    const localStartTimeRef = useRef(null);
    const isReadOnlyRef = useRef(false);

    const formatTime = (seconds) => {
        if (seconds < 0) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleLeaveRoom = () => {
        if (checkUser) checkUser();
        if (onCallEnded) {
            onCallEnded();
            return;
        }
        if (user?.role !== 'astrologer') {
            router.replace('/history'); // Replace with review modal later if needed
        } else {
            router.replace('/history');
        }
    };

    useEffect(() => {
        if (!user || !roomId) return;
        fetchSessionData();

        return () => {
            cleanupCall();
        };
    }, [user, roomId]);

    const fetchSessionData = async () => {
        try {
            const { data } = await api.get(`/chat/session/${roomId}/messages`);
            if (data.success && data.session) {
                setCallData(data.session);

                if (data.session.status === 'active' && data.session.startTime) {
                    const start = new Date(data.session.startTime).getTime();
                    const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
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

                if (['completed', 'terminated', 'failed', 'missed'].includes(data.session.status)) {
                    setIsReadOnly(true);
                    isReadOnlyRef.current = true;
                    setSessionActive(false);
                    setConnectionState("Call Ended");
                    cleanupCall();
                } else {
                    initAgoraCall();
                }
            }
        } catch (err) {
            console.error("Failed to fetch session data", err);
            toast.error("Failed to load call session.");
        } finally {
            setLoading(false);
        }
    };

    const initAgoraCall = async () => {
        try {
            // Check if environment supports WebRTC in a secure context
            // iOS Safari requires HTTPS or localhost for WebRTC audio tracks
            const isSecure = typeof window !== 'undefined' && (
                window.isSecureContext ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform())
            );

            if (!isSecure) {
                setConnectionState("HTTPS Required for WebRTC");
                toast.error("Audio calls in browser require HTTPS or native iOS app build.", { duration: 5000 });
                return;
            }

            const Agora = getAgoraRTC();
            if (!Agora || clientRef.current) return;
            setConnectionState("Initializing call...");
            const { data } = await api.post('/agora/token', {
                channelName: roomId,
                sessionType: 'voice',
                uid: user._id
            });

            if (!data.success) {
                throw new Error("Failed to get token");
            }

            try {
                if (typeof window !== 'undefined' && window.Capacitor) {
                    await BackgroundMode.enable({
                        title: "Active Consultation",
                        text: "Call in progress...",
                        resume: true,
                        hidden: false,
                        disableWebViewOptimization: true,
                        allowMicrophoneInBackground: true
                    });
                    
                    // Crucial for WebRTC audio to continue while app is minimized
                    if (BackgroundMode.disableWebViewOptimizations) {
                        await BackgroundMode.disableWebViewOptimizations();
                    }
                }
            } catch (e) {
                console.error("Background mode error", e);
            }

            const client = Agora.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;

            client.on("user-published", async (remoteUser, mediaType) => {
                await client.subscribe(remoteUser, mediaType);
                if (mediaType === "audio") {
                    setRemoteUserJoined(true);
                    setConnectionState("Connected");
                    remoteAudioTrackRef.current = remoteUser.audioTrack;
                    remoteUser.audioTrack.play();
                    console.log("Remote audio track played automatically");
                    
                    try {
                        if (typeof window !== 'undefined' && window.Capacitor) {
                            await AudioToggle.setSpeakerOn({ speakerOn: true });
                            setIsSpeakerOn(true);
                        }
                    } catch (e) {
                        console.error("Failed to set speaker on", e);
                    }
                }
            });

            client.on("user-unpublished", (remoteUser, mediaType) => {
                if (mediaType === "audio") {
                    setRemoteUserJoined(false);
                    setConnectionState("Reconnecting...");
                }
            });

            client.on("user-left", () => {
                setRemoteUserJoined(false);
                setConnectionState("User left");
            });

            await client.join(data.appID, roomId, data.rtcToken, user._id);

            let localAudioTrack;
            try {
                localAudioTrack = await Agora.createMicrophoneAudioTrack();
                localAudioTrackRef.current = localAudioTrack;
                await client.publish([localAudioTrack]);
            } catch (micError) {
                console.error("Microphone Access Error:", micError);
                toast.error("Microphone not found or in use. You can hear but cannot speak.");
                // We don't return here so the call can still connect and start the timer!
            }

            if (client.remoteUsers && client.remoteUsers.length > 0) {
                // If there are already users in the channel when we join
                setConnectionState("Connected");
                setRemoteUserJoined(true);
            } else {
                setConnectionState("Waiting for other party...");
            }

        } catch (error) {
            console.warn("Agora Notice:", error);
            if (error?.code === "WEB_SECURITY_RESTRICT" || error?.message?.includes("WEB_SECURITY_RESTRICT")) {
                toast.error("Safari requires HTTPS for audio calls over Wi-Fi. In the native iOS app this runs securely via capacitor://localhost.");
                setConnectionState("Security Restriction (Use HTTPS / Native iOS)");
            } else {
                toast.error("Call connection notice: " + (error?.message || "Check connection"));
                setConnectionState(`Status: ${error?.message || "Failed"}`);
            }
        }
    };

    const cleanupCall = () => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.stop();
            localAudioTrackRef.current.close();
            localAudioTrackRef.current = null;
        }
        if (clientRef.current) {
            clientRef.current.leave();
            clientRef.current = null;
        }
        
        try {
            if (typeof window !== 'undefined' && window.Capacitor) {
                BackgroundMode.disable();
            }
        } catch (e) {
            console.error("Failed to disable background mode", e);
        }
    };

    // Socket Event Listeners for Session End & Timer Sync
    useEffect(() => {
        if (!socket || !roomId || !user) return;

        const joinRoom = () => {
            if (socket.connected) {
                socket.emit("join_chat_session", { roomId, userId: user._id, role: user.role });
            }
        };

        joinRoom();
        socket.on('connect', joinRoom);
        
        // Timer/Status handlers
        const handleSessionEnded = (data) => {
            setIsReadOnly(true);
            isReadOnlyRef.current = true;
            setSessionActive(false);
            setConnectionState("Call Ended");
            cleanupCall();
            let msg = data?.reason || "Call Terminated";
            if (data?.reason === 'low_balance') msg = "Call ended due to low balance.";
            toast(msg, { icon: 'ℹ️', id: 'session_ended_toast' });

            setTimeout(() => {
                if (onCallEnded) {
                    onCallEnded();
                    return;
                }
                if (user?.role === 'astrologer') {
                    router.replace('/astrologer');
                } else {
                    router.replace('/explore');
                }
            }, 2000);
        };

        const handleSessionStarted = (data) => {
            setSessionActive(true);
            setConnectionState("Connected");
            setDuration(0); // initialize duration
            localStartTimeRef.current = Date.now();
        };

        const handleTimerUpdate = (data) => {
            if (!isReadOnlyRef.current) {
                if (!localStartTimeRef.current && data?.duration) {
                    localStartTimeRef.current = Date.now() - (data.duration * 1000);
                }
            }
        };

        const handleLowBalanceWarning = (data) => {
            if (user?.role === 'user') {
                toast.error(`Low Balance! ${data?.minutesLeft} minute(s) left.`, { duration: 5000 });
            }
        };

        socket.on("session_ended", handleSessionEnded);
        socket.on("session_started", handleSessionStarted);
        socket.on("timer_update", handleTimerUpdate);
        socket.on("low_balance_warning", handleLowBalanceWarning);

        return () => {
            socket.off('connect', joinRoom);
            socket.off("session_ended", handleSessionEnded);
            socket.off("session_started", handleSessionStarted);
            socket.off("timer_update", handleTimerUpdate);
            socket.off("low_balance_warning", handleLowBalanceWarning);
            cleanupCall();
            cleanupCall();
        };
    }, [socket, roomId, user]);

    // Effect to start session specifically when astrologer joins and session isn't active
    useEffect(() => {
        if (user?.role === 'astrologer' && !sessionActive && !isReadOnlyRef.current) {
            if (socket) {
                socket.emit("start_chat_session", { roomId, astrologerId: user._id });
            }
            api.post(`/chat/session/${roomId}/start`).catch(() => {});
        }
    }, [socket, user, roomId, sessionActive]);

    // Client-side timer
    useEffect(() => {
        let interval;
        if (sessionActive && !isReadOnly) {
            interval = setInterval(() => {
                if (localStartTimeRef.current && !isReadOnlyRef.current) {
                    const elapsed = Math.max(0, Math.floor((Date.now() - localStartTimeRef.current) / 1000));
                    setDuration(elapsed);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive, isReadOnly]);

    const toggleMute = () => {
        if (localAudioTrackRef.current) {
            const newState = !isMuted;
            localAudioTrackRef.current.setMuted(newState);
            setIsMuted(newState);
        }
    };

    const forcePlayRemoteAudio = () => {
        if (remoteAudioTrackRef.current) {
            remoteAudioTrackRef.current.play();
            toast.success("Attempted to play remote audio");
        } else {
            toast.error("No remote audio track found");
        }
    };

    const toggleSpeaker = async () => {
        try {
            if (isSpeakerOn) {
                // switch to earpiece
                await AudioToggle.setSpeakerOn({ speakerOn: false });
                setIsSpeakerOn(false);
            } else {
                // switch to speaker
                await AudioToggle.setSpeakerOn({ speakerOn: true });
                setIsSpeakerOn(true);
            }
        } catch (e) {
            console.error("Audio toggle failed:", e);
            // Even if native plugin fails (e.g. on web), toggle the UI state
            setIsSpeakerOn(!isSpeakerOn);
        }
    };

    const endCall = async () => {
        try {
            if (user?.role === 'astrologer') {
                if (duration < 180) {
                    toast.error("You cannot end the session before 3 minutes.");
                    return;
                }
            }
            setIsReadOnly(true);
            isReadOnlyRef.current = true;
            setSessionActive(false);
            setConnectionState("Ending call...");
            await api.post(`/chat/session/${roomId}/end`);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#050716] flex flex-col items-center justify-center text-white z-50">
                <div className="w-10 h-10 rounded-full border-2 border-electric-violet border-t-transparent animate-spin mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connecting Cosmic Channel...</p>
            </div>
        );
    }

    const partner = user?.role === 'astrologer' ? callData?.userId : callData?.astrologerId;
    const partnerImage = getImageUrl(partner?.image || partner?.profileImage, partner?.gender);

    return (
        <div className="fixed inset-0 bg-[#050716] flex flex-col z-[100] text-white overflow-hidden">
            {/* Ambient Background Nebulae */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Header Bar with Safe Area */}
            <div 
                className="absolute left-0 right-0 px-5 flex items-center justify-between z-[999] pointer-events-none"
                style={{ top: 'calc(var(--safe-area-inset-top) + 0.75rem)' }}
            >
                <div className="flex items-center gap-3 pointer-events-auto">
                    {onMinimize && (
                        <button 
                            onClick={onMinimize} 
                            className="w-10 h-10 rounded-[16px] bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 flex items-center justify-center backdrop-blur-2xl active:scale-90 transition-all shadow-lg"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
                        </button>
                    )}
                    
                    <div className="flex flex-col">
                        <h2 className="text-base font-black text-white leading-tight tracking-tight">
                            {user?.role === 'astrologer'
                                ? maskUserName(callData?.userId?.name || 'Seeker')
                                : (callData?.astrologerId?.displayName || 'Astrologer Guide')}
                        </h2>
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest mt-0.5">
                            Encrypted Audio Consultation
                        </span>
                    </div>
                </div>

                {/* Astrologer Tools */}
                {user?.role === 'astrologer' && (
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => setShowKundli(true)}
                            className="bg-electric-violet/20 border border-electric-violet/40 text-electric-violet w-10 h-10 rounded-[16px] flex items-center justify-center backdrop-blur-2xl shadow-lg active:scale-90 transition-all"
                            title="Kundli Chart"
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setShowAIInsights(true)}
                            className="bg-solar-gold/20 border border-solar-gold/40 text-solar-gold w-10 h-10 rounded-[16px] flex items-center justify-center backdrop-blur-2xl shadow-lg active:scale-90 transition-all"
                            title="AI Insights"
                        >
                            <Sparkles size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Center Stage: Partner Squircle Avatar & Call State */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className="relative mb-6">
                    {/* Glowing pulse ring */}
                    {sessionActive && remoteUserJoined && (
                        <div className="absolute -inset-3 rounded-[44px] bg-gradient-to-tr from-emerald-500/40 via-violet-500/30 to-amber-500/40 blur-xl animate-pulse pointer-events-none" />
                    )}
                    <div className="w-36 h-36 rounded-[38px] bg-slate-900/90 shadow-2xl flex items-center justify-center relative overflow-hidden border-2 border-white/20 backdrop-blur-xl">
                        <img src={partnerImage} alt="Avatar" className="w-full h-full object-cover" />
                        {sessionActive && remoteUserJoined && (
                            <div className="absolute inset-0 border-2 border-emerald-400 rounded-[38px] pointer-events-none" />
                        )}
                    </div>
                </div>

                {/* Live Timer or State Capsule */}
                <div className="mb-2">
                    {sessionActive ? (
                        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 backdrop-blur-2xl shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-base font-mono font-black tracking-widest tabular-nums">
                                {formatTime(duration)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 backdrop-blur-2xl">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-xs font-bold tracking-wider">
                                {connectionState}
                            </span>
                        </div>
                    )}
                </div>

                {isReadOnly && (
                    <div className="mt-4 px-5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        <AlertCircle size={16} />
                        Call Ended
                    </div>
                )}
            </div>

            {/* Apple Liquid Glass Controls Capsule */}
            <div className="pb-safe px-6 pb-8 relative z-20">
                <div className="max-w-md mx-auto p-4 rounded-[36px] bg-[#090d24]/90 backdrop-blur-3xl border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center justify-around">

                        {/* Speaker Toggle */}
                        <button
                            onClick={toggleSpeaker}
                            disabled={isReadOnly}
                            className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md border ${isSpeakerOn ? 'bg-white/15 text-white border-white/20' : 'bg-white/5 text-slate-400 border-white/5'}`}
                            title="Speaker"
                        >
                            {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
                        </button>

                        {/* End Call / Leave Pill */}
                        <button
                            onClick={isReadOnly ? handleLeaveRoom : endCall}
                            className={`w-20 h-16 rounded-[26px] flex items-center justify-center shadow-xl transition-all duration-200 active:scale-90 ${isReadOnly ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-rose-500/30'}`}
                            title="End Call"
                        >
                            <PhoneOff size={28} />
                        </button>

                        {/* Mute Toggle */}
                        <button
                            onClick={toggleMute}
                            disabled={isReadOnly}
                            className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md border ${!isMuted ? 'bg-white/15 text-white border-white/20' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}
                            title="Mute"
                        >
                            {!isMuted ? <Mic size={22} /> : <MicOff size={22} />}
                        </button>

                    </div>
                </div>
            </div>

            {/* AI Insights Modal */}
            <AIInsightsPanel
                isOpen={showAIInsights}
                onClose={() => setShowAIInsights(false)}
                userId={callData?.userId}
            />
            {user?.role === 'astrologer' && callData && (
                <UserKundliModal
                    isOpen={showKundli}
                    onClose={() => setShowKundli(false)}
                    chatUser={callData?.userId}
                />
            )}
        </div>
    );
}
