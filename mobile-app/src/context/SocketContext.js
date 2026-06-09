"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Preferences } from "@capacitor/preferences";
import api, { getApiToken } from "@/lib/api";
import { Sparkles, X, Volume2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [socket, setSocket] = useState(null);
    const audioRef = useRef(null);

    const [incomingSession, setIncomingSession] = useState(null);
    const [alertSoundUrl, setAlertSoundUrl] = useState(null);
    const activeAlertRef = useRef(null);

    useEffect(() => {
        if (incomingSession && pathname === '/chat/room') {
            const currentRoomId = searchParams?.get('id') || searchParams?.get('roomId');
            if (currentRoomId === incomingSession.roomId) {
                stopAlertSound();
                setIncomingSession(null);
            }
        }
    }, [pathname, searchParams, incomingSession]);

    const stopAlertSound = () => {
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            } catch (e) {
                console.error("Error stopping audio:", e);
            }
            audioRef.current = null;
        }
        activeAlertRef.current = null;
    };

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            stopAlertSound();
            return;
        }

        let newSocket;

        const initSocket = async () => {
            let token = getApiToken();
            if (!token) {
                try {
                    const { value } = await Preferences.get({ key: "authToken" });
                    token = value;
                } catch (e) {
                    token = localStorage.getItem("authToken");
                }
            }

            const BACKEND_URL = "http://192.168.29.133:5000";

            newSocket = io(BACKEND_URL, {
                auth: { token }
            });

            newSocket.on("incoming_session", async (data) => {
                console.log("Incoming session received:", data);
                if (user.role === 'astrologer') {
                    setIncomingSession(data);
                    activeAlertRef.current = data.roomId;
                    
                    try {
                        const settingsRes = await api.get('/site-settings');
                        
                        if (activeAlertRef.current !== data.roomId) return;

                        const chatAlertSoundUrl = settingsRes.data?.settings?.chatAlertSoundUrl || '/sounds/chat_alert.mp3';
                        const callAlertSoundUrl = settingsRes.data?.settings?.callAlertSoundUrl || '/sounds/call_alert.mp3';

                        const relativeAudioUrl = (data.sessionType === 'call' || data.sessionType === 'audio') ? callAlertSoundUrl : chatAlertSoundUrl;
                        const finalAudioUrl = relativeAudioUrl;

                        setAlertSoundUrl(finalAudioUrl);

                        stopAlertSound();

                        const audio = new Audio(finalAudioUrl);
                        audio.loop = true;
                        audioRef.current = audio;
                        audio.play().catch(e => {
                            console.warn("Auto-play blocked, user must click the alert button");
                        });
                    } catch (err) {
                        console.error("Failed to play sound", err);
                    }
                }
            });

            newSocket.on("session_ended", (data) => {
                if (activeAlertRef.current === data.roomId) {
                    stopAlertSound();
                    setIncomingSession(null);
                }
            });

            newSocket.on("session_declined", (data) => {
                if (activeAlertRef.current === data.roomId) {
                    stopAlertSound();
                    setIncomingSession(null);
                }
            });

            newSocket.on("connect", () => setSocket(newSocket));
            setSocket(newSocket);
        };

        initSocket();

        return () => {
            if (newSocket) newSocket.disconnect();
            stopAlertSound();
        };
    }, [user?._id]);

    const playAlertManual = () => {
        if (!incomingSession) return;
        const urlToPlay = alertSoundUrl || '/sounds/chat_alert.mp3';
        
        stopAlertSound();
        const audio = new Audio(urlToPlay);
        audio.loop = true;
        audioRef.current = audio;
        audio.play().catch(e => console.error("Manual play failed:", e));
    };

    return (
        <SocketContext.Provider value={{ socket, incomingSession, setIncomingSession }}>
            {children}
            
            {incomingSession && (
                <div className="fixed top-20 left-4 right-4 z-[9999] bg-slate-900 border-2 border-electric-violet p-5 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-10 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-electric-violet/20 rounded-full flex items-center justify-center animate-pulse">
                            <Sparkles className="text-electric-violet" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-lg">New {(incomingSession.sessionType === 'call' || incomingSession.sessionType === 'audio') ? 'Call' : 'Chat'}!</h3>
                            <p className="text-slate-400 text-sm">A client is waiting for your guidance.</p>
                        </div>
                        <button 
                            onClick={() => {
                                stopAlertSound();
                                setIncomingSession(null);
                            }}
                            className="p-2 text-slate-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex gap-3 mt-5">
                        <button 
                            onClick={async () => {
                                stopAlertSound();
                                const roomId = incomingSession.roomId;
                                setIncomingSession(null);
                                try {
                                    await api.post(`/chat/session/${roomId}/decline`);
                                } catch (e) {
                                    console.error("Error declining session", e);
                                }
                            }}
                            className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-rose-500/20 transition-all"
                        >
                            <X size={18} /> Decline
                        </button>
                        <button 
                            onClick={() => {
                                stopAlertSound();
                                setIncomingSession(null);
                                if (incomingSession.sessionType === 'audio' || incomingSession.sessionType === 'call') {
                                    router.push(`/call/room?id=${incomingSession.roomId}`);
                                } else {
                                    router.push(`/chat/room?id=${incomingSession.roomId}`);
                                }
                            }}
                            className="flex-1 bg-electric-violet hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-electric-violet/20"
                        >
                            Accept Now
                        </button>
                    </div>
                </div>
            )}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
