'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../../../lib/urlHelper';
import { useAuth } from '../../../../context/AuthContext';
import { Plus, Edit, Trash2, Check, X, Loader2, Image as ImageIcon, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTemples = () => {
    const { token } = useAuth();
    const [temples, setTemples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemple, setEditingTemple] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        images: [],
        sevas: [{ name: '', price: '', originalPrice: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }],
        isActive: true
    });

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            const response = await axios.get(`${API_BASE}/pooja/temples`);
            if (response.data.success) {
                setTemples(response.data.data);
            }
        } catch (err) {
            toast.error('Failed to load temples');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (temple = null) => {
        if (temple) {
            setEditingTemple(temple);
            setFormData({
                name: temple.name,
                location: temple.location,
                description: temple.description,
                images: temple.images || [],
                sevas: temple.sevas.length > 0 ? temple.sevas.map(s => ({
                    ...s,
                    originalPrice: s.originalPrice || '',
                    dateSelectionType: s.dateSelectionType || 'Any',
                    fixedDate: s.fixedDate || '',
                    startDate: s.startDate || '',
                    endDate: s.endDate || ''
                })) : [{ name: '', price: '', originalPrice: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }],
                isActive: temple.isActive
            });
        } else {
            setEditingTemple(null);
            setFormData({
                name: '',
                location: '',
                description: '',
                images: [],
                sevas: [{ name: '', price: '', originalPrice: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }],
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleAddSeva = () => {
        setFormData({
            ...formData,
            sevas: [...formData.sevas, { name: '', price: '', originalPrice: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }]
        });
    };

    const handleRemoveSeva = (index) => {
        const newSevas = formData.sevas.filter((_, i) => i !== index);
        setFormData({ ...formData, sevas: newSevas });
    };

    const handleSevaChange = (index, field, value) => {
        const newSevas = [...formData.sevas];
        newSevas[index][field] = value;
        setFormData({ ...formData, sevas: newSevas });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setLoading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await axios.post(`${API_BASE}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return res.data.filePath;
            });

            const uploadedPaths = await Promise.all(uploadPromises);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedPaths]
            }));
            toast.success('Images uploaded successfully');
        } catch (err) {
            toast.error('Image upload failed');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingTemple
                ? `${API_BASE}/pooja/admin/temples/${editingTemple._id}`
                : `${API_BASE}/pooja/admin/temples`;

            const method = editingTemple ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(editingTemple ? 'Temple updated' : 'Temple created');
                fetchTemples();
                setIsModalOpen(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this temple?')) return;

        try {
            const response = await axios.delete(`${API_BASE}/pooja/admin/temples/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Temple deleted');
                fetchTemples();
            }
        } catch (err) {
            toast.error('Failed to delete temple');
        }
    };

    const filteredTemples = temples.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-astro-navy">Temple Management</h1>
                    <p className="text-gray-500">Manage temples and online sevas</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center bg-astro-navy text-white px-6 py-3 rounded-xl font-bold hover:bg-astro-yellow hover:text-astro-navy transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Temple
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex items-center border border-gray-100">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                    type="text"
                    placeholder="Search temples by name or location..."
                    className="flex-1 outline-none text-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading && temples.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-astro-navy" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemples.map((temple) => (
                        <div key={temple._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <div className="aspect-video bg-gray-100 relative">
                                {temple.images?.[0] ? (
                                    <img src={temple.images[0]} alt={temple.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${temple.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {temple.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-astro-navy mb-1">{temple.name}</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {temple.location}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="text-xs font-bold text-astro-navy uppercase tracking-wider">
                                        {temple.sevas.length} Sevas Available
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(temple)}
                                            className="p-2 bg-gray-50 text-astro-navy hover:bg-astro-yellow rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(temple._id)}
                                            className="p-2 bg-gray-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-astro-navy">
                                {editingTemple ? 'Edit Temple' : 'Add New Temple'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400">Temple Name</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-astro-navy"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400">Location</label>
                                    <input
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-astro-navy"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-astro-navy resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 block">Temple Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-gray-100">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-astro-navy hover:bg-gray-50 transition-all text-gray-400 hover:text-astro-navy">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <Plus className="w-8 h-8 mb-1" />
                                        <span className="text-xs font-bold uppercase">Upload</span>
                                    </label>
                                </div>
                            </div>

                            {/* Sevas Management */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-400">Available Sevas</label>
                                    <button
                                        type="button"
                                        onClick={handleAddSeva}
                                        className="text-astro-navy hover:text-astro-yellow font-bold text-sm flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Seva
                                    </button>
                                </div>

                                {formData.sevas.map((seva, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
                                        {formData.sevas.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSeva(idx)}
                                                className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                placeholder="Seva Name"
                                                className="bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                value={seva.name}
                                                onChange={(e) => handleSevaChange(idx, 'name', e.target.value)}
                                                required
                                            />
                                            <div className="flex gap-4">
                                                <input
                                                    type="number"
                                                    placeholder="Sale Price (₹)"
                                                    className="flex-1 bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                    value={seva.price}
                                                    onChange={(e) => handleSevaChange(idx, 'price', e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Original Price (₹)"
                                                    className="flex-1 bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                    value={seva.originalPrice}
                                                    onChange={(e) => handleSevaChange(idx, 'originalPrice', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Date Selection</label>
                                                <select
                                                    className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                    value={seva.dateSelectionType || 'Any'}
                                                    onChange={(e) => handleSevaChange(idx, 'dateSelectionType', e.target.value)}
                                                >
                                                    <option value="Any">User Selects Any Date</option>
                                                    <option value="Fixed">Fixed Date (Admin Set)</option>
                                                    <option value="Range">Date Range (Admin Set)</option>
                                                </select>
                                            </div>

                                            {seva.dateSelectionType === 'Fixed' && (
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Fixed Date</label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                        value={seva.fixedDate ? new Date(seva.fixedDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => handleSevaChange(idx, 'fixedDate', e.target.value)}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {seva.dateSelectionType === 'Range' && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
                                                        <input
                                                            type="date"
                                                            className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none text-xs"
                                                            value={seva.startDate ? new Date(seva.startDate).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleSevaChange(idx, 'startDate', e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">End Date</label>
                                                        <input
                                                            type="date"
                                                            className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none text-xs"
                                                            value={seva.endDate ? new Date(seva.endDate).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleSevaChange(idx, 'endDate', e.target.value)}
                                                            min={seva.startDate ? new Date(seva.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <textarea
                                            placeholder="Seva Description (Optional)"
                                            className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none h-20 resize-none mb-2"
                                            value={seva.description}
                                            onChange={(e) => handleSevaChange(idx, 'description', e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-2 transition-colors ${formData.isActive ? 'bg-astro-navy border-astro-navy text-white' : 'border-gray-300'}`}>
                                        {formData.isActive && <Check className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">Active Status</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-astro-navy text-white py-4 rounded-2xl font-black text-lg hover:bg-astro-yellow hover:text-astro-navy transition-all flex items-center justify-center shadow-xl shadow-astro-navy/20"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : editingTemple ? 'Update Temple' : 'Create Temple'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTemples;
