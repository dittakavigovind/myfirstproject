"use client";

import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';
import { Settings, Save, Sparkles, AlertTriangle, DollarSign } from 'lucide-react';

export default function MobilePricingDashboard() {
    const [pricingConfig, setPricingConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await API.get('/admin/config/pricing');
            setPricingConfig(res.data.config);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pricing config");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.put('/admin/config/pricing', pricingConfig);
            toast.success("Global Pricing updated dynamically");
        } catch (err) {
            toast.error("Failed to update pricing");
        }
        setSaving(false);
    };

    if (loading) return <div>Loading Pricing Engine...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <DollarSign className="text-emerald-500" /> Revenue & Surge Pricing
                </h1>
                <p className="text-slate-400 mt-2">Manage peak hour surge multipliers and base commissions dynamically.</p>
            </div>

            {pricingConfig && (
                <>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles size={20} className="text-emerald-400" /> Surge Multiplier Settings
                                </h2>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition disabled:opacity-50"
                                >
                                    {saving ? 'Deploying...' : <><Save size={18} /> Apply Instantly</>}
                                </button>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 mb-6 flex items-start gap-4">
                                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Peak Hour Surge Settings</h3>
                                    <p className="text-sm text-slate-400 mt-1">When surge is active, all astrologer prices are temporarily multiplied by the Surge Multiplier.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <ToggleSwitch 
                                    label="Activate Global Surge Pricing" 
                                    description="Instantly enforce peak hour pricing calculations."
                                    icon={<AlertTriangle size={16} className="text-red-400" />}
                                    checked={pricingConfig.surgePricing?.isSurgeActive} 
                                    onChange={(v) => setPricingConfig({ ...pricingConfig, surgePricing: { ...pricingConfig.surgePricing, isSurgeActive: v } })} 
                                />

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Surge Multiplier (e.g. 1.5x, 2.0x)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            min="1.0"
                                            value={pricingConfig.surgePricing?.surgeMultiplier} 
                                            onChange={(e) => setPricingConfig({ ...pricingConfig, surgePricing: { ...pricingConfig.surgePricing, surgeMultiplier: parseFloat(e.target.value) } })}
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/50 text-xl font-black"
                                        />
                                    </div>
                                    <div className="text-xs text-slate-500 italic">
                                        Example: An astrologer charging ₹20/min will instantly cost ₹{(pricingConfig.surgePricing?.surgeMultiplier || 1) * 20}/min.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative p-8">
                         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Global Commission Fallback</h3>
                         <div className="max-w-xs">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Base Platform Commission %</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    max="100" min="0" step="1"
                                    value={pricingConfig.globalRates?.globalPlatformFee ?? 40} 
                                    onChange={(e) => setPricingConfig({ ...pricingConfig, globalRates: { ...pricingConfig.globalRates, globalPlatformFee: parseInt(e.target.value) } })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-3 pl-8 rounded-lg focus:ring-2 focus:ring-emerald-500/50 font-bold"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">This is used if an individual Astrologer does not have a customized rate in their profile.</p>
                         </div>
                    </div>
                </>
            )}
        </div>
    );
}

function ToggleSwitch({ label, description, checked, onChange, icon }) {
    return (
        <div className="flex items-start justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition">
            <div className="pr-4">
                <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <span className="font-bold text-slate-200">{label}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
            </label>
        </div>
    );
}
