"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '@/components/CosmicLoader';
import CosmicCard from '@/components/CosmicCard';
import { 
    Sparkles, 
    Star, 
    Info, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    MapPin, 
    Edit2, 
    Share2, 
    RotateCcw,
    Shield, 
    Compass,
    CheckCircle2,
    Sun,
    Moon
} from 'lucide-react';
import { Share } from '@capacitor/share';
import toast from 'react-hot-toast';
import KundliChart from '@/components/KundliChart';

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const ZODIAC_SYMBOLS = {
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
    "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
    "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

const SIGN_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

const PLANET_META = {
    Sun: { symbol: "☉", sName: "Surya", color: "text-amber-400 bg-amber-400/10 border-amber-400/25" },
    Moon: { symbol: "☽", sName: "Chandra", color: "text-purple-300 bg-purple-400/10 border-purple-400/25" },
    Mars: { symbol: "♂", sName: "Mangal", color: "text-rose-400 bg-rose-400/10 border-rose-400/25" },
    Mercury: { symbol: "☿", sName: "Budha", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" },
    Jupiter: { symbol: "♃", sName: "Guru", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25" },
    Venus: { symbol: "♀", sName: "Shukra", color: "text-pink-300 bg-pink-400/10 border-pink-400/25" },
    Saturn: { symbol: "♄", sName: "Shani", color: "text-blue-400 bg-blue-400/10 border-blue-400/25" },
    Rahu: { symbol: "☊", sName: "Rahu", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/25" },
    Ketu: { symbol: "☋", sName: "Ketu", color: "text-orange-400 bg-orange-400/10 border-orange-400/25" }
};

export default function KundliResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartStyle, setChartStyle] = useState('north'); // 'north' or 'south'
    const [activeChart, setActiveChart] = useState('D1'); // 'D1' or 'D9'

    const rawName = searchParams.get('name') || 'Seeker';
    const birthDate = searchParams.get('date') || '';
    const birthTime = searchParams.get('time') || '';
    const birthPlace = searchParams.get('place') || '';

    // Scroll container to top when data arrives
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
    }, [data, activeChart]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    date: searchParams.get('date'),
                    time: searchParams.get('time'),
                    lat: parseFloat(searchParams.get('lat')),
                    lng: parseFloat(searchParams.get('lng')),
                    timezone: parseFloat(searchParams.get('tz')) || 5.5
                };

                const res = await api.post('/astro/kundli', payload);
                if (res.data && res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Failed to calculate your celestial map.');
                }
            } catch (err) {
                console.error("Kundli calculation error:", err);
                setError(err.response?.data?.message || 'The stars are obscured. Please verify birth inputs.');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('date')) {
            fetchData();
        } else {
            router.push('/kundli');
        }
    }, [searchParams, router]);

    if (loading) return <CosmicLoader size="lg" message="Architecting your Celestial Map..." />;

    if (error) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-400">
                <Info size={32} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Cosmic Calculation Notice</h2>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">{error}</p>
            </div>
            <button
                onClick={() => router.push('/kundli')}
                className="px-6 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] rounded-2xl text-white font-bold text-xs border border-white/10 active:scale-95 transition-all"
            >
                ← Return to Birth Form
            </button>
        </div>
    );

    if (!data) return null;

    // Derived Vedic Values
    const d1AscendantSign = Math.floor(data.houses.ascendant / 30) + 1;
    const lagnaSign = SIGNS[d1AscendantSign - 1];
    const lagnaDeg = (data.houses.ascendant % 30).toFixed(2);
    const lagnaLord = SIGN_LORDS[lagnaSign] || 'Mars';

    const moonPlanet = data.planets?.Moon;
    const moonSign = SIGNS[moonPlanet?.sign ? moonPlanet.sign - 1 : Math.floor((moonPlanet?.longitude || 0) / 30)];
    const moonLord = SIGN_LORDS[moonSign] || 'Moon';

    const birthNakshatra = moonPlanet?.nakshatra || data.dashas?.birthNakshatra || 'Magha';
    const rasiPada = moonPlanet?.pada || data.charts?.D9?.Moon?.nakshatraPada || 1;

    // D9 Navamsha Ascendant Sign Calculator
    const getNavamsaSign = (longitude) => {
        if (longitude === undefined || longitude === null) return 1;
        const signIndex = Math.floor(longitude / 30);
        const sign = signIndex + 1;
        const degreeInSign = longitude % 30;
        const pada = Math.floor(degreeInSign / 3.3333333333) + 1;

        let navamsaSignStart;
        if ([1, 5, 9].includes(sign)) navamsaSignStart = 1;
        else if ([2, 6, 10].includes(sign)) navamsaSignStart = 10;
        else if ([3, 7, 11].includes(sign)) navamsaSignStart = 7;
        else navamsaSignStart = 4;

        return ((navamsaSignStart + (pada - 1) - 1) % 12) + 1;
    };

    const d9AscendantSign = getNavamsaSign(data.houses.ascendant);

    // Dignity / Relation Badge Colors
    const getRelationBadge = (relation) => {
        const r = relation?.toLowerCase() || '';
        if (r.includes('exalt') || r.includes('own')) return 'bg-amber-400/20 text-amber-300 border-amber-400/40';
        if (r.includes('friend')) return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40';
        if (r.includes('enemy') || r.includes('debilitat')) return 'bg-rose-400/20 text-rose-300 border-rose-400/40';
        return 'bg-white/10 text-slate-300 border-white/15';
    };

    // Format Full Comprehensive Share Text Capturing ALL Kundli Data
    const handleShare = async () => {
        if (!data) return;

        const tithi = data.panchang?.tithi || '-';
        const vara = data.panchang?.vara || '-';
        const yoga = data.panchang?.yoga || '-';
        const karana = data.panchang?.karana || '-';

        // Format planetary positions
        const planetsText = Object.entries(data.planets || {})
            .map(([planetName, p]) => {
                const sName = SIGNS[p.sign ? p.sign - 1 : Math.floor(p.longitude / 30)] || '';
                const deg = Math.floor(p.longitude % 30);
                const min = Math.floor((p.longitude % 1) * 60);
                const retro = p.retrograde ? ' (Retrograde)' : '';
                const pNak = p.nakshatra ? `${p.nakshatra} (Pada ${p.pada || 1})` : '';
                const rel = p.relation ? ` • ${p.relation}` : '';
                const houseStr = p.house ? ` [House ${p.house}]` : '';
                return `• ${planetName}${retro}: ${sName} ${deg}°${min}'${houseStr}\n  Nakshatra: ${pNak}${rel}`;
            })
            .join('\n\n');

        // Current Mahadasha
        const now = new Date();
        const currentDasha = data.dashas?.list?.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
        const dashaText = currentDasha 
            ? `Active Mahadasha: ${currentDasha.lord} (${new Date(currentDasha.start).getFullYear()} - ${new Date(currentDasha.end).getFullYear()})`
            : '';

        const shareText = `✨ Vedic Janam Kundli Summary - ${rawName} ✨
🗓️ Birth Details: ${birthDate} ${birthTime ? `at ${birthTime}` : ''}${birthPlace ? ` | 📍 ${birthPlace}` : ''}

🌟 CORE CELESTIAL IDENTITY:
• Lagna (Ascendant): ${lagnaSign} (${lagnaDeg}°) - Lord: ${lagnaLord}
• Rashi (Moon Sign): ${moonSign} (${ZODIAC_SYMBOLS[moonSign] || ''}) - Lord: ${moonLord}
• Birth Nakshatra: ${birthNakshatra}
• Rasi / Nakshatra Pada: Pada ${rasiPada} (Quarter ${rasiPada} of 4)
• Tithi: ${tithi}
• Vara (Day): ${vara}
• Yoga: ${yoga} | Karana: ${karana}

🪐 PLANETARY ALIGNMENTS (GRAHA STHITI):
${planetsText}

${dashaText ? `⏳ CURRENT DASHA PERIOD:\n• ${dashaText}\n\n` : ''}🔮 Calculated with Way2Astro - Your Trusted Cosmic Guide
Get your Complete Free Kundli: https://way2astro.com/kundli`;

        try {
            if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
                await Share.share({
                    title: `${rawName}'s Janam Kundli (Way2Astro)`,
                    text: shareText,
                    dialogTitle: "Share Complete Kundli"
                });
            } else if (navigator.share) {
                await navigator.share({
                    title: `${rawName}'s Janam Kundli (Way2Astro)`,
                    text: shareText,
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                toast.success("Complete Kundli copied to clipboard!");
            }
        } catch (e) {
            if (e?.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Complete Kundli copied to clipboard!");
                } catch (_) {}
            }
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-28 overflow-x-hidden">
            {/* Top Navigation Bar */}
            <div className="pt-2 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-center max-w-[210px]">
                    <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest block truncate">
                        Personal Janam Kundli
                    </span>
                    <h1 className="text-base font-black text-white tracking-tight leading-tight truncate">
                        {rawName}'s Chart
                    </h1>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 hover:text-white active:scale-90 transition-transform shadow-sm"
                        aria-label="Share Kundli"
                        title="Share Complete Kundli"
                    >
                        <Share2 size={17} />
                    </button>
                    <button
                        onClick={() => router.push(`/kundli`)}
                        className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform"
                        aria-label="Edit birth details"
                        title="Edit Birth Details"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
            </div>

            {/* Core Celestial Identity Spotlight */}
            <CosmicCard noHover className="p-4 sm:p-5 relative overflow-hidden space-y-3.5">
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-amber-500/15 via-purple-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Person Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white tracking-tight">{rawName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-[9px] font-bold text-violet-300 uppercase tracking-wider">
                                Vedic Birth Chart
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-medium mt-1">
                            {birthDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={11} className="text-amber-400/80" /> {birthDate}
                                </span>
                            )}
                            {birthTime && (
                                <span className="flex items-center gap-1">
                                    <Clock size={11} className="text-violet-400/80" /> {birthTime}
                                </span>
                            )}
                            {birthPlace && (
                                <span className="flex items-center gap-1 max-w-[140px] truncate">
                                    <MapPin size={11} className="text-emerald-400/80" /> {birthPlace}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400/20 via-violet-600/20 to-purple-500/30 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner text-amber-300 shrink-0">
                        {ZODIAC_SYMBOLS[moonSign] || "✨"}
                    </div>
                </div>

                {/* The 4 Core Pillars: Lagna, Rashi, Nakshatra, and RASI PADA */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {/* Lagna */}
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            Lagna (Ascendant)
                        </span>
                        <p className="text-sm font-black text-white mt-0.5">
                            {lagnaSign}
                        </p>
                        <span className="text-[10px] text-violet-300 font-semibold">
                            {lagnaDeg}° • Lord: {lagnaLord}
                        </span>
                    </div>

                    {/* Rashi */}
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            Rashi (Moon Sign)
                        </span>
                        <p className="text-sm font-black text-amber-300 mt-0.5 flex items-center gap-1">
                            {moonSign} <span className="text-xs">{ZODIAC_SYMBOLS[moonSign] || ''}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Lord: {moonLord}
                        </span>
                    </div>

                    {/* Nakshatra */}
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            Birth Nakshatra
                        </span>
                        <p className="text-sm font-black text-white mt-0.5 truncate">
                            {birthNakshatra}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Birth Star
                        </span>
                    </div>

                    {/* RASI PADA (PROMINENT HIGHLIGHT) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-950/25 border border-amber-400/40 backdrop-blur-md relative overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-amber-400/15 rounded-full blur-sm" />
                        <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest block">
                            Rasi / Nakshatra Pada
                        </span>
                        <p className="text-sm font-black text-amber-300 mt-0.5 flex items-center gap-1.5">
                            Pada {rasiPada}
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-400/60 text-amber-200">
                                Pada {rasiPada}
                            </span>
                        </p>
                        <span className="text-[9px] text-amber-300/80 font-bold block">
                            Quarter {rasiPada} of 4
                        </span>
                    </div>
                </div>

                {/* Panchang Secondary Pills */}
                {data.panchang && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
                        {data.panchang.tithi && (
                            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] text-slate-300 font-medium">
                                <strong className="text-slate-400 font-bold mr-1">Tithi:</strong> {data.panchang.tithi}
                            </span>
                        )}
                        {data.panchang.vara && (
                            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] text-slate-300 font-medium">
                                <strong className="text-slate-400 font-bold mr-1">Vara:</strong> {data.panchang.vara}
                            </span>
                        )}
                        {data.panchang.yoga && (
                            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] text-slate-300 font-medium">
                                <strong className="text-slate-400 font-bold mr-1">Yoga:</strong> {data.panchang.yoga}
                            </span>
                        )}
                        {data.panchang.karana && (
                            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] text-slate-300 font-medium">
                                <strong className="text-slate-400 font-bold mr-1">Karana:</strong> {data.panchang.karana}
                            </span>
                        )}
                    </div>
                )}
            </CosmicCard>

            {/* Interactive Vedic Chart (D1 / D9 with North/South Selector) */}
            <CosmicCard noHover className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* D1 / D9 Switcher */}
                    <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10">
                        <button
                            type="button"
                            onClick={() => setActiveChart('D1')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                activeChart === 'D1'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            D1 Birth Chart
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveChart('D9')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                activeChart === 'D9'
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            D9 Navamsha
                        </button>
                    </div>

                    {/* North / South Style Switcher */}
                    <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10">
                        <button
                            type="button"
                            onClick={() => setChartStyle('north')}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                                chartStyle === 'north'
                                    ? 'bg-white/20 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            North
                        </button>
                        <button
                            type="button"
                            onClick={() => setChartStyle('south')}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                                chartStyle === 'south'
                                    ? 'bg-white/20 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            South
                        </button>
                    </div>
                </div>

                {/* Subtitle description */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>{activeChart === 'D1' ? 'Lagna & Planetary Positions (Rasi Chart)' : 'Spiritual & Destiny Navamsha (D9)'}</span>
                    <span className="text-[10px] text-amber-300 font-bold uppercase">{chartStyle} Style</span>
                </div>

                {/* Chart SVG Canvas */}
                <div className="aspect-square w-full max-w-[320px] mx-auto py-1">
                    <KundliChart
                        planets={activeChart === 'D1' ? data.planets : (data.charts?.D9 || data.planets)}
                        ascendantSign={activeChart === 'D1' ? d1AscendantSign : d9AscendantSign}
                        style={chartStyle}
                        ascendantDegree={activeChart === 'D1' ? data.houses?.ascendant % 30 : undefined}
                    />
                </div>
            </CosmicCard>

            {/* Planetary Alignments Table / Cards */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" /> Planetary Alignments (Grahas)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Degrees & Padas</span>
                </div>

                <div className="space-y-2">
                    {Object.entries(data.planets || {}).map(([name, p]) => {
                        const meta = PLANET_META[name] || { symbol: "🪐", sName: name, color: "text-slate-300 bg-white/5 border-white/10" };
                        const sName = SIGNS[p.sign ? p.sign - 1 : Math.floor(p.longitude / 30)] || 'Unknown';
                        const deg = Math.floor(p.longitude % 30);
                        const min = Math.floor((p.longitude % 1) * 60);

                        return (
                            <div 
                                key={name}
                                className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-sm hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-black shrink-0 ${meta.color}`}>
                                        {meta.symbol}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-black text-white leading-tight truncate">
                                                {name}
                                            </p>
                                            {p.retrograde && (
                                                <span className="px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[8px] font-black border border-amber-400/40">
                                                    R
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                                            {sName} {p.house ? `• H${p.house}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Longitude & Nakshatra Pada */}
                                <div className="text-center px-2">
                                    <span className="text-xs font-black text-white block">
                                        {deg}° {min}'
                                    </span>
                                    {p.nakshatra && (
                                        <span className="text-[9px] text-amber-300/90 font-bold block truncate max-w-[110px]">
                                            {p.nakshatra} (P{p.pada || 1})
                                        </span>
                                    )}
                                </div>

                                {/* Dignity Badge */}
                                <div className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${getRelationBadge(p.relation)}`}>
                                    {p.relation || 'Neutral'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Vimshottari Mahadasha Timeline */}
            {data.dashas?.list && data.dashas.list.length > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Clock size={14} className="text-violet-400" /> Vimshottari Mahadasha
                        </h3>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Planetary Cycles</span>
                    </div>

                    <div className="space-y-2.5">
                        {data.dashas.list.map((dasha, idx) => {
                            const now = new Date();
                            const isCurrent = now >= new Date(dasha.start) && now <= new Date(dasha.end);
                            const startYear = new Date(dasha.start).getFullYear();
                            const endYear = new Date(dasha.end).getFullYear();
                            const durationYears = endYear - startYear;

                            return (
                                <div
                                    key={idx}
                                    className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-xl ${
                                        isCurrent
                                            ? 'bg-gradient-to-r from-violet-600/25 via-purple-600/20 to-transparent border-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,0.25)] ring-1 ring-violet-400/40'
                                            : 'bg-white/[0.03] border-white/10'
                                    }`}
                                >
                                    {isCurrent && (
                                        <div className="absolute top-2.5 right-3 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[8px] font-black uppercase tracking-wider rounded-full shadow-md">
                                            ACTIVE NOW
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                                            isCurrent
                                                ? 'bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                                                : 'bg-white/[0.06] text-slate-300 border border-white/10'
                                        }`}>
                                            {dasha.lord?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white">
                                                {dasha.lord} Mahadasha
                                            </h4>
                                            <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5">
                                                {startYear} — {endYear} ({durationYears} yrs)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Comprehensive Share & Action Buttons */}
            <div className="space-y-2.5 pt-4">
                <button
                    type="button"
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer"
                >
                    <Share2 size={16} className="text-black" /> Share Complete Kundli (All Planetary Data)
                </button>

                <button
                    type="button"
                    onClick={() => router.push('/kundli')}
                    className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                    <RotateCcw size={14} /> Calculate Again / Change Birth Details
                </button>
            </div>

            {/* Footer Branding & Ephemeris Note */}
            <div className="pt-4 pb-6 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-amber-300/80 tracking-widest uppercase">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>Way2Astro Vedic Systems</span>
                </div>
                <p className="text-[9px] text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Calculated using Swiss Ephemeris with Lahiri Ayanamsa (Chitra Paksha). High-precision planetary degrees & nakshatra padas.
                </p>
            </div>
        </div>
    );
}
