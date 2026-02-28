"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TimeInput({ value, onChange, className, darkMode = false }) {
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("AM");

    // Sync local state with incoming Date value
    useEffect(() => {
        if (value instanceof Date) {
            let h = value.getHours();
            const m = value.getMinutes();
            const p = h >= 12 ? "PM" : "AM";

            // Convert to 12-hour format
            h = h % 12;
            h = h ? h : 12; // the hour '0' should be '12'

            setHour(h.toString().padStart(2, '0'));
            setMinute(m.toString().padStart(2, '0'));
            setPeriod(p);
        }
    }, [value]);

    const handleChange = (newHour, newMinute, newPeriod) => {
        const date = value instanceof Date ? new Date(value) : new Date();
        // If no value was passed, init with today's date but we strictly care about time here.
        // Usually, 'value' should be valid if we want to preserve the 'Date' part. 
        // If 'value' is null, we might need a fallback, but the parent should handle "Date" creation ideally.
        // We'll assume parent passes a Date object or we create a dummy one for time holding.

        let h = parseInt(newHour, 10);
        if (newPeriod === "PM" && h < 12) h += 12;
        if (newPeriod === "AM" && h === 12) h = 0;

        date.setHours(h);
        date.setMinutes(parseInt(newMinute, 10));
        date.setSeconds(0);

        onChange(date);
    };

    const handleHourChange = (e) => {
        setHour(e.target.value);
        handleChange(e.target.value, minute, period);
    };

    const handleMinuteChange = (e) => {
        setMinute(e.target.value);
        handleChange(hour, e.target.value, period);
    };

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
        handleChange(hour, minute, e.target.value);
    };

    // Styles based on darkMode
    const selectClass = `appearance-none bg-transparent border-none focus:ring-0 ${darkMode ? 'text-white' : 'text-slate-900'} font-medium p-0 text-center w-full cursor-pointer outline-none`;

    const wrapperClass = darkMode
        ? "relative bg-slate-900/50 border border-white/10 rounded-xl flex items-center justify-center focus-within:bg-slate-800 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-300 h-full w-full backdrop-blur-sm"
        : "relative bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center focus-within:bg-white focus-within:border-yellow-500 focus-within:ring-4 focus-within:ring-yellow-500/10 transition-all duration-300 h-full w-full";

    const separatorClass = darkMode ? "flex items-center text-slate-500 font-bold text-xl pb-1" : "flex items-center text-slate-400 font-bold text-xl pb-1";
    const iconClass = darkMode ? "absolute right-1 pointer-events-none text-slate-500" : "absolute right-1 pointer-events-none text-slate-400";


    return (
        <div className={`flex gap-1 sm:gap-2 h-[58px] ${className}`}>

            {/* Hour */}
            <div className={wrapperClass}>
                <select value={hour} onChange={handleHourChange} className={selectClass}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h.toString().padStart(2, '0')} className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                            {h.toString().padStart(2, '0')}
                        </option>
                    ))}
                </select>
                <div className={iconClass}>
                    <ChevronDown size={12} />
                </div>
            </div>

            {/* Separator */}
            <div className={separatorClass}>:</div>

            {/* Minute */}
            <div className={wrapperClass}>
                <select value={minute} onChange={handleMinuteChange} className={selectClass}>
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                        <option key={m} value={m.toString().padStart(2, '0')} className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                            {m.toString().padStart(2, '0')}
                        </option>
                    ))}
                </select>
                <div className={iconClass}>
                    <ChevronDown size={12} />
                </div>
            </div>

            {/* Period */}
            <div className={wrapperClass}>
                <select value={period} onChange={handlePeriodChange} className={selectClass}>
                    <option value="AM" className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>AM</option>
                    <option value="PM" className={darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>PM</option>
                </select>
                <div className={iconClass}>
                    <ChevronDown size={12} />
                </div>
            </div>

        </div>
    );
}
