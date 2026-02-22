"use client";

import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sparkles, Droplet, ChevronDown, Star, Palette, Zap, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays } from 'date-fns';
import FeaturedAstrologerCard from '@/components/horoscope/FeaturedAstrologerCard';

const SIGNS = [
    { name: 'Aries', icon: '♈' }, { name: 'Taurus', icon: '♉' },
    { name: 'Gemini', icon: '♊' }, { name: 'Cancer', icon: '♋' },
    { name: 'Leo', icon: '♌' }, { name: 'Virgo', icon: '♍' },
    { name: 'Libra', icon: '♎' }, { name: 'Scorpio', icon: '♏' },
    { name: 'Sagittarius', icon: '♐' }, { name: 'Capricorn', icon: '♑' },
    { name: 'Aquarius', icon: '♒' }, { name: 'Pisces', icon: '♓' }
];

const ZODIAC_THEMES = {
    aries: { color: 'from-orange-500 to-red-600', shadow: 'shadow-red-500/40', text: 'text-red-500', bg: 'bg-red-50' },
    taurus: { color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/40', text: 'text-emerald-500', bg: 'bg-emerald-50' },
    gemini: { color: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-500/40', text: 'text-amber-600', bg: 'bg-amber-50' },
    cancer: { color: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-500/40', text: 'text-cyan-600', bg: 'bg-cyan-50' },
    leo: { color: 'from-orange-400 to-amber-600', shadow: 'shadow-orange-500/40', text: 'text-orange-600', bg: 'bg-orange-50' },
    virgo: { color: 'from-emerald-600 to-teal-700', shadow: 'shadow-emerald-600/40', text: 'text-teal-600', bg: 'bg-teal-50' },
    libra: { color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/40', text: 'text-pink-600', bg: 'bg-pink-50' },
    scorpio: { color: 'from-purple-600 to-indigo-700', shadow: 'shadow-purple-500/40', text: 'text-purple-600', bg: 'bg-purple-50' },
    sagittarius: { color: 'from-rose-500 to-red-600', shadow: 'shadow-red-500/40', text: 'text-rose-600', bg: 'bg-rose-50' },
    capricorn: { color: 'from-slate-600 to-gray-700', shadow: 'shadow-slate-500/40', text: 'text-slate-600', bg: 'bg-slate-50' },
    aquarius: { color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/40', text: 'text-sky-600', bg: 'bg-sky-50' },
    pisces: { color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40', text: 'text-violet-600', bg: 'bg-violet-50' }
};

export default function DailyHoroscopePage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSign, setSelectedSign] = useState('aries');
    const [horoscopeData, setHoroscopeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHoroscope = async () => {
            setLoading(true);
            try {
                const formattedDate = selectedDate.toISOString();
                const { data } = await API.get(`/horoscope-manager/daily?date=${formattedDate}`);
                if (data.success) {
                    setHoroscopeData({
                        title: data.data.title,
                        ...data.data.signs[selectedSign]
                    });
                }
            } catch (error) {
                setHoroscopeData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchHoroscope();
    }, [selectedDate, selectedSign]);

    const theme = ZODIAC_THEMES[selectedSign] || ZODIAC_THEMES['aries'];

    // Date navigation handlers
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => {
        if (!isToday(selectedDate)) {
            setSelectedDate(prev => addDays(prev, 1));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
            {/* Premium Hero Section */}
            <div className={`relative bg-gradient-to-br ${theme.color} text-white pb-28 pt-6 md:pt-12 px-6 rounded-b-[2rem] md:rounded-b-[3.5rem] shadow-2xl overflow-hidden transition-all duration-700`}>

                {/* Animated Orbs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-[80px]"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left flex-1"
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 backdrop-blur-md shadow-lg">
                            Daily Insights
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-xl tracking-tight leading-tight">
                            Your Daily Forecast
                        </h1>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold mb-4 shadow-lg">
                            <CalendarIcon size={18} className="text-white/80" />
                            <span>{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
                        </div>
                        <p className="text-white/80 font-medium max-w-lg mx-auto md:mx-0 text-sm md:text-base leading-relaxed">
                            Unveil the mysteries of the universe. Your personalized cosmic guidance for today awaits.
                        </p>
                    </motion.div>

                    {/* Right: Featured Astrologer */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end scale-90 md:scale-100 origin-center md:origin-right"
                    >
                        <FeaturedAstrologerCard />
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
                {/* Controls Card */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-2 md:p-2 mb-12 flex flex-col items-center gap-8"
                >
                    {/* Sign Selector - Squarcle Grid */}
                    <div className="w-full">
                        <div className="flex overflow-x-auto gap-3 py-2 px-2 no-scrollbar md:grid md:grid-cols-6 lg:grid-cols-12 md:gap-3 md:justify-items-center snap-x md:snap-none">
                            {SIGNS.map((s) => (
                                <button
                                    key={s.name}
                                    onClick={() => setSelectedSign(s.name.toLowerCase())}
                                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 md:w-full md:aspect-[4/5] rounded-2xl transition-all duration-300 snap-center group relative overflow-hidden ${selectedSign === s.name.toLowerCase()
                                        ? `bg-gradient-to-br ${ZODIAC_THEMES[s.name.toLowerCase()].color} text-white shadow-xl scale-105 ring-2 ring-offset-2 ring-offset-white ring-${ZODIAC_THEMES[s.name.toLowerCase()].text.split('-')[1]}-200`
                                        : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-lg border border-transparent hover:border-slate-100'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl mb-1 transition-colors duration-300 ${selectedSign === s.name.toLowerCase() ? 'bg-white/20' : 'bg-white group-hover:bg-indigo-50'
                                        }`}>
                                        <span className="text-2xl filter drop-shadow-sm">{s.icon}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedSign === s.name.toLowerCase() ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                        {s.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div key="loader" className="bg-white rounded-[2.5rem] p-16 text-center shadow-lg border border-slate-100 min-h-[400px] flex flex-col items-center justify-center">
                            <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6 border-slate-200 bg-gradient-to-r ${theme.color} bg-clip-border`}></div>
                            <p className="text-slate-400 font-bold text-lg animate-pulse tracking-wide">Aligning the stars...</p>
                        </div>
                    ) : horoscopeData && horoscopeData.prediction ? (
                        <motion.div
                            key={selectedSign + selectedDate}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Main Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${theme.color}`}></div>
                                <div className={`absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br ${theme.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-700 pointer-events-none`}></div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.color} flex items-center justify-center text-4xl text-white shadow-lg shadow-black/10 transform group-hover:scale-105 transition-transform duration-500`}>
                                            {SIGNS.find(s => s.name.toLowerCase() === selectedSign)?.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-slate-800 capitalize leading-none mb-2">{selectedSign} Horoscope</h2>
                                            <p className={`text-sm font-bold uppercase tracking-widest ${theme.text} opacity-80`}>{horoscopeData.title}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-lg text-slate-600 mb-12 leading-relaxed max-w-none relative z-10">
                                    <p className="first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-slate-200">
                                        {horoscopeData.prediction}
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/60 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group/stat">
                                        <div className={`w-12 h-12 mb-3 rounded-full ${theme.bg} flex items-center justify-center group-hover/stat:scale-110 transition-transform`}>
                                            <Palette className={`w-5 h-5 ${theme.text}`} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Lucky Color</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: horoscopeData.luckyColor?.toLowerCase() || '#ccc' }}></div>
                                            <span className="font-bold text-slate-900 text-lg capitalize">{horoscopeData.luckyColor}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/60 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group/stat">
                                        <div className={`w-12 h-12 mb-3 rounded-full ${theme.bg} flex items-center justify-center group-hover/stat:scale-110 transition-transform`}>
                                            <Zap className={`w-5 h-5 ${theme.text}`} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Lucky Number</span>
                                        <span className="text-3xl font-black text-slate-900">{horoscopeData.luckyNumber}</span>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/60 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group/stat">
                                        <div className={`w-12 h-12 mb-3 rounded-full ${theme.bg} flex items-center justify-center group-hover/stat:scale-110 transition-transform`}>
                                            <Star className={`w-5 h-5 ${theme.text}`} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Cosmic Vibe</span>
                                        <div className="flex gap-1.5 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${i < horoscopeData.cosmicVibe ? `bg-gradient-to-r ${theme.color}` : 'bg-slate-200'}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm min-h-[300px] flex flex-col items-center justify-center border border-slate-100">
                            <Droplet className="text-slate-200 mb-6" size={64} />
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Stars coincide with Silence</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                                The forecast for <span className="font-bold text-slate-800 capitalize decoration-2 underline decoration-slate-200">{selectedSign}</span> on <span className="font-bold text-slate-700">{format(selectedDate, 'MMM dd')}</span> hasn't been written yet.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
