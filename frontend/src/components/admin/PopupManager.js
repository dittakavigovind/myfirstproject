"use client";

import { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Plus, Trash2, Edit2, BarChart2, Calendar, Link as LinkIcon, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PopupManager() {
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPopup, setCurrentPopup] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        redirectUrl: '',
        displayPages: 'all',
        isActive: true,
        showOncePerSession: true,
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        try {
            const res = await API.get('/popups/admin');
            setPopups(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch popups');
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await API.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, imageUrl: res.data.filePath });
            toast.success('Image uploaded');
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sanitize dates: if empty string, set to null
            const sanitizeDate = (dateStr) => {
                if (!dateStr || dateStr.trim() === '') return null;
                return dateStr;
            };

            const startDate = formData.startDate ? new Date(formData.startDate) : null;
            const endDate = formData.endDate ? new Date(formData.endDate) : null;

            if (startDate && endDate && startDate > endDate) {
                toast.error('Start date must be before end date');
                return;
            }

            const dataToSubmit = {
                ...formData,
                displayPages: formData.displayPages.split(',').map(s => s.trim()),
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null
            };

            if (currentPopup) {
                await API.put(`/popups/${currentPopup._id}`, dataToSubmit);
                toast.success('Popup updated');
            } else {
                await API.post('/popups', dataToSubmit);
                toast.success('Popup created');
            }
            setIsEditing(false);
            setCurrentPopup(null);
            setFormData({
                title: '',
                imageUrl: '',
                redirectUrl: '',
                displayPages: 'all',
                isActive: true,
                showOncePerSession: true,
                startDate: '',
                endDate: ''
            });
            fetchPopups();
        } catch (err) {
            console.error('Popup submit error:', err);
            const msg = err.response?.data?.message || err.message || 'Action failed';
            toast.error(msg);
        }
    };

    const toLocalISOString = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const offset = d.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    const handleEdit = (popup) => {
        setCurrentPopup(popup);
        setFormData({
            title: popup.title,
            imageUrl: popup.imageUrl,
            redirectUrl: popup.redirectUrl,
            displayPages: popup.displayPages.join(', '),
            isActive: popup.isActive,
            showOncePerSession: popup.showOncePerSession,
            startDate: toLocalISOString(popup.startDate),
            endDate: toLocalISOString(popup.endDate)
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this popup?')) return;
        try {
            await API.delete(`/popups/${id}`);
            toast.success('Deleted');
            fetchPopups();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Popup Manager</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} /> New Popup
                    </button>
                )}
            </div>

            {isEditing && (
                <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">{currentPopup ? 'Edit' : 'Create'} Promotional Popup</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Title</label>
                                <input
                                    type="text" required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Holi Special Offer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Redirect URL</label>
                                <input
                                    type="text" required
                                    value={formData.redirectUrl}
                                    onChange={e => setFormData({ ...formData, redirectUrl: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. /instastore"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Display Pages (comma separated)</label>
                                <input
                                    type="text" required
                                    value={formData.displayPages}
                                    onChange={e => setFormData({ ...formData, displayPages: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="all, /, /panchang"
                                />
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium">Is Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showOncePerSession}
                                        onChange={e => setFormData({ ...formData, showOncePerSession: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium">Once per session</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Popup Image</label>
                                <input type="file" onChange={handleFileUpload} className="mb-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="Preview" className="h-32 rounded border shadow-inner object-contain" />
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setCurrentPopup(null); }}
                                className="px-6 py-2 border rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                            >
                                {currentPopup ? 'Update' : 'Save'} Popup
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="font-bold text-slate-700">Historical & Scheduled Popups</h3>
                {popups.length === 0 ? (
                    <div className="bg-white border p-12 text-center rounded-xl text-slate-400 italic">
                        No popups created yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popups.map(p => (
                            <div key={p._id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition">
                                <div className="h-40 bg-slate-100 relative group">
                                    <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.title} />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => handleEdit(p)} className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition"><Edit2 size={20} /></button>
                                    </div>
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${!p.isActive ? 'bg-slate-400 text-white' :
                                        (p.endDate && new Date(p.endDate) < new Date()) ? 'bg-red-500 text-white' :
                                            (p.startDate && new Date(p.startDate) > new Date()) ? 'bg-amber-500 text-white' :
                                                'bg-green-500 text-white'
                                        }`}>
                                        {!p.isActive ? 'Inactive' :
                                            (p.endDate && new Date(p.endDate) < new Date()) ? 'Expired' :
                                                (p.startDate && new Date(p.startDate) > new Date()) ? 'Scheduled' :
                                                    'Active'}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-slate-800 mb-1">{p.title}</h4>
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                                            <Eye size={12} /> {p.impressions} Views
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                                            <BarChart2 size={12} /> {p.clicks} Clicks
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded">
                                            {p.impressions > 0 ? ((p.clicks / p.impressions) * 100).toFixed(1) : 0}% CTR
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon size={14} /> {p.redirectUrl}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {p.startDate ? new Date(p.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Now'} - {p.endDate ? new Date(p.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Forever'}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center border-t pt-4">
                                        <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                        <button onClick={() => handleEdit(p)} className="text-slate-600 hover:text-blue-600 text-sm font-medium">Manage Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
