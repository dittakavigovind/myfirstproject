"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import API from '@/lib/api';
import FAQDisplay from '@/components/FAQDisplay';
import FeaturedAstrologerCard from './FeaturedAstrologerCard';

const SIGNS = [
    { name: 'Aries', icon: '♈', date: 'Mar 21 - Apr 19', element: 'Fire', color: 'from-red-500 to-orange-600', shadow: 'shadow-orange-500/20' },
    { name: 'Taurus', icon: '♉', date: 'Apr 20 - May 20', element: 'Earth', color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
    { name: 'Gemini', icon: '♊', date: 'May 21 - Jun 20', element: 'Air', color: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-500/20' },
    { name: 'Cancer', icon: '♋', date: 'Jun 21 - Jul 22', element: 'Water', color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/20' },
    { name: 'Leo', icon: '♌', date: 'Jul 23 - Aug 22', element: 'Fire', color: 'from-orange-500 to-red-600', shadow: 'shadow-red-500/20' },
    { name: 'Virgo', icon: '♍', date: 'Aug 23 - Sep 22', element: 'Earth', color: 'from-emerald-600 to-teal-700', shadow: 'shadow-emerald-500/20' },
    { name: 'Libra', icon: '♎', date: 'Sep 23 - Oct 22', element: 'Air', color: 'from-indigo-400 to-pink-500', shadow: 'shadow-pink-500/20' },
    { name: 'Scorpio', icon: '♏', date: 'Oct 23 - Nov 21', element: 'Water', color: 'from-purple-600 to-indigo-700', shadow: 'shadow-purple-500/20' },
    { name: 'Sagittarius', icon: '♐', date: 'Nov 22 - Dec 21', element: 'Fire', color: 'from-red-600 to-rose-700', shadow: 'shadow-rose-500/20' },
    { name: 'Capricorn', icon: '♑', date: 'Dec 22 - Jan 19', element: 'Earth', color: 'from-slate-600 to-gray-700', shadow: 'shadow-slate-500/20' },
    { name: 'Aquarius', icon: '♒', date: 'Jan 20 - Feb 18', element: 'Air', color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
    { name: 'Pisces', icon: '♓', date: 'Feb 19 - Mar 20', element: 'Water', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function HoroscopeSelectClient() {
    const [pageContent, setPageContent] = useState({ faqs: [], description: "" });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await API.get('/page-content/horoscope');
                if (res.data.success && res.data.data) {
                    setPageContent({
                        faqs: res.data.data.faqs || [],
                        description: res.data.data.description || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch page content:", err);
            }
        };
        fetchContent();
    }, []);

    return (
        <div id="horoscope-top" className="min-h-screen bg-slate-50 pb-20 font-sans overflow-x-hidden">

            {/* Premium Hero Section */}
            <div className={`relative bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900 text-white pb-24 md:pb-32 pt-10 px-6 rounded-b-[2rem] md:rounded-b-[3.5rem] shadow-2xl overflow-hidden transition-all duration-700`}>

                {/* Animated Orbs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[80px]"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left flex-1"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 backdrop-blur-md shadow-lg">
                            ✨ Cosmic Guidance
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-xl tracking-tight leading-tight">
                            Cosmic Forecast
                        </h1>
                        <p className="text-white/80 font-medium max-w-lg mx-auto md:mx-0 text-sm md:text-base leading-relaxed">
                            Discover what the universe has prepared for you today. Select your sign to unlock ancient wisdom for modern life.
                        </p>
                    </motion.div>

                    {/* Right: Featured Astrologer */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end scale-90 md:scale-100 origin-center md:origin-right"
                    >
                        <FeaturedAstrologerCard />
                    </motion.div>
                </div>
            </div>

            {/* Zodiac Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20 mb-20">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
                >
                    {SIGNS.map((sign) => (
                        <motion.div key={sign.name} variants={item}>
                            <Link href={`/horoscope/details?sign=${sign.name.toLowerCase()}`}>
                                <div className="group relative bg-white rounded-[2rem] p-1 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-[2rem] z-0"></div>

                                    {/* Card Content */}
                                    <div className="relative z-10 bg-white rounded-[1.8rem] p-6 h-full flex flex-col items-center justify-between overflow-hidden border border-slate-100 group-hover:border-transparent transition-colors duration-300">

                                        {/* Hover Gradient Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${sign.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                        <div className="flex flex-col items-center w-full relative">
                                            {/* Icon Container */}
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 bg-gradient-to-br ${sign.color} text-white shadow-lg ${sign.shadow}`}>
                                                {sign.icon}
                                            </div>

                                            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all duration-300">
                                                {sign.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    {sign.element}
                                                </span>
                                            </div>

                                            <div className="w-12 h-1 rounded-full bg-slate-100 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-slate-200 group-hover:to-transparent transition-all duration-500"></div>
                                        </div>

                                        <div className="mt-6 w-full text-center relative overflow-hidden">
                                            <p className="text-xs font-medium text-slate-400 absolute w-full transition-transform duration-500 group-hover:-translate-y-10">
                                                {sign.date}
                                            </p>
                                            <div className="translate-y-10 group-hover:translate-y-0 transition-transform duration-500 flex justify-center items-center gap-2 text-sm font-bold text-indigo-600">
                                                Read Forecast
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* FAQs */}
            <FAQDisplay faqs={pageContent.faqs} description={pageContent.description} />
        </div>
    );
}
