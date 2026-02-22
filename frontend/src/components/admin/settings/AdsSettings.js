'use strict';
'use client';

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-hot-toast';
import { DollarSign, Save, AlertCircle, ExternalLink } from 'lucide-react';

export default function AdsSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [googleAdsId, setGoogleAdsId] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.success) {
                setGoogleAdsId(res.data.settings?.googleAdsId || '');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.put('/site-settings', { googleAdsId });
            if (res.data.success) {
                toast.success('Ad settings updated successfully');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Monetization & Ads</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure external ad networks</p>
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
                {/* Google AdSense */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-blue-100 transition bg-slate-50/30">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Google AdSense</h3>
                            <a
                                href="https://www.google.com/adsense/start/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                Get Publisher ID <ExternalLink size={12} />
                            </a>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            Enter your Google AdSense Publisher ID (e.g., <code>ca-pub-1234567890123456</code>).
                            Required for ads to appear on your site.
                        </p>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Publisher ID</label>
                            <input
                                type="text"
                                value={googleAdsId}
                                onChange={(e) => setGoogleAdsId(e.target.value)}
                                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p>
                        Ensure your domain (`way2astro.com`) is added to your AdSense account's <strong>Sites</strong> list.
                        Ads may take up to 24-48 hours to appear after configuration.
                    </p>
                </div>
            </div>
        </div>
    );
}
