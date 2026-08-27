import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const getImageUrl = (path, gender = null) => {
    if (!path || path.includes('default-avatar.png')) {
        return gender === 'female' ? "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    }
    const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://192.168.29.133:5000";
    
    // If it's a backend upload, ensure it uses the current backend URL instead of the one saved in DB
    if (path.includes('/api/uploads/')) {
        const parts = path.split('/api/uploads/');
        return `${backendUrl}/api/uploads/${parts[1]}`;
    }

    if (path.startsWith("http")) return path.replace('http://localhost:5000', backendUrl).replace('https://localhost:5000', backendUrl);
    const normalizedPath = path.replace(/\\/g, "/");
    return `${backendUrl}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
};
