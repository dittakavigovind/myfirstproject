"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
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
import analytics from '../../lib/analytics';
import { useBirthDetails } from '../../context/BirthDetailsContext';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSection from '../../components/common/HeroSection';
import { t, tData } from '../../utils/translations';
import CustomDateInput from '../../components/common/CustomDateInput';
import { PanchangCard, WideTimingCard, TimingTable } from '../../components/common/PanchangUI';

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

    // Default State
    const [date, setDate] = useState(new Date());
    const [place, setPlace] = useState('Hyderabad');
    const [coords, setCoords] = useState({ lat: 17.3641, lng: 78.4710, timezone: "Asia/Kolkata" });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageContent, setPageContent] = useState({ faqs: [], description: "" });
    const [showShareModal, setShowShareModal] = useState(false);
    const [lang, setLang] = useState('en');

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
            <HeroSection icon="📅" align="left" extraPaddingBottom={true}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 w-full pointer-events-none">
                    {/* LEFT COLUMN: Heading & Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-start text-left max-w-2xl pointer-events-auto flex-1"
                    >
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-indigo-300/60 hover:text-indigo-300 transition-all mb-8 font-bold text-xs uppercase tracking-[0.2em] group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('backToCalculators', lang)}
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-lg group hover:bg-white/15 transition-all cursor-default">
                                <Sparkles className="w-3 h-3 text-astro-yellow animate-pulse" />
                                <span className="text-indigo-100 text-[10px] font-bold tracking-[0.2em] uppercase">{t('dailyCelestialAlmanac', lang)}</span>
                            </div>

                            <button
                                onClick={handleShareClick}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white transition-all transform hover:scale-105"
                            >
                                <Share2 size={12} className="text-astro-yellow" />
                                {t('shareCard', lang)}
                            </button>

                            {/* Language Toggle */}
                            <div className="flex bg-white/10 p-0.5 rounded-full backdrop-blur-md border border-white/10 ml-2">
                                <button
                                    onClick={() => setLang('en')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${lang === 'en' ? 'bg-indigo-500 text-white' : 'text-indigo-200 hover:text-white'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setLang('hi')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${lang === 'hi' ? 'bg-indigo-500 text-white' : 'text-indigo-200 hover:text-white'}`}
                                >
                                    हिं
                                </button>
                                <button
                                    onClick={() => setLang('te')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${lang === 'te' ? 'bg-indigo-500 text-white' : 'text-indigo-200 hover:text-white'}`}
                                >
                                    తె
                                </button>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight drop-shadow-xl text-white uppercase">
                            {lang === 'hi' ? t('dailyPanchang', lang) : (
                                <>Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300 drop-shadow-sm">Panchang</span></>
                            )}
                        </h1>

                        <p className="text-slate-300/90 text-sm md:text-base font-medium leading-relaxed max-w-lg mb-0 text-left">
                            {t('panchangIntroText', lang)} <span className='text-white font-bold decoration-astro-yellow/30 underline decoration-2 underline-offset-4'>{place}</span>.
                        </p>
                    </motion.div>

                    {/* RIGHT COLUMN: Search & Date Card - Horizontal Inputs */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full md:w-auto pointer-events-auto flex-shrink-0 relative z-50"
                    >
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[1.5rem] shadow-2xl relative z-50 group min-w-[320px] md:min-w-[500px]">
                            {/* Glow Effect - Clipped */}
                            <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-[50px] -mt-10 -mr-10"></div>
                            </div>

                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                                <Search className="w-4 h-4 text-astro-yellow" /> {t('checkDetails', lang)}
                            </h3>

                            <div className="flex flex-col md:flex-row items-center gap-3 relative z-10">
                                {/* Location Search */}
                                <div className="w-full md:flex-[1.5] space-y-1 relative z-50">
                                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider ml-1">{t('location', lang)}</label>
                                    <div className="relative z-50 group bg-white/90 hover:bg-white rounded-xl flex items-center h-12 transition-all shadow-lg shadow-black/5">
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
                                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider ml-1">{t('date', lang)}</label>
                                    <div className="relative group bg-white/90 hover:bg-white rounded-xl flex items-center h-12 transition-all shadow-lg shadow-black/5">
                                        <DatePicker customInput={<CustomDateInput Icon={Calendar} />} selected={date} onChange={handleDateChange} dateFormat="dd MMM yyyy" className="w-full h-full border-none focus:ring-0 text-slate-800 font-bold px-4 outline-none cursor-pointer bg-transparent rounded-xl text-sm placeholder-slate-400 select-none caret-transparent" showMonthDropdown showYearDropdown dropdownMode="select" portalId="root-portal" popperClassName="!z-[100]" closeOnScroll={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </HeroSection>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-10 md:-mt-24 pb-10">
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
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t('sunDetails', lang)}</h3>
                                                <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mt-0.5 md:mt-1">{t('solarCycle', lang)}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <div className="bg-orange-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-orange-100 group-hover:bg-orange-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <Sun size={10} className="md:w-3 md:h-3" /> {t('sunrise', lang)}
                                                </span>
                                                <span className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">{data?.sun?.sunrise || '--:--'}</span>
                                            </div>
                                            <div className="bg-orange-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-orange-100 group-hover:bg-orange-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <ArrowDown size={10} className="md:w-3 md:h-3" /> {t('sunset', lang)}
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
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{t('moonDetails', lang)}</h3>
                                                <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mt-0.5 md:mt-1">{t('lunarCycle', lang)}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                                            <div className="bg-indigo-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <Moon size={10} className="md:w-3 md:h-3" /> {t('moonrise', lang)}
                                                </span>
                                                <span className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">{data?.moon?.moonrise || '--:--'}</span>
                                            </div>
                                            <div className="bg-indigo-50/50 rounded-xl md:rounded-2xl p-4 md:p-5 border border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                                                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2">
                                                    <ArrowDown size={10} className="md:w-3 md:h-3" /> {t('moonset', lang)}
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
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">{t('hinduYear', lang)} {data.ayanam && ` | ${t('ayanam', lang)}`}</p>
                                            <p className="text-lg font-black text-slate-800 leading-none">
                                                {tData('samvatsara', data.samvat.name, lang)} <span className="text-slate-400 font-bold text-xs opacity-60">{t('samvatsara', lang)}</span>
                                                {data.ayanam && (
                                                    <>
                                                        <span className="mx-2 text-slate-300 font-light">|</span>
                                                        {tData('ayanam', data.ayanam, lang)}
                                                    </>
                                                )}
                                            </p>
                                            {/* Lunar Month & Season */}
                                            {(data.masa || data.ritu) && (
                                                <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                                                    <span className="text-indigo-600">{tData('masa', data.masa?.amanta, lang)} {t('masa', lang)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="text-amber-600">{tData('ritu', data.ritu, lang)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 p-2 pr-6 rounded-xl border border-slate-100 w-full md:w-auto justify-between">
                                        <div className="text-right px-4 border-r border-slate-200">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t('vikram', lang)}</p>
                                            <p className="text-base font-black text-slate-700 leading-none tabular-nums">{data.samvat.vikram}</p>
                                        </div>
                                        <div className="text-right pl-4">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t('shaka', lang)}</p>
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
                                lang={lang}
                            />

                            {/* Main Grid - planetary Elements */}
                            <h2 className="text-xl font-black text-slate-800 mb-5 px-1 flex items-center gap-2 mt-8">
                                <Sparkles className="text-indigo-600 w-5 h-5" />
                                {t('coreElements', lang)}
                            </h2>
                            {/* CHANGED: Reverted to Grid Layout for 3-column cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                                <PanchangCard
                                    label={t('tithi', lang)}
                                    type="tithi"
                                    value={tData('tithi', data?.tithi?.name, lang)}
                                    sub={tData('paksha', data?.tithi?.paksha, lang)}
                                    start={data?.tithi?.start}
                                    end={data?.tithi?.end}
                                    next={data?.tithi?.next}
                                    icon={Clock}
                                    color="indigo"
                                    delay={0.1}
                                    lang={lang}
                                />
                                <PanchangCard
                                    label={t('nakshatra', lang)}
                                    type="nakshatra"
                                    value={tData('nakshatra', data?.nakshatra?.name, lang)}
                                    sub={`${lang === 'hi' ? 'चरण' : 'Pada'} ${data?.nakshatra?.padha || ''}`}
                                    start={data?.nakshatra?.start}
                                    end={data?.nakshatra?.end}
                                    next={data?.nakshatra?.next}
                                    icon={Star}
                                    color="amber"
                                    delay={0.2}
                                    lang={lang}
                                />


                                <PanchangCard
                                    label={t('yoga', lang)}
                                    value={tData('yoga', data?.yoga?.name, lang)}
                                    start={data?.yoga?.start}
                                    end={data?.yoga?.end}
                                    icon={Sparkles}
                                    color="rose"
                                    delay={0.3}
                                    lang={lang}
                                />
                                <PanchangCard
                                    label={t('karana', lang)}
                                    value={tData('karana', data?.karana?.name, lang)}
                                    start={data?.karana?.start}
                                    end={data?.karana?.end}
                                    icon={Sun}
                                    color="emerald"
                                    delay={0.4}
                                    lang={lang}
                                />
                                <PanchangCard
                                    label={t('vara', lang)}
                                    value={tData('vara', data?.vara, lang)}
                                    icon={Calendar}
                                    color="indigo"
                                    delay={0.5}
                                    lang={lang}
                                />
                                <PanchangCard
                                    label={t('moonSign', lang)}
                                    value={tData('rashi', data?.moon?.rashi, lang)}
                                    icon={Moon}
                                    color="violet"
                                    delay={0.6}
                                    lang={lang}
                                />
                            </div>

                            {/* Timings Section - Wide Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                {/* Auspicious Column */}
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {t('auspiciousTimings', lang)}
                                    </h3>
                                    <div className="space-y-4">
                                        <WideTimingCard
                                            label={t('abhijitMuhurta', lang)}
                                            value={t('good', lang)}
                                            lang={lang}
                                            start={data?.abhijitMuhurta?.start}
                                            end={data?.abhijitMuhurta?.end}
                                            type="good"
                                            delay={0.5}
                                        />
                                        <WideTimingCard
                                            label={t('amritKaal', lang)}
                                            value={t('good', lang)}
                                            lang={lang}
                                            start={data?.amritKaal?.start}
                                            end={data?.amritKaal?.end}
                                            type="good"
                                            delay={0.55}
                                        />
                                        <WideTimingCard
                                            label={t('gulikaKalam', lang)}
                                            value={t('neutral', lang)}
                                            lang={lang}
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
                                        {t('inauspiciousTimings', lang)}
                                    </h3>
                                    <div className="space-y-4">
                                        <WideTimingCard
                                            label={t('rahuKalam', lang)}
                                            value={t('bad', lang)}
                                            lang={lang}
                                            start={data?.rahuKalam?.start}
                                            end={data?.rahuKalam?.end}
                                            type="bad"
                                            delay={0.65}
                                        />
                                        <WideTimingCard
                                            label={t('yamaganda', lang)}
                                            value={t('bad', lang)}
                                            lang={lang}
                                            start={data?.yamaganda?.start}
                                            end={data?.yamaganda?.end}
                                            type="bad"
                                            delay={0.7}
                                        />
                                        <WideTimingCard
                                            label={t('varjyam', lang)}
                                            value={t('bad', lang)}
                                            lang={lang}
                                            start={data?.varjyam?.start}
                                            end={data?.varjyam?.end}
                                            type="bad"
                                            delay={0.75}
                                        />
                                        {data?.durmuhurtham && data.durmuhurtham.map((dur, idx) => (
                                            <WideTimingCard
                                                key={`dur-${idx}`}
                                                label={`${t('durmuhurtham', lang)} ${data.durmuhurtham.length > 1 ? idx + 1 : ''}`}
                                                value={t('bad', lang)}
                                                lang={lang}
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
                                    title={t('choghadiya', lang)}
                                    lang={lang}
                                    dayData={data?.choghadiya?.day}
                                    nightData={data?.choghadiya?.night}
                                    delay={0.7}
                                    color="orange"
                                    showQuality={true} // Enable explicit Good/Bad/Neutral labels
                                />

                                {/* Hora */}
                                <TimingTable
                                    title={t('hora', lang)}
                                    lang={lang}
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

// --- Components removed and moved to PanchangUI.js ---
