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
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
    const [cloudflareToken, setCloudflareToken] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.success) {
                setGoogleAdsId(res.data.settings?.googleAdsId || '');
                setGoogleAnalyticsId(res.data.settings?.googleAnalyticsId || '');
                setCloudflareToken(res.data.settings?.cloudflareToken || '');
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
            const res = await API.put('/site-settings', { googleAdsId, googleAnalyticsId, cloudflareToken });
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
                    <h2 className="text-xl font-bold text-slate-800">Monetization & Analytics</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure external ad networks and analytics</p>
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

                {/* Google Analytics 4 */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-green-100 transition bg-slate-50/30">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Google Analytics (GA4)</h3>
                            <a
                                href="https://analytics.google.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                Get Measurement ID <ExternalLink size={12} />
                            </a>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            Enter your Google Analytics 4 Measurement ID (e.g., <code>G-XXXXXXXXXX</code>).
                            Required to automatically track page views and events.
                        </p>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Measurement ID</label>
                            <input
                                type="text"
                                value={googleAnalyticsId}
                                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-slate-700 font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Cloudflare Web Analytics */}
                <div className="flex items-start gap-6 p-6 rounded-xl border border-slate-100 hover:border-orange-100 transition bg-slate-50/30">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <div className="w-6 h-6 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                <path d="M17.5 19c.6 0 1.1-.4 1.3-.9l1.6-4.1c.3-.9.1-1.8-.4-2.5-.5-.7-1.3-1.1-2.2-1.1h-1.3c-.6 0-1.1-.4-1.3-.9l-1.6-4.1c-.3-.9-.1-1.8.4-2.5.5-.7 1.3-1.1 2.2-1.1" />
                                <path d="M6.5 5c-.6 0-1.1.4-1.3.9L3.6 10c-.3.9-.1 1.8.4 2.5s1.3 1.1 2.2 1.1h1.3c.6 0 1.1.4 1.3.9l1.6 4.1c.3.9.1 1.8-.4 2.5s-1.3 1.1-2.2 1.1" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">Cloudflare Web Analytics</h3>
                            <a
                                href="https://dash.cloudflare.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                Get Token <ExternalLink size={12} />
                            </a>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            Enter your Cloudflare Web Analytics Token.
                            Found in your Cloudflare dashboard under <strong>Web Analytics</strong>.
                        </p>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Analytics Token</label>
                            <input
                                type="text"
                                value={cloudflareToken}
                                onChange={(e) => setCloudflareToken(e.target.value)}
                                placeholder="d8fec9f96df74e7ea6..."
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-700 font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p>
                        Ensure your domain (<code>way2astro.com</code>) is correctly configured in your analytics and ad accounts.
                        Changes may take some time to reflect across all edges.
                    </p>
                </div>
            </div>
        </div>
    );
}
