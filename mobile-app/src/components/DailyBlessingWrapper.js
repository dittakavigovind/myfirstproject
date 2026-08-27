"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import DailyBlessingModal from './DailyBlessingModal';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function DailyBlessingWrapper() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const [blessing, setBlessing] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Only run logic on the client side, wait for auth to finish loading
        if (typeof window === 'undefined' || loading) return;
        
        // Exclude astrologers if logged in
        if (user && user.role === 'astrologer') return;

        // Only trigger on the main home screen to prevent interrupting deep links or sub-pages
        if (pathname !== '/') return;

        const checkDailyBlessing = async () => {
            try {
                // Get local date string YYYY-MM-DD
                const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD format based on local timezone 
                const lastShownDate = localStorage.getItem('lastBlessingShownDate');
                const isTestMode = window.location.search.includes('test_blessing=1');

                if (lastShownDate !== today || isTestMode) {
                    const response = await api.get('/daily-blessing/today');
                    if (response.data && response.data.success && response.data.blessing) {
                        setBlessing(response.data.blessing);
                        setIsModalOpen(true);
                        // Save immediately so a refresh doesn't trigger it again
                        localStorage.setItem('lastBlessingShownDate', today);
                    } else {
                        // Even if there's no blessing today, we save to prevent hammering the API on every navigate
                        localStorage.setItem('lastBlessingShownDate', today);
                    }
                }
            } catch (error) {
                console.error("Failed to check daily blessing", error);
                // Fail silently, don't block app startup
            }
        };

        // Small delay to ensure smooth app initialization
        const timer = setTimeout(() => {
            checkDailyBlessing();
        }, 1500);

        return () => clearTimeout(timer);
    }, [user, loading, pathname]);

    return (
        <DailyBlessingModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            blessing={blessing} 
        />
    );
}
