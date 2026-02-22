"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import API from '../lib/api';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromotionalPopup() {
    const [popup, setPopup] = useState(null);
    const [show, setShow] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Don't show popups on admin or dashboard pages
        if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return;

        fetchActivePopup();
    }, [pathname]);

    const fetchActivePopup = async () => {
        try {
            const res = await API.get(`/popups/active?path=${pathname}`);
            if (res.data.success && res.data.data) {
                const activePopup = res.data.data;

                // Check session storage if showOncePerSession is true
                if (activePopup.showOncePerSession) {
                    const shown = sessionStorage.getItem(`popup_${activePopup._id}`);
                    if (shown) return;
                }

                setPopup(activePopup);
                // Slight delay for better UX
                setTimeout(() => {
                    setShow(true);
                    trackImpression(activePopup._id);
                }, 2000);
            }
        } catch (err) {
            console.error("Popup fetch error:", err);
        }
    };

    const trackImpression = async (id) => {
        try {
            await API.post(`/popups/impression/${id}`);
        } catch (e) { }
    };

    const handleClose = () => {
        setShow(false);
        if (popup?.showOncePerSession) {
            sessionStorage.setItem(`popup_${popup._id}`, 'true');
        }
    };

    const handleClick = async () => {
        try {
            await API.post(`/popups/click/${popup._id}`);
        } catch (e) { }

        // Also treat click as a dismissal
        if (popup?.showOncePerSession) {
            sessionStorage.setItem(`popup_${popup._id}`, 'true');
        }

        if (popup.redirectUrl) {
            window.location.href = popup.redirectUrl;
        }
    };

    if (!popup) return null;

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 p-1.5 bg-black bg-opacity-20 hover:bg-opacity-40 text-white rounded-full transition z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Popup Image */}
                        <div
                            className="cursor-pointer group relative"
                            onClick={handleClick}
                        >
                            <img
                                src={popup.imageUrl}
                                alt={popup.title}
                                className="w-full h-auto object-cover max-h-[80vh]"
                            />
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
