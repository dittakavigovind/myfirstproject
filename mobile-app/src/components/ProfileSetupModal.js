"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, MapPin, Sparkles, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import LocationSearch from './LocationSearch';
import toast from 'react-hot-toast';

export default function ProfileSetupModal() {
    const { user, setUser, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        date: '',
        time: '',
        place: '',
        lat: '',
        lng: '',
        timezone: 5.5
    });

    useEffect(() => {
        if (user) {
            // Astrologers handle their profile setup differently in their profile edit section.
            // This modal is mainly for regular seekers to set up their birth details.
            if (user.role === 'astrologer') {
                setIsOpen(false);
                return;
            }

            const needsSetup = !user.name ||
                user.name === 'User' ||
                !user.gender ||
                !user.birthDetails ||
                !user.birthDetails.date ||
                !user.birthDetails.time;

            setIsOpen(needsSetup);
            
            if (needsSetup) {
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

        if (!formData.name.trim()) return setError('Please enter your full name');
        if (!formData.gender) return setError('Please select your gender');
        if (!formData.date) return setError('Please select your date of birth');
        if (!formData.time) return setError('Please enter your time of birth');
        if (!formData.place.trim()) return setError('Please enter your place of birth');
        if (!formData.lat || !formData.lng) return setError('Please select a valid location from the search');

        setLoading(true);
        try {
            const updatePayload = {
                name: formData.name,
                gender: formData.gender,
                birthDetails: {
                    date: formData.date,
                    time: formData.time,
                    place: formData.place,
                    lat: formData.lat,
                    lng: formData.lng,
                    timezone: formData.timezone
                }
            };

            const res = await api.put('/users/profile', updatePayload);
            if (res.data.success) {
                setUser(res.data.user || res.data);
                setIsOpen(false);
                // Optionally redirect to kundli creation or just close the modal
                toast.success('Profile completed successfully!');
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 pt-10 pb-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-electric-violet/20 via-slate-900 to-black relative p-6 text-center border-b border-white/5 shrink-0">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-electric-violet/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-solar-gold text-[10px] font-bold tracking-widest uppercase mb-2">
                            ✨ Final Step
                        </span>
                        <h2 className="text-xl font-black text-white">Complete Your Profile</h2>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">We need these precise details to calculate your astrological charts and predictions.</p>
                    </motion.div>
                </div>

                <div className="p-6 overflow-y-auto pb-8">
                    {error && (
                        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-r-xl text-xs font-bold mb-6 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Name */}
                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/50 font-medium placeholder:text-slate-600 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Gender</label>
                            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                                {['male', 'female', 'other'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${formData.gender === g
                                            ? 'bg-electric-violet text-white shadow-lg shadow-electric-violet/20'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 pl-1">
                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Birth Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/50 font-medium text-xs [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 pl-1">
                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Birth Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/50 font-medium text-xs [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Birth Place */}
                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Birth Place</label>
                            <LocationSearch
                                onLocationSelect={(loc) => setFormData({
                                    ...formData,
                                    place: loc.formattedAddress,
                                    lat: loc.lat,
                                    lng: loc.lng,
                                    timezone: loc.timezone || 5.5
                                })}
                                placeholder="Search birth city..."
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2 ${loading
                                ? 'bg-slate-800 text-slate-500'
                                : 'bg-gradient-to-r from-electric-violet to-cosmic-indigo text-white shadow-xl shadow-electric-violet/20 hover:from-electric-violet/90 hover:to-cosmic-indigo/90'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Save Profile & Continue <ChevronRight size={18} /></>
                            )}
                        </motion.button>
                        
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full text-[10px] text-slate-400 font-bold hover:text-white transition-colors flex items-center justify-center gap-1 mt-4"
                        >
                            <LogOut size={12} /> Log Out instead
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
