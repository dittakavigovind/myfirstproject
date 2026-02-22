"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '../../../components/CosmicLoader';
import { Download, Sparkles, Star, ChevronRight, Info, ArrowLeft } from 'lucide-react';
import { planetInsights } from '../../../utils/planetInsights';
import PlanetInsightModal from '../../../components/PlanetInsightModal';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import KundliChart from '../../../components/KundliChart';

export default function KundliResult() {
    const searchParams = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payload = {
                    date: searchParams.get('date'),
                    time: searchParams.get('time'),
                    lat: parseFloat(searchParams.get('lat')),
                    lng: parseFloat(searchParams.get('lng')),
                    timezone: searchParams.get('tz')
                };

                const res = await API.post('/astro/kundli', payload);
                setData(res.data.data);
            } catch (err) {
                console.error(err);
                setError('Failed to calculate Kundli');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('date')) {
            fetchData();
        }
    }, [searchParams]);


    // Chart Style State
    const [chartStyle, setChartStyle] = useState('north'); // 'north' or 'south'
    const [activeChart, setActiveChart] = useState('D1'); // 'D1' or 'D9'

    // Premium Features State
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const reportRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const openInsight = (planetName, planetData) => {
        setSelectedPlanet({ name: planetName, ...planetData });
        setIsModalOpen(true);
    };

    // Color Helpers
    const getRelationColor = (relation) => {
        const r = relation?.toLowerCase() || '';
        if (r.includes('great friend')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (r.includes('own sign')) return 'bg-green-50 text-green-700 border-green-100';
        if (r.includes('friend')) return 'bg-blue-50 text-blue-700 border-blue-100';
        if (r.includes('great enemy')) return 'bg-rose-100 text-rose-800 border-rose-200';
        if (r.includes('enemy')) return 'bg-rose-50 text-rose-700 border-rose-100';
        if (r.includes('neutral')) return 'bg-slate-50 text-slate-500 border-slate-100';
        return 'bg-slate-50 text-slate-400 border-slate-100';
    };

    const getPlanetColor = (planet) => {
        const p = planet?.toLowerCase() || '';
        if (p.includes('sun')) return 'bg-amber-500 text-white lg:shadow-[0_0_15px_rgba(245,158,11,0.3)]';
        if (p.includes('moon')) return 'bg-indigo-400 text-white lg:shadow-[0_0_15px_rgba(129,140,248,0.3)]';
        if (p.includes('mars')) return 'bg-rose-600 text-white lg:shadow-[0_0_15px_rgba(225,29,72,0.3)]';
        if (p.includes('mercury')) return 'bg-emerald-500 text-white lg:shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        if (p.includes('jupiter')) return 'bg-orange-500 text-white lg:shadow-[0_0_15px_rgba(249,115,22,0.3)]';
        if (p.includes('venus')) return 'bg-fuchsia-400 text-white lg:shadow-[0_0_15px_rgba(232,121,249,0.3)]';
        if (p.includes('saturn')) return 'bg-slate-800 text-white lg:shadow-[0_0_15px_rgba(30,41,59,0.3)]';
        return 'bg-indigo-600 text-white lg:shadow-[0_0_15px_rgba(79,70,229,0.3)]';
    };

    const handleDownload = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);
        try {
            // Wait a moment for any animations to finish
            await new Promise(r => setTimeout(r, 1000));

            const canvas = await toPng(reportRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                style: {
                    borderRadius: '0', // Clean edges for PDF
                    width: '1200px', // Force width for consistent layout in PDF
                    margin: '0',
                }
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15; // 15mm margin
            const contentWidth = pageWidth - (margin * 2);
            let currentY = margin;

            // Function to add watermark to each page
            const addWatermark = (p) => {
                p.saveGraphicsState();
                p.setGState(new p.GState({ opacity: 0.04 }));
                p.setFontSize(25);
                p.setTextColor(100);
                p.setFont("helvetica", "bold");
                for (let y = 20; y < pageHeight; y += 70) {
                    p.text("way2astro.com", margin, y, { align: 'left', angle: 25 });
                    p.text("way2astro.com", pageWidth / 2, y, { align: 'center', angle: 25 });
                    p.text("way2astro.com", pageWidth - margin, y, { align: 'right', angle: 25 });
                }
                p.restoreGraphicsState();
            };

            // Add footer
            const addFooter = (p, pageNum) => {
                p.setFontSize(8);
                p.setTextColor(150);
                p.text(`Page ${pageNum} - way2astro.com`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            };

            // First page setup
            let pageNum = 1;
            const sections = reportRef.current.querySelectorAll('[data-pdf-section]');

            // Add a small delay to ensure all dynamic elements/fonts are fully rendered
            await new Promise(resolve => setTimeout(resolve, 800));

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionName = section.getAttribute('data-pdf-section');
                const isDasha = sectionName === 'dasha';
                const isDisclaimer = sectionName === 'disclaimer';

                const canvas = await toPng(section, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    style: {
                        width: '1300px',
                        opacity: '1',
                        margin: '0',
                        padding: isDasha ? '40px 80px' : (isDisclaimer ? '20px' : '20px 40px'),
                        overflow: 'visible', // Ensure no scrollbars in PDF
                    }
                });

                const imgProps = pdf.getImageProperties(canvas);
                const sectionHeight = (imgProps.height * contentWidth) / imgProps.width;

                // Check if section fits on current page
                if (currentY + sectionHeight > (pageHeight - margin)) {
                    pdf.addPage();
                    pageNum++;
                    currentY = margin;
                }

                pdf.addImage(canvas, 'PNG', margin, currentY, contentWidth, sectionHeight, undefined, 'FAST');
                currentY += sectionHeight + 8; // Increased gap to 8mm between sections for better spacing
            }

            // Final Pass: Add Watermark and Footer to all pages at the end (Top Layer)
            const totalPages = pdf.internal.getNumberOfPages();
            for (let j = 1; j <= totalPages; j++) {
                pdf.setPage(j);
                addWatermark(pdf);
                addFooter(pdf, j);
            }

            pdf.save(`Way2Astro-Full-Report-${searchParams.get('name') || 'User'}.pdf`);

        } catch (err) {
            console.error('Download failed', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return (
        <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[400px]"
        >
            <CosmicLoader size="lg" message="Aligning the Stars..." fullscreen={false} />
        </motion.div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
            {error}
        </div>
    );

    if (!data) return null;

    const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

    // derived values
    const d1AscendantSign = Math.floor(data.houses.ascendant / 30) + 1;

    // Helper to calc D9 Sign for Ascendant
    const getNavamsaSign = (longitude) => {
        const signIndex = Math.floor(longitude / 30); // 0-11
        const sign = signIndex + 1;
        const degreeInSign = longitude % 30;
        const pada = Math.floor(degreeInSign / 3.3333333333) + 1;

        let navamsaSignStart;
        if ([1, 5, 9].includes(sign)) navamsaSignStart = 1; // Aries
        else if ([2, 6, 10].includes(sign)) navamsaSignStart = 10; // Capricorn
        else if ([3, 7, 11].includes(sign)) navamsaSignStart = 7; // Libra
        else navamsaSignStart = 4; // Cancer

        return (navamsaSignStart + (pada - 1) - 1) % 12 + 1;
    };

    const d9AscendantSign = getNavamsaSign(data.houses.ascendant);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            <div ref={reportRef} className="bg-slate-50">
                {/* Full Header and Branding Wrapper for Overlap */}
                <div data-pdf-section="header-top" className="bg-slate-50">
                    {/* Premium Header */}
                    <div className="relative bg-slate-900 overflow-hidden pb-40 pt-10 w-full">
                        <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-purple-950/40 to-slate-950 opacity-95"></div>

                        {/* Decorative BG Elements */}
                        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>

                        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >

                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={12} className="text-astro-yellow fill-astro-yellow/20" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-astro-yellow">Vedic Astrology</span>
                                        </div>
                                    </div>

                                    {!isDownloading && (
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-astro-yellow text-slate-900 text-[10px] font-black uppercase tracking-wider hover:bg-white transition-all shadow-lg shadow-black/20"
                                        >
                                            <Download className="w-3 h-3" />
                                            Download PDF Report
                                        </button>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                                    Janam <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">Kundli</span>
                                    {searchParams.get('name') && <span className="block md:inline md:ml-3 text-2xl md:text-4xl text-indigo-200 opacity-80 font-bold mt-2 md:mt-0">- {searchParams.get('name')}</span>}
                                </h1>
                                <p className="text-slate-400 text-sm font-medium">
                                    {(() => {
                                        const [y, m, d] = data.meta.date.split('-');
                                        const dateObj = new Date(y, m - 1, d);
                                        const monthName = dateObj.toLocaleString('en-US', { month: 'long' });
                                        return `${d}-${monthName}-${y}`;
                                    })()}
                                    <span className="mx-2">•</span>
                                    {data.meta.time}
                                    {searchParams.get('place') && (
                                        <>
                                            <span className="mx-2">•</span>
                                            {searchParams.get('place')}
                                        </>
                                    )}
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 bg-white rounded-[3rem] shadow-2xl overflow-hidden border-b border-slate-100">
                        {/* PDF BRANDING HEADER */}
                        <div className="pt-10 px-8 mb-6 flex items-center justify-between pb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                    <Star className="fill-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">Way2Astro</h2>
                                    <p className="text-xs text-indigo-600 font-black tracking-[0.2em] uppercase mt-1">Premium Vedic Insights</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Confidential Report For</p>
                                <p className="text-lg font-black text-slate-900">{searchParams.get('name') || 'Guest User'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 bg-white pb-12 overflow-hidden mb-10">
                    <div data-pdf-section="chart-details" className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8 pt-8">
                        {/* Left Column: Chart */}
                        <div className="lg:col-span-5">
                            <motion.div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-indigo-900/30 border border-indigo-500/20 flex flex-col h-full relative overflow-hidden">
                                <div className="relative z-10 flex flex-wrap justify-between items-center mb-8 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Your Chart</h2>
                                        <p className="text-indigo-200 text-sm font-medium">Cosmic Alignment</p>
                                    </div>
                                    <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
                                        <button onClick={() => setChartStyle('north')} className={`px-4 py-2 text-xs font-bold rounded-lg ${chartStyle === 'north' ? 'bg-indigo-500 text-white' : 'text-indigo-200'}`}>North</button>
                                        <button onClick={() => setChartStyle('south')} className={`px-4 py-2 text-xs font-bold rounded-lg ${chartStyle === 'south' ? 'bg-indigo-500 text-white' : 'text-indigo-200'}`}>South</button>
                                    </div>
                                </div>
                                <div className="relative z-10 aspect-square w-full max-w-[400px] mx-auto mt-6">
                                    <KundliChart planets={activeChart === 'D1' ? data.planets : data.charts.D9} ascendantSign={activeChart === 'D1' ? d1AscendantSign : d9AscendantSign} style={chartStyle} />
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">Cosmic Identity</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Lagna</span>
                                        <span className="text-xs font-black text-indigo-900">{SIGNS[Math.floor(data.houses.ascendant / 30)]}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rashi</span>
                                        <span className="text-xs font-black text-indigo-900">{SIGNS[data.planets.Moon.sign - 1]}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Thithi</span>
                                        <span className="text-xs font-black text-indigo-900">{data.panchang?.tithi || '-'}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Varam</span>
                                        <span className="text-xs font-black text-indigo-900">{data.panchang?.vara || '-'}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Nakshatra</span>
                                        <span className="text-sm font-black text-indigo-900">{data.dashas.birthNakshatra}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Pada</span>
                                        <span className="text-sm font-black text-indigo-900">{data.charts.D9.Moon.nakshatraPada}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Yoga</span>
                                        <span className="text-sm font-black text-indigo-900">{data.panchang?.yoga || '-'}</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Karana</span>
                                        <span className="text-sm font-black text-indigo-900">{data.panchang?.karana || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-xl font-black text-slate-800 whitespace-nowrap">Planetary Details</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Planet</th>
                                                <th className="px-6 py-3 text-left">Longitude</th>
                                                <th className="px-6 py-3 text-left">Zodiac Sign</th>
                                                <th className="px-6 py-3 text-left">Relation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-xs">
                                            {Object.entries(data.planets).map(([key, planet]) => (
                                                <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[11px] font-black text-indigo-600 border border-indigo-100">
                                                                {key.charAt(0)}
                                                            </div>
                                                            <span className="font-black text-slate-800">{key}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-slate-600">
                                                        {Math.floor(planet.longitude % 30)}° {Math.floor((planet.longitude % 1) * 60)}'
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-slate-700">{SIGNS[Math.floor(planet.longitude / 30)]}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-4 py-1.5 rounded-full border text-[11px] font-black tracking-wider shadow-sm inline-block min-w-[90px] text-center ${getRelationColor(planet.relation)}`}>
                                                            {planet.relation || 'Neutral'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DASHA PREDICTIONS SECTION */}
                    <div className="mt-12 px-4 md:px-8">
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                            <div data-pdf-section="dasha-header">
                                <h2 className="text-2xl font-black text-slate-800 pb-8 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                        <Sparkles size={20} />
                                    </span>
                                    Life Predictions & Dasha Analysis
                                </h2>
                            </div>
                            <div className="space-y-6">
                                {data.dashas.list.map((dasha, idx) => {
                                    const isCurrent = new Date() >= new Date(dasha.start) && new Date() <= new Date(dasha.end);
                                    return (
                                        <div key={idx} data-pdf-section="dasha" className={`relative p-8 rounded-[2rem] border ${isCurrent ? 'bg-white border-indigo-200 shadow-xl' : 'bg-white/50 border-slate-100 shadow-sm'}`}>
                                            {isCurrent && (
                                                <div className="absolute top-6 right-6 px-4 py-1.5 bg-indigo-600 text-[10px] font-black text-white rounded-full shadow-lg shadow-indigo-600/30 z-10 uppercase tracking-wider">
                                                    ACTIVE PERIOD
                                                </div>
                                            )}

                                            <div className="flex flex-col lg:flex-row gap-8">
                                                {/* Left: Lord & Timeline */}
                                                <div className="lg:w-1/3 flex flex-col items-start">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-4 shadow-lg ${getPlanetColor(dasha.lord)}`}>
                                                        {dasha.lord.charAt(0)}
                                                    </div>
                                                    <h3 className="font-black text-slate-900 text-xl mb-3">{dasha.lord} Mahadasha</h3>

                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Timeline</span>
                                                        <p className="text-sm font-black text-slate-600 leading-tight">
                                                            {(() => {
                                                                const f = (s) => {
                                                                    const d = new Date(s);
                                                                    return `${d.getDate()}-${d.toLocaleString('en-US', { month: 'short' })}-${d.getFullYear()}`;
                                                                };
                                                                return `${f(dasha.start)} - ${f(dasha.end)}`;
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right: Interpretation */}
                                                <div className="lg:w-2/3">
                                                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-50 h-full">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600">
                                                                <Info size={10} className="stroke-[3]" />
                                                            </div>
                                                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">The Interpretation</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                                            {dasha.analysis?.text || dasha.analysis?.description || `The Mahadasha of ${dasha.lord} is a significant period in your life path, bringing unique energy and lessons governed by the planet's placement.`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div data-pdf-section="disclaimer" className="mt-12 pt-8 border-t border-slate-100 text-center px-4 max-w-5xl mx-auto opacity-80">
                        <p className="text-[11px] text-slate-600 font-black leading-relaxed uppercase tracking-widest mb-3">Disclaimer</p>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                            This report is purely based on classical Vedic Astrology observations. The results found in this report are for only educational purposes; these may change from context to person. No predictions or results should be taken as absolute truths or final commands for your life decisions. The predictions or results made in the report are not individual advice and should not be substituted for professional medical, legal, financial, or other expert advice. By using this software or the services of <a href="/" className="text-indigo-600 hover:text-indigo-700 font-bold decoration-none border-b border-indigo-200">Way2Astro</a>, you agree to hold Way2Astro and its associates harmless from any liability arising out of the use of this report.
                        </p>
                    </div>
                </div>
            </div>

            {isDownloading && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-white text-center">
                    <CosmicLoader size="lg" message="Architecting your Destiny Report..." />
                    <p className="mt-4 text-indigo-200 animate-pulse font-bold tracking-widest uppercase text-xs">Generating Premium PDF</p>
                </div>
            )}

            {/* Modal for Planetary Insights */}
            <PlanetInsightModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                planetName={selectedPlanet?.name || ''}
                planetData={selectedPlanet}
                insight={{
                    description: planetInsights[selectedPlanet?.name]?.description,
                    signSpecific: planetInsights[selectedPlanet?.name]?.signs?.[selectedPlanet?.signName],
                    relationSpecific: planetInsights[selectedPlanet?.name]?.relations?.[selectedPlanet?.relation?.split(' ')[0]]
                }}
            />
        </div>
    );
}
