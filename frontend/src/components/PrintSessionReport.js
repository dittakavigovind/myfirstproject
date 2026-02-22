import React from 'react';
import { MapPin, Calendar, Clock, Crown, Heart, Briefcase, Users, Shield, Baby, Sparkles, Layers, Activity, Zap } from 'lucide-react';
import KundliChart from './KundliChart';

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Reusing helper functions or defining locally for stability in print view
const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/ /g, '-');
};

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 mb-6 mt-8 break-inside-avoid">
        {Icon && <div className="p-2 bg-slate-100 rounded-lg text-slate-700"><Icon size={20} /></div>}
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-slate-50 break-inside-avoid">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        <span className="text-slate-900 text-sm font-bold">{value}</span>
    </div>
);

const PrintSessionReport = ({ data, birthDetails, logo, disclaimer }) => {
    if (!data) return null;
    const { kundli, dasha, dosha, arudha, ashtakavarga, jaimini } = data;

    return (
        <div className="print-container bg-white text-slate-900 p-8 max-w-[210mm] mx-auto relative cursor-text text-left">
            <style jsx global>{`
                @media print {
                    @page { margin: 8mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-hidden { display: none !important; }
                    .print-visible { display: block !important; }
                    .break-before { page-break-before: always; }
                    .break-after { page-break-after: always; }
                    .break-inside-avoid { page-break-inside: avoid; }
                    
                    /* Compact Table Styles for Print */
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 4px 8px; text-align: left; }
                }
                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    opacity: 0.08;
                    pointer-events: none;
                    z-index: 9999;
                    width: 70%;
                    max-width: 500px;
                }
            `}</style>

            {/* Watermark */}
            {logo && <img src={logo} alt="" className="watermark" />}

            {/* Header Page */}
            <div className="text-center py-6 border-b-4 border-slate-900 mb-6 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    {logo && <img src={logo} alt="Logo" className="h-16" />}
                    <div className="text-right">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Vedic Horoscope</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Comprehensive Analysis</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Name</span>
                            <div className="text-lg font-black text-slate-800">{birthDetails.name}</div>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Place</span>
                            <div className="text-lg font-bold text-slate-800 flex items-center gap-1">
                                <MapPin size={14} className="text-slate-400" /> {birthDetails.place}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</span>
                            <div className="text-lg font-bold text-slate-800 flex items-center gap-1">
                                <Calendar size={14} className="text-slate-400" /> {formatDate(birthDetails.date)}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time</span>
                            <div className="text-lg font-bold text-slate-800 flex items-center gap-1">
                                <Clock size={14} className="text-slate-400" /> {typeof birthDetails.time === 'string' ? birthDetails.time : birthDetails.time?.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kundli Section - Compact First Page */}
            {kundli && (
                <div className="mb-8 relative z-10 break-inside-avoid">
                    <SectionHeader title="Kundli & Planetary Details" icon={Sparkles} />

                    {/* Charts Row: D1 & D9 */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div className="text-center">
                            <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Lagna Chart (D1)</h4>
                            <div className="border border-slate-200 rounded-xl p-2 flex items-center justify-center bg-white aspect-square max-w-[280px] mx-auto">
                                <KundliChart planets={kundli.charts?.D1} ascendantSign={Math.floor(kundli.houses?.ascendant / 30) + 1} style="south" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs">Navamsa Chart (D9)</h4>
                            <div className="border border-slate-200 rounded-xl p-2 flex items-center justify-center bg-white aspect-square max-w-[280px] mx-auto">
                                <KundliChart planets={kundli.charts?.D9} ascendantSign={Math.floor(kundli.charts?.D9?.Ascendant?.sign || 1)} style="south" />
                            </div>
                        </div>
                    </div>

                    {/* Panchang - Single Strip */}
                    {kundli.panchang && (
                        <div className="mb-6 bg-slate-50 py-3 px-4 rounded-lg border border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2">
                            {/* Lagna & Rasi First */}
                            {kundli.houses && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lagna:</span>
                                    <span className="text-xs font-bold text-slate-800">
                                        {SIGNS[Math.floor(kundli.houses.ascendant / 30)]}
                                    </span>
                                </div>
                            )}
                            {kundli.planets?.Moon && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rasi:</span>
                                    <span className="text-xs font-bold text-slate-800">
                                        {SIGNS[kundli.planets.Moon.sign - 1]}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Vara:</span>
                                <span className="text-xs font-bold text-slate-800">{kundli.panchang.vara}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tithi:</span>
                                <span className="text-xs font-bold text-slate-800">{kundli.panchang.tithi}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nakshatra:</span>
                                <span className="text-xs font-bold text-slate-800">{kundli.panchang.nakshatra}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Yoga:</span>
                                <span className="text-xs font-bold text-slate-800">{kundli.panchang.yoga}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Karana:</span>
                                <span className="text-xs font-bold text-slate-800">{kundli.panchang.karana}</span>
                            </div>
                        </div>
                    )}

                    {/* Planetary Table */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs">Planetary Positions</h4>
                        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-slate-100">
                                <tr className="text-slate-500 font-bold uppercase text-left">
                                    <th className="py-2 px-3">Planet</th>
                                    <th className="py-2 px-3">Sign</th>
                                    <th className="py-2 px-3">Degree</th>
                                    <th className="py-2 px-3">Nakshatra</th>
                                    <th className="py-2 px-3">House</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.entries(kundli.charts?.D1 || {}).map(([k, v]) => (
                                    <tr key={k} className="hover:bg-slate-50/50">
                                        <td className="py-1.5 px-3 font-bold text-slate-800">{k}</td>
                                        <td className="py-1.5 px-3 text-slate-600">{SIGNS[v.sign - 1]}</td>
                                        <td className="py-1.5 px-3 font-mono text-slate-500">
                                            {Math.floor(v.longitude % 30)}°{Math.floor((v.longitude % 1) * 60)}'
                                        </td>
                                        <td className="py-1.5 px-3 text-slate-500">
                                            {v.nakshatra} ({v.pada})
                                        </td>
                                        <td className="py-1.5 px-3 text-slate-500">
                                            {Math.floor(v.longitude / 30) + 1}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Dasha Section - Forced to single page */}
            {dasha && dasha.dashas && (
                <div className="mb-6 relative z-10 break-before break-inside-avoid">
                    <SectionHeader title="Vimshottari Dasha" icon={Clock} />
                    {/* Render active period or a summary */}
                    {(() => {
                        // Simple active tracker or list major periods
                        const now = new Date();
                        const md = dasha.dashas.list.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
                        if (!md) return <p>No active dasha found.</p>;
                        const ad = md.subPeriods?.find(d => new Date(d.start) <= now && new Date(d.end) >= now);

                        return (
                            <div className="space-y-4">
                                {/* Compact Current Period Strip */}
                                <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Current Period</span>
                                            <div className="text-2xl font-black text-slate-800 leading-none mt-1">
                                                {md.lord} <span className="text-slate-400 text-lg">/ {ad ? ad.lord : '...'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="text-right">
                                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mahadasha Ends</div>
                                            <div className="text-xs font-bold text-slate-700">{formatDate(md.end)}</div>
                                        </div>
                                        <div className="text-right border-l border-slate-200 pl-6">
                                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Antardasha Ends</div>
                                            <div className="text-xs font-bold text-slate-700">{ad ? formatDate(ad.end) : '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {/* Sidebar: Overview Table (2/5) */}
                                    <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-100 h-fit">
                                        <h3 className="font-bold text-slate-700 mb-3 uppercase text-[9px] tracking-wider">Major Periods Overview</h3>
                                        <table className="w-full text-[9px]">
                                            <thead>
                                                <tr className="text-slate-400 text-left">
                                                    <th className="pb-1">Planet</th>
                                                    <th className="pb-1">Start</th>
                                                    <th className="pb-1">End</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dasha.dashas.list.map((d, i) => (
                                                    <tr key={i} className={`border-b border-slate-50 ${d.lord === md.lord ? 'bg-indigo-50/50 font-bold' : ''}`}>
                                                        <td className="py-1 px-1">{d.lord}</td>
                                                        <td className="py-1">{formatDate(d.start)}</td>
                                                        <td className="py-1">{formatDate(d.end)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Main: Analysis Insights (3/5) */}
                                    <div className="md:col-span-3 space-y-3">
                                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2 text-slate-900">
                                                <Crown size={12} className="text-indigo-500" />
                                                <h4 className="text-[9px] font-black uppercase tracking-widest">Mahadasha Impact ({md.lord})</h4>
                                            </div>
                                            <p className="text-[10px] text-slate-700 font-bold mb-1 italic leading-tight">
                                                "{md.analysis?.description}"
                                            </p>
                                            <div className="text-[9px] text-slate-600 leading-relaxed whitespace-pre-line">
                                                {md.analysis?.text}
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                            <div className="flex items-center gap-2 mb-2 text-slate-900">
                                                <Zap size={12} className="text-indigo-600" />
                                                <h4 className="text-[9px] font-black uppercase tracking-widest">Antardasha Focus ({ad?.lord})</h4>
                                            </div>
                                            <div className="text-[9px] text-slate-600 leading-relaxed whitespace-pre-line">
                                                {ad?.analysis?.text || `During this sub-period of ${ad?.lord}, the broad themes of ${md.lord} are funneled into specific activities. Focus on ${ad?.lord}'s strengths to maximize results.`}
                                            </div>
                                        </div>

                                        <div className="pt-2 px-1">
                                            <p className="text-[8px] text-slate-400 italic leading-tight">
                                                * Interpretations are calculated based on the specific planetary positions (Sign & House) in your natal birth chart.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Jaimini Section */}
            {jaimini && jaimini.karakas && (
                <div className="mb-12 relative z-10 break-before">
                    <SectionHeader title="Jaimini Karakas" icon={Crown} />
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Highlight AK & DK */}
                            {jaimini.karakas.filter(k => k.key === 'AK' || k.key === 'DK').map(k => (
                                <div key={k.key} className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-900 text-lg">{k.name}</span>
                                        <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded">{k.key}</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-700 mb-2">{k.planet}</div>
                                    <p className="text-sm text-slate-500 leading-snug">
                                        {k.key === 'AK' ? "Soul's Purpose & Self" : "Spouse & Partnerships"}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <table className="w-full text-sm mt-4 border border-slate-100 rounded-lg overflow-hidden">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 text-left font-bold text-slate-600">Karaka</th>
                                    <th className="p-3 text-left font-bold text-slate-600">Planet</th>
                                    <th className="p-3 text-left font-bold text-slate-600">Degree</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jaimini.karakas.map((item, idx) => (
                                    <tr key={idx} className="border-t border-slate-100">
                                        <td className="p-3 font-medium">
                                            {item.name} <span className="text-slate-400 text-xs ml-1">({item.key})</span>
                                        </td>
                                        <td className="p-3 font-bold">{item.planet}</td>
                                        <td className="p-3 font-mono text-xs text-slate-500">
                                            {Math.floor(item.degree)}° {Math.floor((item.degree % 1) * 60)}'
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ashtakavarga Section - Compact One Page */}
            {ashtakavarga && ashtakavarga.sav && (
                <div className="mb-8 relative z-10 break-inside-avoid">
                    <SectionHeader title="Ashtakavarga" icon={Activity} />
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-center text-[10px]">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-tighter">
                                <tr>
                                    <th className="py-2 px-1 text-left">Sign</th>
                                    {Object.keys(ashtakavarga.bav).map(p => <th key={p} className="py-2 px-1">{p.substr(0, 2)}</th>)}
                                    <th className="py-2 px-1 bg-slate-200">Tot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ashtakavarga.signs.map((sign, i) => (
                                    <tr key={sign}>
                                        <td className="py-1.5 px-2 text-left font-bold text-slate-700">
                                            {sign} <span className="text-[9px] text-slate-400 font-normal">({i + 1})</span>
                                        </td>
                                        {Object.keys(ashtakavarga.bav).map(p => {
                                            const points = ashtakavarga.bav[p][sign];
                                            let colorClass = "text-slate-400"; // Default/4
                                            if (points >= 5) colorClass = "text-emerald-700 font-bold bg-emerald-50";
                                            if (points <= 3) colorClass = "text-red-600 bg-red-50";
                                            return (
                                                <td key={p} className={`py-1 px-1 ${colorClass}`}>{points}</td>
                                            );
                                        })}
                                        <td className={`py-1 px-1 font-bold ${ashtakavarga.sav[sign] >= 28 ? 'text-emerald-700 bg-emerald-100' : ashtakavarga.sav[sign] < 25 ? 'text-red-700 bg-red-100' : 'text-slate-700 bg-slate-100'}`}>
                                            {ashtakavarga.sav[sign]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 font-bold text-slate-700">
                                <tr>
                                    <td className="py-2 px-2 text-left">Total</td>
                                    {Object.keys(ashtakavarga.bav).map(p => (
                                        <td key={p} className="py-2 px-1">
                                            {ashtakavarga.signs.reduce((acc, s) => acc + (ashtakavarga.bav[p][s] || 0), 0)}
                                        </td>
                                    ))}
                                    <td className="py-2 px-1 text-emerald-700">337</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Dosha & Arudha - Compacted */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 break-before">
                {dosha && (
                    <div className="break-inside-avoid">
                        <SectionHeader title="Dosha Analysis" icon={Shield} />
                        <div className="space-y-6">
                            {/* Mangal */}
                            <div className={`p-4 rounded-xl border ${dosha.mangalDosha?.hasDosha ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <h4 className="font-bold text-slate-900 mb-1">Mangal Dosha</h4>
                                <p className="text-sm text-slate-700">{dosha.mangalDosha?.description}</p>
                            </div>

                            {/* Kaal Sarp */}
                            <div className={`p-4 rounded-xl border ${dosha.kaalsarpDosha?.present ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                <h4 className="font-bold text-slate-900 mb-1">Kaal Sarp Dosha</h4>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {dosha.kaalsarpDosha?.present
                                        ? `Present (${dosha.kaalsarpDosha.type}). ${dosha.kaalsarpDosha.direction} direction.`
                                        : "No Kaal Sarp Dosha detected in the chart."}
                                </p>
                            </div>

                            {/* Sade Sati */}
                            <div className={`p-4 rounded-xl border ${dosha.sadeSati?.isSadeSati ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                <h4 className="font-bold text-slate-900 mb-1">Saturn Sade Sati</h4>
                                <p className="text-sm text-slate-700">
                                    Status: <strong>{dosha.sadeSati?.isSadeSati ? "Active" : "Inactive"}</strong>. {dosha.sadeSati?.phaseDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {arudha && arudha.arudha && (
                    <div className="break-inside-avoid">
                        <SectionHeader title="Arudha Lagna" icon={Layers} />
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                            <div className="text-4xl font-black text-slate-800 mb-2">{arudha.arudha.signName}</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Arudha Lagna</div>
                            <div className="mt-4 text-sm text-slate-600">
                                Placed in the {arudha.arudha.finalHouseFromLagna}th House from Lagna.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-20 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 break-inside-avoid">
                <p className="mb-1 italic">
                    "The astrological calculations and predictions in this report are based on ancient Vedic principles. They are intended for guidance and self-reflection only. We do not guarantee specific outcomes and assume no liability for decisions made based on this information."
                </p>
                <p>&copy; {new Date().getFullYear()} Way2Astro. All rights reserved.</p>
            </div>
        </div>
    );
};

export default PrintSessionReport;
