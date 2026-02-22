"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBirthDetails } from '../../context/BirthDetailsContext';
import API from '../../lib/api';
import LocationSearch from '../../components/LocationSearch';
import DatePicker from "react-datepicker";
import TimeInput from '../../components/TimeInput';
import "react-datepicker/dist/react-datepicker.css";
import { Download, Heart, ShieldCheck, Info, Sparkles, ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function MatchMakingPage() {
    const { birthDetails, isInitialized } = useBirthDetails();

    // State now stores Date objects for 'date' and 'time'
    const [boy, setBoy] = useState({ date: null, time: new Date(new Date().setHours(0, 0, 0, 0)), location: '', lat: '', lng: '', timezone: 5.5 });
    const [girl, setGirl] = useState({ date: null, time: new Date(new Date().setHours(0, 0, 0, 0)), location: '', lat: '', lng: '', timezone: 5.5 });

    const PromotionCard = () => (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                        <Sparkles size={20} className="text-astro-yellow" />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-sm">New Feature</h3>
                </div>
                <h2 className="text-xl font-black mb-2">Zodiac Compatibility</h2>
                <p className="text-indigo-100/80 text-xs font-medium leading-relaxed mb-6">
                    Don't have birth details? Check compatibility using only zodiac signs for deep insights into your love life.
                </p>
                <Link
                    href="/matchmaking/zodiac-compatibility"
                    className="inline-flex items-center gap-2 bg-astro-yellow text-astro-navy px-6 py-2 rounded-full font-black text-xs hover:scale-105 transition-all shadow-lg shadow-black/20"
                >
                    Try Now <ArrowLeft className="rotate-180" size={14} />
                </Link>
            </div>
        </div>
    );

    // Pre-fill based on context
    useEffect(() => {
        if (isInitialized && birthDetails && birthDetails.gender) {
            const details = {
                date: birthDetails.date || null,
                date: birthDetails.date || null,
                time: (birthDetails.time && typeof birthDetails.time === 'string') ? (() => {
                    const d = new Date();
                    const [h, m] = birthDetails.time.split(':');
                    d.setHours(h, m, 0, 0);
                    return d;
                })() : new Date(new Date().setHours(0, 0, 0, 0)),
                location: birthDetails.place || '',
                lat: birthDetails.lat || '',
                lng: birthDetails.lng || '',
                timezone: birthDetails.timezone || 5.5
            };

            if (birthDetails.gender.toLowerCase() === 'male') {
                setBoy(prev => ({ ...prev, ...details }));
            } else if (birthDetails.gender.toLowerCase() === 'female') {
                setGirl(prev => ({ ...prev, ...details }));
            }
        }
    }, [isInitialized, birthDetails]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const resultRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!resultRef.current) return;
        setIsDownloading(true);
        try {
            // Wait a moment for any animations to finish
            await new Promise(r => setTimeout(r, 1000));

            const canvas = await toPng(resultRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                style: {
                    borderRadius: '0',
                    width: '1000px', // Force width for consistent layout in PDF
                    margin: '0',
                }
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = margin;

            // Function to add watermark
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

            const addFooter = (p, pageNum) => {
                p.setFontSize(8);
                p.setTextColor(150);
                p.text(`Page ${pageNum} - way2astro.com`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            };

            // First page setup
            let pageNum = 1;
            const sections = resultRef.current.querySelectorAll('[data-pdf-section]');

            // Wait for all elements/fonts to stabilize
            await new Promise(resolve => setTimeout(resolve, 800));

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const canvas = await toPng(section, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    style: {
                        width: '1300px',
                        margin: '0',
                        padding: '20px 60px',
                        overflow: 'visible',
                    }
                });

                const imgProps = pdf.getImageProperties(canvas);
                const sectionHeight = (imgProps.height * contentWidth) / imgProps.width;

                if (currentY + sectionHeight > (pageHeight - margin)) {
                    pdf.addPage();
                    pageNum++;
                    currentY = margin;
                }

                pdf.addImage(canvas, 'PNG', margin, currentY, contentWidth, sectionHeight, undefined, 'FAST');
                currentY += sectionHeight + 8; // Increased gap for better separation
            }

            // Final Pass: Top Layer Watermark and Footer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let j = 1; j <= totalPages; j++) {
                pdf.setPage(j);
                addWatermark(pdf);
                addFooter(pdf, j);
            }

            pdf.save(`Way2Astro-Match-Report.pdf`);

        } catch (err) {
            console.error('Download failed', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBoyLoc = (loc) => setBoy({ ...boy, location: loc.formattedAddress, lat: loc.lat, lng: loc.lng, timezone: loc.timezone || 5.5 });
    const handleGirlLoc = (loc) => setGirl({ ...girl, location: loc.formattedAddress, lat: loc.lat, lng: loc.lng, timezone: loc.timezone || 5.5 });

    const fetchMatch = async () => {
        if (!boy.date || !boy.time || !boy.lat || !girl.date || !girl.time || !girl.lat) {
            alert('Please enter all details for both Boy and Girl');
            return;
        }

        setLoading(true);
        try {
            // Format dates/times to strings (YYYY-MM-DD, HH:MM)
            const boyPayload = {
                ...boy,
                date: boy.date.toISOString().split('T')[0],
                time: boy.time.toTimeString().slice(0, 5)
            };
            const girlPayload = {
                ...girl,
                date: girl.date.toISOString().split('T')[0],
                time: girl.time.toTimeString().slice(0, 5)
            };

            const res = await API.post('/astro/match', { boy: boyPayload, girl: girlPayload });
            if (res.data.success) {
                setResult(res.data.data);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to calculate match');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-astro-navy text-white p-4 sticky top-0 z-30 shadow-md">
                <h1 className="font-bold text-lg">Kundli Matching</h1>
            </div>

            <div className="p-4 max-w-4xl mx-auto space-y-6">

                {/* Promotional Banner */}
                <PromotionCard />

                {/* Input Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Boy */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <h2 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            👨 Boy's Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                                <DatePicker
                                    selected={boy.date}
                                    onChange={date => setBoy({ ...boy, date })}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                                    wrapperClassName="w-full"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    portalId="root-portal"
                                    popperClassName="!z-[100]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time of Birth</label>
                                <TimeInput
                                    value={boy.time}
                                    onChange={time => setBoy({ ...boy, time })}
                                    className="h-[50px]"
                                />
                            </div>

                            <div className="[&_input]:py-3 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-xl">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Place of Birth</label>
                                <LocationSearch onLocationSelect={handleBoyLoc} placeholder={"City"} darkMode={false} defaultValue={boy.place} />
                            </div>
                        </div>
                    </div>

                    {/* Girl */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100">
                        <h2 className="font-bold text-pink-800 mb-4 flex items-center gap-2">
                            👩 Girl's Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                                <DatePicker
                                    selected={girl.date}
                                    onChange={date => setGirl({ ...girl, date })}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-pink-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                                    wrapperClassName="w-full"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    portalId="root-portal"
                                    popperClassName="!z-[100]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time of Birth</label>
                                <TimeInput
                                    value={girl.time}
                                    onChange={time => setGirl({ ...girl, time })}
                                    className="h-[50px]"
                                />
                            </div>

                            <div className="[&_input]:py-3 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-xl">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Place of Birth</label>
                                <LocationSearch onLocationSelect={handleGirlLoc} placeholder={"City"} darkMode={false} defaultValue={girl.place} />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchMatch}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all transform"
                >
                    {loading ? 'Calculating Matches...' : 'Check Compatibility ❤️'}
                </button>

                {/* Results */}
                {result && (
                    <div ref={resultRef} className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 animate-slideUp relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        {/* PDF BRANDING HEADER */}
                        <div data-pdf-section="branding" className="px-2 pb-8 flex items-center justify-between border-b border-gray-50 mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                    <Heart className="fill-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">Way2Astro</h2>
                                    <p className="text-xs text-rose-600 font-black tracking-[0.2em] uppercase mt-1">Horoscope Matching</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-black uppercase tracking-wider mb-1">Compatibility Analysis</p>
                                <p className="text-sm font-black text-slate-900">{boy.location.split(',')[0]} & {girl.location.split(',')[0]}</p>
                            </div>
                        </div>

                        <div data-pdf-section="summary" className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-50 pb-6 print:hidden">
                            <div className="text-left">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                                    Compatibility Report
                                </h2>
                                <p className="text-gray-500 text-sm font-medium">Ashtakoot Guna Milan Result</p>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 py-2 px-6 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Download className="w-3 h-3" />
                                )}
                                {isDownloading ? 'Preparing Full Report...' : 'Download Full PDF'}
                            </button>
                        </div>

                        <div data-pdf-section="total-score" className="text-center pb-10">
                            <h2 className="text-slate-500 font-black uppercase tracking-widest text-xs mb-3">Total Matching Score</h2>
                            <div className={`text-6xl font-black ${result.score.total >= 18 ? 'text-green-500' : 'text-rose-500'} flex items-center justify-center gap-2`}>
                                {result.score.total.toFixed(1)}
                                <span className="text-2xl text-gray-300 font-bold">/ 36</span>
                            </div>
                            <div className={`mt-4 inline-flex items-center gap-2 py-2 px-6 rounded-full font-bold text-sm ${result.score.total >= 18 ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                {result.score.total >= 18 ? '✅ Favorable Compatibility' : '⚠️ Low Compatibility'}
                            </div>
                        </div>

                        <div data-pdf-section="score-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <ScoreCard label="Varna" score={result.score.details.varna} max="1" desc="Professional Tendencies" />
                            <ScoreCard label="Vashya" score={result.score.details.vashya} max="2" desc="Mutual Control" />
                            <ScoreCard label="Tara" score={result.score.details.tara} max="3" desc="Destiny & Health" />
                            <ScoreCard label="Yoni" score={result.score.details.yoni} max="4" desc="Intimacy" />
                            <ScoreCard label="Maitri" score={result.score.details.maitri} max="5" desc="Friendship" />
                            <ScoreCard label="Gana" score={result.score.details.gana} max="6" desc="Temperament" />
                            <ScoreCard label="Bhakoot" score={result.score.details.bhakoot} max="7" desc="Progeny & Health" />
                            <ScoreCard label="Nadi" score={result.score.details.nadi} max="8" desc="Physique & Family" />
                        </div>

                        <div data-pdf-section="advice" className="mt-10 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-indigo-900 font-black text-sm mb-1">Expert Advice</h4>
                                <p className="text-indigo-800/80 text-xs font-medium leading-relaxed">
                                    Guna Milan is a primary step. For a complete understanding, Manglik Dosha and planetary strengths in both charts should also be analyzed by an expert.
                                </p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div data-pdf-section="disclaimer" className="mt-10 pt-8 border-t border-slate-100 text-center opacity-80">
                            <p className="text-[11px] text-slate-600 font-black leading-relaxed uppercase tracking-widest mb-3">Disclaimer</p>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                This report is purely based on classical Vedic Astrology observations. The results found in this report are for only educational purposes; these may change from context to person. No predictions or results should be taken as absolute truths or final commands for your life decisions. The predictions or results made in the report are not individual advice and should not be substituted for professional medical, legal, financial, or other expert advice. By using this software or the services of <a href="/" className="text-rose-600 hover:text-rose-700 font-bold decoration-none border-b border-rose-200">Way2Astro</a>, you agree to hold Way2Astro and its associates harmless from any liability arising out of the use of this report.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {isDownloading && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-black mb-2">Architecting Full Report</h2>
                    <p className="text-rose-200 animate-pulse font-bold tracking-widest uppercase text-xs">Generating Premium PDF</p>
                </div>
            )}
        </div>
    );
}

function ScoreCard({ label, score, max, desc }) {
    return (
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all duration-300">
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className="font-black text-2xl text-slate-800">
                {score}
                <span className="text-gray-300 text-xs ml-1">/ {max}</span>
            </div>
            <div className="mt-2 text-[9px] font-bold text-indigo-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                {desc}
            </div>
        </div>
    );
}
