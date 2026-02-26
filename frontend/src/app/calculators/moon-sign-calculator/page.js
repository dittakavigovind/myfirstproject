"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sparkles, RefreshCw, ArrowLeft, Send, User, Calendar, Clock, MapPin, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import CustomDateInput from '../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import LocationSearch from '../../../components/LocationSearch';
import TimeInput from '../../../components/TimeInput';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import ResultHeader from '../../../components/calculators/StandardResultHeader';

import PageContentSection from '../../../components/common/PageContentSection';
import { useBirthDetails } from '../../../context/BirthDetailsContext';

export default function MoonSignCalculator() {
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

    const calculateMoonSign = async (e) => {
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
                timezone: formData.timezone
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

            const res = await API.post('/astro/kundli', payload);

            if (res.data.success) {
                const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
                const moonData = res.data.data.planets.Moon;
                const sign = signs[moonData.sign - 1];

                const nakshatraName = res.data.data.dashas?.birthNakshatra || '-';
                const pada = res.data.data.charts?.D9?.Moon?.nakshatraPada || '';
                const nakshatraWithPada = pada ? `${nakshatraName}-${pada}` : nakshatraName;

                // Construct details from available dasha/panchang data
                const details = [
                    { item: 'Rashi', value: sign },
                    { item: 'Nakshatra', value: nakshatraWithPada },
                    { item: 'Tithi', value: res.data.data.panchang?.tithi || '-' },
                    { item: 'Vara', value: res.data.data.panchang?.vara || '-' },
                    { item: 'Degree', value: `${(moonData.longitude % 30).toFixed(2)}°` },
                    { item: 'Status', value: moonData.relation || 'Neutral' }
                ];

                setResult({
                    sign: sign,
                    details: details
                });
            } else {
                toast.error("Failed to calculate Moon Sign. Please try again.");
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
        <main className={`min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 overflow-x-hidden ${result ? 'bg-[#05070a]' : 'bg-slate-50'}`}>
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black shadow-2xl rounded-b-[3rem] z-0 overflow-hidden transform scale-x-[1.05]">
                        <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-indigo-200/60 hover:text-indigo-200 transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Calculators
                        </Link>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-6">
                                <Moon size={40} className="text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Moon Sign <span className="text-indigo-400">Calculator</span></h1>
                            <p className="text-indigo-100/70 max-w-xl mx-auto font-medium leading-relaxed">
                                Your Moon sign (Rashi) represents your soul, emotions, and inner personality in Vedic Astrology. Find yours with 100% precision.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <ResultHeader
                    title="Moon Sign"
                    name={formData.name}
                    date={formData.date}
                    time={formData.time?.toTimeString().slice(0, 5)}
                    place={formData.place}
                />
            )}

            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-indigo-50"
                        >
                            <form onSubmit={calculateMoonSign} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><User size={20} /></div>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Rahul Sharma"
                                                className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-400 rounded-2xl py-4 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                                        <div className="flex gap-4">
                                            {['male', 'female'].map((g) => (
                                                <label key={g} className="flex-1 relative cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        checked={formData.gender === g}
                                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                        className="peer sr-only"
                                                    />
                                                    <div className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${formData.gender === g ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                                                        <span className="font-bold capitalize text-sm">{g}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                        <div className="relative custom-datepicker-dark">

                                            <DatePicker customInput={<CustomDateInput placeholder='dd/mm/yyyy' Icon={Calendar} />} selected={formData.date} onChange={(date) => setFormData({ ...formData, date })} dateFormat="dd/MM/yyyy" className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-400 rounded-2xl py-4 px-6 text-slate-800 font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" wrapperClassName="w-full" showMonthDropdown showYearDropdown dropdownMode="select" calendarClassName="custom-datepicker-dark-cal" />
                                        </div>
                                    </div>
                                    <div className="group space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Time of Birth</label>
                                        <div className="flex items-center">
                                            <div className="mr-3 text-slate-300"><Clock size={20} /></div>
                                            <div className="flex-1">
                                                <TimeInput
                                                    value={formData.time}
                                                    onChange={(newTime) => setFormData({ ...formData, time: newTime })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Place of Birth</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-5 text-slate-300 z-10"><MapPin size={20} /></div>
                                        <div className="[&_input]:pl-14 [&_input]:py-5 [&_input]:bg-slate-50 [&_input]:rounded-2xl [&_input]:border-none [&_input]:font-bold">
                                            <LocationSearch
                                                onLocationSelect={handleLocationSelect}
                                                placeholder="Search City"
                                                defaultValue={formData.place}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Calculating Rashi...</>
                                    ) : (
                                        <><Sparkles size={24} /> Get Moon Sign</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-indigo-500/10 border border-white/10 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-24 -mt-24"></div>

                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="inline-block p-10 bg-indigo-50 rounded-full text-indigo-500 mb-10 shadow-inner"
                            >
                                <Moon size={100} fill="currentColor" />
                            </motion.div>

                            <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.4em] block mb-4">Your Vedic Rashi is</span>
                            <h2 className="text-7xl font-black text-white mb-8 tracking-tighter">{result.sign}</h2>

                            <div className="max-w-xl mx-auto bg-white/5 rounded-[2rem] p-8 border border-white/5 mb-10 text-left backdrop-blur-sm">
                                <h4 className="text-indigo-400 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Star size={16} fill="currentColor" /> Astrological Identity
                                </h4>
                                <div className="grid grid-cols-2 gap-y-4">
                                    {result.details?.slice(0, 6).map((item, idx) => (
                                        <div key={idx}>
                                            <p className="text-[10px] text-indigo-200/50 font-bold uppercase tracking-wider">{item.item}</p>
                                            <p className="text-white font-black">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setResult(null)}
                                    className="flex-1 bg-white/10 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/10"
                                >
                                    <RefreshCw size={20} /> New Calculation
                                </button>
                                <button className="flex-1 bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20">
                                    <Send size={20} /> Share My Rashi
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <PageContentSection slug="calculators/moon-sign-calculator" />
        </main>
    );
}

