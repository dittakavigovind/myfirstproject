"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MessageCircle, 
    Phone, 
    FileText, 
    Users, 
    PlayCircle, 
    Calendar, 
    BookOpen, 
    Heart, 
    Moon, 
    Sun, 
    Activity, 
    Clock, 
    Sparkles, 
    Hash, 
    Shield, 
    AlertTriangle, 
    Zap, 
    Briefcase, 
    Star, 
    Flower2, 
    Search, 
    X, 
    ChevronRight
} from "lucide-react";

// Complete 27 services matching the website "Explore Services" grid exactly
// ALL MAPPED 100% TO NATIVE SCREENS
const ALL_SERVICES = [
    {
        id: "transit",
        title: "Live Planets",
        desc: "GOCHAR NOW",
        icon: Activity,
        badge: "LIVE",
        badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.4)]",
        blink: true,
        color: "orange",
        href: "/calculators/gochar",
        category: "charts",
    },
    {
        id: "mater-data",
        title: "Master Data",
        desc: "FULL REPORT",
        icon: Sparkles,
        badge: "PREMIUM",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        color: "amber",
        href: "/kundli",
        category: "charts",
    },
    {
        id: "panchang",
        title: "Panchang",
        desc: "MUHURAT",
        icon: Calendar,
        color: "orange",
        href: "/panchang",
        category: "muhurat",
    },
    {
        id: "horoscope",
        title: "Horoscope",
        desc: "DAILY INSIGHTS",
        icon: PlayCircle,
        badge: "CHECK",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
        color: "red",
        href: "/horoscope",
        category: "daily",
    },
    {
        id: "seva-&-pooja",
        title: "Online Pooja",
        desc: "ONLINE",
        icon: Flower2,
        color: "emerald",
        href: "/online-pooja",
        category: "spiritual",
    },
    {
        id: "ashtakavarga",
        title: "Ashtakavarga",
        desc: "STRENGTHS",
        icon: PlayCircle,
        color: "purple",
        href: "/calculators/ashtakavarga",
        category: "charts",
    },
    {
        id: "kundli",
        title: "Kundli",
        desc: "FULL REPORT",
        icon: FileText,
        badge: "FREE",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
        color: "purple",
        href: "/kundli",
        category: "charts",
    },
    {
        id: "hora-muhurat",
        title: "Hora Muhurat",
        desc: "TODAY",
        icon: Sparkles,
        badge: "NEW",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
        color: "amber",
        href: "/calculators/hora-muhurat",
        category: "muhurat",
    },
    {
        id: "choghadiya",
        title: "Choghadiya",
        desc: "MUHURAT",
        icon: Sparkles,
        badge: "NEW",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
        color: "emerald",
        href: "/calculators/choghadiya",
        category: "muhurat",
    },
    {
        id: "dasha",
        title: "Dasha",
        desc: "PLANETARY PERIOD",
        icon: Clock,
        badge: "PREMIUM",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        color: "indigo",
        href: "/calculators/dasha-periods",
        category: "charts",
    },
    {
        id: "numerology",
        title: "Numerology",
        desc: "NUMBERS GUIDE",
        icon: Hash,
        color: "emerald",
        href: "/calculators/numerology",
        category: "calculators",
    },
    {
        id: "matchmaking",
        title: "Matchmaking",
        desc: "COMPATIBILITY",
        icon: Users,
        badge: "PREMIUM",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        color: "pink",
        href: "/matchmaking",
        category: "compatibility",
    },
    {
        id: "blog",
        title: "Knowledge",
        desc: "BLOGS",
        icon: BookOpen,
        color: "indigo",
        href: "/blog",
        category: "spiritual",
    },
    {
        id: "love-calc",
        title: "Love",
        desc: "COMPATIBILITY",
        icon: Heart,
        color: "rose",
        href: "/love-calculator",
        category: "compatibility",
    },
    {
        id: "moon-sign",
        title: "Moon Sign",
        desc: "RASHI CALC",
        icon: Moon,
        color: "purple",
        href: "/calculators/moon-sign",
        category: "calculators",
    },
    {
        id: "sun-sign",
        title: "Sun Sign",
        desc: "ZODIAC",
        icon: Sun,
        color: "amber",
        href: "/calculators/sun-sign",
        category: "calculators",
    },
    {
        id: "sade-sati",
        title: "Sani Effects",
        desc: "SATURN CYCLE",
        icon: Activity,
        color: "blue",
        href: "/dosha?type=sadesati",
        category: "doshas",
    },
    {
        id: "yogini-dasha",
        title: "Yogini Dasha",
        desc: "MYSTIC CYCLE",
        icon: Sparkles,
        color: "purple",
        href: "/calculators/yogini-dasha",
        category: "charts",
    },
    {
        id: "friendship",
        title: "Friendship",
        desc: "BOND CHECK",
        icon: Users,
        color: "blue",
        href: "/calculators/friendship",
        category: "compatibility",
    },
    {
        id: "kaalsarp",
        title: "Kaalsarp Dosha",
        desc: "DOSHA CHECK",
        icon: AlertTriangle,
        color: "rose",
        href: "/dosha?type=kaalsarp",
        category: "doshas",
    },
    {
        id: "mangal",
        title: "Mangal/Kuja",
        desc: "DOSHA",
        icon: Zap,
        color: "orange",
        href: "/dosha?type=mangal",
        category: "doshas",
    },
    {
        id: "arudha-lagna-",
        title: "Arudha Lagna",
        desc: "REPUTATION",
        icon: Sparkles,
        color: "emerald",
        href: "/arudha-lagna",
        category: "charts",
    },
    {
        id: "marriage-&-career",
        title: "Marriage",
        desc: "CAREER",
        icon: Briefcase,
        color: "rose",
        href: "/calculators/marriage-career",
        category: "calculators",
    },
    {
        id: "nakshatra",
        title: "Nakshatra",
        desc: "CALC",
        icon: Star,
        color: "amber",
        href: "/calculators/nakshatra",
        category: "calculators",
    },
    {
        id: "ascendant",
        title: "Lagna",
        desc: "ASCENDANT",
        icon: Moon,
        color: "orange",
        href: "/calculators/ascendant",
        category: "calculators",
    },
    {
        id: "atmakaraka",
        title: "Atamakaraka",
        desc: "KARAKAS",
        icon: Star,
        color: "amber",
        href: "/calculators/atmakaraka",
        category: "calculators",
    },
    {
        id: "compatability",
        title: "Zodiac",
        desc: "COMPATABILITY",
        icon: Sun,
        color: "orange",
        href: "/calculators/zodiac-compatibility",
        category: "compatibility",
    },
    {
        id: "chat-expert",
        title: "Chat with Astro",
        desc: "FIRST FREE",
        icon: MessageCircle,
        badge: "LIVE",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
        color: "blue",
        href: "/explore",
        category: "consultation",
    },
    {
        id: "call-expert",
        title: "Call Astrologer",
        desc: "CONNECT NOW",
        icon: Phone,
        badge: "LIVE",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
        color: "emerald",
        href: "/explore",
        category: "consultation",
    }
];

const CATEGORIES = [
    { id: "all", label: "All (29)" },
    { id: "consultation", label: "Chat & Call" },
    { id: "charts", label: "Kundli & Charts" },
    { id: "muhurat", label: "Muhurat & Timing" },
    { id: "calculators", label: "Calculators" },
    { id: "compatibility", label: "Compatibility" },
    { id: "doshas", label: "Doshas & Cycles" },
    { id: "spiritual", label: "Pooja & Wisdom" },
];

const COLOR_MAP = {
    amber: "from-amber-500/20 to-yellow-500/20 border-amber-400/30 text-amber-300",
    orange: "from-orange-500/20 to-amber-500/20 border-orange-400/30 text-orange-300",
    red: "from-red-500/20 to-rose-500/20 border-red-400/30 text-red-300",
    rose: "from-rose-500/20 to-pink-500/20 border-rose-400/30 text-rose-300",
    pink: "from-pink-500/20 to-rose-500/20 border-pink-400/30 text-pink-300",
    purple: "from-purple-500/20 to-violet-500/20 border-purple-400/30 text-purple-300",
    indigo: "from-indigo-500/20 to-blue-500/20 border-indigo-400/30 text-indigo-300",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300",
    emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-400/30 text-emerald-300",
};

export default function ServicesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const filteredServices = ALL_SERVICES.filter(service => {
        const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              service.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleServiceClick = (service) => {
        router.push(service.href);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-24 overflow-x-hidden">
            {/* Header Section */}
            <div className="pt-2 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                            Explore Services
                        </h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">
                            Ancient wisdom meets modern technology.
                        </p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-400" /> 27+ Native Services
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services (Arudha Lagna, Kundli, Dosha...)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all font-medium"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
                {CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                                isSelected 
                                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] border border-violet-400/40" 
                                    : "bg-white/[0.04] text-slate-400 border border-white/10 hover:border-white/20 hover:text-slate-200"
                            }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* 3-Column Services Grid (Exact layout & cards from website) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
                <AnimatePresence mode="popLayout">
                    {filteredServices.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-3 text-center py-12 text-slate-400"
                        >
                            <p className="text-sm font-medium">No services match &quot;{searchQuery}&quot;</p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                                className="mt-2 text-xs text-violet-400 underline font-semibold"
                            >
                                Clear filters
                            </button>
                        </motion.div>
                    ) : (
                        filteredServices.map((service, index) => {
                            const IconComponent = service.icon;
                            const colorClass = COLOR_MAP[service.color] || COLOR_MAP.purple;

                            return (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.3) }}
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => handleServiceClick(service)}
                                    className={`rounded-[22px] p-3 flex flex-col items-center justify-between min-h-[120px] text-center cursor-pointer select-none relative overflow-hidden backdrop-blur-2xl bg-white/[0.05] border shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:border-violet-400/40 active:border-amber-400/50 group transition-all ${
                                        service.blink 
                                            ? "border-orange-500/40 shadow-[0_8px_25px_rgba(249,115,22,0.18)]" 
                                            : "border-white/10"
                                    }`}
                                >
                                    {/* Top specular rim light */}
                                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                                    {/* Top Badge (if present) */}
                                    <div className="w-full flex justify-end h-4">
                                        {service.badge && (
                                            <span className={`inline-flex items-center gap-1 text-[7px] font-black px-1.5 py-0.5 rounded-full border ${service.badgeColor} uppercase tracking-wider leading-none shadow-sm ${service.blink ? 'animate-pulse' : ''}`}>
                                                {service.blink && (
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                                                    </span>
                                                )}
                                                {service.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Centered Icon */}
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorClass} border backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform my-1`}>
                                        <IconComponent size={20} />
                                    </div>

                                    {/* Titles */}
                                    <div className="w-full mt-1">
                                        <h3 className="text-[11px] font-extrabold text-white tracking-tight truncate leading-tight group-hover:text-amber-300 transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase truncate mt-0.5">
                                            {service.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
