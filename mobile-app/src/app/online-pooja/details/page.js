"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles, Phone, MessageCircle, Calendar, ShieldCheck, CheckCircle2, ChevronRight, Info, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import CosmicCard from "@/components/CosmicCard";
import CosmicLoader from "@/components/CosmicLoader";
import { getImageUrl } from "@/lib/utils";

function PoojaDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");
    
    const [temple, setTemple] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(null);

    useEffect(() => {
        setCurrentTime(new Date());
    }, []);

        


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
        <div className="min-h-screen text-slate-100 pb-20 overflow-x-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#050716] via-[#050716]/50 to-transparent" />
                
                <button 
                    onClick={() => router.back()}
                    className="absolute top-[calc(var(--safe-area-inset-top)+0.75rem)] left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white z-20 active:scale-90 transition-all shadow-lg"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <button 
                    onClick={() => {
                        const shareDomain = 'https://way2astro.com';
                        const url = `${shareDomain}/online-pooja/details/${temple.slug}/`;
                        const text = `Check out this Online Pooja: ${temple.name} at Way2Astro\n\n${url}`;
                        if (navigator.share) {
                            navigator.share({
                                title: temple.name,
                                text: text,
                                url: url
                            }).catch(console.error);
                        } else {
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                        }
                    }}
                    className="absolute top-[calc(var(--safe-area-inset-top)+0.75rem)] right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white z-20 active:scale-90 transition-all shadow-lg"
                    aria-label="Share"
                >
                    <Share2 size={16} />
                </button>
            </div>

            <div className="px-5 -mt-10 relative z-10 space-y-7">
                {/* Title Card */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-solar-gold/15 border border-solar-gold/30 text-[9px] font-black text-solar-gold uppercase tracking-[0.2em] backdrop-blur-md">
                        <Sparkles size={11} />
                        Sacred Temple
                    </div>
                    <h1 className="text-2xl font-black text-white leading-tight tracking-tight">{temple.name}</h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <MapPin size={13} className="text-orange-400 shrink-0" />
                            <span className="font-medium tracking-wide">{temple.location || "Various Locations"}</span>
                        </div>
                        {temple.sevas && temple.sevas.length > 0 && temple.sevas.every(seva => currentTime && seva.registrationEndDate && currentTime > new Date(seva.registrationEndDate)) ? (
                            <div className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                                Closed
                            </div>
                        ) : (
                            <button 
                                onClick={() => {
                                    document.getElementById('sevas-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-gold to-amber-500 text-black text-[11px] font-black uppercase tracking-wider shadow-lg shadow-solar-gold/20 active:scale-95 transition-all"
                            >
                                Book Seva
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                    {[
                        { label: "Trust Score", val: "99%", icon: ShieldCheck, color: "text-emerald-400" },
                        { label: "Bookings", val: "5000+", icon: CheckCircle2, color: "text-blue-400" },
                        { label: "Process", val: "Digital", icon: Sparkles, color: "text-solar-gold" }
                    ].map((item, idx) => (
                        <div key={idx} className="rounded-2xl p-3 text-center border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-sm">
                            <item.icon size={16} className={`mx-auto mb-1.5 ${item.color}`} />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                            <p className="text-xs font-black text-white mt-0.5">{item.val}</p>
                        </div>
                    ))}
                </div>

                {/* Description */}
                <section className="space-y-3">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info size={13} className="text-electric-violet" />
                        About Seva
                    </h2>
                    <div className="bg-white/[0.03] rounded-[24px] p-5 border border-white/10 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                        <div 
                            className="text-slate-300 text-xs sm:text-sm leading-[1.8] space-y-3"
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
                <section id="sevas-section" className="space-y-3.5 pb-10">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar size={13} className="text-electric-violet" />
                        Available Poojas
                    </h2>
                    
                    <div className="space-y-3">
                        {temple.sevas && temple.sevas.length > 0 ? (
                            temple.sevas.map((seva, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-5 rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                                >
                                    <div className="flex justify-between items-start gap-4 mb-2.5">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-base leading-tight mb-1.5">{seva.name}</h3>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{seva.description || "Sacred rituals for spiritual fulfillment."}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-lg font-black text-white">₹{seva.price}</span>
                                            {seva.originalPrice && (
                                                <span className="text-[11px] text-slate-500 line-through">₹{seva.originalPrice}</span>
                                            )}
                                        </div>
                                        {currentTime && seva.registrationEndDate && currentTime > new Date(seva.registrationEndDate) ? (
                                            <div className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                                                Closed
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleBooking(seva)}
                                                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-solar-gold to-amber-500 text-black text-[11px] font-black uppercase tracking-wider shadow-lg shadow-solar-gold/20 active:scale-95 transition-all"
                                            >
                                                Book Now
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10 rounded-[24px] bg-white/[0.02] border border-dashed border-white/10">
                                <p className="text-xs text-slate-500 italic">No specific bookings currently open.</p>
                            </div>
                        )}
                    </div>
                </section>
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
