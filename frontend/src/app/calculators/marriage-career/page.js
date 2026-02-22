"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Heart, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import API from '../../../lib/api';
import LocationSearch from '../../../components/LocationSearch';

import PageContentSection from '../../../components/common/PageContentSection';

const MarriageCareerInput = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        day: '',
        month: '',
        year: '',
        hour: '',
        minute: '',
        lat: '',
        lng: '',
        city: '',
        timezone: 5.5
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCitySelect = (cityData) => {
        setFormData({
            ...formData,
            city: cityData.formattedAddress || cityData.city,
            lat: cityData.lat,
            lng: cityData.lng,
            timezone: cityData.timezone || 5.5
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const queryParams = new URLSearchParams({
                date: `${formData.year}-${formData.month}-${formData.day}`,
                time: `${formData.hour}:${formData.minute}`,
                lat: formData.lat,
                lng: formData.lng,
                tz: formData.timezone,
                gender: formData.gender,
                city: formData.city, // Pass city name for display
                name: formData.name
            }).toString();

            router.push(`/calculators/marriage-career/result?${queryParams}`);
        } catch (error) {
            console.error("Error redirecting:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-200">
                        <div className="flex -space-x-1">
                            <Heart className="w-6 h-6 text-white" />
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Marriage & Career Timing</h1>
                    <p className="mt-2 text-slate-600">Discover your most favorable periods for marriage and professional growth through Vedic Astrology.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... (form content) ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'male' })}
                                            className={`py-3 px-4 rounded-lg border font-medium transition-all ${formData.gender === 'male' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            Male
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'female' })}
                                            className={`py-3 px-4 rounded-lg border font-medium transition-all ${formData.gender === 'female' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            Female
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Birth Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <input
                                        type="number"
                                        name="day"
                                        placeholder="DD"
                                        min="1"
                                        max="31"
                                        required
                                        className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        value={formData.day}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="number"
                                        name="month"
                                        placeholder="MM"
                                        min="1"
                                        max="12"
                                        required
                                        className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        value={formData.month}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="number"
                                        name="year"
                                        placeholder="YYYY"
                                        required
                                        className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        value={formData.year}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Birth Time */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time of Birth</label>
                                <div className="grid grid-cols-2 gap-3 relative">
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="number"
                                            name="hour"
                                            placeholder="HH (0-23)"
                                            min="0"
                                            max="23"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.hour}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        name="minute"
                                        placeholder="MM"
                                        min="0"
                                        max="59"
                                        required
                                        className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.minute}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Birth Place */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Place of Birth</label>
                                <LocationSearch onLocationSelect={handleCitySelect} defaultValue={formData.city} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.city}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    'Get Predictions'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8 mb-8">
                    Calculated using Chitia Paksha Ayanamsa & Vimshottari Dasha System
                </p>

                <PageContentSection slug="marriage-career" />
            </div>
        </div>
    );
};

export default MarriageCareerInput;
