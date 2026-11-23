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

// Track app resume time to provide a grace period after waking from background
let lastResumedAt = typeof Date !== "undefined" ? Date.now() : 0;

if (typeof window !== "undefined") {
    // 1. Standard web visibility change listener
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            lastResumedAt = Date.now();
            // Clear any lingering network error toast immediately when user returns to app
            toast.dismiss("network-error");
        } else {
            toast.dismiss("network-error");
        }
    });

    // 2. Window focus listener
    window.addEventListener("focus", () => {
        lastResumedAt = Date.now();
        toast.dismiss("network-error");
    });

    // 3. Native Capacitor App state listener for background / foreground lifecycle
    if (window.Capacitor?.isNativePlatform?.()) {
        import("@capacitor/app")
            .then(({ App }) => {
                App.addListener("appStateChange", ({ isActive }) => {
                    if (isActive) {
                        lastResumedAt = Date.now();
                        toast.dismiss("network-error");
                    } else {
                        toast.dismiss("network-error");
                    }
                }).catch(() => {});
            })
            .catch(() => {});
    }
}

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
            const isHidden = typeof document !== "undefined" && (document.hidden || document.visibilityState === "hidden");
            if (!isSilent && !isHidden && typeof window !== "undefined" && !url.includes('/auth/firebase-token')) {
                toast.error("Server error. Please try again later.", { id: 'server-error' });
            }
        } else if (error.message === "Network Error" || error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
            const isHidden = typeof document !== "undefined" && (document.hidden || document.visibilityState === "hidden");
            const isJustResumed = Date.now() - lastResumedAt < 3000;

            // Never show network error toast if:
            // 1. Request was marked as silent (e.g. background polling / intervals / prefetching)
            // 2. The app is currently hidden/in the background (OS suspends sockets in background)
            // 3. The app just resumed within 3 seconds (OS re-establishes radio / TCP sockets)
            if (!isSilent && !isHidden && !isJustResumed && typeof window !== "undefined") {
                toast.error("Network error. Please check your connection.", { id: 'network-error' });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
