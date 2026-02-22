"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useBirthDetails } from './BirthDetailsContext';
import API from '@/lib/api';
import toast from 'react-hot-toast';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const { birthDetails } = useBirthDetails(); // Input source

    // State for the session
    const [activeTab, setActiveTab] = useState('inputs');

    // Cache to store results keyed by "TabName_BirthDetailsHash"
    // Structure: { 'kundli_2023-10-10_10:10...': { data: ..., timestamp: ... } }
    const [cache, setCache] = useState({});

    // Loading states per tab
    const [loading, setLoading] = useState({});

    // Generate a hash for current birth details to use as cache key
    const getHash = (details, tab) => {
        if (!details || !details.date || !details.time) return null;
        // Simple string key
        const d = new Date(details.date).toISOString().split('T')[0];
        // Time might be string HH:MM or Date
        let t = details.time;
        if (details.time instanceof Date) {
            t = details.time.toTimeString().slice(0, 5);
        }
        return `${tab}_${d}_${t}_${details.lat}_${details.lng}_${details.timezone}_${details.name}`;
    };

    const fetchTabData = async (tab) => {
        if (tab === 'inputs') return;

        if (!birthDetails.date || !birthDetails.time) return;

        const hash = getHash(birthDetails, tab);
        if (!hash) return;

        // Check Cache
        if (cache[hash]) {
            // console.log(`[Session] Cache Hit for ${tab}`);
            return;
        }

        setLoading(prev => ({ ...prev, [tab]: true }));

        try {
            // Prepare Payload
            const payload = {
                date: new Date(birthDetails.date).toLocaleDateString('en-CA'),
                time: typeof birthDetails.time === 'string' ? birthDetails.time : birthDetails.time.toTimeString().slice(0, 5),
                lat: birthDetails.lat,
                lng: birthDetails.lng,
                timezone: birthDetails.timezone,
                name: birthDetails.name,
                gender: birthDetails.gender,
                place: birthDetails.place // Added for backend logging
            };

            let endpoint = '';
            switch (tab) {
                case 'kundli': endpoint = '/astro/kundli'; break;
                // Dasha might need specific calc or just use Kundli's dasha data? 
                // Using specific if heavy, but likely Kundli return has it.
                // Let's assume Kundli endpoint returns enough for Dasha tab initially or we split?
                // Plan: Dasha tab uses '/astro/kundli' data if mostly Vimshottari. 
                // Or '/astro/yogini-dasha' for extended.
                // Let's make Dasha a separate fetch if we want specialized deep data, 
                // but Kundli endpoint returns `dashas` (Vimshottari).
                // Let's re-fetch Kundli for Dasha tab? No, re-use.

                case 'dasha': endpoint = '/astro/kundli'; break; // Re-use Kundli data for now
                case 'divisional': endpoint = '/astro/divisional-charts'; break;
                case 'dosha': endpoint = '/astro/dosha'; break;
                case 'arudha': endpoint = '/astro/kundli'; break; // Use full kundli data for Arudha view context
                case 'ashtakavarga': endpoint = '/astro/ashtakavarga'; break;
                case 'jaimini': endpoint = '/astro/jaimini-karakas'; break;
                default: endpoint = '/astro/kundli';
            }

            //console.log(`[Session] Fetching ${tab}...`);
            const res = await API.post(endpoint, payload);

            if (res.data.success) {
                setCache(prev => ({
                    ...prev,
                    [hash]: res.data.data
                }));
            }
        } catch (error) {
            console.error(`[Session] Value Error for ${tab}`, error);
            const msg = error.response?.data?.message || error.message || `Failed to load ${tab} data`;
            toast.error(msg);
        } finally {
            setLoading(prev => ({ ...prev, [tab]: false }));
        }
    };

    // When active tab changes, fetch if needed
    useEffect(() => {
        fetchTabData(activeTab);
    }, [activeTab, birthDetails]);

    const getData = (tab) => {
        const hash = getHash(birthDetails, tab);
        return cache[hash] || null;
    };

    const isLoading = (tab) => !!loading[tab];

    const downloadAllData = async () => {
        const tabs = ['kundli', 'dasha', 'dosha', 'arudha', 'ashtakavarga', 'jaimini'];
        const allData = {};

        if (!birthDetails.date || !birthDetails.time) {
            toast.error("Please enter birth details first.");
            return null;
        }

        // Prepare Payload (same for all fetches)
        const payload = {
            date: new Date(birthDetails.date).toLocaleDateString('en-CA'),
            time: typeof birthDetails.time === 'string' ? birthDetails.time : birthDetails.time.toTimeString().slice(0, 5),
            lat: birthDetails.lat,
            lng: birthDetails.lng,
            timezone: birthDetails.timezone,
            name: birthDetails.name,
            gender: birthDetails.gender,
            place: birthDetails.place
        };

        for (const tab of tabs) {
            const hash = getHash(birthDetails, tab);
            if (!hash) continue;

            if (cache[hash]) {
                allData[tab] = cache[hash];
            } else {
                try {
                    let endpoint = '';
                    switch (tab) {
                        case 'kundli': endpoint = '/astro/kundli'; break;
                        case 'dasha': endpoint = '/astro/kundli'; break;
                        case 'dosha': endpoint = '/astro/dosha'; break;
                        case 'arudha': endpoint = '/astro/kundli'; break;
                        case 'ashtakavarga': endpoint = '/astro/ashtakavarga'; break;
                        case 'jaimini': endpoint = '/astro/jaimini-karakas'; break;
                        default: endpoint = '/astro/kundli';
                    }

                    const res = await API.post(endpoint, payload);
                    if (res.data.success) {
                        setCache(prev => ({ ...prev, [hash]: res.data.data }));
                        allData[tab] = res.data.data;
                    }
                } catch (e) {
                    console.error(`Error fetching ${tab} for download:`, e);
                    toast.error(`Failed to load ${tab} data for download.`);
                }
            }
        }
        return allData;
    };

    return (
        <SessionContext.Provider value={{
            activeTab,
            setActiveTab,
            birthDetails,
            getData,
            isLoading,
            fetchTabData,
            downloadAllData
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
