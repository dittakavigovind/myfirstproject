"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Sparkles, Star, MessageSquare,
    Zap, AlertTriangle, RefreshCw, ArrowLeft,
    Share2, Info, CheckCircle, Flame, Download
} from 'lucide-react';
import { toPng } from 'html-to-image';
import Link from 'next/link';
import { ZODIAC_SIGNS } from '@/lib/zodiacData';
import { COMPATIBILITY_CONTENT, getGenericContent } from '@/lib/compatibilityData';
import StandardResultHeader from '@/components/calculators/StandardResultHeader';

export default function ZodiacCompatibilityPage() {
    const [sign1, setSign1] = useState(null);
    const [sign2, setSign2] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const reportRef = useRef(null);

    const handleCalculate = () => {
        if (!sign1 || !sign2) return;
        setLoading(true);

        // Simulate calculation for vibe
        setTimeout(() => {
            const key = `${sign1.name.toLowerCase()}-${sign2.name.toLowerCase()}`;
            const reverseKey = `${sign2.name.toLowerCase()}-${sign1.name.toLowerCase()}`;

            let content = COMPATIBILITY_CONTENT[key] || COMPATIBILITY_CONTENT[reverseKey] || getGenericContent(sign1.name, sign2.name);

            // Create a deep copy to ensure state reactivity if the same sign pair is re-selected (though UI prevents this without reset)
            setResult({ ...content });
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1200);
    };

    const handleShare = async () => {
        if (!reportRef.current) return;
        setSharing(true);
        try {
            // Options to ensure consistent capture
            const options = {
                quality: 0.95,
                backgroundColor: '#05070a',
                pixelRatio: 2,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    margin: '0',
                },
                width: reportRef.current.offsetWidth,
                height: reportRef.current.offsetHeight,
            };

            const dataUrl = await toPng(reportRef.current, options);

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `Compatibility-${sign1.name}-${sign2.name}.png`, { type: 'image/png' });

            const shareData = {
                title: 'Zodiac Compatibility',
                text: `Check out the cosmic alignment between ${sign1.name} and ${sign2.name}!`,
                url: window.location.href,
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    ...shareData,
                    files: [file],
                });
            } else if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Share Error:', err);
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (copyErr) {
                console.error('Clipboard Error:', copyErr);
            }
        } finally {
            setSharing(false);
        }
    };

    const resetSelection = () => {
        setResult(null);
        setSign1(null);
        setSign2(null);
    };

    return (
        <main className={`min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 overflow-x-hidden ${result ? 'bg-[#05070a]' : 'bg-slate-50'}`}>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Hero Section */}
                        <div className="relative text-white overflow-hidden">
                            <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black shadow-2xl rounded-b-[3rem] z-0 overflow-hidden transform scale-x-[1.05]">
                                <div className="absolute top-[-50%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none"></div>
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                            </div>

                            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                                <Link href="/matchmaking" className="inline-flex items-center gap-2 text-indigo-200/60 hover:text-indigo-200 transition-colors mb-8 font-bold text-xs uppercase tracking-widest">
                                    <ArrowLeft size={14} /> Back to Matchmaking
                                </Link>
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg mb-6">
                                        <Sparkles className="w-3 h-3 text-astro-yellow" />
                                        <span className="text-indigo-100 text-[10px] font-bold tracking-[0.2em] uppercase">Cosmic Compatibility</span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                        Zodiac <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-amber-200">Compatibility</span>
                                    </h1>
                                    <p className="text-indigo-100/70 max-w-2xl mx-auto font-medium leading-relaxed">
                                        Explore the divine alignment between two souls. Select your zodiac signs to unlock deep insights into your shared journey across love, intimacy, and communication.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Sign Selection Grid */}
                        <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-slate-100">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                    {/* Sign 1 */}
                                    <div className="flex-1 w-full space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block text-center">In Relationship with</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {ZODIAC_SIGNS.map(sign => (
                                                <button
                                                    key={sign.name}
                                                    onClick={() => setSign1(sign)}
                                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${sign1?.name === sign.name
                                                        ? `bg-gradient-to-br ${sign.color} text-white border-transparent`
                                                        : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className={`text-2xl transition-transform ${sign1?.name === sign.name ? 'scale-110' : 'group-hover:scale-110'}`}>{sign.icon}</span>
                                                    <div className="text-center">
                                                        <span className="text-[10px] font-black uppercase tracking-wider block">{sign.name}</span>
                                                        <span className={`text-[8px] font-bold uppercase tracking-widest block mt-0.5 ${sign1?.name === sign.name ? 'text-white/60' : 'text-slate-400'}`}>{sign.date}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* VS Indicator */}
                                    <div className="flex-shrink-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-astro-yellow font-black text-xl italic relative">
                                            <div className="absolute inset-0 rounded-full animate-ping bg-astro-yellow/10"></div>
                                            VS
                                        </div>
                                    </div>

                                    {/* Sign 2 */}
                                    <div className="flex-1 w-full space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block text-center">Select Partner Sign</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {ZODIAC_SIGNS.map(sign => (
                                                <button
                                                    key={sign.name}
                                                    onClick={() => setSign2(sign)}
                                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${sign2?.name === sign.name
                                                        ? `bg-gradient-to-br ${sign.color} text-white border-transparent`
                                                        : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
                                                        }`}
                                                >
                                                    <span className={`text-2xl transition-transform ${sign2?.name === sign.name ? 'scale-110' : 'group-hover:scale-110'}`}>{sign.icon}</span>
                                                    <div className="text-center">
                                                        <span className="text-[10px] font-black uppercase tracking-wider block">{sign.name}</span>
                                                        <span className={`text-[8px] font-bold uppercase tracking-widest block mt-0.5 ${sign2?.name === sign.name ? 'text-white/60' : 'text-slate-400'}`}>{sign.date}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Calculate Button */}
                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={handleCalculate}
                                        disabled={loading || !sign1 || !sign2}
                                        className={`px-12 py-5 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 ${!sign1 || !sign2
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 active:scale-95 shadow-indigo-600/20'
                                            }`}
                                    >
                                        {loading ? (
                                            <><RefreshCw className="animate-spin" /> Aligning Cosmic Energies...</>
                                        ) : (
                                            <><Sparkles /> Check Compatibility</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <StandardResultHeader
                            title="Zodiac Harmony"
                            name={`${sign1.name} & ${sign2.name}`}
                            date="Relationship"
                            time="Soul Alignment"
                            place="Cosmic Connection"
                        />

                        <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20 pb-12">
                            <div ref={reportRef} className="bg-[#05070a] rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden space-y-12">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>

                                {/* Header Signs Display */}
                                <div className="flex flex-col md:flex-row items-center gap-12 border-b border-white/10 pb-12">
                                    <div className="flex items-center gap-6">
                                        {/* Sign 1 Info */}
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${sign1.color} flex items-center justify-center text-5xl shadow-2xl`}>
                                                {sign1.icon}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-black text-sm uppercase tracking-wider">{sign1.name}</p>
                                                <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest">{sign1.date}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ArrowLeft className="text-indigo-400 rotate-180" size={20} />
                                            <div className="h-4 w-[1px] bg-gradient-to-b from-indigo-400/50 to-transparent"></div>
                                        </div>

                                        {/* Sign 2 Info */}
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${sign2.color} flex items-center justify-center text-5xl shadow-2xl`}>
                                                {sign2.icon}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-black text-sm uppercase tracking-wider">{sign2.name}</p>
                                                <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest">{sign2.date}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center md:text-left flex-1">
                                        <h2 className="text-3xl font-black text-white mb-2">Overall Harmony: <span className="text-astro-yellow">{result.ratings.overall * 20}%</span></h2>
                                        <p className="text-indigo-200/60 font-medium uppercase tracking-[0.2em] text-sm italic">"{result.summary}"</p>
                                    </div>
                                </div>

                                <article className="space-y-12 relative z-10">
                                    <section>
                                        <div className="flex items-center gap-3 mb-6">
                                            <Sparkles className="text-astro-yellow" size={18} />
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest">The Celestial Introduction</h3>
                                        </div>
                                        <p className="text-indigo-100/70 leading-relaxed text-lg font-medium">{result.intro}</p>
                                    </section>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                        {[
                                            { title: 'Love & Emotions', icon: Heart, content: result.love, color: 'text-pink-400' },
                                            { title: 'Sexual Chemistry', icon: Flame, content: result.sex, color: 'text-orange-400' },
                                            { title: 'Deep Friendship', icon: Star, content: result.friendship, color: 'text-yellow-400' },
                                            { title: 'Communication Style', icon: MessageSquare, content: result.communication, color: 'text-blue-400' }
                                        ].map((card, idx) => (
                                            <div key={idx} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors group">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <card.icon className={card.color} size={20} />
                                                    </div>
                                                    <h4 className="font-black text-white uppercase tracking-widest text-sm">{card.title}</h4>
                                                </div>
                                                <p className="text-indigo-100/60 text-sm leading-relaxed">{card.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <section className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap className="text-astro-yellow" size={18} />
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest font-sans">Combined Strengths</h3>
                                        </div>
                                        <p className="text-indigo-100/70">{result.strengths}</p>
                                    </section>

                                    <section className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <AlertTriangle className="text-red-400" size={18} />
                                            <h3 className="text-xl font-black text-white uppercase tracking-widest font-sans">Challenges & Growth</h3>
                                        </div>
                                        <p className="text-indigo-100/70">{result.challenges}</p>
                                    </section>

                                    {/* Final Rating Display */}
                                    <section className="pt-12 border-t border-white/10">
                                        <h3 className="text-center font-black text-white uppercase tracking-[0.3em] text-xs mb-8">Final Compatibility Score</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                            {[
                                                { label: 'Love', val: result.ratings.love },
                                                { label: 'Sex', val: result.ratings.sex },
                                                { label: 'Friendship', val: result.ratings.friendship },
                                                { label: 'Chat', val: result.ratings.communication },
                                                { label: 'Total', val: result.ratings.overall },
                                            ].map((rate, idx) => (
                                                <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                                                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">{rate.label}</p>
                                                    <div className="flex justify-center gap-1 mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < Math.floor(rate.val) ? '#fbbf24' : 'none'} className={i < Math.floor(rate.val) ? 'text-yellow-400' : 'text-white/20'} />
                                                        ))}
                                                    </div>
                                                    <p className="text-xl font-black text-white">{rate.val}/5</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </article>
                            </div>

                            {/* Actions - Outside reportRef to exclude from capture */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 px-4">
                                <button
                                    onClick={resetSelection}
                                    className="flex-1 bg-white/5 text-white/70 font-bold py-5 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10 pointer-events-auto"
                                >
                                    <RefreshCw size={20} /> Compare Others
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={sharing}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 pointer-events-auto"
                                >
                                    {sharing ? (
                                        <><RefreshCw size={20} className="animate-spin" /> Preparing Share...</>
                                    ) : (
                                        <><Share2 size={20} /> Share Report</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >

        </main >
    );
}
