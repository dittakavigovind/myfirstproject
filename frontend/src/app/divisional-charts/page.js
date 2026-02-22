"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LocationSearch from '../../components/LocationSearch';
import TimeInput from '../../components/TimeInput';
import PageContentSection from '../../components/common/PageContentSection';
import { User, Calendar, Clock, MapPin, CheckCircle2, ArrowRight, Layers, Sparkles, Lock } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useBirthDetails } from '../../context/BirthDetailsContext';
import API from '@/lib/api';

export default function DivisionalChartsForm() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
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
    const [loading, setLoading] = useState(false);

    // Auth Check removed to allow form access


    // Auto-close native selects on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (document.activeElement && document.activeElement.tagName === 'SELECT') {
                document.activeElement.blur();
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Use BirthDetailsContext
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

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

    const currentYear = new Date().getFullYear();
    const maxDate = new Date(currentYear + 1, 11, 31);

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

        // Auth Check
        if (!user) {
            // Backup form data before redirecting
            localStorage.setItem('divisional_charts_form_backup', JSON.stringify(formData));

            toast.error("This is a Premium Feature. Please Login to generate charts.");
            router.push('/login?redirect=/divisional-charts');
            return;
        }

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
            const dateStr = formData.date.toLocaleDateString('en-CA');
            const timeStr = formData.time.toTimeString().slice(0, 5);

            const query = new URLSearchParams({
                date: dateStr,
                time: timeStr,
                lat: formData.lat,
                lng: formData.lng,
                place: formData.place,
                name: formData.name,
                gender: formData.gender,
                tz: formData.timezone
            }).toString();

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

            router.push(`/divisional-charts/result?${query}`);
        } catch (error) {
            console.error(error);
            toast.error('Error processing details');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans bg-slate-50 selection:bg-purple-100 selection:text-purple-900 pb-20 overflow-x-hidden">

            {/* Header Section */}
            <div className="relative text-white">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-sky-950 to-black shadow-2xl rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-0 overflow-hidden transform scale-x-[1.02]">
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center pt-10 pb-24 md:pb-32 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center text-center"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-purple-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-lg shadow-black/10">
                            ✨ Detailed Analysis
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
                            Divisional <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-sky-300">Charts</span>
                        </h1>
                        <p className="text-slate-300/90 max-w-xl text-sm md:text-base font-medium leading-relaxed">
                            Example the subtler aspects of your life with all 16 Varga Chakras (Shodashvarga), from Hora to Shashtyamsa.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-purple-900/10 border border-slate-100 relative"
                >
                    <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center">
                            <Layers className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Enter Birth Details</h2>
                            <p className="text-slate-500 font-medium">Accurate time is critical for higher divisional charts</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name Input */}
                        <div className="group space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all duration-300 font-bold"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    value={formData.name}
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
                                                ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-inner'
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
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors z-10">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <DatePicker
                                        selected={formData.date}
                                        onChange={(date) => setFormData({ ...formData, date })}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="dd/mm/yyyy"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-purple-500/10 focus:outline-none transition-all duration-300 font-bold"
                                        wrapperClassName="w-full"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        maxDate={maxDate}
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
                                <div className="relative [&_input]:pl-12 [&_input]:pt-4 [&_input]:pb-4 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-2xl [&_input]:w-full [&_input]:focus:bg-white [&_input]:focus:border-purple-500 [&_input]:focus:ring-4 [&_input]:focus:ring-purple-500/10 [&_input]:transition-all [&_input]:font-bold">
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Calculating Charts...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate Divisional Charts</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </motion.div>

                <PageContentSection slug="divisional-charts" />
            </div>
        </div>
    );
}
