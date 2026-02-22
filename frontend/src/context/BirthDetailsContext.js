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
        // 1. Try to get from localStorage
        const storedDetails = localStorage.getItem('way2astro_birth_details');
        let parsed = null;

        if (storedDetails) {
            try {
                parsed = JSON.parse(storedDetails);
                if (parsed.date) parsed.date = new Date(parsed.date);
                // Time should remain string "HH:MM"
                if (parsed.time && (parsed.time === 'NaN:NaN' || !/^\d{2}:\d{2}(:\d{2})?$/.test(parsed.time))) {
                    parsed.time = null;
                }
            } catch (e) {
                console.error("Failed to parse birth details", e);
                localStorage.removeItem('way2astro_birth_details');
            }
        }

        // 2. Logic: User Logged In
        if (user) {
            const currentUserId = user._id || user.id;

            // Scenario A: Active Session for THIS User exists
            if (parsed && parsed.userId === currentUserId) {
                setBirthDetails(parsed);
                setIsInitialized(true);
                return;
            }

            // Scenario B: Guest Data (no userId) OR Other User's Data -> Overwrite with Profile
            // This satisfies "If user signs in then the user profile is the default inputs"
            const bd = user.birthDetails || {};
            const profileDetails = {
                name: user.name || '',
                gender: user.gender || 'male',
                date: bd.date ? new Date(bd.date) : (bd.dob ? new Date(bd.dob) : null),
                time: bd.time || bd.tob || null,
                place: bd.place || bd.pob || '',
                lat: bd.lat || '',
                lng: bd.lng || '',
                timezone: bd.timezone || 5.5,
                userId: currentUserId
            };

            setBirthDetails(profileDetails);
            // Sync this "reset" to localStorage immediately so it persists on reload
            localStorage.setItem('way2astro_birth_details', JSON.stringify(profileDetails));
            setIsInitialized(true);
            return;
        }

        // 3. Logic: Guest (Not Logged In)
        if (parsed) {
            setBirthDetails(parsed);
            setIsInitialized(true);
            return;
        }

        // 4. Logic: Fresh Guest
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
