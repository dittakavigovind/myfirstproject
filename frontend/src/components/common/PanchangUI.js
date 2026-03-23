"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sun, Moon, Star, Sparkles, Clock, CheckCircle, XCircle, Info, MinusCircle, ArrowDown 
} from 'lucide-react';
import { useState } from 'react';
import { t, tData } from '../../utils/translations';
import Link from 'next/link';

// --- PanchangCard Component ---
export function PanchangCard({ label, type, value, sub, start, end, next, icon: Icon, color, delay, lang, href }) {
    const theme = {
        amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', border: 'border-amber-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'text-rose-600', border: 'border-rose-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-100' },
        sky: { bg: 'bg-sky-50', text: 'text-sky-700', icon: 'text-sky-600', border: 'border-sky-100' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-600', border: 'border-violet-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600', border: 'border-orange-100' },
        red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-100' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'text-slate-600', border: 'border-slate-100' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-600', border: 'border-teal-100' },
    };

    const tStyle = theme[color] || theme.amber;

    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';
        if (dtStr.includes(' | ')) return dtStr;
        if (/^\d{1,2}:\d{2}/.test(dtStr) && !dtStr.includes('-')) return dtStr;
        if (/^\d{2}-\d{2}-\d{4}/.test(dtStr)) {
            return dtStr.includes(' ') && !dtStr.includes(' | ') ? dtStr.replace(' ', ' | ') : dtStr;
        }
        if (dtStr.includes('T') || dtStr.includes('-') || dtStr.includes('/')) {
            const d = new Date(dtStr);
            if (!isNaN(d.getTime())) {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                return `${dd}-${mm}-${yyyy} | ${time}`;
            }
        }
        return dtStr;
    }

    const cardContent = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className={`bg-white rounded-[1.5rem] p-5 border ${tStyle.border} shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full relative overflow-hidden ${href ? 'cursor-pointer ring-offset-2 hover:ring-2 hover:ring-indigo-500/20' : ''}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tStyle.bg} ${tStyle.icon} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} strokeWidth={2} />
                </div>
                {sub && (
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${tStyle.bg} ${tStyle.text} px-2.5 py-1 rounded-lg border border-transparent`}>
                        {sub}
                    </span>
                )}
            </div>

            <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight mb-2">
                    {value || 'N/A'}
                </h3>
                {(start || end) && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-50">
                        {start && (
                            <div className="flex items-center gap-2 text-[10px] tabular-nums whitespace-nowrap">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter w-12">{lang === 'hi' ? 'शुरू:' : 'Starts:'}</span>
                                <span className="text-slate-600 font-bold">{formatTime(start)}</span>
                            </div>
                        )}
                        {end && (
                            <div className="flex items-center gap-2 text-[10px] tabular-nums whitespace-nowrap">
                                <span className="text-slate-400 font-bold uppercase tracking-tighter w-12">{lang === 'hi' ? 'अंत:' : 'Ends:'}</span>
                                <span className="text-slate-600 font-bold">{formatTime(end)}</span>
                            </div>
                        )}
                    </div>
                )}
                {href && (
                    <div className="mt-2 flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        <span>{t('viewDetails', lang)}</span>
                        <ArrowDown size={12} className="-rotate-90" />
                    </div>
                )}
            </div>

            {next && (
                <div className="mt-auto pt-3 border-t border-slate-50">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('next', lang)}</span>
                            <span className={`text-xs md:text-sm font-black ${tStyle.text} truncate`}>
                                {type ? tData(type, next.name, lang) : next.name}
                            </span>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{t('upto', lang)}</span>
                            <span className="text-[10px] font-bold text-slate-500 tabular-nums">{formatTime(next.end)}</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full no-underline">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

// --- WideTimingCard Component ---
export function WideTimingCard({ label, value, start, end, type, delay, lang }) {
    const styles = {
        good: { border: 'border-l-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
        neutral: { border: 'border-l-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
        bad: { border: 'border-l-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' }
    };

    const s = styles[type] || styles.neutral;

    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';
        if (dtStr.includes(' | ')) return dtStr;
        if (/^\d{1,2}:\d{2}/.test(dtStr) && !dtStr.includes('-')) return dtStr;
        if (/^\d{2}-\d{2}-\d{4}/.test(dtStr)) {
            return dtStr.includes(' ') && !dtStr.includes(' | ') ? dtStr.replace(' ', ' | ') : dtStr;
        }
        if (dtStr.includes('T') || dtStr.includes('-') || dtStr.includes('/')) {
            const d = new Date(dtStr);
            if (!isNaN(d.getTime())) {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                return `${dd}-${mm}-${yyyy} | ${time}`;
            }
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
            <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg ${s.bg} border border-transparent group-hover:border-black/5 transition-colors shrink-0`}>
                <span className="text-[10px] md:text-xs font-bold text-slate-700 tabular-nums tracking-tight whitespace-nowrap">
                    {formatTime(start)} - {formatTime(end)}
                </span>
            </div>
        </motion.div>
    );
}

// --- TimingTable Component ---
export function TimingTable({ title, dayData, nightData, delay, color, isHora, showQuality = false, lang, sunrise, sunset, selectedDate }) {
    const parseTime = (str, referenceDate = new Date()) => {
        if (!str) return null;
        const [time, modifier] = str.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        const d = new Date(referenceDate);
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return d;
    };

    const isToday = () => {
        if (!selectedDate) return true;
        const sel = new Date(selectedDate);
        const today = new Date();
        return sel.getDate() === today.getDate() && 
               sel.getMonth() === today.getMonth() && 
               sel.getFullYear() === today.getFullYear();
    };

    const [activeTab, setActiveTab] = useState(() => {
        const now = new Date();
        if (sunrise && sunset) {
            const sr = parseTime(sunrise, now);
            const ss = parseTime(sunset, now);
            if (sr && ss) {
                return (now >= sr && now < ss) ? 'day' : 'night';
            }
        }
        return 'day';
    });

    const isCurrent = (startStr, endStr) => {
        if (!isToday()) return false;
        
        const now = new Date();
        try {
            let start = parseTime(startStr, now);
            let end = parseTime(endStr, now);
            
            if (!start || !end) return false;

            // If end is earlier than start, it means it crosses midnight
            if (end < start) {
                if (now < start) {
                    const yesterdayStart = new Date(start); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                    return now >= yesterdayStart && now < end;
                } else {
                    const tomorrowEnd = new Date(end); tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
                    return now >= start && now < tomorrowEnd;
                }
            }
            
            return now >= start && now < end;
        } catch (e) {
            return false;
        }
    };

    const getQualityInfo = (type) => {
        const qualities = {
            Amrit: { label: t('good', lang), color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: CheckCircle },
            Shubh: { label: t('good', lang), color: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-500', icon: CheckCircle },
            Labh: { label: t('good', lang), color: 'text-sky-600', bg: 'bg-sky-50', bar: 'bg-sky-500', icon: CheckCircle },
            Char: { label: t('neutral', lang), color: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-500', icon: Info },
            Rog: { label: t('bad', lang), color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: XCircle },
            Kaal: { label: t('bad', lang), color: 'text-slate-600', bg: 'bg-slate-50', bar: 'bg-slate-500', icon: XCircle },
            Udveg: { label: t('bad', lang), color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500', icon: XCircle },
            Sun: { label: tData('planets', 'Sun', lang), color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: Sun },
            Moon: { label: tData('planets', 'Moon', lang), color: 'text-slate-600', bg: 'bg-slate-50', bar: 'bg-slate-400', icon: Moon },
            Mars: { label: tData('planets', 'Mars', lang), color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500', icon: Star },
            Mercury: { label: tData('planets', 'Mercury', lang), color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: Sparkles },
            Jupiter: { label: tData('planets', 'Jupiter', lang), color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500', icon: Star },
            Venus: { label: tData('planets', 'Venus', lang), color: 'text-pink-600', bg: 'bg-pink-50', bar: 'bg-pink-400', icon: Sparkles },
            Saturn: { label: tData('planets', 'Saturn', lang), color: 'text-indigo-600', bg: 'bg-indigo-50', bar: 'bg-indigo-600', icon: Moon },
        };
        return qualities[type] || { label: t('neutral', lang), color: 'text-slate-500', bg: 'bg-slate-50', bar: 'bg-slate-400', icon: MinusCircle };
    };

    const renderDataList = (data, type) => (
        <div className="space-y-3">
             <div className="flex items-center gap-2 mb-4">
                {type === 'day' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-indigo-500" />}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t(type, lang)}</span>
            </div>
            {data?.map((item, idx) => {
                const info = getQualityInfo(isHora ? item.planet : item.name);
                const active = isCurrent(item.start, item.end);
                const Icon = info.icon;
                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * idx }}
                        className={`relative flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all group/row overflow-hidden w-full ${active ? 'bg-indigo-50/50 border-indigo-200 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20' : 'border-slate-50 bg-white hover:border-slate-100 hover:shadow-lg hover:shadow-slate-100/50'}`}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${info.bar} ${active ? 'w-2 shadow-[2px_0_8px_rgba(0,0,0,0.1)]' : ''}`}></div>
                        <div className="flex items-center gap-3 md:gap-4 pl-2 md:pl-3 w-full sm:w-auto overflow-hidden">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${info.bg} ${info.color} ${active ? 'animate-pulse' : ''}`}>
                                <Icon size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className={`text-xs md:text-sm font-black tracking-tight uppercase truncate ${active ? 'text-indigo-900' : 'text-slate-900'}`}>
                                    {isHora ? tData('planets', item.planet, lang) : tData('choghadiya', item.name, lang)}
                                    {active && <span className="ml-2 text-[8px] md:text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full lowercase tracking-normal align-middle">{lang === 'hi' ? 'अभी' : 'Now'}</span>}
                                </h4>
                                {showQuality && (
                                    <div className={`inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${info.color}`}>
                                        {info.label}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right pl-2 shrink-0">
                            <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg border transition-colors ${active ? 'bg-white border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 group-hover/row:bg-white group-hover/row:border-slate-200'}`}>
                                <span className="text-[10px] md:text-xs font-bold tabular-nums whitespace-nowrap">
                                    {item.start} - {item.end}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay, duration: 0.7 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative group h-full w-full"
        >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4 relative z-10 w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`p-2 md:p-2.5 rounded-xl ${color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {color === 'orange' ? <Clock size={18} className="md:w-5 md:h-5" /> : <Star size={18} className="md:w-5 md:h-5" />}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                </div>

                <div className="flex lg:hidden bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner w-full sm:w-auto">
                    {['day', 'night'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 sm:flex-none relative px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab ? 'text-indigo-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                                {t(tab, lang)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative z-10">
                {/* Desktop Grid Layout */}
                <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
                    {renderDataList(dayData, 'day')}
                    {renderDataList(nightData, 'night')}
                </div>

                {/* Mobile Tab Layout */}
                <div className="lg:hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderDataList(activeTab === 'day' ? dayData : nightData, activeTab)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${activeTab === 'day' ? 'bg-orange-500' : 'bg-indigo-500'}`}></div>
        </motion.div>
    );
}
