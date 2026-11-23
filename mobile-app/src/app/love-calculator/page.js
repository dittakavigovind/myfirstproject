"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Heart, 
    Sparkles, 
    User, 
    RotateCcw, 
    Flame, 
    Star 
} from "lucide-react";
import CosmicCard from "@/components/CosmicCard";

const FLAMES_VERDICTS = {
    "Friends": { score: 75, desc: "A strong foundation of mutual understanding, shared joy, and unwavering trust." },
    "Lovers": { score: 95, desc: "Intense cosmic attraction and deep romance! Your energies blend into natural affection." },
    "Affection": { score: 85, desc: "A sweet, compassionate connection filled with warmth, care, and emotional harmony." },
    "Marriage": { score: 99, desc: "A sacred union! High marital compatibility with shared values and lasting stability." },
    "Enemies": { score: 25, desc: "Opposing polarities. You may challenge each other; understanding differences is key." },
    "Siblings": { score: 50, desc: "A familial, protective bond marked by playfulness, teasing, and enduring loyalty." }
};

export default function LoveCalculatorPage() {
    const router = useRouter();
    const [names, setNames] = useState({ name1: "", name2: "" });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset scroll to top on mount and whenever result changes
    useEffect(() => {
        const scrollToTop = () => {
            const container = document.getElementById("main-scroll-container");
            if (container) {
                container.scrollTop = 0;
            }
            window.scrollTo(0, 0);
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
        };

        scrollToTop();
        const rAF = requestAnimationFrame(scrollToTop);
        const timer = setTimeout(scrollToTop, 60);

        return () => {
            cancelAnimationFrame(rAF);
            clearTimeout(timer);
        };
    }, [result]);

    const calculateLove = (e) => {
        e.preventDefault();
        if (!names.name1.trim() || !names.name2.trim()) return;

        setLoading(true);

        setTimeout(() => {
            const flames = ["Friends", "Lovers", "Affection", "Marriage", "Enemies", "Siblings"];
            let name1 = names.name1.toLowerCase().replace(/\s/g, '');
            let name2 = names.name2.toLowerCase().replace(/\s/g, '');

            for (let char of name1) {
                if (name2.includes(char)) {
                    name1 = name1.replace(char, '');
                    name2 = name2.replace(char, '');
                }
            }

            const count = name1.length + name2.length;
            if (count === 0) {
                setResult({
                    verdict: "Marriage",
                    score: 100,
                    desc: "A rare and flawless cosmic alignment of destined souls!"
                });
                setLoading(false);
                return;
            }

            let flamesCopy = [...flames];
            let index = 0;
            while (flamesCopy.length > 1) {
                index = (index + count - 1) % flamesCopy.length;
                flamesCopy.splice(index, 1);
            }

            const verdict = flamesCopy[0];
            const data = FLAMES_VERDICTS[verdict] || { score: 80, desc: "Harmonious energetic vibration." };

            setResult({
                verdict,
                score: data.score,
                desc: data.desc
            });
            setLoading(false);
        }, 500);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-24 overflow-x-hidden">
            {/* Header */}
            <div className="pt-2 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-center">
                    <span className="text-[9px] font-extrabold text-pink-300 uppercase tracking-widest block">
                        Cosmic Compatibility
                    </span>
                    <h1 className="text-lg font-black text-white tracking-tight leading-tight">
                        Love & Bond Calculator
                    </h1>
                </div>
                <div className="w-10" />
            </div>

            {/* Description Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-600/15 via-rose-600/10 to-transparent border border-pink-500/20 backdrop-blur-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-400/20 border border-pink-400/30 flex items-center justify-center text-pink-300 shrink-0">
                    <Heart size={18} />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug font-medium">
                    Test the celestial chemistry, energetic bond, and compatibility score between you and your partner.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        <CosmicCard noHover className="p-5 space-y-4">
                            <form onSubmit={calculateLove} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Your Name
                                    </label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={names.name1}
                                            onChange={(e) => setNames(prev => ({ ...prev, name1: e.target.value }))}
                                            placeholder="Enter your name"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center -my-1">
                                    <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300">
                                        <Heart size={14} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Partner&apos;s Name
                                    </label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={names.name2}
                                            onChange={(e) => setNames(prev => ({ ...prev, name2: e.target.value }))}
                                            placeholder="Enter partner's name"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white font-extrabold text-sm shadow-[0_8px_30px_rgba(244,63,94,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles size={16} /> Calculate Love Compatibility
                                        </>
                                    )}
                                </button>
                            </form>
                        </CosmicCard>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <CosmicCard noHover className="p-6 text-center space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/30 to-purple-500/20 border-2 border-pink-400/50 flex flex-col items-center justify-center mx-auto shadow-[0_0_25px_rgba(244,63,94,0.3)]">
                                <span className="text-2xl font-black text-white">{result.score}%</span>
                                <span className="text-[8px] font-extrabold text-pink-300 uppercase">Match</span>
                            </div>

                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 shadow-sm">
                                    Cosmic Verdict
                                </span>
                                <h2 className="text-3xl font-black text-white tracking-tight">
                                    {result.verdict}
                                </h2>
                                <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
                                    {result.desc}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-around text-center">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Seeker</span>
                                    <span className="text-xs font-black text-pink-300 capitalize">{names.name1}</span>
                                </div>
                                <Heart size={16} className="text-pink-400 fill-pink-400" />
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Partner</span>
                                    <span className="text-xs font-black text-pink-300 capitalize">{names.name2}</span>
                                </div>
                            </div>
                        </CosmicCard>

                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCcw size={14} /> Check Another Match
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

