"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function StandardResultHeader({ title, name, date, time, place, darkMode = true }) {
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
        <div className={`relative ${darkMode ? 'bg-[#05070a]' : 'bg-[#f8fafe]'} overflow-hidden pb-32 pt-10`}>
            {/* Background Layer with Radial Gradient */}
            {darkMode ? (
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] opacity-90"></div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 via-white to-white opacity-100"></div>
            )}

            {/* Decorative BG Elements */}
            <div className={`absolute top-[-20%] left-1/4 w-[500px] h-[500px] ${darkMode ? 'bg-indigo-500/20' : 'bg-yellow-200/20'} rounded-full blur-[100px] animate-pulse pointer-events-none`}></div>
            <div className={`absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] ${darkMode ? 'bg-fuchsia-500/10' : 'bg-indigo-500/5'} rounded-full blur-[80px] pointer-events-none`}></div>
            {darkMode && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>}

            <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${darkMode ? 'text-white' : 'text-[#0E1A2B]'}`}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >

                    <div className="block">
                        <div className={`inline-block px-4 py-1.5 rounded-full border ${darkMode ? 'border-white/10 bg-white/5' : 'border-yellow-200 bg-yellow-100/50'} backdrop-blur-md mb-8`}>
                            <div className="flex items-center gap-2">
                                <Sparkles size={12} className={`${darkMode ? 'text-astro-yellow' : 'text-yellow-600'} fill-current opacity-70`} />
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-astro-yellow' : 'text-yellow-700'}`}>Vedic Astrology</span>
                            </div>
                        </div>
                    </div>


                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                        {firstWord} <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300' : 'bg-gradient-to-r from-[#0E1A2B] via-indigo-900 to-[#0E1A2B]'}`}>{remainingTitle}</span>
                        {name && (
                            <span className={`block md:inline md:ml-4 text-2xl md:text-4xl ${darkMode ? 'text-indigo-200/80' : 'text-indigo-600/80'} font-bold mt-2 md:mt-0 italic`}>
                                - {name}
                            </span>
                        )}
                    </h1>

                    <div className={`flex flex-wrap items-center justify-center gap-2 md:gap-4 ${darkMode ? 'text-slate-400 bg-white/5 border-white/10' : 'text-slate-600 bg-white border-slate-100 shadow-sm'} backdrop-blur-sm py-3 px-6 rounded-2xl w-fit mx-auto shadow-xl`}>
                        <div className={`flex items-center gap-2 ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                            <span className={`opacity-50 text-xs uppercase tracking-widest font-black ${darkMode ? '' : 'text-slate-500'}`}>Date:</span> {formatDate(date)}
                        </div>
                        <span className={`hidden md:block opacity-20 h-4 w-px ${darkMode ? 'bg-white' : 'bg-slate-300'}`}></span>
                        <div className={`flex items-center gap-2 ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                            <span className={`opacity-50 text-xs uppercase tracking-widest font-black ${darkMode ? '' : 'text-slate-500'}`}>Time:</span> {time}
                        </div>
                        {place && (
                            <>
                                <span className={`hidden md:block opacity-20 h-4 w-px ${darkMode ? 'bg-white' : 'bg-slate-300'}`}></span>
                                <div className={`flex items-center gap-2 ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                                    <span className={`opacity-50 text-xs uppercase tracking-widest font-black ${darkMode ? '' : 'text-slate-500'}`}>Place:</span> {place}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
