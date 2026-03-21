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
        <div className="min-h-screen pb-24 animate-in fade-in duration-700">
            {/* Header */}
            <div className="pt-6 px-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white/5 rounded-full text-slate-400"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <h1 className="text-xl font-black text-white">{name}'s Chart</h1>
                        <p className="text-[10px] text-solar-gold font-bold uppercase tracking-widest">Personal Horoscope</p>
                    </div>
                    <button
                        onClick={() => router.push('/kundli')}
                        className="p-2 bg-white/5 rounded-xl text-slate-400 border border-white/5 active:scale-95 transition-all"
                    >
                        <Edit2 size={18} />
                    </button>
                </div>
            </div>

            {/* Top Stats Bar */}
            <div className="px-4 mt-6 overflow-x-auto">
                <div className="flex gap-3 pb-2 min-w-max">
                    <QuickStat label="Lagna" val={SIGNS[d1AscendantSign - 1]} />
                    <QuickStat label="Rashi" val={SIGNS[data.planets.Moon.sign - 1]} />
                    <QuickStat label="Nakshatra" val={data.dashas.birthNakshatra} />
                    <QuickStat label="Tithi" val={data.panchang?.tithi || '-'} />
                </div>
            </div>

            {/* Interactive Chart Section */}
            <div className="px-4 mt-6">
                <div className="glass-panel p-5 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Star size={14} className="text-solar-gold" /> Birth Chart (D1)
                        </h2>
                        <div className="flex bg-white/10 p-1 rounded-xl">
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
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Planetary Alignments</h3>
                <div className="space-y-3">
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
            <div className="px-4 mt-10">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-electric-violet" /> Vimshottari Mahadasha
                </h3>
                <div className="space-y-4">
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
            <div className="px-6 py-10 opacity-40 text-center">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Calculated using Swiss Ephemeris. House System: Placidus/Shripati. Ayanamsa: Lahiri.
                </p>
            </div>
        </div>
    );
}

// --- Local Components ---

function QuickStat({ label, val }) {
    return (
        <div className="glass-panel py-2 px-4 rounded-full border-white/5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mr-2">{label}</span>
            <span className="text-xs font-black text-white">{val}</span>
        </div>
    );
}

function ChartToggle({ active, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${active ? 'bg-electric-violet text-white shadow-lg' : 'text-slate-400'}`}
        >
            {label}
        </button>
    );
}

function PlanetRow({ name, sign, longitude, relation }) {
    const getRelColor = (r) => {
        const rel = r?.toLowerCase() || '';
        if (rel.includes('friend')) return 'text-emerald-400';
        if (rel.includes('enemy')) return 'text-rose-400';
        if (rel.includes('own')) return 'text-solar-gold';
        return 'text-slate-400';
    };

    const deg = Math.floor(longitude % 30);
    const min = Math.floor((longitude % 1) * 60);

    return (
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-electric-violet">
                    {name.substring(0, 2)}
                </div>
                <div>
                    <p className="text-xs font-black text-white">{name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{sign}</p>
                </div>
            </div>

            {/* In-between: Degrees and Minutes */}
            <div className="flex flex-col items-center">
                <span className="text-sm font-black text-white">{deg}° {min}'</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Longitude</span>
            </div>

            <div className={`text-[10px] font-black uppercase tracking-widest ${getRelColor(relation)}`}>
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
        <div className={`glass-panel p-5 rounded-[2rem] border-white/5 relative overflow-hidden ${isCurrent ? 'ring-2 ring-electric-violet ring-offset-4 ring-offset-[#0b1026]' : ''}`}>
            {isCurrent && (
                <div className="absolute top-4 right-5 px-3 py-1 bg-electric-violet text-[8px] font-black text-white rounded-full uppercase tracking-widest">
                    Active Now
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isCurrent ? 'bg-electric-violet text-white shadow-lg' : 'bg-white/5 text-slate-400'}`}>
                    {lord.charAt(0)}
                </div>
                <div>
                    <h4 className="text-sm font-black text-white">{lord} Mahadasha</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        {formatD(start)} - {formatD(end)}
                    </p>
                </div>
            </div>
        </div>
    );
}
