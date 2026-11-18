"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Sparkles, 
    Shield, 
    User, 
    Calendar, 
    Clock, 
    MapPin, 
    Info, 
    CheckCircle2, 
    Star, 
    RotateCcw 
} from "lucide-react";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import LocationSearch from "@/components/LocationSearch";
import CosmicCard from "@/components/CosmicCard";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { arudhaInterpretations } from "@/lib/arudhaInterpretations";

const ZODIAC_SYMBOLS = {
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
    "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
    "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

export default function ArudhaLagnaPage() {
    const router = useRouter();
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

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

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

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

    const handleLocationSelect = (details) => {
        setFormData(prev => ({
            ...prev,
            place: details.formattedAddress,
            lat: details.lat,
            lng: details.lng,
            timezone: details.timezone || 5.5
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("Please enter your name");
            return;
        }
        if (!formData.date || !formData.time || !formData.lat) {
            toast.error("Please provide valid birth date, time, and location.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/astro/arudha-lagna", {
                date: formData.date,
                time: formData.time,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone
            });

            if (res.data && res.data.success && res.data.data?.arudhaLagna) {
                setResult(res.data.data.arudhaLagna);
                // Save details for seamless repeat usage
                setBirthDetails(formData);
            } else {
                toast.error("Unable to calculate Arudha Lagna with given details.");
            }
        } catch (error) {
            console.error("Arudha Lagna calculation error:", error);
            toast.error(error.response?.data?.message || "Failed to calculate Arudha Lagna. Please verify inputs.");
        } finally {
            setLoading(false);
        }
    };

    const signInterpretation = result ? arudhaInterpretations[result.signName] : null;

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-24 overflow-x-hidden">
            {/* Top Navigation Bar */}
            <div className="pt-2 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-center">
                    <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-widest block">
                        Jaimini Astrology
                    </span>
                    <h1 className="text-lg font-black text-white tracking-tight leading-tight">
                        Arudha Lagna Calculator
                    </h1>
                </div>
                <div className="w-10" />
            </div>

            {/* Description Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent border border-violet-500/20 backdrop-blur-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Shield size={18} />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug font-medium">
                    Arudha Lagna (AL) mirrors your <strong className="text-amber-300">external image</strong>, public perception, wealth, and status in the eyes of the world.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    /* Native Input Form */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        <CosmicCard noHover className="p-5 space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name Input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter your name"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Gender Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Gender
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["male", "female"].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                                                className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 border cursor-pointer ${
                                                    formData.gender === g
                                                        ? "bg-violet-600/30 border-violet-400/50 text-white shadow-sm"
                                                        : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Birth Date & Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Birth Date
                                        </label>
                                        <div className="relative">
                                            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                                className="w-full pl-10 pr-2 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500/50 transition-all font-medium [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Birth Time
                                        </label>
                                        <div className="relative">
                                            <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            <input
                                                type="time"
                                                required
                                                value={formData.time}
                                                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                                className="w-full pl-10 pr-2 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500/50 transition-all font-medium [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Place of Birth */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Place of Birth
                                    </label>
                                    <LocationSearch
                                        defaultValue={formData.place}
                                        onLocationSelect={handleLocationSelect}
                                        placeholder="Search birth city (e.g. Hyderabad, Delhi)..."
                                    />
                                    {formData.place && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pl-1 pt-0.5">
                                            <CheckCircle2 size={12} />
                                            <span className="truncate">{formData.place}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-[0_8px_30px_rgba(139,92,246,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles size={16} /> Calculate Arudha Lagna
                                        </>
                                    )}
                                </button>
                            </form>
                        </CosmicCard>
                    </motion.div>
                ) : (
                    /* Native Result Presentation */
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        {/* Main Arudha Card */}
                        <CosmicCard noHover className="p-6 relative overflow-hidden text-center space-y-4">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400/20 to-violet-600/30 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner text-amber-300">
                                {ZODIAC_SYMBOLS[result.signName] || "✨"}
                            </div>

                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 shadow-sm">
                                    Your Arudha Lagna (AL)
                                </span>
                                <h2 className="text-3xl font-black text-white tracking-tight">
                                    {result.signName}
                                </h2>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Lagna Sign
                                    </span>
                                    <span className="text-xs font-black text-slate-200 mt-0.5 block">
                                        {result.lagnaSignName} ({result.lagnaSign})
                                    </span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Lagna Lord
                                    </span>
                                    <span className="text-xs font-black text-slate-200 mt-0.5 block">
                                        {result.lagnaLord}
                                    </span>
                                </div>
                            </div>

                            {result.exception && (
                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-start gap-2.5 text-left text-xs text-amber-300">
                                    <Info size={15} className="shrink-0 mt-0.5" />
                                    <span>{result.exception}</span>
                                </div>
                            )}

                            {/* Key Personality Traits */}
                            {signInterpretation?.keyTraits && (
                                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                                    {signInterpretation.keyTraits.map((trait, idx) => (
                                        <span 
                                            key={idx}
                                            className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider"
                                        >
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </CosmicCard>

                        {/* Detailed Interpretation Cards */}
                        {signInterpretation && (
                            <div className="space-y-3">
                                {/* Public Image & Aura */}
                                <CosmicCard noHover className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                        <User size={15} />
                                        <span>Public Image & Aura</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-300 font-normal">
                                        {signInterpretation.publicImage}
                                    </p>
                                </CosmicCard>

                                {/* Career & Status */}
                                <CosmicCard noHover className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-violet-300 font-bold text-xs">
                                        <Shield size={15} />
                                        <span>Career & Status</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-300 font-normal">
                                        {signInterpretation.careerStatus}
                                    </p>
                                </CosmicCard>

                                {/* Social Perception */}
                                <CosmicCard noHover className="p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                                        <Star size={15} />
                                        <span>Social Perception</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-300 font-normal">
                                        {signInterpretation.socialPerception}
                                    </p>
                                </CosmicCard>
                            </div>
                        )}

                        {/* Recalculate Button */}
                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCcw size={14} /> Calculate Again / Change Details
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

