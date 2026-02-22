"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../lib/api';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        users: 0,
        astrologers: 0,
        revenue: 0,
        activeChats: 0,
        pendingRequests: 0
    });

    const fetchAdminStats = async () => {
        if (user && ['admin', 'manager'].includes(user.role)) {
            try {
                // Fetch basic stats
                const statsRes = await API.get('/admin/stats');

                // Fetch requests to get accurate count
                const reqRes = await API.get('/requests/admin/all');

                setStats({
                    ...statsRes.data,
                    pendingRequests: reqRes.data.success ? reqRes.data.data.length : 0
                });
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        }
    };

    useEffect(() => {
        if (user) {
            fetchAdminStats();
        }
    }, [user]);

    return (
        <AdminContext.Provider value={{ stats, fetchAdminStats }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
