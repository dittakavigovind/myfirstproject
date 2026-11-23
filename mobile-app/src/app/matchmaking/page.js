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
import toast from "react-hot-toast";

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
        if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
        }
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
            toast.error("The stars require full names and dates to align.");
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
                        <h1 className="text-base font-extrabold text-white tracking-tight leading-none">Gun Milan</h1>
                        <p className="text-[10px] text-rose-300 font-semibold tracking-wider uppercase mt-1">Ashtakoot Compatibility</p>
                    </div>
                </div>

                <div className="mb-4">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        Calculate <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Celestial Match</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Enter birth details of both partners to check 36 Guna compatibility.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                {/* Boy's Section */}
                <div className="rounded-[26px] p-5 backdrop-blur-2xl bg-white/[0.05] border border-blue-500/20 shadow-[0_12px_36px_rgba(59,130,246,0.15)] relative z-20 space-y-3">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent pointer-events-none" />
                    
                    <h3 className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" /> 
                        Groom / Boy's Details
                    </h3>

                    <div className="space-y-3 pt-1">
                        <InputGroup
                            label="Full Name"
                            icon={User}
                            value={boy.name}
                            onChange={v => setBoy({ ...boy, name: v })}
                            placeholder="Enter Boy's Name"
                        />
                        <div className="grid grid-cols-2 gap-3">
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
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Place of Birth</label>
                            <LocationSearch
                                onLocationSelect={loc => setBoy({ ...boy, place: loc.formattedAddress, lat: loc.lat, lng: loc.lng, tz: loc.timezone || 5.5 })}
                                defaultValue={boy.place}
                                placeholder="Search city of birth..."
                                showLeftIcon={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Girl's Section */}
                <div className="rounded-[26px] p-5 backdrop-blur-2xl bg-white/[0.05] border border-rose-500/20 shadow-[0_12px_36px_rgba(244,63,94,0.15)] relative z-10 space-y-3">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-400/30 to-transparent pointer-events-none" />

                    <h3 className="text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" /> 
                        Bride / Girl's Details
                    </h3>

                    <div className="space-y-3 pt-1">
                        <InputGroup
                            label="Full Name"
                            icon={User}
                            color="rose"
                            value={girl.name}
                            onChange={v => setGirl({ ...girl, name: v })}
                            placeholder="Enter Girl's Name"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <InputGroup
                                label="Birth Date"
                                icon={Calendar}
                                type="date"
                                color="rose"
                                value={girl.date}
                                onChange={v => setGirl({ ...girl, date: v })}
                            />
                            <InputGroup
                                label="Birth Time"
                                icon={Clock}
                                type="time"
                                color="rose"
                                value={girl.time}
                                onChange={v => setGirl({ ...girl, time: v })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Place of Birth</label>
                            <LocationSearch
                                onLocationSelect={loc => setGirl({ ...girl, place: loc.formattedAddress, lat: loc.lat, lng: loc.lng, tz: loc.timezone || 5.5 })}
                                defaultValue={girl.place}
                                placeholder="Search city of birth..."
                                showLeftIcon={true}
                            />
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
