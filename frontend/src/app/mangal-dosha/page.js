"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '@/lib/api';
import { useBirthDetails } from '../../context/BirthDetailsContext';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import { Loader2, Calendar, Clock, MapPin, AlertCircle, CheckCircle, Flame, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LocationSearch from '../../components/LocationSearch';
import TimeInput from '../../components/TimeInput';
import KundliChart from '../../components/KundliChart';

export default function MangalDoshaPage() {
    // Use BirthDetailsContext
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        date: new Date(),
        time: "12:00",
        place: 'New Delhi, India',
        lat: 28.6139,
        lng: 77.2090,
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

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [chartStyle, setChartStyle] = useState('south');

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            place: location.formattedAddress,
            lat: location.lat,
            lng: location.lng,
            timezone: location.timezone
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("Please enter your name");
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post('/astro/dosha', {
                date: formData.date.toLocaleDateString('en-CA'),
                time: formData.time.toTimeString().slice(0, 5),
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
                name: formData.name,
                gender: formData.gender
            });

            if (data.success) {
                // Persist for session
                setBirthDetails({
                    name: formData.name,
                    gender: formData.gender,
                    date: formData.date,
                    time: formData.time,
                    place: formData.place,
                    lat: formData.lat,
                    lng: formData.lng,
                    timezone: formData.timezone
                });

                setResult({
                    ...data.data.mangalDosha,
                    planets: data.data.planets,
                    houses: data.data.houses
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to calculate Mangal Dosha");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-rose-900 via-red-800 to-slate-900 text-white py-20 px-6 rounded-b-[3rem] shadow-2xl mb-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]"></div>

                {/* Animated Fire Effect (Abstract) */}
                <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] animate-pulse"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-red-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                        Mars Influence
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Mangal Dosha <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">Analysis</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Understand the influence of Mars (Mangal) on your horoscope and its impact on marriage and relationships.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* Form Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 mb-12 max-w-3xl mx-auto"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name & Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 z-10">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your name"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                <div className="flex gap-4">
                                    {['male', 'female'].map((g) => (
                                        <label key={g} className={`flex-1 relative cursor-pointer group`}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                checked={formData.gender === g}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="peer sr-only"
                                            />
                                            <div className={`
                                                p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all duration-300
                                                ${formData.gender === g
                                                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-inner'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}
                                            `}>
                                                <span className="font-bold capitalize text-sm tracking-wide">{g}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Birth Date</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 z-10">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <DatePicker customInput={<CustomDateInput placeholder='dd/mm/yyyy' Icon={Calendar} />} selected={formData.date} onChange={(date) => setFormData({ ...formData, date })} dateFormat="dd/MM/yyyy" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 rounded-2xl py-4 px-6 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-300 font-bold" wrapperClassName="w-full" showMonthDropdown showYearDropdown dropdownMode="select" maxDate={new Date()} portalId="root-portal" popperClassName="!z-[100]" closeOnScroll={true} />
                                </div>
                            </div>
                            <div className="group space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Birth Time</label>
                                <div className="relative">
                                    <div className="flex items-center">
                                        <div className="mr-3 text-slate-400">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <TimeInput
                                                value={formData.time}
                                                onChange={(newTime) => setFormData({ ...formData, time: newTime })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Place of Birth */}
                        <div className="group space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Place of Birth</label>
                            <div className="relative z-20">
                                <div className="relative [&_input]:pl-12 [&_input]:pt-4 [&_input]:pb-4 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-2xl [&_input]:w-full [&_input]:focus:bg-white [&_input]:focus:border-red-500 [&_input]:focus:ring-4 [&_input]:focus:ring-red-500/10 [&_input]:transition-all [&_input]:font-bold">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 z-10">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <LocationSearch
                                        onLocationSelect={handleLocationSelect}
                                        placeholder="Search City (e.g. Mumbai)"
                                        darkMode={false}
                                        defaultValue={formData.place}
                                    />
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 pl-1">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Selected: <span className="font-bold text-slate-700">{formData.place}</span></span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-300 font-bold rounded-xl text-lg px-5 py-4 text-center mr-2 mb-2 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Check Mangal Dosha'}
                        </button>
                    </form>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto"
                        >
                            {/* Chart Section */}
                            <div className="bg-[#0f172a] rounded-[2rem] p-6 shadow-2xl border border-slate-800 flex flex-col justify-center items-center aspect-square relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                                {/* Header inside chart container */}
                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                                    <h3 className="text-amber-500 font-bold text-xs uppercase tracking-[0.2em]">Rashi Chart (D1)</h3>

                                    {/* Style Toggles */}
                                    <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50 backdrop-blur-sm">
                                        <button
                                            onClick={() => setChartStyle('south')}
                                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${chartStyle === 'south'
                                                ? 'bg-amber-500 text-slate-900 shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                }`}
                                        >
                                            South
                                        </button>
                                        <button
                                            onClick={() => setChartStyle('north')}
                                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${chartStyle === 'north'
                                                ? 'bg-amber-500 text-slate-900 shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                }`}
                                        >
                                            North
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full h-full p-4 mt-4 relative z-0">
                                    {result.planets && result.houses && (
                                        <KundliChart
                                            planets={result.planets}
                                            ascendantSign={Math.floor(result.houses.ascendant / 30) + 1}
                                            style={chartStyle}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Analysis Card */}
                            <div className={`rounded-[2rem] p-8 md:p-12 shadow-xl border-none flex flex-col justify-center text-center aspect-square ${result.isCancelled
                                ? 'bg-[#FFF9EE]' // Warm Cream for Nullified
                                : result.hasDosha
                                    ? 'bg-orange-50'
                                    : 'bg-emerald-50'
                                }`}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-xl ${result.isCancelled
                                        ? 'bg-[#F59E0B] text-white shadow-amber-500/20'
                                        : result.hasDosha
                                            ? 'bg-orange-500 text-white shadow-orange-500/20'
                                            : 'bg-emerald-500 text-white shadow-emerald-500/20'
                                        }`}>
                                        {result.isCancelled || result.hasDosha ? <Flame size={48} strokeWidth={1.5} /> : <CheckCircle size={48} strokeWidth={1.5} />}
                                    </div>

                                    <h2 className={`text-4xl font-[900] mb-6 tracking-tight ${result.isCancelled
                                        ? 'text-[#451a03]' // Dark Amber/Brown
                                        : result.hasDosha
                                            ? 'text-orange-900'
                                            : 'text-emerald-900'
                                        }`}>
                                        {result.isCancelled
                                            ? 'Mangal Dosha Nullified'
                                            : result.hasDosha
                                                ? 'Mangal Dosha Detected'
                                                : 'No Mangal Dosha'}
                                    </h2>

                                    <p className={`text-lg font-medium leading-relaxed mb-10 ${result.isCancelled
                                        ? 'text-[#78350f]'
                                        : result.hasDosha
                                            ? 'text-orange-800'
                                            : 'text-emerald-800'
                                        }`}>
                                        {result.description}
                                    </p>

                                    {(result.hasDosha || result.isCancelled) && (
                                        <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">From Lagna</span>
                                                <span className={`text-xl font-black ${result.factors.fromLagna.hasDosha ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {result.factors.fromLagna.hasDosha ? `House ${result.factors.fromLagna.marsHouse}` : 'Safe'}
                                                </span>
                                            </div>
                                            <div className="bg-rose-50 p-4 rounded-xl shadow-inner border border-rose-100">
                                                <span className="block text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-2">From Moon</span>
                                                <span className={`text-xl font-black ${result.factors.fromMoon.hasDosha ? 'text-rose-700' : 'text-slate-400'}`}>
                                                    {result.factors.fromMoon.hasDosha ? `House ${result.factors.fromMoon.marsHouse}` : 'Safe'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
