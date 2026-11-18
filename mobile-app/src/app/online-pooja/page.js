"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import CosmicCard from "@/components/CosmicCard";
import CosmicLoader from "@/components/CosmicLoader";
import { getImageUrl } from "@/lib/utils";

function OnlinePoojaContent() {
    const router = useRouter();
    const [temples, setTemples] = useState([]);
    const [loading, setLoading] = useState(true);

    


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
        <div className="min-h-screen text-slate-100 pb-28 pt-safe overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#050716]/80 backdrop-blur-2xl px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white leading-none tracking-tight">Online Seva</h1>
                    <p className="text-[10px] text-solar-gold font-bold uppercase tracking-widest mt-1">Book Sacred Rituals</p>
                </div>
            </div>

            <div className="px-4 py-5 space-y-6">
                {/* Temples List */}
                <div className="grid grid-cols-2 gap-3.5">
                    {temples.length > 0 ? (
                        temples.map((temple, idx) => {
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
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => router.push(`/online-pooja/details?slug=${temple.slug}`)}
                                    className="group relative overflow-hidden rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all active:scale-[0.98] cursor-pointer flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img
                                            src={getImageUrl(temple.images?.[0] || temple.coverImage || temple.profileImage)}
                                            alt={temple.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/placeholder-temple.jpg";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050716] via-transparent to-black/20" />

                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[8px] font-bold text-solar-gold uppercase tracking-wider self-start shadow-sm">
                                                Verified
                                            </div>
                                            {nearestDate && (
                                                <div className="px-2 py-0.5 rounded-full bg-rose-500/80 backdrop-blur-md border border-rose-500/30 text-[8px] font-bold text-white uppercase tracking-wider self-start flex items-center gap-1 shadow-sm">
                                                    Closes {nearestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3.5 flex flex-col flex-grow">
                                        <div className="mb-2 flex flex-col flex-grow">
                                            <div className="flex items-center gap-1 text-solar-gold mb-1">
                                                <Sparkles size={10} className="fill-solar-gold/20" />
                                                <span className="text-[8px] font-black uppercase tracking-[0.15em]">Sacred Seva</span>
                                            </div>
                                            <h3 className="text-xs font-black text-white group-hover:text-electric-violet transition-colors leading-snug line-clamp-2">
                                                {temple.name}
                                            </h3>

                                            <div className="flex items-center gap-1 text-slate-400 text-[9px] mt-1.5 font-bold uppercase tracking-wider truncate">
                                                <MapPin size={10} className="text-orange-400 flex-shrink-0" />
                                                <span className="truncate">{temple.location || "Sacred Temple"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between pt-2.5 border-t border-white/5 mt-auto">
                                            <div>
                                                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Starting</p>
                                                <p className="text-sm font-black text-white">₹{temple.sevas?.[0]?.price || "501"}</p>
                                            </div>
                                            <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 group-hover:bg-electric-violet group-hover:text-white transition-all shadow-sm">
                                                <ChevronRight size={13} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-24 col-span-2">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500 border border-white/10">
                                <Info size={30} />
                            </div>
                            <h3 className="text-base font-bold text-white">Coming Soon</h3>
                            <p className="text-xs text-slate-400 mt-1 px-8">We are actively onboarding consecrated temples.</p>
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
