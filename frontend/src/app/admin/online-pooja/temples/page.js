'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, resolveImageUrl } from '../../../../lib/urlHelper';
import { useAuth } from '../../../../context/AuthContext';
import { Plus, Edit, Trash2, Check, X, Loader2, Image as ImageIcon, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../../../components/common/CustomDateInput';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        images: [],
        faqs: [{ question: '', answer: '' }],
        sevas: [{ name: '', price: '', originalPrice: '', maxSlots: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }],
        isActive: true
    });

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            const response = await axios.get(`${API_BASE}/pooja/admin/temples`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
                metaTitle: temple.metaTitle || '',
                metaDescription: temple.metaDescription || '',
                metaKeywords: temple.metaKeywords || '',
                ogTitle: temple.ogTitle || '',
                ogDescription: temple.ogDescription || '',
                ogImage: temple.ogImage || '',
                images: temple.images || [],
                faqs: temple.faqs?.length > 0 ? temple.faqs : [{ question: '', answer: '' }],
                sevas: temple.sevas.length > 0 ? temple.sevas.map(s => ({
                    ...s,
                    originalPrice: s.originalPrice || '',
                    maxSlots: s.maxSlots || '',
                    dateSelectionType: s.dateSelectionType || 'Any',
                    fixedDate: s.fixedDate || '',
                    startDate: s.startDate || '',
                    endDate: s.endDate || ''
                })) : [{ name: '', price: '', originalPrice: '', maxSlots: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }],
                isActive: temple.isActive
            });
        } else {
            setEditingTemple(null);
            setFormData({
                name: '',
                location: '',
                description: '',
                metaTitle: '',
                metaDescription: '',
                metaKeywords: '',
                ogTitle: '',
                ogDescription: '',
                ogImage: '',
                images: [],
                faqs: [{ question: '', answer: '' }],
                sevas: [{ name: '', price: '', originalPrice: '', maxSlots: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }],
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleAddSeva = () => {
        setFormData({
            ...formData,
            sevas: [...formData.sevas, { name: '', price: '', originalPrice: '', maxSlots: '', description: '', dateSelectionType: 'Any', fixedDate: '', startDate: '', endDate: '' }]
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

    const handleAddFaq = () => {
        setFormData({
            ...formData,
            faqs: [...formData.faqs, { question: '', answer: '' }]
        });
    };

    const handleRemoveFaq = (index) => {
        const newFaqs = formData.faqs.filter((_, i) => i !== index);
        setFormData({ ...formData, faqs: newFaqs });
    };

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...formData.faqs];
        newFaqs[index][field] = value;
        setFormData({ ...formData, faqs: newFaqs });
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

    const handleOgImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${API_BASE}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({
                ...prev,
                ogImage: res.data.filePath
            }));
            toast.success('OG Image uploaded successfully');
        } catch (err) {
            toast.error('OG Image upload failed');
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
                                    <img src={resolveImageUrl(temple.images[0])} alt={temple.name} className="w-full h-full object-cover" />
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
                                <label className="text-sm font-bold text-gray-400">Description (Supports HTML & Formatting)</label>
                                <div className="bg-white rounded-xl border-2 border-gray-100 focus-within:border-astro-navy transition-colors">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={(content) => setFormData({ ...formData, description: content })}
                                        className="h-48 mb-12"
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link'],
                                                ['clean']
                                            ]
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                                <h3 className="text-lg font-bold text-astro-navy border-b border-gray-200 pb-2">SEO & Metadata</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">Meta Title</label>
                                        <input
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            placeholder="Page title for search engines"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">Meta Keywords</label>
                                        <input
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy"
                                            value={formData.metaKeywords}
                                            onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                            placeholder="Comma separated keywords"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400">Meta Description</label>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-white border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy resize-none"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        placeholder="Brief description for search results"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">OG Title</label>
                                        <input
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy"
                                            value={formData.ogTitle}
                                            onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                                            placeholder="Title for social media sharing"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">OG Description</label>
                                        <textarea
                                            rows="2"
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy resize-none"
                                            value={formData.ogDescription}
                                            onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                                            placeholder="Description for social media sharing"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest pl-1">OG Image (Preview)</label>
                                    <div className="flex gap-4 items-start">
                                        <div className="relative aspect-[1200/630] w-64 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                                            {formData.ogImage ? (
                                                <>
                                                    <img src={resolveImageUrl(formData.ogImage)} alt="OG Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, ogImage: '' })}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-sm font-bold">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleOgImageUpload}
                                                />
                                                <ImageIcon className="w-4 h-4" />
                                                {formData.ogImage ? 'Change Image' : 'Upload OG Image'}
                                            </label>
                                            <p className="text-xs text-gray-400 mt-2">Recommended: 1200 x 630 px</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 block">Temple Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-gray-100">
                                            <img src={resolveImageUrl(img)} alt="Preview" className="w-full h-full object-cover" />
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
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Sale (₹)"
                                                    className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                    value={seva.price}
                                                    onChange={(e) => handleSevaChange(idx, 'price', e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Orig (₹)"
                                                    className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                    value={seva.originalPrice}
                                                    onChange={(e) => handleSevaChange(idx, 'originalPrice', e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Max Slots"
                                                    className="w-full bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none"
                                                    value={seva.maxSlots}
                                                    onChange={(e) => handleSevaChange(idx, 'maxSlots', e.target.value)}
                                                    min="1"
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
                                                    <DatePicker
                                                        selected={seva.fixedDate ? new Date(seva.fixedDate) : null}
                                                        onChange={(date) => handleSevaChange(idx, 'fixedDate', date)}
                                                        minDate={new Date()}
                                                        customInput={<CustomDateInput className="py-2 text-sm" />}
                                                        dateFormat="dd-MM-yyyy"
                                                        placeholderText="Select Fixed Date"
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {seva.dateSelectionType === 'Range' && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
                                                        <DatePicker
                                                            selected={seva.startDate ? new Date(seva.startDate) : null}
                                                            onChange={(date) => handleSevaChange(idx, 'startDate', date)}
                                                            minDate={new Date()}
                                                            customInput={<CustomDateInput className="py-2 text-sm" />}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="Start Date"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">End Date</label>
                                                        <DatePicker
                                                            selected={seva.endDate ? new Date(seva.endDate) : null}
                                                            onChange={(date) => handleSevaChange(idx, 'endDate', date)}
                                                            minDate={seva.startDate ? new Date(seva.startDate) : new Date()}
                                                            customInput={<CustomDateInput className="py-2 text-sm" />}
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="End Date"
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

                            {/* FAQs Management */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-400">FAQs</label>
                                    <button
                                        type="button"
                                        onClick={handleAddFaq}
                                        className="text-astro-navy hover:text-astro-yellow font-bold text-sm flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add FAQ
                                    </button>
                                </div>

                                {formData.faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
                                        {formData.faqs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFaq(idx)}
                                                className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 gap-4 mb-2 pr-8">
                                            <input
                                                placeholder="Question"
                                                className="bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none w-full"
                                                value={faq.question}
                                                onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                                            />
                                            <textarea
                                                placeholder="Answer"
                                                className="bg-white rounded-lg py-2 px-3 border border-gray-200 outline-none w-full h-20 resize-none"
                                                value={faq.answer}
                                                onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                                            />
                                        </div>
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
