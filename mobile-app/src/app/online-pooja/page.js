"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import CosmicCard from "@/components/CosmicCard";
import CosmicLoader from "@/components/CosmicLoader";

function OnlinePoojaContent() {
    const router = useRouter();
    const [temples, setTemples] = useState([]);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (path, gender = null) => {
        if (!path || path.includes('default-avatar.png')) {
            return gender === 'female' ? "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        }

        // If it's a full URL, ensure localhost is rewritten to the real network IP
        if (path.startsWith("http")) {
            return path.replace('localhost:5000', '192.168.29.133:5000');
        }

        const normalizedPath = path.replace(/\\/g, "/");
        return `http://192.168.29.133:5000${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    };


    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            const response = await api.get("/pooja/temples");
            if (response.data && response.data.success) {
                const now = new Date();

                const sortedTemples = response.data.data.sort((a, b) => {
                    const getNearestClosingDate = (temple) => {
                        if (!temple.sevas || !Array.isArray(temple.sevas) || temple.sevas.length === 0) return Infinity;

                        let nearest = Infinity;
                        for (const seva of temple.sevas) {
                            if (seva.registrationEndDate) {
                                const endDate = new Date(seva.registrationEndDate).getTime();
                                if (endDate > now.getTime() && endDate < nearest) {
                                    nearest = endDate;
                                }
                            }
                        }
                        return nearest;
                    };

                    const dateA = getNearestClosingDate(a);
                    const dateB = getNearestClosingDate(b);

                    if (dateA === dateB) {
                        return (a.name || "").localeCompare(b.name || "");
                    }

                    return dateA - dateB;
                });

                setTemples(sortedTemples);
            }
        } catch (error) {
            console.error("Failed to fetch temples:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CosmicLoader />;

    return (
        <div className="min-h-screen bg-[#0b1026] text-slate-100 pb-24 overflow-x-hidden">
            {/* Transparent Header */}
            <div className="sticky top-0 z-40 bg-transparent px-4 py-4 flex items-center gap-4 pt-[calc(var(--safe-area-inset-top)+1rem)]">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white leading-none tracking-tight">Online Seva</h1>
                    <p className="text-[10px] text-electric-violet font-bold uppercase tracking-widest mt-1">Book Sacred Pooja</p>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                {/* Intro Banner removed as per user request */}

                {/* Temples List */}
                <div className="grid grid-cols-2 gap-3">
                    {temples.length > 0 ? (
                        temples.map((temple, idx) => {
                            // Find the nearest closing date to optionally show it
                            let nearestDate = null;
                            if (temple.sevas && Array.isArray(temple.sevas)) {
                                const now = new Date();
                                const validDates = temple.sevas
                                    .filter(s => s.registrationEndDate && new Date(s.registrationEndDate) > now)
                                    .map(s => new Date(s.registrationEndDate).getTime());
                                if (validDates.length > 0) nearestDate = new Date(Math.min(...validDates));
                            }

                            return (
                                <motion.div
                                    key={temple._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => router.push(`/online-pooja/details?slug=${temple.slug}`)}
                                    className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-white/5 hover:border-electric-violet/30 transition-all active:scale-[0.98] cursor-pointer flex flex-col"
                                >
                                    <div className="aspect-square relative overflow-hidden">
                                        <img
                                            src={getImageUrl(temple.images?.[0] || temple.coverImage || temple.profileImage)}
                                            alt={temple.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/placeholder-temple.jpg";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-bold text-solar-gold uppercase tracking-widest self-start">
                                                Verified
                                            </div>
                                            {nearestDate && (
                                                <div className="px-2 py-0.5 rounded-full bg-red-500/80 backdrop-blur-md border border-red-500/20 text-[8px] font-bold text-white uppercase tracking-widest self-start flex items-center gap-1">
                                                    Closes {nearestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col flex-grow">
                                        <div className="mb-2 flex flex-col flex-grow">
                                            <div className="flex items-center gap-1 text-solar-gold mb-1">
                                                <Sparkles size={10} className="fill-solar-gold/20" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.15em]">Divine Seva</span>
                                            </div>
                                            <h3 className="text-xs font-black text-white group-hover:text-electric-violet transition-colors leading-snug line-clamp-2">
                                                {temple.name}
                                            </h3>

                                            <div className="flex items-center gap-1 text-slate-400 text-[9px] mt-1.5 font-bold uppercase tracking-wider truncate">
                                                <MapPin size={10} className="text-orange-400 flex-shrink-0" />
                                                <span className="truncate">{temple.location || "Various Locations"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between pt-2 border-t border-white/5 mt-auto">
                                            <div>
                                                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">From</p>
                                                <p className="text-sm font-black text-white">₹{temple.sevas?.[0]?.price || "501"}</p>
                                            </div>
                                            <div className="w-6 h-6 rounded-lg bg-electric-violet/10 flex items-center justify-center text-electric-violet group-hover:bg-electric-violet group-hover:text-white transition-all shadow-lg shadow-electric-violet/5">
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500">
                                <Info size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Coming Soon</h3>
                            <p className="text-sm text-slate-400 mt-2 px-10">We are currently onboarding sacred temples.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function OnlinePoojaPage() {
    return (
        <Suspense fallback={<CosmicLoader />}>
            <OnlinePoojaContent />
        </Suspense>
    );
}
