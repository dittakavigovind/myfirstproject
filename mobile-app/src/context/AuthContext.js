"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
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
            }
        } catch (error) {
            console.error("Failed to authenticate user on load", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, userData) => {
        await Preferences.set({ key: "authToken", value: token });
        setUser(userData);
        router.push("/");
    };

    const logout = async () => {
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
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading ? children : <div className="min-h-screen flex items-center justify-center bg-cosmic-indigo"><div className="w-8 h-8 rounded-full border-t-2 border-electric-violet animate-spin" /></div>}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
