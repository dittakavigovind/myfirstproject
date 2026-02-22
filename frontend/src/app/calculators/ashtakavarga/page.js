"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBirthDetails } from '@/context/BirthDetailsContext';
import LocationSearch from '@/components/LocationSearch';
import TimeInput from '@/components/TimeInput';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Grid2X2,
    LayoutGrid,
    Table as TableIcon,
    ChevronDown,
    ChevronUp,
    Info,
    Layers,
    Sparkles,
} from 'lucide-react';
import PageContentSection from '@/components/common/PageContentSection';
import API from '@/lib/api';

// --- CUSTOM STYLES ---
const datePickerStyles = `
  .react-datepicker {
    font-family: inherit;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background-color: white !important;
  }
  .dark .react-datepicker {
    background-color: #1e293b !important;
    border-color: #334155;
  }
  .react-datepicker__header {
    background-color: #f8fafc !important;
    border-bottom: 1px solid #e2e8f0;
  }
  .dark .react-datepicker__header {
    background-color: #0f172a !important;
    border-color: #334155;
  }
  .react-datepicker__current-month, 
  .react-datepicker__day-name, 
  .react-datepicker__day {
    color: #334155 !important;
  }
  .dark .react-datepicker__current-month,
  .dark .react-datepicker__day-name,
  .dark .react-datepicker__day {
    color: #cbd5e1 !important;
  }
  .react-datepicker__day:hover {
    background-color: #f1f5f9 !important;
  }
  .dark .react-datepicker__day:hover {
    background-color: #334155 !important;
  }
  .react-datepicker__day--selected {
    background-color: #f97316 !important;
    color: white !important;
  }
  .react-datepicker__year-read-view--down-arrow,
  .react-datepicker__month-read-view--down-arrow {
    border-color: #94a3b8 !important;
  }
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background-color: white !important;
    color: #334155 !important;
    border: 1px solid #e2e8f0 !important;
  }
  .dark .react-datepicker__year-dropdown,
  .dark .react-datepicker__month-dropdown {
    background-color: #1e293b !important;
    color: #cbd5e1 !important;
    border-color: #334155 !important;
  }
  .react-datepicker__month-read-view--selected-month,
  .react-datepicker__year-read-view--selected-year {
    color: inherit !important;
  }
  .dark .react-datepicker__month-read-view--selected-month,
  .dark .react-datepicker__year-read-view--selected-year {
    color: #cbd5e1 !important;
  }
`;

// --- CHART COMPONENTS ---

// SOUTH CHART (Refined)
const SouthChart = ({ points, signs, title, ascendantSign }) => {
    const Box = ({ signIndex, className }) => {
        const signName = signs[signIndex];
        const val = points[signName];
        const isLagna = (signIndex + 1) === ascendantSign;

        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative aspect-square border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-1 transition-all ${isLagna ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-white dark:bg-slate-900'} ${className}`}
            >
                {isLagna && <div className="absolute top-1 left-1 bg-orange-500 text-white text-[8px] px-1 rounded font-bold">ASC</div>}
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter mb-1">{signName.substring(0, 3)}</span>
                <span className={`text-xl font-black ${val >= 28 ? 'text-emerald-600 dark:text-emerald-400' : val < 20 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                    {val}
                </span>
            </motion.div>
        );
    };

    return (
        <div className="w-full max-w-[380px] mx-auto p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
            {title && <h3 className="text-center font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest text-xs">{title}</h3>}
            <div className="grid grid-cols-4 grid-rows-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-hidden">
                <Box signIndex={11} className="rounded-tl-xl" />
                <Box signIndex={0} />
                <Box signIndex={1} />
                <Box signIndex={2} className="rounded-tr-xl" />
                <Box signIndex={10} />
                <div className="col-span-2 row-span-2 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <div className="text-center">
                        <Sparkles className="mx-auto text-orange-400 mb-1" size={20} />
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Points</span>
                    </div>
                </div>
                <Box signIndex={3} />
                <Box signIndex={9} />
                <Box signIndex={4} />
                <Box signIndex={8} className="rounded-bl-xl" />
                <Box signIndex={7} />
                <Box signIndex={6} />
                <Box signIndex={5} className="rounded-br-xl" />
            </div>
        </div>
    );
};

// NORTH CHART (Refined)
const NorthChart = ({ points, signs, ascendantSign, title }) => {
    const getSignForHouse = (houseNum) => {
        let signIdx = (ascendantSign + houseNum - 2) % 12;
        if (signIdx < 0) signIdx += 12;
        return signs[signIdx];
    };

    const HouseText = ({ h, x, y }) => {
        const signName = getSignForHouse(h);
        const signNum = signs.indexOf(signName) + 1;
        const val = points[signName];
        return (
            <g className="cursor-default">
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={x} dy="-8" className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold">{signNum}</tspan>
                    <tspan x={x} dy="18" className={`text-lg font-black ${val >= 28 ? 'fill-emerald-600' : val < 20 ? 'fill-rose-500' : 'fill-slate-800 dark:fill-white'}`}>{val}</tspan>
                </text>
            </g>
        );
    };

    return (
        <div className="w-full max-w-[380px] mx-auto p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
            {title && <h3 className="text-center font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-widest text-xs">{title}</h3>}
            <svg viewBox="0 0 200 200" className="w-full h-full stroke-slate-200 dark:stroke-slate-800 stroke-[1.5]">
                <rect x="0" y="0" width="200" height="200" fill="none" rx="16" className="stroke-slate-300 dark:stroke-slate-700 stroke-[2]" />
                <path d="M0,0 L200,200" strokeDasharray="4 2" className="opacity-30" />
                <path d="M200,0 L0,200" strokeDasharray="4 2" className="opacity-30" />
                <path d="M100,0 L0,100 L100,200 L200,100 Z" className="fill-slate-50/50 dark:fill-slate-800/20" />

                {/* Fixed Diagonals for triangles */}
                <path d="M0,0 L100,100 L200,0" />
                <path d="M0,200 L100,100 L200,200" />
                <path d="M0,0 L100,100 L0,200" />
                <path d="M200,0 L100,100 L200,200" />

                <HouseText h={1} x={100} y={45} />
                <HouseText h={2} x={50} y={25} />
                <HouseText h={3} x={25} y={50} />
                <HouseText h={4} x={45} y={100} />
                <HouseText h={5} x={25} y={150} />
                <HouseText h={6} x={50} y={175} />
                <HouseText h={7} x={100} y={155} />
                <HouseText h={8} x={150} y={175} />
                <HouseText h={9} x={175} y={150} />
                <HouseText h={10} x={155} y={100} />
                <HouseText h={11} x={175} y={50} />
                <HouseText h={12} x={150} y={25} />
            </svg>
        </div>
    );
};


export default function AshtakavargaCalculator() {
    const { user } = useAuth();
    const { birthDetails } = useBirthDetails();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [chartStyle, setChartStyle] = useState('south'); // south, north

    // Form logic...
    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        date: '',
        time: '',
        place: '',
        lat: '',
        lng: '',
        timezone: ''
    });

    useEffect(() => {
        if (birthDetails && !formData.date) {
            // Helper to parse "HH:mm" string to Date object for TimeInput
            const parseTime = (timeStr) => {
                if (!timeStr) return new Date();
                const [h, m] = timeStr.split(':').map(Number);
                const d = new Date();
                d.setHours(h);
                d.setMinutes(m);
                d.setSeconds(0);
                return d;
            };

            setFormData({
                name: birthDetails.name || '',
                gender: birthDetails.gender || 'male',
                date: birthDetails.date || '',
                time: parseTime(birthDetails.time),
                place: birthDetails.place || '',
                lat: birthDetails.lat || '',
                lng: birthDetails.lng || '',
                timezone: birthDetails.timezone || ''
            });
        }
    }, [birthDetails]);

    const handleLocationSelect = (loc) => {
        setFormData(prev => ({
            ...prev,
            place: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng,
            timezone: loc.timezone
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Format time to HH:mm for backend
            let formattedTime = formData.time;
            if (formData.time instanceof Date) {
                const h = formData.time.getHours().toString().padStart(2, '0');
                const m = formData.time.getMinutes().toString().padStart(2, '0');
                formattedTime = `${h}:${m}`;
            }

            const payload = { ...formData, time: formattedTime };

            const res = await API.post('/astro/ashtakavarga', payload);
            if (res.data.success) {
                setResult(res.data.data);
            } else {
                toast.error(res.data.message || "Calculation failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };


    const [selectedPlanet, setSelectedPlanet] = useState('Sun');

    const planetsList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    // Prediction helper based on SAV values
    const getPrediction = (points) => {
        if (points >= 30) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: 'Highly auspicious results.' };
        if (points >= 28) return { label: 'Strong', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', desc: 'Favorable outcomes.' };
        if (points >= 25) return { label: 'Average', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', desc: 'Balanced results.' };
        return { label: 'Weak', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', desc: 'Exercise caution.' };
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <style>{datePickerStyles}</style>
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-black tracking-widest uppercase"
                    >
                        <Sparkles size={14} /> Premium Astrology Report
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight">Ashtakavarga Calculator</h1>
                    <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 font-medium">Detailed Bhinnashtakavarga and Sarvashtakavarga Analysis</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Row 1: Name & Gender */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3.5 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 border-2 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                            <div className="flex gap-4">
                                {['male', 'female'].map((g) => (
                                    <label key={g} className="flex-1 relative cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={formData.gender === g}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="peer sr-only"
                                        />
                                        <div className={`
                                            p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all duration-300
                                            ${formData.gender === g
                                                ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400 shadow-inner'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}
                                        `}>
                                            <span className="text-lg">{g === 'male' ? '♂' : '♀'}</span>
                                            <span className="font-bold capitalize text-sm tracking-wide">{g}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Row 2: Date & Time */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Birth Date</label>
                            <DatePicker
                                selected={formData.date ? new Date(formData.date) : null}
                                onChange={(date) => setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' })}
                                dateFormat={["dd-MMM-yyyy", "dd-MM-yyyy", "dd/MM/yyyy"]}
                                className="w-full p-3.5 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 border-2 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholderText="Select Birth Date"
                                showYearDropdown
                                showMonthDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={100}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Birth Time</label>
                            <TimeInput
                                value={formData.time}
                                onChange={(time) => setFormData({ ...formData, time })}
                                className="w-full p-3.5 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 border-2 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold"
                                darkMode={true}
                            />
                        </div>

                        {/* Row 3: Place & Button */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Birth Place</label>
                            <LocationSearch
                                onLocationSelect={handleLocationSelect}
                                placeholder="Search City..."
                                defaultValue={formData.place}
                                darkMode={true}
                                showLeftIcon={true}
                            />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !formData.date}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 tracking-widest text-sm flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ANALYZING...
                                    </>
                                ) : (
                                    <>
                                        GET REPORT
                                        <Sparkles size={16} className="text-white/70 group-hover:text-white transition-colors animate-pulse" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-12 pb-20"
                    >
                        {/* SAV SUMMARY SECTION */}
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-white/20 dark:border-slate-800 shadow-3xl">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                {/* Left Side: Chart View */}
                                <div className="lg:col-span-5 space-y-8">
                                    <div className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                        <button onClick={() => setChartStyle('south')} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${chartStyle === 'south' ? 'bg-white dark:bg-slate-700 shadow-xl text-orange-600' : 'text-slate-400'}`}>SOUTH STYLE</button>
                                        <button onClick={() => setChartStyle('north')} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${chartStyle === 'north' ? 'bg-white dark:bg-slate-700 shadow-xl text-orange-600' : 'text-slate-400'}`}>NORTH STYLE</button>
                                    </div>

                                    {chartStyle === 'south' ? (
                                        <SouthChart points={result.sav} signs={result.signs} title="Sarvashtakavarga (SAV)" ascendantSign={result.ascendantSign} />
                                    ) : (
                                        <NorthChart points={result.sav} signs={result.signs} ascendantSign={result.ascendantSign} title="Sarvashtakavarga (SAV)" />
                                    )}
                                </div>

                                {/* Right Side: Analysis Cards */}
                                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {result.signs.map(sign => {
                                        const pred = getPrediction(result.sav[sign]);
                                        return (
                                            <motion.div
                                                key={sign}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl border border-slate-100 dark:border-slate-750 shadow-lg flex flex-col items-center text-center gap-1"
                                            >
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sign.substring(0, 6)}</span>
                                                <span className={`text-4xl font-black ${pred.color}`}>{result.sav[sign]}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${pred.bg} ${pred.color}`}>{pred.label}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* PLANETARY BAV DETAILS */}
                        <div className="space-y-8">
                            <div className="flex flex-wrap gap-2 justify-center p-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-[2rem] w-fit mx-auto backdrop-blur-sm">
                                {planetsList.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPlanet(p)}
                                        className={`px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${selectedPlanet === p ? 'bg-slate-900 text-white dark:bg-orange-600 shadow-2xl' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedPlanet}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800"
                                >
                                    <div>
                                        {chartStyle === 'south' ? (
                                            <SouthChart points={result.bav[selectedPlanet]} signs={result.signs} title={`${selectedPlanet} BAV`} ascendantSign={result.ascendantSign} />
                                        ) : (
                                            <NorthChart points={result.bav[selectedPlanet]} signs={result.signs} title={`${selectedPlanet} BAV`} ascendantSign={result.ascendantSign} />
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        <div className="text-center lg:text-left">
                                            <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedPlanet} Strength</h3>
                                            <p className="text-sm text-slate-500">Bhinnashtakavarga breakdown across signs</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {result.signs.map(s => (
                                                <div key={s} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{s.substring(0, 3)}</span>
                                                    <span className={`text-xl font-black ${result.bav[selectedPlanet][s] >= 4 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {result.bav[selectedPlanet][s]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* SAV FULL CROSS-TABLE */}
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-3xl">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Cross-Reference Table</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">Detailed Points Distribution</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <TableIcon className="text-slate-400" size={20} />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-center">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Sign</th>
                                            {planetsList.map(p => <th key={p} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.substring(0, 2)}</th>)}
                                            <th className="p-4 text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50/50 dark:bg-orange-950/20">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {result.signs.map(s => (
                                            <tr key={s} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                                                <td className="p-5 text-left font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">{s}</td>
                                                {planetsList.map(p => (
                                                    <td key={p} className="p-4 text-sm font-bold text-slate-500">
                                                        {result.bav[p][s]}
                                                    </td>
                                                ))}
                                                <td className={`p-4 font-black bg-orange-50/20 dark:bg-orange-950/10 ${result.sav[s] >= 28 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                    {result.sav[s]}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </motion.div>
                )}

                <PageContentSection slug="calculators/ashtakavarga" />
            </div>
        </div>
    );
}
