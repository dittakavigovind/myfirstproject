"use client";

import { useEffect, useState } from 'react';
import API from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, FolderPlus, Folder } from 'lucide-react';

export default function AdminCategories() {
    const { user } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', slug: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && ['admin', 'manager'].includes(user.role)) {
            fetchCategories();
        } else if (user && !['admin', 'manager'].includes(user.role)) {
            router.push('/');
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            const res = await API.get('/blog/categories');
            setCategories(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/blog/categories/${editingId}`, form);
                alert('Category Updated');
            } else {
                await API.post('/blog/categories', form);
                alert('Category Created');
            }
            setForm({ name: '', slug: '', description: '' });
            setEditingId(null);
            fetchCategories();
        } catch (err) {
            alert('Failed to save category');
        }
    };

    const handleEdit = (cat) => {
        setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
        setEditingId(cat._id);
    };

    const handleCancel = () => {
        setForm({ name: '', slug: '', description: '' });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await API.delete(`/blog/categories/${id}`);
            alert('Category Deleted');
            fetchCategories();
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    if (!user || !['admin', 'manager'].includes(user.role)) return null;

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manage Categories</h1>
                    <p className="text-sm text-slate-500">Organize your blog posts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-8">
                        <h2 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                            {editingId ? (
                                <><Edit2 size={18} className="text-blue-500" /> Edit Category</>
                            ) : (
                                <><FolderPlus size={18} className="text-green-500" /> Add New Category</>
                            )}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                    placeholder="e.g. Vedic Astrology"
                                    required
                                    value={form.name}
                                    onChange={(e) => {
                                        if (editingId) {
                                            setForm({ ...form, name: e.target.value });
                                        } else {
                                            setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') });
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Slug</label>
                                <input
                                    className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-slate-600 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    required
                                    placeholder="e.g. vedic-astrology"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm h-24 resize-none"
                                    placeholder="Short summary..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-2.5 rounded-xl font-bold text-white shadow-sm transition hover:scale-[1.02] active:scale-[0.98] ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-astro-navy hover:bg-slate-800'}`}
                            >
                                {editingId ? 'Update Category' : 'Create Category'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-full py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-700">Existing Categories</h2>
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">Total: {categories.length}</span>
                        </div>

                        {categories.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <Folder size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No categories found. Create one to get started!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {categories.map(cat => (
                                    <div key={cat._id} className="p-4 hover:bg-slate-50 transition flex items-start justify-between group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-slate-800">{cat.name}</h3>
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono">/{cat.slug}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 max-w-xl">{cat.description || <span className="italic opacity-50">No description provided</span>}</p>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
