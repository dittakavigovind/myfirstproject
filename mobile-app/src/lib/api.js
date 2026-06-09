import axios from "axios";
import { Preferences } from "@capacitor/preferences";

let cachedToken = null;

export const setApiToken = (token) => {
    cachedToken = token;
};

export const clearApiToken = () => {
    cachedToken = null;
};

export const getApiToken = () => cachedToken;

// Assuming the local backend runs on localhost:5000. 
// For physical devices, you might need your local IP here (e.g., http://192.168.x.x:5000)
// Use localhost for Port Forwarding (Most stable for physical devices via USB)
const API_URL = "http://192.168.29.133:5000/api";

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
            clearApiToken();
            await Preferences.remove({ key: "authToken" });
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth-unauthorized"));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
