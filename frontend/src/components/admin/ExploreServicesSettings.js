"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import API from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Save, RefreshCw, Eye, EyeOff, Plus, Edit2, Trash2, X, AlertTriangle, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function ExploreServicesSettings() {
    const { exploreServices, setExploreServices, fetchTheme } = useTheme();
    const [localServices, setLocalServices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        icon: 'Star',
        color: 'blue',
        href: '',
        enabled: true
    });

    useEffect(() => {
        if (exploreServices && exploreServices.length > 0) {
            setLocalServices([...exploreServices].sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
    }, [exploreServices]);

    const handleReorder = (newOrder) => {
        const reordered = newOrder.map((service, index) => ({
            ...service,
            order: index + 1
        }));
        setLocalServices(reordered);
    };

    const toggleService = (id) => {
        setLocalServices(prev => prev.map(s =>
            (s.id === id || s._id === id) ? { ...s, enabled: !s.enabled } : s
        ));
    };

    const openAddModal = () => {
        setEditingService(null);
        setFormData({
            title: '',
            desc: '',
            icon: 'Star',
            color: 'blue',
            href: '',
            enabled: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            title: service.title || '',
            desc: service.desc || '',
            icon: service.icon || 'Star',
            color: service.color || 'blue',
            href: service.href || '',
            enabled: service.enabled !== false
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        setLocalServices(prev => prev.filter(s => s.id !== id && s._id !== id));
        toast.success('Service removed from list. Remember to save.');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (editingService) {
            setLocalServices(prev => prev.map(s =>
                (s.id === editingService.id || s._id === editingService._id) ? { ...s, ...formData } : s
            ));
            toast.success('Service updated in list');
        } else {
            const newService = {
                ...formData,
                id: formData.title.toLowerCase().replace(/\s+/g, '-'),
                order: localServices.length + 1
            };
            setLocalServices([...localServices, newService]);
            toast.success('New service added to list');
        }

        setIsModalOpen(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await API.put('/site-settings', { exploreServices: localServices });
            if (res.data.success) {
                toast.success('Configuration saved successfully');
                setExploreServices(localServices);
                fetchTheme();
            }
        } catch (error) {
            console.error('Failed to update services', error);
            toast.error('Failed to update services');
        } finally {
            setLoading(false);
        }
    };

    const resetToDefaults = async () => {
        if (!confirm('Are you sure you want to reset all services to last saved state?')) return;
        fetchTheme();
        toast.success('Reset to last saved state');
    };

    const iconOptions = [
        'Star', 'MessageCircle', 'Phone', 'FileText', 'Users', 'PlayCircle', 'Calendar',
        'BookOpen', 'Heart', 'Moon', 'Sun', 'Activity', 'Clock', 'Sparkles', 'Hash',
        'ShoppingBag', 'Compass', 'Globe', 'Zap', 'Shield', 'Trophy', 'Briefcase'
    ];

    const colorOptions = ['blue', 'green', 'purple', 'red', 'orange', 'indigo', 'rose', 'amber', 'emerald'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Explore Services Manager</h2>
                    <p className="text-sm text-slate-500">Add, edit, reorder or toggle visibility of services on the homepage.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add New
                    </button>
                    <button
                        onClick={resetToDefaults}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-astro-navy text-white font-bold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            <div className="p-6">
                <Reorder.Group axis="y" values={localServices} onReorder={handleReorder} className="space-y-3">
                    {localServices.map((service, index) => (
                        <Reorder.Item
                            key={service.id || service._id || `service-${index}`}
                            value={service}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${service.enabled ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'
                                }`}
                        >
                            <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition">
                                <GripVertical size={20} />
                            </div>

                            <div className={`p-2.5 rounded-lg bg-slate-100 text-slate-600`}>
                                {LucideIcons[service.icon] ? React.createElement(LucideIcons[service.icon], { size: 20 }) : <HelpCircle size={20} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800 text-sm">{service.title}</h4>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter ${service.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                        service.color === 'green' ? 'bg-emerald-50 text-emerald-600' :
                                            service.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                                service.color === 'red' ? 'bg-rose-50 text-rose-600' :
                                                    service.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-slate-100 text-slate-600'
                                        }`}>
                                        {service.color}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">{service.desc}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-right hidden sm:block mr-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route</p>
                                    <p className="text-xs text-slate-600 font-mono">{service.href}</p>
                                </div>

                                <button
                                    onClick={() => openEditModal(service)}
                                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                    title="Edit Service"
                                >
                                    <Edit2 size={18} />
                                </button>

                                <button
                                    onClick={() => toggleService(service.id || service._id)}
                                    className={`p-2 rounded-lg transition-colors ${service.enabled
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                        }`}
                                    title={service.enabled ? 'Hide from homepage' : 'Show on homepage'}
                                >
                                    {service.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>

                                <button
                                    onClick={() => handleDelete(service.id || service._id)}
                                    className="p-2 rounded-lg text-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                    title="Delete Service"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {localServices.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No services found. Add one to get started.</p>
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 flex items-start gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Pro Tip:</strong> Reorder services by dragging the handle on the left. Changes are only applied to the homepage when you click <strong>Save All Changes</strong>.
                </p>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                        placeholder="e.g. Free Kundli"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subtext/Desc</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                        placeholder="e.g. Full Report"
                                        value={formData.desc}
                                        onChange={e => setFormData({ ...formData, desc: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Route Path (Href)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-mono"
                                    placeholder="e.g. /kundli"
                                    value={formData.href}
                                    onChange={e => setFormData({ ...formData, href: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Icon</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        {iconOptions.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Color Theme</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    >
                                        {colorOptions.map(color => (
                                            <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 rounded-xl bg-astro-navy text-white font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-indigo-900/10"
                                >
                                    {editingService ? 'Update Service' : 'Add to List'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
