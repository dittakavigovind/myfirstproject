"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LocationSearch from '../../components/LocationSearch';
import FAQDisplay from '../../components/FAQDisplay';
import { User, Calendar, Clock, MapPin, Search, CheckCircle2, ArrowRight, ShieldCheck, Star, Sparkles } from 'lucide-react';
import DatePicker from "react-datepicker";
import TimeInput from '../../components/TimeInput';
import "react-datepicker/dist/react-datepicker.css";
import { useBirthDetails } from '../../context/BirthDetailsContext';
import API from '@/lib/api';

import toast from 'react-hot-toast';

export default function KundliForm() {
    const router = useRouter();
    const [pageContent, setPageContent] = useState({ faqs: [], description: "" });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await API.get('/page-content/kundli');
                if (res.data.success && res.data.data) {
                    setPageContent({
                        faqs: res.data.data.faqs || [],
                        description: res.data.data.description || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch page content:", err);
            }
        };
        fetchContent();
    }, []);

    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        date: null,
        time: new Date(new Date().setHours(0, 0, 0, 0)),
        place: 'New Delhi, India',
        lat: 28.6139,
        lng: 77.2090,
        timezone: 5.5
    });

    // Populate form from context when initialized
    useEffect(() => {
        if (isInitialized && birthDetails) {
            setFormData(prev => ({
                ...prev,
                name: birthDetails.name || prev.name,
                gender: birthDetails.gender || prev.gender,
                date: birthDetails.date || prev.date,
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

    // Auto-close native selects (TimePicker) on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (document.activeElement && document.activeElement.tagName === 'SELECT') {
                document.activeElement.blur();
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get current year dynamically
    const currentYear = new Date().getFullYear();
    // Allow all past dates, so no minDate needed
    const maxDate = new Date(currentYear + 1, 11, 31); // Dec 31st of next year

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

        // Validation first - before setting loading state
        if (!formData.name) {
            toast.error("Please enter your name");
            return;
        }

        if (!formData.date || !formData.time) {
            toast.error("Please select both Date and Time of Birth");
            return;
        }

        setLoading(true);

        try {
            // Update Context with new details to persist for session
            setBirthDetails(formData);

            // Format Data for API (YYYY-MM-DD and HH:MM)
            // Use simple local date formatting to avoid UTC time zone shifts
            const dateStr = formData.date.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD in local time
            const timeStr = formData.time.toTimeString().slice(0, 5);

            const query = new URLSearchParams({
                date: dateStr,
                time: timeStr,
                lat: formData.lat,
                lng: formData.lng,
                name: formData.name,
                gender: formData.gender,
                tz: formData.timezone,
                place: formData.place // Add place to URL
            }).toString();

            router.push(`/kundli/result?${query}`);
        } catch (error) {
            console.error(error);
            toast.error('Error processing details');
            setLoading(false); // Only stop loading on error, otherwise we are navigating
        }
    };

    return (
        <div className="min-h-screen font-sans bg-slate-50 selection:bg-blue-100 selection:text-blue-900 pb-20 overflow-x-hidden">

            {/* Header Section */}
            <div className="relative text-white">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-0 overflow-hidden transform scale-x-[1.02]">
                    {/* Decorative Elements */}
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center pt-10 pb-24 md:pb-32 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 flex items-center gap-2 shadow-lg shadow-black/10">
                            <Sparkles size={12} className="text-astro-yellow fill-astro-yellow/20" />
                            <span className="text-astro-yellow text-[10px] font-bold tracking-[0.2em] uppercase">Vedic Astrology</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
                            Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300">Janam Kundli</span>
                        </h1>
                        <p className="text-slate-300/90 max-w-xl text-sm md:text-base font-medium leading-relaxed">
                            Unveil your destiny with precise birth chart calculations based on ancient Vedic principles.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Form Section */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10 border border-slate-100 relative"
                        >
                            <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Enter Birth Details</h2>
                                    <p className="text-slate-500 font-medium">All fields are required for accurate prediction</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Name Input */}
                                <div className="group space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Rahul Sharma"
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Gender Selection */}
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
                                                    p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-300
                                                    ${formData.gender === g
                                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-inner'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}
                                                `}>
                                                    <span className="text-lg">{g === 'male' ? '♂' : '♀'}</span>
                                                    <span className="font-bold capitalize text-sm tracking-wide">{g}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date Input */}
                                    <div className="group space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10">
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
                                                maxDate={maxDate}
                                                portalId="root-portal"
                                                popperClassName="!z-[100]"
                                                closeOnScroll={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Input */}
                                    <div className="group space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Time of Birth</label>
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

                                {/* Place Input */}
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
                                            />
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 pl-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span>Selected: <span className="font-bold text-slate-700">{formData.place}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full group relative overflow-hidden bg-gradient-to-r from-astro-yellow to-orange-400 hover:from-orange-400 hover:to-orange-500 text-slate-900 font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <div className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin"></div>
                                                <span>Analyzing Cosmic Positions...</span>

                                            </>
                                        ) : (
                                            <>
                                                <span>Generate Kundli</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Info Section (Sidebar) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* 100% Accurate Card - Redesigned (Light Theme) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group h-auto"
                        >
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50 rounded-full mix-blend-multiply filter blur-2xl opacity-70 -ml-10 -mb-10"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 transform group-hover:scale-110 transition-transform duration-500 rotate-3 text-white">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>

                                <h3 className="text-3xl font-black mb-3 text-slate-900">
                                    100% Accurate
                                </h3>

                                <div className="w-12 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full mb-6"></div>

                                <p className="text-slate-600 leading-loose text-lg mb-8 font-medium">
                                    Trusted by millions. We strictly use the <span className="font-bold text-slate-900 border-b-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-colors">Swiss Ephemeris</span>, the gold standard in astrological calculations used by NASA.
                                </p>

                                <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-inner">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700 shadow-sm relative z-10">
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-amber-400 text-sm mb-1">
                                            <Star className="w-4 h-4 fill-current text-amber-400" />
                                            <Star className="w-4 h-4 fill-current text-amber-400" />
                                            <Star className="w-4 h-4 fill-current text-amber-400" />
                                            <Star className="w-4 h-4 fill-current text-amber-400" />
                                            <Star className="w-4 h-4 fill-current text-amber-400" />
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">10k+ Verified Users</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: FAQ Display handles its own layout */}
            <FAQDisplay faqs={pageContent.faqs} description={pageContent.description} />
        </div>
    );
}
