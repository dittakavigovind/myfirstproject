"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import SessionTabs from '@/components/SessionTabs';
import SmartInputForm from '@/components/SmartInputForm'; // New Import
import PrintSessionReport from '@/components/PrintSessionReport';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowDownCircle, ChevronUp, ChevronDown, User, MapPin, Calendar, Clock, Layers, Activity, Crown, Heart, Briefcase, Users, Shield, Zap, Baby, Printer } from 'lucide-react';
import CosmicLoader from '@/components/CosmicLoader';
import KundliChart from '@/components/KundliChart'; // Missing Import
import AshtakavargaTable from '@/components/AshtakavargaTable'; // Missing Import

// Helper for consistent date formatting (dd-MMM-yyyy)
const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, '-');
};

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// View Components (Dynamically imported or direct)
// For simplicity in this structure, we'll assume we reused or created them.

// --- ENHANCED VIEWS ---

const DoshaView = ({ data }) => {
    if (!data) return null;
    const { mangalDosha, kaalsarpDosha, sadeSati } = data;

    return (
        <div className="space-y-8">
            {/* Mangal Dosha Card */}
            <div className={`p-8 rounded-[2rem] border ${mangalDosha?.hasDosha ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${mangalDosha?.hasDosha ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${mangalDosha?.hasDosha ? 'text-red-900' : 'text-green-900'}`}>
                            Mangal Dosha Analysis
                        </h3>
                        <div className={`text-sm font-bold uppercase tracking-wider ${mangalDosha?.hasDosha ? 'text-red-600' : 'text-green-600'}`}>
                            {mangalDosha?.hasDosha ? "Dosha Present" : "No Dosha Found"}
                        </div>
                    </div>
                </div>
                <p className={`text-lg leading-relaxed ${mangalDosha?.hasDosha ? 'text-red-800' : 'text-green-800'}`}>
                    {mangalDosha?.description || "Mars is well placed in your chart, indicating no major obstructions in marital life from this planetary influence."}
                </p>
                {mangalDosha?.hasDosha && mangalDosha?.remedies && (
                    <div className="mt-6 bg-white/50 p-6 rounded-2xl">
                        <h4 className="font-bold text-red-900 mb-3">Suggested Remedies</h4>
                        <ul className="list-disc list-inside space-y-2 text-red-800">
                            {mangalDosha.remedies.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Kaal Sarp Dosha Card */}
            <div className={`p-8 rounded-[2rem] border ${kaalsarpDosha?.present ? 'bg-slate-900 text-white' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${kaalsarpDosha?.present ? 'bg-white/10 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        <Layers size={24} />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${kaalsarpDosha?.present ? 'text-white' : 'text-blue-900'}`}>
                            Kaal Sarp Dosha
                        </h3>
                        <div className={`text-sm font-bold uppercase tracking-wider ${kaalsarpDosha?.present ? 'text-blue-200' : 'text-blue-600'}`}>
                            {kaalsarpDosha?.present ? `${kaalsarpDosha.type} Found` : "No Dosha Found"}
                        </div>
                    </div>
                </div>
                <p className={`text-lg leading-relaxed ${kaalsarpDosha?.present ? 'text-slate-300' : 'text-blue-800'}`}>
                    {kaalsarpDosha?.description || "All planets are not hemmed between Rahu and Ketu. You are free from Kaal Sarp Dosha."}
                </p>
            </div>

            {/* Sade Sati Card */}
            <div className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2">Saturn Sade Sati</h3>
                    <div className="text-4xl font-bold text-astro-yellow mb-4">
                        {sadeSati?.isSadeSati ? "Active" : "Not Active"}
                    </div>
                    <p className="text-indigo-200 text-lg max-w-2xl mb-6">
                        {sadeSati?.phaseDescription || "You are not currently under the major influence of Saturn's 7.5 year cycle."}
                    </p>
                    {sadeSati?.isSadeSati && (
                        <div className="bg-indigo-800/50 p-6 rounded-2xl border border-indigo-700">
                            <h4 className="font-bold text-indigo-100 mb-3">Remedies for this Phase</h4>
                            <ul className="list-disc list-inside space-y-2 text-indigo-200 text-sm">
                                {sadeSati?.remedies?.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// We need to fetch/import existing components:
// Kundli: ../kundli/result/page.js component logic? 
// Re-using the logic from KundliResult is tricky because it has its own fetching logic.
// We should probably extract the "Presentational" part of KundliResult or just reconstruct it here efficiently.
// Given strict instructions to "dynamically load without reload", extracting presentation is best.
// But for Speed/Demo, I will implement simplified Views here using the data from SessionContext.

// Import our new components
// --- ENHANCED VIEWS ---

const ArudhaView = ({ data }) => {
    if (!data || !data.arudha) return null;
    const { arudha } = data;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Layers size={120} />
                </div>
                <h3 className="text-2xl font-black mb-1">Arudha Lagna (AL)</h3>
                <p className="text-slate-400 mb-8 max-w-xs text-sm">The projected self. How the world perceives you vs. reality.</p>

                <div className="flex items-end gap-4 mb-4">
                    <div className="text-6xl font-black text-astro-yellow">{arudha.signName}</div>
                    <div className="text-xl font-bold mb-2 opacity-80">in {arudha.finalHouseFromLagna}th House</div>
                </div>
                <div className="inline-block px-4 py-2 bg-white/10 rounded-lg text-sm font-medium border border-white/10 backdrop-blur-md">
                    Calculated from {arudha.lagnaSignName} Lagna
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Activity size={18} className="text-indigo-600" /> calculation Logic
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Lagna Lord ({arudha.lagnaLord}) is in {arudha.signName}. The Arudha Lagna is placed as many signs away from the Lord as the Lord is from the Lagna.
                    </p>
                    {arudha.exception && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs font-bold">
                            ⚠️ Exception Applied: {arudha.exception}
                        </div>
                    )}
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2">What this means for you</h4>
                    <p className="text-sm text-indigo-800 leading-relaxed opacity-90">
                        With AL in the {arudha.finalHouseFromLagna}th house, your public image is strongly tied to {
                            arudha.finalHouseFromLagna === 1 ? "your personality and physical presence" :
                                arudha.finalHouseFromLagna === 10 ? "your career and professional achievements" :
                                    arudha.finalHouseFromLagna === 7 ? "your relationships and partnerships" :
                                        arudha.finalHouseFromLagna === 4 ? "your home, assets and emotional stability" : "this specific area of life"
                        }.
                        People perceive you as a {arudha.signName}-like personality, regardless of your true inner nature.
                    </p>
                </div>
            </div>
        </div>
    );
}

const JaiminiView = ({ data }) => {
    if (!data || !data.karakas) return null;
    const { karakas } = data;

    const getIcon = (key) => {
        switch (key) {
            case 'AK': return <Crown className="text-amber-500" size={24} />;
            case 'AmK': return <Briefcase className="text-blue-500" size={20} />;
            case 'BK': return <Users className="text-green-500" size={20} />;
            case 'MK': return <Heart className="text-pink-500" size={20} />;
            case 'PK': return <Baby className="text-purple-500" size={20} />;
            case 'GK': return <Shield className="text-red-500" size={20} />;
            case 'DK': return <User className="text-indigo-500" size={20} />;
            default: return <Sparkles className="text-slate-400" size={20} />;
        }
    };

    const getDescription = (key) => {
        switch (key) {
            case 'AK': return "The King of the chart. Represents your Soul's purpose.";
            case 'AmK': return "The Minister. Governs your career and social status.";
            case 'BK': return "Represents siblings, gurus, and mentors. Shows your courage.";
            case 'MK': return "Signifies mother, happiness, and emotional stability.";
            case 'PK': return "Represents children, intelligence, and creativity.";
            case 'GK': return "Signifies obstacles, enemies, and competitive challenges.";
            case 'DK': return "Represents spouse, partnerships, and business relationships.";
            default: return "";
        }
    };

    return (
        <div className="space-y-8">
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
                                {karakas.find(k => k.key === 'AK')?.planet}
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
                                {karakas.find(k => k.key === 'DK')?.planet}
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
                            {karakas.map((item, idx) => (
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
        </div>
    );
}
const findActivePeriod = (dashas) => {
    const now = new Date();
    // 1. Find Mahadasha
    const md = dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
    if (!md) return null;

    // 2. Find Antardasha
    const ad = md.subPeriods?.find(d => new Date(d.start) <= now && new Date(d.end) >= now);

    // 3. Find Pratyantardasha (if available) - requires deeper calculation or if provided
    // Assuming structure has subPeriods... if AD has subPeriods we'd check there. 
    // Our simplified service might not return Level 3 yet unless we asked. 
    // Let's assume we want to show MD > AD for now, or fetch deeper if needed.
    // The previous edit to AstroService ADDED Level 3 support. So AD should have subPeriods!
    const pd = ad?.subPeriods?.find(d => new Date(d.start) <= now && new Date(d.end) >= now);

    return { md, ad, pd };
};

const DashaView = ({ data }) => {
    if (!data || !data.dashas) return null;
    const active = findActivePeriod(data.dashas.list);

    if (!active) return <div className="p-8 text-center text-slate-400">No active period found for current date.</div>;

    const { md, ad, pd } = active;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Current Cosmic Influence</h3>
                <p className="text-slate-500">You are currently under the following planetary periods</p>
            </div>

            {/* Active Hierarchy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mahadasha */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 opacity-10 font-black text-6xl -mt-2 -mr-2">{md.lord.slice(0, 2)}</div>
                    <div className="text-xs font-bold text-astro-yellow uppercase tracking-widest mb-2">Mahadasha (Major)</div>
                    <div className="text-3xl font-black mb-1">{md.lord}</div>
                    <div className="text-xs opacity-60">Until {formatDate(md.end)}</div>
                </div>

                {/* Antardasha */}
                <div className="bg-indigo-600 text-white p-6 rounded-2xl relative overflow-hidden group shadow-lg shadow-indigo-500/30">
                    <div className="absolute top-0 right-0 opacity-10 font-black text-6xl -mt-2 -mr-2">{ad?.lord.slice(0, 2)}</div>
                    <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Antardasha (Sub)</div>
                    <div className="text-3xl font-black mb-1">{ad?.lord}</div>
                    <div className="text-xs opacity-60">Until {formatDate(ad?.end)}</div>
                </div>

                {/* Pratyantardasha */}
                <div className="bg-white text-slate-900 border border-slate-200 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 opacity-5 font-black text-6xl -mt-2 -mr-2">{pd?.lord.slice(0, 2)}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pratyantardasha check</div>
                    <div className="text-3xl font-black mb-1">{pd ? pd.lord : "..."}</div>
                    <div className="text-xs text-slate-500">
                        {pd ? `Until ${formatDate(pd.end)}` : "Calculating..."}
                    </div>
                </div>
            </div>

            {/* Enhanced Interpretations */}
            <div className="space-y-6">
                {/* Mahadasha Insight */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-50 rounded-full opacity-50 blur-3xl"></div>

                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="p-4 rounded-2xl bg-slate-900 text-astro-yellow shadow-lg shadow-slate-200">
                            <Crown size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Mahadasha: {md.lord} Influence</h3>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">The Primary Life Theme (Until {formatDate(md.end)})</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Activity size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Core Nature</span>
                            </div>
                            <p className="text-lg leading-relaxed text-slate-600 italic">
                                "{md.analysis?.description || `The dasha of ${md.lord} represents a significant period of growth and internal alignment.`}"
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-2 text-indigo-400 mb-3">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Specific Impact</span>
                            </div>
                            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                                {md.analysis?.text || "This period marks a structural phase in life where your efforts yield significant long-term results."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Antardasha Insight */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/30 border border-indigo-50/50 overflow-hidden relative">
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-50/50 rounded-full opacity-50 blur-3xl"></div>

                    <div className="flex items-center gap-4 mb-6 relative">
                        <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Antardasha: {ad?.lord} focus</h3>
                            <p className="text-sm text-indigo-500 font-medium uppercase tracking-wider text-opacity-70">Current Phase Focus (Until {formatDate(ad?.end)})</p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none relative">
                        <div className="flex items-center gap-2 text-slate-400 mb-3">
                            <Briefcase size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Active Trends</span>
                        </div>
                        <div className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                            {ad?.analysis?.text || `During this sub-period of ${ad?.lord}, the broad themes of ${md.lord} are funneled into specific activities. Focus on ${ad?.lord}'s strengths to maximize results.`}
                        </div>
                    </div>
                </div>

                {/* Cosmic Summary */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                            <Shield size={20} className="text-astro-yellow" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-2">Guidance for this Period</h4>
                            <p className="text-indigo-100/80 leading-relaxed text-sm">
                                You are in a complex weave of <strong>{md.lord} and {ad?.lord}</strong>.
                                The stability of <strong>{md.lord}</strong> provides the foundation, while <strong>{ad?.lord}</strong> brings the immediate challenges and opportunities.
                                {pd && <span> Currently, <strong>{pd.lord}</strong> is acting as the daily trigger for these events.</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Kundli View with Toggles
const KundliView = ({ data }) => {
    const [chartType, setChartType] = useState('D1'); // D1, D9, D10
    const [style, setStyle] = useState('south');

    if (!data || !data.charts) return null;

    const activeChart = data.charts[chartType] || data.charts.D1; // Fallback

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Chart & Controls */}
            <div className="lg:col-span-5 space-y-6">
                {/* Chart Type Toggles */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['D1', 'D9', 'D10'].map(t => (
                        <button
                            key={t}
                            onClick={() => setChartType(t)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${chartType === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t === 'D1' ? 'Lagna (D1)' : t === 'D9' ? 'Navamsa (D9)' : 'Dasamsa (D10)'}
                        </button>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden aspect-square flex items-center justify-center group">
                    <KundliChart planets={activeChart} ascendantSign={Math.floor(data.houses.ascendant / 30) + 1} style={style} />

                    {/* Style Toggle */}
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 flex">
                        <button onClick={() => setStyle('north')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${style === 'north' ? 'bg-astro-yellow text-slate-900' : 'text-slate-300'}`}>North</button>
                        <button onClick={() => setStyle('south')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${style === 'south' ? 'bg-astro-yellow text-slate-900' : 'text-slate-300'}`}>South</button>
                    </div>
                </div>
            </div>

            {/* Right Col: Planetary Details */}
            <div className="lg:col-span-7">
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-800">Planetary Details</h3>
                        <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            {chartType} Positions
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                    <th className="pb-3 pl-2">Planet</th>
                                    <th className="pb-3">Sign</th>
                                    <th className="pb-3">Degree</th>
                                    <th className="pb-3">Nakshatra</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {Object.entries(activeChart).map(([k, v]) => (
                                    <tr key={k} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-1.5 pl-2 font-bold text-slate-700">{k}</td>
                                        <td className="py-1.5 text-slate-600 font-medium">{SIGNS[v.sign - 1] || v.sign}</td>
                                        <td className="py-1.5 font-mono text-xs text-slate-500">
                                            {Math.floor(v.longitude % 30)}° {Math.floor((v.longitude % 1) * 60)}'
                                        </td>
                                        <td className="py-1.5 text-slate-500 font-medium text-xs">
                                            {v.nakshatra ? `${v.nakshatra} (${v.pada})` : '---'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Panchanga Card - Full Width */}
            {data.panchang && (
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm shadow-slate-200/50">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Lagna</span>
                                <span className="text-sm font-black text-slate-800">{SIGNS[Math.floor(data.houses.ascendant / 30)]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Rasi</span>
                                <span className="text-sm font-black text-slate-800">{SIGNS[data.planets.Moon.sign - 1]}</span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600">
                                <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">Vara</span>
                                <span className="text-sm font-black">{data.panchang.vara}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Tithi</span>
                                <span className="text-sm font-black text-slate-800">{data.panchang.tithi}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
                                <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">Nakshatra</span>
                                <span className="text-sm font-black text-indigo-700">{data.panchang.nakshatra}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Yoga</span>
                                <span className="text-sm font-black text-slate-800">{data.panchang.yoga}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Karana</span>
                                <span className="text-sm font-black text-slate-800">{data.panchang.karana}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default function AstrologySessionPage() {
    const { activeTab, setActiveTab, birthDetails, getData, isLoading, downloadAllData } = useSession();
    const { logos } = useTheme();
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleDownloadPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const allData = await downloadAllData();
            setPrintData(allData);

            // Allow time for state to update and render
            setTimeout(() => {
                window.print();
                setIsGeneratingPdf(false);
            }, 500);
        } catch (error) {
            console.error("PDF Generation Error", error);
            setIsGeneratingPdf(false);
        }
    };

    // Initial check: if no birth details, maybe redirect or show empty state? 
    // Creating a session implies we came from a form or have default user data.
    // For now, if no name, we might want to prompt?
    // Let's assume Context handles defaults or User is logged in.
    const currentData = getData(activeTab);
    const loading = isLoading(activeTab);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Screen Content - Hidden on Print */}
            <div className="print:hidden">
                {/* Header / Birth Details Summary */}
                <div className={`bg-white shadow-sm border-b border-slate-100 transition-all duration-300 ${isHeaderCollapsed ? 'py-4' : 'py-8'}`}>
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                                    {birthDetails.name ? birthDetails.name.charAt(0) : 'G'}
                                </div>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-none mb-1">
                                        {birthDetails.name || "Guest Session"}
                                    </h1>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(birthDetails.date)}
                                        </span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {typeof birthDetails.time === 'string' ? birthDetails.time : birthDetails.time?.toLocaleTimeString()}</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {birthDetails.place || "Unknown Location"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPdf}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingPdf ? <CosmicLoader size="sm" /> : <Printer size={16} />}
                                    <span>{isGeneratingPdf ? "Preparing..." : "Download PDF"}</span>
                                </button>
                                <button
                                    onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                                    className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
                                >
                                    {isHeaderCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 pt-4 px-4 md:px-8 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <SessionTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'inputs' ? (
                            <motion.div
                                key="inputs"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <SmartInputForm />
                            </motion.div>
                        ) : loading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <CosmicLoader size="md" message={`Calculating ${activeTab}...`} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* console.log(activeTab, currentData) */}
                                {activeTab === 'kundli' && <KundliView data={currentData} />}
                                {activeTab === 'dasha' && <DashaView data={currentData} />}
                                {activeTab === 'dosha' && <DoshaView data={currentData} />}
                                {activeTab === 'arudha' && <ArudhaView data={currentData} />}
                                {activeTab === 'ashtakavarga' && <AshtakavargaTable data={currentData} />}
                                {activeTab === 'jaimini' && <JaiminiView data={currentData} />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Print View Container */}
            <div className="hidden print:block absolute top-0 left-0 w-full z-[9999] bg-white">
                <PrintSessionReport
                    data={printData}
                    birthDetails={birthDetails}
                    logo={logos?.report || logos?.desktop}
                    disclaimer="This report is generated using Way2Astro Vedic Astrology software. The predictions are based on ancient principles and are for guidance purposes only."
                />
            </div>

        </div>
    );
}
