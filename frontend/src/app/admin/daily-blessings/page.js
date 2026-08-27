"use client";

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Plus, X, Upload } from 'lucide-react';

export default function AdminDailyBlessings() {
    const { user } = useAuth();
    const router = useRouter();
    const [blessings, setBlessings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list' | 'form'
    
    const [formData, setFormData] = useState({
        _id: null,
        title: "Today's Divine Blessing",
        greeting: "Good Morning 🙏",
        deityName: "",
        message: "",
        mantra: "",
        language: "English",
        imageUrl: "",
        shareImageUrl: "",
        startDate: "",
        endDate: "",
        priority: 0,
        isSpecialOccasion: false,
        occasion: "",
        status: "Draft"
    });

    useEffect(() => {
        if (user && ['admin', 'manager'].includes(user.role)) {
            fetchBlessings();
        } else if (user && !['admin', 'manager'].includes(user.role)) {
            router.push('/');
        }
    }, [user]);

    const fetchBlessings = async () => {
        try {
            const res = await API.get('/daily-blessing');
            setBlessings(res.data.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch blessings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this blessing?')) return;
        try {
            await API.delete(`/daily-blessing/${id}`);
            alert('Blessing Deleted');
            fetchBlessings();
        } catch (err) {
            alert('Failed to delete blessing');
        }
    };

    const handleEdit = (blessing) => {
        setFormData({
            ...blessing,
            startDate: blessing.startDate ? new Date(blessing.startDate).toISOString().split('T')[0] : '',
            endDate: blessing.endDate ? new Date(blessing.endDate).toISOString().split('T')[0] : ''
        });
        setView('form');
    };

    const handleCreateNew = () => {
        setFormData({
            _id: null,
            title: "Today's Divine Blessing",
            greeting: "Good Morning 🙏",
            deityName: "",
            message: "",
            mantra: "",
            language: "English",
            imageUrl: "",
            shareImageUrl: "",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            priority: 0,
            isSpecialOccasion: false,
            occasion: "",
            status: "Draft"
        });
        setView('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData._id) {
                await API.put(`/daily-blessing/${formData._id}`, formData);
                alert('Blessing updated successfully');
            } else {
                await API.post('/daily-blessing', formData);
                alert('Blessing created successfully');
            }
            setView('list');
            fetchBlessings();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to save blessing');
        }
    };

    const uploadImage = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const fd = new FormData();
        fd.append('file', file);
        
        try {
            const res = await API.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({
                ...prev,
                [field]: res.data.filePath,
                // Automatically set share image same as main if not set
                ...(field === 'imageUrl' && !prev.shareImageUrl ? { shareImageUrl: res.data.filePath } : {})
            }));
        } catch (err) {
            console.error(err);
            alert('Image upload failed');
        }
    };

    if (!user || !['admin', 'manager'].includes(user.role)) return null;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Daily Divine Blessings</h1>
                    <p className="text-sm text-slate-500">Manage daily blessings and shareable images</p>
                </div>
                {view === 'list' ? (
                    <button onClick={handleCreateNew} className="bg-astro-navy text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md hover:bg-slate-800 transition flex items-center gap-2">
                        <Plus size={18} /> Create Blessing
                    </button>
                ) : (
                    <button onClick={() => setView('list')} className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-300 transition flex items-center gap-2">
                        <X size={18} /> Cancel
                    </button>
                )}
            </div>

            {view === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {error && <div className="p-4 bg-red-50 text-red-700 text-center border-b border-red-100">{error}</div>}

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="p-4">Image</th>
                                <th className="p-4">Deity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date Range</th>
                                <th className="p-4">Occasion</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {blessings.map(b => (
                                <tr key={b._id} className="hover:bg-slate-50/80 transition duration-200">
                                    <td className="p-4">
                                        <img src={b.imageUrl} alt={b.deityName} className="w-12 h-12 rounded object-cover border" />
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{b.deityName}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${b.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {b.isSpecialOccasion ? <span className="text-orange-500 font-semibold">{b.occasion || 'Special'}</span> : 'Standard'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 text-slate-400">
                                            <button onClick={() => handleEdit(b)} className="hover:text-blue-600 transition"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(b._id)} className="hover:text-red-600 transition"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'form' && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Greeting</label>
                            <input required type="text" value={formData.greeting} onChange={e => setFormData({...formData, greeting: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deity Name</label>
                            <input required type="text" value={formData.deityName} onChange={e => setFormData({...formData, deityName: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mantra</label>
                            <input type="text" value={formData.mantra} onChange={e => setFormData({...formData, mantra: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Blessing Message</label>
                            <textarea required rows="3" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50"></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                            <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50">
                                <option value="Draft">Draft</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.isSpecialOccasion} onChange={e => setFormData({...formData, isSpecialOccasion: e.target.checked})} className="rounded text-astro-navy focus:ring-astro-navy" />
                                <span className="text-sm font-medium text-slate-700">Special Occasion?</span>
                            </label>
                            {formData.isSpecialOccasion && (
                                <input type="text" placeholder="Occasion Name" value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})} className="border-slate-200 rounded-lg p-2 bg-slate-50" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">God/Goddess Image</label>
                            <input type="file" onChange={(e) => uploadImage(e, 'imageUrl')} accept="image/*" className="w-full" />
                            {formData.imageUrl && <img src={formData.imageUrl} className="mt-2 h-24 rounded border" alt="Preview" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Share Image (1080x1350)</label>
                            <input type="file" onChange={(e) => uploadImage(e, 'shareImageUrl')} accept="image/*" className="w-full" />
                            {formData.shareImageUrl && <img src={formData.shareImageUrl} className="mt-2 h-24 rounded border" alt="Preview" />}
                        </div>
                    </div>
                    <div className="flex justify-end border-t pt-4">
                        <button type="submit" className="bg-astro-navy text-white px-6 py-2.5 rounded-xl font-bold shadow hover:bg-slate-800 transition">
                            Save Blessing
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
