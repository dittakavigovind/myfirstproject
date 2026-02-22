import KundliChart from './KundliChart';

export default function ArudhaView({ data }) {
    if (!data) return null;

    // We can re-use KundliChart but highlight the Arudha Lagna
    // KundliChart expects { planets, ascendantSign }
    // We can simulate a "Planet" called 'AL' or just show standard chart and Text.
    // Better: Show the chart and add 'AL' to the planets list for visualization if KundliChart supports custom points?
    // Current KundliChart iterates `planets`. We can inject AL.

    // Mock planets object with AL
    // data is { sign: X, signName: '', lord: '', count: Y }

    // We need the original planets to show the full chart, 
    // BUT Arudha endpoint currently only returns Arudha info? 
    // Wait, getArudhaLagna endpoint returns only Arudha calculation.
    // To show a CHART, we need the full planets. 
    // The SessionContext logic fetches data per tab.
    // If 'arudha' tab only fetches Arudha Calc, we can't show full chart unless we also have 'kundli' data.
    // WE SHOULD UPDATE SessionContext to pass 'kundli' data to Arudha view if available, 
    // OR update getArudhaLagna to return full chart + Arudha.
    // Let's assume for now we display the Arudha Details nicely, and maybe a text explanation.
    // Enhancing: Let's pass 'kundli' data from context to this view if available.

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                        AL
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Arudha Lagna (Pada)</h2>
                        <p className="text-slate-500 font-medium text-sm">Maya (Illusion) & Social Perception</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex justify-between items-center">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Arudha Sign</span>
                        <span className="text-xl font-black text-indigo-900">{data.signName} ({data.sign})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Lagna Lord</span>
                            <span className="text-lg font-black text-slate-800">{data.lord}</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Count Used</span>
                            <span className="text-lg font-black text-slate-800">{data.count} Houses</span>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-2xl p-6 text-sm text-indigo-800 font-medium leading-relaxed">
                        <p>
                            Your <strong>Arudha Lagna</strong> is in <strong>{data.signName}</strong>.
                            This indicates how the world perceives you and your status in society.
                            While your Ascendant shows your true self, the Arudha shows the reflection or "Maya" associated with you.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="text-xl font-bold mb-4 relative z-10">Significance</h3>

                <ul className="space-y-4 relative z-10 text-slate-300 text-sm leading-relaxed">
                    <li className="flex gap-3">
                        <span className="text-astro-yellow text-lg">•</span>
                        <span>
                            <strong className="text-white block">Career & Status</strong>
                            Planets in the 10th from Arudha Lagna influence your professional rise and reputation.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-astro-yellow text-lg">•</span>
                        <span>
                            <strong className="text-white block">Financial Gains</strong>
                            The 11th from Arudha Lagna (Labha Pada) determines wealth accumulation and fluid assets.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-astro-yellow text-lg">•</span>
                        <span>
                            <strong className="text-white block">Spirituality vs Materialism</strong>
                            Benefics in the 3rd and 6th from AL indicate spiritual inclination (renunciation), while Malefics indicate material prowess.
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
