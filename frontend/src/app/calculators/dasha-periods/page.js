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
        <main className="min-h-screen bg-[#f8fafe] font-sans selection:bg-yellow-500/30 selection:text-[#0E1A2B] pb-24 overflow-x-hidden text-[#0E1A2B]">
            {/* Hero Section / Standardized Result Header */}
            {!result ? (
                <div className="relative overflow-hidden bg-[#f8fafe]">
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 via-white to-white z-0 transform scale-x-[1.05]">
                        <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-yellow-100/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#0E1A2B] transition-all mb-8 font-bold text-sm uppercase tracking-widest group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Calculators
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none text-[#0E1A2B]">
                                Planetary <span className="text-yellow-500">Dasha Periods</span>
                            </h1>

                            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
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
                    darkMode={false}
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
                            className="bg-white rounded-[2.5rem] p-8 md:p-14 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-4xl mx-auto"
                        >
                            <form onSubmit={calculateDasha} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                            <User size={14} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-yellow-500 rounded-2xl py-5 px-6 text-[#0E1A2B] font-bold text-lg focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 block">Gender</label>
                                        <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-200 h-[68px]">
                                            {['male', 'female'].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, gender: g })}
                                                    className={`flex-1 rounded-xl font-bold capitalize transition-all ${formData.gender === g
                                                        ? 'bg-[#0E1A2B] text-white shadow-lg'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                            <Calendar size={14} /> Date of Birth
                                        </label>
                                        <div className="relative custom-datepicker-light">
                                            <DatePicker
                                                customInput={<CustomDateInput placeholder='Select Date' Icon={Calendar} darkMode={false} />}
                                                selected={formData.date}
                                                onChange={(date) => setFormData({ ...formData, date })}
                                                dateFormat="dd/MM/yyyy"
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-yellow-500 rounded-2xl py-5 px-6 text-[#0E1A2B] font-bold text-lg outline-none transition-all cursor-pointer"
                                                showYearDropdown
                                                scrollableYearDropdown
                                                yearDropdownItemNumber={100}
                                                maxDate={new Date()}
                                                calendarClassName="custom-datepicker-report"
                                            />
                                        </div>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                            <Clock size={14} /> Time of Birth
                                        </label>
                                        <TimeInput
                                            value={formData.time}
                                            onChange={(time) => setFormData({ ...formData, time })}
                                            darkMode={false}
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        <MapPin size={14} /> Place of Birth
                                    </label>
                                    <LocationSearch
                                        onLocationSelect={handleLocationSelect}
                                        darkMode={false}
                                        placeholder="Search your birth city..."
                                        defaultValue={formData.place}
                                    />
                                    {formData.place && (
                                        <p className="text-yellow-600 text-sm font-bold flex items-center gap-2 mt-2 px-1">
                                            <CheckCircle2 size={14} /> {formData.place}
                                        </p>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-[#fbbf24] hover:bg-yellow-500 text-[#0E1A2B] font-black py-6 rounded-2xl shadow-xl shadow-yellow-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
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
                                            className="bg-white border border-slate-100 rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[80vh]"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-black text-[#0E1A2B] flex items-center gap-2 mb-2">
                                                        {selectedDashaForAnalysis.lord} {viewStack.length === 0 ? 'Mahadasha' :
                                                            viewStack.length === 1 ? 'Antardasha' :
                                                                viewStack.length === 2 ? 'Pratyantar' :
                                                                    viewStack.length === 3 ? 'Sookshma' : 'Prana'} Analysis
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-yellow-700 font-bold text-xs uppercase tracking-wider bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 w-fit">
                                                        <Calendar size={12} className="shrink-0" />
                                                        {formatDate(selectedDashaForAnalysis.start)} — {formatDate(selectedDashaForAnalysis.end)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDashaForAnalysis(null)}
                                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                                >
                                                    <X size={20} className="text-slate-400" />
                                                </button>
                                            </div>

                                            {(selectedDashaForAnalysis.analysis || (selectedDashaForAnalysis.remedies && selectedDashaForAnalysis.remedies.length > 0)) ? (
                                                <div className="space-y-6">
                                                    {selectedDashaForAnalysis.analysis && (
                                                        <div className="space-y-4">
                                                            <div className="pl-4 border-l-4 border-[#0E1A2B] bg-slate-50 p-4 rounded-r-xl">
                                                                <p className="text-sm font-bold text-[#0E1A2B] leading-relaxed">
                                                                    Your <span className="uppercase text-yellow-600">{selectedDashaForAnalysis.lord}</span> is sitting in <span className="text-indigo-900">{selectedDashaForAnalysis.analysis.sign}</span> sign and <span className="text-indigo-900">{selectedDashaForAnalysis.analysis.house}th</span> house.
                                                                </p>
                                                            </div>
                                                            <div className="text-justify">
                                                                <p className="whitespace-pre-line text-slate-600 text-sm leading-relaxed font-medium">
                                                                    {selectedDashaForAnalysis.analysis.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedDashaForAnalysis.remedies && selectedDashaForAnalysis.remedies.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h4 className="text-[#0E1A2B] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                                                <Sparkles size={14} className="text-yellow-500" /> Suggested Remedies
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {selectedDashaForAnalysis.remedies.map((remedy, i) => (
                                                                    <div key={i} className="flex gap-3 bg-[#f8fafe] p-4 rounded-2xl border border-slate-100 hover:border-yellow-200 transition-colors group">
                                                                        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-yellow-200 transition-colors">
                                                                            <CheckCircle2 size={14} className="text-yellow-600" />
                                                                        </div>
                                                                        <p className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-[#0E1A2B] transition-colors">{remedy}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 px-6 bg-slate-50 rounded-3xl border border-dotted border-slate-200">
                                                    <Zap size={40} className="text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-500 font-bold">Comprehensive analysis details are still being updated for this very granular period.</p>
                                                    <p className="text-slate-400 text-xs mt-2">Try viewing high-level levels for more details.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dasha Hierarchy Navigation */}
                            <div className="flex flex-col gap-6">
                                {/* Present Dasha Summary - MOVED PERSISTENTLY OUTSIDE */}
                                {currentPath.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#0E1A2B] p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Zap size={100} className="text-yellow-400" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-yellow-500 font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                <Zap size={14} className="animate-pulse fill-yellow-500" /> Your Present Planetary Influence
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-y-6 gap-x-10">
                                                {currentPath.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                                                                {i === 0 ? 'Maha' : i === 1 ? 'Antar' : i === 2 ? 'Pratyantar' : i === 3 ? 'Sukshma' : 'Prana'}
                                                            </span>
                                                            <span className="text-2xl font-black text-white">{p.lord}</span>
                                                        </div>
                                                        {i < currentPath.length - 1 && (
                                                            <div className="h-10 w-px bg-white/10 mx-2" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-8 flex gap-4">
                                                <button
                                                    onClick={() => setSelectedDashaForAnalysis(currentPath[currentPath.length - 1])}
                                                    className="text-sm bg-yellow-500 hover:bg-yellow-400 text-[#0E1A2B] font-black px-8 py-3 rounded-xl transition-all shadow-xl shadow-yellow-500/20"
                                                >
                                                    View Detailed Interpretation
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Header & Breadcrumbs */}
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                                    <div className="text-center md:text-left">
                                        <h2 className="text-2xl font-black text-[#0E1A2B]">
                                            {viewStack.length === 0 ? `${formData.name}'s Dasha Cycle` :
                                                viewStack.length === 1 ? `${viewStack[0].lord} Mahadasha (Antardasha)` :
                                                    viewStack.length === 2 ? `${viewStack[1].lord} Antardasha (Pratyantar)` :
                                                        viewStack.length === 3 ? `${viewStack[2].lord} Pratyantar (Sookshma)` :
                                                            `${viewStack[3].lord} Sookshma (Prana)`}
                                        </h2>
                                        <p className="text-slate-500 text-sm font-medium mt-1">
                                            Analysis of your planetary periods and their influences
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3 text-sm font-bold text-slate-400">
                                            <button
                                                onClick={() => setViewStack([])}
                                                className={`hover:text-[#0E1A2B] transition-colors ${viewStack.length === 0 ? 'text-[#0E1A2B] font-black' : ''}`}
                                            >
                                                Mahadasha
                                            </button>
                                            {viewStack.map((item, idx) => (
                                                <React.Fragment key={idx}>
                                                    <span className="opacity-30">/</span>
                                                    <button
                                                        onClick={() => setViewStack(viewStack.slice(0, idx))}
                                                        className="hover:text-[#0E1A2B] hover:underline transition-colors"
                                                    >
                                                        {item.lord} <span className="text-[10px] opacity-60 ml-0.5">
                                                            {idx === 0 ? '' : idx === 1 ? 'AD' : idx === 2 ? 'PD' : 'SD'}
                                                        </span>
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                            {/* Show current level as active text if stack is not empty */}
                                            {viewStack.length > 0 && (
                                                <>
                                                    <span className="opacity-30">/</span>
                                                    <span className="text-[#0E1A2B] font-black">
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
                                        className="px-8 py-3 bg-slate-50 hover:bg-slate-100 text-[#0E1A2B] font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-2 text-sm shadow-sm"
                                    >
                                        <RefreshCw size={16} /> New Check
                                    </button>
                                </div>

                                {/* Current Level Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(currentViewData || []).map((dasha, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedDashaForAnalysis(dasha)}
                                            className={`rounded-[2rem] p-8 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden ${isDashaActive(dasha)
                                                ? 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-400/20 shadow-yellow-500/10'
                                                : 'bg-white hover:border-slate-300 border-slate-100'
                                                }`}
                                        >
                                            {isDashaActive(dasha) && (
                                                <div className="absolute top-0 right-0 bg-yellow-500 text-[#0E1A2B] text-[10px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-bl-2xl flex items-center gap-1 shadow-md">
                                                    <Zap size={10} fill="currentColor" /> Active Now
                                                </div>
                                            )}

                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isDashaActive(dasha) && <ArrowRight size={20} className="text-slate-200" />}
                                            </div>

                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">
                                                        {viewStack.length === 0 ? 'Mahadasha' :
                                                            viewStack.length === 1 ? 'Antardasha' :
                                                                viewStack.length === 2 ? 'Pratyantar' :
                                                                    viewStack.length === 3 ? 'Sookshma' : 'Pranadasha'}
                                                    </span>
                                                    <h3 className="text-2xl font-black text-[#0E1A2B]">{dasha.lord}</h3>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDashaActive(dasha) ? 'bg-yellow-500 text-[#0E1A2B]' : 'bg-slate-50 text-slate-400'}`}>
                                                    <Star size={18} fill="currentColor" />
                                                </div>
                                            </div>

                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold mb-6 tracking-wide w-full ${isDashaActive(dasha) ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-50 text-slate-500'}`}>
                                                <Calendar size={12} className="shrink-0" />
                                                <span className="truncate">{formatDate(dasha.start)} — {formatDate(dasha.end)}</span>
                                            </div>

                                            {/* Show Analysis only on Top Level or generally if available */}
                                            {dasha.analysis && viewStack.length === 0 && (
                                                <div className="mb-4 space-y-4">
                                                    <div className="pl-4 border-l-4 border-[#0E1A2B] bg-slate-50 p-4 rounded-r-xl">
                                                        <p className="text-sm font-bold text-[#0E1A2B] leading-relaxed">
                                                            Your <span className="uppercase text-yellow-600">{dasha.lord}</span> is sitting in <span className="text-slate-600">{dasha.analysis.sign}</span> sign and <span className="text-slate-600">{dasha.analysis.house}th</span> house.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`mt-4 pt-4 border-t flex justify-between items-center ${isDashaActive(dasha) ? 'border-yellow-200' : 'border-slate-50'}`}>
                                                <span className="text-xs text-slate-400 font-bold">Duration: {(dasha.duration * 12).toFixed(1)} months</span>
                                                {viewStack.length < 4 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCardClick(dasha);
                                                        }}
                                                        className={`text-xs font-black transition-colors flex items-center gap-1 z-10 group-hover:translate-x-1 duration-300 ${isDashaActive(dasha) ? 'text-yellow-700 hover:text-yellow-900' : 'text-slate-400 hover:text-[#0E1A2B]'}`}
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
                .custom-datepicker-light .react-datepicker-wrapper { width: 100%; }
                
                .custom-datepicker-report .react-datepicker {
                    background-color: white !important;
                    border: 1px solid #f1f5f9 !important;
                    border-radius: 1.5rem !important;
                    padding: 1.5rem !important;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15) !important;
                    font-family: inherit !important;
                }
                .custom-datepicker-report .react-datepicker__header {
                    background-color: white !important;
                    border-bottom: 2px solid #f8fafc !important;
                    padding-bottom: 1rem !important;
                }
                .custom-datepicker-report .react-datepicker__current-month {
                    color: #0E1A2B !important;
                    font-weight: 900 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .custom-datepicker-report .react-datepicker__day {
                    color: #475569 !important;
                    font-weight: 600 !important;
                }
                .custom-datepicker-report .react-datepicker__day:hover {
                    background-color: #fefce8 !important;
                    color: #eab308 !important;
                    border-radius: 50% !important;
                }
                .custom-datepicker-report .react-datepicker__day--selected {
                    background-color: #fbbf24 !important;
                    color: #0E1A2B !important;
                    border-radius: 50% !important;
                }
            `}</style>
            <PageContentSection slug="calculators/dasha-periods" />
        </main>
    );
}
