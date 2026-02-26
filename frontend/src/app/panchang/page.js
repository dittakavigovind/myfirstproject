"use client";

import { useEffect, useState, useRef } from 'react';
import API from '../../lib/api';
import LocationSearch from '../../components/LocationSearch';
import { Calendar, MapPin, Sparkles, Sun, Moon, Clock, Star, ArrowDown, Search, Info, CheckCircle, XCircle, MinusCircle, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '../../components/CosmicLoader';
import FAQDisplay from '../../components/FAQDisplay';
import PanchangShareCard from '../../components/PanchangShareCard';
import PanchangShareModal from '../../components/PanchangShareModal';
import CustomDateInput from '../../components/common/CustomDateInput';
import analytics from '../../lib/analytics';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function PanchangPageWrapper() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <CosmicLoader size="lg" message="Aligning the Stars..." fullscreen={false} />
            </div>
        }>
            <PanchangPage />
        </Suspense>
    );
}

function PanchangPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageContent, setPageContent] = useState({ faqs: [], description: "" });

    // Default State
    const [date, setDate] = useState(new Date());
    const [place, setPlace] = useState('Hyderabad');
    const [coords, setCoords] = useState({ lat: 17.3641, lng: 78.4710, timezone: "Asia/Kolkata" });
    const [showShareModal, setShowShareModal] = useState(false);

    // Share Card Ref
    const shareCardRef = useRef(null);

    const handleShareClick = () => {
        setShowShareModal(true);
        analytics.track('CLICK', 'PANCHANG', 'open_share_modal', { location: place, date });
    };

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await API.get('/page-content/panchang');
                if (res.data.success && res.data.data) {
                    setPageContent({
                        faqs: res.data.data.faqs || [],
                        description: res.data.data.description || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch page content:", err);
            }
        };
        fetchContent();
    }, []);

    // Initialize from URL Params if present
    useEffect(() => {
        const initFromUrl = async () => {
            const cityParam = searchParams.get('city');
            const dateParam = searchParams.get('date');

            let newDate = null;
            if (dateParam) {
                const parts = dateParam.split('-');
                if (parts.length === 3) {
                    const [d, mName, y] = parts;
                    const monthMap = {
                        'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
                        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
                    };
                    const mIdx = monthMap[mName.toLowerCase()];
                    if (mIdx !== undefined) {
                        newDate = new Date(parseInt(y, 10), mIdx, parseInt(d, 10));
                    }
                }
            }

            if (newDate && !isNaN(newDate.getTime())) {
                setDate(newDate);
            }

            if (cityParam) {
                const decodedCity = decodeURIComponent(cityParam);
                setPlace(decodedCity);
                try {
                    // Fetch accurate coords for this city
                    const res = await API.post('/astro/geocode', { place: decodedCity });
                    if (res.data.success) {
                        const { lat, lng, timezone, formattedAddress } = res.data.data;
                        setCoords({ lat, lng, timezone });
                        setPlace(formattedAddress); // Update to formal name
                    }
                } catch (error) {
                    console.error("Failed to geocode URL city:", error);
                }
            }
        };

        if (searchParams.toString()) {
            initFromUrl();
        }
    }, [searchParams]);

    const updateUrl = (newPlace, newDate) => {
        // Disabled URL updating on mobile to prevent Next.js App Router 
        // from crashing inside Capacitor's static environment and redirecting to root.
        /*
        const d = String(newDate.getDate()).padStart(2, '0');
        const mName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(newDate);
        const y = newDate.getFullYear();
        const cityName = newPlace.split(',')[0].trim();
        const citySlug = encodeURIComponent(cityName);
        const newUrl = `/panchang?city=${citySlug}&date=${d}-${mName}-${y}`;
        if (typeof window !== 'undefined') {
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        }
        */
    };

    // Calendar Scroll Handling
    const datePickerRef = useRef(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    useEffect(() => {
        if (isCalendarOpen) {
            const handleScroll = () => {
                if (datePickerRef.current) {
                    datePickerRef.current.setOpen(false);
                }
            };
            // Use capture: true to ensure we catch scroll events from any scrollable container
            window.addEventListener('scroll', handleScroll, { capture: true });
            return () => window.removeEventListener('scroll', handleScroll, { capture: true });
        }
    }, [isCalendarOpen]);

    useEffect(() => {
        fetchPanchang();
    }, [date, coords]);

    const handleLocationSelect = (details) => {
        setCoords({ lat: details.lat, lng: details.lng, timezone: details.timezone });
        setPlace(details.formattedAddress);
        updateUrl(details.formattedAddress.split(',')[0], date); // Use simplified city name for URL if possible
    };

    useEffect(() => {
        if (data) {
            console.log("Received Panchang Data:", data);
        }
    }, [data]);

    const handleDateChange = (d) => {
        setDate(d);
        updateUrl(place, d);
    };

    const fetchPanchang = async () => {
        setLoading(true);
        try {
            // Fix: Construct local YYYY-MM-DD manually to avoid UTC conversion shift
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            const dateStr = localDate.toISOString().split('T')[0];

            const payload = {
                date: dateStr,
                lat: coords.lat,
                lng: coords.lng,
                timezone: coords.timezone
            };

            const res = await API.post('/panchang/calculate', payload);
            if (res.data.success && res.data.data && res.data.data.panchang) {
                setData(res.data.data.panchang);
                analytics.track('VIEW', 'PANCHANG', 'load_results', { location: place, date });
            }
        } catch (err) {
            console.error('Fetch Panchang Error:', err);
            if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
                alert("Panchang Error: " + err.message + " | " + (err.response ? err.response.status : ""));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">


            {/* Header Section (Compact & Premium) */}
            <div className="relative text-white">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black shadow-2xl rounded-b-[2.5rem] md:rounded-b-[3.5rem] z-0 overflow-hidden transform scale-x-[1.02]">
                    <div className="absolute top-[-50%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay"></div>
                </div>

                {/* Foreground Content (Compact Layout) */}
                {/* Foreground Content (Compact Layout) */}
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 pb-28 pt-6 md:pt-12 px-4 sm:px-6 lg:px-8 pointer-events-none">

                    {/* LEFT COLUMN: Heading & Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-start text-left max-w-2xl pointer-events-auto flex-1"
                    >
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-indigo-300/60 hover:text-indigo-300 transition-all mb-8 font-bold text-xs uppercase tracking-[0.2em] group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO CALCULATORS
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg group hover:bg-white/15 transition-all cursor-default">
                                <Sparkles className="w-3 h-3 text-astro-yellow animate-pulse" />
                                <span className="text-indigo-100 text-[10px] font-bold tracking-[0.2em] uppercase">Daily Celestial Almanac</span>
                            </div>

                            <button
                                onClick={handleShareClick}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white transition-all transform hover:scale-105"
                            >
                                <Share2 size={12} className="text-astro-yellow" />
                                Share Card
                            </button>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight drop-shadow-xl">
                            Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300 drop-shadow-sm">Panchang</span>
                        </h1>



                        <p className="text-slate-300/90 text-sm md:text-base font-medium leading-relaxed max-w-lg mb-0 text-left">
                            Unlock the cosmic rhythm of your day. Precise auspicious timings calculated for <span className='text-white font-bold decoration-astro-yellow/30 underline decoration-2 underline-offset-4'>{place}</span>.
                        </p>
                    </motion.div>

                    {/* RIGHT COLUMN: Search & Date Card - Horizontal Inputs */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-auto pointer-events-auto flex-shrink-0"
                    >
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[1.5rem] shadow-2xl relative group min-w-[320px] md:min-w-[500px]">
                            {/* Glow Effect - Clipped */}
                            <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-[50px] -mt-10 -mr-10"></div>
                            </div>

                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                                <Search className="w-4 h-4 text-astro-yellow" /> Check Details
                            </h3>

                            <div className="flex flex-col md:flex-row items-center gap-3 relative z-10">
                                {/* Location Search */}
                                <div className="w-full md:flex-[1.5] space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider ml-1">Location</label>
                                    <div className="relative group bg-white/90 hover:bg-white rounded-xl flex items-center h-12 transition-all shadow-lg shadow-black/5">
                                        <div className="absolute left-3 text-indigo-600 pointer-events-none z-10">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="w-full h-full text-left [&_input]:h-full [&_input]:w-full [&_input]:pl-10 [&_input]:border-none [&_input]:focus:ring-0 [&_input]:bg-transparent [&_input]:text-slate-800 [&_input]:font-bold [&_input]:placeholder-slate-400 [&_input]:rounded-xl [&_input]:text-sm">
                                            <LocationSearch
                                                onLocationSelect={handleLocationSelect}
                                                placeholder={place || "City..."}
                                                darkMode={false}
                                                showIcon={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Date Picker */}
                                <div className="w-full md:flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider ml-1">Date</label>
                                    <div className="relative group bg-white/90 hover:bg-white rounded-xl flex items-center h-12 transition-all shadow-lg shadow-black/5">
                                        <DatePicker customInput={<CustomDateInput Icon={Calendar} />} selected={date} onChange={handleDateChange} dateFormat="dd MMM yyyy" className="w-full h-full border-none focus:ring-0 text-slate-800 font-bold px-4 outline-none cursor-pointer bg-transparent rounded-xl text-sm placeholder-slate-400 select-none caret-transparent" showMonthDropdown showYearDropdown dropdownMode="select" portalId="root-portal" popperClassName="!z-[100]" closeOnScroll={true} />
                                    </div>
                                </div>
                            </div>


                        </div>
                    </motion.div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[5] -mt-10 md:-mt-24 pb-10">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center min-h-[400px]"
                        >
                            <CosmicLoader size="lg" message="Aligning the Stars..." fullscreen={false} />
                        </motion.div>
                    ) : data ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6 md:space-y-8"
                        >
                            {/* Sun & Moon Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Sun */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-[2rem] p-5 md:p-8 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 border border-slate-100 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform duration-700 blur-3xl"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transform group-hover:rotate-6 transition-transform duration-500">
                                                <Sun className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Sun Details</h3>
                                                <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mt-0.5 md:mt-1">Solar Cycle</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <div className="bg-orange-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-orange-100 group-hover:bg-orange-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <Sun size={10} className="md:w-3 md:h-3" /> Sunrise
                                                </span>
                                                <span className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">{data?.sun?.sunrise || '--:--'}</span>
                                            </div>
                                            <div className="bg-orange-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-orange-100 group-hover:bg-orange-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <ArrowDown size={10} className="md:w-3 md:h-3" /> Sunset
                                                </span>
                                                <span className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">{data?.sun?.sunset || '--:--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Moon */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-[2rem] p-5 md:p-8 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 border border-slate-100 transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 transition-transform duration-700 blur-3xl"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transform group-hover:-rotate-6 transition-transform duration-500">
                                                <Moon className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Moon Details</h3>
                                                <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mt-0.5 md:mt-1">Lunar Cycle</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <div className="bg-indigo-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <Moon size={10} className="md:w-3 md:h-3" /> Moonrise
                                                </span>
                                                <span className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">{data?.moon?.moonrise || '--:--'}</span>
                                            </div>
                                            <div className="bg-indigo-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <ArrowDown size={10} className="md:w-3 md:h-3" /> Moonset
                                                </span>
                                                <span className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">{data?.moon?.moonset || '--:--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>


                            {/* Samvat Strip - Premium Compact */}
                            {data?.samvat && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 group overflow-hidden relative"
                                >
                                    <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-orange-400 to-amber-500"></div>

                                    <div className="flex items-center gap-4 w-full md:w-auto pl-2">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shrink-0">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Hindu Year</p>
                                            <p className="text-lg font-black text-slate-800 leading-none">
                                                {data.samvat.name} <span className="text-slate-400 font-bold text-xs opacity-60">Samvatsara</span>
                                            </p>
                                            {/* Lunar Month & Season */}
                                            {(data.masa || data.ritu) && (
                                                <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                                                    <span className="text-indigo-600">{data.masa?.amanta} Masa</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-amber-600">{data.ritu}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 p-2 pr-6 rounded-xl border border-slate-100 w-full md:w-auto justify-between">
                                        <div className="text-right px-4 border-r border-slate-200">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Vikram</p>
                                            <p className="text-base font-black text-slate-700 leading-none tabular-nums">{data.samvat.vikram}</p>
                                        </div>
                                        <div className="text-right pl-4">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Shaka</p>
                                            <p className="text-base font-black text-slate-700 leading-none tabular-nums">{data.samvat.shaka}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Share Modal */}
                            <PanchangShareModal
                                isOpen={showShareModal}
                                onClose={() => setShowShareModal(false)}
                                data={data}
                                location={place}
                                date={date}
                            />

                            {/* Main Grid - planetary Elements */}
                            <h2 className="text-xl font-black text-slate-800 mb-5 px-1 flex items-center gap-2 mt-8">
                                <Sparkles className="text-indigo-600 w-5 h-5" />
                                Core Elements
                            </h2>
                            {/* CHANGED: Reverted to Grid Layout for 3-column cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                                <PanchangCard
                                    label="Tithi"
                                    value={data?.tithi?.name}
                                    sub={data?.tithi?.paksha}
                                    start={data?.tithi?.start}
                                    end={data?.tithi?.end}
                                    icon={Clock}
                                    color="indigo"
                                    delay={0.1}
                                />
                                <PanchangCard
                                    label="Nakshatra"
                                    value={data?.nakshatra?.name}
                                    sub={`Pada ${data?.nakshatra?.padha || ''}`}
                                    start={data?.nakshatra?.start}
                                    end={data?.nakshatra?.end}
                                    icon={Star}
                                    color="amber"
                                    delay={0.2}
                                />
                                <PanchangCard
                                    label="Yoga"
                                    value={data?.yoga?.name}
                                    start={data?.yoga?.start}
                                    end={data?.yoga?.end}
                                    icon={Sparkles}
                                    color="rose"
                                    delay={0.3}
                                />
                                <PanchangCard
                                    label="Karana"
                                    value={data?.karana?.name}
                                    start={data?.karana?.start}
                                    end={data?.karana?.end}
                                    icon={Sun}
                                    color="emerald"
                                    delay={0.4}
                                />
                                <PanchangCard
                                    label="Vara (Day)"
                                    value={data?.vara}
                                    icon={Calendar}
                                    color="indigo"
                                    delay={0.5}
                                />
                                <PanchangCard
                                    label="Moon Sign"
                                    value={data?.moon?.rashi}
                                    icon={Moon}
                                    color="violet"
                                    delay={0.6}
                                />
                            </div>

                            {/* Timings Section - Wide Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                {/* Auspicious Column */}
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Auspicious Timings
                                    </h3>
                                    <div className="space-y-4">
                                        <WideTimingCard
                                            label="Abhijit Muhurta"
                                            value="Best"
                                            start={data?.abhijitMuhurta?.start}
                                            end={data?.abhijitMuhurta?.end}
                                            type="good"
                                            delay={0.5}
                                        />
                                        <WideTimingCard
                                            label="Amrit Kaal"
                                            value="Good"
                                            start={data?.amritKaal?.start}
                                            end={data?.amritKaal?.end}
                                            type="good"
                                            delay={0.55}
                                        />
                                        <WideTimingCard
                                            label="Gulika Kalam"
                                            value="Neutral"
                                            start={data?.gulikaKalam?.start}
                                            end={data?.gulikaKalam?.end}
                                            type="neutral"
                                            delay={0.6}
                                        />
                                    </div>
                                </div>

                                {/* Inauspicious Column */}
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                        Inauspicious Timings
                                    </h3>
                                    <div className="space-y-4">
                                        <WideTimingCard
                                            label="Rahu Kalam"
                                            value="Avoid"
                                            start={data?.rahuKalam?.start}
                                            end={data?.rahuKalam?.end}
                                            type="bad"
                                            delay={0.65}
                                        />
                                        <WideTimingCard
                                            label="Yamaganda"
                                            value="Avoid"
                                            start={data?.yamaganda?.start}
                                            end={data?.yamaganda?.end}
                                            type="bad"
                                            delay={0.7}
                                        />
                                        <WideTimingCard
                                            label="Varjyam"
                                            value="Avoid"
                                            start={data?.varjyam?.start}
                                            end={data?.varjyam?.end}
                                            type="bad"
                                            delay={0.75}
                                        />
                                        {data?.durmuhurtham && data.durmuhurtham.map((dur, idx) => (
                                            <WideTimingCard
                                                key={`dur-${idx}`}
                                                label={`Durmuhurtham ${data.durmuhurtham.length > 1 ? idx + 1 : ''}`}
                                                value="Avoid"
                                                start={dur.start}
                                                end={dur.end}
                                                type="bad"
                                                delay={0.8 + (idx * 0.05)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tables Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Choghadiya */}
                                <TimingTable
                                    title="Choghadiya"
                                    dayData={data?.choghadiya?.day}
                                    nightData={data?.choghadiya?.night}
                                    delay={0.7}
                                    color="orange"
                                    showQuality={true} // Enable explicit Good/Bad/Neutral labels
                                />

                                {/* Hora */}
                                <TimingTable
                                    title="Hora"
                                    dayData={data?.hora?.day}
                                    nightData={data?.hora?.night}
                                    delay={0.8}
                                    color="indigo"
                                    isHora
                                />
                            </div>

                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* FAQs */}
            <FAQDisplay faqs={pageContent.faqs} description={pageContent.description} />
        </div>
    );
}

// --- Components ---

function WideTimingCard({ label, value, start, end, type, delay }) {
    const styles = {
        good: { border: 'border-l-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
        neutral: { border: 'border-l-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
        bad: { border: 'border-l-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' }
    };

    const s = styles[type] || styles.neutral;

    // Helper to format full date-time string to time only
    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';
        if (/^\d{1, 2}:\d{2}/.test(dtStr)) return dtStr;
        if (dtStr.includes('T')) {
            const d = new Date(dtStr);
            if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }
        return dtStr;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={`bg-white border-l-[6px] ${s.border} rounded-r-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between border-y border-r border-slate-100 group`}
        >
            <div>
                <h4 className="text-base md:text-lg font-black text-slate-800">{label}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{value}</p>

            </div>

            <div className={`px-4 py-2 rounded-lg ${s.bg} border border-transparent group-hover:border-black/5 transition-colors`}>
                <span className="text-[10px] md:text-xs font-bold text-slate-700 tabular-nums tracking-wide">
                    {formatTime(start)} - {formatTime(end)}
                </span>
            </div>
        </motion.div>
    );
}

// Redesigned to be a Boxy Card (Grid Item) matching the second reference image
function PanchangCard({ label, value, sub, start, end, icon: Icon, color, delay }) {
    const theme = {
        amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', border: 'border-amber-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'text-rose-600', border: 'border-rose-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-100' },
        sky: { bg: 'bg-sky-50', text: 'text-sky-700', icon: 'text-sky-600', border: 'border-sky-100' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-600', border: 'border-violet-100' },
    };

    const t = theme[color] || theme.amber;

    // Helper to format full date-time string to time only
    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';
        if (/^\d{1, 2}:\d{2}/.test(dtStr)) return dtStr;
        if (dtStr.includes('T')) {
            const d = new Date(dtStr);
            if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }
        return dtStr;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className={`bg-white rounded-[1.5rem] p-5 border ${t.border} shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden`}
        >
            {/* Header: Icon + Badge */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.bg} ${t.icon} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                {sub && (
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${t.bg} ${t.text} px-2.5 py-1 rounded-lg border border-transparent`}>
                        {sub}
                    </span>
                )}
            </div>

            {/* Content Middle */}
            <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
                <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                    {value || 'N/A'}
                </h3>
            </div>

            {/* Footer: Time */}
            {(start || end) && (
                <div className="mt-auto pt-1 border-t border-slate-50/80">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 tabular-nums tracking-wide">
                        <span>{formatTime(start)}</span>
                        <div className="h-px bg-slate-200 flex-1 mx-3"></div>
                        <span>{formatTime(end)}</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function TimingTable({ title, dayData, nightData, delay, color, isHora, showQuality = false }) {
    const [activeTab, setActiveTab] = useState('day'); // 'day' or 'night'

    const getQualityInfo = (type) => {
        const qualities = {
            // Good
            Amrit: { label: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: CheckCircle },
            Shubh: { label: 'Good', color: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-500', icon: CheckCircle },
            Labh: { label: 'Good', color: 'text-sky-600', bg: 'bg-sky-50', bar: 'bg-sky-500', icon: CheckCircle },
            Char: { label: 'Neutral', color: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-500', icon: Info },

            // Bad
            Rog: { label: 'Bad', color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: XCircle },
            Kaal: { label: 'Bad', color: 'text-slate-600', bg: 'bg-slate-50', bar: 'bg-slate-500', icon: XCircle },
            Udveg: { label: 'Bad', color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500', icon: XCircle },

            // Planets (Hora) - Using 'Energy' as a quality proxy or plain Colors
            Sun: { label: 'Solar', color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: Sun },
            Moon: { label: 'Lunar', color: 'text-slate-600', bg: 'bg-slate-50', bar: 'bg-slate-400', icon: Moon },
            Mars: { label: 'Martian', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500', icon: Star },
            Mercury: { label: 'Mercurial', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: Sparkles },
            Jupiter: { label: 'Jovian', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500', icon: Star },
            Venus: { label: 'Venusian', color: 'text-pink-600', bg: 'bg-pink-50', bar: 'bg-pink-400', icon: Sparkles },
            Saturn: { label: 'Saturnine', color: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-600', icon: Moon },
        };
        return qualities[type] || { label: 'Neutral', color: 'text-slate-500', bg: 'bg-slate-50', bar: 'bg-slate-400', icon: MinusCircle };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.7 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group h-full"
            style={{ width: '100%' }} // Ensure it takes full width of grid cell
        >
            {/* Header with Switch */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4 relative z-10 w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`p-2 md:p-2.5 rounded-xl ${color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {color === 'orange' ? <Clock size={18} className="md:w-5 md:h-5" /> : <Star size={18} className="md:w-5 md:h-5" />}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                </div>

                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner w-full sm:w-auto">
                    {['day', 'night'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 sm:flex-none relative px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab
                                ? 'text-indigo-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId={`tab-bg-${title}`}
                                    className="absolute inset-0 bg-white rounded-lg shadow-sm z-[-1] border border-slate-100"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {tab === 'day' ? <Sun size={12} className={activeTab === 'day' ? 'text-amber-500' : ''} /> : <Moon size={12} className={activeTab === 'night' ? 'text-indigo-500' : ''} />}
                                {tab}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative z-10 space-y-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        {(activeTab === 'day' ? dayData : nightData)?.map((item, idx) => {
                            const info = getQualityInfo(isHora ? item.planet : item.name);
                            const Icon = info.icon;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.03 * idx }}
                                    className="relative flex items-center justify-between p-3 md:p-4 rounded-xl border border-slate-50 bg-white hover:border-slate-100 hover:shadow-lg hover:shadow-slate-100/50 transition-all group/row overflow-hidden w-full"
                                >
                                    {/* Left Status Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${info.bar}`}></div>

                                    {/* Content Left */}
                                    <div className="flex items-center gap-3 md:gap-4 pl-2 md:pl-3 w-full sm:w-auto overflow-hidden">
                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${info.bg} ${info.color}`}>
                                            <Icon size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs md:text-sm font-black text-slate-900 tracking-tight uppercase truncate">
                                                {isHora ? item.planet : item.name}
                                            </h4>
                                            {showQuality && (
                                                <div className={`inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${info.color}`}>
                                                    {info.label}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Right (Time) */}
                                    <div className="text-right pl-2 shrink-0">
                                        <div className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover/row:bg-white group-hover/row:border-slate-200 transition-colors">
                                            <span className="text-[10px] md:text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
                                                {item.start} - {item.end}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Soft background glow */}
            <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${color === 'orange' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
        </motion.div>
    );
}
