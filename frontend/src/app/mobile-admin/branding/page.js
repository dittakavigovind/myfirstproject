"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Save, UploadCloud, Loader2 } from 'lucide-react';

export default function MobileBrandingDashboard() {
    const [siteSettings, setSiteSettings] = useState({ 
        mobileAppIconUrl: '', 
        mobileAppSplashUrl: '', 
        mobileAppLogoUrl: '',
        mobilePromoBannerUrl: '',
        mobilePromoLink: '',
        mobilePromoEnabled: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [uploadingAppIcon, setUploadingAppIcon] = useState(false);
    const [uploadingAppSplash, setUploadingAppSplash] = useState(false);
    const [uploadingAppLogo, setUploadingAppLogo] = useState(false);
    const [uploadingPromo, setUploadingPromo] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.settings) {
                setSiteSettings({
                    mobileAppIconUrl: res.data.settings.mobileAppIconUrl || '',
                    mobileAppSplashUrl: res.data.settings.mobileAppSplashUrl || '',
                    mobileAppLogoUrl: res.data.settings.mobileAppLogoUrl || '',
                    mobilePromoBannerUrl: res.data.settings.mobilePromoBannerUrl || '',
                    mobilePromoLink: res.data.settings.mobilePromoLink || '',
                    mobilePromoEnabled: res.data.settings.mobilePromoEnabled || false
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load branding settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await API.put('/site-settings', {
                mobileAppIconUrl: siteSettings.mobileAppIconUrl,
                mobileAppSplashUrl: siteSettings.mobileAppSplashUrl,
                mobileAppLogoUrl: siteSettings.mobileAppLogoUrl,
                mobilePromoBannerUrl: siteSettings.mobilePromoBannerUrl,
                mobilePromoLink: siteSettings.mobilePromoLink,
                mobilePromoEnabled: siteSettings.mobilePromoEnabled
            });
            toast.success("Branding assets updated instantly");
        } catch (err) {
            toast.error("Failed to update branding assets");
        }
        setSaving(false);
    };

    const handleAssetUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'icon') setUploadingAppIcon(true);
        if (type === 'splash') setUploadingAppSplash(true);
        if (type === 'logo') setUploadingAppLogo(true);
        if (type === 'promo') setUploadingPromo(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await API.post('/upload/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = res.data;

            if (data.success) {
                toast.success('Asset uploaded successfully');
                setSiteSettings(prev => ({
                    ...prev,
                    [type === 'icon' ? 'mobileAppIconUrl' : type === 'splash' ? 'mobileAppSplashUrl' : type === 'logo' ? 'mobileAppLogoUrl' : 'mobilePromoBannerUrl']: data.filePath
                }));
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            toast.error(error.response?.data?.message || 'Failed to upload asset');
        } finally {
            if (type === 'icon') setUploadingAppIcon(false);
            if (type === 'splash') setUploadingAppSplash(false);
            if (type === 'logo') setUploadingAppLogo(false);
            if (type === 'promo') setUploadingPromo(false);
        }
    };

    if (loading) return <div>Loading Branding Assets...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="text-indigo-500" /> App Branding & Assets
                </h1>
                <p className="text-slate-400 mt-2">Manage all the required icons, splash screens, and logos for your mobile application.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles size={20} className="text-indigo-400" /> Branding Configuration
                        </h2>
                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Apply Changes</>}
                        </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-6">
                        Upload required icons and logos. These assets are centrally stored here so developers can easily download and bundle them into the native Android/iOS apps during the build process.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* App Icon */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <label className="block text-sm font-bold text-white">App Icon (Launcher)</label>
                                    <p className="text-xs text-slate-500 mt-1">Used for the native Android/iOS home screen. Dimensions: 1024x1024 px PNG (No transparency).</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={siteSettings.mobileAppIconUrl}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, mobileAppIconUrl: e.target.value })}
                                    placeholder="/uploads/icon.png"
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                />
                                <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg cursor-pointer transition whitespace-nowrap">
                                    {uploadingAppIcon ? <Loader2 size={18} className="mr-2 animate-spin"/> : <UploadCloud size={18} className="mr-2"/>}
                                    Upload Raw Asset
                                    <input type="file" accept=".png,.jpg,.jpeg,.svg,image/*" className="hidden" onChange={(e) => handleAssetUpload(e, 'icon')} disabled={uploadingAppIcon} />
                                </label>
                            </div>
                        </div>

                        {/* Splash Screen */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <label className="block text-sm font-bold text-white">Splash Screen</label>
                                    <p className="text-xs text-slate-500 mt-1">Used for the native launch screen when the app boots up. Dimensions: 2732x2732 px PNG (No transparency, centered emblem).</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={siteSettings.mobileAppSplashUrl}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, mobileAppSplashUrl: e.target.value })}
                                    placeholder="/uploads/splash.png"
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                />
                                <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg cursor-pointer transition whitespace-nowrap">
                                    {uploadingAppSplash ? <Loader2 size={18} className="mr-2 animate-spin"/> : <UploadCloud size={18} className="mr-2"/>}
                                    Upload Raw Asset
                                    <input type="file" accept=".png,.jpg,.jpeg,.svg,image/*" className="hidden" onChange={(e) => handleAssetUpload(e, 'splash')} disabled={uploadingAppSplash} />
                                </label>
                            </div>
                        </div>

                        {/* In-App Logo */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <label className="block text-sm font-bold text-white">In-App Header Logo</label>
                                    <p className="text-xs text-slate-500 mt-1">Used inside the app header and login screens. Dimensions: Any size, transparent PNG or SVG recommended.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <input
                                    type="text"
                                    value={siteSettings.mobileAppLogoUrl}
                                    onChange={(e) => setSiteSettings({ ...siteSettings, mobileAppLogoUrl: e.target.value })}
                                    placeholder="/uploads/logo.png"
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                />
                                <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg cursor-pointer transition whitespace-nowrap">
                                    {uploadingAppLogo ? <Loader2 size={18} className="mr-2 animate-spin"/> : <UploadCloud size={18} className="mr-2"/>}
                                    Upload Raw Asset
                                    <input type="file" accept=".png,.jpg,.jpeg,.svg,image/*" className="hidden" onChange={(e) => handleAssetUpload(e, 'logo')} disabled={uploadingAppLogo} />
                                </label>
                            </div>
                        </div>

                        {/* Mobile Home Banner */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 mt-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <label className="block text-sm font-bold text-white">Mobile Home Banner</label>
                                    <p className="text-xs text-slate-500 mt-1">Promotional banner displayed on the mobile app home screen. Recommended dimensions: <strong>1200x420 px</strong> (Approx 3:1 aspect ratio).</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={siteSettings.mobilePromoEnabled} onChange={(e) => setSiteSettings({...siteSettings, mobilePromoEnabled: e.target.checked})} />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-300">Enable Banner</span>
                                </label>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Banner Image URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={siteSettings.mobilePromoBannerUrl}
                                            onChange={(e) => setSiteSettings({ ...siteSettings, mobilePromoBannerUrl: e.target.value })}
                                            placeholder="/uploads/banner.png"
                                            className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                        <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white px-3 rounded-lg cursor-pointer transition whitespace-nowrap">
                                            {uploadingPromo ? <Loader2 size={16} className="animate-spin"/> : <UploadCloud size={16}/>}
                                            <input type="file" accept=".png,.jpg,.jpeg,.svg,image/*" className="hidden" onChange={(e) => handleAssetUpload(e, 'promo')} disabled={uploadingPromo} />
                                        </label>
                                    </div>
                                    {siteSettings.mobilePromoBannerUrl && (
                                        <div className="mt-3 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 h-24 flex items-center justify-center">
                                            <img src={siteSettings.mobilePromoBannerUrl} alt="Promo preview" className="max-h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Link URL (Optional)</label>
                                    <input
                                        type="text"
                                        value={siteSettings.mobilePromoLink}
                                        onChange={(e) => setSiteSettings({ ...siteSettings, mobilePromoLink: e.target.value })}
                                        placeholder="e.g. /explore"
                                        className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Route to navigate when banner is clicked.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
