"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Clock, MapPin, Search, Edit2 } from "lucide-react";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";
import KundliChart from "@/components/KundliChart";

export default function UserKundliModal({ isOpen, onClose, chatUser }) {
    const [kundliData, setKundliData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [isEditing, setIsEditing] = useState(false);
    const [birthDetails, setBirthDetails] = useState({
        date: "",
        time: "",
        lat: 0,
        lng: 0,
        timezone: 5.5,
        place: ""
    });

    const [locationQuery, setLocationQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchingLocation, setSearchingLocation] = useState(false);

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

    const handleLocationSearch = async (query) => {
        setLocationQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
        setSearchingLocation(true);
        try {
            const res = await api.get(`/astro/search-locations?query=${query}`);
            if (res.data.success) {
                setSearchResults(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingLocation(false);
        }
    };

    const selectLocation = (loc) => {
        setBirthDetails(prev => ({
            ...prev,
            place: loc.address,
            lat: loc.lat,
            lng: loc.lng,
            timezone: loc.timezone || 5.5
        }));
        setLocationQuery("");
        setSearchResults([]);
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
                className="absolute inset-0 z-50 bg-cosmic-indigo/95 backdrop-blur-md flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 glass-panel">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-electric-violet/20 flex items-center justify-center border border-electric-violet/30">
                            <Star size={20} className="text-solar-gold" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-sm">{chatUser?.name || "Seeker"}'s Kundali</h2>
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
                                        <div className="relative">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={locationQuery || birthDetails.place}
                                                onChange={e => handleLocationSearch(e.target.value)}
                                                placeholder="Search city..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-electric-violet transition-colors"
                                            />
                                        </div>
                                        
                                        {/* Autocomplete Results */}
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f3c] border border-white/10 rounded-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                                                {searchResults.map((loc, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => selectLocation(loc)}
                                                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 border-b border-white/5 last:border-0"
                                                    >
                                                        {loc.address}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                    {/* Chart */}
                                    <div className="glass-panel p-4 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/5 to-transparent mb-6">
                                        <div className="aspect-square w-full max-w-[300px] mx-auto">
                                            <KundliChart 
                                                planets={kundliData.planets} 
                                                ascendantSign={Math.floor(kundliData.houses.ascendant / 30) + 1} 
                                                style="north"
                                            />
                                        </div>
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
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Planetary Positions</h3>
                                    <div className="space-y-2">
                                        {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map(p => (
                                            <div key={p} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                <span className="text-xs font-bold text-white">{p}</span>
                                                <span className="text-xs text-solar-gold font-medium">{SIGNS[kundliData.planets[p]?.sign - 1]}</span>
                                            </div>
                                        ))}
                                    </div>
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
