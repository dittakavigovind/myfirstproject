import axios from 'axios';
import { API_BASE } from './urlHelper';

const API = axios.create({
    baseURL: API_BASE, // Centralized URL
    timeout: 10000,     // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Token to requests
API.interceptors.request.use((req) => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.token) {
                    req.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (error) {
                console.error("API Interceptor JSON Parse Error:", error);
                // Optionally clear invalid storage here, but AuthContext should handle it.
            }
        }
    }
    return req;
});

// Add Response Interceptor for Global 401 Handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const message = error.response.data?.message;
            if (error.response.data?.code === 'SESSION_EXPIRED' || message === 'Session expired. You have logged in from another device.') {
                if (typeof window !== 'undefined') {
                    alert('Session expired. You have logged in from another device.');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default API;
