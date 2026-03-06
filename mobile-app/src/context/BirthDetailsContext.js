"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { Preferences } from '@capacitor/preferences';

const BirthDetailsContext = createContext();

export const BirthDetailsProvider = ({ children }) => {
    const { user } = useAuth();
    const [birthDetails, setBirthDetails] = useState({
        name: '',
        gender: 'male',
        date: null,
        time: null,
        place: 'New Delhi, India',
        lat: 28.6139,
        lng: 77.2090,
        timezone: 5.5,
        userId: null
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { value: storedDetails } = await Preferences.get({ key: 'way2astro_birth_details' });
            let parsed = null;

            if (storedDetails) {
                try {
                    parsed = JSON.parse(storedDetails);
                    // No need to convert date to Date object here as we'll use string yyyy-mm-dd for mobile inputs
                } catch (e) {
                    console.error("Failed to parse birth details", e);
                }
            }

            if (user) {
                const currentUserId = user._id || user.id;

                if (parsed && parsed.userId === currentUserId) {
                    setBirthDetails(parsed);
                } else {
                    const bd = user.birthDetails || {};
                    const profileDetails = {
                        name: user.name || '',
                        gender: user.gender || 'male',
                        date: bd.date || bd.dob || null,
                        time: bd.time || bd.tob || null,
                        place: bd.place || bd.pob || 'New Delhi, India',
                        lat: bd.lat || 28.6139,
                        lng: bd.lng || 77.2090,
                        timezone: bd.timezone || 5.5,
                        userId: currentUserId
                    };
                    setBirthDetails(profileDetails);
                    await Preferences.set({ key: 'way2astro_birth_details', value: JSON.stringify(profileDetails) });
                }
            } else if (parsed) {
                setBirthDetails(parsed);
            }
            setIsInitialized(true);
        };

        init();
    }, [user]);

    const updateBirthDetails = async (details) => {
        const currentUserId = user ? (user._id || user.id) : null;
        const newDetails = {
            ...birthDetails,
            ...details,
            userId: currentUserId
        };

        setBirthDetails(newDetails);
        await Preferences.set({ key: 'way2astro_birth_details', value: JSON.stringify(newDetails) });
    };

    return (
        <BirthDetailsContext.Provider value={{ birthDetails, setBirthDetails: updateBirthDetails, isInitialized }}>
            {children}
        </BirthDetailsContext.Provider>
    );
};

export const useBirthDetails = () => useContext(BirthDetailsContext);
