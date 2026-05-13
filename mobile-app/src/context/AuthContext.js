"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkUser();

        // Listen for unauthorized events global
        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener("auth-unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth-unauthorized", handleUnauthorized);
    }, []);

    const checkUser = async () => {
        try {
            const { value: token } = await Preferences.get({ key: "authToken" });

            if (token) {
                // Fetch user details from the backend
                const response = await api.get("/auth/me");
                setUser(response.data);
                
                // Fetch unread count for the bell badge
                const notifRes = await api.get("/notifications/my");
                if (notifRes.data.success) {
                    setUser(prev => ({ ...prev, unreadNotifications: notifRes.data.unreadCount }));
                }

                registerPushNotifications();
            }
        } catch (error) {
            console.error("Failed to authenticate user on load", error);
        } finally {
            setLoading(false);
        }
    };

    const registerPushNotifications = async () => {
        if (Capacitor.isNativePlatform()) {
            let permStatus = await PushNotifications.checkPermissions();
            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }
            if (permStatus.receive !== 'granted') return;

            await PushNotifications.register();

            // Create Android Notification Channels for Custom Sounds
            try {
                await PushNotifications.createChannel({
                    id: 'astro_chat_alerts',
                    name: 'Chat Requests',
                    description: 'Alerts for incoming chat requests',
                    importance: 5,
                    visibility: 1,
                    sound: 'chat_alert', // Must match the wav file name without extension in res/raw
                    vibration: true
                });
            } catch (err) {
                console.log('Failed to create notification channel, possibly iOS or not supported:', err);
            }

            // Set up listeners just once
            PushNotifications.addListener('registration', async (token) => {
                console.log('Mobile Hardware FCM Token: ' + token.value);
                try {
                    await api.put('/users/fcm-token', { fcmToken: token.value });
                    console.log('Device securely registered to Astro Platform for Push Notifications.');
                } catch (e) {
                    console.error('Failed to save FCM token to backend', e);
                }
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Live Push Received: ', notification);
                // Optionally refresh unread count here
                checkUnreadCount();
            });

            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                console.log('Push Action Performed: ', notification);
                router.push('/notifications');
            });
        }
    };

    const checkUnreadCount = async () => {
        try {
            const notifRes = await api.get("/notifications/my");
            if (notifRes.data.success) {
                setUser(prev => prev ? ({ ...prev, unreadNotifications: notifRes.data.unreadCount }) : prev);
            }
        } catch (e) {
            console.error("Failed to refresh unread count", e);
        }
    };

    const login = async (token, userData) => {
        await Preferences.set({ key: "authToken", value: token });
        setUser(userData);
        registerPushNotifications();
        
        // Role-based redirection: Astrologers land on Profile, Seekers land on Home
        if (userData?.role === 'astrologer') {
            router.push("/profile");
        } else {
            router.push("/");
        }
    };

    const logout = async () => {
        try {
            if (user) {
                await api.post("/chat/end-all-sessions");
            }
        } catch (e) {
            console.error("Error ending sessions on logout", e);
        }
        await Preferences.remove({ key: "authToken" });
        setUser(null);
        router.push("/auth");
    };

    // Basic Route protection
    useEffect(() => {
        if (!loading && !user && pathname !== "/auth") {
            router.push("/auth");
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {!loading ? children : <div className="min-h-screen flex items-center justify-center bg-cosmic-indigo"><div className="w-8 h-8 rounded-full border-t-2 border-electric-violet animate-spin" /></div>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
