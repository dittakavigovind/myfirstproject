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
    timeout: 12000, // 12 second timeout to prevent hanging connections
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
        // Ignore canceled/aborted requests completely (e.g., page navigation, Fast Refresh, component unmount)
        if (axios.isCancel(error) || error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
            return Promise.reject(error);
        }

        // Check if request requested silent failure (e.g. background polling or notifications check)
        const isSilent =
            error?.config?.silent === true ||
            error?.config?.headers?.["X-Silent-Error"] === "true" ||
            error?.config?.headers?.["x-silent-error"] === "true";

        if (error.response?.status === 401) {
            const hadToken = !!cachedToken;
            clearApiToken();
            await Preferences.remove({ key: "authToken" });

            if (hadToken) {
                const message = error.response?.data?.message;
                if (error.response?.data?.code === 'SESSION_EXPIRED' || message === 'Session expired. You have logged in from another device.') {
                    if (typeof window !== "undefined") {
                        toast.error('Session expired. You have logged in from another device.', { id: 'session-expired' });
                    }
                }
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("auth-unauthorized"));
                }
            }
        } else if (error.response?.status >= 500) {
            const url = error.config?.url || '';
            if (!isSilent && typeof window !== "undefined" && !url.includes('/auth/firebase-token')) {
                toast.error("Server error. Please try again later.", { id: 'server-error' });
            }
        } else if (error.message === "Network Error" || error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
            // Deduplicate network error toast so parallel calls don't spam the UI
            if (!isSilent && typeof window !== "undefined") {
                toast.error("Network error. Please check your connection.", { id: 'network-error' });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
