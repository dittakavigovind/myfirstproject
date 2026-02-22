"use client";

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Upload, User, Phone, FileText, ToggleLeft, ToggleRight, Calendar as CalendarIcon } from 'lucide-react';
import { resolveImageUrl } from '@/lib/urlHelper';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function FeaturedAstrologerManager() {
    const [loading, setLoading] = useState(false);

    // View Mode: 'list' | 'form'
    const [viewMode, setViewMode] = useState('list');

    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [availability, setAvailability] = useState(null); // { status: 'empty' | 'occupied', occupiedBy: [] }
    const [schedules, setSchedules] = useState([]);
    const [scheduledDates, setScheduledDates] = useState([]);

    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        mobileNumber: '',
        showOnHoroscope: false,
        startDate: null,
        endDate: null,
        instagram: '',
        facebook: '',
        website: ''
    });

    // Derived unique names for autocomplete
    const uniqueNames = [...new Set(schedules.map(s => s.name).filter(Boolean))];
    const filteredSuggestions = uniqueNames.filter(name =>
        name.toLowerCase().includes(formData.name.toLowerCase()) &&
        name.toLowerCase() !== formData.name.toLowerCase()
    );

    useEffect(() => {
        // Initial fetch
        fetchFeaturedAstrologer(); // Fetch active one (optional context)
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const { data } = await API.get('/horoscope-manager/featured-astrologer/schedules');
            if (data.success) {
                setSchedules(data.data);
                // Generate all dates between start and end for highlighting
                const allDates = [];
                data.data.forEach(sch => {
                    if (sch.startDate && sch.endDate) {
                        let curr = new Date(sch.startDate);
                        const end = new Date(sch.endDate);
                        while (curr <= end) {
                            allDates.push(new Date(curr));
                            curr.setDate(curr.getDate() + 1);
                        }
                    }
                });
                setScheduledDates(allDates);
            }
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        }
    };

    // Availability Check Logic
    useEffect(() => {
        const checkAvailability = async () => {
            if (!formData.startDate || !formData.endDate) {
                setAvailability(null);
                return;
            };

            try {
                const { data } = await API.get(`/horoscope-manager/featured-astrologer/availability`, {
                    params: {
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        // excludeName: formData.name // REMOVED to prevent loop. We want to know who is there, even if it is us.
                    }
                });

                if (data.success) {
                    if (data.data.length > 0) {
                        const match = data.data[0]; // Take the first match

                        // If we are already editing THIS record, do nothing (don't overwrite form)
                        if (editingId === match._id) {
                            setAvailability({
                                status: 'occupied',
                                conflicts: data.data.map(d => ({
                                    name: d.name,
                                    endDate: new Date(d.endDate).toLocaleDateString('en-GB')
                                }))
                            });
                            return;
                        }

                        // We only warn about conflicts, we don't auto-switch in 'form' mode unless user explicitly chose to edit.
                        // However, the original logic was to auto-load. 
                        // In "Form Mode", we might probably be creating a NEW one or Editing an EXISTING one.
                        // If creating new, and we pick a date that conflicts, we should just show the conflict.

                        setAvailability({
                            status: 'occupied',
                            conflicts: data.data.map(d => ({
                                name: d.name,
                                endDate: new Date(d.endDate).toLocaleDateString('en-GB')
                            }))
                        });

                    } else {
                        // NO Conflict -> Valid range
                        setAvailability({ status: 'empty' });
                    }
                }
            } catch (err) {
                console.error("Availability check failed", err);
            }
        };

        const timer = setTimeout(() => {
            if (viewMode === 'form') {
                checkAvailability();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.startDate, formData.endDate, viewMode, editingId]);

    // Prefill logic on name change (Debounced) - Only useful in Form Mode
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only prefill if we are in form mode and NOT editing an existing ID (creating new but reusing details)
            if (viewMode === 'form' && !editingId && formData.name && formData.name.length > 2) {
                checkAndPrefill(formData.name);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [formData.name, viewMode, editingId]);

    const checkAndPrefill = async (name) => {
        if (loading) return; // avoid conflict with initial load
        try {
            const { data } = await API.get(`/horoscope-manager/featured-astrologer/search?name=${name}`);
            if (data.success && data.data) {
                toast.success("Found existing profile! details loaded.");
                setFormData(prev => ({
                    ...prev,
                    description: data.data.description || '',
                    image: data.data.image || '',
                    mobileNumber: data.data.mobileNumber || '',
                    // isActive: false, 
                    // REMOVED dates: user just picked them or hasn't picked yet
                    instagram: data.data.socialLinks?.instagram || '',
                    facebook: data.data.socialLinks?.facebook || '',
                    website: data.data.socialLinks?.website || ''
                }));
            }
        } catch (error) {
            // Not found is fine
        }
    };

    const fetchFeaturedAstrologer = async () => {
        // This was used to load the "Current Active" one. 
        // In the new list-view world, we don't necessarily need to populate the form immediately.
        // We can just rely on fetchSchedules.
        // However, keeping it doesn't hurt to ensure we have data.
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                _id: editingId, // Include ID if editing
                socialLinks: {
                    instagram: formData.instagram,
                    facebook: formData.facebook,
                    website: formData.website
                },
                showOnHoroscope: formData.showOnHoroscope
            };
            await API.put('/horoscope-manager/featured-astrologer', payload);
            toast.success(editingId ? "Schedule Updated" : "Schedule Created");

            // Refresh and Go Back
            await fetchSchedules();
            setViewMode('list');

        } catch (error) {
            toast.error("Failed to update");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Derived active state
    const activeSchedule = schedules.find(s => s.showOnHoroscope);
    const isGlobalActive = viewMode === 'form' ? formData.showOnHoroscope : !!activeSchedule;

    const handleToggleActive = async () => {
        // Toggle Logic for List View (Global Toggle)
        if (isGlobalActive) {
            // TURN OFF
            if (activeSchedule) {
                try {
                    await API.put('/horoscope-manager/featured-astrologer', {
                        _id: activeSchedule._id,
                        showOnHoroscope: false
                    });
                    toast.success("Featured Astrologer Disabled");
                    fetchSchedules();
                } catch (error) {
                    toast.error("Failed to disable");
                }
            }
        } else {
            // TURN ON
            const today = new Date();
            // Find a schedule that covers TODAY
            const match = schedules.find(s => {
                if (!s.startDate || !s.endDate) return false;
                const start = new Date(s.startDate);
                const end = new Date(s.endDate);

                // Set end date to end of day for inclusive comparison
                end.setHours(23, 59, 59, 999);
                return today >= start && today <= end;
            });

            if (match) {
                try {
                    await API.put('/horoscope-manager/featured-astrologer', {
                        _id: match._id,
                        showOnHoroscope: true
                    });
                    toast.success(`Enabled: ${match.name}`);
                    fetchSchedules();
                } catch (error) {
                    toast.error("Failed to enable");
                }
            } else {
                toast("No schedule found for today! Please create or edit a schedule to cover today's date.", {
                    icon: '📅',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            }
        }
    };

    // Actions
    const handleCreateNew = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            image: '',
            mobileNumber: '',
            showOnHoroscope: true, // Default active for new
            startDate: null,
            endDate: null,
            instagram: 'https://www.instagram.com/way2astroofficial',
            facebook: 'https://www.facebook.com/Way2AstroApp/',
            website: 'https://way2astro.com/'
        });
        setAvailability(null);
        setViewMode('form');
    };

    const handleEditSchedule = (sch) => {
        setEditingId(sch._id);
        setFormData({
            name: sch.name || '',
            description: sch.description || '',
            image: sch.image || '',
            mobileNumber: sch.mobileNumber || '',
            showOnHoroscope: sch.showOnHoroscope || false,
            startDate: sch.startDate ? new Date(sch.startDate).toISOString() : null,
            endDate: sch.endDate ? new Date(sch.endDate).toISOString() : null,
            instagram: sch.socialLinks?.instagram || '',
            facebook: sch.socialLinks?.facebook || '',
            website: sch.socialLinks?.website || ''
        });
        setAvailability(null); // Reset availability check until user changes dates
        setViewMode('form');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <style jsx global>{`
                .react-datepicker__day--highlighted-custom-green {
                    background-color: #22c55e !important; /* tailwind green-500 */
                    color: white !important;
                    border-radius: 50% !important;
                }
                .react-datepicker__day--highlighted-custom-green:hover {
                    background-color: #16a34a !important; /* tailwind green-600 */
                }
            `}</style>

            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-purple-500" size={24} />
                        {viewMode === 'list' ? 'Featured Astrologer Schedules' : (editingId ? 'Edit Schedule' : 'Create New Schedule')}
                    </h2>
                    {viewMode === 'form' && (
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-slate-500 hover:text-slate-700 text-sm font-medium underline"
                        >
                            Back to List
                        </button>
                    )}
                </div>

                {/* Global Toggle Control - Only in List View */}
                {viewMode === 'list' && (
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <span className="block font-bold text-slate-700">Display on Horoscope Page</span>
                            <span className="text-xs text-slate-500">
                                {isGlobalActive
                                    ? `Currently displaying: ${activeSchedule?.name}`
                                    : "No astrologer is currently displayed"
                                }
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleActive}
                            className={`transition-colors ${isGlobalActive ? 'text-green-500' : 'text-slate-400'}`}
                        >
                            {isGlobalActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'list' ? (
                // LIST VIEW
                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-700">Upcoming Schedules</p>
                            <p className="text-xs text-slate-500">Manage who appears as Featured Astrologer</p>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <User size={16} /> Create Schedule
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-xs border-b border-slate-100">
                                    <th className="font-semibold py-3 px-2">Astrologer</th>
                                    <th className="font-semibold py-3 px-2">Start Date</th>
                                    <th className="font-semibold py-3 px-2">End Date</th>
                                    <th className="font-semibold py-3 px-2">Status</th>
                                    <th className="font-semibold py-3 px-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400">
                                            No schedules found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((sch) => (
                                        <tr key={sch._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-3">
                                                    {sch.image ? (
                                                        <img src={resolveImageUrl(sch.image)} alt={sch.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                                            {sch.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-slate-700">{sch.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-slate-600">
                                                {sch.startDate ? new Date(sch.startDate).toLocaleDateString('en-GB') : '-'}
                                            </td>
                                            <td className="py-3 px-2 text-slate-600">
                                                {sch.endDate ? new Date(sch.endDate).toLocaleDateString('en-GB') : '-'}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${sch.showOnHoroscope
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {sch.showOnHoroscope ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    onClick={() => handleEditSchedule(sch)}
                                                    className="text-purple-500 hover:text-purple-700 font-medium text-xs border border-purple-200 hover:border-purple-300 px-3 py-1 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                // FORM VIEW
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">



                    {/* Date Scheduler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                        <div className="flex flex-col">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.startDate ? new Date(formData.startDate) : null}
                                    onChange={(date) => setFormData(prev => ({ ...prev, startDate: date ? date.toISOString() : null }))}
                                    className="w-full px-4 py-2 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm bg-white"
                                    placeholderText="Select start date"
                                    dateFormat="dd-MM-yyyy"
                                    closeOnScroll={true}
                                    highlightDates={[{ "react-datepicker__day--highlighted-custom-green": scheduledDates }]}
                                />
                                <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.endDate ? new Date(formData.endDate) : null}
                                    onChange={(date) => setFormData(prev => ({ ...prev, endDate: date ? date.toISOString() : null }))}
                                    className="w-full px-4 py-2 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm bg-white"
                                    placeholderText="Select end date"
                                    dateFormat="dd-MM-yyyy"
                                    minDate={formData.startDate ? new Date(formData.startDate) : null}
                                    closeOnScroll={true}
                                    highlightDates={[{ "react-datepicker__day--highlighted-custom-green": scheduledDates }]}
                                />
                                <CalendarIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Availability Status Indicator */}
                    {availability && <div className={`mt-2 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${availability.status === 'occupied'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        {availability.status === 'occupied' ? (
                            <>
                                <span className="font-bold">⚠ Conflict Possible:</span>
                                {availability.conflicts.map((c, i) => (
                                    <span key={i}>
                                        {c.name} is scheduled until {c.endDate}.
                                    </span>
                                ))}
                                <span className="text-xs ml-1">(You can still save if you wish to overlap)</span>
                            </>
                        ) : (
                            <>
                                <span className="font-bold">✓ Available:</span> No other astrologer scheduled in this range.
                            </>
                        )}
                    </div>}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Astrologer Image</label>
                            <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-4 h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                {formData.image ? (
                                    <img src={resolveImageUrl(formData.image)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <Upload size={32} className="mx-auto mb-2" />
                                        <span className="text-sm">Click to upload image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                                <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/20 bg-white relative">
                                    <User size={18} className="text-slate-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        // Delay to allow click to register
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        className="w-full outline-none text-slate-700 font-medium"
                                        placeholder="e.g. Dr. Jane Doe"
                                        required
                                        autoComplete="off"
                                    />

                                    {/* Autocomplete Dropdown */}
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                                            {filteredSuggestions.map((name, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-slate-700 text-sm"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, name: name }));
                                                        setShowSuggestions(false);
                                                        checkAndPrefill(name);
                                                    }}
                                                >
                                                    {name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                                <div className="flex items-start gap-2 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/20 bg-white">
                                    <FileText size={18} className="text-slate-400 mt-1" />
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full outline-none text-slate-700 resize-none"
                                        placeholder="2 lines description..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
                                <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/20 bg-white">
                                    <Phone size={18} className="text-slate-400" />
                                    <input
                                        type="text"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        className="w-full outline-none text-slate-700"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Instagram</label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                                        placeholder="URL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Facebook</label>
                                    <input
                                        type="text"
                                        name="facebook"
                                        value={formData.facebook}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                                        placeholder="URL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                                        placeholder="URL"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-[2] bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {editingId ? 'Update Schedule' : 'Create Schedule'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form >
            )}
        </div >
    );
}
