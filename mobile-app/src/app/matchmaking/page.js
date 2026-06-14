"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Heart, Sparkles, MapPin, Calendar, Clock,
    ChevronRight, Info, ShieldCheck, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import { useAuth } from "@/context/AuthContext";
import LocationSearch from "@/components/LocationSearch";

export default function MatchmakingPage() {
    const router = useRouter();
    const { birthDetails, isInitialized } = useBirthDetails();
    const { user } = useAuth();

    // Separate states for Boy and Girl
    const [boy, setBoy] = useState({
        name: "",
        date: "",
        time: "12:00",
        place: "New Delhi, India",
        lat: 28.6139,
        lng: 77.2090,
        tz: 5.5
    });

    const [girl, setGirl] = useState({
        name: "",
        date: "",
        time: "12:00",
        place: "New Delhi, India",
        lat: 28.6139,
        lng: 77.2090,
        tz: 5.5
    });

    // Pre-fill based on current user / birth details
    useEffect(() => {
        if (isInitialized && birthDetails && birthDetails.date) {
            const details = {
                name: birthDetails.name || user?.name || "",
                date: birthDetails.date || "",
                time: birthDetails.time || "12:00",
                place: birthDetails.place || "New Delhi, India",
                lat: birthDetails.lat || 28.6139,
                lng: birthDetails.lng || 77.2090,
                tz: birthDetails.timezone || 5.5
            };

            if (birthDetails.gender === 'male') {
                setBoy(details);
            } else if (birthDetails.gender === 'female') {
                setGirl(details);
            }
        }
    }, [isInitialized, birthDetails, user]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!boy.date || !girl.date || !boy.name || !girl.name) {
            alert("The stars require full names and dates to align.");
            return;
        }

        const params = new URLSearchParams();
        // Boy params
        params.append('b_name', boy.name);
        params.append('b_date', boy.date);
        params.append('b_time', boy.time);
        params.append('b_lat', boy.lat);
        params.append('b_lng', boy.lng);
        params.append('b_tz', boy.tz);
        params.append('b_place', boy.place);

        // Girl params
        params.append('g_name', girl.name);
        params.append('g_date', girl.date);
        params.append('g_time', girl.time);
        params.append('g_lat', girl.lat);
        params.append('g_lng', girl.lng);
        params.append('g_tz', girl.tz);
        params.append('g_place', girl.place);

        router.push(`/matchmaking/result?${params.toString()}`);
    };

    if (!isInitialized) return null;

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Native Picker Hider */}
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
                }
            `}</style>

            {/* Header */}
            <div className="pt-6 px-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white/5 rounded-full text-white/40 mb-4"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-white">
                    Gun <span className="text-rose-400 underline underline-offset-8 decoration-rose-400/30">Milan</span>
                </h1>
                <p className="text-slate-400 text-sm mt-3">Enter details of both partners to check ashtakoot compatibility.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-4 mt-8 space-y-8">
                {/* Boy's Section */}
                <div className="space-y-3">
                    <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Boy's Details
                    </h2>

                    <div className="space-y-3 pl-3 border-l border-blue-500/20 py-1">
                        <InputGroup
                            label="Full Name"
                            icon={User}
                            value={boy.name}
                            onChange={v => setBoy({ ...boy, name: v })}
                            placeholder="Enter Boy's Name"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup
                                label="Birth Date"
                                icon={Calendar}
                                type="date"
                                value={boy.date}
                                onChange={v => setBoy({ ...boy, date: v })}
                            />
                            <InputGroup
                                label="Birth Time"
                                icon={Clock}
                                type="time"
                                value={boy.time}
                                onChange={v => setBoy({ ...boy, time: v })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block mb-1">Place of Birth</label>
                            <div className="relative group flex items-end border-b border-white/10 pb-1 focus-within:border-blue-400 transition-colors">
                                <MapPin className="text-slate-500 group-focus-within:text-blue-400 mr-2 mb-1" size={16} />
                                <div className="flex-1 -mb-1">
                                    <LocationSearch
                                        onLocationSelect={loc => setBoy({ ...boy, place: loc.formattedAddress, lat: loc.lat, lng: loc.lng, tz: loc.timezone || 5.5 })}
                                        defaultValue={boy.place}
                                        variant="underline"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Girl's Section */}
                <div className="space-y-3">
                    <h2 className="text-xs font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Girl's Details
                    </h2>

                    <div className="space-y-3 pl-3 border-l border-rose-500/20 py-1">
                        <InputGroup
                            label="Full Name"
                            icon={User}
                            value={girl.name}
                            onChange={v => setGirl({ ...girl, name: v })}
                            placeholder="Enter Girl's Name"
                            color="rose"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup
                                label="Birth Date"
                                icon={Calendar}
                                type="date"
                                value={girl.date}
                                onChange={v => setGirl({ ...girl, date: v })}
                                color="rose"
                            />
                            <InputGroup
                                label="Birth Time"
                                icon={Clock}
                                type="time"
                                value={girl.time}
                                onChange={v => setGirl({ ...girl, time: v })}
                                color="rose"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block mb-1">Place of Birth</label>
                            <div className="relative group flex items-end border-b border-white/10 pb-1 focus-within:border-rose-400 transition-colors">
                                <MapPin className="text-slate-500 group-focus-within:text-rose-400 mr-2 mb-1" size={16} />
                                <div className="flex-1 -mb-1">
                                    <LocationSearch
                                        onLocationSelect={loc => setGirl({ ...girl, place: loc.formattedAddress, lat: loc.lat, lng: loc.lng, tz: loc.timezone || 5.5 })}
                                        defaultValue={girl.place}
                                        variant="underline"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-4 rounded-2xl border-rose-500/10 bg-rose-500/5 flex gap-3 mt-4"
                >
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                        <Heart size={16} className="fill-rose-400/20" />
                    </div>
                    <div>
                        <h4 className="text-white text-[13px] font-bold mb-0.5">Celestial Compatibility</h4>
                        <p className="text-slate-400 text-[11px] leading-tight">
                            Ashtakoot Guna Milan analyzes 8 key aspects including temperament, intimacy, and health.
                        </p>
                    </div>
                </motion.div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-lg shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-6"
                >
                    Check Compatibility
                    <ChevronRight size={18} />
                </button>
            </form>
        </div>
    );
}

function InputGroup({ label, icon: Icon, type = "text", value, onChange, placeholder, color = "blue" }) {
    const focusColorClass = color === 'rose' ? 'group-focus-within:text-rose-400' : 'group-focus-within:text-blue-400';
    const borderColorClass = color === 'rose' ? 'focus-within:border-rose-400' : 'focus-within:border-blue-400';

    return (
        <div className="relative group flex-1">
            <div className={`flex items-end border-b border-white/10 pb-1 ${borderColorClass} transition-colors`}>
                <Icon className={`text-slate-500 ${focusColorClass} mr-2 mb-1`} size={16} />
                <div className="flex-1">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block mb-0.5">{label}</label>
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-transparent text-white placeholder:text-white/20 focus:outline-none font-medium text-[13px] py-1"
                    />
                </div>
            </div>
        </div>
    );
}
