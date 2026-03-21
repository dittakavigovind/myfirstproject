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

    const getImageUrl = (path) => {
        if (!path) return "/placeholder-temple.jpg";
        if (path.startsWith("http")) return path;
        return `http://192.168.29.133:5000${path.startsWith("/") ? "" : "/"}${path}`;
    };

    useEffect(() => {
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            const response = await api.get("/pooja/temples");
            if (response.data && response.data.success) {
                setTemples(response.data.data);
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
                <div className="grid gap-6">
                    {temples.length > 0 ? (
                        temples.map((temple, idx) => (
                            <motion.div
                                key={temple._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => router.push(`/online-pooja/details?slug=${temple.slug}`)}
                                className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-electric-violet/30 transition-all active:scale-[0.98] cursor-pointer"
                            >
                                <div className="aspect-[16/11] relative overflow-hidden">
                                    <img 
                                        src={getImageUrl(temple.images?.[0] || temple.coverImage || temple.profileImage)} 
                                        alt={temple.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder-temple.jpg";
                                        }}
                                    />
                                    {/* Subtler overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                                    
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-solar-gold uppercase tracking-widest">
                                        Verified
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-1.5 text-solar-gold mb-1">
                                            <Sparkles size={12} className="fill-solar-gold/20" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Divine Seva</span>
                                        </div>
                                        <h3 className="text-lg font-black text-white group-hover:text-electric-violet transition-colors leading-tight">
                                            {temple.name}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] mb-6 font-bold uppercase tracking-wider">
                                        <MapPin size={12} className="text-orange-400" />
                                        <span>{temple.location || "Various Locations"}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                        <div>
                                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Offerings from</p>
                                            <p className="text-xl font-black text-white">₹{temple.sevas?.[0]?.price || "501"}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-electric-violet/10 flex items-center justify-center text-electric-violet group-hover:bg-electric-violet group-hover:text-white transition-all shadow-lg shadow-electric-violet/5">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
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
