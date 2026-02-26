"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Sparkles, RefreshCw, ArrowLeft, Send, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import CustomDateInput from '../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';
import PageContentSection from '../../../components/common/PageContentSection';

export default function NumerologyCalculator() {
    const [formData, setFormData] = useState({ name: '', dob: null });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const pythagoreanTable = {
        a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
        j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
        s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
    };

    const reduceNumber = (num, allowMaster = true) => {
        if (allowMaster && [11, 22, 33].includes(num)) return num;
        if (num < 10) return num;
        const sum = String(num).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        return reduceNumber(sum, allowMaster);
    };

    const calculateNumerology = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const { name, dob } = formData;
            const pureName = name.toLowerCase().replace(/[^a-z]/g, '');
            const dobDigits = dob ? `${dob.getDate()}${dob.getMonth() + 1}${dob.getFullYear()}` : '';

            // Life Path
            let lpSum = dobDigits.split('').reduce((acc, d) => acc + parseInt(d), 0);
            const lifePath = reduceNumber(lpSum);

            // Destiny (Full Name)
            let destSum = pureName.split('').reduce((acc, char) => acc + (pythagoreanTable[char] || 0), 0);
            const destiny = reduceNumber(destSum);

            // Soul Urge (Vowels)
            const vowels = "aeiou";
            let soulSum = pureName.split('').filter(char => vowels.includes(char)).reduce((acc, char) => acc + (pythagoreanTable[char] || 0), 0);
            const soulUrge = reduceNumber(soulSum);

            setResult({ lifePath, destiny, soulUrge });
            setLoading(false);
        }, 1500);
    };

    const getInterpretation = (type, num) => {
        const traits = {
            1: "The Leader: Independent, creative, and ambitious. You are a natural-born pioneer.",
            2: "The Peacemaker: Diplomatic, sensitive, and cooperative. You find strength in harmony.",
            3: "The Creative: Expressive, social, and imaginative. You radiate joy and creativity.",
            4: "The Builder: Practical, disciplined, and reliable. You are the foundation of any project.",
            5: "The Adventurer: Versatile, freedom-loving, and curious. You crave change and travel.",
            6: "The Nurturer: Responsible, loving, and balanced. You thrive in helping others.",
            7: "The Seeker: Analytical, spiritual, and introspective. You search for deeper truths.",
            8: "The Powerhouse: Ambitious, authoritative, and successful. You master the material world.",
            9: "The Humanitarian: Compassionate, idealistic, and selfless. You aim to better the world.",
            11: "The Visionary: Intuitive, inspiring, and enlightened. You have a profound spiritual calling.",
            22: "The Master Builder: Capable of turning grand visions into reality. Unlimited potential.",
            33: "The Master Teacher: Pure devotion to the spiritual upliftment of humanity."
        };
        return traits[num] || "A unique cosmic vibration.";
    };

    return (
        <main className={`min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-24 overflow-x-hidden ${result ? 'bg-[#05070a]' : 'bg-slate-50'}`}>
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-black shadow-2xl rounded-b-[3rem] z-0 overflow-hidden transform scale-x-[1.05]">
                        <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-emerald-200/60 hover:text-emerald-200 transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Calculators
                        </Link>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 -rotate-3">
                                <Hash size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Numerology <span className="text-emerald-400">Calculator</span></h1>
                            <p className="text-emerald-100/70 max-w-xl mx-auto font-medium leading-relaxed">
                                Discover the secret power of numbers in your life. Uncover your Life Path, Destiny, and Soul Urge.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Numerology Report"
                    name={formData.name || "Astro Explorer"}
                    date={formData.dob}
                    time="Analysis"
                    place="Vedic Vibration"
                />
            )}

            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-500/10 border border-emerald-50"
                        >
                            <form onSubmit={calculateNumerology} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><User size={20} /></div>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. John Doe"
                                                className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-400 rounded-2xl py-5 pl-14 pr-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                        <div className="relative custom-datepicker-dark">

                                            <DatePicker customInput={<CustomDateInput placeholder='dd/mm/yyyy' Icon={Calendar} />} selected={formData.dob} onChange={(date) => setFormData({ ...formData, dob: date })} dateFormat="dd/MM/yyyy" required className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-400 rounded-2xl py-5 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all cursor-pointer" wrapperClassName="w-full" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} maxDate={new Date()} calendarClassName="custom-datepicker-dark-cal" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Decoding Numbers...</>
                                    ) : (
                                        <><Sparkles size={24} /> Reveal My Numbers</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <NumberResultCard title="Life Path" num={result.lifePath} desc={getInterpretation('lp', result.lifePath)} color="emerald" />
                                <NumberResultCard title="Destiny" num={result.destiny} desc={getInterpretation('dest', result.destiny)} color="teal" />
                                <NumberResultCard title="Soul Urge" num={result.soulUrge} desc={getInterpretation('soul', result.soulUrge)} color="indigo" />
                            </div>

                            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-black text-white">Explore Further?</h3>
                                    <p className="text-white/40 font-medium">Get a detailed numerology report with your personal year cycle.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setResult(null)} className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10">Reset</button>
                                    <button className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center gap-2">
                                        <Send size={18} /> Share Results
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PageContentSection slug="calculators/numerology-calculator" />
        </main>
    );
}

function NumberResultCard({ title, num, desc, color }) {
    const colors = {
        emerald: "from-emerald-500 to-teal-400 bg-emerald-50 text-emerald-600 border-emerald-100",
        teal: "from-teal-500 to-cyan-400 bg-teal-50 text-teal-600 border-teal-100",
        indigo: "from-indigo-500 to-blue-400 bg-indigo-50 text-indigo-600 border-indigo-100",
    };

    return (
        <div className={`bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center text-center group backdrop-blur-md`}>
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors[color].split(' ').slice(0, 2).join(' ')} flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                {num}
            </div>
            <h4 className={`text-sm font-bold uppercase tracking-widest mb-4 ${colors[color].split(' ')[3].replace('text-', 'text-indigo-')}`}>{title}</h4>
            <div className="h-1 w-8 bg-white/10 rounded-full mb-6"></div>
            <p className="text-white/60 font-medium leading-relaxed text-sm italic">
                {desc}
            </p>
        </div>
    );
}
