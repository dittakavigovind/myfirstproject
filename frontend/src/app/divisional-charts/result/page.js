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
import { t } from '../../../utils/translations';

export default function DivisionalChartsResult() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chartStyle, setChartStyle] = useState('north');
    const [lang, setLang] = useState('en');

    // Auth & Data Fetch
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            toast.error(t('pleaseLogin', lang));
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
                    timezone: parseFloat(searchParams.get('tz')),
                    lang
                };

                const res = await API.post('/astro/divisional-charts', payload);
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                setError(t('failedCalculateCharts', lang));
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('date')) {
            setLoading(true);
            fetchData();
        }
    }, [searchParams, user, authLoading, router, lang]);

    if (loading) return (
        <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-screen bg-slate-900 text-white"
        >
            <CosmicLoader size="lg" message={t('calculatingVarga', lang)} fullscreen={false} />
        </motion.div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
            {error}
        </div>
    );

    if (!data) return null;

    const CHART_TITLES = {
        D1: t('D1', lang),
        D2: t('D2', lang),
        D3: t('D3', lang),
        D4: t('D4', lang),
        D7: t('D7', lang),
        D9: t('D9', lang),
        D10: t('D10', lang),
        D12: t('D12', lang),
        D16: t('D16', lang),
        D20: t('D20', lang),
        D24: t('D24', lang),
        D27: t('D27', lang),
        D30: t('D30', lang),
        D40: t('D40', lang),
        D45: t('D45', lang),
        D60: t('D60', lang)
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
                            {t('shodashvarga', lang)} {searchParams.get('name') && <span className="text-slate-400 font-medium">- {searchParams.get('name')}</span>}
                        </h1>
                        <p className="text-slate-400 text-xs mt-1">
                            {formatDate(data.meta.date)} • {data.meta.time} • {searchParams.get('place') || t('unknownLocation', lang)}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10">
                            <button onClick={() => setLang('en')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${lang === 'en' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}>English</button>
                            <button onClick={() => setLang('hi')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${lang === 'hi' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}>हिंदी</button>
                            <button onClick={() => setLang('te')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${lang === 'te' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}>తెలుగు</button>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-xl backdrop-blur-md border border-white/10">
                            <button
                                onClick={() => setChartStyle('north')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${chartStyle === 'north' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}
                            >
                                {t('north', lang)}
                            </button>
                            <button
                                onClick={() => setChartStyle('south')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${chartStyle === 'south' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40' : 'text-slate-400 hover:text-white'}`}
                            >
                                {t('south', lang)}
                            </button>
                        </div>
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
                                        lang={lang}
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
                    {t('disclaimer', lang)}
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">
                    {t('disclaimerCharts', lang)}
                </p>
            </div>
        </div>
    );
}
