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
    const getLocalDateStr = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [date, setDate] = useState(getLocalDateStr());
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
                        <h1 className="text-base font-extrabold text-white tracking-tight leading-none">Daily Panchang</h1>
                        <p className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase mt-1">Vedic Solar & Lunar Almanac</p>
                    </div>
                </div>
            </div>

            {/* Inputs Section */}
            <div className="px-1 mt-2">
                <div className="rounded-[24px] p-4 backdrop-blur-2xl bg-white/[0.05] border border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] flex flex-col gap-3.5 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                    
                    <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Location</label>
                        <div className="relative flex items-center bg-white/[0.05] rounded-xl px-3 py-2 border border-white/10">
                            <MapPin className="text-amber-400 mr-2 shrink-0" size={15} />
                            <div className="flex-1">
                                <LocationSearch
                                    onLocationSelect={handleLocationSelect}
                                    defaultValue={place}
                                    placeholder="Search City..."
                                    variant="underline"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Date</label>
                        <div className="relative flex items-center bg-white/[0.05] rounded-xl px-3 py-2 border border-white/10">
                            <Calendar className="text-violet-400 mr-2 shrink-0" size={15} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-transparent text-white focus:outline-none text-xs font-semibold"
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
                                        value={data.tithi?.name || data.tithi}
                                        sub={data.tithi?.paksha}
                                        start={formatTime(data.tithi?.start)}
                                        end={formatTime(data.tithi?.end)}
                                        icon={Clock}
                                        color="text-blue-400"
                                    />
                                    <ElementCard
                                        label="Vara"
                                        value={data.vara}
                                        icon={Calendar}
                                        color="text-green-400"
                                    />
                                    <ElementCard
                                        label="Nakshatra"
                                        value={data.nakshatra?.name || data.nakshatra}
                                        sub={data.nakshatra?.padha ? `Pada ${data.nakshatra.padha}` : null}
                                        start={formatTime(data.nakshatra?.start)}
                                        end={formatTime(data.nakshatra?.end)}
                                        icon={Sparkles}
                                        color="text-solar-gold"
                                    />
                                    <ElementCard
                                        label="Yoga"
                                        value={data.yoga?.name || data.yoga}
                                        start={formatTime(data.yoga?.start)}
                                        end={formatTime(data.yoga?.end)}
                                        icon={Sparkles}
                                        color="text-purple-400"
                                    />
                                    {data.karana && (
                                        <ElementCard
                                            label="Karana"
                                            value={data.karana?.name || data.karana}
                                            start={formatTime(data.karana?.start)}
                                            end={formatTime(data.karana?.end)}
                                            icon={Sparkles}
                                            color="text-orange-400"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Muhurtas */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 ml-1 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Abhijit Muhurta
                                    </h3>
                                    <WideMuhurta
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
        <div className="backdrop-blur-xl bg-white/[0.05] border border-white/12 p-3.5 rounded-[22px] flex items-center gap-3 shadow-sm">
            <div className={`p-2.5 rounded-xl ${bg} ${color} shrink-0`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-[14px] font-black text-white leading-tight">{val || "--:--"}</p>
            </div>
        </div>
    );
}

function ElementCard({ label, value, sub, start, end, icon: Icon, color }) {
    return (
        <div className="backdrop-blur-xl bg-white/[0.05] border border-white/12 p-3.5 rounded-[22px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-white/[0.06] ${color}`}>
                    <Icon size={17} />
                </div>
                <div>
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[13px] font-bold text-white">{value}</span>
                        {sub && <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-md text-amber-300 font-bold">{sub}</span>}
                    </div>
                </div>
            </div>
            {(start && end) && (
                <div className="text-right">
                    <div className="text-[9px] font-bold text-slate-400 tabular-nums">From {start}</div>
                    <div className="text-[9px] font-bold text-slate-400 tabular-nums mt-0.5">To {end}</div>
                </div>
            )}
        </div>
    );
}

function WideMuhurta({ label, start, end, type }) {
    const isGood = type === "good";
    return (
        <div className={`backdrop-blur-xl bg-white/[0.05] border border-white/12 p-3.5 rounded-[22px] flex items-center justify-between border-l-4 ${isGood ? 'border-l-emerald-400' : 'border-l-rose-400'} shadow-sm`}>
            <div>
                {label && <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>}
                <h4 className="text-[13px] font-black text-white">{isGood ? "Auspicious Timing" : "Inauspicious Period"}</h4>
            </div>
            <div className={`px-3 py-1.5 rounded-xl ${isGood ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/15 text-rose-300 border-rose-400/30'} border font-mono font-bold text-xs`}>
                <span>{start} - {end}</span>
            </div>
        </div>
    );
}
