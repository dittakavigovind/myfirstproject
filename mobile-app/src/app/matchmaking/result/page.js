"use client";

import { useEffect, useState, Suspense } from 'react';
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

function MatchmakingResultContent() {
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
            alert('Failed to generate PDF. Please try again.');
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
        <div ref={reportRef} className="min-h-screen pb-24 animate-in fade-in duration-700 bg-[#0b1026]">
            {/* Header */}
            <div className="pt-6 px-4 flex items-center justify-between no-print">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white/5 rounded-full text-slate-400"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-right">
                    <h1 className="text-xl font-black text-white">Matchmaking</h1>
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest leading-none mt-1">Guna Milan Result</p>
                </div>
            </div>

            {/* Partners Summary */}
            <div className="px-4 mt-8">
                <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent flex items-center justify-between">
                    <div className="text-center flex-1">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400 font-black">♂</div>
                        <p className="text-xs font-black text-white truncate">{boyName.split(' ')[0]}</p>
                    </div>
                    <div className="px-4">
                        <Heart className={`text-rose-500 ${isSuccess ? 'fill-rose-500 animate-pulse' : 'opacity-20'}`} size={24} />
                    </div>
                    <div className="text-center flex-1">
                        <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-400 font-black">♀</div>
                        <p className="text-xs font-black text-white truncate">{girlName.split(' ')[0]}</p>
                    </div>
                </div>
            </div>

            {/* Score Highlight */}
            <div className="px-4 mt-8 flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96" cy="96" r="88"
                            fill="none" stroke="rgba(255,255,255,0.05)"
                            strokeWidth="12"
                        />
                        <motion.circle
                            cx="96" cy="96" r="88"
                            fill="none"
                            stroke={isSuccess ? "#10b981" : "#f43f5e"}
                            strokeWidth="12"
                            strokeDasharray={552}
                            initial={{ strokeDashoffset: 552 }}
                            animate={{ strokeDashoffset: 552 - (552 * score / 36) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white">{score.toFixed(1)}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Out of 36</span>
                    </div>
                </div>
                <div className={`mt-6 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest ${isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isSuccess ? 'Highly Compatible' : 'Incompatible Vibe'}
                </div>
            </div>

            {/* Score Breakout */}
            <div className="px-4 mt-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Ashtakoot Breakdown</h3>
                <div className="grid grid-cols-1 gap-3">
                    {Object.entries(data.score.details).map(([koota, val], i) => (
                        <KootaRow
                            key={koota}
                            name={koota}
                            val={val}
                            max={[1, 2, 3, 4, 5, 6, 7, 8][i]}
                            delay={i * 0.1}
                        />
                    ))}
                </div>
            </div>

            {/* Advice */}
            <div className="px-4 mt-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-6 rounded-3xl border-indigo-500/10 bg-indigo-500/5 flex gap-4"
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h4 className="text-indigo-300 text-sm font-bold mb-1">Cosmic Advice</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                            {score >= 18
                                ? "This combination shows strong harmony. The celestial alignment suggests a balanced relationship with shared values."
                                : "While Guna matching is low, deep planetary analysis by an expert can identify remedies to strengthen the bond."}
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="px-4 mt-10 no-print">
                <button
                    onClick={generatePDF}
                    disabled={generating}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
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
        vashya: "Mutual Domination",
        tara: "Destiny & Health Correlation",
        yoni: "Sexual Compatibility",
        maitri: "Intellectual Friendship",
        gana: "Temperamental Harmony",
        bhakoot: "Family & Progeny",
        nadi: "Genes & Overall Health"
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black uppercase text-solar-gold`}>
                    {val}
                </div>
                <div>
                    <h4 className="text-xs font-black text-white capitalize">{name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{DESCS[name]}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-black text-slate-400">/{max}</div>
                <div className={`h-1 w-12 rounded-full mt-1 ${val >= max / 2 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    <div
                        className={`h-full rounded-full ${val >= max / 2 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${(val / max) * 100}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export default function MatchmakingResult() {
    return (
        <Suspense fallback={<CosmicLoader size="lg" message="Aligning your Souls..." />}>
            <MatchmakingResultContent />
        </Suspense>
    );
}
