"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Preferences } from "@capacitor/preferences";
import api from "@/lib/api";

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        let newSocket;

        const initSocket = async () => {
            let token = "";
            try {
                const { value } = await Preferences.get({ key: "authToken" });
                token = value;
            } catch (e) {
                token = localStorage.getItem("authToken");
            }

            // Must match backend URL without /api
            const SOCKET_URL = "http://192.168.29.133:5000";

            newSocket = io(SOCKET_URL, {
                auth: { token }
            });

            newSocket.on("connect", () => {
                console.log("Global Socket Connected");
            });

            newSocket.on("incoming_session", async (data) => {
                console.log("Incoming session received:", data);
                if (user.role === 'astrologer') {
                    // Fetch sound settings from CMS/SiteSettings (fallback to default sounds)
                    try {
                        const settingsRes = await api.get('/site-settings');
                        const chatAlertSoundUrl = settingsRes.data?.settings?.chatAlertSoundUrl || '/sounds/chat_alert.mp3';
                        const callAlertSoundUrl = settingsRes.data?.settings?.callAlertSoundUrl || '/sounds/call_alert.mp3';

                        const audioUrl = data.sessionType === 'call' ? callAlertSoundUrl : chatAlertSoundUrl;
                        const audio = new Audio(audioUrl);
                        audio.play().catch(e => console.error("Audio play failed:", e));
                    } catch (err) {
                        console.error("Failed to fetch settings for sound", err);
                        const audio = new Audio('/sounds/chat_alert.mp3');
                        audio.play().catch(e => console.error("Audio play failed:", e));
                    }
                    
                    // The SessionBanner polls every 30s, but we can trigger a custom event to update it immediately
                    window.dispatchEvent(new CustomEvent('session-started', { detail: data }));
                }
            });

            newSocket.on("disconnect", () => {
                console.log("Global Socket Disconnected");
            });

            setSocket(newSocket);
        };

        initSocket();

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
