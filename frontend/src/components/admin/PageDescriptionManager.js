"use client";
import { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Save, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CANONICAL_MAP = {
    'today-panchang': 'panchang',
    'panchang/[[...slug]]': 'panchang'
};

export default function PageDescriptionManager() {
    const [selectedPage, setSelectedPage] = useState('');
    const [pages, setPages] = useState([]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await API.get('/seo/available-pages');
            if (res.data.success) {
                const uniquePages = new Map();

                res.data.data.forEach(p => {
                    const canonicalSlug = CANONICAL_MAP[p.slug] || p.slug;
                    let name = p.name;
                    if (CANONICAL_MAP[p.slug]) {
                        name = canonicalSlug.charAt(0).toUpperCase() + canonicalSlug.slice(1);
                    }

                    if (!uniquePages.has(canonicalSlug)) {
                        uniquePages.set(canonicalSlug, {
                            id: canonicalSlug,
                            name: name
                        });
                    }
                });

                const allPages = Array.from(uniquePages.values());
                setPages(allPages);
                if (allPages.length > 0) {
                    const defaultPage = allPages.find(p => p.id === 'panchang') || allPages[0];
                    setSelectedPage(defaultPage.id);
                }
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
            toast.error('Failed to load available pages. Please ensure you are logged in.');
        }
    };

    useEffect(() => {
        if (!selectedPage) return;

        const fetchContent = async () => {
            setLoading(true);
            setDescription('');
            try {
                const res = await API.get(`/page-content/${selectedPage}`);
                if (res.data.success && res.data.data) {
                    setDescription(res.data.data.description || '');
                }
            } catch (error) {
                console.error('Error fetching content:', error);
                toast.error('Failed to load description');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedPage]);

    const handleSave = async () => {
        if (!selectedPage) return;
        setSaving(true);
        try {
            const res = await API.put(`/page-content/${selectedPage}`, { description });
            if (res.data.success) {
                toast.success('Description updated successfully!');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Failed to save description');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" size={24} />
                        Page Description Manager
                    </h1>
                    <p className="text-sm text-slate-500">Manage HTML introductions and descriptions for specific pages</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !selectedPage}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-200"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Description'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Select Page</label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 text-left custom-scrollbar">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setSelectedPage(page.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedPage === page.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {page.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <div className="mb-0">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">
                                Editing Description for: <span className="text-blue-600">{pages.find(p => p.id === selectedPage)?.name || selectedPage}</span>
                            </h2>

                            <p className="text-sm text-slate-500 mb-4 font-medium">
                                Content entered here will be displayed above the FAQ section. You can use standard HTML tags.
                            </p>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter page content/description here (supports HTML)..."
                                className="w-full h-96 p-6 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
