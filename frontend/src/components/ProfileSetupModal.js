"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Clock, MapPin, Sparkles, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import LocationSearch from './LocationSearch';

export default function ProfileSetupModal() {
    const { user, updateUser, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        dob: '',
        tob: '',
        pob: '',
        lat: '',
        lng: '',
        timezone: ''
    });

    useEffect(() => {
        if (user) {
            // Check if profile is incomplete
            const needsSetup = !user ||
                !user.name ||
                user.name === 'User' ||
                !user.gender ||
                !user.birthDetails ||
                !user.birthDetails.date;

            setIsOpen(!!user && needsSetup);
            if (needsSetup && user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.name === 'User' ? '' : (user.name || '')
                }));
            }
        } else {
            setIsOpen(false);
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (!formData.name.trim()) return setError('Please enter your full name');
        if (!formData.gender) return setError('Please select your gender');
        if (!formData.dob) return setError('Please select your date of birth');
        if (!formData.tob) return setError('Please enter your time of birth');
        if (!formData.pob.trim()) return setError('Please enter your place of birth');
        if (!formData.lat || !formData.lng) return setError('Please select a valid location from the search');

        setLoading(true);
        try {
            // Mapping to backend schema birthDetails
            const updatePayload = {
                name: formData.name,
                gender: formData.gender,
                birthDetails: {
                    date: formData.dob,
                    time: formData.tob,
                    place: formData.pob,
                    lat: formData.lat,
                    lng: formData.lng,
                    timezone: formData.timezone
                }
            };

            const res = await API.put('/users/profile', updatePayload);
            if (res.data.success) {
                updateUser(res.data);
                setIsOpen(false);
            } else {
                setError(res.data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Update Profile Error:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop - Non-clickable */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl"
            >
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-br from-indigo-900 via-slate-900 to-black relative overflow-hidden rounded-t-[2.5rem] flex flex-col items-center justify-center p-6 text-center">
                    <div className="absolute top-[-50%] left-[-10%] w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-48 h-48 rounded-full bg-fuchsia-500/10 blur-3xl"></div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10"
                    >
                        <span className="inline-block py-0.5 px-3 rounded-full bg-white/5 border border-white/10 text-astro-yellow text-[10px] font-bold tracking-[0.15em] uppercase mb-1 backdrop-blur-md">
                            ✨ Final Step
                        </span>
                        <h2 className="text-xl font-black text-white">Complete Your Profile</h2>
                        <p className="text-indigo-200/60 text-[10px] font-medium mt-1 uppercase tracking-widest">To access your personalized predictions</p>
                    </motion.div>
                </div>

                <div className="px-8 pt-6 pb-12 overflow-y-auto max-h-[calc(100vh-160px)]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-2 rounded-r-lg text-xs font-bold mb-6 animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">What should we call you?</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:font-normal"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Gender Selection */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['male', 'female', 'other'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`py-2.5 text-xs font-black uppercase rounded-xl transition-all border ${formData.gender === g
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Birth Details Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Birth Date</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Calendar className="w-4 h-4" /></div>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl py-3 pl-11 pr-4 text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Birth Time</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Clock className="w-4 h-4" /></div>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-2xl py-3 pl-11 pr-4 text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                                        value={formData.tob}
                                        onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Birth Place with Autocomplete */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Birth Place</label>
                            <div className="relative group">
                                <LocationSearch
                                    onLocationSelect={(loc) => setFormData({
                                        ...formData,
                                        pob: loc.formattedAddress,
                                        lat: loc.lat,
                                        lng: loc.lng,
                                        timezone: loc.timezone
                                    })}
                                    placeholder="Search Birth City..."
                                    showLeftIcon={true}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transform transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Enter Path to Destiny
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={logout}
                            className="w-full text-[10px] text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mt-4"
                        >
                            <LogOut size={12} /> Log Out instead
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
