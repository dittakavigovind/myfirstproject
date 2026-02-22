export default function AshtakavargaTable({ data }) {
    if (!data || !data.sav) return null;

    const { sav, bav, signs } = data;
    const planets = Object.keys(bav); // ['Sun', 'Moon', ...]

    // Calculate Total SAV (Sarvashtakavarga)
    // sav is { Aries: 28, ... }

    // Helper for color coding points
    const getPointColor = (points) => {
        if (points >= 30) return 'text-emerald-600 font-black bg-emerald-50';
        if (points >= 28) return 'text-green-600 font-bold bg-green-50'; // Average
        if (points >= 25) return 'text-amber-600 font-medium bg-amber-50'; // Below Average
        return 'text-rose-600 font-bold bg-rose-50'; // Low
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-800">Ashtakavarga (Bhavas & Bindus)</h2>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sarvashtakavarga</div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-center text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                            <th className="px-4 py-3 text-left w-32 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Sign</th>
                            {planets.map(p => (
                                <th key={p} className="px-2 py-3 w-16">{p.substr(0, 2)}</th>
                            ))}
                            <th className="px-4 py-3 text-emerald-700 w-20 bg-emerald-50/30">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {signs.map((sign, idx) => (
                            <tr key={sign} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-left font-bold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    <div className="flex flex-col">
                                        <span>{sign}</span>
                                        <span className="text-[9px] text-slate-400 font-normal uppercase">{idx + 1} House</span>
                                    </div>
                                </td>
                                {planets.map(p => (
                                    <td key={p} className="px-2 py-3 text-slate-500 font-medium">
                                        {bav[p][sign] || 0}
                                    </td>
                                ))}
                                <td className={`px-4 py-3 border-l border-slate-100 ${getPointColor(sav[sign])}`}>
                                    {sav[sign]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                            <td className="px-4 py-3 text-left font-black text-slate-800 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Total</td>
                            {planets.map(p => {
                                // Sum of columns
                                const total = signs.reduce((acc, s) => acc + (bav[p][s] || 0), 0);
                                return <td key={p} className="px-2 py-3 font-bold text-slate-700">{total}</td>;
                            })}
                            <td className="px-4 py-3 font-black text-lg text-emerald-700 bg-emerald-100/50">337</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-sm mb-2">Interpretation Guide</h4>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span>28+ Points: Strong/Favorable</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span>25-27 Points: Average/Mixed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span>&lt; 25 Points: Weak/Challenging</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
