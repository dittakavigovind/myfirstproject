"use client";
import { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Save, Image as ImageIcon, Loader2, Upload, Trash2, Plus, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { resolveImageUrl } from '../../lib/urlHelper';

export default function HeroCarouselSettings() {
    const [settings, setSettings] = useState({
        heroSection: {
            showCarousel: false,
            carouselImages: []
        }
    });

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.success) {
                const data = res.data.settings;
                const rawImages = data.heroSection?.carouselImages || [];
                const normalizedImages = rawImages.map(img => typeof img === 'string' ? { image: img, link: '' } : img);

                setSettings({
                    heroSection: {
                        showCarousel: data.heroSection?.showCarousel || false,
                        carouselImages: normalizedImages
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage(null);

        try {
            const res = await API.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setSettings(prev => ({
                    ...prev,
                    heroSection: {
                        ...prev.heroSection,
                        carouselImages: [...prev.heroSection.carouselImages, { image: res.data.filePath, link: '' }]
                    }
                }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
            // reset file input
            e.target.value = null;
        }
    };

    const handleDeleteImage = (indexToRemove) => {
        setSettings(prev => ({
            ...prev,
            heroSection: {
                ...prev.heroSection,
                carouselImages: prev.heroSection.carouselImages.filter((_, idx) => idx !== indexToRemove)
            }
        }));
    };

    const handleLinkChange = (index, newLink) => {
        setSettings(prev => ({
            ...prev,
            heroSection: {
                ...prev.heroSection,
                carouselImages: prev.heroSection.carouselImages.map((img, idx) =>
                    idx === index ? { ...img, link: newLink } : img
                )
            }
        }));
    };

    const handleToggle = () => {
        setSettings(prev => ({
            ...prev,
            heroSection: {
                ...prev.heroSection,
                showCarousel: !prev.heroSection.showCarousel
            }
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                heroSection: settings.heroSection
            };
            const res = await API.put('/site-settings', payload);
            if (res.data.success) {
                setMessage({ type: 'success', text: 'Hero Carousel settings updated successfully!' });
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        }
    };

    if (loading) return <div className="p-6 text-slate-500">Loading settings...</div>;

    const { showCarousel, carouselImages } = settings.heroSection;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon size={24} className="text-indigo-500" />
                    Full-Width Hero Carousel
                </h2>
                {/* Global Toggle Switch */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Enable Carousel</span>
                    <button
                        onClick={handleToggle}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${showCarousel ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${showCarousel ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />}
                    {message.text}
                </div>
            )}

            <div className={`transition-opacity duration-300 ${!showCarousel ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <p className="text-sm text-slate-500 mb-6">
                    When enabled, these images will slide in the background of the main Hero section instead of the default promotional video/image.
                    We recommend high quality, wide images (e.g., 1920x1080) for the best full-width experience.
                </p>

                {/* Upload Area */}
                <div className="mb-8">
                    <label className="block group cursor-pointer w-full max-w-md">
                        <div className={`bg-slate-50 rounded-xl p-6 flex items-center gap-4 border-2 border-dashed ${uploading ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 group-hover:border-indigo-400 group-hover:bg-slate-50'} transition-all relative overflow-hidden`}>
                            {uploading ? (
                                <div className="flex items-center text-indigo-500 gap-3">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Uploading Image...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-3 rounded-full text-indigo-500 shadow-sm border border-slate-100 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <Plus size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">Add New Banner</span>
                                        <span className="text-xs text-slate-400">Click to upload an image from your device</span>
                                    </div>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading || !showCarousel}
                            />
                        </div>
                    </label>
                </div>

                {/* Images List */}
                <div className="space-y-4 max-w-4xl">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Active Banners ({carouselImages.length})
                    </h3>

                    {carouselImages.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <ImageIcon size={48} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500 font-medium">No banners uploaded yet</p>
                            <p className="text-xs text-slate-400 mt-1">Upload your first image above to start the carousel.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {carouselImages.map((item, index) => {
                                const imgPath = typeof item === 'string' ? item : item.image;
                                const imgLink = typeof item === 'string' ? '' : (item.link || '');
                                return (
                                    <div key={index} className="group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center gap-4 border-b border-slate-100 relative">
                                            <div className="w-32 h-24 bg-slate-100 flex-shrink-0 flex items-center justify-center border-r border-slate-100">
                                                <img
                                                    src={resolveImageUrl(imgPath)}
                                                    alt={`Banner ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 py-3 pr-4 truncate">
                                                <p className="text-sm font-bold text-slate-800 mb-1">Banner #{index + 1}</p>
                                                <p className="text-[10px] text-slate-400 truncate max-w-[180px] font-mono bg-slate-50 px-2 py-0.5 rounded" title={imgPath}>
                                                    {imgPath?.split('/').pop()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteImage(index)}
                                                className="absolute right-3 top-3 p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                title="Remove Image"
                                                disabled={!showCarousel}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="p-3 bg-slate-50 flex items-center gap-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[40px]">URL:</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., /online-pooja or https://example.com"
                                                className="flex-1 text-sm px-3 py-1.5 rounded border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                                                value={imgLink}
                                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                                disabled={!showCarousel}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 mt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-indigo-900/10"
                >
                    <Save size={20} />
                    Save Carousel Settings
                </button>
            </div>
        </div>
    );
}
