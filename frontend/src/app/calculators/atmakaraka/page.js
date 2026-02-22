"use client";

import { useState } from 'react';
import SmartInputForm from '@/components/SmartInputForm';
import CosmicLoader from '@/components/CosmicLoader';
import API from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Crown, Heart, Users, Shield, Briefcase, Baby, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AtmakarakaCalculator() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCalculate = async (formData) => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await API.post('/astro/jaimini-karakas', formData);
            if (res.data.success) {
                setResult(res.data.data);
                toast.success('Karakas calculated successfully!');
            } else {
                const msg = res.data.message || 'Calculation failed';
                setError(msg);
                toast.error(msg);
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to connect to server';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (key) => {
        switch (key) {
            case 'AK': return <Crown className="text-amber-500" size={24} />;
            case 'AmK': return <Briefcase className="text-blue-500" size={20} />;
            case 'BK': return <Users className="text-green-500" size={20} />;
            case 'MK': return <Heart className="text-pink-500" size={20} />;
            case 'PK': return <Baby className="text-purple-500" size={20} />;
            case 'GK': return <Shield className="text-red-500" size={20} />;
            case 'DK': return <User className="text-indigo-500" size={20} />;
            default: return <Star className="text-slate-400" size={20} />;
        }
    };

    const getDescription = (key) => {
        switch (key) {
            case 'AK': return "The King of the chart. Represents your Soul's purpose, inner nature, and spiritual path.";
            case 'AmK': return "The Minister. Governs your career, social status, and professional achievements.";
            case 'BK': return "Represents siblings, gurus, and mentors. Shows your courage and skills.";
            case 'MK': return "Signifies mother, happiness, home, and emotional stability.";
            case 'PK': return "Represents children, intelligence, creativity, and past life merit.";
            case 'GK': return "Signifies obstacles, enemies, diseases, and competitive challenges.";
            case 'DK': return "Represents spouse, partnerships, and business relationships.";
            default: return "";
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="relative bg-slate-900 pb-24 pt-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Atmakaraka <span className="text-astro-yellow">Calculator</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Discover your Soul Planet (Atmakaraka) and Spouse Planet (Darakaraka) using Jaimini Astrology.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <SmartInputForm
                            title={
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-astro-yellow/10 flex items-center justify-center text-astro-yellow">
                                        <Star size={18} fill="currentColor" />
                                    </div>
                                    <span>Enter Birth Details</span>
                                </div>
                            }
                            subtitle={null}
                            buttonText="Calculate Karakas"
                            onSubmit={handleCalculate}
                            isLoading={loading}
                            singleColumn={true}
                            preventRedirect={true}
                        />
                    </div>
                    {/* Results Section */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-[500px] bg-white rounded-[2rem] shadow-sm border border-slate-100"
                                >
                                    <CosmicLoader message="Analyzing Planetary Degrees..." />
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] shadow-sm border border-rose-100 text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800">Calculation Error</h3>
                                    <p className="text-slate-500 max-w-sm">{error}</p>
                                    <button
                                        onClick={() => setError('')}
                                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Highlight Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Atmakaraka Card */}
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-8 border border-amber-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Crown size={120} className="text-amber-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">Soul Planet</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-800 mb-1">Atmakaraka</h3>
                                                <div className="text-sm font-medium text-amber-600 mb-6">(AK)</div>

                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="text-5xl font-black text-amber-600">
                                                        {result.karakas.find(k => k.key === 'AK')?.planet}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    Represents your true self, soul's purpose, and the deepest lessons you are here to learn in this lifetime.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Darakaraka Card */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] p-8 border border-indigo-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Heart size={120} className="text-indigo-600" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">Spouse Planet</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-800 mb-1">Darakaraka</h3>
                                                <div className="text-sm font-medium text-indigo-600 mb-6">(DK)</div>

                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="text-5xl font-black text-indigo-600">
                                                        {result.karakas.find(k => k.key === 'DK')?.planet}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    Signifies your spouse, business partners, and the nature of your most intimate relationships.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Table */}
                                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                            <h3 className="font-black text-xl text-slate-800">Complete Jaimini Karakas</h3>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">7 Planet Scheme</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                    <tr>
                                                        <th className="px-6 py-4">Karaka</th>
                                                        <th className="px-6 py-4">Planet</th>
                                                        <th className="px-6 py-4">Degree</th>
                                                        <th className="px-6 py-4">Significance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 text-sm">
                                                    {result.karakas.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600`}>
                                                                        {getIcon(item.key)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-800">{item.name}</div>
                                                                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">{item.key}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-bold text-astro-navy text-lg">{item.planet}</span>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                                <span className="bg-slate-100 px-2 py-1 rounded-md">
                                                                    {Math.floor(item.degree)}° {Math.floor((item.degree % 1) * 60)}'
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-600 text-sm max-w-xs leading-relaxed">
                                                                {getDescription(item.key)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 h-full"
                                >
                                    <h3 className="text-2xl font-black text-slate-800 mb-6">What are Jaimini Karakas?</h3>

                                    <div className="space-y-8">
                                        <div className="flex gap-6 items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600">
                                                <Crown size={32} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800 mb-2">Atmakaraka (The Soul)</h4>
                                                <p className="text-slate-600 text-sm leading-7">
                                                    In Jaimini Astrology, the planet with the <strong>highest degree</strong> in any sign is your Atmakaraka (AK). It represents your true self, your soul's desire, and the primary spiritual lessons you are destined to experience.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-pink-50 flex-shrink-0 flex items-center justify-center text-pink-600">
                                                <Heart size={32} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800 mb-2">Darakaraka (The Partner)</h4>
                                                <p className="text-slate-600 text-sm leading-7">
                                                    The planet with the <strong>lowest degree</strong> is your Darakaraka (DK). Unlike the 7th house lord, the DK gives deeper insights into the soul connection with your spouse and the nature of your partnerships.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Star className="text-astro-yellow fill-current" size={18} />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Did you know?</span>
                                            </div>
                                            <p className="text-sm text-slate-600 italic">
                                                "Only the 7 main planets (Sun to Saturn) are considered for these Karakas in the standard scheme. Rahu and Ketu are excluded because they move retrograde."
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
