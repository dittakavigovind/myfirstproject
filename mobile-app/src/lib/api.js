import axios from "axios";
import { Preferences } from "@capacitor/preferences";
import toast from "react-hot-toast";

let cachedToken = null;

export const setApiToken = (token) => {
    cachedToken = token;
};

export const clearApiToken = () => {
    cachedToken = null;
};

export const getApiToken = () => cachedToken;

// Use environment variable for the API URL, fallback to local IP if not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.29.133:5000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    async (config) => {
        try {
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
            // Unauthorized, clear token
            const message = error.response?.data?.message;
            if (error.response?.data?.code === 'SESSION_EXPIRED' || message === 'Session expired. You have logged in from another device.') {
                if (typeof window !== "undefined") {
                    toast.error('Session expired. You have logged in from another device.');
                }
            }

            clearApiToken();
            await Preferences.remove({ key: "authToken" });
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth-unauthorized"));
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
