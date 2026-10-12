"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToTopButton({ className = "bottom-8 right-8" }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = (e) => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || e?.target?.scrollTop || 0;
            setVisible(scrollTop > 180);
        };

        window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.6, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollToTop}
                    className={`fixed z-50 w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/30 border border-white/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer ${className}`}
                    aria-label="Back to top"
                    title="Back to top"
                >
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
