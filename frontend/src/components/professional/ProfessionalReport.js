"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, Sparkles, Star, Info, RefreshCw, FileText,
    User, Calendar, Clock, MapPin, CheckCircle, AlertTriangle,
    Moon, Sun, ShieldCheck, ChevronDown
} from 'lucide-react';
import API from '../../lib/api';
import { useTheme } from '../../context/ThemeContext';
import { resolveImageUrl } from '../../lib/urlHelper';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import KundliChart from '../KundliChart';
import LocationSearch from '../LocationSearch';
import TimeInput from '../TimeInput';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import CosmicLoader from '../CosmicLoader';
import toast from 'react-hot-toast';

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const zodiacSigns = [
    { name: 'Aries', start: '03-21', end: '04-19', trait: 'Fearless, adventurous, and passionate.', element: 'Fire' },
    { name: 'Taurus', start: '04-20', end: '05-20', trait: 'Determined, patient, and grounded.', element: 'Earth' },
    { name: 'Gemini', start: '05-21', end: '06-20', trait: 'Curious, adaptable, and social.', element: 'Air' },
    { name: 'Cancer', start: '06-21', end: '07-22', trait: 'Nurturing, intuitive, and protective.', element: 'Water' },
    { name: 'Leo', start: '07-23', end: '08-22', trait: 'Confident, charismatic, and loyal.', element: 'Fire' },
    { name: 'Virgo', start: '08-23', end: '09-22', trait: 'Analytical, practical, and diligent.', element: 'Earth' },
    { name: 'Libra', start: '09-23', end: '10-22', trait: 'Diplomatic, artistic, and balanced.', element: 'Air' },
    { name: 'Scorpio', start: '10-23', end: '11-21', trait: 'Intense, passionate, and mysterious.', element: 'Water' },
    { name: 'Sagittarius', start: '11-22', end: '12-21', trait: 'Optimistic, freedom-loving, and honest.', element: 'Fire' },
    { name: 'Capricorn', start: '12-22', end: '01-19', trait: 'Disciplined, ambitious, and wise.', element: 'Earth' },
    { name: 'Aquarius', start: '01-20', end: '02-18', trait: 'Original, humanitarian, and independent.', element: 'Air' },
    { name: 'Pisces', start: '02-19', end: '03-20', trait: 'Compassionate, artistic, and psychic.', element: 'Water' }
];

export default function ProfessionalReport() {
    const reportRef = useRef(null);
    const { logos } = useTheme();
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [result, setResult] = useState(null);
    const [chartStyle, setChartStyle] = useState('north');

    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        date: new Date(),
        time: new Date(),
        location: '',
        lat: null,
        lng: null,
        timezone: 5.5
    });

    const handleLocationSelect = (loc) => {
        setFormData(prev => ({
            ...prev,
            location: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng,
            timezone: loc.timezone || 5.5
        }));
    };

    const handleTimeSelect = (time) => {
        setFormData(prev => ({ ...prev, time }));
    };

    const fetchAllData = async (e) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            toast.error("Please select a location from the search results");
            return;
        }

        setLoading(true);
        try {
            const dateStr = formData.date.toLocaleDateString('en-CA');
            const timeStr = formData.time.toTimeString().slice(0, 5);

            const payload = {
                date: dateStr,
                time: timeStr,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
                name: formData.name,
                gender: formData.gender
            };

            // Concurrent API calls
            const [kundliRes, doshaRes, arudhaRes] = await Promise.all([
                API.post('/astro/kundli', payload),
                API.post('/astro/dosha', payload),
                API.post('/astro/arudha-lagna', payload)
            ]);

            // Calculate Sun Sign locally
            const month = formData.date.getMonth() + 1;
            const day = formData.date.getDate();
            const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const sunSign = zodiacSigns.find(s => {
                if (s.name === 'Capricorn') return mmdd >= s.start || mmdd <= s.end;
                return mmdd >= s.start && mmdd <= s.end;
            });

            if (kundliRes.data.success && doshaRes.data.success) {
                setResult({
                    kundli: kundliRes.data.data,
                    dosha: doshaRes.data.data,
                    arudha: arudhaRes.data.data?.arudhaLagna,
                    sunSign: sunSign
                });
                toast.success("Professional Report Generated!");
            }
        } catch (error) {
            console.error("Report Generation Error:", error);
            toast.error("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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

    const formatReportDate = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return "";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getRelationColor = (relation) => {
        const r = relation?.toLowerCase() || '';
        if (r.includes('exalted')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        if (r.includes('great friend')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (r.includes('own sign')) return 'bg-green-50 text-green-700 border-green-100';
        if (r.includes('friend')) return 'bg-blue-50 text-blue-700 border-blue-100';
        if (r.includes('great enemy')) return 'bg-rose-100 text-rose-800 border-rose-200';
        if (r.includes('enemy')) return 'bg-rose-50 text-rose-700 border-rose-100';
        if (r.includes('debilitated')) return 'bg-slate-100 text-slate-400 border-slate-200';
        return 'bg-slate-50 text-slate-500 border-slate-100';
    };

    const getPlanetColor = (name) => {
        const p = name?.toLowerCase() || '';
        if (p === 'sun') return 'bg-amber-50 text-amber-600 border-amber-200';
        if (p === 'moon') return 'bg-slate-50 text-slate-500 border-slate-200';
        if (p === 'mars') return 'bg-rose-50 text-rose-600 border-rose-200';
        if (p === 'mercury') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (p === 'jupiter') return 'bg-orange-50 text-orange-600 border-orange-200';
        if (p === 'venus') return 'bg-pink-50 text-pink-600 border-pink-200';
        if (p === 'saturn') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (p === 'rahu') return 'bg-slate-100 text-slate-600 border-slate-300';
        if (p === 'ketu') return 'bg-zinc-100 text-zinc-600 border-zinc-300';
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    };

    const getBase64Image = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };
            img.onerror = error => reject(error);
            img.src = url;
        });
    };

    const handleDownload = async () => {
        if (!reportRef.current) return;
        setIsDownloading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = margin; // Start at top for first page (no header)

            // Load branding logo if exists
            let logoBase64 = null;
            const reportLogo = logos.report || logos.desktop;
            if (reportLogo) {
                try {
                    logoBase64 = await getBase64Image(resolveImageUrl(reportLogo));
                } catch (e) {
                    console.warn("Could not load logo for PDF header", e);
                }
            }

            const addWatermark = (p) => {
                p.saveGraphicsState();
                p.setGState(new p.GState({ opacity: 0.05 }));
                p.setFontSize(40);
                p.setTextColor(100, 116, 139); // Slate-400 equivalent
                p.setFont("helvetica", "bold");

                // Add a large central watermark
                p.text("way2astro", pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

                // Add smaller repeating watermarks
                p.setFontSize(12);
                for (let x = 0; x < pageWidth; x += 60) {
                    for (let y = 0; y < pageHeight; y += 60) {
                        p.text("way2astro", x, y, { align: 'center', angle: 30 });
                    }
                }
                p.restoreGraphicsState();
            };

            const addHeader = (p) => {
                const logoHeight = 12;
                const textY = margin + logoHeight + 4; // Ensure text is below logo

                if (logoBase64) {
                    // Render logo image
                    const logoW = 35;
                    const logoH = logoHeight;
                    p.addImage(logoBase64, 'PNG', margin, margin, logoW, logoH, undefined, 'FAST');
                } else {
                    p.setFontSize(14);
                    p.setTextColor(10, 20, 50);
                    p.setFont("helvetica", "bold");
                    p.text("WAY2ASTRO", margin, margin + 8);
                }


                // Draw line below the header
                p.setDrawColor(200);
                p.setLineWidth(0.5);
                p.line(margin, textY + 2, pageWidth - margin, textY + 2);
            };

            const addFooter = (p, pageNum) => {
                p.setFontSize(8);
                p.setTextColor(150);
                p.text(`Professional Astrological Analysis - Page ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
                p.text("way2astro.com", pageWidth - margin, pageHeight - 8, { align: 'right' });
            };

            const sections = reportRef.current.querySelectorAll('[data-pdf-section]');

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const canvas = await toPng(section, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                });

                const imgProps = pdf.getImageProperties(canvas);
                const sectionHeight = (imgProps.height * contentWidth) / imgProps.width;

                if (currentY + sectionHeight > (pageHeight - 15)) {
                    pdf.addPage();
                    currentY = margin + 25; // Reset to lower position for subsequent pages
                }

                // Only add header if we are on a new page (where currentY matches the offset)
                if (currentY === margin + 25) {
                    addHeader(pdf);
                }

                pdf.addImage(canvas, 'PNG', margin, currentY, contentWidth, sectionHeight, undefined, 'FAST');
                currentY += sectionHeight + 5;
            }

            // Final Pass for page numbers and TOP LAYER watermarks
            const totalPages = pdf.internal.getNumberOfPages();
            for (let j = 1; j <= totalPages; j++) {
                pdf.setPage(j);
                addWatermark(pdf); // Added on top of content
                addFooter(pdf, j);
            }

            pdf.save(`Way2Astro-Pro-Report-${formData.name || 'User'}.pdf`);
        } catch (err) {
            console.error('Download failed', err);
            toast.error('Failed to generate PDF');
        } finally {
            setIsDownloading(false);
        }
    };



    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative overflow-hidden">
            {/* Professional Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none z-0" style={{ transform: 'rotate(-15deg) scale(1.5)' }}>
                <div className="flex flex-wrap gap-24 p-20">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <span key={i} className="text-4xl font-black text-slate-900 tracking-widest whitespace-nowrap">
                            way2astro
                        </span>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-12 relative z-10">

                {/* Input Form Section */}
                {!result && (
                    <div className="max-w-4xl mx-auto px-6 pt-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-slate-100"
                        >
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-12">
                                    <FileText size={40} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-800">Professional <span className="text-indigo-600">Consultation Report</span></h1>
                                <p className="text-slate-500 mt-2 font-medium">Generate a comprehensive, branded PDF report for your clients</p>
                            </div>

                            <form onSubmit={fetchAllData} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Client Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-700"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Gender</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 appearance-none pointer-events-auto"
                                                >
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                                            <div className="relative custom-datepicker-report">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                                                <DatePicker
                                                    selected={formData.date}
                                                    onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="dd/mm/yyyy"
                                                    maxDate={new Date()}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none transition-all font-bold text-slate-700 pointer-events-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Birth Time</label>
                                        <TimeInput value={formData.time} onChange={handleTimeSelect} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Birth Place</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                                            <LocationSearch
                                                onLocationSelect={handleLocationSelect}
                                                defaultValue={formData.location}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <Sparkles size={24} /> Generate Professional Report
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Generated Report View */}
                {result && (
                    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
                        {/* Header Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
                            <button
                                onClick={() => setResult(null)}
                                className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
                            >
                                <RefreshCw size={20} /> New Report
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                                    <button
                                        onClick={() => setChartStyle('north')}
                                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${chartStyle === 'north' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        NORTH
                                    </button>
                                    <button
                                        onClick={() => setChartStyle('south')}
                                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${chartStyle === 'south' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        SOUTH
                                    </button>
                                </div>

                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isDownloading ? <><RefreshCw size={20} className="animate-spin" /> Generating PDF...</> : <><Download size={20} /> Download PDF Report</>}
                                </button>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div ref={reportRef} className="bg-white min-h-screen">

                            {/* Summary Section */}
                            <div data-pdf-section="header" className="py-4 px-6 md:py-6 md:px-10 border-b-4 border-indigo-600 bg-gradient-to-br from-indigo-50 to-white rounded-t-[3rem]">
                                {/* Brand Logo Centered */}
                                <div className="flex justify-center mb-6 pb-4 border-b border-indigo-100/50">
                                    {(logos.report || logos.desktop) ? (
                                        <img
                                            src={resolveImageUrl(logos.report || logos.desktop)}
                                            alt="Brand Logo"
                                            className="max-h-12 md:max-h-16 w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="text-2xl font-black text-indigo-900 tracking-tighter flex items-center gap-2">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
                                            WAY2ASTRO
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1">
                                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 mr-2 leading-none">{formData.name}</h1>

                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-100/80">
                                            <Calendar className="text-indigo-600 shrink-0" size={12} />
                                            <span className="text-xs font-black text-slate-600 whitespace-nowrap uppercase tracking-wide">{formatReportDate(formData.date)}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-100/80">
                                            <Clock className="text-indigo-600 shrink-0" size={12} />
                                            <span className="text-xs font-black text-slate-600 whitespace-nowrap uppercase tracking-wide">{formData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-100/80 max-w-[200px] md:max-w-[400px]">
                                            <MapPin className="text-indigo-600 shrink-0" size={12} />
                                            <span className="text-xs font-black text-slate-600 truncate" title={formData.location}>{formData.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm rounded-xl py-2 px-3 flex items-center gap-3">
                                            <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div className="flex flex-col items-start leading-none">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Verified Report</span>
                                                <span className="text-sm font-black text-indigo-700 tracking-tight">Way2Astro Premium</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="py-4 px-6 md:py-6 md:px-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-pdf-section="charts">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                <Star size={20} />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-800">Birth Chart (D1)</h2>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-inner">
                                            <KundliChart
                                                planets={result.kundli.planets}
                                                ascendantSign={Math.floor(result.kundli.houses.ascendant / 30) + 1}
                                                style={chartStyle}
                                                size={400}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                                <Star size={20} />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-800">Navamsha (D9)</h2>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-inner">
                                            <KundliChart
                                                planets={result.kundli.charts.D9}
                                                ascendantSign={getNavamsaSign(result.kundli.houses.ascendant)}
                                                style={chartStyle}
                                                size={400}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cosmic Identity Section */}
                            <div className="py-4 px-6 md:py-6 md:px-10" data-pdf-section="cosmic-identity">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="text-indigo-600" size={24} />
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cosmic Identity</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {[
                                        { label: "Thithi", value: result.kundli.panchang?.tithi || '-', icon: Moon, color: "text-purple-600", bg: "bg-purple-50" },
                                        { label: "Varam", value: result.kundli.panchang?.vara || '-', icon: Sun, color: "text-amber-600", bg: "bg-amber-50" },
                                        { label: "Rashi", value: SIGNS[result.kundli.planets.Moon.sign - 1], icon: Star, color: "text-blue-600", bg: "bg-blue-50" },
                                        { label: "Nakshatra", value: result.kundli.dashas.birthNakshatra, icon: Sparkles, color: "text-indigo-600", bg: "bg-indigo-50" },
                                        { label: "Pada", value: result.kundli.charts.D9.Moon.nakshatraPada, icon: Info, color: "text-emerald-600", bg: "bg-emerald-50" }
                                    ].map((item, idx) => (
                                        <div key={idx} className={`${item.bg} rounded-3xl p-3 border border-indigo-100 shadow-sm transition-all hover:shadow-md group`}>
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`${item.color} mb-1 bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                                                    <item.icon size={18} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</span>
                                                <span className="text-sm font-black text-slate-700 leading-tight">{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Planetary Positions Table */}
                            <div className="py-4 px-6 md:py-6 md:px-10" data-pdf-section="planetary-positions">
                                <div className="flex items-center gap-2 mb-4">
                                    <Star className="text-indigo-600" size={24} />
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Planetary Analysis</h2>
                                </div>
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Planet</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Longitude</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zodiac Sign</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Relation</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 uppercase font-black">
                                                {Object.entries(result.kundli.planets).map(([key, planet]) => (
                                                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-black text-xs shadow-sm transition-transform group-hover:scale-110 ${getPlanetColor(key)}`}>
                                                                    {key.charAt(0)}
                                                                </div>
                                                                <span className="text-slate-800 font-black">{key}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-800 font-bold">
                                                            {((planet.normDegree || planet.longitude || 0) % 30).toFixed(2)}°
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-800 font-bold">{SIGNS[planet.sign - 1]}</td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wide border shadow-sm inline-block min-w-[100px] text-center ${getRelationColor(planet.relation)}`}>
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

                            {/* Dasha Timeline */}
                            <div className="py-4 px-6 md:py-6 md:px-10" data-pdf-section="dasha">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-indigo-600" size={24} />
                                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Main Dasha Periods</h2>
                                    </div>
                                    <div className="px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                                        <span className="text-sm font-black text-indigo-700">60 Year Cycle</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.kundli.dashas.list.map((dasha, idx) => {
                                        const isActive = new Date() >= new Date(dasha.start) && new Date() <= new Date(dasha.end);
                                        return (
                                            <div key={idx} className={`relative group ${isActive ? 'scale-[1.02]' : ''}`}>
                                                {isActive && (
                                                    <div className="absolute -top-2 -right-2 z-10 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg rotate-3">
                                                        ACTIVE PERIOD
                                                    </div>
                                                )}
                                                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur ${isActive ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity`} />
                                                <div className={`relative bg-white border ${isActive ? 'border-indigo-500 shadow-md' : 'border-slate-100 shadow-sm'} p-5 rounded-3xl hover:shadow-xl transition-all flex items-center justify-between overflow-hidden`}>
                                                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 ${getPlanetColor(dasha.lord)}`} />
                                                    <div className="relative z-10">
                                                        <h3 className={`text-xl font-black mb-0.5 ${getPlanetColor(dasha.lord).split(' ')[1]}`}>{dasha.lord}</h3>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                                            {formatReportDate(new Date(dasha.start))} &nbsp; TO &nbsp; {formatReportDate(new Date(dasha.end))}
                                                        </p>
                                                    </div>
                                                    <div className="text-right relative z-10">
                                                        <span className="text-xs font-black text-slate-400 block mb-0.5">Duration</span>
                                                        <span className="text-base font-black text-slate-700">
                                                            {typeof dasha.duration === 'number' ? dasha.duration.toFixed(2).replace(/\.00$/, '') : dasha.duration} Yrs
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Active Dasha Interpretation */}
                                {result.kundli.dashas.list.find(d => new Date() >= new Date(d.start) && new Date() <= new Date(d.end))?.analysis && (
                                    <div className="mt-6 p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-inner">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">
                                                    {result.kundli.dashas.list.find(d => new Date() >= new Date(d.start) && new Date() <= new Date(d.end)).lord} Mahadasha Analysis
                                                </h3>
                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                                                    Current Period Interpretation
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 font-bold leading-relaxed whitespace-pre-line text-lg bg-white/50 p-6 rounded-3xl border border-white shadow-sm">
                                            {result.kundli.dashas.list.find(d => new Date() >= new Date(d.start) && new Date() <= new Date(d.end)).analysis.text}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Dosha Status */}
                            <div className="py-4 px-6 md:py-6 md:px-10" data-pdf-section="dosha">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="text-indigo-600" size={24} />
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dosha Analysis</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Mangal Dosha */}
                                    <div className={`p-5 rounded-[2.5rem] border ${result.dosha.mangalDosha.isMangalDosha ? 'bg-rose-50 border-rose-100 shadow-rose-100/50' : 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50'} shadow-lg text-center`}>
                                        <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${result.dosha.mangalDosha.isMangalDosha ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'} shadow-xl`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-0.5">Mangal Dosha</h3>
                                        <p className={`text-sm font-black uppercase tracking-widest ${result.dosha.mangalDosha.isMangalDosha ? 'text-rose-600' : 'text-emerald-700'}`}>
                                            {result.dosha.mangalDosha.isMangalDosha ? 'FOUND' : 'NOT FOUND'}
                                        </p>
                                    </div>

                                    {/* Kaalsarp Dosha */}
                                    <div className={`p-5 rounded-[2.5rem] border ${result.dosha.kaalsarpDosha.isPresent ? 'bg-rose-50 border-rose-100 shadow-rose-100/50' : 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50'} shadow-lg text-center`}>
                                        <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${result.dosha.kaalsarpDosha.isPresent ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'} shadow-xl`}>
                                            <Moon size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-0.5">Kaalsarp Dosha</h3>
                                        <p className={`text-sm font-black uppercase tracking-widest ${result.dosha.kaalsarpDosha.isPresent ? 'text-rose-600' : 'text-emerald-700'}`}>
                                            {result.dosha.kaalsarpDosha.isPresent ? 'FOUND' : 'NOT FOUND'}
                                        </p>
                                    </div>

                                    {/* Shani Sade Sati */}
                                    <div className={`p-5 rounded-[2.5rem] border ${result.dosha.sadeSati.isSadeSati ? 'bg-rose-50 border-rose-100 shadow-rose-100/50' : 'bg-emerald-50 border-emerald-100 shadow-emerald-100/50'} shadow-lg text-center`}>
                                        <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${result.dosha.sadeSati.isSadeSati ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'} shadow-xl`}>
                                            <Moon size={24} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 mb-0.5">Shani Sade Sati</h3>
                                        <p className={`text-sm font-black uppercase tracking-widest ${result.dosha.sadeSati.isSadeSati ? 'text-rose-600' : 'text-emerald-700'}`}>
                                            {result.dosha.sadeSati.isSadeSati ? 'ACTIVE' : 'INACTIVE'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Insights Section */}
                            <div className="py-4 px-6 md:py-6 md:px-10 mb-6" data-pdf-section="insights">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
                                        <Sun className="text-amber-300 mb-4 drop-shadow-lg" size={40} fill="currentColor" />
                                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60 block mb-1">Solar Identity</span>
                                        <h2 className="text-3xl font-black mb-1">{result.sunSign.name} Sun</h2>
                                        <p className="text-indigo-100 font-bold text-base leading-relaxed">
                                            "{result.sunSign.trait}"
                                        </p>
                                    </div>

                                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl -ml-12 -mb-12"></div>
                                        <Star className="text-indigo-400 mb-4 drop-shadow-lg" size={40} fill="currentColor" />
                                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60 block mb-1">Public Image</span>
                                        <h2 className="text-3xl font-black mb-1">{result.arudha?.signName || 'N/A'} Lagna</h2>
                                        <p className="text-slate-400 font-bold text-base leading-relaxed italic">
                                            "The Arudha Lagna (AL) indicates your status, perception in society, and how others view your existence."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div data-pdf-section="footer" className="py-6 px-8 text-center text-slate-400 text-[10px] font-bold leading-relaxed border-t border-slate-100">
                                <p>© {new Date().getFullYear()} Way2Astro Professional Consultation Services. All rights reserved.</p>
                                <p className="mt-2">This report is for informational purposes only. Astrological predictions are based on planetary positions and individual analysis.</p>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
