"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '@/components/CosmicLoader';
import CosmicCard from '@/components/CosmicCard';
import {
    Sparkles, Heart, Info, ArrowLeft, ShieldCheck,
    Download, CheckCircle2, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function MatchmakingResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const reportRef = useRef(null);

    const boyName = searchParams.get('b_name') || 'Boy';
    const girlName = searchParams.get('g_name') || 'Girl';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    boy: {
                        date: searchParams.get('b_date'),
                        time: searchParams.get('b_time'),
                        lat: parseFloat(searchParams.get('b_lat')),
                        lng: parseFloat(searchParams.get('b_lng')),
                        timezone: parseFloat(searchParams.get('b_tz'))
                    },
                    girl: {
                        date: searchParams.get('g_date'),
                        time: searchParams.get('g_time'),
                        lat: parseFloat(searchParams.get('g_lat')),
                        lng: parseFloat(searchParams.get('g_lng')),
                        timezone: parseFloat(searchParams.get('g_tz'))
                    }
                };

                const res = await api.post('/astro/match', payload);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Failed to calculate your celestial harmony.');
                }
            } catch (err) {
                console.error(err);
                setError('The stars are obscured. Please ensure all details are correct.');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('b_date')) {
            fetchData();
        } else {
            router.push('/matchmaking');
        }
    }, [searchParams, router]);

    const generatePDF = async () => {
        if (!reportRef.current) return;
        setGenerating(true);
        try {
            // Hide elements with 'no-print'
            const noPrintElements = reportRef.current.querySelectorAll('.no-print');
            noPrintElements.forEach(el => el.style.display = 'none');

            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0b1026',
                logging: false,
                windowWidth: 375 // Target mobile width for capture
            });

            // Restore hidden elements
            noPrintElements.forEach(el => el.style.display = '');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Matchmaking_Report_${boyName}_${girlName}.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <CosmicLoader size="lg" message="Weaving your Destiny..." />;

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0b1026] text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                <Info size={40} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Cosmic Interference</h2>
            <p className="text-slate-400 mb-8">{error}</p>
            <button
                onClick={() => router.back()}
                className="px-8 py-3 bg-white/5 rounded-2xl text-white font-bold border border-white/10"
            >
                Try Again
            </button>
        </div>
    );

    if (!data) return null;

    const score = data.score.total;
    const isSuccess = score >= 18;

    return (
        <div ref={reportRef} className="min-h-screen pb-28 animate-in fade-in duration-700 pt-safe">
            {/* Header */}
            <div className="pt-3 px-4 flex items-center justify-between no-print">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-right">
                    <h1 className="text-lg font-black text-white">Matchmaking</h1>
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest leading-none mt-0.5">Guna Milan Result</p>
                </div>
            </div>

            {/* Partners Summary */}
            <div className="px-4 mt-6">
                <div className="p-6 rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex items-center justify-between">
                    <div className="text-center flex-1">
                        <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 text-blue-400 font-black text-lg shadow-sm">♂</div>
                        <p className="text-xs font-black text-white truncate">{boyName.split(' ')[0]}</p>
                    </div>
                    <div className="px-4 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                            <Heart className={`text-rose-400 ${isSuccess ? 'fill-rose-400 animate-pulse' : 'opacity-40'}`} size={18} />
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="w-13 h-13 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-2 text-rose-400 font-black text-lg shadow-sm">♀</div>
                        <p className="text-xs font-black text-white truncate">{girlName.split(' ')[0]}</p>
                    </div>
                </div>
            </div>

            {/* Score Highlight */}
            <div className="px-4 mt-7 flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96" cy="96" r="84"
                            fill="none" stroke="rgba(255,255,255,0.06)"
                            strokeWidth="12"
                        />
                        <motion.circle
                            cx="96" cy="96" r="84"
                            fill="none"
                            stroke={isSuccess ? "#10b981" : "#f43f5e"}
                            strokeWidth="12"
                            strokeDasharray={527}
                            initial={{ strokeDashoffset: 527 }}
                            animate={{ strokeDashoffset: 527 - (527 * score / 36) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            className={isSuccess ? "drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]"}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white tracking-tight">{score.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Out of 36 Gunas</span>
                    </div>
                </div>
                <div className={`mt-5 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border ${
                    isSuccess 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                }`}>
                    {isSuccess ? 'Highly Compatible Alignment' : 'Challenging Alignment'}
                </div>
            </div>

            {/* Score Breakout */}
            <div className="px-4 mt-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3.5 ml-1">Ashtakoot Breakdown</h3>
                <div className="grid grid-cols-1 gap-2.5">
                    {Object.entries(data.score.details).map(([koota, val], i) => (
                        <KootaRow
                            key={koota}
                            name={koota}
                            val={val}
                            max={[1, 2, 3, 4, 5, 6, 7, 8][i]}
                            delay={i * 0.05}
                        />
                    ))}
                </div>
            </div>

            {/* Advice */}
            <div className="px-4 mt-7">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-[24px] bg-[#14183d]/80 border border-indigo-500/30 backdrop-blur-2xl flex gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h4 className="text-indigo-200 text-xs font-black uppercase tracking-wider mb-1">Cosmic Counsel</h4>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            {score >= 18
                                ? "This combination manifests powerful celestial harmony. Planetary bonds signify enduring emotional balance and shared spiritual aspirations."
                                : "While Guna matching falls below the traditional 18 threshold, deep planetary analysis and personalized Vedic remedies can harmonize differences."}
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="px-4 mt-8 no-print">
                <button
                    onClick={generatePDF}
                    disabled={generating}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-solar-gold/20 via-amber-500/20 to-solar-gold/20 border border-solar-gold/30 text-solar-gold font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                >
                    {generating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-solar-gold border-t-transparent rounded-full animate-spin" />
                            Synthesizing PDF...
                        </>
                    ) : (
                        <>
                            <Download size={16} className="text-solar-gold" />
                            Download Full PDF Report
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function KootaRow({ name, val, max, delay }) {
    const DESCS = {
        varna: "Work & Ego Compatibility",
        vashya: "Mutual Influence & Affinity",
        tara: "Destiny & Health Correlation",
        yoni: "Instinctual Harmony & Chemistry",
        maitri: "Intellectual & Emotional Friendship",
        gana: "Temperamental Balance",
        bhakoot: "Family Growth & Longevity",
        nadi: "Genetic Compatibility & Vitality"
    };

    const isGood = val >= max / 2;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="p-3.5 rounded-[20px] bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-black uppercase text-solar-gold shadow-sm`}>
                    {val}
                </div>
                <div>
                    <h4 className="text-xs font-black text-white capitalize">{name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{DESCS[name]}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-[11px] font-black text-slate-300">
                    <span className={isGood ? "text-emerald-400" : "text-rose-400"}>{val}</span>
                    <span className="text-slate-500">/{max}</span>
                </div>
                <div className="h-1.5 w-14 rounded-full mt-1.5 bg-white/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        style={{ width: `${(val / max) * 100}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
