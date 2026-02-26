"use client";

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Calendar as CalendarIcon, Save, Trash2, ArrowLeft, AlignLeft, Sun, RotateCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../../../components/common/CustomDateInput';

import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ZODIAC_SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

export default function DailyHoroscopeAdmin() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [activeTab, setActiveTab] = useState('aries');
    const [filledDates, setFilledDates] = useState([]);

    // Form State
    // We still keep a global title for backward compatibility or as a fallback label, 
    // but the UI will focus on sign specific titles.
    const [globalTitle, setGlobalTitle] = useState('');
    const [id, setId] = useState(null);
    const [signsData, setSignsData] = useState({});

    useEffect(() => {
        // Initialize empty state for all signs
        const initialSigns = {};
        ZODIAC_SIGNS.forEach(sign => {
            initialSigns[sign] = {
                title: '',
                prediction: '',
                luckyColor: '',
                luckyNumber: '',
                cosmicVibe: 3
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
            const formattedDate = date.toISOString();
            const { data } = await API.get(`/horoscope-manager/daily?date=${formattedDate}`);
            if (data.success) {
                setGlobalTitle(data.data.title || '');
                setId(data.data._id);

                // Merge loaded data with default structure to prevent crashes if some fields missing
                const loadedSigns = {};
                ZODIAC_SIGNS.forEach(sign => {
                    loadedSigns[sign] = {
                        title: data.data.signs?.[sign]?.title || '',
                        prediction: data.data.signs?.[sign]?.prediction || '',
                        luckyColor: data.data.signs?.[sign]?.luckyColor || '',
                        luckyNumber: data.data.signs?.[sign]?.luckyNumber || '',
                        cosmicVibe: data.data.signs?.[sign]?.cosmicVibe || 3
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
            const { data } = await API.get(`/horoscope-manager/daily/availability?year=${year}`);
            if (data.success) {
                // Convert string dates to Date objects
                const dates = data.data.map(d => new Date(d));
                setFilledDates(dates);
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
            initialSigns[sign] = {
                title: '',
                prediction: '',
                luckyColor: '',
                luckyNumber: '',
                cosmicVibe: 3
            };
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
                luckyColor: '',
                luckyNumber: '',
                cosmicVibe: 3
            }
        }));
        toast.success(`Cleared data for ${activeTab}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Use the first sign's title as global title fallback if global is empty, or just a generic one

            // Validate all fields for all signs
            if (!globalTitle && !signsData['aries']?.title) {
                // optional: ensure broad title check? 
                // actually user requested "all fields as mandatory for all 3 horoscopes"
                // we'll interpret this as every sign field must be filled.
            }

            for (const sign of ZODIAC_SIGNS) {
                const data = signsData[sign];
                if (!data?.title?.trim()) {
                    toast.error(`Please enter "Theme" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.prediction?.trim()) {
                    toast.error(`Please enter "Forecast" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.luckyColor?.trim()) {
                    toast.error(`Please enter "Lucky Color" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
                if (!data?.luckyNumber?.trim()) {
                    toast.error(`Please enter "Lucky Number" for ${sign}`);
                    setActiveTab(sign);
                    setIsSaving(false);
                    return;
                }
            }

            const payload = {
                date: selectedDate,
                title: globalTitle || `${selectedDate.toDateString()} Horoscope`,
                signs: signsData
            };

            if (exists && id) {
                await API.put(`/horoscope-manager/daily/${id}`, payload);
                toast.success("Updated Successfully");
                fetchAvailability(selectedDate.getFullYear());
            } else {
                const res = await API.post('/horoscope-manager/daily', payload);
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
            await API.delete(`/horoscope-manager/daily/${id}`);
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
                            <CalendarIcon size={18} className="text-orange-500" /> Select Date
                        </h3>
                        <div className="custom-datepicker-wrapper">
                            <DatePicker
                                customInput={<CustomDateInput />}
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                onMonthChange={(date) => fetchAvailability(date.getFullYear())}
                                onYearChange={(date) => fetchAvailability(date.getFullYear())}
                                inline
                                highlightDates={[{ "react-datepicker__day--highlighted-custom-1": filledDates, }]}
                                className="border rounded-lg"
                                dayClassName={(date) => filledDates.some(d => d.toDateString() === date.toDateString()) ? "bg-green-100 text-green-600 font-bold rounded-full" : undefined}
                            />
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="flex-1 w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="animate-spin text-orange-500" size={32} />
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">
                                {selectedDate.toDateString()}
                            </h2>
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
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {sign}
                                    </button>
                                ))}
                            </div>

                            {/* Sign Specific Fields */}
                            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2">
                                        <Sun size={20} className="text-orange-500" /> {activeTab} Prediction
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
                                    {/* Moved Title Here */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Overall Daily Theme</label>
                                        <input
                                            type="text"
                                            // Removed required to allow saving draft
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition bg-white"
                                            placeholder={`Theme for ${activeTab}...`}
                                            value={signsData[activeTab]?.title || ''}
                                            onChange={e => handleSignChange('title', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Forecast</label>
                                        <textarea
                                            // Removed required
                                            rows={5}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition resize-none bg-white"
                                            placeholder={`Detailed prediction for ${activeTab}...`}
                                            value={signsData[activeTab]?.prediction || ''}
                                            onChange={e => handleSignChange('prediction', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Lucky Color</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition bg-white"
                                                placeholder="e.g. Red"
                                                value={signsData[activeTab]?.luckyColor || ''}
                                                onChange={e => handleSignChange('luckyColor', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Lucky Number</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition bg-white"
                                                placeholder="e.g. 7"
                                                value={signsData[activeTab]?.luckyNumber || ''}
                                                onChange={e => handleSignChange('luckyNumber', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Cosmic Vibe (1-5)
                                        </label>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => handleSignChange('cosmicVibe', val)}
                                                    className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all ${(signsData[activeTab]?.cosmicVibe || 3) === val
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                        : 'bg-white text-slate-400 hover:bg-orange-100 border border-slate-200'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {exists ? 'Update Daily Forecast' : 'Save Daily Forecast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
