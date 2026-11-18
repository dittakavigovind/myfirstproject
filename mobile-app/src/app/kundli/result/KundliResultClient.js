"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '@/components/CosmicLoader';
import CosmicCard from '@/components/CosmicCard';
import { Sparkles, Star, Info, ArrowLeft, Calendar, Clock, MapPin, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import KundliChart from '@/components/KundliChart';

export default function KundliResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartStyle, setChartStyle] = useState('north');

    const rawName = searchParams.get('name') || 'Seeker';
    const name = rawName.split(' ')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    date: searchParams.get('date'),
                    time: searchParams.get('time'),
                    lat: parseFloat(searchParams.get('lat')),
                    lng: parseFloat(searchParams.get('lng')),
                    timezone: parseFloat(searchParams.get('tz'))
                };

                const res = await api.post('/astro/kundli', payload);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Failed to calculate your celestial map.');
                }
            } catch (err) {
                console.error(err);
                setError('The stars are obscured. Please try again.');
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

    if (loading) return <CosmicLoader size="lg" message="Architecting your Destiny..." />;

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
                Go Back
            </button>
        </div>
    );

    if (!data) return null;

    const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const d1AscendantSign = Math.floor(data.houses.ascendant / 30) + 1;

    return (
        <div className="min-h-screen pb-28 animate-in fade-in duration-700 pt-safe">
            {/* Header */}
            <div className="pt-3 px-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <h1 className="text-lg font-black text-white">{name}'s Chart</h1>
                        <p className="text-[10px] text-solar-gold font-bold uppercase tracking-widest">Personal Kundli</p>
                    </div>
                    <button
                        onClick={() => router.push('/kundli')}
                        className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
                        aria-label="Edit birth details"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
            </div>

            {/* Top Stats Bar */}
            <div className="px-4 mt-5 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2.5 pb-2 min-w-max">
                    <QuickStat label="Lagna" val={SIGNS[d1AscendantSign - 1]} />
                    <QuickStat label="Rashi" val={SIGNS[data.planets.Moon.sign - 1]} />
                    <QuickStat label="Nakshatra" val={data.dashas.birthNakshatra} />
                    <QuickStat label="Tithi" val={data.panchang?.tithi || '-'} />
                </div>
            </div>

            {/* Interactive Chart Section */}
            <div className="px-4 mt-5">
                <div className="p-5 rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Star size={14} className="text-solar-gold" /> Birth Chart (D1)
                        </h2>
                        {/* iOS Segmented Control */}
                        <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10">
                            <ChartToggle active={chartStyle === 'north'} label="North" onClick={() => setChartStyle('north')} />
                            <ChartToggle active={chartStyle === 'south'} label="South" onClick={() => setChartStyle('south')} />
                        </div>
                    </div>

                    <div className="aspect-square w-full max-w-[320px] mx-auto">
                        <KundliChart
                            planets={data.planets}
                            ascendantSign={d1AscendantSign}
                            style={chartStyle}
                        />
                    </div>
                </div>
            </div>

            {/* Planetary Positions */}
            <div className="px-4 mt-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3.5 ml-1">Planetary Alignments</h3>
                <div className="space-y-2.5">
                    {Object.entries(data.planets).map(([name, p]) => (
                        <PlanetRow 
                            key={name} 
                            name={name} 
                            sign={SIGNS[Math.floor(p.longitude / 30)]} 
                            longitude={p.longitude}
                            relation={p.relation} 
                        />
                    ))}
                </div>
            </div>

            {/* Vimshottari Dasha */}
            <div className="px-4 mt-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3.5 ml-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-electric-violet" /> Vimshottari Mahadasha
                </h3>
                <div className="space-y-3">
                    {data.dashas.list.map((dasha, idx) => {
                        const isCurrent = new Date() >= new Date(dasha.start) && new Date() <= new Date(dasha.end);
                        return (
                            <DashaCard
                                key={idx}
                                lord={dasha.lord}
                                start={dasha.start}
                                end={dasha.end}
                                isCurrent={isCurrent}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Footer / Disclaimer */}
            <div className="px-6 py-8 opacity-40 text-center">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Calculated using Swiss Ephemeris. House System: Placidus/Shripati. Ayanamsa: Lahiri.
                </p>
            </div>
        </div>
    );
}

// --- Local Components ---

function QuickStat({ label, val }) {
    return (
        <div className="py-1.5 px-3.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-sm whitespace-nowrap flex items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-2">{label}</span>
            <span className="text-xs font-black text-white">{val}</span>
        </div>
    );
}

function ChartToggle({ active, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-1 text-[10px] font-black rounded-full transition-all duration-200 ${
                active 
                    ? 'bg-electric-violet text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]' 
                    : 'text-slate-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
}

function PlanetRow({ name, sign, longitude, relation }) {
    const getRelColor = (r) => {
        const rel = r?.toLowerCase() || '';
        if (rel.includes('friend')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (rel.includes('enemy')) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        if (rel.includes('own')) return 'text-solar-gold bg-solar-gold/10 border-solar-gold/20';
        return 'text-slate-400 bg-white/5 border-white/10';
    };

    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);

    return (
        <div className="p-3.5 rounded-[20px] bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-electric-violet/15 border border-electric-violet/25 flex items-center justify-center text-xs font-black text-electric-violet shadow-sm">
                    {name.substring(0, 2)}
                </div>
                <div>
                    <p className="text-xs font-black text-white leading-tight">{name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sign}</p>
                </div>
            </div>

            {/* In-between: Degrees and Minutes */}
            <div className="flex flex-col items-center">
                <span className="text-xs font-black text-white">{deg}° {min}'</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Longitude</span>
            </div>

            <div className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getRelColor(relation)}`}>
                {relation || 'Neutral'}
            </div>
        </div>
    );
}

function DashaCard({ lord, start, end, isCurrent }) {
    const formatD = (s) => {
        const d = new Date(s);
        return d.getFullYear();
    };

    return (
        <div className={`p-4.5 rounded-[22px] border transition-all relative overflow-hidden backdrop-blur-2xl ${
            isCurrent 
                ? 'bg-[#101438]/90 border-electric-violet/50 shadow-[0_0_25px_rgba(139,92,246,0.25)] ring-1 ring-electric-violet/40' 
                : 'bg-white/[0.03] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
        }`}>
            {isCurrent && (
                <div className="absolute top-3.5 right-4 px-2.5 py-0.5 bg-electric-violet/30 border border-electric-violet/50 text-[8px] font-black text-electric-violet rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    Active Period
                </div>
            )}
            <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-lg ${
                    isCurrent 
                        ? 'bg-gradient-to-tr from-electric-violet to-purple-600 text-white' 
                        : 'bg-white/[0.06] text-slate-300 border border-white/10'
                }`}>
                    {lord.charAt(0)}
                </div>
                <div>
                    <h4 className="text-sm font-black text-white">{lord} Mahadasha</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {formatD(start)} — {formatD(end)}
                    </p>
                </div>
            </div>
        </div>
    );
}
