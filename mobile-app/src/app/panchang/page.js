"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import LocationSearch from "@/components/LocationSearch";
import CosmicCard from "@/components/CosmicCard";
import CosmicLoader from "@/components/CosmicLoader";
import {
    Calendar, MapPin, Sparkles, Sun, Moon, Clock, Star,
    ArrowLeft, ChevronRight, Info, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PanchangPage() {
    const router = useRouter();

    // State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [place, setPlace] = useState("New Delhi, India");
    const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090, timezone: "Asia/Kolkata" });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPanchang();
    }, [date, coords]);

    const fetchPanchang = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                date,
                lat: coords.lat,
                lng: coords.lng,
                timezone: coords.timezone
            };

            const res = await api.post("/panchang/calculate", payload);
            if (res.data.success && res.data.data && res.data.data.panchang) {
                setData(res.data.data.panchang);
            } else {
                setError("Failed to load Panchang data.");
            }
        } catch (err) {
            console.error("Fetch Panchang Error:", err);
            setError("Unable to connect to cosmic services. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (details) => {
        if (details.lat && details.lng) {
            setCoords({ lat: details.lat, lng: details.lng, timezone: details.timezone });
            setPlace(details.formattedAddress);
        }
    };

    // Helper to format time strings
    const formatTime = (timeStr) => {
        if (!timeStr) return "--:--";
        // If it's just HH:MM:SS
        if (/^\d{1,2}:\d{2}/.test(timeStr)) return timeStr;
        // If it's an ISO string
        try {
            const d = new Date(timeStr);
            if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { }
        return timeStr;
    };

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Global Hide Native Icons */}
            <style jsx global>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
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
                    className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-white">Daily <span className="text-solar-gold decoration-solar-gold/30 underline underline-offset-8">Panchang</span></h1>
                <p className="text-slate-400 text-sm mt-2">Auspicious timings and planetary positions.</p>
            </div>

            {/* Inputs Section */}
            <div className="px-4 mt-6 space-y-3">
                <div className="glass-panel p-4 rounded-3xl space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Location</label>
                        <LocationSearch
                            onLocationSelect={handleLocationSelect}
                            defaultValue={place}
                            placeholder="Search City..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-electric-violet/20 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 mt-6 relative">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20"
                        >
                            <CosmicLoader size="md" fullscreen={false} message="Consulting the Almanac..." />
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-8 rounded-3xl text-center border-red-500/20"
                        >
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                            <p className="text-red-200 font-bold">{error}</p>
                            <button
                                onClick={fetchPanchang}
                                className="mt-4 px-6 py-2 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 font-bold text-sm"
                            >
                                Retry
                            </button>
                        </motion.div>
                    ) : data ? (
                        <motion.div
                            key="data"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Sun & Moon Summary */}
                            <div className="grid grid-cols-2 gap-3">
                                <SunCard label="Sunrise" val={data.sun.sunrise} icon={Sun} color="text-solar-gold" bg="bg-solar-gold/10" />
                                <SunCard label="Sunset" val={data.sun.sunset} icon={Sun} color="text-orange-500" bg="bg-orange-500/10" />
                                <SunCard label="Moonrise" val={data.moon.moonrise} icon={Moon} color="text-indigo-400" bg="bg-indigo-400/10" />
                                <SunCard label="Moonset" val={data.moon.moonset} icon={Moon} color="text-purple-400" bg="bg-purple-400/10" />
                            </div>

                            {/* Core Elements */}
                            <div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Five Elements</h3>
                                <div className="space-y-3">
                                    <ElementCard
                                        label="Tithi"
                                        value={data.tithi.name}
                                        sub={data.tithi.paksha}
                                        period={`${formatTime(data.tithi.start)} - ${formatTime(data.tithi.end)}`}
                                        icon={Clock}
                                        color="text-blue-400"
                                    />
                                    <ElementCard
                                        label="Nakshatra"
                                        value={data.nakshatra.name}
                                        sub={`Pada ${data.nakshatra.padha}`}
                                        period={`${formatTime(data.nakshatra.start)} - ${formatTime(data.nakshatra.end)}`}
                                        icon={Sparkles}
                                        color="text-solar-gold"
                                    />
                                    <ElementCard
                                        label="Yoga"
                                        value={data.yoga.name}
                                        period={`${formatTime(data.yoga.start)} - ${formatTime(data.yoga.end)}`}
                                        icon={Sparkles}
                                        color="text-purple-400"
                                    />
                                    <ElementCard
                                        label="Vara"
                                        value={data.vara}
                                        icon={Calendar}
                                        color="text-green-400"
                                    />
                                </div>
                            </div>

                            {/* Muhurtas */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 ml-1 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Abhijit Muhurta
                                    </h3>
                                    <WideMuhurta
                                        label="Auspicious Window"
                                        start={data.abhijitMuhurta.start}
                                        end={data.abhijitMuhurta.end}
                                        type="good"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-3 ml-1 flex items-center gap-2">
                                        <XCircle size={14} /> Inauspicious Periods
                                    </h3>
                                    <WideMuhurta
                                        label="Rahu Kalam"
                                        start={data.rahuKalam.start}
                                        end={data.rahuKalam.end}
                                        type="bad"
                                    />
                                    <WideMuhurta
                                        label="Yamaganda"
                                        start={data.yamaganda.start}
                                        end={data.yamaganda.end}
                                        type="bad"
                                    />
                                </div>
                            </div>

                            {/* Spacer for bottom nav */}
                            <div className="h-6" />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Helper Components ---

function SunCard({ label, val, icon: Icon, color, bg }) {
    return (
        <div className="glass-panel p-4 rounded-3xl flex items-center gap-3">
            <div className={`p-2 rounded-xl ${bg} ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-black text-white">{val || "--:--"}</p>
            </div>
        </div>
    );
}

function ElementCard({ label, value, sub, period, icon: Icon, color }) {
    return (
        <CosmicCard className="bg-white/5 border-white/5" noHover>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">{value}</span>
                            {sub && <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-md text-slate-400 font-bold">{sub}</span>}
                        </div>
                    </div>
                </div>
            </div>
            {period && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Window</span>
                    <span className="text-xs font-black text-indigo-300">{period}</span>
                </div>
            )}
        </CosmicCard>
    );
}

function WideMuhurta({ label, start, end, type }) {
    const isGood = type === "good";
    return (
        <div className={`glass-panel p-4 rounded-3xl flex items-center justify-between border-l-4 ${isGood ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                <h4 className="text-base font-black text-white">{isGood ? "Auspicious" : "Avoid Working"}</h4>
            </div>
            <div className={`px-4 py-2 rounded-2xl ${isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border ${isGood ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <span className="text-xs font-black tabular-nums">{start} - {end}</span>
            </div>
        </div>
    );
}
