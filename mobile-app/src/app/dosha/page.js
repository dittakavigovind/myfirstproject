"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, 
    Sparkles, 
    AlertTriangle, 
    Zap, 
    Activity, 
    User, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    ShieldCheck, 
    RotateCcw,
    Info,
    HeartPulse
} from "lucide-react";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import LocationSearch from "@/components/LocationSearch";
import CosmicCard from "@/components/CosmicCard";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function DoshaAnalysisPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("type") || "kaalsarp"; // kaalsarp | mangal | sadesati

    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

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

    const handleLocationSelect = (details) => {
        setFormData(prev => ({
            ...prev,
            place: details.formattedAddress,
            lat: details.lat,
            lng: details.lng,
            timezone: details.timezone || 5.5
        }));
    };

    const handleCalculate = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.date || !formData.time || !formData.lat) {
            toast.error("Please provide valid name, date, time and location.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/astro/dosha", {
                date: formData.date,
                time: formData.time,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
                name: formData.name,
                gender: formData.gender
            });

            if (res.data && res.data.success && res.data.data) {
                setResult(res.data.data);
                setBirthDetails(formData);
            } else {
                toast.error("Could not compute dosha analysis.");
            }
        } catch (error) {
            console.error("Dosha analysis error:", error);
            toast.error(error.response?.data?.message || "Calculation failed. Please verify details.");
        } finally {
            setLoading(false);
        }
    };

    const kaalsarp = result?.kaalsarpDosha;
    const mangal = result?.mangalDosha;
    const sadesati = result?.sadeSati;

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-24 overflow-x-hidden">
            {/* Header */}
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
                        Vedic Astrology
                    </span>
                    <h1 className="text-lg font-black text-white tracking-tight leading-tight">
                        Dosha & Saturn Analysis
                    </h1>
                </div>
                <div className="w-10" />
            </div>

            {/* Dosha Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                {[
                    { id: "kaalsarp", label: "Kaalsarp", icon: AlertTriangle, color: "text-rose-400" },
                    { id: "mangal", label: "Mangal / Kuja", icon: Zap, color: "text-amber-400" },
                    { id: "sadesati", label: "Sani Sade Sati", icon: Activity, color: "text-blue-400" },
                ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isSelected 
                                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md border border-violet-400/40" 
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <IconComponent size={13} className={isSelected ? "text-white" : tab.color} />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {!result ? (
                    /* Birth Details Form */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        <CosmicCard noHover className="p-5 space-y-4">
                            <form onSubmit={handleCalculate} className="space-y-4">
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
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

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

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Place of Birth
                                    </label>
                                    <LocationSearch
                                        defaultValue={formData.place}
                                        onLocationSelect={handleLocationSelect}
                                        placeholder="Search city..."
                                    />
                                    {formData.place && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pl-1 pt-0.5">
                                            <CheckCircle2 size={12} />
                                            <span className="truncate">{formData.place}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-[0_8px_30px_rgba(139,92,246,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles size={16} /> Analyze Doshas & Planetary Cycles
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
                        {/* Kaalsarp Section */}
                        {activeTab === "kaalsarp" && (
                            <CosmicCard noHover className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${kaalsarp?.present ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white">Kaalsarp Dosha</h3>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Rahu & Ketu Alignment</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${kaalsarp?.present ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                                        {kaalsarp?.present ? "Detected" : "Free of Dosha"}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400 font-medium">Dosha Type:</span>
                                        <span className="text-xs font-bold text-white capitalize">{kaalsarp?.type || "None"}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-300 pt-1 border-t border-white/10">
                                        {kaalsarp?.description || (kaalsarp?.present ? "All planets are hemmed between Rahu and Ketu in your birth chart." : "All cosmic planets are well positioned outside the Rahu-Ketu axis, indicating auspicious freedom from Kaalsarp Dosha.")}
                                    </p>
                                </div>

                                {kaalsarp?.remedies && kaalsarp.remedies.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">Recommended Vedic Remedies</span>
                                        <div className="space-y-1.5">
                                            {kaalsarp.remedies.map((rem, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/15 text-xs text-slate-300 flex items-start gap-2">
                                                    <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
                                                    <span>{rem}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CosmicCard>
                        )}

                        {/* Mangal Dosha Section */}
                        {activeTab === "mangal" && (
                            <CosmicCard noHover className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${mangal?.hasDosha ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white">Mangal / Kuja Dosha</h3>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Mars Influence on Marriage</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${mangal?.hasDosha ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                                        {mangal?.hasDosha ? "Manglik" : "Non-Manglik"}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400 font-medium">Dosha Severity:</span>
                                        <span className="text-xs font-bold text-white capitalize">{mangal?.type || (mangal?.hasDosha ? "Present" : "None")}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-300 pt-1 border-t border-white/10">
                                        {mangal?.description || (mangal?.hasDosha ? "Mars is placed in a house that influences marital harmony." : "Mars is placed favorably in your horoscope, promoting stable and harmonious relationships.")}
                                    </p>
                                </div>

                                {mangal?.remedies && mangal.remedies.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">Vedic Manglik Remedies</span>
                                        <div className="space-y-1.5">
                                            {mangal.remedies.map((rem, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/15 text-xs text-slate-300 flex items-start gap-2">
                                                    <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
                                                    <span>{rem}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CosmicCard>
                        )}

                        {/* Sani Sade Sati Section */}
                        {activeTab === "sadesati" && (
                            <CosmicCard noHover className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${sadesati?.isSadeSati ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white">Sani Effects (Sade Sati)</h3>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase">7.5 Year Saturn Transit</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${sadesati?.isSadeSati ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                                        {sadesati?.isSadeSati ? "Active" : "Not Active"}
                                    </span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400 font-medium">Current Phase:</span>
                                        <span className="text-xs font-bold text-white capitalize">{sadesati?.phase || "None"}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-300 pt-1 border-t border-white/10">
                                        {sadesati?.description || (sadesati?.isSadeSati ? "Saturn is transiting in relation to your natal Moon sign." : "You are currently not undergoing the 7.5-year Sade Sati transit period.")}
                                    </p>
                                </div>

                                {sadesati?.remedies && sadesati.remedies.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">Saturn Peace Remedies</span>
                                        <div className="space-y-1.5">
                                            {sadesati.remedies.map((rem, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/15 text-xs text-slate-300 flex items-start gap-2">
                                                    <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
                                                    <span>{rem}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CosmicCard>
                        )}

                        {/* Recalculate */}
                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCcw size={14} /> Calculate with Different Details
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

