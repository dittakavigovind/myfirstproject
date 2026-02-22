"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, RefreshCw, ArrowLeft, Send, Zap } from 'lucide-react';
import Link from 'next/link';
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';
import PageContentSection from '../../../components/common/PageContentSection';

export default function FriendshipCalculator() {
    const [names, setNames] = useState({ name1: '', name2: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateVibe = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const name1 = names.name1.toLowerCase().trim();
            const name2 = names.name2.toLowerCase().trim();

            // Simple fun logic for vibe check
            const combined = name1 + name2;
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                hash = ((hash << 5) - hash) + combined.charCodeAt(i);
                hash |= 0;
            }

            const score = Math.abs(hash % 41) + 60; // Score between 60 and 100

            let level, message;
            if (score > 90) {
                level = "Dynamic Duo";
                message = "You two are basically the same person! A legendary bond.";
            } else if (score > 80) {
                level = "Besties";
                message = "Strong vibes! You can talk for hours and never get bored.";
            } else if (score > 70) {
                level = "Great Pals";
                message = "Solid friendship. You always have each other's backs.";
            } else {
                level = "Good Vibes";
                message = "A pleasant connection with lots of shared interests.";
            }

            setResult({ score, level, message });
            setLoading(false);
        }, 1200);
    };

    return (
        <main className={`min-h-screen font-sans selection:bg-violet-500/30 selection:text-violet-200 pb-24 overflow-x-hidden ${result ? 'bg-[#05070a]' : 'bg-slate-50'}`}>
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-900 to-black shadow-2xl rounded-b-[3rem] z-0 overflow-hidden transform scale-x-[1.05]">
                        <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-violet-200/60 hover:text-violet-200 transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Calculators
                        </Link>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
                                <Users size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Friendship <span className="text-violet-400">Vibe Check</span></h1>
                            <p className="text-violet-100/70 max-w-xl mx-auto font-medium leading-relaxed">
                                Check the energetic resonance between you and your friend. Is it a lifelong bond or just good vibes?
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Friendship Vibe"
                    name={`${names.name1} & ${names.name2}`}
                    date="Compatibility"
                    time="Analysis"
                    place="Soul Connect"
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
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-violet-500/10 border border-violet-50"
                        >
                            <form onSubmit={calculateVibe} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={names.name1}
                                            onChange={(e) => setNames({ ...names, name1: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-violet-400 rounded-2xl py-5 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Friend's Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={names.name2}
                                            onChange={(e) => setNames({ ...names, name2: e.target.value })}
                                            placeholder="Enter friend's name"
                                            className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-violet-400 rounded-2xl py-5 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Checking Vibe...</>
                                    ) : (
                                        <><Zap size={24} /> Test Our Bond</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-violet-500/10 border border-white/10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 to-purple-500 opacity-50"></div>

                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="inline-block p-6 bg-violet-50 rounded-full text-violet-500 mb-6"
                            >
                                <Zap size={64} fill="currentColor" />
                            </motion.div>

                            <h2 className="text-6xl font-black text-white mb-2">{result.score}%</h2>
                            <p className="text-violet-400 font-black text-2xl uppercase tracking-[0.2em] mb-6">{result.level}</p>

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
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PageContentSection slug="calculators/friendship-calculator" />
        </main>
    );
}
