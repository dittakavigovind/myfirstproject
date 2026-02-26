"use client";
import React, { useState, useEffect } from 'react';
import API from '../../../lib/api';
import FestivalModal from '../../../components/calculators/FestivalModal';
import LocationSearch from '../../../components/LocationSearch';
import { ChevronLeft, ChevronRight, MapPin, Loader2, Calendar as CalIcon, ArrowLeft, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageContentSection from '../../../components/common/PageContentSection';
import analytics from '../../../lib/analytics';

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function IndianCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFestival, setSelectedFestival] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedPanchang, setSelectedPanchang] = useState(null);

    // Default Location: Hyderabad
    const [location, setLocation] = useState({
        lat: 17.3850,
        lng: 78.4867,
        timezone: 'Asia/Kolkata',
        formattedAddress: 'Hyderabad, Telangana, India'
    });

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, location]);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            const res = await API.post('/panchang/monthly', {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(), // 0-indexed
                lat: location.lat,
                lng: location.lng,
                timezone: location.timezone,
                location: location.formattedAddress
            });
            if (res.data.success) {
                setCalendarData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch calendar", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    useEffect(() => {
        analytics.track('VIEW', 'CALENDAR', 'calendar_view', {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth(),
            location: location.formattedAddress
        });
    }, [currentDate, location.formattedAddress]);

    const handleDateClick = (dayData) => {
        if (dayData.festivals && dayData.festivals.length > 0) {
            setSelectedFestival(dayData.festivals[0]);
            setSelectedDate(dayData.date);
            setSelectedPanchang({ tithi: dayData.tithi, masa: dayData.masa, nakshatra: dayData.nakshatra });

            analytics.track('CLICK', 'CALENDAR', 'festival_click', {
                date: dayData.date,
                festival: dayData.festivals[0].name
            });
        } else {
            analytics.track('CLICK', 'CALENDAR', 'date_click', {
                date: dayData.date
            });
        }
    };

    const handleLocationSelect = (locData) => {
        setLocation({
            lat: locData.lat,
            lng: locData.lng,
            timezone: locData.timezone,
            formattedAddress: locData.formattedAddress
        });
    };

    // Calculate previous month's trailing days for empty cells
    const getPreviousMonthDays = () => {
        if (!calendarData) return [];
        const firstDay = new Date(calendarData.year, calendarData.month, 1).getDay();
        if (firstDay === 0) return []; // Month starts on Sunday, no empty cells needed

        const prevMonthDays = new Date(calendarData.year, calendarData.month, 0).getDate();
        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(prevMonthDays - i);
        }
        return days;
    };

    // Calculate next month's starting days to fill out the grid
    const getNextMonthDays = () => {
        if (!calendarData) return [];
        const firstDay = new Date(calendarData.year, calendarData.month, 1).getDay();
        const daysInCurrentMonth = new Date(calendarData.year, calendarData.month + 1, 0).getDate();

        const totalCellsOccupied = firstDay + daysInCurrentMonth;
        const remainder = totalCellsOccupied % 7;

        if (remainder === 0) return []; // Grid is perfectly filled

        const daysToFill = 7 - remainder;
        const days = [];
        for (let i = 1; i <= daysToFill; i++) {
            days.push(i);
        }
        return days;
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-20">

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8">
                    <Link href="/calculators" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors font-bold text-xs uppercase tracking-[0.2em] group shrink-0">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO CALCULATORS
                    </Link>

                    <div className="w-full max-w-md relative z-30 h-12">
                        <LocationSearch
                            onLocationSelect={handleLocationSelect}
                            placeholder="Search City for accurate Tithis..."
                            defaultValue={location.formattedAddress}
                            showLeftIcon={true}
                        />
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="bg-gradient-to-r from-[#0b1c3d] to-[#1a2e5a] rounded-t-2xl p-6 flex items-center justify-between text-white shadow-2xl border-b border-white/10">
                    <button onClick={handlePrevMonth} className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h1>
                        <div className="h-1 w-12 bg-amber-500 rounded-full mt-1.5 opacity-80 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                    </div>
                    <button onClick={handleNextMonth} className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg">
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-[#fffcf7] shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-b-2xl overflow-hidden border-x border-b border-slate-200 dark:border-slate-800">
                    {/* Weekday Header */}
                    <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-500 dark:bg-slate-800">
                        {WEEKDAYS.map((day, index) => {
                            const isSunday = index === 0;

                            return (
                                <div
                                    key={day}
                                    className={`py-2 md:py-3 text-center font-black border-r border-slate-400 dark:border-slate-700 last:border-r-0 uppercase text-[8px] md:text-[10px] tracking-normal md:tracking-[0.2em] transition-all
                                        ${isSunday ? 'text-amber-400' : 'text-slate-100'}
                                    `}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    {/* Days */}
                    {loading ? (
                        <div className="h-[400px] md:h-[600px] flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900">
                            <div className="relative">
                                <Loader2 size={48} className="animate-spin text-amber-500 opacity-20" />
                                <Loader2 size={48} className="animate-spin text-amber-500 absolute top-0 left-0" style={{ animationDuration: '3s' }} />
                            </div>
                            <p className="mt-6 font-medium tracking-widest uppercase text-xs opacity-60">Consulting Heavens...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 auto-rows-[85px] md:auto-rows-[140px]">
                            {/* Previous Month Cells */}
                            {getPreviousMonthDays().map((dayNum, i) => (
                                <div key={`prev-${i}`} className="border-r border-b border-slate-100 dark:border-slate-800 bg-[#fffcf7] dark:bg-slate-900/50 p-1 md:p-4 flex flex-col items-center md:items-start pointer-events-none opacity-40 overflow-hidden">
                                    <span className="text-xl md:text-3xl lg:text-4xl font-black mb-1 text-slate-400">
                                        {dayNum}
                                    </span>
                                </div>
                            ))}

                            {/* Date Cells */}
                            {calendarData?.days.map((day, index) => {
                                const hasFestival = day.festivals && day.festivals.length > 0;
                                const isPurnima = day.tithi.index === 15;
                                const isAmavasya = day.tithi.index === 30;

                                const today = new Date();
                                const isToday = day.day === today.getDate() &&
                                    currentDate.getMonth() === today.getMonth() &&
                                    currentDate.getFullYear() === today.getFullYear();

                                // Correct Sunday detection based on grid position
                                const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                                const gridIndex = firstDayOfMonth + index;
                                const isSundayDay = gridIndex % 7 === 0;

                                // Calculate if this day is in the current week
                                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.day);
                                const startOfWeek = new Date(today);
                                startOfWeek.setDate(today.getDate() - today.getDay());
                                startOfWeek.setHours(0, 0, 0, 0);

                                const endOfWeek = new Date(startOfWeek);
                                endOfWeek.setDate(startOfWeek.getDate() + 6);
                                endOfWeek.setHours(23, 59, 59, 999);

                                const isThisWeek = dayDate >= startOfWeek && dayDate <= endOfWeek;

                                return (
                                    <motion.div
                                        key={day.date}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: "rgba(245, 158, 11, 0.03)" }}
                                        onClick={() => handleDateClick(day)}
                                        className={`relative border-r border-b border-slate-100 p-1 md:p-4 flex flex-col items-center md:items-start transition-all duration-300 group overflow-hidden
                                            ${isToday ? 'bg-amber-50/40 z-10' : isThisWeek ? 'bg-slate-100/30' : ''}
                                            ${hasFestival ? 'cursor-pointer' : 'cursor-default'}
                                        `}
                                    >
                                        {/* Today Badge Glow */}
                                        {isToday && (
                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
                                        )}

                                        <div className="flex flex-col h-full w-full">
                                            <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between w-full">
                                                <span className={`text-xl md:text-3xl lg:text-4xl font-black mb-0.5 md:mb-1 leading-none tracking-tighter transition-all duration-300
                                                    ${isSundayDay ? 'text-amber-500' : isToday ? 'text-amber-600 drop-shadow-sm' : 'text-slate-900 opacity-90 group-hover:opacity-100'}
                                                `}>
                                                    {day.day}
                                                </span>

                                                {/* Lunar Phase Icon (Aligned Right of Date, Hidden on mobile to save space) */}
                                                <div className="hidden md:flex items-center">
                                                    {isPurnima && (
                                                        <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-500" title="Purnima (Full Moon)">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-amber-400 rounded-full blur-[6px] opacity-40 animate-pulse"></div>
                                                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner flex items-center justify-center border border-amber-200/50">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px]"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {isAmavasya && (
                                                        <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-500" title="Amavasya (New Moon)">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-slate-900 rounded-full blur-[2px] opacity-60"></div>
                                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl flex items-center justify-center border border-slate-600/50">
                                                                    <div className="w-3.5 h-3.5 rounded-full border-r-[2px] border-slate-400/30 -rotate-45"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center md:items-start mt-0.5 md:mt-2 w-full">
                                                <div className="hidden md:inline-flex items-center mb-1.5 py-0.5 px-2 bg-slate-100 rounded-full border border-slate-200/50 transition-all duration-300 group-hover:bg-amber-100">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tight whitespace-nowrap">
                                                        {day.masa.purnimanta}
                                                        <span className="mx-1 text-slate-300">|</span>
                                                        <span className={day.tithi.paksha === 'Shukla' ? 'text-amber-600' : 'text-slate-400'}>
                                                            {day.tithi.paksha[0]}
                                                        </span>
                                                    </span>
                                                </div>
                                                <span className="text-[7.5px] md:text-[11px] text-slate-500 font-bold tracking-tighter md:tracking-widest line-clamp-1 uppercase opacity-90 group-hover:opacity-100 text-center md:text-left w-full overflow-hidden text-ellipsis">
                                                    {day.tithi.name}
                                                </span>
                                            </div>

                                            {hasFestival && (
                                                <div className="mt-auto md:pt-2 transform group-hover:-translate-y-1 transition-transform duration-300 w-full flex justify-center md:justify-start">
                                                    <div className="flex items-center gap-1 md:gap-1.5 w-full justify-center md:justify-start">
                                                        <div className="hidden md:block w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                                                        <span className="text-[7.5px] md:text-[10px] font-black text-amber-600 leading-[10px] md:leading-tight line-clamp-2 md:line-clamp-1 uppercase tracking-tighter md:tracking-wider text-center md:text-left break-words w-full overflow-hidden text-ellipsis">
                                                            {day.festivals[0].name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {/* Next Month Cells */}
                            {getNextMonthDays().map((dayNum, i) => (
                                <div key={`next-${i}`} className="border-r border-b border-slate-100 dark:border-slate-800 bg-[#fffcf7] dark:bg-slate-900/50 p-1 md:p-4 flex flex-col items-center md:items-start pointer-events-none opacity-40 overflow-hidden">
                                    <span className="text-xl md:text-3xl lg:text-4xl font-black mb-1 text-slate-400">
                                        {dayNum}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location Info (Premium) */}
                <div className="mt-8 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/20 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <MapPin size={18} className="text-amber-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Observation Node</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{location.formattedAddress}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">S</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shukla Paksha</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">K</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Krishna Paksha</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purnima</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amavasya</span>
                        </div>
                    </div>
                </div>
            </div>

            <FestivalModal
                isOpen={!!selectedFestival}
                onClose={() => setSelectedFestival(null)}
                festival={selectedFestival}
                date={selectedDate}
                panchang={selectedPanchang}
            />

            <PageContentSection slug="calculators/indian-calendar" />
        </div>
    );
}
