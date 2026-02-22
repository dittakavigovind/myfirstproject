"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Heart, Moon, Sun, Stars, Sparkles, Layout, Clock,
    ArrowRight, Activity, Users, AlertCircle, Shield,
    Hash, Calendar, Star
} from 'lucide-react';
import CalculatorCard from '../../components/calculators/CalculatorCard';
import PageContentSection from '../../components/common/PageContentSection';

const calculators = [
    {
        title: "Love Calculator",
        description: "Calculate your romantic compatibility using names and the ancient FLAMES method.",
        icon: Heart,
        href: "/calculators/love-calculator",
        color: "rose",
        delay: 0.1
    },
    {
        title: "Moon Sign Calculator",
        description: "Discover your true emotional nature and Rashi based on your exact birth time and place.",
        icon: Moon,
        href: "/calculators/moon-sign-calculator",
        color: "indigo",
        delay: 0.2
    },
    {
        title: "Shani Sade Sati",
        description: "Check if you are under the 7.5-year influence of Saturn and get Vedic remedies for protection.",
        icon: Shield,
        href: "/calculators/sade-sati-calculator",
        color: "blue",
        delay: 0.25
    },
    {
        title: "Planetary Dasha Periods",
        description: "Analyze your 120-year Vimshottari Dasha cycle and understand the planetary phases of your life.",
        icon: Sparkles,
        href: "/calculators/dasha-periods",
        color: "fuchsia",
        premium: true,
        delay: 0.28
    },
    {
        title: "Sun Sign Calculator",
        description: "Find your Western zodiac sign and explore your core personality traits and leadership style.",
        icon: Sun,
        href: "/calculators/sun-sign-calculator",
        color: "amber",
        delay: 0.3
    },
    {
        title: "Numerology Calculator",
        description: "Uncover your Life Path, Destiny, and Soul Urge numbers from your name and birth date.",
        icon: Hash,
        href: "/calculators/numerology-calculator",
        color: "emerald",
        delay: 0.4
    },
    {
        title: "Friendship Calculator",
        description: "See how well you vibe with your friends and understand the strengths of your bond.",
        icon: Users,
        href: "/calculators/friendship-calculator",
        color: "violet",
        delay: 0.5
    },
    {
        title: "Indian Calendar",
        description: "View the traditional Hindu Panchang with Tithi, Nakshatra, and major festivals for any date.",
        icon: Calendar,
        href: "/calculators/indian-calendar",
        color: "amber",
        delay: 0.6
    },
    {
        title: "Yogini Dasha",
        description: "Calculate your Yogini Dasha periods to understand the planetary influences on your life events.",
        icon: Star,
        href: "/calculators/yogini-dasha",
        color: "fuchsia",
        delay: 0.7
    },
    {
        title: "Planetary Transit",
        description: "See the real-time movement of planets (Gochar) and how they influence the current moment.",
        icon: Activity,
        href: "/calculators/gochar",
        color: "blue",
        delay: 0.8
    },
    {
        title: "Kaal Sarp Dosha",
        description: "Check if all planets are hemmed between Rahu and Ketu in your birth chart.",
        icon: AlertCircle,
        href: "/kaalsarp-dosha",
        color: "red",
        delay: 0.85
    },
    {
        title: "Mangal Dosha",
        description: "Analyze the placement of Mars to identify Kuja Dosha and its impact on marriage.",
        icon: Activity,
        href: "/mangal-dosha",
        color: "orange",
        delay: 0.9
    },
    {
        title: "Arudha Lagna",
        description: "Discover your public image and how the world perceives you based on Jaimini astrology.",
        icon: Shield,
        href: "/arudha-lagna",
        color: "indigo",
        delay: 0.95
    }
];

export default function CalculatorsLanding() {
    return (
        <main className="min-h-screen font-sans bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 pb-24 overflow-x-hidden">
            {/* Header Section */}
            <div className="relative text-white overflow-hidden">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[3rem] md:rounded-b-[4.5rem] z-0 overflow-hidden transform scale-x-[1.05]">
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-40 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-xl">
                            <Sparkles className="w-4 h-4 text-astro-yellow" />
                            <span className="text-indigo-100 text-xs font-bold tracking-[0.2em] uppercase">Interactive Tools</span>
                        </span>

                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                            Astrology <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300">Calculators</span>
                        </h1>

                        <p className="text-lg md:text-xl text-indigo-100/80 max-w-2xl font-medium leading-relaxed">
                            A suite of powerful tools to decode your personality, relationships, and destiny instantly.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Calculators Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 md:-mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {calculators.map((calc, index) => (
                        <CalculatorCard key={index} {...calc} />
                    ))}

                    {/* Placeholder for future tools */}
                    <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group cursor-default">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition-transform">
                            <Star size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">More Tools Coming Soon</h3>
                        <p className="text-slate-400 text-sm mt-2">We are constantly adding new cosmic insights.</p>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="max-w-4xl mx-auto px-6 mt-24 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-lg mb-8">
                    <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
                    <span className="text-slate-700 font-bold uppercase tracking-wider text-sm">100% Private & Anonymous</span>
                </div>
                <p className="text-slate-500 font-medium leading-loose text-lg">
                    Our Moon and Sun sign calculators utilize high-precision astronomical data to ensure your results are 100% accurate based on your birth coordinates.
                </p>
            </div>

            <PageContentSection slug="calculators" />
        </main>
    );
}

function ShieldCheckIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
