"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '@/components/CosmicLoader';
import {
    Sparkles, Heart, Info, ArrowLeft, ShieldCheck, AlertTriangle,
    CheckCircle2, XCircle, Share2, User, MapPin, Calendar,
    Clock, Flame, Award, ChevronDown, ChevronUp, RotateCcw
} from 'lucide-react';
import { Share } from '@capacitor/share';
import toast from 'react-hot-toast';

const ZODIAC_SYMBOLS = {
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const KOOTA_INFO = {
    varna: {
        name: "Varna",
        sanskrit: "वर्ण कूट",
        aspect: "Spiritual Ego & Work Nature",
        max: 1,
        desc: "Reflects mutual spiritual orientation, professional temperament, and ego compatibility."
    },
    vashya: {
        name: "Vashya",
        sanskrit: "वश्य कूट",
        aspect: "Mutual Attraction & Affinity",
        max: 2,
        desc: "Measures mutual magnetism, interpersonal influence, and the power dynamic in the relationship."
    },
    tara: {
        name: "Tara",
        sanskrit: "तारा कूट",
        aspect: "Health, Longevity & Destiny",
        max: 3,
        desc: "Determines birth star (Nakshatra) compatibility, destiny synchronization, and overall well-being."
    },
    yoni: {
        name: "Yoni",
        sanskrit: "योनि कूट",
        aspect: "Biological & Intimate Harmony",
        max: 4,
        desc: "Evaluates physical chemistry, instinctive nature, mutual affection, and sexual compatibility."
    },
    maitri: {
        name: "Graha Maitri",
        sanskrit: "ग्रह मैत्री",
        aspect: "Mental & Intellectual Friendship",
        max: 5,
        desc: "Measures planetary friendship of the Moon sign lords, mental affinity, and day-to-day understanding."
    },
    gana: {
        name: "Gana",
        sanskrit: "गण कूट",
        aspect: "Temperament & Behavioral Concord",
        max: 6,
        desc: "Compares fundamental temperaments: Deva (divine/calm), Manushya (human/balanced), or Rakshasa (fierce/assertive)."
    },
    bhakoot: {
        name: "Bhakoot",
        sanskrit: "भकूट कूट",
        aspect: "Family Welfare & Prosperity",
        max: 7,
        desc: "Examines emotional bonding, family happiness, financial prosperity, and marital longevity."
    },
    nadi: {
        name: "Nadi",
        sanskrit: "नाड़ी कूट",
        aspect: "Genetic Resonance & Vital Energy",
        max: 8,
        desc: "Determines nervous system resonance, genetic harmony, vital prana balance, and childbearing vitality."
    }
};

export default function MatchmakingResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeProfileTab, setActiveProfileTab] = useState('both'); // 'both', 'boy', 'girl'

    const boyName = searchParams.get('b_name') || 'Groom';
    const girlName = searchParams.get('g_name') || 'Bride';
    const boyDate = searchParams.get('b_date') || '';
    const boyTime = searchParams.get('b_time') || '';
    const boyPlace = searchParams.get('b_place') || '';
    const girlDate = searchParams.get('g_date') || '';
    const girlTime = searchParams.get('g_time') || '';
    const girlPlace = searchParams.get('g_place') || '';

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
        }

        const fetchData = async () => {
            try {
                const payload = {
                    boy: {
                        date: searchParams.get('b_date'),
                        time: searchParams.get('b_time'),
                        lat: parseFloat(searchParams.get('b_lat')),
                        lng: parseFloat(searchParams.get('b_lng')),
                        timezone: parseFloat(searchParams.get('b_tz'))
                    },
                    girl: {
                        date: searchParams.get('g_date'),
                        time: searchParams.get('g_time'),
                        lat: parseFloat(searchParams.get('g_lat')),
                        lng: parseFloat(searchParams.get('g_lng')),
                        timezone: parseFloat(searchParams.get('g_tz'))
                    }
                };

                const res = await api.post('/astro/match', payload);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Failed to calculate your celestial harmony.');
                }
            } catch (err) {
                console.error(err);
                setError('The stars are obscured. Please ensure all details are correct.');
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('b_date')) {
            fetchData();
        } else {
            router.push('/matchmaking');
        }
    }, [searchParams, router]);

    // Helpers to compute Nakshatra Pada and sign degree
    const getPada = (moonDeg) => {
        if (typeof moonDeg !== 'number' || isNaN(moonDeg)) return 1;
        const posInNakshatra = ((moonDeg % (360 / 27)) + (360 / 27)) % (360 / 27);
        return Math.floor(posInNakshatra / (360 / 108)) + 1;
    };

    const getSignDeg = (moonDeg) => {
        if (typeof moonDeg !== 'number' || isNaN(moonDeg)) return '0.00';
        return ((moonDeg % 30 + 30) % 30).toFixed(2);
    };

    // Comprehensive Branded Share Function
    const handleShare = async () => {
        if (!data) return;

        const totalScore = (data.score?.total || 0).toFixed(1);
        const minPass = data.score?.minPass || 18;
        const isPass = data.score?.total >= minPass;
        const verdict = isPass ? "Highly Compatible Alignment (Pass)" : "Challenging Alignment (Requires Remedies)";

        const bPada = getPada(data.boy?.moon);
        const gPada = getPada(data.girl?.moon);
        const bMoonDeg = getSignDeg(data.boy?.moon);
        const gMoonDeg = getSignDeg(data.girl?.moon);

        const bSign = data.boy?.bhakoot || '-';
        const gSign = data.girl?.bhakoot || '-';
        const bLord = data.boy?.maitri || '-';
        const gLord = data.girl?.maitri || '-';
        const bStar = data.boy?.tara || '-';
        const gStar = data.girl?.tara || '-';

        const kootaBreakdown = [
            `• Varna (Spiritual Ego): ${data.score?.details?.varna ?? 0}/1 [Boy: ${data.boy?.varna || '-'} | Girl: ${data.girl?.varna || '-'}]`,
            `• Vashya (Mutual Influence): ${data.score?.details?.vashya ?? 0}/2 [Boy: ${data.boy?.vashya || '-'} | Girl: ${data.girl?.vashya || '-'}]`,
            `• Tara (Health & Destiny): ${data.score?.details?.tara ?? 0}/3 [Boy: ${bStar} | Girl: ${gStar}]`,
            `• Yoni (Physical Harmony): ${data.score?.details?.yoni ?? 0}/4 [Boy: ${data.boy?.yoni || '-'} | Girl: ${data.girl?.yoni || '-'}]`,
            `• Graha Maitri (Friendship): ${data.score?.details?.maitri ?? 0}/5 [Boy Lord: ${bLord} | Girl Lord: ${gLord}]`,
            `• Gana (Temperament): ${data.score?.details?.gana ?? 0}/6 [Boy: ${data.boy?.gana || '-'} | Girl: ${data.girl?.gana || '-'}]`,
            `• Bhakoot (Family Welfare): ${data.score?.details?.bhakoot ?? 0}/7 [Boy: ${bSign} | Girl: ${gSign}]`,
            `• Nadi (Genetics & Vitality): ${data.score?.details?.nadi ?? 0}/8 [Boy: ${data.boy?.nadi || '-'} | Girl: ${data.girl?.nadi || '-'}]`
        ].join('\n');

        let doshaText = '';
        if (data.score?.details?.nadi === 0 && data.boy?.nadi === data.girl?.nadi) {
            doshaText += `⚠️ Nadi Dosha Present: Both share ${data.boy?.nadi} Nadi. Maha Mrityunjaya Japa and consultation advised.\n`;
        }
        if (data.score?.details?.bhakoot === 0) {
            doshaText += `⚠️ Bhakoot Dosha Present: Signs in relative conflict. Planetary remedies advised.\n`;
        }
        if (!doshaText) {
            doshaText = `✅ No Major Nadi or Bhakoot Doshas Detected.\n`;
        }

        const shareText = `💞 Vedic Kundali Matchmaking Report 💞
👨 Groom: ${boyName}${boyPlace ? ` (${boyPlace})` : ''}
👩 Bride: ${girlName}${girlPlace ? ` (${girlPlace})` : ''}

💫 OVERALL GUNA MILAN:
✨ Total Score: ${totalScore} / 36 Gunas (${verdict})
🌟 Minimum Recommended: ${minPass} / 36 Gunas

👦 GROOM'S CELESTIAL PROFILE:
• Moon Sign (Rashi): ${bSign} ${ZODIAC_SYMBOLS[bSign] || ''} (${bMoonDeg}°) - Lord: ${bLord}
• Birth Star: ${bStar} • Rasi Pada: Pada ${bPada}
• Gana: ${data.boy?.gana || '-'} | Nadi: ${data.boy?.nadi || '-'}
• Yoni: ${data.boy?.yoni || '-'} | Varna: ${data.boy?.varna || '-'} | Vashya: ${data.boy?.vashya || '-'}

👧 BRIDE'S CELESTIAL PROFILE:
• Moon Sign (Rashi): ${gSign} ${ZODIAC_SYMBOLS[gSign] || ''} (${gMoonDeg}°) - Lord: ${gLord}
• Birth Star: ${gStar} • Rasi Pada: Pada ${gPada}
• Gana: ${data.girl?.gana || '-'} | Nadi: ${data.girl?.nadi || '-'}
• Yoni: ${data.girl?.yoni || '-'} | Varna: ${data.girl?.varna || '-'} | Vashya: ${data.girl?.vashya || '-'}

📊 8-FOLD ASHTAKOOT BREAKDOWN:
${kootaBreakdown}

🛡️ DOSHA ANALYSIS:
${doshaText}
🔮 Calculated with Way2Astro - Your Trusted Cosmic Guide
🔗 Check Kundali Matching: https://way2astro.com/matchmaking`;

        try {
            if (typeof window !== "undefined" && window.Capacitor && window.Capacitor.isNativePlatform()) {
                await Share.share({
                    title: `Vedic Matchmaking: ${boyName} & ${girlName}`,
                    text: shareText,
                    dialogTitle: 'Share Matchmaking Report'
                });
            } else if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({
                    title: `Vedic Matchmaking: ${boyName} & ${girlName}`,
                    text: shareText
                });
            } else if (typeof navigator !== "undefined" && navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                toast.success("Matchmaking report copied to clipboard!");
            }
        } catch (err) {
            if (err?.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Matchmaking report copied to clipboard!");
                } catch {
                    toast.error("Unable to share at this moment.");
                }
            }
        }
    };

    if (loading) return <CosmicLoader size="lg" message="Weaving your Celestial Destiny..." />;

    if (error) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-400 mb-2">
                <Info size={36} />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Cosmic Interference</h2>
            <p className="text-slate-400 text-xs mb-4 max-w-xs">{error}</p>
            <button
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-white font-bold text-xs border border-white/15 active:scale-95 transition-all"
            >
                ← Return to Matchmaking Form
            </button>
        </div>
    );

    if (!data) return null;

    const score = data.score?.total || 0;
    const isSuccess = score >= (data.score?.minPass || 18);

    // Derived Values for Boy & Girl
    const bSign = data.boy?.bhakoot || 'Leo';
    const gSign = data.girl?.bhakoot || 'Libra';
    const bLord = data.boy?.maitri || 'Sun';
    const gLord = data.girl?.maitri || 'Venus';
    const bStar = data.boy?.tara || 'Magha';
    const gStar = data.girl?.tara || 'Vishakha';
    const bPada = getPada(data.boy?.moon);
    const gPada = getPada(data.girl?.moon);
    const bMoonDeg = getSignDeg(data.boy?.moon);
    const gMoonDeg = getSignDeg(data.girl?.moon);

    // Dosha Indicators
    const hasNadiDosha = data.score?.details?.nadi === 0 && data.boy?.nadi === data.girl?.nadi;
    const hasBhakootDosha = data.score?.details?.bhakoot === 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-28">
            {/* Header with Back and Share Button */}
            <div className="pt-2 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all shadow-sm"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-center">
                    <h1 className="text-base font-extrabold text-white tracking-tight">Kundali Matching</h1>
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-0.5">Ashtakoot Guna Milan</p>
                </div>
                <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 hover:text-white active:scale-90 transition-all shadow-sm"
                    aria-label="Share Matchmaking Report"
                    title="Share Report"
                >
                    <Share2 size={17} />
                </button>
            </div>

            {/* Couple Hero Overview Card */}
            <div>
                <div className="p-5 rounded-[26px] bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between">
                        {/* Groom Info Mini */}
                        <div className="flex-1 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mx-auto mb-2 text-blue-300 font-black text-base shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                ♂
                            </div>
                            <h3 className="text-xs font-black text-white truncate max-w-[110px] mx-auto">{boyName}</h3>
                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-bold text-blue-300">
                                <span>{ZODIAC_SYMBOLS[bSign] || ''}</span>
                                <span>{bSign}</span>
                            </div>
                        </div>

                        {/* Animated Heart Center */}
                        <div className="px-3 flex flex-col items-center justify-center">
                            <div className="w-11 h-11 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.35)] relative">
                                <Heart className={`text-rose-400 ${isSuccess ? 'fill-rose-400 animate-pulse' : 'fill-rose-500/30'}`} size={20} />
                                <Sparkles className="text-solar-gold absolute -top-1 -right-1" size={12} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5">Milan</span>
                        </div>

                        {/* Bride Info Mini */}
                        <div className="flex-1 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto mb-2 text-rose-300 font-black text-base shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                ♀
                            </div>
                            <h3 className="text-xs font-black text-white truncate max-w-[110px] mx-auto">{girlName}</h3>
                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300">
                                <span>{ZODIAC_SYMBOLS[gSign] || ''}</span>
                                <span>{gSign}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Highlight Meter */}
            <div className="flex flex-col items-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="88" cy="88" r="76"
                            fill="none" stroke="rgba(255,255,255,0.06)"
                            strokeWidth="12"
                        />
                        <motion.circle
                            cx="88" cy="88" r="76"
                            fill="none"
                            stroke={isSuccess ? "#10b981" : "#f43f5e"}
                            strokeWidth="12"
                            strokeDasharray={477}
                            initial={{ strokeDashoffset: 477 }}
                            animate={{ strokeDashoffset: 477 - (477 * score / 36) }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                            className={isSuccess ? "drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]"}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-black text-white tracking-tight">{score.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Out of 36 Gunas</span>
                    </div>
                </div>

                <div className={`mt-4 px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-wider border flex items-center gap-2 ${
                    isSuccess 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                }`}>
                    {isSuccess ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-rose-400" />}
                    <span>{isSuccess ? 'Highly Compatible Alignment' : 'Challenging Alignment'}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium text-center mt-2 max-w-xs">
                    {isSuccess 
                        ? 'Celestial metrics exceed the traditional 18-point threshold for harmony and longevity.'
                        : 'Score is below 18 points. Vedic tradition recommends dosha checks and remedies.'}
                </p>
            </div>

            {/* Boy & Girl Details Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-1 ml-1">
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Celestial Profiles</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Detailed Astrological Attributes of Both Partners</p>
                    </div>
                    {/* View Switcher Tabs */}
                    <div className="flex items-center bg-white/[0.05] p-1 rounded-xl border border-white/10 text-[10px] font-bold">
                        <button
                            onClick={() => setActiveProfileTab('both')}
                            className={`px-2.5 py-1 rounded-lg transition-all ${activeProfileTab === 'both' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            Dual View
                        </button>
                        <button
                            onClick={() => setActiveProfileTab('boy')}
                            className={`px-2 py-1 rounded-lg transition-all ${activeProfileTab === 'boy' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            Boy
                        </button>
                        <button
                            onClick={() => setActiveProfileTab('girl')}
                            className={`px-2 py-1 rounded-lg transition-all ${activeProfileTab === 'girl' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            Girl
                        </button>
                    </div>
                </div>

                {/* Groom's Profile Card */}
                {(activeProfileTab === 'both' || activeProfileTab === 'boy') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-[26px] p-5 bg-gradient-to-br from-blue-950/40 via-white/[0.04] to-blue-900/10 backdrop-blur-2xl border border-blue-500/25 shadow-[0_10px_30px_rgba(59,130,246,0.12)] relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-black text-base shadow-sm">
                                    ♂
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-black text-white">{boyName}</h3>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-extrabold uppercase tracking-wider">Groom</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {boyDate ? `${boyDate}${boyTime ? ` at ${boyTime}` : ''}` : 'Birth details on file'}
                                        {boyPlace ? ` • ${boyPlace.split(',')[0]}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Primary Rashi & Pada Spotlight */}
                        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-300 block mb-0.5">Moon Sign (Rashi)</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-lg">{ZODIAC_SYMBOLS[bSign] || '🌙'}</span>
                                    <div>
                                        <span className="text-sm font-black text-white block leading-tight">{bSign} Rashi</span>
                                        <span className="text-[10px] text-blue-200/80 font-bold">Lord: {bLord} ({bMoonDeg}°)</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-300 block mb-0.5">Birth Nakshatra</span>
                                <div>
                                    <span className="text-sm font-black text-white block leading-tight">{bStar}</span>
                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30 text-[10px] font-extrabold text-amber-300">
                                        Rasi Pada {bPada}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 5-Attribute Astro Attributes Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gana</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.boy?.gana || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nadi</span>
                                <span className="text-xs font-black text-blue-300 mt-0.5 block">{data.boy?.nadi || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Yoni</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.boy?.yoni || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Varna</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.boy?.varna || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vashya</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.boy?.vashya || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sign Degree</span>
                                <span className="text-xs font-black text-solar-gold mt-0.5 block">{bMoonDeg}°</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Bride's Profile Card */}
                {(activeProfileTab === 'both' || activeProfileTab === 'girl') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 rounded-[26px] p-5 bg-gradient-to-br from-rose-950/40 via-white/[0.04] to-pink-900/10 backdrop-blur-2xl border border-rose-500/25 shadow-[0_10px_30px_rgba(244,63,94,0.12)] relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 font-black text-base shadow-sm">
                                    ♀
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-black text-white">{girlName}</h3>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-extrabold uppercase tracking-wider">Bride</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {girlDate ? `${girlDate}${girlTime ? ` at ${girlTime}` : ''}` : 'Birth details on file'}
                                        {girlPlace ? ` • ${girlPlace.split(',')[0]}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Primary Rashi & Pada Spotlight */}
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-3 grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-300 block mb-0.5">Moon Sign (Rashi)</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-lg">{ZODIAC_SYMBOLS[gSign] || '🌙'}</span>
                                    <div>
                                        <span className="text-sm font-black text-white block leading-tight">{gSign} Rashi</span>
                                        <span className="text-[10px] text-rose-200/80 font-bold">Lord: {gLord} ({gMoonDeg}°)</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-300 block mb-0.5">Birth Nakshatra</span>
                                <div>
                                    <span className="text-sm font-black text-white block leading-tight">{gStar}</span>
                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-rose-400/20 border border-rose-400/30 text-[10px] font-extrabold text-rose-300">
                                        Rasi Pada {gPada}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 5-Attribute Astro Attributes Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gana</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.girl?.gana || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nadi</span>
                                <span className="text-xs font-black text-rose-300 mt-0.5 block">{data.girl?.nadi || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Yoni</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.girl?.yoni || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Varna</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.girl?.varna || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vashya</span>
                                <span className="text-xs font-black text-white mt-0.5 block">{data.girl?.vashya || '-'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sign Degree</span>
                                <span className="text-xs font-black text-solar-gold mt-0.5 block">{gMoonDeg}°</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Side-by-Side Comparison Table */}
                <div className="mt-2 rounded-[22px] bg-white/[0.03] border border-white/10 p-3.5 backdrop-blur-xl">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5 ml-1 flex items-center justify-between">
                        <span>Side-by-Side At-A-Glance</span>
                        <span className="text-[9px] text-purple-300 font-semibold">Groom vs Bride</span>
                    </h4>
                    <div className="space-y-1.5 text-xs">
                        <ComparisonRow label="Rashi (Moon Sign)" boy={`${bSign} (${bLord})`} girl={`${gSign} (${gLord})`} />
                        <ComparisonRow label="Nakshatra & Pada" boy={`${bStar} (P${bPada})`} girl={`${gStar} (P${gPada})`} highlight={true} />
                        <ComparisonRow label="Gana (Nature)" boy={data.boy?.gana || '-'} girl={data.girl?.gana || '-'} match={data.boy?.gana === data.girl?.gana} />
                        <ComparisonRow label="Nadi (Genetics)" boy={data.boy?.nadi || '-'} girl={data.girl?.nadi || '-'} warning={data.boy?.nadi === data.girl?.nadi} />
                        <ComparisonRow label="Yoni (Chemistry)" boy={data.boy?.yoni || '-'} girl={data.girl?.yoni || '-'} />
                        <ComparisonRow label="Varna" boy={data.boy?.varna || '-'} girl={data.girl?.varna || '-'} />
                        <ComparisonRow label="Vashya" boy={data.boy?.vashya || '-'} girl={data.girl?.vashya || '-'} />
                    </div>
                </div>
            </div>

            {/* Dosha Analysis Cards */}
            <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Dosha Analysis</h3>

                {/* Nadi Dosha Card */}
                {hasNadiDosha ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-[22px] bg-amber-500/10 border border-amber-500/30 flex gap-3.5 backdrop-blur-xl shadow-[0_4px_20px_rgba(245,158,11,0.15)]"
                    >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-extrabold text-amber-200 uppercase tracking-wide">Nadi Dosha Detected</h4>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 uppercase">0/8 Pts</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                                Both partners have the same <strong>{data.boy?.nadi} Nadi</strong>, indicating potential genetic similarity or vitality conflicts according to classical texts.
                            </p>
                            <p className="text-[10px] text-amber-200/80 font-medium mt-1.5">
                                💡 <em>Remedies: Maha Mrityunjaya Japa, donating food or grains (Anna Dana), and checking if different Nakshatra padas provide cancellation (Nadi Dosha Bhanga).</em>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-3.5 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 backdrop-blur-xl">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="text-xs font-extrabold text-emerald-300">No Nadi Dosha (Full 8/8 Compatibility)</h4>
                            <p className="text-[10px] text-slate-300">Different Nadis ensure high vital energy and genetic diversity.</p>
                        </div>
                    </div>
                )}

                {/* Bhakoot Dosha Card */}
                {hasBhakootDosha ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-[22px] bg-rose-500/10 border border-rose-500/30 flex gap-3.5 backdrop-blur-xl shadow-[0_4px_20px_rgba(244,63,94,0.15)]"
                    >
                        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-extrabold text-rose-200 uppercase tracking-wide">Bhakoot Dosha Detected</h4>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 uppercase">0/7 Pts</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                                Relative Moon sign placement ({bSign} & {gSign}) suggests potential differences in emotional processing, financial priorities, or lifestyle choices.
                            </p>
                            <p className="text-[10px] text-rose-200/80 font-medium mt-1.5">
                                💡 <em>Cancellation is present if the lords of both signs are friends or if mutual respect and open communication are practiced.</em>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-3.5 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 backdrop-blur-xl">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <div>
                            <h4 className="text-xs font-extrabold text-emerald-300">No Bhakoot Dosha (7/7 Compatibility)</h4>
                            <p className="text-[10px] text-slate-300">Auspicious Moon sign placement ensures continuous family welfare and shared joy.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Ashtakoot 8-Fold Breakdown */}
            <div>
                <div className="flex items-center justify-between mb-3 ml-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ashtakoot Breakdown (36 Gunas)</h3>
                    <span className="text-[10px] text-solar-gold font-bold">{score.toFixed(1)} / 36</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                    {Object.entries(data.score?.details || {}).map(([koota, val], i) => (
                        <KootaRow
                            key={koota}
                            name={koota}
                            info={KOOTA_INFO[koota] || { max: [1, 2, 3, 4, 5, 6, 7, 8][i], name: koota, aspect: '', desc: '' }}
                            boyVal={getKootaBoyVal(koota, data.boy)}
                            girlVal={getKootaGirlVal(koota, data.girl)}
                            delay={i * 0.04}
                        />
                    ))}
                </div>
            </div>

            {/* Astrological Counsel */}
            <div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-[24px] bg-[#14183d]/90 border border-indigo-500/30 backdrop-blur-2xl flex gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h4 className="text-indigo-200 text-xs font-black uppercase tracking-wider mb-1">Cosmic Guidance</h4>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            {score >= 28
                                ? "An exceptional match of Uttama grade. Rare celestial resonance ensures effortless emotional intimacy, spiritual growth, and prosperity."
                                : score >= 18
                                ? "This combination manifests solid celestial harmony. Planetary bonds signify enduring emotional balance and shared spiritual aspirations with traditional approval."
                                : "While Guna matching falls below the traditional 18 threshold, deep planetary analysis (Lagna, 7th house, and D9 Navamsha) often reveals mitigating factors and personalized Vedic remedies to harmonize differences."}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Action Buttons: Share & Re-calculate */}
            <div className="space-y-3 pt-2">
                {/* Primary Radiant Share Button */}
                <button
                    onClick={handleShare}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(244,63,94,0.35)]"
                >
                    <Share2 size={18} className="text-white" />
                    Share Matchmaking Report
                </button>

                {/* Re-calculate Button */}
                <button
                    onClick={() => router.push('/matchmaking')}
                    className="w-full py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <RotateCcw size={14} />
                    Check Another Match / Change Details
                </button>
            </div>
        </div>
    );
}

function ComparisonRow({ label, boy, girl, match = false, warning = false, highlight = false }) {
    return (
        <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
            warning ? 'bg-amber-500/10 border border-amber-500/20' : highlight ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/[0.02]'
        }`}>
            <span className="text-slate-400 font-medium text-[11px] w-1/3 truncate">{label}</span>
            <div className="flex-1 grid grid-cols-2 text-center gap-2 font-bold text-[11px]">
                <span className="text-blue-300 truncate">{boy}</span>
                <span className="text-rose-300 truncate">{girl}</span>
            </div>
        </div>
    );
}

function KootaRow({ name, val, info, boyVal, girlVal, delay }) {
    const [expanded, setExpanded] = useState(false);
    const max = info.max || 1;
    const isGood = val >= max / 2;
    const isFull = val === max;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            onClick={() => setExpanded(!expanded)}
            className="p-3.5 rounded-[22px] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] active:scale-[0.99] transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black uppercase border shadow-sm ${
                        isFull 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                            : isGood 
                            ? 'bg-solar-gold/20 border-solar-gold/40 text-solar-gold' 
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}>
                        {val}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white capitalize">{info.name || name}</h4>
                            {info.sanskrit && (
                                <span className="text-[9px] text-slate-500 font-medium">{info.sanskrit}</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{info.aspect}</p>
                    </div>
                </div>
                <div className="text-right flex items-center gap-2.5">
                    <div>
                        <div className="text-[11px] font-black">
                            <span className={isGood ? "text-emerald-400" : "text-rose-400"}>{val}</span>
                            <span className="text-slate-500">/{max}</span>
                        </div>
                        <div className="h-1.5 w-14 rounded-full mt-1.5 bg-white/10 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                style={{ width: `${Math.min(100, (val / max) * 100)}%` }}
                            />
                        </div>
                    </div>
                    {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </div>
            </div>

            {/* Expandable Info & Attributes */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/[0.08] text-[11px] space-y-2"
                    >
                        {(boyVal || girlVal) && (
                            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/[0.03] text-[10px] font-bold">
                                <span className="text-blue-300">♂ Boy: {boyVal}</span>
                                <span className="text-rose-300">♀ Girl: {girlVal}</span>
                            </div>
                        )}
                        <p className="text-slate-300 leading-relaxed text-[11px]">{info.desc}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function getKootaBoyVal(koota, boy) {
    if (!boy) return '-';
    switch (koota) {
        case 'varna': return boy.varna;
        case 'vashya': return boy.vashya;
        case 'tara': return boy.tara;
        case 'yoni': return boy.yoni;
        case 'maitri': return `Lord ${boy.maitri}`;
        case 'gana': return boy.gana;
        case 'bhakoot': return boy.bhakoot;
        case 'nadi': return boy.nadi;
        default: return '-';
    }
}

function getKootaGirlVal(koota, girl) {
    if (!girl) return '-';
    switch (koota) {
        case 'varna': return girl.varna;
        case 'vashya': return girl.vashya;
        case 'tara': return girl.tara;
        case 'yoni': return girl.yoni;
        case 'maitri': return `Lord ${girl.maitri}`;
        case 'gana': return girl.gana;
        case 'bhakoot': return girl.bhakoot;
        case 'nadi': return girl.nadi;
        default: return '-';
    }
}
