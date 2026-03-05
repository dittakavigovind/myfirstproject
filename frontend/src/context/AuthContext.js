"use client";

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                // Migration: Ensure 'token' is also set separately if not already
                if (parsed.token && !localStorage.getItem('token')) {
                    localStorage.setItem('token', parsed.token);
                }
            } catch (error) {
                console.error("Failed to parse user data:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, redirectPath = null) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
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

    const register = async (name, email, password, mobileNumber, redirectPath = null) => {
        try {
            const { data } = await API.post('/auth/register', { name, email, password, mobileNumber });
            // For email registration, we don't log in immediately, we wait for verification
            // However, we should return success so the UI can show the "check email" message
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const resendVerification = async (email) => {
        try {
            const { data } = await API.post('/auth/resend-verification', { email });
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend verification email'
            };
        }
    };

    const verifyEmail = async (token) => {
        try {
            const { data } = await API.get(`/auth/verify-email/${token}`);
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Email verification failed'
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
            localStorage.setItem('token', data.token);
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
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);

        // Hard redirect to home ensures total state reset and fulfills user request
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    const setAuth = useCallback((userData) => {
        const data = userData.user || userData;
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
        setLoading(false); // Failsafe: Ensure loading is off if we manually set auth
    }, []);

    const updateUser = useCallback((userData) => {
        setUser(prevUser => {
            const currentUser = prevUser || JSON.parse(localStorage.getItem('user') || 'null');
            if (!currentUser) return prevUser;

            const updatedUser = {
                ...currentUser,
                ...(userData.user || userData),
                needsProfileSetup: userData.needsProfileSetup !== undefined
                    ? userData.needsProfileSetup
                    : (userData.user?.needsProfileSetup || currentUser.needsProfileSetup)
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            token: user?.token,
            login,
            register,
            logout,
            sendOtp,
            verifyOtp,
            updateUser,
            setAuth,
            resendVerification,
            verifyEmail,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
