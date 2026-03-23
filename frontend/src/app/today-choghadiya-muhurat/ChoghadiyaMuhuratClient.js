"use client";

import { useEffect, useState, Suspense } from 'react';
import API from '../../lib/api';
import LocationSearch from '../../components/LocationSearch';
import { Calendar, Sparkles, Sun, Moon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import CosmicLoader from '../../components/CosmicLoader';
import HeroSection from '../../components/common/HeroSection';
import FAQDisplay from '../../components/FAQDisplay';
import { t } from '../../utils/translations';
import CustomDateInput from '../../components/common/CustomDateInput';
import { TimingTable, PanchangCard } from '../../components/common/PanchangUI';
import { useSearchParams } from 'next/navigation';

export default function ChoghadiyaMuhuratClient() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <CosmicLoader size="lg" message="Aligning the Stars..." fullscreen={false} />
            </div>
        }>
            <ChoghadiyaContent />
        </Suspense>
    );
}

function ChoghadiyaContent() {
    const searchParams = useSearchParams();

    // Default State: New Delhi
    const [date, setDate] = useState(new Date());
    const [place, setPlace] = useState('New Delhi, Delhi, India');
    const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090, timezone: "Asia/Kolkata" });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState('en');
    const [pageContent, setPageContent] = useState({ faqs: [], description: "" });

    const formatDate = (date, lang) => {
        return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Initialize from URL Params if present
    useEffect(() => {
        const cityParam = searchParams.get('city');
        const dateParam = searchParams.get('date');

        if (dateParam) {
            const d = new Date(dateParam);
            if (!isNaN(d.getTime())) setDate(d);
        }

        if (cityParam) {
            setPlace(decodeURIComponent(cityParam));
            const fetchCoords = async () => {
                try {
                    const res = await API.post('/astro/geocode', { place: cityParam });
                    if (res.data.success) {
                        setCoords({ lat: res.data.data.lat, lng: res.data.data.lng, timezone: res.data.data.timezone });
                    }
                } catch (e) { console.error(e); }
            };
            fetchCoords();
        }
    }, [searchParams]);

    // Fetch Page Content (FAQs & Description)
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await API.get('/page-content/today-choghadiya-muhurat');
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

    // Update Title and URL (Client-side sync)
    useEffect(() => {
        const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
        const cityName = place.split(',')[0].trim();
        document.title = `${t('todayChoghadiyaMuhurat', lang)} - ${dateStr} - ${cityName} | Way2Astro`;
        
        const newUrl = `/today-choghadiya-muhurat?city=${encodeURIComponent(cityName)}&date=${date.toISOString().split('T')[0]}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }, [date, place, lang]);

    useEffect(() => {
        fetchChoghadiya();
    }, [date, coords]);

    const fetchChoghadiya = async () => {
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const payload = {
                date: dateStr,
                lat: coords.lat,
                lng: coords.lng,
                timezone: coords.timezone
            };
            const res = await API.post('/panchang/calculate', payload);
            if (res.data.success && res.data.data && res.data.data.panchang) {
                setData(res.data.data.panchang);
            }
        } catch (err) {
            console.error('Fetch Choghadiya Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (details) => {
        setCoords({ lat: details.lat, lng: details.lng, timezone: details.timezone });
        setPlace(details.formattedAddress);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            <HeroSection icon="🕒" align="left" extraPaddingBottom={true}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-start text-left flex-1"
                    >
                        <Link href="/calculators" className="inline-flex items-center gap-2 text-indigo-300/60 hover:text-indigo-300 transition-all mb-8 font-bold text-xs uppercase tracking-[0.2em] group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('backToCalculators', lang)}
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                                <Sparkles className="w-3 h-3 text-astro-yellow animate-pulse" />
                                <span className="text-indigo-100 text-[10px] font-bold tracking-[0.2em] uppercase">{t('dailyCelestialAlmanac', lang)}</span>
                            </div>
                            
                            <div className="flex bg-white/10 p-0.5 rounded-full backdrop-blur-md border border-white/10">
                                {['en', 'hi', 'te'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setLang(l)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${lang === l ? 'bg-indigo-500 text-white' : 'text-indigo-200 hover:text-white'}`}
                                    >
                                        {l.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight text-white uppercase">
                            {t('todayChoghadiyaMuhurat', lang)}
                        </h1>

                        <p className="text-slate-300/90 text-sm md:text-base font-medium max-w-lg mb-0 text-left">
                            {t('panchangIntroText', lang)} <span className='text-white font-bold'>{place}</span>.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-auto z-50"
                    >
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[1.5rem] shadow-2xl relative min-w-[320px] md:min-w-[500px]">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <div className="w-full md:flex-[1.5] space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider ml-1">{t('location', lang)}</label>
                                   <div className="h-12 shadow-lg">
                                       <LocationSearch
                                           onLocationSelect={handleLocationSelect}
                                           defaultValue={place}
                                           darkMode={false}
                                           showIcon={true}
                                           showLeftIcon={true}
                                       />
                                   </div>
                                </div>

                                <div className="w-full md:flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider ml-1">{t('date', lang)}</label>
                                    <div className="bg-white/90 rounded-xl flex items-center h-12 shadow-lg">
                                        <DatePicker customInput={<CustomDateInput Icon={Calendar} />} selected={date} onChange={setDate} dateFormat="dd MMM yyyy" className="w-full h-full border-none focus:ring-0 text-slate-800 font-bold px-4 outline-none cursor-pointer bg-transparent rounded-xl text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </HeroSection>

            <div className="max-w-7xl mx-auto px-4 relative -mt-10 md:-mt-24 pb-10">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <CosmicLoader size="lg" message="Aligning the Stars..." fullscreen={false} />
                        </div>
                    ) : data ? (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Celestial Details Strip */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mt-6 md:mt-8">
                                <PanchangCard icon={Sun} label={t('sunrise', lang)} value={data.sun.sunrise} delay={0.1} color="orange" />
                                <PanchangCard icon={Sun} label={t('sunset', lang)} value={data.sun.sunset} delay={0.2} color="red" />
                                <PanchangCard icon={Moon} label={t('moonrise', lang)} value={data.moon.moonrise} delay={0.3} color="indigo" />
                                <PanchangCard icon={Moon} label={t('moonset', lang)} value={data.moon.moonset} delay={0.4} color="slate" />
                                <PanchangCard icon={Calendar} label={t('todayPanchang', lang)} value={formatDate(date, lang)} delay={0.5} color="teal" href="/panchang" lang={lang} />
                            </div>
                        
                            {/* Results Table */}
                            <div id="results" className="w-full">
                                {data.choghadiya && (
                                    <TimingTable
                                        title={t('choghadiya', lang)}
                                        lang={lang}
                                        dayData={data.choghadiya.day}
                                        nightData={data.choghadiya.night}
                                        sunrise={data.sun.sunrise}
                                        sunset={data.sun.sunset}
                                        showQuality={true}
                                        selectedDate={date}
                                    />
                                )}
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* FAQs & Description */}
            <FAQDisplay faqs={pageContent.faqs} description={pageContent.description} />
        </div>
    );
}
