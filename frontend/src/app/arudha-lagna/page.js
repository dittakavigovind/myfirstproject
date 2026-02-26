"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '@/lib/api';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import { Loader2, Calendar, Clock, MapPin, Shield, Info, User, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { arudhaInterpretations } from '../../lib/arudhaInterpretations';
import LocationSearch from '../../components/LocationSearch';
import TimeInput from '../../components/TimeInput';
import PageContentSection from '../../components/common/PageContentSection';

export default function ArudhaLagnaPage() {
    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        date: new Date(),
        time: new Date(new Date().setHours(12, 0, 0, 0)),
        place: 'New Delhi, India',
        lat: 28.6139,
        lng: 77.2090,
        timezone: 5.5
    });

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
            // Format date as YYYY-MM-DD locally to avoid ISO string shifts
            const localDate = formData.date.getFullYear() + '-' +
                String(formData.date.getMonth() + 1).padStart(2, '0') + '-' +
                String(formData.date.getDate()).padStart(2, '0');

            const localTime = formData.time.toTimeString().slice(0, 5);

            const { data } = await API.post('/astro/arudha-lagna', {
                date: localDate,
                time: localTime,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
            });

            if (data.success) {
                setResult(data.data.arudhaLagna);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to calculate Arudha Lagna");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-900">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-slate-800 to-black text-white py-20 px-6 rounded-b-[3rem] shadow-2xl mb-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-astro-yellow fill-astro-yellow/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-astro-yellow">Jaimini Astrology</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        Arudha Lagna <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Calculator</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Discover your "Arudha Lagna" (AL), the mirror of your personality that shows how the world perceives your status and achievements.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Info/Description (Hidden on mobile or moved) */}
                <div className="lg:col-span-4 space-y-6 hidden lg:block">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                            <Info size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">What is Arudha Lagna?</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            While Lagna (Ascendant) represents your true self, Arudha Lagna represents your <strong>Maya</strong> or the external image you project. It is crucial for analyzing status, wealth, and public reputation.
                        </p>
                    </div>
                </div>

                {/* Right: Form & Results */}
                <div className="lg:col-span-8">
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

                                        <DatePicker customInput={<CustomDateInput placeholder='dd/mm/yyyy' Icon={Calendar} />} selected={formData.date} onChange={(date) => setFormData({ ...formData, date })} dateFormat="dd/MM/yyyy" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-2xl py-4 px-6 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all duration-300 font-bold" wrapperClassName="w-full" showMonthDropdown showYearDropdown dropdownMode="select" maxDate={new Date()} portalId="root-portal" popperClassName="!z-[100]" />
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
                                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-bold rounded-xl text-lg px-5 py-4 text-center transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Calculate Arudha Lagna'}
                            </button>
                        </form>
                    </motion.div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-indigo-100 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60"></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-indigo-200 rotate-12 group-hover:rotate-0 transition-transform">
                                        <Shield size={40} />
                                    </div>

                                    <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 backdrop-blur-md mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={12} className="text-indigo-600 fill-indigo-600/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Your Precise Result</span>
                                        </div>
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 font-serif">
                                        {result.signName}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lagna Sign</span>
                                            <span className="text-lg font-bold text-slate-700">{result.lagnaSignName} ({result.lagnaSign})</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lagna Lord</span>
                                            <span className="text-lg font-bold text-slate-700">{result.lagnaLord}</span>
                                        </div>
                                    </div>

                                    {result.exception && (
                                        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-left">
                                            <div className="p-1.5 bg-amber-500 rounded-lg text-white">
                                                <Info size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-amber-800 uppercase mb-1 tracking-wider">Adjustment Applied</p>
                                                <p className="text-xs text-amber-700 font-medium">{result.exception}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Detailed Interpretation */}
                                    {arudhaInterpretations[result.signName] && (
                                        <div className="mt-10 space-y-6 w-full text-left">
                                            {/* Key Traits */}
                                            <div className="flex flex-wrap gap-2 justify-center mb-6">
                                                {arudhaInterpretations[result.signName].keyTraits.map((trait, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100 flex items-center gap-1.5">
                                                        <Sparkles size={10} className="text-indigo-400" />
                                                        {trait}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                {/* Public Image */}
                                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                            <User size={16} />
                                                        </div>
                                                        <h4 className="font-bold text-slate-900">Public Image & Aura</h4>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {arudhaInterpretations[result.signName].publicImage}
                                                    </p>
                                                </div>

                                                {/* Career & Status */}
                                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                                            <Shield size={16} />
                                                        </div>
                                                        <h4 className="font-bold text-slate-900">Career & Status</h4>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {arudhaInterpretations[result.signName].careerStatus}
                                                    </p>
                                                </div>

                                                {/* Social Perception */}
                                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                                            <Star size={16} />
                                                        </div>
                                                        <h4 className="font-bold text-slate-900">Social Perception</h4>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {arudhaInterpretations[result.signName].socialPerception}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-indigo-900 text-white rounded-3xl w-full">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Info size={16} className="text-indigo-300" />
                                                    <h4 className="font-bold text-sm uppercase tracking-widest">Astro Tip</h4>
                                                </div>
                                                <p className="text-xs text-indigo-100 leading-relaxed opacity-80 italic">
                                                    Arudha Lagna shows how the world perceives you. To improve your reputation, align your actions with the positive traits of **{result.signName}**.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <PageContentSection slug="arudha-lagna" />
        </div>
    );
}
