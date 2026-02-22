"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sparkles, RefreshCw, ArrowLeft, Star, Send } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';
import PageContentSection from '../../../components/common/PageContentSection';
import { useBirthDetails } from '../../../context/BirthDetailsContext';

const zodiacSigns = [
    { name: 'Aries', start: '03-21', end: '04-19', trait: 'Fearless, adventurous, and passionate.', element: 'Fire' },
    { name: 'Taurus', start: '04-20', end: '05-20', trait: 'Determined, patient, and grounded.', element: 'Earth' },
    { name: 'Gemini', start: '05-21', end: '06-20', trait: 'Curious, adaptable, and social.', element: 'Air' },
    { name: 'Cancer', start: '06-21', end: '07-22', trait: 'Nurturing, intuitive, and protective.', element: 'Water' },
    { name: 'Leo', start: '07-23', end: '08-22', trait: 'Confident, charismatic, and loyal.', element: 'Fire' },
    { name: 'Virgo', start: '08-23', end: '09-22', trait: 'Analytical, practical, and diligent.', element: 'Earth' },
    { name: 'Libra', start: '09-23', end: '10-22', trait: 'Diplomatic, artistic, and balanced.', element: 'Air' },
    { name: 'Scorpio', start: '10-23', end: '11-21', trait: 'Intense, passionate, and mysterious.', element: 'Water' },
    { name: 'Sagittarius', start: '11-22', end: '12-21', trait: 'Optimistic, freedom-loving, and honest.', element: 'Fire' },
    { name: 'Capricorn', start: '12-22', end: '01-19', trait: 'Disciplined, ambitious, and wise.', element: 'Earth' },
    { name: 'Aquarius', start: '01-20', end: '02-18', trait: 'Original, humanitarian, and independent.', element: 'Air' },
    { name: 'Pisces', start: '02-19', end: '03-20', trait: 'Compassionate, artistic, and psychic.', element: 'Water' }
];

export default function SunSignCalculator() {
    // Use BirthDetailsContext
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [dob, setDob] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isInitialized && birthDetails && birthDetails.date) {
            setDob(new Date(birthDetails.date));
        }
    }, [isInitialized, birthDetails]);

    const findSunSign = (e) => {
        e.preventDefault();
        setLoading(true);

        if (dob) {
            setBirthDetails({ date: dob });
        }

        setTimeout(() => {
            const date = new Date(dob);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            let sign = zodiacSigns.find(s => {
                if (s.name === 'Capricorn') {
                    // Capricorn spans across the year end
                    return mmdd >= s.start || mmdd <= s.end;
                }
                return mmdd >= s.start && mmdd <= s.end;
            });

            setResult(sign);
            setLoading(false);
        }, 1000);
    };

    return (
        <main className={`min-h-screen font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-24 overflow-x-hidden ${result ? 'bg-[#05070a]' : 'bg-slate-50'}`}>
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-900 to-black shadow-2xl rounded-b-[3rem] z-0 overflow-hidden transform scale-x-[1.05]">
                        <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-amber-200/60 hover:text-amber-200 transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Calculators
                        </Link>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20 rotate-12">
                                <Sun size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Sun Sign <span className="text-amber-400">Calculator</span></h1>
                            <p className="text-amber-100/70 max-w-xl mx-auto font-medium leading-relaxed">
                                Find your zodiac sign instantly and discover your core personality traits guided by the solar energy.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Sun Sign"
                    name="Cosmic Soul"
                    date={dob}
                    time="12:00"
                    place="Not Specified"
                />
            )}

            <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-amber-500/10 border border-amber-50"
                        >
                            <form onSubmit={findSunSign} className="space-y-8">
                                <div className="group space-y-2 text-center custom-datepicker-dark">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Select Your Date of Birth</label>
                                    <DatePicker
                                        selected={dob}
                                        onChange={(date) => setDob(date)}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Select Date"
                                        required
                                        className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-amber-400 rounded-2xl py-5 px-6 text-slate-800 font-black text-2xl text-center focus:ring-4 focus:ring-amber-500/10 outline-none transition-all cursor-pointer"
                                        showYearDropdown
                                        scrollableYearDropdown
                                        yearDropdownItemNumber={100}
                                        maxDate={new Date()}
                                        calendarClassName="custom-datepicker-dark-cal"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Aligning with the Sun...</>
                                    ) : (
                                        <><Sparkles size={24} /> Discover My Sign</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-amber-500/10 border border-white/10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                            <motion.div
                                initial={{ rotate: -10, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="inline-block p-8 bg-amber-50 rounded-[2rem] text-amber-500 mb-8"
                            >
                                <Star size={80} fill="currentColor" />
                            </motion.div>

                            <span className="text-xs font-black text-amber-300 uppercase tracking-[0.3em] block mb-2">You are a</span>
                            <h2 className="text-6xl font-black text-white mb-6 tracking-tight">{result.name}</h2>

                            <div className="flex justify-center gap-4 mb-10">
                                <span className="px-5 py-2 bg-slate-100 text-slate-600 rounded-full font-bold text-sm uppercase tracking-wider">{result.element} Element</span>
                            </div>

                            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-10 backdrop-blur-sm">
                                <p className="text-amber-100/80 font-bold leading-loose text-xl">
                                    "{result.trait}"
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setResult(null)}
                                    className="flex-1 bg-white/10 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10"
                                >
                                    <RefreshCw size={20} /> Try Again
                                </button>
                                <button className="flex-1 bg-amber-600 text-white font-bold py-5 rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-600/20">
                                    <Send size={20} /> Share My Sign
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PageContentSection slug="calculators/sun-sign-calculator" />
        </main>
    );
}
