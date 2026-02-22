"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, RefreshCw, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';
import PageContentSection from '../../../components/common/PageContentSection';

export default function LoveCalculator() {
    const [names, setNames] = useState({ name1: '', name2: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateLove = (e) => {
        e.preventDefault();
        setLoading(true);

        // Classic FLAMES logic
        setTimeout(() => {
            const flames = ["Friends", "Lovers", "Affection", "Marriage", "Enemies", "Siblings"];
            let name1 = names.name1.toLowerCase().replace(/\s/g, '');
            let name2 = names.name2.toLowerCase().replace(/\s/g, '');

            // Cross out common letters
            for (let char of name1) {
                if (name2.includes(char)) {
                    name1 = name1.replace(char, '');
                    name2 = name2.replace(char, '');
                }
            }

            const count = name1.length + name2.length;
            if (count === 0) {
                setResult({ type: "Match", score: 100, message: "A Perfect Cosmic Alignment!" });
                setLoading(false);
                return;
            }

            // FLAMES elimination
            let flamesCopy = [...flames];
            let index = 0;
            while (flamesCopy.length > 1) {
                index = (index + count - 1) % flamesCopy.length;
                flamesCopy.splice(index, 1);
            }

            const verdict = flamesCopy[0];
            const scores = {
                "Friends": 75,
                "Lovers": 95,
                "Affection": 85,
                "Marriage": 99,
                "Enemies": 20,
                "Siblings": 40
            };

            setResult({
                type: verdict,
                score: scores[verdict] || 50,
                message: getVerdictMessage(verdict)
            });
            setLoading(false);
        }, 1500);
    };

    const getVerdictMessage = (type) => {
        const messages = {
            "Friends": "A deep and lasting friendship that could be the foundation of something more.",
            "Lovers": "Intense passion and romantic energy. You two are a cosmic match!",
            "Affection": "There's a sweet, gentle bond between you both. Genuine care exists.",
            "Marriage": "The stars suggest a lifetime commitment. A truly blessed union!",
            "Enemies": "Sparks fly, but perhaps for the wrong reasons. A challenging dynamic.",
            "Siblings": "A protective and supportive bond, like family. Pure and platonic."
        };
        return messages[type];
    };

    return (
        <main className={`min-h-screen font-sans selection:bg-rose-500/30 selection:text-rose-200 pb-24 overflow-x-hidden ${result ? 'bg-[#05070a]' : 'bg-slate-50'}`}>
            {/* Hero Header / Standardized Result Header */}
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/40 via-slate-900 to-black shadow-2xl rounded-b-[3rem] z-0 overflow-hidden transform scale-x-[1.05]">
                        <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-rose-200/60 hover:text-rose-200 transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Calculators
                        </Link>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20 rotate-3">
                                <Heart size={40} className="text-white fill-current" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Love <span className="text-rose-400">Calculator</span></h1>
                            <p className="text-rose-100/70 max-w-xl mx-auto font-medium leading-relaxed">
                                Discover the cosmic connection between you and your partner using the ancient FLAMES methodology.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Love Match"
                    name={`${names.name1} & ${names.name2}`}
                    date="Compatibility"
                    time="Analysis"
                    place="Harmony Hub"
                />
            )}

            {/* Form Section */}
            <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-rose-500/10 border border-rose-50"
                        >
                            <form onSubmit={calculateLove} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={names.name1}
                                            onChange={(e) => setNames({ ...names, name1: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-rose-400 rounded-2xl py-5 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="p-3 bg-rose-50 rounded-full text-rose-500 animate-pulse">
                                            <Heart size={24} fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Partner's Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={names.name2}
                                            onChange={(e) => setNames({ ...names, name2: e.target.value })}
                                            placeholder="Enter partner's name"
                                            className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-rose-400 rounded-2xl py-5 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Calculating Vibes...</>
                                    ) : (
                                        <><Sparkles size={24} /> Test Compatibility</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-rose-500/10 border border-white/10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 opacity-50"></div>

                            <motion.div
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="inline-block p-6 bg-rose-50 rounded-full text-rose-500 mb-6"
                            >
                                <Heart size={64} fill="currentColor" />
                            </motion.div>

                            <h2 className="text-5xl font-black text-white mb-2">{result.score}%</h2>
                            <p className="text-rose-400 font-black text-2xl uppercase tracking-[0.2em] mb-6">{result.type}</p>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8 backdrop-blur-sm">
                                <p className="text-indigo-100/70 font-medium leading-loose text-lg italic">
                                    "{result.message}"
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setResult(null)}
                                    className="flex-1 bg-white/10 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={20} /> Try Another
                                </button>
                                <button className="flex-1 bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-600/20">
                                    <Send size={20} /> Share Result
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dynamic Page Content & FAQs */}
            <PageContentSection slug="calculators/love-calculator" />
        </main>
    );
}
