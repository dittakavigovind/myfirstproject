import { motion } from 'framer-motion';
import { Sparkles, Grid, AlertTriangle, Layers, Activity, User, Crown } from 'lucide-react'; // Example icons

export default function SessionTabs({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'inputs', label: 'Inputs', icon: User },
        { id: 'kundli', label: 'Janam Kundli', icon: Sparkles },
        { id: 'dasha', label: 'Dasha Periods', icon: Activity },
        { id: 'dosha', label: 'Dosha Analysis', icon: AlertTriangle },
        { id: 'arudha', label: 'Arudha Lagna', icon: Layers },
        { id: 'ashtakavarga', label: 'Ashtakavarga', icon: Grid },
        { id: 'jaimini', label: 'Jaimini Karakas', icon: Crown },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
                            ${isActive
                                ? 'text-slate-900 shadow-lg shadow-amber-400/20'
                                : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabBg"
                                className="absolute inset-0 bg-gradient-to-r from-astro-yellow to-orange-400 rounded-full z-0"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
