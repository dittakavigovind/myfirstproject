"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/api";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, AlertCircle, UserRound } from "lucide-react";
import toast from "react-hot-toast";

let AgoraRTC;
if (typeof window !== "undefined") {
    AgoraRTC = require("agora-rtc-sdk-ng");
}

export default function CallRoomClient() {
    const { user, checkUser } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("id");

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
    
    const clientRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const remoteAudioTrackRef = useRef(null);
    const localStartTimeRef = useRef(null);
    const isReadOnlyRef = useRef(false);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleLeaveRoom = () => {
        if (checkUser) checkUser();
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
            if (!AgoraRTC || clientRef.current) return;
            setConnectionState("Initializing call...");
            const { data } = await api.post('/agora/token', {
                channelName: roomId,
                sessionType: 'voice',
                uid: user._id
            });

            if (!data.success) {
                throw new Error("Failed to get token");
            }

            const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current = client;

            client.on("user-published", async (remoteUser, mediaType) => {
                await client.subscribe(remoteUser, mediaType);
                if (mediaType === "audio") {
                    setRemoteUserJoined(true);
                    setConnectionState("Connected");
                    remoteAudioTrackRef.current = remoteUser.audioTrack;
                    remoteUser.audioTrack.play();
                    console.log("Remote audio track played automatically");
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
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
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
            console.error("Agora Error:", error);
            toast.error("Call connection failed.");
            setConnectionState(`Failed: ${error.message || "Unknown error"}`);
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
    };

    // Socket Event Listeners for Session End & Timer Sync
    useEffect(() => {
        if (!socket || !roomId || !user) return;

        socket.emit("join_chat_session", { roomId, userId: user._id, role: user.role });

        // Timer/Status handlers
        const handleSessionEnded = (data) => {
            setIsReadOnly(true);
            isReadOnlyRef.current = true;
            setSessionActive(false);
            setConnectionState("Call Ended");
            cleanupCall();
            let msg = data?.reason || "Call Terminated";
            if (data?.reason === 'low_balance') msg = "Call ended due to low balance.";
            toast(msg, { icon: 'ℹ️' });

            setTimeout(() => {
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
        if (socket && user?.role === 'astrologer' && !sessionActive && !isReadOnlyRef.current) {
            socket.emit("start_chat_session", { roomId, astrologerId: user._id });
        }
    }, [socket, user, roomId, sessionActive]);

    // Client-side timer
    useEffect(() => {
        let interval;
        if (sessionActive && !isReadOnly) {
            interval = setInterval(() => {
                if (localStartTimeRef.current && !isReadOnlyRef.current) {
                    const elapsed = Math.floor((Date.now() - localStartTimeRef.current) / 1000);
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

    const toggleSpeaker = () => {
        // Agora Web SDK handles playback device primarily. 
        // We'll visually toggle speaker, but on mobile PWA, volume is controlled by OS.
        setIsSpeakerOn(!isSpeakerOn);
        toast("Speaker " + (!isSpeakerOn ? "On" : "Off"));
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
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white z-50">
                <Loader2 className="animate-spin text-electric-violet mb-4" size={40} />
                <p>Loading Call Environment...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col z-[100] text-white">
            {/* Header / Info */}
            <div className="flex-1 flex flex-col items-center justify-center pt-10">
                <div className="w-32 h-32 rounded-full bg-slate-800 shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden border-4 border-slate-700">
                    <Sparkles className="w-12 h-12 text-slate-500" />
                    {sessionActive && remoteUserJoined && (
                        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-pulse" />
                    )}
                </div>
                
                <h2 className="text-3xl font-bold mb-2">
                    {user?.role === 'astrologer' ? 'User' : 'Astrologer'}
                </h2>
                
                <p className={`text-lg mb-8 ${sessionActive ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
                    {sessionActive ? formatTime(duration) : connectionState}
                </p>

                {isReadOnly && (
                    <div className="mt-4 px-6 py-2 bg-rose-500/20 text-rose-300 rounded-full flex items-center gap-2">
                        <AlertCircle size={18} />
                        Call Ended
                    </div>
                )}
            </div>

            {/* Controls (WhatsApp Style) */}
            <div className="bg-slate-950 pb-safe pt-6 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-md mx-auto px-8 pb-10">
                    <div className="flex items-center justify-between">
                        
                        <button 
                            onClick={toggleSpeaker}
                            disabled={isReadOnly}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isSpeakerOn ? 'bg-slate-800 text-white' : 'bg-slate-800/50 text-slate-400'}`}
                        >
                            {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </button>
                        
                        <button 
                            onClick={isReadOnly ? handleLeaveRoom : endCall}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isReadOnly ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                        >
                            <PhoneOff size={32} className="text-white" />
                        </button>

                        {/* Force Play Audio Button (Debug) */}
                        <button
                            onClick={forcePlayRemoteAudio}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-slate-800 text-slate-300 hover:bg-slate-700`}
                            title="Force Play Remote Audio"
                        >
                            <Volume2 size={24} />
                        </button>

                        <button 
                            onClick={toggleMute}
                            disabled={isReadOnly}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isMuted ? 'bg-slate-800 text-white' : 'bg-rose-500/20 text-rose-500'}`}
                        >
                            {!isMuted ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
