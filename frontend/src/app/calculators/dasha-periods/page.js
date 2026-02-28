"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowLeft, Send, User, Calendar, Clock, MapPin, CheckCircle2, Star, Zap, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import CustomDateInput from '../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import LocationSearch from '../../../components/LocationSearch';
import TimeInput from '../../../components/TimeInput';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';
import PageContentSection from '../../../components/common/PageContentSection';
import { useBirthDetails } from '../../../context/BirthDetailsContext';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashaPeriodsCalculator() {
    const { user } = useAuth();
    const router = useRouter();

    // Use BirthDetailsContext
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        date: null,
        time: new Date(new Date().setHours(0, 0, 0, 0)),
        place: '',
        lat: null,
        lng: null,
        timezone: 5.5
    });

    useEffect(() => {
        if (isInitialized && birthDetails) {
            setFormData(prev => ({
                ...prev,
                name: birthDetails.name || prev.name,
                gender: birthDetails.gender || prev.gender,
                date: birthDetails.date ? new Date(birthDetails.date) : prev.date,
                time: (birthDetails.time && typeof birthDetails.time === 'string') ? (() => {
                    const d = new Date();
                    const [h, m] = birthDetails.time.split(':');
                    d.setHours(h, m, 0, 0);
                    return d;
                })() : prev.time,
                place: birthDetails.place || prev.place,
                lat: birthDetails.lat || prev.lat,
                lng: birthDetails.lng || prev.lng,
                timezone: birthDetails.timezone || prev.timezone
            }));
        }
    }, [isInitialized, birthDetails]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewStack, setViewStack] = useState([]);
    const [selectedDashaForAnalysis, setSelectedDashaForAnalysis] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [lordInterpretations, setLordInterpretations] = useState({});

    // Helper to calculate next level periods recursively
    const calculateNextLevel = (parent) => {
        const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
        const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];

        const parentLordIndex = dashaLords.indexOf(parent.lord);
        const subPeriods = [];
        let currentDate = new Date(parent.start);

        for (let i = 0; i < 9; i++) {
            const idx = (parentLordIndex + i) % 9;
            const subLord = dashaLords[idx];
            const subLordYears = dashaYears[idx];

            // Formula: (Parent Duration * SubLord Years) / 120
            const duration = (parent.duration * subLordYears) / 120;

            const endDate = new Date(currentDate);
            // Add duration accurately (years * 365.2425 days)
            const daysToAdd = duration * 365.2425;
            endDate.setTime(endDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

            const info = lordInterpretations[subLord];

            subPeriods.push({
                lord: subLord,
                start: currentDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                duration: duration,
                analysis: info?.analysis,
                remedies: info?.remedies || []
            });

            currentDate = endDate;
        }
        return subPeriods;
    };

    const handleCardClick = (dasha) => {
        if (viewStack.length >= 4) return; // Limit depth (Maha > Antar > Pratyantar > Sookshma > Prana)

        // If subPeriods already exist (from backend), use them. Otherwise calculate.
        const nextLevelData = dasha.subPeriods || calculateNextLevel(dasha);
        const enrichedDasha = { ...dasha, subPeriods: nextLevelData };

        setViewStack([...viewStack, enrichedDasha]);
    };

    const isDashaActive = (dasha) => {
        const now = new Date();
        const start = new Date(dasha.startISO || dasha.start);
        const end = new Date(dasha.endISO || dasha.end);
        return now >= start && now <= end;
    };

    const currentViewData = viewStack.length === 0 ? result : viewStack[viewStack.length - 1].subPeriods;

    const calculateDasha = async (e) => {
        e.preventDefault();

        // Auth Check
        if (!user) {
            localStorage.setItem('dasha_periods_form_backup', JSON.stringify(formData));
            toast.error("This is a Premium Feature. Please Login to generate Dasha Periods.");
            router.push('/login?redirect=/calculators/dasha-periods');
            return;
        }

        if (!formData.date || !formData.time) {
            toast.error("Please select both Date and Time of Birth");
            return;
        }

        if (!formData.lat || !formData.lng) {
            toast.error("Please select Place of Birth from the suggestions");
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

            // Persist for session
            setBirthDetails({
                name: formData.name,
                gender: formData.gender,
                date: formData.date,
                time: timeStr,
                place: formData.place,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone
            });

            // Using existing kundli endpoint which now includes dashas
            const res = await API.post('/astro/kundli', payload);

            if (res.data.success) {
                setResult(res.data.data.dashas.list);
                setCurrentPath(res.data.data.dashas.currentPath || []);
                setLordInterpretations(res.data.data.dashas.lordInterpretations || {});
            } else {
                toast.error("Failed to calculate Dasha periods. Please try again.");
            }
        } catch (error) {
            console.error("Calculation Error:", error);
            toast.error("An error occurred during calculation.");
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            place: location.formattedAddress,
            lat: location.lat,
            lng: location.lng,
            timezone: location.timezone
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}-${month}-${d.getFullYear()}`;
    };

    return (
        <main className="min-h-screen bg-[#05070a] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 overflow-x-hidden">
            {/* Hero Section / Standardized Result Header */}
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-950/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] z-0 transform scale-x-[1.05]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-indigo-300/60 hover:text-indigo-300 transition-all mb-8 font-bold text-sm uppercase tracking-widest group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Calculators
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                                Planetary <span className="text-indigo-400">Dasha Periods</span>
                            </h1>

                            <p className="text-indigo-100/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                                Complete analysis of your planetary periods (Vimshottari Dasha) and their influence on your life journey.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Planetary Dasha"
                    name={formData.name}
                    date={formData.date}
                    time={formData.time?.toTimeString().slice(0, 5)}
                    place={formData.place}
                />
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-4xl mx-auto"
                        >
                            <form onSubmit={calculateDasha} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <User size={14} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full bg-white/[0.05] border border-white/10 focus:bg-white/[0.08] focus:border-indigo-500/50 rounded-2xl py-5 px-6 text-white font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1 block">Gender</label>
                                        <div className="flex p-1 bg-white/[0.05] rounded-2xl border border-white/10 h-[68px]">
                                            {['male', 'female'].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, gender: g })}
                                                    className={`flex-1 rounded-xl font-bold capitalize transition-all ${formData.gender === g
                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white/60'
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <Calendar size={14} /> Date of Birth
                                        </label>
                                        <div className="relative custom-datepicker-dark">
                                            <DatePicker customInput={<CustomDateInput placeholder='Select Date' Icon={Calendar} />} selected={formData.date} onChange={(date) => setFormData({ ...formData, date })} dateFormat="dd/MM/yyyy" className="w-full bg-white/[0.05] border border-white/10 focus:bg-white/[0.08] focus:border-indigo-500/50 rounded-2xl py-5 px-6 text-white font-bold text-lg outline-none transition-all cursor-pointer" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} maxDate={new Date()} calendarClassName="custom-datepicker-dark-cal" />
                                        </div>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <Clock size={14} /> Time of Birth
                                        </label>
                                        <TimeInput
                                            value={formData.time}
                                            onChange={(time) => setFormData({ ...formData, time })}
                                            darkMode={true}
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                        <MapPin size={14} /> Place of Birth
                                    </label>
                                    <LocationSearch
                                        onLocationSelect={handleLocationSelect}
                                        darkMode={true}
                                        placeholder="Search your birth city..."
                                        defaultValue={formData.place}
                                    />
                                    {formData.place && (
                                        <p className="text-indigo-400 text-sm font-bold flex items-center gap-2 mt-2 px-1">
                                            <CheckCircle2 size={14} /> {formData.place}
                                        </p>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-black py-6 rounded-2xl shadow-3xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Calculating Cycle...</>
                                    ) : (
                                        <><Sparkles size={24} /> Reveal My Dasha Periods</>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-10"
                        >
                            {/* Analysis Modal */}
                            <AnimatePresence>
                                {selectedDashaForAnalysis && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                                        onClick={() => setSelectedDashaForAnalysis(null)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[80vh]"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
                                                        {selectedDashaForAnalysis.lord} {viewStack.length === 0 ? 'Mahadasha' :
                                                            viewStack.length === 1 ? 'Antardasha' :
                                                                viewStack.length === 2 ? 'Pratyantar' :
                                                                    viewStack.length === 3 ? 'Sookshma' : 'Prana'} Analysis
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-indigo-300/80 font-bold text-xs uppercase tracking-wider bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 w-fit">
                                                        <Calendar size={12} className="shrink-0" />
                                                        {formatDate(selectedDashaForAnalysis.start)} — {formatDate(selectedDashaForAnalysis.end)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDashaForAnalysis(null)}
                                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                                >
                                                    <X size={20} className="text-white/60" />
                                                </button>
                                            </div>

                                            {(selectedDashaForAnalysis.analysis || (selectedDashaForAnalysis.remedies && selectedDashaForAnalysis.remedies.length > 0)) ? (
                                                <div className="space-y-6">
                                                    {selectedDashaForAnalysis.analysis && (
                                                        <div className="space-y-4">
                                                            <div className="pl-4 border-l-4 border-indigo-500 bg-white/5 p-4 rounded-r-xl">
                                                                <p className="text-sm font-bold text-white leading-relaxed">
                                                                    Your <span className="uppercase text-indigo-400">{selectedDashaForAnalysis.lord}</span> is sitting in <span className="text-indigo-300">{selectedDashaForAnalysis.analysis.sign}</span> sign and <span className="text-indigo-300">{selectedDashaForAnalysis.analysis.house}th</span> house.
                                                                </p>
                                                            </div>
                                                            <div className="text-justify">
                                                                <p className="whitespace-pre-line text-indigo-100/90 text-sm leading-relaxed font-medium">
                                                                    {selectedDashaForAnalysis.analysis.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedDashaForAnalysis.remedies && selectedDashaForAnalysis.remedies.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                                                <Sparkles size={14} /> Suggested Remedies
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {selectedDashaForAnalysis.remedies.map((remedy, i) => (
                                                                    <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-colors group">
                                                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-500/40 transition-colors">
                                                                            <CheckCircle2 size={14} className="text-indigo-400" />
                                                                        </div>
                                                                        <p className="text-sm text-white/70 font-medium leading-relaxed group-hover:text-white/90 transition-colors">{remedy}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 px-6 bg-white/5 rounded-3xl border border-white/5">
                                                    <Zap size={40} className="text-white/10 mx-auto mb-4" />
                                                    <p className="text-white/60 font-bold">Comprehensive analysis details are still being updated for this very granular period.</p>
                                                    <p className="text-white/30 text-xs mt-2">Try viewing high-level levels for more details.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dasha Hierarchy Navigation */}
                            <div className="flex flex-col gap-6">
                                {/* Header & Breadcrumbs */}
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">
                                            {viewStack.length === 0 ? `${formData.name}'s Dasha Cycle` :
                                                viewStack.length === 1 ? `${viewStack[0].lord} Mahadasha (Antardasha)` :
                                                    viewStack.length === 2 ? `${viewStack[1].lord} Antardasha (Pratyantar)` :
                                                        viewStack.length === 3 ? `${viewStack[2].lord} Pratyantar (Sookshma)` :
                                                            `${viewStack[3].lord} Sookshma (Prana)`}
                                        </h2>
                                        <p className="text-indigo-200/60 text-sm font-medium mt-1">
                                            Analysis of your planetary periods and their influences
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-indigo-300/60">
                                            <button
                                                onClick={() => setViewStack([])}
                                                className={`hover:text-white transition-colors ${viewStack.length === 0 ? 'text-white font-bold' : ''}`}
                                            >
                                                Mahadasha
                                            </button>
                                            {viewStack.map((item, idx) => (
                                                <React.Fragment key={idx}>
                                                    <span>/</span>
                                                    <button
                                                        onClick={() => setViewStack(viewStack.slice(0, idx))}
                                                        className="hover:text-white hover:underline transition-colors"
                                                    >
                                                        {item.lord} <span className="text-xs opacity-50 ml-0.5">
                                                            {idx === 0 ? '' : idx === 1 ? 'AD' : idx === 2 ? 'PD' : 'SD'}
                                                        </span>
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                            {/* Show current level as active text if stack is not empty */}
                                            {viewStack.length > 0 && (
                                                <>
                                                    <span>/</span>
                                                    <span className="text-white font-bold">
                                                        {viewStack.length === 1 ? 'Antardasha' :
                                                            viewStack.length === 2 ? 'Pratyantar' :
                                                                viewStack.length === 3 ? 'Sookshma' :
                                                                    'Pranadasha'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setResult(null); setViewStack([]); setCurrentPath([]); }}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
                                    >
                                        <RefreshCw size={16} /> New Check
                                    </button>
                                </div>

                                {/* Present Dasha Summary */}
                                {currentPath.length > 0 && viewStack.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Zap size={80} className="text-indigo-400" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-indigo-300 font-bold text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <Zap size={14} className="animate-pulse" /> Your Present Planetary Influence
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
                                                {currentPath.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-wider">
                                                                {i === 0 ? 'Maha' : i === 1 ? 'Antar' : i === 2 ? 'Pratyantar' : i === 3 ? 'Sukshma' : 'Prana'}
                                                            </span>
                                                            <span className="text-lg font-black text-white">{p.lord}</span>
                                                        </div>
                                                        {i < currentPath.length - 1 && (
                                                            <div className="h-8 w-px bg-white/10 mx-2" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 flex gap-4">
                                                <button
                                                    onClick={() => setSelectedDashaForAnalysis(currentPath[currentPath.length - 1])}
                                                    className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                                >
                                                    View Detailed Interpretation
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Current Level Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(currentViewData || []).map((dasha, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedDashaForAnalysis(dasha)}
                                            className={`backdrop-blur-xl rounded-[2rem] p-8 border shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden ${isDashaActive(dasha)
                                                ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20'
                                                : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10'
                                                }`}
                                        >
                                            {isDashaActive(dasha) && (
                                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-bl-2xl flex items-center gap-1 shadow-lg">
                                                    <Zap size={10} fill="white" /> Active Now
                                                </div>
                                            )}

                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isDashaActive(dasha) && <ArrowRight size={20} className="text-white/20" />}
                                            </div>

                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block">
                                                        {viewStack.length === 0 ? 'Mahadasha' :
                                                            viewStack.length === 1 ? 'Antardasha' :
                                                                viewStack.length === 2 ? 'Pratyantar' :
                                                                    viewStack.length === 3 ? 'Sookshma' : 'Pranadasha'}
                                                    </span>
                                                    <h3 className="text-2xl font-black text-white">{dasha.lord}</h3>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <Star size={18} fill="currentColor" />
                                                </div>
                                            </div>

                                            <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg text-xs font-bold text-indigo-200/80 mb-6 tracking-wide w-full">
                                                <Calendar size={12} className="shrink-0" />
                                                <span className="truncate">{formatDate(dasha.start)} — {formatDate(dasha.end)}</span>
                                            </div>

                                            {/* Show Analysis only on Top Level or generally if available */}
                                            {dasha.analysis && viewStack.length === 0 && (
                                                <div className="mb-4 space-y-4">
                                                    <div className="pl-4 border-l-4 border-indigo-500 bg-white/5 p-4 rounded-r-xl">
                                                        <p className="text-sm font-bold text-white leading-relaxed">
                                                            Your <span className="uppercase text-indigo-400">{dasha.lord}</span> is sitting in <span className="text-indigo-300">{dasha.analysis.sign}</span> sign and <span className="text-indigo-300">{dasha.analysis.house}th</span> house.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-xs text-white/40 font-medium">Duration: {(dasha.duration * 12).toFixed(1)} months</span>
                                                {viewStack.length < 4 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCardClick(dasha);
                                                        }}
                                                        className={`text-xs font-bold transition-colors flex items-center gap-1 z-10 group-hover:translate-x-1 duration-300 ${isDashaActive(dasha) ? 'text-indigo-300 hover:text-white' : 'text-indigo-400 hover:text-indigo-300'}`}
                                                    >
                                                        View Sub-periods <ArrowRight size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <style jsx global>{`
                .custom-datepicker-dark-cal {
                    background-color: #0f131a !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 1.5rem !important;
                    color: white !important;
                    padding: 1rem !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
                    font-family: inherit !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__header {
                    background-color: #0f131a !important; /* Force dark background */
                    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                    padding-bottom: 1rem !important;
                    border-radius: 1.5rem 1.5rem 0 0 !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__current-month,
                .custom-datepicker-dark-cal .react-datepicker__day-name,
                .custom-datepicker-dark-cal .react-datepicker__day {
                    color: white !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__day:hover {
                    background-color: #4f46e5 !important;
                    border-radius: 50% !important;
                    color: white !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__day--selected {
                    background-color: #4f46e5 !important;
                    border-radius: 50% !important;
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.5) !important;
                    color: white !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__day--keyboard-selected {
                    background-color: rgba(255,255,255,0.1) !important;
                    border-radius: 50% !important;
                }
                /* Header Dropdowns (Month/Year) */
                .custom-datepicker-dark-cal .react-datepicker__year-read-view--down-arrow,
                .custom-datepicker-dark-cal .react-datepicker__month-read-view--down-arrow {
                    border-top-color: rgba(255,255,255,0.7) !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__year-read-view,
                .custom-datepicker-dark-cal .react-datepicker__month-read-view {
                    color: white !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__year-read-view:hover,
                .custom-datepicker-dark-cal .react-datepicker__month-read-view:hover {
                    color: #818cf8 !important;
                }
                
                /* Actual Dropdown Menus */
                .custom-datepicker-dark-cal .react-datepicker__year-dropdown,
                .custom-datepicker-dark-cal .react-datepicker__month-dropdown {
                    background-color: #1a1a1a !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 1rem !important;
                    overflow-y: auto !important;
                    max-height: 300px !important;
                    width: 40% !important; /* Reduced width to avoid covering everything */
                    left: 30% !important; /* Center it */
                    top: 100% !important;
                    z-index: 50 !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__year-option,
                .custom-datepicker-dark-cal .react-datepicker__month-option {
                    color: rgba(255,255,255,0.8) !important;
                    padding: 0.75rem !important;
                    transition: all 0.2s !important;
                    cursor: pointer !important;
                    background-color: #1a1a1a !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__year-option:hover,
                .custom-datepicker-dark-cal .react-datepicker__month-option:hover {
                    background-color: #4f46e5 !important;
                    color: white !important;
                }
                .custom-datepicker-dark-cal .react-datepicker__year-option--selected_year {
                     font-weight: bold !important;
                     color: #818cf8 !important;
                }
                /* Navigation Arrows */
                .custom-datepicker-dark-cal .react-datepicker__navigation-icon::before {
                    border-color: white !important;
                }
                
                /* Triangle Fixes for Dropdowns */
                .custom-datepicker-dark-cal .react-datepicker__triangle {
                    display: none !important;
                }
            `}</style>
            <PageContentSection slug="calculators/dasha-periods" />
        </main>
    );
}
