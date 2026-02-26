"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { motion } from 'framer-motion';
import CosmicLoader from '../../../components/CosmicLoader';
import KundliChart from '../../../components/KundliChart';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DivisionalChartsResult() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartStyle, setChartStyle] = useState('north');

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
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to calculate Charts');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('date')) {
            fetchData();
        }
    }, [searchParams, user, authLoading, router]);

    if (loading) return (
        <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen bg-slate-900 text-white"
        >
            <CosmicLoader size="lg" message="Calculating 16 Varga Chakras..." fullscreen={false} />
        </motion.div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
            {error}
        </div>
    );

    if (!data) return null;

    const CHART_TITLES = {
        D1: "Rasi (D1) - Body / General",
        D2: "Hora (D2) - Wealth",
        D3: "Drekkana (D3) - Siblings",
        D4: "Chaturthamsa (D4) - Destiny / Assets",
        D7: "Saptamsa (D7) - Progeny",
        D9: "Navamsa (D9) - Marriage / Dharma",
        D10: "Dasamsa (D10) - Career",
        D12: "Dwadasamsa (D12) - Parents",
        D16: "Shodasamsa (D16) - Vehicles / Pleasures",
        D20: "Vimsamsa (D20) - Spiritual Progress",
        D24: "Chaturvimsamsa (D24) - Education",
        D27: "Saptavimsamsa (D27) - Strengths / Weaknesses",
        D30: "Trimsamsa (D30) - Misfortunes",
        D40: "Khavedamsa (D40) - Auspicious Effects",
        D45: "Akshavedamsa (D45) - General Character",
        D60: "Shashtyamsa (D60) - Past Karma"
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [y, m, d] = dateString.split('-');
        return `${d}-${m}-${y}`;
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-purple-900 selection:text-purple-100 pb-20">
            {/* Header */}
            <div className="relative bg-slate-900 border-b border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white">
                            Shodashvarga {searchParams.get('name') && <span className="text-slate-400 font-medium">- {searchParams.get('name')}</span>}
                        </h1>
                        <p className="text-slate-400 text-xs mt-1">
                            {formatDate(data.meta.date)} • {data.meta.time} • {searchParams.get('place') || 'Unknown Location'}
                        </p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10">
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

            {/* Grid of Grid */}
            <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.keys(CHART_TITLES).map((key, index) => {
                        const chartData = data.charts[key];
                        // Extract Ascendant Sign from Chart Data
                        const ascendantSign = chartData.Ascendant?.sign;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors shadow-2xl shadow-black/20 cursor-pointer group relative"
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    router.push(`/divisional-charts/result/details?slug=${key}&${params.toString()}`);
                                }}
                            >
                                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-200 text-sm">{CHART_TITLES[key]}</h3>
                                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{key}</span>
                                </div>
                                <div className="p-4 aspect-square">
                                    <KundliChart
                                        planets={chartData}
                                        ascendantSign={ascendantSign}
                                        style={chartStyle}
                                        smallMode={true} // Hint to make it responsive for grid
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center space-y-4 max-w-4xl mx-auto opacity-60 hover:opacity-100 transition-opacity pb-8 px-4">
                <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
                    Disclaimer
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">
                    The report generated above is based on classical Vedic Astrology calculations. The results in the report are subject to variations based on any change in the birth time, birth place or other factors. Our calculations are based on the Lahiri Ayanamsa of Dhrik Sidhanta. So, differences may arise upon comparison with other online horoscope services or other Panchangs. Therefore we strongly suggest that you consult an Astrologer to guide you in all your future decisions and not solely take decisions based on this report. By generating or downloading this report you agree that <Link href="/" className="text-purple-400 font-bold hover:underline">Way2Astro</Link> or any personnel related to Way2Astro will not be liable for any consequences that may arise due to decisions or actions taken by you or anyone based on the content of this report or any report generated using Way2Astro.
                </p>
            </div>
        </div>
    );
}
