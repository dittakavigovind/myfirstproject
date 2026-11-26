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
    const [agoraStatusNote, setAgoraStatusNote] = useState(null);
    const [callData, setCallData] = useState(null); // astrologer or user details
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [showKundli, setShowKundli] = useState(false);

    const clientRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const remoteAudioTrackRef = useRef(null);
    const localStartTimeRef = useRef(null);
    const isReadOnlyRef = useRef(false);
    const hasTriggeredStartRef = useRef(false);
    const initInFlightRef = useRef(false);
    const isMutedRef = useRef(false);
    const activeRoomRef = useRef(null);
    const userId = user?._id;
    const userRole = user?.role;

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
        if (!userId || !roomId) return;
        activeRoomRef.current = roomId;
        isReadOnlyRef.current = false;
        setIsReadOnly(false);
        fetchSessionData();

        return () => {
            activeRoomRef.current = null;
            cleanupCall();
        };
    }, [userId, roomId]);

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

    const enableCallBackgroundMode = async () => {
        if (typeof window === 'undefined' || !window.Capacitor?.isNativePlatform?.()) return;
        try {
            if (typeof BackgroundMode.requestNotificationsPermission === 'function') {
                await BackgroundMode.requestNotificationsPermission().catch(() => {});
            }
            let allowMic = true;
            if (typeof BackgroundMode.requestMicrophonePermission === 'function') {
                const micPerm = await BackgroundMode.requestMicrophonePermission().catch(() => null);
                if (micPerm && micPerm.microphone !== 'granted') {
                    allowMic = false;
                }
            }

            const baseOptions = {
                title: "Active Consultation",
                text: "Audio call in progress...",
                resume: true,
                hidden: false,
                disableWebViewOptimization: true,
            };

            try {
                await BackgroundMode.enable({
                    ...baseOptions,
                    allowMicrophoneInBackground: allowMic,
                });
            } catch (micBgErr) {
                if (allowMic) {
                    await BackgroundMode.enable({
                        ...baseOptions,
                        allowMicrophoneInBackground: false,
                    });
                } else {
                    throw micBgErr;
                }
            }

            if (BackgroundMode.disableWebViewOptimizations) {
                await BackgroundMode.disableWebViewOptimizations().catch(() => {});
            }
        } catch (e) {
            console.error("Background mode error", e);
        }
    };

    const createAndPublishLocalAudio = async (Agora, client) => {
        if (!Agora || !client || isReadOnlyRef.current) return null;
        if (localAudioTrackRef.current) {
            try {
                localAudioTrackRef.current.stop();
                localAudioTrackRef.current.close();
            } catch {}
            localAudioTrackRef.current = null;
        }
        const track = await Agora.createMicrophoneAudioTrack({
            AEC: true,
            ANS: true,
            AGC: true,
        });
        if (isMutedRef.current) {
            track.setMuted(true);
        }
        track.on("track-ended", async () => {
            if (isReadOnlyRef.current || !clientRef.current) return;
            console.warn("Local microphone track ended by OS. Recreating...");
            try {
                await clientRef.current.unpublish([track]).catch(() => {});
                await createAndPublishLocalAudio(Agora, clientRef.current);
            } catch (recreateErr) {
                console.error("Failed to recover local audio track:", recreateErr);
                setAgoraStatusNote("Microphone interrupted. Tap Mute/Unmute to retry.");
            }
        });
        localAudioTrackRef.current = track;
        await client.publish([track]);
        return track;
    };

    const initAgoraCall = async () => {
        if (initInFlightRef.current || clientRef.current || isReadOnlyRef.current) return;
        initInFlightRef.current = true;
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

            Agora.onAutoplayFailed = () => {
                setAgoraStatusNote("Audio paused by device — tap to resume");
            };

            const { data } = await api.post('/agora/token', {
                channelName: roomId,
                sessionType: 'voice',
                uid: userId
            });

            if (!data.success) {
                throw new Error("Failed to get token");
            }

            await enableCallBackgroundMode();

            if (isReadOnlyRef.current || activeRoomRef.current !== roomId) return;

            const client = Agora.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;

            client.on("user-published", async (remoteUser, mediaType) => {
                try {
                    await client.subscribe(remoteUser, mediaType);
                    if (mediaType === "audio" && remoteUser.audioTrack) {
                        setRemoteUserJoined(true);
                        setConnectionState("Connected");
                        setAgoraStatusNote(null);
                        remoteAudioTrackRef.current = remoteUser.audioTrack;
                        try {
                            remoteUser.audioTrack.play();
                        } catch (playErr) {
                            console.warn("Remote audio play error:", playErr);
                            setAgoraStatusNote("Tap anywhere to resume audio");
                        }

                        try {
                            if (typeof window !== 'undefined' && window.Capacitor) {
                                await AudioToggle.setSpeakerOn({ speakerOn: true });
                                setIsSpeakerOn(true);
                            }
                        } catch (e) {
                            console.error("Failed to set speaker on", e);
                        }
                    }
                } catch (subErr) {
                    console.error("Subscribe error:", subErr);
                }
            });

            client.on("user-unpublished", (remoteUser, mediaType) => {
                if (mediaType === "audio") {
                    setRemoteUserJoined(false);
                    setConnectionState("Reconnecting...");
                    setAgoraStatusNote("Other party audio paused / reconnecting...");
                }
            });

            client.on("user-left", () => {
                setRemoteUserJoined(false);
                setConnectionState("User left");
                setAgoraStatusNote("Other party temporarily disconnected...");
            });

            client.on("connection-state-change", async (curState, revState, reason) => {
                if (isReadOnlyRef.current) return;
                if (curState === "RECONNECTING") {
                    setConnectionState("Reconnecting audio...");
                    setAgoraStatusNote("Reconnecting audio...");
                } else if (curState === "CONNECTED") {
                    setConnectionState("Connected");
                    setAgoraStatusNote(null);
                    if (!localAudioTrackRef.current) {
                        try {
                            await createAndPublishLocalAudio(Agora, client);
                        } catch {}
                    }
                } else if (curState === "DISCONNECTED" && reason !== "LEAVE") {
                    setAgoraStatusNote("Audio connection dropped. Reconnecting...");
                    try {
                        const tokenRes = await api.post('/agora/token', {
                            channelName: roomId,
                            sessionType: 'voice',
                            uid: userId
                        });
                        if (tokenRes.data?.success && clientRef.current === client && !isReadOnlyRef.current) {
                            await client.join(tokenRes.data.appID, roomId, tokenRes.data.rtcToken, userId);
                            await createAndPublishLocalAudio(Agora, client);
                        }
                    } catch (rejoinErr) {
                        console.error("Agora rejoin failed:", rejoinErr);
                    }
                }
            });

            client.on("token-privilege-will-expire", async () => {
                try {
                    const tokenRes = await api.post('/agora/token', {
                        channelName: roomId,
                        sessionType: 'voice',
                        uid: userId
                    });
                    if (tokenRes.data?.success && tokenRes.data.rtcToken && clientRef.current === client) {
                        await client.renewToken(tokenRes.data.rtcToken);
                    }
                } catch (renewErr) {
                    console.error("Failed to renew Agora token:", renewErr);
                }
            });

            await client.join(data.appID, roomId, data.rtcToken, userId);

            try {
                await createAndPublishLocalAudio(Agora, client);
            } catch (micError) {
                console.error("Microphone Access Error:", micError);
                toast.error("Microphone not found or in use. You can hear but cannot speak.");
                // We don't return here so the call can still connect and start the timer!
            }

            if (client.remoteUsers && client.remoteUsers.length > 0) {
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
        } finally {
            initInFlightRef.current = false;
        }
    };

    const cleanupCall = () => {
        if (localAudioTrackRef.current) {
            try {
                localAudioTrackRef.current.stop();
                localAudioTrackRef.current.close();
            } catch {}
            localAudioTrackRef.current = null;
        }
        remoteAudioTrackRef.current = null;
        if (clientRef.current) {
            try {
                clientRef.current.removeAllListeners?.();
                clientRef.current.leave();
            } catch {}
            clientRef.current = null;
        }

        try {
            if (typeof window !== 'undefined' && window.Capacitor) {
                AudioToggle.reset?.().catch?.(() => {});
                BackgroundMode.disable();
            }
        } catch (e) {
            console.error("Failed to disable background mode", e);
        }
    };

    // Socket Event Listeners for Session End & Timer Sync (decoupled from Agora lifecycle)
    useEffect(() => {
        if (!socket || !roomId || !userId) return;

        const joinRoom = () => {
            if (socket.connected) {
                socket.emit("join_chat_session", { roomId, userId, role: userRole });
            }
        };

        const handleVisibilityChange = () => {
            if (typeof document !== 'undefined' && !document.hidden) {
                joinRoom();
                if (remoteAudioTrackRef.current) {
                    try {
                        remoteAudioTrackRef.current.play();
                    } catch {}
                }
            }
        };

        joinRoom();
        socket.on('connect', joinRoom);
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        // Timer/Status handlers
        const handleSessionEnded = (data) => {
            setIsReadOnly(true);
            isReadOnlyRef.current = true;
            setSessionActive(false);
            setAgoraStatusNote(null);
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
                if (userRole === 'astrologer') {
                    router.replace('/astrologer');
                } else {
                    router.replace('/explore');
                }
            }, 2000);
        };

        const handleSessionStarted = () => {
            setSessionActive(true);
            setConnectionState("Connected");
            setDuration(0); // initialize duration
            localStartTimeRef.current = Date.now();
        };

        const handleSessionRestored = (data) => {
            setSessionActive(true);
            const elapsed = data?.actualElapsedSeconds ?? data?.duration ?? 0;
            setDuration(elapsed);
            localStartTimeRef.current = Date.now() - (elapsed * 1000);
        };

        const handleTimerUpdate = (data) => {
            if (!isReadOnlyRef.current) {
                if (data?.duration !== undefined) {
                    setDuration(data.duration);
                    localStartTimeRef.current = Date.now() - (data.duration * 1000);
                }
            }
        };

        const handleLowBalanceWarning = (data) => {
            if (userRole === 'user') {
                toast.error(`Low Balance! ${data?.minutesLeft} minute(s) left.`, { duration: 5000 });
            }
        };

        socket.on("session_ended", handleSessionEnded);
        socket.on("session_started", handleSessionStarted);
        socket.on("session_restored", handleSessionRestored);
        socket.on("timer_update", handleTimerUpdate);
        socket.on("low_balance_warning", handleLowBalanceWarning);

        return () => {
            socket.off('connect', joinRoom);
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
            socket.off("session_ended", handleSessionEnded);
            socket.off("session_started", handleSessionStarted);
            socket.off("session_restored", handleSessionRestored);
            socket.off("timer_update", handleTimerUpdate);
            socket.off("low_balance_warning", handleLowBalanceWarning);
        };
    }, [socket, roomId, userId, userRole]);

    // Effect to start session specifically when astrologer joins and session isn't active
    useEffect(() => {
        if (userRole === 'astrologer' && !sessionActive && !isReadOnlyRef.current && !hasTriggeredStartRef.current) {
            hasTriggeredStartRef.current = true;
            if (socket) {
                socket.emit("start_chat_session", { roomId, astrologerId: userId });
            }
            api.post(`/chat/session/${roomId}/start`).catch(() => {});
        }
    }, [socket, userId, userRole, roomId, sessionActive]);

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

    const toggleMute = async () => {
        const newState = !isMuted;
        isMutedRef.current = newState;
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setMuted(newState);
            setIsMuted(newState);
        } else if (clientRef.current && getAgoraRTC()) {
            try {
                await createAndPublishLocalAudio(getAgoraRTC(), clientRef.current);
                setIsMuted(newState);
                setAgoraStatusNote(null);
            } catch (e) {
                console.error("Failed to re-acquire mic on toggle:", e);
            }
        }
    };

    const forcePlayRemoteAudio = () => {
        if (remoteAudioTrackRef.current) {
            remoteAudioTrackRef.current.play();
            setAgoraStatusNote(null);
            toast.success("Resumed remote audio");
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
                <div className="mb-2 flex flex-col items-center gap-2">
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
                    {agoraStatusNote && !isReadOnly && (
                        <button
                            type="button"
                            onClick={forcePlayRemoteAudio}
                            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold backdrop-blur-xl"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {agoraStatusNote}
                        </button>
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
