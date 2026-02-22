"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowLeft, Star, Calendar, Clock, MapPin, CheckCircle2, Info, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import CosmicLoader from '../../../components/CosmicLoader';
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';
import PageContentSection from '../../../components/common/PageContentSection';
import LocationSearch from '../../../components/LocationSearch';
import KundliChart from '../../../components/KundliChart';
import { PieChart, List } from 'lucide-react';

export default function TransitPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('chart'); // 'table' or 'chart'

    // Default location: New Delhi
    const [location, setLocation] = useState({
        place: 'New Delhi, India',
        lat: 28.6139,
        lng: 77.2090,
        timezone: 5.5
    });

    const fetchTransit = async (locInput) => {
        // Use provided location if valid, otherwise use state location
        // Checks for .lat to distinguish between a valid location object and an Event object
        const loc = (locInput && locInput.lat !== undefined) ? locInput : location;

        setLoading(true);
        setError(null);
        try {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const timeStr = now.toTimeString().slice(0, 5); // HH:mm

            const payload = {
                date: dateStr,
                time: timeStr,
                lat: loc.lat,
                lng: loc.lng,
                timezone: loc.timezone,
                name: 'Current Transit',
                gender: 'male'
            };

            const res = await API.post('/astro/kundli', payload);

            if (res.data.success) {
                setResult(res.data.data);
            } else {
                setError("Failed to fetch transit data.");
                toast.error("Failed to fetch transit data.");
            }
        } catch (error) {
            console.error("Transit Fetch Error:", error);
            setError("An error occurred while fetching real-time data.");
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransit();
    }, []);

    const handleLocationSelect = (loc) => {
        const newLoc = {
            place: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng,
            timezone: loc.timezone
        };
        setLocation(newLoc);
        fetchTransit(newLoc);
    };

    const getSignName = (signNum) => {
        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        return signs[signNum - 1] || 'Unknown';
    };

    const getPlanetIcon = (name) => {
        switch (name) {
            case 'Sun': return <Star size={20} className="text-orange-400" />;
            case 'Moon': return <Star size={20} className="text-slate-300" />;
            case 'Mars': return <Star size={20} className="text-red-500" />;
            case 'Jupiter': return <Star size={20} className="text-yellow-500" />;
            default: return <Star size={20} className="text-indigo-400" />;
        }
    };

    if (loading) return <CosmicLoader fullscreen={true} message="Aligning current planetary positions..." />;

    return (
        <main className="min-h-screen bg-[#05070a] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 overflow-x-hidden text-white">

            <StandardResultHeader
                title="Real-time Transit (Gochar)"
                name="Current Planets"
                date={new Date()}
                time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                place={location.place}
            />

            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Summary & Explanation */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-xl font-black">Change Location</h3>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1 mb-2 block">Search City</label>
                                <LocationSearch
                                    onLocationSelect={handleLocationSelect}
                                    darkMode={true}
                                    placeholder="Search city for local transit..."
                                    defaultValue={location.place}
                                />
                                {location.place && (
                                    <p className="text-indigo-400 text-sm font-bold flex items-center gap-2 mt-3 px-1">
                                        <CheckCircle2 size={14} /> {location.place}
                                    </p>
                                )}
                            </div>

                            <div className="h-px bg-white/10 my-8"></div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-xl font-black">Transit Insights</h3>
                            </div>
                            <p className="text-indigo-100/60 font-medium leading-relaxed mb-6">
                                Gochar refers to the current movement of planets through the zodiac signs. While your birth chart (Kundli) is fixed, Transit shows how current planetary energies are affecting the world right now.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <Info size={18} className="text-indigo-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Dynamic Influence</h4>
                                        <p className="text-xs text-white/40 mt-1">Transits provide the 'timing' for events indicated in your birth chart.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <Activity size={18} className="text-emerald-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Real-time Data</h4>
                                        <p className="text-xs text-white/40 mt-1">Calculated using the high-precision Swiss Ephemeris engine.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => fetchTransit()}
                                className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all"
                            >
                                <RefreshCw size={18} /> Refresh Positions
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
                        >
                            <h4 className="text-lg font-bold mb-4">Want a personalized reading?</h4>
                            <p className="text-sm text-white/60 mb-6">Our experts can explain how these transits are specifically affecting YOUR life.</p>
                            <Link href="/chat-with-astrologer">
                                <button className="w-full py-4 bg-astro-yellow text-astro-navy rounded-2xl font-black shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Talk to Expert
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right: Positions Table */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-2xl font-black">Planetary Positions</h3>
                                    <div className="mt-2 px-3 py-1 inline-flex bg-emerald-500/10 border border-emerald-500/20 rounded-full items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        Live
                                    </div>
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
                                    <button
                                        onClick={() => setViewMode('chart')}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'chart'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                            }`}
                                    >
                                        <PieChart size={18} /> Chart
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${viewMode === 'table'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                            }`}
                                    >
                                        <List size={18} /> Table
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {viewMode === 'chart' ? (
                                    <motion.div
                                        key="chart"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="h-[500px] w-full max-w-[500px] mx-auto"
                                    >
                                        <KundliChart
                                            planets={result?.planets || {}}
                                            ascendantSign={result?.planets?.Ascendant?.sign || 1}
                                            style="north"
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="table"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="overflow-x-auto"
                                    >
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left border-b border-white/5">
                                                    <th className="pb-4 text-xs font-bold text-white/40 uppercase tracking-widest">Planet</th>
                                                    <th className="pb-4 text-xs font-bold text-white/40 uppercase tracking-widest">Sign</th>
                                                    <th className="pb-4 text-xs font-bold text-white/40 uppercase tracking-widest">Degrees</th>
                                                    <th className="pb-4 text-xs font-bold text-white/40 uppercase tracking-widest">Retrograde</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {Object.entries(result?.planets || {}).map(([name, data], idx) => {
                                                    if (name === 'Ascendant' || name === 'As') return null; // Don't list Ascendant in planets table usually
                                                    return (
                                                        <motion.tr
                                                            key={name}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="group hover:bg-white/[0.02] transition-colors"
                                                        >
                                                            <td className="py-5 flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                                                    {getPlanetIcon(name)}
                                                                </div>
                                                                <span className="font-bold text-white">{name}</span>
                                                            </td>
                                                            <td className="py-5 font-medium text-indigo-100/80">
                                                                {getSignName(data.sign)}
                                                            </td>
                                                            <td className="py-5 font-mono text-sm text-white/40">
                                                                {(data.longitude % 30).toFixed(2)}°
                                                            </td>
                                                            <td className="py-5">
                                                                {data.retrograde ? (
                                                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                                        Retrograde
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Direct</span>
                                                                )}
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Quick Tips */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Shubh Muhurat', text: 'Jupiter in fire signs brings growth and abundance.', icon: Star, color: 'text-yellow-400' },
                                { title: 'Health Watch', text: 'Mars in water signs may increase emotional stress.', icon: Activity, color: 'text-red-400' }
                            ].map((tip, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="bg-white/5 p-6 rounded-3xl border border-white/10"
                                >
                                    <tip.icon size={20} className={`${tip.color} mb-3`} />
                                    <h5 className="font-bold text-white mb-1">{tip.title}</h5>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium">{tip.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <PageContentSection slug="calculators/gochar" />
        </main>
    );
}
