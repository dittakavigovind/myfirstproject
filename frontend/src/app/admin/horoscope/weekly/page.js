"use client";

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Calendar as CalendarIcon, Save, Trash2, ArrowLeft, Sun, RotateCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export default function WeeklyHoroscopeAdmin() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekRange, setWeekRange] = useState({ start: new Date(), end: new Date() });
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [activeTab, setActiveTab] = useState('aries');
    const [filledWeeks, setFilledWeeks] = useState([]);

    // Form State
    const [globalTitle, setGlobalTitle] = useState('');
    const [id, setId] = useState(null);
    const [signsData, setSignsData] = useState({});

    useEffect(() => {
        // Initialize empty state
        const initialSigns = {};
        ZODIAC_SIGNS.forEach(sign => {
            initialSigns[sign] = {
                title: '',
                prediction: '',
                advice: '',
                luck: '',
                energy: ''
            };
        });
        setSignsData(initialSigns);
        fetchAvailability(new Date().getFullYear());
    }, []);

    // Update range when date changes
    useEffect(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
        const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
        setWeekRange({ start, end });
        fetchHoroscope(selectedDate);
    }, [selectedDate]);

    const fetchHoroscope = async (date) => {
        setLoading(true);
        try {
            const formattedDate = date.toISOString();
            const { data } = await API.get(`/horoscope-manager/weekly?date=${formattedDate}`);
            if (data.success) {
                setGlobalTitle(data.data.title || '');
                setId(data.data._id);

                const loadedSigns = {};
                ZODIAC_SIGNS.forEach(sign => {
                    loadedSigns[sign] = {
                        title: data.data.signs?.[sign]?.title || '',
                        prediction: data.data.signs?.[sign]?.prediction || '',
                        advice: data.data.signs?.[sign]?.advice || '',
                        luck: data.data.signs?.[sign]?.luck || '',
                        energy: data.data.signs?.[sign]?.energy || ''
                    };
                });
                setSignsData(loadedSigns);
                setExists(true);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                resetForm();
                setExists(false);
            } else {
                toast.error("Failed to fetch data");
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailability = async (year) => {
        try {
            const { data } = await API.get(`/horoscope-manager/weekly/availability?year=${year}`);
            if (data.success) {
                const weeks = data.data.map(w => ({
                    start: new Date(w.weekStartDate),
                    end: new Date(w.weekEndDate)
                }));
                setFilledWeeks(weeks);
            }
        } catch (error) {
            console.error("Failed to fetch availability", error);
        }
    };

    const resetForm = () => {
        setGlobalTitle('');
        setId(null);
        const initialSigns = {};
        ZODIAC_SIGNS.forEach(sign => {
            initialSigns[sign] = { title: '', prediction: '', advice: '' };
        });
        setSignsData(initialSigns);
    };

    const handleSignChange = (field, value) => {
        setSignsData(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }));
    };

    const handleResetSign = () => {
        if (!window.confirm(`Are you sure you want to clear data for ${activeTab}?`)) return;
        setSignsData(prev => ({
            ...prev,
            [activeTab]: {
                title: '',
                prediction: '',
                advice: '',
                luck: '',
                energy: ''
            }
        }));
        toast.success(`Cleared data for ${activeTab}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Validate all fields for all signs
            for (const sign of ZODIAC_SIGNS) {
                const data = signsData[sign];
                if (!data?.title?.trim()) {
                    toast.error(`Please enter "Theme" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.prediction?.trim()) {
                    toast.error(`Please enter "Overview" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.advice?.trim()) {
                    toast.error(`Please enter "Special Advice" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
            }

            const payload = {
                weekStartDate: weekRange.start,
                weekEndDate: weekRange.end,
                title: globalTitle || `Weekly Horoscope ${format(weekRange.start, 'MMM dd')}`,
                signs: signsData
            };

            if (exists && id) {
                await API.put(`/horoscope-manager/weekly/${id}`, payload);
                toast.success("Updated Successfully");
                fetchAvailability(selectedDate.getFullYear());
            } else {
                const res = await API.post('/horoscope-manager/weekly', payload);
                setId(res.data.data._id);
                setExists(true);
                toast.success("Created Successfully");
                fetchAvailability(selectedDate.getFullYear());
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this horoscope?")) return;
        setIsSaving(true);
        try {
            await API.delete(`/horoscope-manager/weekly/${id}`);
            resetForm();
            setExists(false);
            toast.success("Deleted Successfully");
            fetchAvailability(selectedDate.getFullYear());
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <Link href="/admin/horoscope">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar / Date Picker */}
                    <div className="w-full lg:w-80 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0 lg:sticky lg:top-24 lg:self-start z-0">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CalendarIcon size={18} className="text-blue-500" /> Select Week
                        </h3>
                        <div className="custom-datepicker-wrapper weekly-picker">
                            <DatePicker
                                customInput={<CustomDateInput />}
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                inline
                                showWeekNumbers
                                className="border rounded-lg"
                                onMonthChange={(date) => fetchAvailability(date.getFullYear())}
                                onYearChange={(date) => fetchAvailability(date.getFullYear())}
                                dayClassName={(date) => filledWeeks.some(w => date >= w.start && date <= w.end) ? "bg-green-100 text-green-600 font-bold" : undefined}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-4 text-center">
                            Pick any day to select that entire week (Sun-Sat).
                        </p>
                    </div>

                    {/* Main Form */}
                    <div className="flex-1 w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Weekly Forecast</span>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                                    {format(weekRange.start, 'MMM dd')} - {format(weekRange.end, 'MMM dd, yyyy')}
                                </h2>
                            </div>
                            {exists && (
                                <button
                                    onClick={handleDelete}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    title="Delete Entry"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Tabs */}
                            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 custom-scrollbar">
                                {ZODIAC_SIGNS.map(sign => (
                                    <button
                                        key={sign}
                                        type="button"
                                        onClick={() => setActiveTab(sign)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap capitalize transition-all ${activeTab === sign
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {sign}
                                    </button>
                                ))}
                            </div>

                            {/* Sign Specific Fields */}
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
                                        <Sun size={20} className="text-blue-500" /> {activeTab} Forecast
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleResetSign}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                        title="Clear Sign Data"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Weekly Theme moved here */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Weekly Theme / Title</label>
                                        <input
                                            type="text"
                                            // Removed required
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white"
                                            placeholder={`Theme for ${activeTab}...`}
                                            value={signsData[activeTab]?.title || ''}
                                            onChange={e => handleSignChange('title', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Overview</label>
                                        <textarea
                                            // Removed required
                                            rows={5}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none bg-white"
                                            placeholder={`General forecast for ${activeTab}...`}
                                            value={signsData[activeTab]?.prediction || ''}
                                            onChange={e => handleSignChange('prediction', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Special Advice</label>
                                        <textarea
                                            // Removed required
                                            rows={3}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none bg-white"
                                            placeholder={`Key advice for ${activeTab}...`}
                                            value={signsData[activeTab]?.advice || ''}
                                            onChange={e => handleSignChange('advice', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Luck (%)</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white"
                                                placeholder="e.g. 80%"
                                                value={signsData[activeTab]?.luck || ''}
                                                onChange={e => handleSignChange('luck', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Energy</label>
                                            <select
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition bg-white appearance-none"
                                                value={signsData[activeTab]?.energy || ''}
                                                onChange={e => handleSignChange('energy', e.target.value)}
                                            >
                                                <option value="">Select Energy</option>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Average">Average</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {exists ? 'Update Weekly Forecast' : 'Save Weekly Forecast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
