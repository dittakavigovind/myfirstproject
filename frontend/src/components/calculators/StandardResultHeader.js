"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function StandardResultHeader({ title, name, date, time, place }) {
    const formatDate = (dateInput) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return dateInput; // Return as is if already formatted or invalid
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Robust title splitting for color gradient
    const titleParts = title.split(' ');
    const firstWord = titleParts[0];
    const remainingTitle = titleParts.slice(1).join(' ');

    return (
        <div className="relative bg-[#05070a] overflow-hidden pb-32 pt-10">
            {/* Background Layer with Radial Gradient - matching Janam Kundli style */}
            <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] opacity-90"></div>

            {/* Decorative BG Elements */}
            <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >

                    <div className="block">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                            <div className="flex items-center gap-2">
                                <Sparkles size={12} className="text-astro-yellow fill-astro-yellow/20" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-astro-yellow">Vedic Astrology</span>
                            </div>
                        </div>
                    </div>


                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                        {firstWord} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">{remainingTitle}</span>
                        {name && (
                            <span className="block md:inline md:ml-4 text-2xl md:text-4xl text-indigo-200/80 font-bold mt-2 md:mt-0 italic">
                                - {name}
                            </span>
                        )}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-slate-400 text-sm md:text-base font-bold bg-white/5 backdrop-blur-sm border border-white/10 py-3 px-6 rounded-2xl w-fit mx-auto shadow-xl">
                        <div className="flex items-center gap-2 text-indigo-200">
                            <span className="opacity-50 text-xs uppercase tracking-widest font-black">Date:</span> {formatDate(date)}
                        </div>
                        <span className="hidden md:block opacity-20 h-4 w-px bg-white"></span>
                        <div className="flex items-center gap-2 text-indigo-200">
                            <span className="opacity-50 text-xs uppercase tracking-widest font-black">Time:</span> {time}
                        </div>
                        {place && (
                            <>
                                <span className="hidden md:block opacity-20 h-4 w-px bg-white"></span>
                                <div className="flex items-center gap-2 text-indigo-200">
                                    <span className="opacity-50 text-xs uppercase tracking-widest font-black">Place:</span> {place}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
