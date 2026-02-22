import axios from 'axios';
import { API_BASE } from './urlHelper';

const API = axios.create({
    baseURL: API_BASE, // Centralized URL
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

export default API;
