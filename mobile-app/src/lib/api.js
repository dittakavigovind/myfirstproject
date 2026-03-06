import axios from "axios";
import { Preferences } from "@capacitor/preferences";

// Assuming the local backend runs on localhost:5000. 
// For physical devices, you might need your local IP here (e.g., http://192.168.x.x:5000)
const API_URL = "http://localhost:5000/api";

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
            // Use Capacitor Preferences for secure storage on mobile, acts as localStorage on web
            const { value } = await Preferences.get({ key: "authToken" });
            if (value) {
                config.headers.Authorization = `Bearer ${value}`;
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
            await Preferences.remove({ key: "authToken" });
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth-unauthorized"));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
