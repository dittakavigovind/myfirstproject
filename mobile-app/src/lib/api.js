import axios from "axios";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import toast from "react-hot-toast";

let cachedToken = null;

export const setApiToken = (token) => {
    cachedToken = token;
};

export const clearApiToken = () => {
    cachedToken = null;
};

export const getApiToken = () => cachedToken;

// Use environment variable for the API URL, fallback to production API if not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.way2astro.com/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "X-Client-Platform": "app",
    },
});

// Request interceptor to attach JWT token and device headers
api.interceptors.request.use(
    async (config) => {
        try {
            config.headers = config.headers || {};
            config.headers["X-Client-Platform"] = "app";
            if (typeof window !== "undefined" && window.Capacitor) {
                try {
                    config.headers["X-Device-OS"] = Capacitor.getPlatform();
                } catch (_) {}
            }
            if (!cachedToken) {
                const { value } = await Preferences.get({ key: "authToken" });
                cachedToken = value;
            }
            if (cachedToken) {
                config.headers.Authorization = `Bearer ${cachedToken}`;
            }
        } catch (e) {
            console.error("Error reading token:", e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const hadToken = !!cachedToken;
            clearApiToken();
            await Preferences.remove({ key: "authToken" });

            if (hadToken) {
                const message = error.response?.data?.message;
                if (error.response?.data?.code === 'SESSION_EXPIRED' || message === 'Session expired. You have logged in from another device.') {
                    if (typeof window !== "undefined") {
                        toast.error('Session expired. You have logged in from another device.');
                    }
                }
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("auth-unauthorized"));
                }
            }
        } else if (error.response?.status >= 500) {
            const url = error.config?.url || '';
            if (typeof window !== "undefined" && !url.includes('/auth/firebase-token')) {
                toast.error("Server error. Please try again later.");
            }
        } else if (error.message === "Network Error") {
            if (typeof window !== "undefined") {
                toast.error("Network error. Please check your connection.");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
