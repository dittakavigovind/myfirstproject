"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import API from '../lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data:", e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, redirectPath = null) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            router.push(redirectPath || '/dashboard');
            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (name, email, password, redirectPath = null) => {
        try {
            const { data } = await API.post('/auth/register', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            router.push(redirectPath || '/dashboard');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const sendOtp = async (phone) => {
        try {
            await API.post('/auth/send-whatsapp-otp', { mobile_number: phone });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
        }
    };

    const verifyOtp = async (phone, otp, redirectPath = null) => {
        try {
            const { data } = await API.post('/auth/verify-whatsapp-otp', { mobile_number: phone, otp });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);

            // Redirect based on if new user (maybe to profile setup?)
            // For now dashboard or custom path
            router.push(redirectPath || '/dashboard');
            return { success: true, needsProfileSetup: data.needsProfileSetup };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Invalid OTP' };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const updateUser = (userData) => {
        if (!user) return;

        // Deep merge or just spread top level? 
        // Backend returns { success, message, user, needsProfileSetup } in updateProfile
        // userData passed here might be the user object or a partial update
        const updatedUser = {
            ...user,
            ...(userData.user || userData),
            needsProfileSetup: userData.needsProfileSetup !== undefined
                ? userData.needsProfileSetup
                : user.needsProfileSetup
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, sendOtp, verifyOtp, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
