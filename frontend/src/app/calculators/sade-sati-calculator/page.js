"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, RefreshCw, ArrowLeft, Send, User, Calendar, Clock, MapPin, ArrowRight, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationSearch from '../../../components/LocationSearch';
import TimeInput from '../../../components/TimeInput';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';

import PageContentSection from '../../../components/common/PageContentSection';
import { useBirthDetails } from '../../../context/BirthDetailsContext';

export default function SadeSatiCalculator() {
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

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            place: location.formattedAddress,
            lat: location.lat,
            lng: location.lng,
            timezone: location.timezone
        });
    };

    const calculateSadeSati = async (e) => {
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
            const dateStr = formData.date.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const timeStr = formData.time.toTimeString().slice(0, 5); // HH:mm

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

            const res = await API.post('/astro/dosha', payload);

            if (res.data.success) {
                setResult(res.data.data.sadeSati);
            } else {
                toast.error("Failed to calculate Sade Sati. Please try again.");
            }
        } catch (error) {
            console.error("Calculation Error:", error);
            const errorMsg = error.response?.data?.message || error.message || "An error occurred during calculation.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#05070a] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 overflow-x-hidden">
            {/* Hero Section / Standardized Result Header */}
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-950/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] z-0 transform scale-x-[1.05]">
                        {/* Animated Stars/Particles Background */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
                        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none animate-pulse"></div>
                        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none delay-700"></div>
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
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <Shield size={48} className="text-white relative z-10" />
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                                Shani <span className="text-indigo-400">Sade Sati</span>
                            </h1>

                            <p className="text-indigo-100/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                                Discover if you are currently under the influence of Saturn's 7.5-year transit and get personalized Vedic remedies for protection and growth.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Shani Sade Sati"
                    name={formData.name}
                    date={formData.date}
                    time={formData.time?.toTimeString().slice(0, 5)}
                    place={formData.place}
                />
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            <form onSubmit={calculateSadeSati} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Name Input */}
                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <User size={14} /> Full Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter your name"
                                                className="w-full bg-white/[0.05] border border-white/10 focus:bg-white/[0.08] focus:border-indigo-500/50 rounded-2xl py-5 px-6 text-white font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-white/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender selection */}
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

                                    {/* Date of Birth */}
                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <Calendar size={14} /> Date of Birth
                                        </label>
                                        <div className="relative custom-datepicker-dark">
                                            <DatePicker
                                                selected={formData.date}
                                                onChange={(date) => setFormData({ ...formData, date })}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Select Date"
                                                className="w-full bg-white/[0.05] border border-white/10 focus:bg-white/[0.08] focus:border-indigo-500/50 rounded-2xl py-5 px-6 text-white font-bold text-lg outline-none transition-all cursor-pointer"
                                                showYearDropdown
                                                scrollableYearDropdown
                                                yearDropdownItemNumber={100}
                                                maxDate={new Date()}
                                                calendarClassName="custom-datepicker-dark-cal"
                                            />
                                        </div>
                                    </div>

                                    {/* Time of Birth */}
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

                                {/* Place of Birth */}
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
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin relative z-10" /> Scanning the Cosmos...</>
                                    ) : (
                                        <><Sparkles size={24} className="relative z-10" /> Analyze Shani Influence</>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Main Result Card */}
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className={`inline-flex items-center justify-center w-28 h-28 rounded-full mb-8 ${result.isSadeSati ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/10' : 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10'
                                        } shadow-2xl border border-white/5`}
                                >
                                    {result.isSadeSati ? <AlertTriangle size={56} /> : <CheckCircle2 size={56} />}
                                </motion.div>

                                <span className="text-sm font-black text-indigo-300 uppercase tracking-[0.4em] block mb-4">Current Status</span>
                                <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                                    {result.isSadeSati ? 'Active Sade Sati' : 'No Active Sade Sati'}
                                </h2>

                                {result.isSadeSati && (
                                    <div className="inline-block px-8 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 font-black text-xl mb-10">
                                        {result.phase}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
                                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                                        <p className="text-indigo-300/50 text-xs font-black uppercase tracking-widest mb-2">Natal Moon Sign</p>
                                        <p className="text-white text-2xl font-black">{result.natalMoonSign}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                                        <p className="text-indigo-300/50 text-xs font-black uppercase tracking-widest mb-2">Transit Saturn</p>
                                        <p className="text-white text-2xl font-black">{result.transitSaturnSign}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-8">
                                    <p className="text-indigo-100/70 font-bold leading-loose text-lg italic">
                                        "{result.isSadeSati ? result.phaseDescription : 'Congratulations! You are not currently under the influence of Shani Sade Sati. This is a favorable time for launching new ventures and personal prosperity.'}"
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/10"
                                    >
                                        <RefreshCw size={20} /> New Analysis
                                    </button>
                                    <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 border border-indigo-500/30">
                                        <Send size={20} /> Share Result
                                    </button>
                                </div>
                            </div>

                            {/* Remedies Section */}
                            {result.isSadeSati && result.remedies.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gradient-to-br from-indigo-900/40 via-blue-900/20 to-transparent backdrop-blur-xl rounded-[3rem] p-10 md:p-14 border border-indigo-500/20 shadow-2xl"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <Shield size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white">Shani Remedies</h3>
                                            <p className="text-indigo-300/50 font-bold tracking-widest uppercase text-xs">Vedic Protection Guide</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.remedies.map((remedy, idx) => (
                                            <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start gap-4 hover:bg-white/[0.08] transition-colors group">
                                                <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-indigo-100/70 font-semibold text-base leading-relaxed">{remedy}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                                        <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                                        <p className="text-amber-500/80 text-sm font-bold">
                                            Note: Sade Sati is not always negative. It is a period of "karmic purification" that can lead to immense spiritual and professional growth if handled with discipline and honesty.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .custom-datepicker-dark .react-datepicker {
                    background-color: #0f131a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1.5rem;
                    color: white;
                    padding: 1rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .custom-datepicker-dark .react-datepicker__header {
                    background-color: transparent;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .custom-datepicker-dark .react-datepicker__current-month,
                .custom-datepicker-dark .react-datepicker__day-name,
                .custom-datepicker-dark .react-datepicker__day {
                    color: white;
                }
                .custom-datepicker-dark .react-datepicker__day:hover {
                    background-color: #4f46e5;
                    border-radius: 0.5rem;
                }
                .custom-datepicker-dark .react-datepicker__day--selected {
                    background-color: #4f46e5 !important;
                    border-radius: 0.5rem;
                }
                .custom-datepicker-dark .react-datepicker__day--keyboard-selected {
                    background-color: transparent;
                }
            `}</style>
            <PageContentSection slug="calculators/sade-sati-calculator" />
        </main>
    );
}
