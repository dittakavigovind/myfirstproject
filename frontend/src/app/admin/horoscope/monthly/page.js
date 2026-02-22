"use client";

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Calendar as CalendarIcon, Save, Trash2, ArrowLeft, Sun, RotateCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export default function MonthlyHoroscopeAdmin() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [activeTab, setActiveTab] = useState('aries');
    const [filledMonths, setFilledMonths] = useState([]);

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
                overview: '',
                career: '',
                love: '',
                health: ''
            };
        });
        setSignsData(initialSigns);
        fetchAvailability(new Date().getFullYear());
    }, []);

    useEffect(() => {
        fetchHoroscope(selectedDate);
    }, [selectedDate]);

    const fetchHoroscope = async (date) => {
        setLoading(true);
        try {
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const { data } = await API.get(`/horoscope-manager/monthly?month=${month}&year=${year}`);
            if (data.success) {
                setGlobalTitle(data.data.title || '');
                setId(data.data._id);

                const loadedSigns = {};
                ZODIAC_SIGNS.forEach(sign => {
                    loadedSigns[sign] = {
                        title: data.data.signs?.[sign]?.title || '',
                        overview: data.data.signs?.[sign]?.overview || '',
                        career: data.data.signs?.[sign]?.career || '',
                        love: data.data.signs?.[sign]?.love || '',
                        health: data.data.signs?.[sign]?.health || ''
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
            const { data } = await API.get(`/horoscope-manager/monthly/availability?year=${year}`);
            if (data.success) {
                const filled = data.data.map(m => `${m.year}-${String(m.month).padStart(2, '0')}`);
                setFilledMonths(filled);
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
            initialSigns[sign] = { title: '', overview: '', career: '', love: '', health: '' };
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
                overview: '',
                career: '',
                love: '',
                health: ''
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
                    toast.error(`Please enter "Headline" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.overview?.trim()) {
                    toast.error(`Please enter "General Overview" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.career?.trim()) {
                    toast.error(`Please enter "Career & Finance" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.love?.trim()) {
                    toast.error(`Please enter "Love & Relationships" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.health?.trim()) {
                    toast.error(`Please enter "Health & Wellness" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
            }

            const payload = {
                month: selectedDate.getMonth() + 1,
                year: selectedDate.getFullYear(),
                title: globalTitle || `Monthly Horoscope ${format(selectedDate, 'MMMM yyyy')}`,
                signs: signsData
            };

            if (exists && id) {
                await API.put(`/horoscope-manager/monthly/${id}`, payload);
                toast.success("Updated Successfully");
                fetchAvailability(selectedDate.getFullYear());
            } else {
                const res = await API.post('/horoscope-manager/monthly', payload);
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
            await API.delete(`/horoscope-manager/monthly/${id}`);
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
                            <CalendarIcon size={18} className="text-purple-500" /> Select Month
                        </h3>
                        <div className="custom-datepicker-wrapper monthly-picker">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                inline
                                showMonthYearPicker
                                className="border rounded-lg"
                                onYearChange={(date) => fetchAvailability(date.getFullYear())}
                                monthClassName={(date) => {
                                    // In month picker, date passed here is usually the first of the month
                                    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                                    console.log('Checking month:', monthStr, 'Filled:', filledMonths);
                                    return filledMonths.includes(monthStr)
                                        ? "bg-purple-100 text-purple-600 font-bold rounded-lg"
                                        : undefined;
                                }}
                            />
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="flex-1 w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="animate-spin text-purple-500" size={32} />
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Monthly Overview</span>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                                    {format(selectedDate, 'MMMM yyyy')}
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
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {sign}
                                    </button>
                                ))}
                            </div>

                            {/* Sign Specific Fields */}
                            <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
                                        <Sun size={20} className="text-purple-500" /> {activeTab} Forecast
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
                                    {/* Monthly Headline moved here */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Monthly Headline</label>
                                        <input
                                            type="text"
                                            // Removed required
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none transition bg-white"
                                            placeholder={`Headline for ${activeTab}...`}
                                            value={signsData[activeTab]?.title || ''}
                                            onChange={e => handleSignChange('title', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">General Overview</label>
                                        <textarea
                                            // Removed required
                                            rows={4}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none bg-white"
                                            placeholder={`Synopsis for ${activeTab}...`}
                                            value={signsData[activeTab]?.overview || ''}
                                            onChange={e => handleSignChange('overview', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Career & Finance</label>
                                            <textarea
                                                // Removed required
                                                rows={3}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none bg-white"
                                                placeholder="Prediction for work and money..."
                                                value={signsData[activeTab]?.career || ''}
                                                onChange={e => handleSignChange('career', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Love & Relationships</label>
                                            <textarea
                                                // Removed required
                                                rows={3}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none bg-white"
                                                placeholder="Prediction for romance and family..."
                                                value={signsData[activeTab]?.love || ''}
                                                onChange={e => handleSignChange('love', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Health & Wellness</label>
                                            <textarea
                                                // Removed required
                                                rows={3}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none bg-white"
                                                placeholder="Prediction for health..."
                                                value={signsData[activeTab]?.health || ''}
                                                onChange={e => handleSignChange('health', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {exists ? 'Update Monthly Forecast' : 'Save Monthly Forecast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
