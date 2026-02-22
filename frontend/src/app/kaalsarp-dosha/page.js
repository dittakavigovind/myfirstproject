"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '@/lib/api';
import { useBirthDetails } from '../../context/BirthDetailsContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Loader2, Calendar, Clock, MapPin, AlertCircle, CheckCircle, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LocationSearch from '../../components/LocationSearch';
import TimeInput from '../../components/TimeInput';

export default function KaalsarpDoshaPage() {
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
                date: formData.date.toISOString(),
                time: formData.time,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
                name: formData.name,   // Passed but optional in backend Logic
                gender: formData.gender // Passed but optional in backend Logic
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

                setResult(data.data.kaalsarpDosha);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to calculate Kaalsarp Dosha");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-slate-800 to-black text-white py-20 px-6 rounded-b-[3rem] shadow-2xl mb-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                        Vedic Analysis
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Kaalsarp Dosha <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Calculator</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Discover if your chart is affected by the serpentine alignment of planets between Rahu and Ketu, and find remedies.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6">
                {/* Form Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 mb-12"
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
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-inner'
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
                                    <DatePicker
                                        selected={formData.date}
                                        onChange={(date) => setFormData({ ...formData, date })}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="dd/mm/yyyy"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 font-bold"
                                        wrapperClassName="w-full"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={new Date()}
                                        portalId="root-portal"
                                        popperClassName="!z-[100]"
                                        closeOnScroll={true}
                                    />
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
                                <div className="relative [&_input]:pl-12 [&_input]:pt-4 [&_input]:pb-4 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-2xl [&_input]:w-full [&_input]:focus:bg-white [&_input]:focus:border-indigo-500 [&_input]:focus:ring-4 [&_input]:focus:ring-indigo-500/10 [&_input]:transition-all [&_input]:font-bold">
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
                            className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-bold rounded-xl text-lg px-5 py-4 text-center mr-2 mb-2 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Analyze Kundli'}
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
                            className={`rounded-[2rem] p-8 md:p-10 shadow-2xl border ${result.hasDosha ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${result.hasDosha ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                    {result.hasDosha ? <AlertCircle size={40} /> : <CheckCircle size={40} />}
                                </div>

                                <h2 className={`text-3xl md:text-4xl font-black mb-4 ${result.hasDosha ? 'text-red-900' : 'text-emerald-900'}`}>
                                    {result.hasDosha ? 'Kaalsarp Dosha Detected' : 'No Kaalsarp Dosha'}
                                </h2>

                                <p className={`text-lg font-medium leading-relaxed max-w-2xl ${result.hasDosha ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {result.description}
                                </p>

                                {result.hasDosha && (
                                    <div className="mt-8 bg-white/60 p-6 rounded-2xl w-full">
                                        <h3 className="text-red-800 font-bold uppercase tracking-wider text-sm mb-2">Dosha Type</h3>
                                        <p className="text-xl font-black text-slate-800">{result.type}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
