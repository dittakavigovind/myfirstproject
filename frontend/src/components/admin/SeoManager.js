"use client";

import { useState, useEffect } from "react";
import API from "../../lib/api";
import { toast } from "react-hot-toast";
import { Search, Edit2, Trash2, Plus, Save, X, Globe, Settings } from 'lucide-react';

export default function SeoManager() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // list, form
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const [seoRes, pagesRes] = await Promise.all([
                API.get('/seo'),
                API.get('/seo/available-pages')
            ]);

            if (seoRes.data.success && pagesRes.data.success) {
                const dbSettings = seoRes.data.data;
                const availablePages = pagesRes.data.data;

                // Merge: 
                // 1. Convert DB settings to map for easy lookup
                // 2. Iterate available pages, check if exists in DB
                // 3. Combined list includes all DB entries + any available pages NOT in DB

                const dbMap = new Map(dbSettings.map(s => [s.pageSlug, s]));

                const merged = availablePages.map(page => {
                    if (dbMap.has(page.slug)) {
                        const existing = dbMap.get(page.slug);
                        dbMap.delete(page.slug); // Remove from map to track remaining
                        return existing;
                    } else {
                        // Return a placeholder for UI
                        return {
                            _id: null, // No DB ID yet
                            pageSlug: page.slug,
                            metaTitle: page.name || page.slug,
                            metaDescription: '',
                            isNew: true // Flag for UI
                        };
                    }
                });

                // Add remaining DB entries (custom pages not found in scan?)
                const remaining = Array.from(dbMap.values());

                setSettings([...merged, ...remaining]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load SEO settings");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        if (item.isNew) {
            // Pre-fill for creation
            setFormData({
                ...initialFormState,
                pageSlug: item.pageSlug,
                metaTitle: item.metaTitle
            });
            setEditingId(null); // Creating new
        } else {
            setFormData(item);
            setEditingId(item._id);
        }
        setViewMode('form');
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this SEO configuration?")) return;
        try {
            await API.delete(`/seo/${id}`);
            toast.success("Deleted successfully");
            fetchSettings();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/seo/${editingId}`, formData);
                toast.success("Updated successfully");
            } else {
                await API.post('/seo', formData);
                toast.success("Created successfully");
            }
            setViewMode('list');
            fetchSettings();
            setFormData(initialFormState);
            setEditingId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="text-indigo-600" /> SEO Management
                </h1>
                {viewMode === 'list' && (
                    <button
                        onClick={() => {
                            setFormData(initialFormState);
                            setEditingId(null);
                            setViewMode('form');
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                        <Plus size={18} /> Add New Page
                    </button>
                )}
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">Page Slug</th>
                                    <th className="p-4 font-semibold text-slate-600">Title</th>
                                    <th className="p-4 font-semibold text-slate-600">Description</th>
                                    <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading settings...</td></tr>
                                ) : settings.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">No SEO settings found. Create one!</td></tr>
                                ) : (
                                    settings.map(item => (
                                        <tr key={item.pageSlug} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-medium text-indigo-600">
                                                {item.pageSlug}
                                                {item.isNew && <span className="ml-2 px-2 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-full font-bold">New Detected</span>}
                                            </td>
                                            <td className="p-4 text-slate-700 max-w-xs truncate" title={item.metaTitle}>{item.metaTitle || '-'}</td>
                                            <td className="p-4 text-slate-500 max-w-xs truncate" title={item.metaDescription}>{item.metaDescription || '-'}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className={`p-2 rounded-full transition-colors ${item.isNew ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                                        title={item.isNew ? "Create Configuration" : "Edit Configuration"}
                                                    >
                                                        {item.isNew ? <Plus size={18} /> : <Edit2 size={18} />}
                                                    </button>
                                                    {!item.isNew && (
                                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 max-w-4xl mx-auto">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                        <h2 className="text-xl font-bold text-slate-800">
                            {editingId ? `Edit SEO: ${formData.pageSlug}` : 'New SEO Configuration'}
                        </h2>
                        <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Basic Info */}
                        <section>
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                                <Settings size={16} /> Basic Meta
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Slug <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="pageSlug"
                                        value={formData.pageSlug}
                                        onChange={handleChange}
                                        disabled={!!editingId}
                                        placeholder="e.g., home, about-us, horoscope-aries"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Unique identifier for the page.</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (comma separated)</label>
                                    <input
                                        type="text"
                                        name="metaKeywords"
                                        value={Array.isArray(formData.metaKeywords) ? formData.metaKeywords.join(', ') : formData.metaKeywords}
                                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value.split(',').map(s => s.trim()) })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Canonical URL</label>
                                    <input
                                        type="text"
                                        name="canonicalUrl"
                                        value={formData.canonicalUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-slate-100"></div>

                        {/* Open Graph */}
                        <section>
                            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                                <Globe size={16} /> Open Graph (Facebook / LinkedIn)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">OG Title</label>
                                    <input
                                        type="text"
                                        name="ogTitle"
                                        value={formData.ogTitle}
                                        onChange={handleChange}
                                        placeholder="Defaults to Meta Title if empty"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">OG Description</label>
                                    <textarea
                                        name="ogDescription"
                                        value={formData.ogDescription}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Defaults to Meta Description if empty"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    ></textarea>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">OG Image URL</label>
                                    <input
                                        type="text"
                                        name="ogImage"
                                        value={formData.ogImage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] flex items-center gap-2"
                            >
                                <Save size={18} /> Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

const initialFormState = {
    pageSlug: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    metaAuthor: 'Way2Astro',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'website',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterCard: 'summary_large_image'
};
