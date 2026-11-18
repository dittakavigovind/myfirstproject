"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import LocationSearch from "@/components/LocationSearch";
import {
    User, Calendar, Clock, MapPin, ArrowLeft,
    Sparkles, CheckCircle2, ChevronRight, Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function KundliFormPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    // Welcome Name
    const welcomeName = user?.name ? user.name.split(' ')[0] : "Seeker";

    // Local state for form validation
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        gender: "male",
        date: "",
        time: "",
        place: "",
        lat: null,
        lng: null,
        timezone: 5.5
    });

    useEffect(() => {
        if (isInitialized && birthDetails) {
            setFormData({
                name: birthDetails.name || "",
                gender: birthDetails.gender || "male",
                date: birthDetails.date || "",
                time: birthDetails.time || "",
                place: birthDetails.place || "",
                lat: birthDetails.lat || null,
                lng: birthDetails.lng || null,
                timezone: birthDetails.timezone || 5.5
            });
        }
    }, [isInitialized, birthDetails]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.date || !formData.time || !formData.lat) {
            toast.error("Please fill all cosmic details.");
            return;
        }

        setLoading(true);
        await setBirthDetails(formData);

        // Construct query params for the result page
        const params = new URLSearchParams({
            name: formData.name,
            gender: formData.gender,
            date: formData.date,
            time: formData.time,
            lat: formData.lat,
            lng: formData.lng,
            tz: formData.timezone,
            place: formData.place
        });

        router.push(`/kundli/result?${params.toString()}`);
    };

    const handleLocationSelect = (details) => {
        setFormData(prev => ({
            ...prev,
            place: details.formattedAddress,
            lat: details.lat,
            lng: details.lng,
            timezone: details.timezone
        }));
    };

    if (!isInitialized) return null;

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Global Hide Native Focus & Native Icons (Chrome/Safari) */}
            <style jsx global>{`
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                    background: transparent;
                    bottom: 0;
                    color: transparent;
                    cursor: pointer;
                    height: auto;
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: auto;
                    opacity: 0;
                    z-index: 10;
                }
                /* Remove default focus ring for these special inputs */
                input[type="date"]:focus, input[type="time"]:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
                }
            `}</style>

            {/* Header */}
            <div className="pt-2 px-1">
                <div className="flex items-center gap-3.5 mb-5">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/12 flex items-center justify-center text-white active:scale-90 transition-all shadow-sm"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-base font-extrabold text-white tracking-tight leading-none">Free Kundli</h1>
                        <p className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase mt-1">Vedic Birth Chart</p>
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        Generate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Celestial Map</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Hello {welcomeName}, enter birth details to reveal your planetary placements.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 mt-8 space-y-6">

                {/* Basic Info Section */}
                <div className="space-y-4">
                    <div className="space-y-1.5 pl-1">
                        <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/20 font-medium placeholder:text-slate-600 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Gender</label>
                            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                                {['male', 'female'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${formData.gender === g
                                            ? 'bg-electric-violet text-white shadow-lg shadow-electric-violet/20'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Birth Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/20 font-medium text-xs h-[42px]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Birth Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/20 font-medium text-xs h-[42px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pl-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500">Birth Place</label>
                            <LocationSearch
                                onLocationSelect={handleLocationSelect}
                                defaultValue={formData.place}
                                placeholder="City of birth"
                            />
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="glass-panel p-4 rounded-3xl border-solar-gold/10 bg-solar-gold/5 flex gap-3">
                    <div className="p-2 bg-solar-gold/20 rounded-xl text-solar-gold h-fit">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-solar-gold/80">Cosmic Precision</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Accurate time and place are essential for calculating your precise planetary alignments and dashas.</p>
                    </div>
                </div>

                {/* Submit Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${loading
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white shadow-[0_8px_25px_rgba(124,58,237,0.4)] active:scale-[0.98]'
                        }`}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Generate Kundli <ChevronRight size={18} /></>
                    )}
                </motion.button>
            </form>
        </div>
    );
}
