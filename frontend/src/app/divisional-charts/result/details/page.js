"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../../lib/api';
import { motion } from 'framer-motion';
import CosmicLoader from '../../../../components/CosmicLoader';
import KundliChart from '../../../../components/KundliChart';
import { useAuth } from '../../../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Share2, Info, Sparkles } from 'lucide-react';
import { getPlanetInterpretations } from '../../../../utils/interpreters/engine';

export default function DetailedChartPageWrapper() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <CosmicLoader size="lg" message={`Analysing...`} fullscreen={false} />
            </div>
        }>
            <DetailedChartPage />
        </Suspense>
    )
}

function DetailedChartPage() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug'); // Chart Key (e.g. D1, D9)
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartStyle, setChartStyle] = useState('north');

    // Chart Metadata & Interpretations
    const CHART_INFO = {
        D1: {
            title: "Rasi (D1)",
            subtitle: "Body & General Destiny",
            description: "The Rasi chart is the primary map of your life, representing the physical body and general destiny. It is the root from which all other divisional charts grow.",
            keywords: ["Self", "Body", "General Fortune", "Health"]
        },
        D2: {
            title: "Hora (D2)",
            subtitle: "Wealth & Family",
            description: "The Hora chart primarily deals with wealth, financial prosperity, and family assets. It classifies planets into solar and lunar halves.",
            keywords: ["Wealth", "Money", "Family Resource"]
        },
        D3: {
            title: "Drekkana (D3)",
            subtitle: "Siblings & Courage",
            description: "Seen for relationship with siblings, courage, and nature of death. It divides each sign into three parts.",
            keywords: ["Brothers", "Sisters", "Bravery", "Energy"]
        },
        D4: {
            title: "Chaturthamsa (D4)",
            subtitle: "Destiny & Assets",
            description: "Indicators of fixed assets, property, residence, and general fortune. It relates to the 4th house matters.",
            keywords: ["Home", "Property", "Land", "Fortune"]
        },
        D7: {
            title: "Saptamsa (D7)",
            subtitle: "Progeny & Creativity",
            description: "Examines children, grandchildren, and creative potential. It is essential for understanding matters of progeny.",
            keywords: ["Children", "Creativity", "Legacy"]
        },
        D9: {
            title: "Navamsa (D9)",
            subtitle: "Marriage & Dharma",
            description: "The most important divisional chart after D1. It reveals the strength of planets, marriage, partnerships, and one’s spiritual path (Dharma).",
            keywords: ["Spouse", "Marriage", "Dharma", "Planetary Strength"]
        },
        D10: {
            title: "Dasamsa (D10)",
            subtitle: "Career & Profession",
            description: "Details regarding profession, career achievements, status, and impact on society. It refines the 10th house.",
            keywords: ["Career", "Job", "Status", "Success"]
        },
        D12: {
            title: "Dwadasamsa (D12)",
            subtitle: "Parents & Lineage",
            description: "Used to understand parents, ancestral heritage, and past life karma related to lineage.",
            keywords: ["Parents", "Ancestors", "Lineage"]
        },
        D16: {
            title: "Shodasamsa (D16)",
            subtitle: "Vehicles & Pleasures",
            description: "Deals with luxuries, vehicles, and general happiness from material comforts.",
            keywords: ["Cars", "Luxury", "Comfort", "Happiness"]
        },
        D20: {
            title: "Vimsamsa (D20)",
            subtitle: "Spiritual Progress",
            description: "Specific to spiritual inclinations, worship, deep meditation, and religious activities.",
            keywords: ["Spirituality", "Religion", "Worship"]
        },
        D24: {
            title: "Chaturvimsamsa (D24)",
            subtitle: "Education & Learning",
            description: "Highlights specific fields of study, knowledge, education, and learning capabilities.",
            keywords: ["Education", "Knowledge", "Skills", "Study"]
        },
        D27: {
            title: "Saptavimsamsa (D27)",
            subtitle: "Strengths & Weaknesses",
            description: "Refines the indications of the moon and nakshatras, showing physical strength and stamina.",
            keywords: ["Strength", "Stamina", "Weakness"]
        },
        D30: {
            title: "Trimsamsa (D30)",
            subtitle: "Misfortunes & Arishta",
            description: "Shows evils, misfortunes, and specific adverse events. Used to see deeper miseries.",
            keywords: ["Misfortune", "Evils", "Difficulties"]
        },
        D40: {
            title: "Khavedamsa (D40)",
            subtitle: "Auspicious & Inauspicious Effects",
            description: "A higher harmonic chart dealing with very specific auspicious and inauspicious effects.",
            keywords: ["Auspiciousness", "Detail"]
        },
        D45: {
            title: "Akshavedamsa (D45)",
            subtitle: "General Character",
            description: "Shows the moral character, ethics, and general purity of the individual.",
            keywords: ["Character", "Ethics", "Morals"]
        },
        D60: {
            title: "Shashtyamsa (D60)",
            subtitle: "Past Karma",
            description: "The most minute division. It is said to show the root cause of all events, tied to past life karma.",
            keywords: ["Past Life", "Karma", "Root Cause"]
        }
    };

    // Auth & Data Fetch
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error("Please Login to view charts.");
            router.push('/login?redirect=/divisional-charts');
            return;
        }

        const fetchData = async () => {
            try {
                const payload = {
                    date: searchParams.get('date'),
                    time: searchParams.get('time'),
                    lat: parseFloat(searchParams.get('lat')),
                    lng: parseFloat(searchParams.get('lng')),
                    timezone: parseFloat(searchParams.get('tz'))
                };

                const res = await API.post('/astro/divisional-charts', payload);
                if (res.data.success) {
                    setData(res.data.data.charts[slug]);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to calculate Charts');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('date') && slug) {
            fetchData();
        }
    }, [searchParams, user, authLoading, router, slug]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <CosmicLoader size="lg" message={`Analysing ${slug}...`} fullscreen={false} />
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400 font-medium">
            {error || 'Chart not found'}
        </div>
    );

    const info = CHART_INFO[slug] || { title: slug, subtitle: "Divisional Chart", description: "", keywords: [] };
    const ascendantSign = data.Ascendant?.sign;

    // Generate Interpretations
    const interpretations = getPlanetInterpretations(data, slug);

    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-purple-900 selection:text-purple-100 pb-20">
            {/* Header */}
            <div className="relative bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm">Back to All Charts</span>
                    </button>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setChartStyle('north')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${chartStyle === 'north' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}
                        >
                            North
                        </button>
                        <button
                            onClick={() => setChartStyle('south')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${chartStyle === 'south' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}
                        >
                            South
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left: Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 lg:row-span-2 order-2 lg:order-1"
                    >
                        <div className="bg-slate-900 rounded-[2rem] border border-white/10 p-6 md:p-10 shadow-2xl shadow-black/40">
                            <div className="aspect-square w-full max-w-2xl mx-auto">
                                <KundliChart
                                    planets={data}
                                    ascendantSign={ascendantSign}
                                    style={chartStyle}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Top: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1 order-1 lg:order-2 space-y-6 h-fit"
                    >
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-4">
                                {slug} Chart
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                                {info.title.split('(')[0]}
                            </h1>
                            <p className="text-xl text-slate-400 font-light">{info.subtitle}</p>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-start gap-4">
                                <Info className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                                <p className="text-slate-300 leading-relaxed">
                                    {info.description}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Key Indications</h3>
                            <div className="flex flex-wrap gap-2">
                                {info.keywords.map((keyword, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium">
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Placeholder for future specific analysis */}
                        {/* <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 border-dashed text-center">
                            <p className="text-slate-500 text-sm italic">
                                Detailed planetary analysis for {info.title} coming soon.
                            </p>
                        </div> */}

                    </motion.div>

                    {/* Right Bottom: Interpretations */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1 lg:col-start-3 order-3 lg:order-3 space-y-4"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-bold text-white">Planetary Interpretations</h3>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {interpretations.map((item, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-purple-300">{item.planet}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">House {item.house}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2 leading-relaxed">{item.houseText}</p>
                                    <p className="text-xs text-slate-500 italic border-t border-white/5 pt-2">{item.signText}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Disclaimer */}
                <div className="mt-12 pt-8 border-t border-white/10 text-center space-y-4 max-w-4xl mx-auto opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
                        Disclaimer
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">
                        The report generated above is based on classical Vedic Astrology calculations. The results in the report are subject to variations based on any change in the birth time, birth place or other factors. Our calculations are based on the Lahiri Ayanamsa of Dhrik Sidhanta. So, differences may arise upon comparison with other online horoscope services or other Panchangs. Therefore we strongly suggest that you consult an Astrologer to guide you in all your future decisions and not solely take decisions based on this report. By generating or downloading this report you agree that <Link href="/" className="text-purple-400 font-bold hover:underline">Way2Astro</Link> or any personnel related to Way2Astro will not be liable for any consequences that may arise due to decisions or actions taken by you or anyone based on the content of this report or any report generated using Way2Astro.
                    </p>
                </div>
            </div>
        </div>
    );
}
