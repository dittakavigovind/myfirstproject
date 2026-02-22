"use client";

import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, X, Save, ArrowLeft, MoreHorizontal, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FAQManager from '@/components/admin/FAQManager';

export default function AdminCreatePost() {
    const { user } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: '', slug: '', excerpt: '', content: '', categories: [], status: 'draft', featuredImage: '',
        seo: {
            metaTitle: '', metaDescription: '', focusKeyword: '', metaKeywords: '', canonicalUrl: '',
            ogTitle: '', ogDescription: '', ogImage: ''
        },
        faqs: []
    });

    useEffect(() => {
        if (user && ['admin', 'manager'].includes(user.role)) {
            fetchCategories();
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            const res = await API.get('/blog/categories');
            setCategories(res.data.data);
            // Default to first category if available and none selected
            if (res.data.data.length > 0 && form.categories.length === 0) {
                setForm(prev => ({ ...prev, categories: [res.data.data[0]._id] }));
            }
        } catch (err) { console.error(err); }
    };

    const [uploading, setUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            // Explicitly unset Content-Type (using null) so browser sets it with boundary
            const res = await API.post('/upload', formData, {
                headers: { 'Content-Type': null }
            });
            setForm(prev => ({ ...prev, featuredImage: res.data.filePath }));
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => { // ... existing code ...
        e.preventDefault();

        // Client-side Validation
        const missingFields = [];
        if (!form.title.trim()) missingFields.push('Title');
        if (!form.content.trim()) missingFields.push('Content');
        if (!form.categories || form.categories.length === 0) missingFields.push('Categories');
        if (!form.excerpt.trim()) missingFields.push('Excerpt');

        if (missingFields.length > 0) {
            toast.error(
                <div>
                    <p className="font-bold mb-1">Please fill the following fields:</p>
                    <ul className="list-disc pl-4 text-sm">
                        {missingFields.map(field => <li key={field}>{field}</li>)}
                    </ul>
                </div>,
                { duration: 4000, position: 'top-center', style: { border: '1px solid #EF4444', background: '#FEF2F2', color: '#B91C1C' } }
            );
            return;
        }

        try {
            await API.post('/blog/posts', form);
            toast.success('Post created successfully!', { style: { minWidth: '250px' } });
            router.push('/admin/blog');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to save post');
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const canonicalUrl = `https://way2astro.com/blog/${slug}`;

        setForm(prev => ({
            ...prev,
            title,
            slug,
            seo: { ...prev.seo, canonicalUrl }
        }));
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md py-4 border-b border-slate-200 -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-white rounded-lg transition text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{form.title || 'New Post'}</h1>
                        <p className="text-xs text-slate-500">{form.slug ? `/${form.slug}` : 'Draft'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition text-sm">
                        Preview
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-astro-navy text-white rounded-lg font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
                    >
                        <Save size={18} /> Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        <input
                            className="w-full text-4xl font-bold text-slate-800 placeholder-slate-300 outline-none border-none bg-transparent"
                            placeholder="Post Title"
                            required
                            value={form.title}
                            onChange={handleTitleChange}
                        />

                        <div className="border border-slate-100 rounded-xl overflow-hidden p-1 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
                            <textarea
                                className="w-full h-[600px] p-6 outline-none bg-slate-50 rounded-lg font-mono text-sm leading-relaxed resize-none text-slate-700"
                                placeholder="Write your content here... (HTML supported)"
                                required
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span> SEO Settings
                        </h3>
                        <div className="space-y-4">
                            <input
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50"
                                placeholder="Meta Title"
                                value={form.seo.metaTitle}
                                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                            />
                            <textarea
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50 resize-none h-24"
                                placeholder="Meta Description"
                                value={form.seo.metaDescription}
                                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
                            />
                            <input
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50"
                                placeholder="Meta Keywords (comma separated)"
                                value={form.seo.metaKeywords}
                                onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaKeywords: e.target.value } })}
                            />
                            <input
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50"
                                placeholder="Canonical URL"
                                value={form.seo.canonicalUrl}
                                onChange={(e) => setForm({ ...form, seo: { ...form.seo, canonicalUrl: e.target.value } })}
                            />

                            {/* Open Graph */}
                            <div className="space-y-3 pt-2 border-t border-slate-100 mt-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Open Graph (Facebook)</h4>
                                <input
                                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50 text-sm"
                                    placeholder="OG Title"
                                    value={form.seo.ogTitle}
                                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogTitle: e.target.value } })}
                                />
                                <input
                                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50 text-sm"
                                    placeholder="OG Description"
                                    value={form.seo.ogDescription}
                                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogDescription: e.target.value } })}
                                />
                                <input
                                    className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none transition bg-slate-50 text-sm"
                                    placeholder="OG Image URL"
                                    value={form.seo.ogImage}
                                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })}
                                />
                            </div>


                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <FAQManager
                            faqs={form.faqs}
                            onChange={(newFaqs) => setForm({ ...form, faqs: newFaqs })}
                        />
                    </div>
                </div>

                {/* Sidebar Settings (Right 1/3) */}
                <div className="space-y-6">
                    {/* Status & Visibility */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Publishing</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                                <select
                                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 outline-none cursor-pointer"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">URL Slug</label>
                                <input
                                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 text-slate-500 font-mono text-xs outline-none"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Taxonomy */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Categories</h3>
                        <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto p-2 bg-slate-50 space-y-1">
                            {categories.map(cat => (
                                <label key={cat._id} className="flex items-center gap-3 p-2 hover:bg-white rounded transition cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            value={cat._id}
                                            checked={form.categories?.includes(cat._id) || false}
                                            onChange={(e) => {
                                                const { checked, value } = e.target;
                                                setForm(prev => {
                                                    const currentCats = prev.categories || [];
                                                    const newCats = checked
                                                        ? [...currentCats, value]
                                                        : currentCats.filter(c => c !== value);
                                                    return { ...prev, categories: newCats };
                                                });
                                            }}
                                            className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium">
                                        {cat.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {(!form.categories || form.categories.length === 0) && (
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Select at least one category
                            </p>
                        )}
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Featured Image</h3>
                        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors relative overflow-hidden group">
                            {form.featuredImage ? (
                                <div className="relative w-full h-48">
                                    <img
                                        src={form.featuredImage}
                                        alt="Featured"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, featuredImage: '' }))}
                                        className="absolute top-2 right-2 bg-white/90 text-slate-600 p-2 rounded-full shadow-md hover:text-red-600 transition opacity-0 group-hover:opacity-100 z-20"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                                    <ImageIcon size={32} className="text-slate-300 mb-3" />
                                    <p className="text-xs text-slate-500">Drop image or click to upload</p>
                                </div>
                            )}

                            {!form.featuredImage && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                            )}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Excerpt</h3>
                        <textarea
                            className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 outline-none text-sm h-32 resize-none"
                            placeholder="Write a short summary..."
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-8 relative">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="fixed top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition z-50"
                        >
                            <X size={24} />
                        </button>

                        <div className="mt-12 space-y-8">
                            {/* Preview Header */}
                            <div className="text-center space-y-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                    {form.categories?.length > 0
                                        ? categories.filter(c => form.categories.includes(c._id)).map(c => c.name).join(', ')
                                        : 'Uncategorized'}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
                                    {form.title || 'Untitled Post'}
                                </h1>
                                <p className="text-slate-500 flex items-center justify-center gap-2 text-sm">
                                    <Calendar size={16} /> {new Date().toLocaleDateString()}
                                </p>
                            </div>

                            {/* Preview Image */}
                            {form.featuredImage && (
                                <div className="aspect-video relative rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src={form.featuredImage}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Preview Content */}
                            <div className="prose prose-lg prose-slate max-w-none mx-auto">
                                <div dangerouslySetInnerHTML={{ __html: form.content }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
