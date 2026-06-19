"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Clock, MapPin, Search, Edit2, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";
import KundliChart from "@/components/KundliChart";
import LocationSearch from "@/components/LocationSearch";
import { useAuth } from "@/context/AuthContext";
import { maskUserName } from "@/utils/maskUtils";

const DASHA_LEVELS = ["Mahadasha", "Antardasha", "Pratyantardasha", "Sookshma", "Prana"];
const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

const getSubPeriods = (parentLord, parentStart, parentDuration) => {
    const subPeriods = [];
    let currentSubDate = new Date(parentStart);
    const parentIndex = DASHA_LORDS.indexOf(parentLord);

    for (let i = 0; i < 9; i++) {
        const idx = (parentIndex + i) % 9;
        const subLord = DASHA_LORDS[idx];
        const subLordYears = DASHA_YEARS[idx];

        const subDuration = (parentDuration * subLordYears) / 120;
        const subEndDate = new Date(currentSubDate);
        const totalDays = subDuration * 365.2425;
        subEndDate.setTime(subEndDate.getTime() + (totalDays * 24 * 60 * 60 * 1000));

        subPeriods.push({
            lord: subLord,
            start: currentSubDate.toISOString(),
            end: subEndDate.toISOString(),
            startISO: currentSubDate.toISOString(),
            endISO: subEndDate.toISOString(),
            duration: subDuration
        });
        currentSubDate = subEndDate;
    }
    return subPeriods;
};

const DashaNode = ({ dasha, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localSubPeriods, setLocalSubPeriods] = useState(dasha.subPeriods || null);
    
    const isCurrent = new Date() >= new Date(dasha.startISO || dasha.start) && new Date() <= new Date(dasha.endISO || dasha.end);
    const levelName = DASHA_LEVELS[level] || `Level ${level + 1}`;
    
    const canExpand = level < 4; // Allow up to Prana (level 4)

    const handleExpand = () => {
        if (!canExpand) return;
        if (!isExpanded && !localSubPeriods && dasha.duration) {
            setLocalSubPeriods(getSubPeriods(dasha.lord, dasha.startISO || dasha.start, dasha.duration));
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`border rounded-xl overflow-hidden mb-2 ${isCurrent ? (level === 0 ? 'border-electric-violet bg-electric-violet/10' : 'border-electric-violet/50 bg-electric-violet/5') : 'border-white/10 bg-white/5'}`}>
            <div 
                onClick={handleExpand} 
                className={`p-3 flex justify-between items-center ${canExpand ? 'cursor-pointer hover:bg-white/5' : ''}`}
            >
                <div>
                    <span className={`font-bold ${level === 0 ? 'text-white text-sm' : 'text-slate-200 text-xs'}`}>
                        {dasha.lord} <span className="text-[10px] font-normal text-slate-400">({levelName})</span>
                    </span>
                    {isCurrent && <span className="ml-2 text-[9px] bg-electric-violet text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Current</span>}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    {level === 0 
                        ? `${new Date(dasha.startISO || dasha.start).getFullYear()} - ${new Date(dasha.endISO || dasha.end).getFullYear()}`
                        : `${new Date(dasha.startISO || dasha.start).toLocaleDateString()} - ${new Date(dasha.endISO || dasha.end).toLocaleDateString()}`
                    }
                    {canExpand && (isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
            </div>
            {isExpanded && localSubPeriods && (
                <div className={`bg-black/20 p-2 border-t border-white/5 ${level === 0 ? 'pl-2' : 'pl-4'} pr-0 pb-0`}>
                    {localSubPeriods.map((sub, idx) => (
                        <DashaNode key={`${sub.lord}-${idx}`} dasha={sub} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function UserKundliModal({ isOpen, onClose, chatUser, onShareChart, isLive }) {
    const { user } = useAuth();
    const [kundliData, setKundliData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState('kundali');
    const [chartStyle, setChartStyle] = useState('north');
    
    const [isEditing, setIsEditing] = useState(false);
    const [birthDetails, setBirthDetails] = useState({
        date: "",
        time: "",
        lat: 0,
        lng: 0,
        timezone: 5.5,
        place: ""
    });

    useEffect(() => {
        if (isOpen && chatUser?.birthDetails) {
            const bd = chatUser.birthDetails;
            let formattedDate = "";
            if (bd.date) {
                formattedDate = new Date(bd.date).toISOString().split('T')[0];
            } else if (bd.dob) {
                formattedDate = new Date(bd.dob).toISOString().split('T')[0];
            }
            
            setBirthDetails({
                date: formattedDate,
                time: bd.time || bd.tob || "",
                lat: bd.lat || bd.latitude || 28.6139,
                lng: bd.lng || bd.longitude || 77.2090,
                timezone: bd.timezone ? parseFloat(bd.timezone) : 5.5,
                place: bd.place || bd.pob || "New Delhi, India"
            });
            
            setIsEditing(false);
        }
    }, [isOpen, chatUser]);

    useEffect(() => {
        if (isOpen && birthDetails.date && birthDetails.time && !isEditing) {
            fetchKundli(birthDetails);
        }
    }, [isOpen, birthDetails, isEditing]);

    const fetchKundli = async (details) => {
        setLoading(true);
        setError("");
        try {
            const payload = {
                date: details.date,
                time: details.time,
                lat: details.lat,
                lng: details.lng,
                timezone: details.timezone
            };
            const res = await api.post('/astro/kundli', payload);
            if (res.data.success) {
                setKundliData(res.data.data);
            } else {
                setError("Failed to generate Kundali.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not calculate celestial map.");
        } finally {
            setLoading(false);
        }
    };


    const handleUpdate = (e) => {
        e.preventDefault();
        setIsEditing(false);
        fetchKundli(birthDetails);
    };

    if (!isOpen) return null;

    const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 top-20 z-50 bg-cosmic-indigo/95 backdrop-blur-md flex flex-col rounded-t-[2rem] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] border-b border-white/10 glass-panel shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-electric-violet/20 flex items-center justify-center border border-electric-violet/30">
                            <Star size={20} className="text-solar-gold" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm">
                                {user?.role === 'astrologer' ? maskUserName(chatUser?.name || "Seeker") : (chatUser?.name || "Seeker")}'s Kundali
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {isEditing ? "Update Details" : "Live Horoscope Map"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 pb-20">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="glass-panel p-4 rounded-2xl border-white/10">
                                <h3 className="text-xs font-black text-electric-violet uppercase tracking-widest mb-4">Birth Details</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2 mb-1">
                                            <Calendar size={12} /> Date of Birth
                                        </label>
                                        <input 
                                            type="date" 
                                            value={birthDetails.date}
                                            onChange={e => setBirthDetails({...birthDetails, date: e.target.value})}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-electric-violet transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2 mb-1">
                                            <Clock size={12} /> Time of Birth
                                        </label>
                                        <input 
                                            type="time" 
                                            value={birthDetails.time}
                                            onChange={e => setBirthDetails({...birthDetails, time: e.target.value})}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-electric-violet transition-colors"
                                        />
                                    </div>

                                    <div className="relative">
                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2 mb-1">
                                            <MapPin size={12} /> Place of Birth
                                        </label>
                                        <LocationSearch 
                                            onLocationSelect={(loc) => {
                                                setBirthDetails(prev => ({
                                                    ...prev,
                                                    place: loc.formattedAddress || loc.city,
                                                    lat: loc.lat,
                                                    lng: loc.lng,
                                                    timezone: loc.timezone || 5.5
                                                }));
                                            }}
                                            defaultValue={birthDetails.place}
                                            placeholder="Search city..."
                                            showLeftIcon={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-electric-violet to-purple-600 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-electric-violet/20">
                                Recalculate Chart
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="w-full py-3 bg-white/5 text-slate-300 font-bold text-sm rounded-xl">
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <div>
                            {/* Chart Overview */}
                            <div className="glass-panel p-4 rounded-3xl border-white/10 mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{birthDetails.date} • {birthDetails.time}</p>
                                    <p className="text-xs text-white font-medium">{birthDetails.place}</p>
                                </div>
                                <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 rounded-xl text-slate-400 flex items-center gap-1">
                                    <Edit2 size={14} />
                                    <span className="text-[10px] font-black uppercase">Edit</span>
                                </button>
                            </div>

                            {loading ? (
                                <div className="py-20 flex justify-center">
                                    <CosmicLoader size="md" message="Mapping the Stars..." />
                                </div>
                            ) : error ? (
                                <div className="text-center py-10">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            ) : kundliData ? (
                                <div>
                                    {/* Tabs */}
                                    <div className="flex bg-white/5 p-1 rounded-xl mb-4">
                                        {['kundali', 'D9', 'D10', 'dasha'].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setActiveTab(t)}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${activeTab === t ? 'bg-electric-violet text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>

                                    {activeTab !== 'dasha' && (
                                        <>
                                            {/* Chart */}
                                            <div className="glass-panel p-4 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent mb-6 relative">
                                                <div id="kundli-chart-container" className="aspect-square w-full max-w-[300px] mx-auto">
                                                    <KundliChart 
                                                        planets={activeTab === 'kundali' ? kundliData.planets : kundliData.charts?.[activeTab] || kundliData.planets} 
                                                        ascendantSign={Math.floor(kundliData.houses.ascendant / 30) + 1} 
                                                        style={chartStyle}
                                                    />
                                                </div>
                                                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 flex">
                                                    <button onClick={() => setChartStyle('north')} className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${chartStyle === 'north' ? 'bg-solar-gold text-slate-900' : 'text-slate-300'}`}>North</button>
                                                    <button onClick={() => setChartStyle('south')} className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${chartStyle === 'south' ? 'bg-solar-gold text-slate-900' : 'text-slate-300'}`}>South</button>
                                                </div>
                                                {isLive && (
                                                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 flex">
                                                        <button 
                                                            onClick={() => {
                                                                const svgElement = document.querySelector('#kundli-chart-container svg');
                                                                if (svgElement && onShareChart) {
                                                                    const svgString = new XMLSerializer().serializeToString(svgElement);
                                                                    const chartName = activeTab === 'kundali' ? 'Birth' : activeTab;
                                                                    onShareChart(svgString, `Astrologer shared a ${chartName} chart.`);
                                                                }
                                                            }} 
                                                            className="px-3 py-1 rounded-full text-[9px] font-bold uppercase bg-electric-violet text-white flex items-center gap-1 hover:bg-electric-violet/80 transition-colors"
                                                        >
                                                            <Share2 size={10} /> Share
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Info */}
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="glass-panel p-3 rounded-2xl border-white/5">
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Lagna</p>
                                                    <p className="text-sm text-white font-bold">{SIGNS[Math.floor(kundliData.houses.ascendant / 30)]}</p>
                                                </div>
                                                <div className="glass-panel p-3 rounded-2xl border-white/5">
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Rashi</p>
                                                    <p className="text-sm text-white font-bold">{SIGNS[kundliData.planets.Moon.sign - 1]}</p>
                                                </div>
                                                <div className="glass-panel p-3 rounded-2xl border-white/5">
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Nakshatra</p>
                                                    <p className="text-sm text-white font-bold truncate">{kundliData.dashas?.birthNakshatra}</p>
                                                </div>
                                                <div className="glass-panel p-3 rounded-2xl border-white/5">
                                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Current Dasha</p>
                                                    <p className="text-sm text-white font-bold">
                                                        {kundliData.dashas?.list?.find(d => new Date() >= new Date(d.start) && new Date() <= new Date(d.end))?.lord || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Simplified Planets */}
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Planetary Positions ({activeTab})</h3>
                                            <div className="space-y-2">
                                                {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map(p => {
                                                    const planetData = activeTab === 'kundali' ? kundliData.planets[p] : kundliData.charts?.[activeTab]?.[p];
                                                    return (
                                                        <div key={p} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <span className="text-xs font-bold text-white">{p}</span>
                                                            <span className="text-xs text-solar-gold font-medium">{planetData ? SIGNS[planetData.sign - 1] : '-'}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'dasha' && (
                                        <div className="space-y-2">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Vimshottari Dasha</h3>
                                            {kundliData.dashas?.list?.map((md, idx) => (
                                                <DashaNode key={`${md.lord}-${idx}`} dasha={md} level={0} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-xs text-slate-400">Update birth details to generate Kundali.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
