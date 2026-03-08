"use client";

import { useState, useEffect } from 'react';
import { useBirthDetails } from '../context/BirthDetailsContext';
import { useSession } from '../context/SessionContext';
import LocationSearch from './LocationSearch';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from './common/CustomDateInput';
import TimeInput from './TimeInput';

export default function SmartInputForm({
    title = "Start Your Session",
    subtitle = "Enter your birth details once to unlock all insights.",
    buttonText = "Generate Horoscope",
    hideHeader = false,
    singleColumn = false,
    preventRedirect = false,
    onSubmit = null
}) {
    const { birthDetails, setBirthDetails } = useBirthDetails();
    const { setActiveTab } = useSession();

    // Local state for form to allow editing before submit
    const [formData, setFormData] = useState({
        name: birthDetails.name || '',
        gender: birthDetails.gender || 'male',
        date: birthDetails.date ? new Date(birthDetails.date) : null,
        time: birthDetails.time ? (() => {
            const d = new Date();
            if (typeof birthDetails.time === 'string') {
                const [h, m] = birthDetails.time.split(':');
                d.setHours(h || 0, m || 0, 0, 0);
            } else if (birthDetails.time instanceof Date) {
                d.setHours(birthDetails.time.getHours(), birthDetails.time.getMinutes(), 0, 0);
            }
            return d;
        })() : new Date(new Date().setHours(0, 0, 0, 0)),
        lat: birthDetails.lat || null,
        lng: birthDetails.lng || null,
        place: birthDetails.place || '',
        timezone: birthDetails.timezone || 5.5
    });

    // Sync state when context loads data (e.g. from localStorage on refresh)
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: birthDetails.name || prev.name,
            gender: birthDetails.gender || prev.gender,
            date: birthDetails.date ? new Date(birthDetails.date) : prev.date,
            time: birthDetails.time ? (() => {
                const d = new Date();
                if (typeof birthDetails.time === 'string') {
                    const [h, m] = birthDetails.time.split(':');
                    d.setHours(h || 0, m || 0, 0, 0);
                } else if (birthDetails.time instanceof Date) {
                    d.setHours(birthDetails.time.getHours(), birthDetails.time.getMinutes(), 0, 0);
                }
                return d;
            })() : prev.time,
            lat: birthDetails.lat || prev.lat,
            lng: birthDetails.lng || prev.lng,
            place: birthDetails.place || prev.place,
            timezone: birthDetails.timezone || prev.timezone
        }));
    }, [birthDetails]);

    const [loading, setLoading] = useState(false);

    const handleLocationSelect = (loc) => {
        setFormData(prev => ({
            ...prev,
            place: loc.formattedAddress || loc.name, // Handle both just in case
            lat: loc.lat,
            lng: loc.lng,
            timezone: loc.timezone
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.date || !formData.time || !formData.lat) {
            toast.error("Please fill all details correctly.");
            return;
        }

        setLoading(true);

        try {
            if (onSubmit) {
                // Custom handler mode (e.g. for standalone calculators)
                await onSubmit(formData);
                // If preventRedirect is true, we don't switch tabs or update global context here
                // (Unless the custom handler does it)
                if (!preventRedirect) {
                    // Optionally update context even if custom submit
                    await setBirthDetails({
                        ...formData,
                        date: formData.date,
                    });
                    setActiveTab('kundli');
                }
            } else {
                // Default Global Context Mode
                await setBirthDetails({
                    ...formData,
                    date: formData.date,
                });

                toast.success("Session Updated!");

                // Switch to Kundli tab automatically to show results
                if (!preventRedirect) {
                    setActiveTab('kundli');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const gridClass = singleColumn ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            {!hideHeader && (
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800">{title}</h2>
                    <p className="text-slate-500">{subtitle}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Gender */}
                <div className={`grid ${gridClass} gap-6`}>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                placeholder="Enter Name"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            {['male', 'female'].map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gender: g })}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${formData.gender === g ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Date & Time */}
                <div className={`grid ${gridClass} gap-6`}>
                    <div className="group space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date of Birth</label>
                        <div className="relative">
                            <DatePicker
                                customInput={<CustomDateInput placeholder='DD/MM/YYYY' Icon={Calendar} />}
                                selected={formData.date}
                                onChange={(date) => setFormData({ ...formData, date })}
                                dateFormat="dd/MM/yyyy"
                                wrapperClassName="w-full"
                                showMonthDropdown
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={100}
                            />
                        </div>
                    </div>
                    <div className="group space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Time of Birth</label>
                        <div className="flex items-center">
                            <div className="mr-3 text-slate-400"><Clock size={18} /></div>
                            <div className="flex-1">
                                <TimeInput
                                    value={formData.time}
                                    onChange={(newTime) => setFormData({ ...formData, time: newTime })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Place */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Place of Birth</label>
                    <LocationSearch onLocationSelect={handleLocationSelect} defaultValue={formData.place} />
                    {formData.place && (
                        <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                            <MapPin size={12} /> Selected: {formData.place}
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-astro-yellow to-orange-500 text-slate-900 font-black rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-4"
                >
                    {loading ? "Calculating..." : (
                        <>
                            {buttonText} <ArrowRight size={20} />
                        </>
                    )}
                </motion.button>
            </form>
        </div>
    );
}
