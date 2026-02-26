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

export default function YoginiDashaCalculator() {
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

    const handleCardClick = (dasha) => {
        if (viewStack.length >= 1) return; // Limit depth for Yogini (Mahadasha > Antardasha) - usually 2 levels enough for now

        // If subPeriods exist, use them. 
        if (dasha.subPeriods && dasha.subPeriods.length > 0) {
            setViewStack([...viewStack, dasha]);
        } else {
            toast.error("Sub-periods not available for this level.");
        }
    };

    const currentViewData = viewStack.length === 0 ? result?.list : viewStack[viewStack.length - 1].subPeriods;

    const calculateDasha = async (e) => {
        e.preventDefault();
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

            const res = await API.post('/astro/yogini-dasha', payload);

            if (res.data.success) {
                setResult(res.data.data);
            } else {
                toast.error("Failed to calculate Yogini Dasha. Please try again.");
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
                                Yogini <span className="text-indigo-400">Dasha</span>
                            </h1>

                            <p className="text-indigo-100/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                                Complete analysis of your Yogini Dasha cycles (36 years) and their influence on your life journey.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Yogini Dasha"
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
                                        <><Sparkles size={24} /> Reveal My Yogini Dasha</>
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
                                                <div>
                                                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                                        {selectedDashaForAnalysis.name} ({selectedDashaForAnalysis.lord}) Analysis
                                                    </h3>
                                                    <p className="text-white/40 text-sm mt-1 font-medium bg-white/5 inline-block px-3 py-1 rounded-md">
                                                        {formatDate(selectedDashaForAnalysis.start)} — {formatDate(selectedDashaForAnalysis.end)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDashaForAnalysis(null)}
                                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                                >
                                                    <X size={20} className="text-white/60" />
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="pl-4 border-l-4 border-indigo-500 bg-white/5 p-4 rounded-r-xl">
                                                    <p className="text-sm font-bold text-white leading-relaxed">
                                                        Your Birth Nakshatra is <span className="uppercase text-indigo-400">{result.birthNakshatra}</span>.
                                                    </p>
                                                </div>
                                                {/* Yogini specific interpretation could be added here if available */}
                                            </div>
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
                                            {viewStack.length === 0 ? `Yogini Dasha Cycle` :
                                                `${viewStack[0].name} Mahadasha (Antardasha)`}
                                        </h2>
                                        <p className="text-indigo-200/60 text-sm font-medium mt-1">
                                            Birth Nakshatra: <span className="text-white font-bold">{result.birthNakshatra}</span>
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
                                                        {item.name} <span className="text-xs opacity-50 ml-0.5">AD</span>
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setResult(null); setViewStack([]); }}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
                                    >
                                        <RefreshCw size={16} /> New Check
                                    </button>
                                </div>

                                {/* Current Level Table */}
                                <div className="overflow-hidden bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 text-indigo-200/60 text-sm uppercase tracking-wider">
                                                    <th className="p-6 font-semibold">Dasha Name</th>
                                                    <th className="p-6 font-semibold">Duration</th>
                                                    <th className="p-6 font-semibold">Start Date</th>
                                                    <th className="p-6 font-semibold">End Date</th>
                                                    <th className="p-6 font-semibold text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-white">
                                                {(currentViewData || []).map((dasha, idx) => (
                                                    <tr
                                                        key={idx}
                                                        onClick={() => viewStack.length === 0 ? handleCardClick(dasha) : setSelectedDashaForAnalysis(dasha)}
                                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                                    >
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                                    {dasha.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-lg">{dasha.name}</div>
                                                                    <div className="text-sm text-white/40">{dasha.lord}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 font-medium text-white/80">
                                                            {dasha.duration} Years
                                                        </td>
                                                        <td className="p-6 text-indigo-200/80 font-mono text-sm">
                                                            {formatDate(dasha.start)}
                                                        </td>
                                                        <td className="p-6 text-indigo-200/80 font-mono text-sm">
                                                            {formatDate(dasha.end)}
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-indigo-500 transition-colors">
                                                                <ArrowRight size={16} className="text-white/40 group-hover:text-white" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {currentViewData.length === 0 && (
                                        <div className="p-12 text-center text-white/40">
                                            No data available for this view.
                                        </div>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <PageContentSection slug="calculators/yogini-dasha" />
        </main >
    );
}
