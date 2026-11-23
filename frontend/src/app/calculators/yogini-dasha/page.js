"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ArrowLeft, Send, User, Calendar, Clock, MapPin, CheckCircle2, Star, Zap, ArrowRight, X, Share2, Shield, Info } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import CustomDateInput from '../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import LocationSearch from '../../../components/LocationSearch';
import TimeInput from '../../../components/TimeInput';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import StandardResultHeader from '../../../components/calculators/StandardResultHeader';

import PageContentSection from '../../../components/common/PageContentSection';
import { useBirthDetails } from '../../../context/BirthDetailsContext';

const YOGINI_DETAILS = {
    "Mangala": {
        nature: "Supreme Benefic (Shubha)",
        deity: "Goddess Mangala (Durga)",
        theme: "Auspicious Celebrations, Peace of Mind & Prosperity",
        coreMeaning: "Mangala is ruled by the Moon and brings auspicious ceremonies, inner mental peace, and family happiness. Obstacles diminish, spiritual interests blossom, and health and reputation flourish.",
        effects: [
            "Auspicious ceremonies, marriages, or family celebrations",
            "Inner mental peace and relief from emotional anxiety",
            "Spiritual inclination and divine protection",
            "Favorable recognition from peers and elders"
        ],
        remedies: "Worship Goddess Durga or Parvati, chant 'Om Dum Durgayei Namaha', offer white flowers or milk sweets on Mondays."
    },
    "Pingala": {
        nature: "Challenging & Transformative (Pitta / Agni)",
        deity: "Goddess Pingala (Surya Shakti)",
        theme: "Vitality Trials, Leadership Tests & High Energy",
        coreMeaning: "Pingala is ruled by the Sun and tests endurance, physical vitality, and patience. While it can cause heat, restlessness, or friction with authority, it grants tremendous determination and leadership victory when guided constructively.",
        effects: [
            "High ambition and strong drive to conquer challenges",
            "Tests of ego, patience, and authority relations",
            "Health watch: manage stress, acidity, and physical fatigue",
            "Eventual triumph over adversaries through willpower"
        ],
        remedies: "Recite Aditya Hridaya Stotram or Gayatri Mantra, offer water (Arghya) to Lord Surya at sunrise, donate jaggery or wheat on Sundays."
    },
    "Dhanya": {
        nature: "Abundant Benefic (Dhana & Vriddhi)",
        deity: "Goddess Dhanya (Lakshmi / Annapurna)",
        theme: "Financial Abundance, Educational Honors & Divine Grace",
        coreMeaning: "Dhanya is ruled by Jupiter and signifies a rich golden harvest in life. Wealth accumulates steadily, intellectual wisdom expands, virtuous mentors appear, and long-standing ambitions reach fruition.",
        effects: [
            "Steady rise in income, savings, and assets",
            "Academic or professional honors and career elevation",
            "Blessings from spiritual mentors and family elders",
            "Birth of children or joyful family milestones"
        ],
        remedies: "Worship Lord Vishnu and Goddess Annapurna, chant 'Om Namo Bhagavate Vasudevaya', feed cows, donate yellow lentils or books on Thursdays."
    },
    "Bhramari": {
        nature: "Turbulent & Restless (Chala / Motion)",
        deity: "Goddess Bhramari (The Sacred Bee Goddess)",
        theme: "Travel, Relocation, Dynamic Changes & Resilience",
        coreMeaning: "Bhramari is ruled by Mars and brings wanderlust, rapid changes, travels, or relocations. It creates high physical energy and ambition, but requires discipline to avoid hasty decisions or scattered expenses.",
        effects: [
            "Frequent journeys, relocations, or foreign exploration",
            "Fluctuating fortunes requiring careful financial budgeting",
            "High stamina and courage to face unfamiliar environments",
            "Dynamic personal transformation through new experiences"
        ],
        remedies: "Recite Hanuman Chalisa, worship Lord Kartikeya, practice patience before big moves, donate red lentils on Tuesdays."
    },
    "Bhadrika": {
        nature: "Deeply Auspicious & Protective (Kalyana)",
        deity: "Goddess Bhadrika (Bhadrakali / Saraswati)",
        theme: "Career Advancement, Sharp Intellect & Faithful Friends",
        coreMeaning: "Bhadrika is ruled by Mercury and represents auspicious welfare and refined intelligence. Career status ascends, commercial ventures succeed, and true friends provide crucial support.",
        effects: [
            "Rapid career advancement, promotions, and status rise",
            "Intellectual clarity, successful examinations, and business wins",
            "Strengthening of helpful friendships and professional networks",
            "Domestic happiness and sound health recovery"
        ],
        remedies: "Worship Goddess Saraswati and Lord Ganesha, chant 'Om Gam Ganapataye Namaha', feed green vegetables to cows on Wednesdays."
    },
    "Ulka": {
        nature: "Karmic Purification & Discipline (Tapas)",
        deity: "Goddess Ulka (Chandi)",
        theme: "Patience, Hard Labor, Karmic Clearance & Inner Strength",
        coreMeaning: "Ulka is ruled by Saturn and acts like a fiery cleansing meteor burning off past karma. It requires hard work, patience, and humility. Those who stay steady emerge with permanent inner resilience and wisdom.",
        effects: [
            "Heavy workloads requiring persistent, uncomplaining effort",
            "Delays in long-term goals that test your endurance",
            "Health watch: care for joints, bones, teeth, and fatigue",
            "Profound spiritual maturation and karmic liberation"
        ],
        remedies: "Recite Hanuman Chalisa or Shani Stotram, light a mustard oil lamp under a Peepal tree on Saturday evenings, serve the elderly and disadvantaged."
    },
    "Siddha": {
        nature: "Crown Jewel of Yogini (Sarva Siddhi / Supreme Fulfillment)",
        deity: "Goddess Siddha (Maha Lakshmi / Tripurasundari)",
        theme: "Total Success, Desires Fulfilled, Wealth, Romance & Renown",
        coreMeaning: "Siddha is ruled by Venus and is regarded as the most prosperous and joyful period in Yogini Dasha. Noble endeavors succeed effortlessly, wealth and luxuries arrive, romance blossoms, and heartfelt aspirations are fulfilled.",
        effects: [
            "Material prosperity, acquisition of vehicles, jewelry, and luxury",
            "Marital bliss, romantic fulfillment, and high social charm",
            "Artistic, creative, and professional public acclaim",
            "Effortless fulfillment of long-cherished dreams (Siddhi)"
        ],
        remedies: "Worship Goddess Maha Lakshmi and Lalita Tripurasundari, chant 'Om Shreem Mahalakshmiyei Namaha', wear clean light/pastel clothing on Fridays, respect women and donate sweets."
    },
    "Sankata": {
        nature: "Crucial Karmic Crucible & Deep Awakening",
        deity: "Goddess Sankata (Vankal Mata / Maha Kali)",
        theme: "Unpredictable Shifts, Attachment Release & Spiritual Power",
        coreMeaning: "Sankata is the longest Yogini period (8 years) ruled by Rahu. It brings unexpected plot twists, shifts in lifestyle, and tests that shatter false illusions. Through spiritual surrender and faith, it transforms into an impenetrable shield of divine grace.",
        effects: [
            "Sudden changes in surroundings, career direction, or relationships",
            "Mental turbulence pushing you toward deeper spiritual inquiry",
            "Awakening of intuition and profound occult or philosophical insight",
            "Immense spiritual strength discovered after weathering storms"
        ],
        remedies: "Worship Goddess Durga or Maha Kali, recite Durga Chalisa, feed stray dogs on Saturdays, perform Rahu charitable donations (coconut, black sesame)."
    }
};

export default function YoginiDashaCalculator() {
    // Use BirthDetailsContext
    const { birthDetails, setBirthDetails, isInitialized } = useBirthDetails();

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male',
        date: null,
        time: new Date(new Date().setHours(0, 0, 0, 0)),
        place: '',
        lat: null,
        lng: null,
        timezone: 5.5
    });

    useEffect(() => {
        if (isInitialized && birthDetails) {
            setFormData(prev => ({
                ...prev,
                name: birthDetails.name || prev.name,
                gender: birthDetails.gender || prev.gender,
                date: birthDetails.date ? new Date(birthDetails.date) : prev.date,
                time: birthDetails.time ? (() => {
                    const d = new Date();
                    if (typeof birthDetails.time === 'string') {
                        const [h, m] = birthDetails.time.split(':');
                        d.setHours(h || 0, m || 0, 0, 0);
                    } else if (birthDetails.time instanceof Date) {
                        d.setHours(birthDetails.time.getHours(), birthDetails.time.getMinutes(), 0, 0);
                    }
                    return d;
                })() : prev.time,
                place: birthDetails.place || prev.place,
                lat: birthDetails.lat || prev.lat,
                lng: birthDetails.lng || prev.lng,
                timezone: birthDetails.timezone || prev.timezone
            }));
        }
    }, [isInitialized, birthDetails]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewStack, setViewStack] = useState([]);
    const [selectedDashaForAnalysis, setSelectedDashaForAnalysis] = useState(null);

    const handleCardClick = (dasha) => {
        if (viewStack.length >= 1) return; // Limit depth for Yogini (Mahadasha > Antardasha) - usually 2 levels enough for now

        // If subPeriods exist, use them. 
        if (dasha.subPeriods && dasha.subPeriods.length > 0) {
            setViewStack([...viewStack, dasha]);
        } else {
            toast.error("Sub-periods not available for this level.");
        }
    };

    const currentViewData = viewStack.length === 0 ? result?.list : viewStack[viewStack.length - 1].subPeriods;

    const calculateDasha = async (e) => {
        e.preventDefault();
        if (!formData.date || !formData.time) {
            toast.error("Please select both Date and Time of Birth");
            return;
        }

        if (!formData.lat || !formData.lng) {
            toast.error("Please select Place of Birth from the suggestions");
            return;
        }

        setLoading(true);
        try {
            const dateStr = formData.date.toLocaleDateString('en-CA');
            const timeStr = formData.time.toTimeString().slice(0, 5);

            const payload = {
                date: dateStr,
                time: timeStr,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone,
                name: formData.name,
                gender: formData.gender
            };

            // Persist for session
            setBirthDetails({
                name: formData.name,
                gender: formData.gender,
                date: formData.date,
                time: formData.time,
                place: formData.place,
                lat: formData.lat,
                lng: formData.lng,
                timezone: formData.timezone
            });

            const res = await API.post('/astro/yogini-dasha', payload);

            if (res.data.success) {
                setResult(res.data.data);
            } else {
                toast.error("Failed to calculate Yogini Dasha. Please try again.");
            }
        } catch (error) {
            console.error("Calculation Error:", error);
            toast.error("An error occurred during calculation.");
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        setFormData({
            ...formData,
            place: location.formattedAddress,
            lat: location.lat,
            lng: location.lng,
            timezone: location.timezone
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}-${month}-${d.getFullYear()}`;
    };

    const handleShareYoginiDasha = async () => {
        if (!result?.list) return;
        const currentDasha = result.list.find(y => {
            const now = new Date();
            return now >= new Date(y.start) && now <= new Date(y.end);
        }) || result.list[0];

        const shareText = `🔮 My Yogini Dasha: Current period is ${currentDasha?.name} (${currentDasha?.lord}) from ${formatDate(currentDasha?.start)} to ${formatDate(currentDasha?.end)}! Birth Nakshatra: ${result.birthNakshatra || 'Vedic'}. Check your Yogini Dasha on Way2Astro:`;
        const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://way2astro.com/calculators/yogini-dasha';

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `My Yogini Dasha Analysis (${currentDasha?.name})`,
                    text: `${shareText}\n${shareUrl}`,
                    url: shareUrl
                });
                return;
            } catch (e) {
                if (e?.name === 'AbortError') return;
            }
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast.success("Yogini Dasha copied to clipboard!");
        } else {
            toast.success("Yogini Dasha ready!");
        }
    };

    const handleShareSpecificYogini = async (dasha) => {
        if (!dasha) return;
        const info = YOGINI_DETAILS[dasha.name] || {};
        const shareText = `🔮 My Yogini Dasha - ${dasha.name} (${dasha.lord}) [${formatDate(dasha.start)} to ${formatDate(dasha.end)}]:\n• Nature: ${info.nature || 'Vedic Cycle'}\n• Core Theme: ${info.theme || info.coreMeaning || 'Significant life cycle'}\nCheck yours on Way2Astro:`;
        const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://way2astro.com/calculators/yogini-dasha';

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${dasha.name} Yogini Dasha Analysis`,
                    text: `${shareText}\n${shareUrl}`,
                    url: shareUrl
                });
                return;
            } catch (e) {
                if (e?.name === 'AbortError') return;
            }
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast.success(`${dasha.name} Dasha details copied to clipboard!`);
        } else {
            toast.success("Copied to clipboard!");
        }
    };

    return (
        <main className="min-h-screen bg-[#05070a] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-24 overflow-x-hidden">
            {/* Hero Section / Standardized Result Header */}
            {!result ? (
                <div className="relative text-white overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-950/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] z-0 transform scale-x-[1.05]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 text-center">
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-indigo-300/60 hover:text-indigo-300 transition-all mb-8 font-bold text-sm uppercase tracking-widest group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Calculators
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                                Yogini <span className="text-indigo-400">Dasha</span>
                            </h1>

                            <p className="text-indigo-100/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                                Complete analysis of your Yogini Dasha cycles (36 years) and their influence on your life journey.
                            </p>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <StandardResultHeader
                    title="Yogini Dasha"
                    name={formData.name}
                    date={formData.date}
                    time={formData.time?.toTimeString().slice(0, 5)}
                    place={formData.place}
                />
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-14 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-4xl mx-auto"
                        >
                            <form onSubmit={calculateDasha} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <User size={14} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full bg-white/[0.05] border border-white/10 focus:bg-white/[0.08] focus:border-indigo-500/50 rounded-2xl py-5 px-6 text-white font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1 block">Gender</label>
                                        <div className="flex p-1 bg-white/[0.05] rounded-2xl border border-white/10 h-[68px]">
                                            {['male', 'female'].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, gender: g })}
                                                    className={`flex-1 rounded-xl font-bold capitalize transition-all ${formData.gender === g
                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white/60'
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <Calendar size={14} /> Date of Birth
                                        </label>
                                        <div className="relative custom-datepicker-dark">
                                            <DatePicker
                                                customInput={<CustomDateInput placeholder='DD/MM/YYYY' Icon={Calendar} />}
                                                selected={formData.date}
                                                onChange={(date) => setFormData({ ...formData, date })}
                                                dateFormat="dd/MM/yyyy"
                                                className="w-full bg-white/[0.05] border border-white/10 focus:bg-white/[0.08] focus:border-indigo-500/50 rounded-2xl py-5 px-6 text-white font-bold text-lg outline-none transition-all cursor-pointer"
                                                showMonthDropdown
                                                showYearDropdown
                                                scrollableYearDropdown
                                                yearDropdownItemNumber={100}
                                                maxDate={new Date()}
                                            />
                                        </div>
                                    </div>

                                    <div className="group space-y-3">
                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                            <Clock size={14} /> Time of Birth
                                        </label>
                                        <TimeInput
                                            value={formData.time}
                                            onChange={(time) => setFormData({ ...formData, time })}
                                            darkMode={true}
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-bold text-indigo-300/50 uppercase tracking-[0.2em] ml-1">
                                        <MapPin size={14} /> Place of Birth
                                    </label>
                                    <LocationSearch
                                        onLocationSelect={handleLocationSelect}
                                        darkMode={true}
                                        placeholder="Search your birth city..."
                                        defaultValue={formData.place}
                                    />
                                    {formData.place && (
                                        <p className="text-indigo-400 text-sm font-bold flex items-center gap-2 mt-2 px-1">
                                            <CheckCircle2 size={14} /> {formData.place}
                                        </p>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-black py-6 rounded-2xl shadow-3xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    {loading ? (
                                        <><RefreshCw size={24} className="animate-spin" /> Calculating Cycle...</>
                                    ) : (
                                        <><Sparkles size={24} /> Reveal My Yogini Dasha</>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-10"
                        >
                            {/* Analysis Modal */}
                            <AnimatePresence>
                                {selectedDashaForAnalysis && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                                        onClick={() => setSelectedDashaForAnalysis(null)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="bg-[#0f1222] border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[85vh] relative"
                                        >
                                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-2xl font-black text-white">
                                                            {selectedDashaForAnalysis.name} Dasha
                                                        </h3>
                                                        {(() => {
                                                            const isCur = new Date() >= new Date(selectedDashaForAnalysis.start) && new Date() <= new Date(selectedDashaForAnalysis.end);
                                                            return isCur ? (
                                                                <span className="text-[10px] bg-purple-500/25 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/40 uppercase font-black tracking-wider animate-pulse flex items-center gap-1">
                                                                    <Sparkles size={10} /> Current Period
                                                                </span>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                    <p className="text-purple-200/80 text-sm mt-1 font-semibold">
                                                        Governed by {selectedDashaForAnalysis.lord} • {selectedDashaForAnalysis.duration} Years Cycle
                                                    </p>
                                                    <p className="text-white/40 text-xs mt-1 font-medium bg-white/5 inline-block px-3 py-1 rounded-md">
                                                        {formatDate(selectedDashaForAnalysis.start)} — {formatDate(selectedDashaForAnalysis.end)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDashaForAnalysis(null)}
                                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                                                >
                                                    <X size={22} />
                                                </button>
                                            </div>

                                            <div className="space-y-6 text-left">
                                                <div className="pl-4 border-l-4 border-purple-500 bg-white/5 p-3.5 rounded-r-xl">
                                                    <p className="text-xs font-bold text-white/90 leading-relaxed">
                                                        Birth Nakshatra: <span className="uppercase text-purple-300 font-extrabold">{result.birthNakshatra}</span>
                                                    </p>
                                                </div>

                                                {(() => {
                                                    const info = YOGINI_DETAILS[selectedDashaForAnalysis.name] || {};
                                                    return (
                                                        <div className="space-y-5">
                                                            {/* Nature & Deity */}
                                                            {info.nature && (
                                                                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border border-purple-400/25">
                                                                    <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider block">
                                                                        Cosmic Nature & Presiding Deity
                                                                    </span>
                                                                    <p className="text-sm font-bold text-white mt-1">
                                                                        {info.nature} • {info.deity || selectedDashaForAnalysis.lord}
                                                                    </p>
                                                                    {info.theme && (
                                                                        <p className="text-xs text-purple-200/80 font-medium mt-1">
                                                                            {info.theme}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Core Meaning */}
                                                            <div className="space-y-1.5">
                                                                <span className="text-xs text-purple-300 font-black uppercase tracking-wider block">
                                                                    Core Meaning & Astrological Influence
                                                                </span>
                                                                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 font-medium">
                                                                    {info.coreMeaning || "This Yogini period brings vital life lessons and karmic outcomes according to its planetary archetype."}
                                                                </p>
                                                            </div>

                                                            {/* Key Effects / Manifestations */}
                                                            {info.effects && info.effects.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <span className="text-xs text-amber-300 font-black uppercase tracking-wider block">
                                                                        Key Themes & Manifestations
                                                                    </span>
                                                                    <div className="space-y-2">
                                                                        {info.effects.map((eff, i) => (
                                                                            <div key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 bg-white/[0.04] p-3 rounded-xl border border-white/5">
                                                                                <span className="text-purple-400 font-bold">•</span>
                                                                                <span>{eff}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Spiritual Remedies */}
                                                            {info.remedies && (
                                                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 space-y-1.5">
                                                                    <span className="text-xs text-amber-300 font-black uppercase tracking-wider flex items-center gap-2">
                                                                        <Shield size={14} /> Recommended Spiritual Remedies
                                                                    </span>
                                                                    <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
                                                                        {info.remedies}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Sub-Periods Explorer Button inside Modal */}
                                                            {selectedDashaForAnalysis.subPeriods && selectedDashaForAnalysis.subPeriods.length > 0 && viewStack.length === 0 && (
                                                                <button
                                                                    onClick={() => {
                                                                        const target = selectedDashaForAnalysis;
                                                                        setSelectedDashaForAnalysis(null);
                                                                        handleCardClick(target);
                                                                    }}
                                                                    className="w-full py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                                                                >
                                                                    Explore {selectedDashaForAnalysis.name} Sub-Periods (Antardashas) <ArrowRight size={14} />
                                                                </button>
                                                            )}

                                                            {/* Share button in modal */}
                                                            <button
                                                                onClick={() => handleShareSpecificYogini(selectedDashaForAnalysis)}
                                                                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20"
                                                            >
                                                                <Share2 size={16} /> Share {selectedDashaForAnalysis.name} Dasha Summary
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dasha Hierarchy Navigation */}
                            <div className="flex flex-col gap-6">
                                {/* Header & Breadcrumbs */}
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">
                                            {viewStack.length === 0 ? `Yogini Dasha Cycle` :
                                                `${viewStack[0].name} Mahadasha (Antardasha)`}
                                        </h2>
                                        <p className="text-indigo-200/60 text-sm font-medium mt-1">
                                            Birth Nakshatra: <span className="text-white font-bold">{result.birthNakshatra}</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-indigo-300/60">
                                            <button
                                                onClick={() => setViewStack([])}
                                                className={`hover:text-white transition-colors ${viewStack.length === 0 ? 'text-white font-bold' : ''}`}
                                            >
                                                Mahadasha
                                            </button>
                                            {viewStack.map((item, idx) => (
                                                <React.Fragment key={idx}>
                                                    <span>/</span>
                                                    <button
                                                        onClick={() => setViewStack(viewStack.slice(0, idx))}
                                                        className="hover:text-white hover:underline transition-colors"
                                                    >
                                                        {item.name} <span className="text-xs opacity-50 ml-0.5">AD</span>
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleShareYoginiDasha}
                                            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg shadow-purple-500/20"
                                        >
                                            <Share2 size={16} /> Share Dasha
                                        </button>
                                        <button
                                            onClick={() => { setResult(null); setViewStack([]); }}
                                            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
                                        >
                                            <RefreshCw size={16} /> New Check
                                        </button>
                                    </div>
                                </div>

                                {/* Current Level Table */}
                                <div className="overflow-hidden bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/10 text-indigo-200/60 text-sm uppercase tracking-wider">
                                                    <th className="p-6 font-semibold">Dasha Name</th>
                                                    <th className="p-6 font-semibold">Duration</th>
                                                    <th className="p-6 font-semibold">Start Date</th>
                                                    <th className="p-6 font-semibold">End Date</th>
                                                    <th className="p-6 font-semibold text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-white">
                                                {(currentViewData || []).map((dasha, idx) => {
                                                    const isCurrent = new Date() >= new Date(dasha.start) && new Date() <= new Date(dasha.end);
                                                    return (
                                                        <tr
                                                            key={idx}
                                                            onClick={() => setSelectedDashaForAnalysis(dasha)}
                                                            className={`transition-colors cursor-pointer group ${
                                                                isCurrent 
                                                                    ? 'bg-purple-900/30 hover:bg-purple-900/40 border-l-4 border-l-purple-500' 
                                                                    : 'hover:bg-white/5'
                                                            }`}
                                                        >
                                                            <td className="p-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                                                        isCurrent 
                                                                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                                                                            : 'bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white'
                                                                    }`}>
                                                                        {dasha.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-lg">{dasha.name}</span>
                                                                            {isCurrent && (
                                                                                <span className="bg-purple-500/30 text-purple-200 border border-purple-400/50 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                                                                                    <Sparkles size={10} /> Current
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-white/40">{dasha.lord}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-6 font-medium text-white/80">
                                                                {dasha.duration} Years
                                                            </td>
                                                            <td className="p-6 text-indigo-200/80 font-mono text-sm">
                                                                {formatDate(dasha.start)}
                                                            </td>
                                                            <td className="p-6 text-indigo-200/80 font-mono text-sm">
                                                                {formatDate(dasha.end)}
                                                            </td>
                                                            <td className="p-6 text-right">
                                                                <div className="inline-flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedDashaForAnalysis(dasha);
                                                                        }}
                                                                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5"
                                                                    >
                                                                        <Info size={14} /> Summary
                                                                    </button>
                                                                    {dasha.subPeriods && dasha.subPeriods.length > 0 && viewStack.length === 0 && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCardClick(dasha);
                                                                            }}
                                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/50 text-white/60 hover:text-white text-xs font-bold transition-all"
                                                                            title="View Sub-periods"
                                                                        >
                                                                            <ArrowRight size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {currentViewData.length === 0 && (
                                        <div className="p-12 text-center text-white/40">
                                            No data available for this view.
                                        </div>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <PageContentSection slug="calculators/yogini-dasha" />
        </main >
    );
}
