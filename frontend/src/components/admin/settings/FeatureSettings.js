"use client";

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MessageSquare, Phone, Save, AlertCircle, Users, Image as ImageIcon, Upload } from 'lucide-react';

export default function FeatureSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [promotionImage, setPromotionImage] = useState('');
    const [promotionUrl, setPromotionUrl] = useState('');
    const [featureFlags, setFeatureFlags] = useState({
        enableChat: true,
        enableCall: true,
        enableTopAstrologers: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.success) {
                const settings = res.data.settings;
                setFeatureFlags(settings.featureFlags || {});
                setPromotionImage(settings.promotionImage || '');
                setPromotionUrl(settings.promotionUrl || '');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const res = await API.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setPromotionImage(res.data.filePath);
                toast.success("Image uploaded successfully");
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await API.put('/site-settings', {
                featureFlags: featureFlags,
                promotionImage: promotionImage,
                promotionUrl: promotionUrl
            });
            if (data.success) {
                toast.success("Feature settings updated successfully");
                window.location.reload();
            } else {
                toast.error(data.message || "Failed to update");
            }
        } catch (error) {
            console.error("Error saving feature flags:", error);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Feature Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Control visibility of global features</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 font-medium shadow-lg shadow-indigo-500/20"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="p-8 space-y-8">
                {/* Chat Feature */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-indigo-100 transition bg-slate-50/30">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <MessageSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Chat with Astrologer</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={featureFlags.enableChat}
                                    onChange={() => handleToggle('enableChat')}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Enable or disable the "Chat" functionality across the entire platform.
                            When disabled, chat buttons and links will be hidden from users.
                        </p>
                    </div>
                </div>

                {/* Call Feature */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-emerald-100 transition bg-slate-50/30">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Phone size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Talk to Astrologer</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={featureFlags.enableCall}
                                    onChange={() => handleToggle('enableCall')}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Enable or disable the "Call" functionality.
                            When disabled, call buttons and consultation options will be hidden.
                        </p>
                    </div>
                </div>

                {/* Top Astrologers Section */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-purple-100 transition bg-slate-50/30">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Top Astrologers Section</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={featureFlags.enableTopAstrologers}
                                    onChange={() => handleToggle('enableTopAstrologers')}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Show or hide the "Top Astrologers" (Live Now) section on the homepage.
                        </p>
                    </div>
                </div>

                {/* Promotion Image Placeholder */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-orange-100 transition bg-slate-50/30">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <ImageIcon size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Promotion Image</h3>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            Upload a promotional image for banner or ad placements.
                            <span className="font-bold text-slate-700 block mt-1">Recommended Size: 500x300px</span>
                        </p>

                        {/* Image Upload UI */}
                        <div className="w-full">
                            <label className="block group cursor-pointer w-full">
                                <div className={`bg-white rounded-xl p-6 flex flex-col items-center justify-center border-2 border-dashed ${uploading ? 'border-orange-400 bg-orange-50' : 'border-slate-300 group-hover:border-orange-400 group-hover:bg-orange-50'} transition-all min-h-[160px] relative overflow-hidden`}>
                                    {uploading ? (
                                        <div className="flex flex-col items-center text-orange-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                                            <span className="text-xs font-bold uppercase">Uploading...</span>
                                        </div>
                                    ) : promotionImage ? (
                                        <>
                                            <img src={promotionImage} alt="Promotion" className="max-h-40 w-auto object-contain z-10 relative rounded-lg shadow-sm" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                    Change Image
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                            <Upload size={32} className="mb-2" />
                                            <span className="text-sm font-medium">Click to upload promotion image</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </div>
                            </label>
                            {promotionImage && (
                                <button
                                    onClick={() => setPromotionImage('')}
                                    className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Target URL (Optional)</label>
                            <input
                                type="text"
                                value={promotionUrl}
                                onChange={(e) => setPromotionUrl(e.target.value)}
                                placeholder="e.g., /offers/diwali-sale"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                            />
                            <p className="text-xs text-slate-400 mt-1">Enter a path (e.g., /astrologers) or full URL to make the image clickable.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p>Changes will reflect immediately for new sessions, but existing users might need to refresh.</p>
                </div>
            </div>
        </div>
    );
}
