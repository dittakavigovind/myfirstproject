"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles, Phone, MessageCircle, Calendar, ShieldCheck, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import CosmicCard from "@/components/CosmicCard";
import CosmicLoader from "@/components/CosmicLoader";

function PoojaDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");
    
    const [temple, setTemple] = useState(null);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (path) => {
        if (!path) return "/placeholder-temple.jpg";
        if (path.startsWith("http")) return path;
        // Use the base URL for images from api.js but for uploads
        return `http://192.168.29.133:5000${path.startsWith("/") ? "" : "/"}${path}`;
    };

    useEffect(() => {
        if (slug) fetchTempleDetails();
    }, [slug]);

    const fetchTempleDetails = async () => {
        try {
            const response = await api.get(`/pooja/temples/${slug}`);
            if (response.data && response.data.success) {
                setTemple(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch temple details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = (seva) => {
        const message = `Hello Way2Astro, I would like to book "${seva.name}" at "${temple.name}" for ₹${seva.price}. Please guide me with the process.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/918074902166?text=${encodedMessage}`, "_blank");
    };

    if (loading) return <CosmicLoader />;
    if (!temple) return <div className="min-h-screen bg-[#0b1026] flex items-center justify-center p-10 text-center"><p className="text-slate-400">Temple not found.</p></div>;

    const displayImage = temple.images?.[0] || temple.coverImage || temple.profileImage;

    return (
        <div className="min-h-screen bg-[#0b1026] text-slate-100 pb-32 overflow-x-hidden">
            {/* Immersive Header */}
            <div className="relative h-72 w-full overflow-hidden">
                <img 
                    src={getImageUrl(displayImage)} 
                    alt={temple.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-temple.jpg";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1026] via-[#0b1026]/40 to-[#0b1026]/10" />
                
                <button 
                    onClick={() => router.back()}
                    className="absolute top-[calc(var(--safe-area-inset-top)+1rem)] left-4 w-10 h-10 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white z-20 active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="px-6 -mt-10 relative z-10 space-y-8">
                {/* Title Card */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-gold/10 border border-solar-gold/20 text-[10px] font-black text-solar-gold uppercase tracking-[0.2em]">
                        <Sparkles size={12} />
                        Sacred Temple
                    </div>
                    <h1 className="text-2xl font-black text-white leading-tight">{temple.name}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <MapPin size={14} className="text-orange-400" />
                        <span className="font-medium tracking-wide">{temple.location || "Various Locations"}</span>
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Trust Score", val: "99%", icon: ShieldCheck, color: "text-emerald-400" },
                        { label: "Bookings", val: "5000+", icon: CheckCircle2, color: "text-blue-400" },
                        { label: "Process", val: "Digital", icon: Sparkles, color: "text-solar-gold" }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-panel rounded-2xl p-3 text-center border-white/5 bg-white/5 active:bg-white/10 transition-colors">
                            <item.icon size={16} className={`mx-auto mb-2 ${item.color}`} />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
                            <p className="text-xs font-black text-white mt-0.5">{item.val}</p>
                        </div>
                    ))}
                </div>

                {/* Description - Alignment refinements */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info size={14} className="text-electric-violet" />
                        About Seva
                    </h2>
                    <div className="bg-slate-900/30 rounded-3xl p-5 border border-white/5">
                        <div 
                            className="text-slate-300 text-sm leading-[1.8] space-y-4"
                            style={{ 
                                wordBreak: "break-word",
                                textAlign: "justify",
                                hyphens: "auto"
                            }}
                            dangerouslySetInnerHTML={{ __html: temple.description }} 
                        />
                    </div>
                </section>

                {/* Available Sevas List */}
                <section className="space-y-4 pb-10">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar size={14} className="text-electric-violet" />
                        Available Poojas
                    </h2>
                    
                    <div className="space-y-4">
                        {temple.sevas && temple.sevas.length > 0 ? (
                            temple.sevas.map((seva, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <CosmicCard 
                                        className="bg-white/5 border-white/10 hover:border-electric-violet/30 transition-all p-0 overflow-hidden"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-white text-base leading-tight mb-2">{seva.name}</h3>
                                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{seva.description || "Sacred rituals for spiritual fulfillment."}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black text-electric-violet">₹{seva.price}</span>
                                                    {seva.originalPrice && (
                                                        <span className="text-[10px] text-slate-500 line-through">₹{seva.originalPrice}</span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleBooking(seva)}
                                                    className="px-5 py-2.5 rounded-xl bg-electric-violet text-white text-[11px] font-black uppercase tracking-[0.1em] shadow-lg shadow-electric-violet/20 active:scale-95 transition-all"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </CosmicCard>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 glass-panel rounded-3xl border border-dashed border-white/10 opacity-60">
                                <p className="text-xs text-slate-500 italic">No specific bookings available.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Bottom Contact Sticky */}
             <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-[#0b1026] via-[#0b1026]/95 to-transparent pointer-events-none pb-[calc(var(--safe-area-inset-bottom)+1.5rem)]">
                <div className="flex gap-3 pointer-events-auto max-w-lg mx-auto">
                    <button 
                        onClick={() => window.open("tel:+918074902166", "_self")}
                        className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl glass-panel border-white/10 bg-white/5 text-white active:scale-95 transition-all text-sm font-bold shadow-xl backdrop-blur-xl"
                    >
                        <Phone size={18} className="text-blue-400" />
                        Enquire
                    </button>
                    <button 
                        onClick={() => window.open("https://wa.me/918074902166", "_blank")}
                        className="flex-[2] flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white active:scale-95 transition-all text-sm font-black uppercase tracking-wider shadow-xl shadow-emerald-500/20"
                    >
                        <MessageCircle size={18} />
                        WhatsApp Concierge
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PoojaDetailPage() {
    return (
        <Suspense fallback={<CosmicLoader />}>
            <PoojaDetailContent />
        </Suspense>
    );
}
