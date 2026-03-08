"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const BirthDetailsContext = createContext();

export const BirthDetailsProvider = ({ children }) => {
    const { user } = useAuth();
    const [birthDetails, setBirthDetails] = useState({
        name: '',
        gender: 'male',
        date: null,
        time: null, // Date object or string depending on consumption
        place: '',
        lat: '',
        lng: '',
        timezone: 5.5,
        userId: null
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Helper to ensure time is always "HH:MM"
        const normalizeTime = (t) => {
            if (!t) return '';
            if (typeof t === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(t)) return t.slice(0, 5);
            const d = new Date(t);
            if (!isNaN(d)) {
                return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            }
            return '';
        };

        // 1. Try to get from localStorage
        const storedDetails = localStorage.getItem('way2astro_birth_details');
        let parsed = null;

        if (storedDetails) {
            try {
                parsed = JSON.parse(storedDetails);
                if (parsed.date) parsed.date = new Date(parsed.date);
                if (parsed.time) parsed.time = normalizeTime(parsed.time);
            } catch (e) {
                console.error("Failed to parse birth details", e);
                localStorage.removeItem('way2astro_birth_details');
            }
        }

        // 2. Logic: User Logged In
        if (user) {
            const userObj = user.user || user;
            const currentUserId = (userObj._id || userObj.id)?.toString();

            if (!currentUserId) {
                setIsInitialized(true);
                return;
            }

            // Scenario A: Active Session exists AND has real birth details
            if (parsed && parsed.userId?.toString() === currentUserId && (parsed.date || parsed.place)) {
                setBirthDetails(parsed);
                setIsInitialized(true);
                return;
            }

            // Scenario B: Overwrite with Profile Data (especially after onboarding update)
            const bd = userObj.birthDetails || {};
            const profileDetails = {
                name: userObj.name || '',
                gender: userObj.gender || 'male',
                date: bd.date ? new Date(bd.date) : (bd.dob ? new Date(bd.dob) : null),
                time: normalizeTime(bd.time || bd.tob),
                place: (bd.place || bd.pob || '').toString(),
                lat: bd.lat || '',
                lng: bd.lng || '',
                timezone: bd.timezone || 5.5,
                userId: currentUserId
            };

            // Only update context/localStorage if the profile has at least some data
            if (profileDetails.name || profileDetails.date || profileDetails.place) {
                setBirthDetails(profileDetails);
                localStorage.setItem('way2astro_birth_details', JSON.stringify(profileDetails));
            }

            setIsInitialized(true);
            return;
        }

        // 3. Logic: Guest
        if (parsed) {
            setBirthDetails(parsed);
        }
        setIsInitialized(true);

    }, [user]);

    const updateBirthDetails = (details) => {
        const currentUserId = user ? (user._id || user.id) : null;

        // Merge new details. IMPORTANT: Update userId if user is logged in
        const newDetails = {
            ...birthDetails,
            ...details,
            userId: currentUserId
        };

        // Normalize time to "HH:MM" if it's a VALID Date object
        if (newDetails.time instanceof Date && !isNaN(newDetails.time)) {
            const h = newDetails.time.getHours().toString().padStart(2, '0');
            const m = newDetails.time.getMinutes().toString().padStart(2, '0');
            newDetails.time = `${h}:${m}`;
        } else if (newDetails.time instanceof Date && isNaN(newDetails.time)) {
            newDetails.time = null; // Reset if invalid date passed
        }

        setBirthDetails(newDetails);
        localStorage.setItem('way2astro_birth_details', JSON.stringify(newDetails));
    };

    return (
        <BirthDetailsContext.Provider value={{ birthDetails, setBirthDetails: updateBirthDetails, isInitialized }}>
            {children}
        </BirthDetailsContext.Provider>
    );
};

export const useBirthDetails = () => useContext(BirthDetailsContext);
