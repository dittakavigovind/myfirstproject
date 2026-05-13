"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
    ChevronLeft, 
    Share2, 
    Star, 
    Users, 
    Clock, 
    MessageCircle, 
    Phone, 
    Heart, 
    Shield,
    X,
    Award
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import CosmicLoader from "@/components/CosmicLoader";
import { useConsultation } from "@/hooks/useConsultation";

export default function AstrologerProfileClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id");
    const { user } = useAuth();
    const { startChat, startCall, loading: initiating, error: consultError } = useConsultation();
    const { scrollY } = useScroll();

    // Scroll logic same as Home ModernHeader
    const headerBg = useTransform(
        scrollY,
        [0, 50],
        ["rgba(6, 10, 26, 0)", "rgba(6, 10, 26, 0.9)"]
    );
    const headerBlur = useTransform(
        scrollY,
        [0, 50],
        ["blur(0px)", "blur(12px)"]
    );

    const [astrologer, setAstrologer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (user?.role === 'astrologer') {
            router.replace("/");
            return;
        }
        if (astrologerId) {
            fetchAstrologer();
        }
    }, [astrologerId, user]);

    const fetchAstrologer = async () => {
        try {
            const { data } = await api.get(`/astro/astrologers/${astrologerId}`);
            setAstrologer(data.data);
        } catch (error) {
            console.error("Failed to fetch astrologer", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
      if (!astrologer) return;
      const shareText = `Check out ${astrologer.displayName || astrologer.name} on Way2Astro!`;
      const shareUrl = window.location.href;
      
      // WhatsApp Direct share earlier its like that
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      
      if (navigator.share) {
          navigator.share({
            title: astrologer.displayName,
            text: shareText,
            url: shareUrl
          }).catch(err => {
              // Fallback to WhatsApp if share fails or cancelled
              window.open(whatsappUrl, '_blank');
          });
      } else {
          window.open(whatsappUrl, '_blank');
      }
    };

    const getImageUrl = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        if (path.startsWith("http")) return path;
        return `http://192.168.29.133:5000${path.startsWith("/") ? "" : "/"}${path}`;
    };

    if (loading) return <CosmicLoader />;
    if (!astrologer) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Astrologer not found</div>;

    const rating = parseFloat(astrologer.rating) || 4.9;
    
    // Use actual gallery if available, otherwise fallback to profile image
    const galleryImages = (astrologer.gallery && astrologer.gallery.length > 0) 
        ? astrologer.gallery 
        : [astrologer.image || astrologer.profileImage];

    return (
        <div className="min-h-screen pb-40 animate-in fade-in duration-700 bg-[#0b1026] text-white">
            
            {/* Image Modal Popup */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md"
                    >
                        <button className="absolute top-10 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                            <X size={28} />
                        </button>
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={getImageUrl(selectedImage)} 
                            className="max-w-full max-h-[85vh] rounded-[2.5rem] object-contain shadow-2xl shadow-electric-violet/30" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Banner for Consultation */}
            {consultError && (
                <div 
                    className="fixed left-4 right-4 z-[100] bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-200 px-5 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl animate-in slide-in-from-top duration-300"
                    style={{ top: 'calc(var(--safe-area-inset-top) + 4.5rem)' }}
                >
                    <MessageCircle size={20} className="text-rose-500" />
                    <span className="text-sm font-black tracking-tight">{consultError}</span>
                </div>
            )}

            {/* Top Navigation - Seamless & Dynamic sticky */}
            <motion.header 
                className="fixed top-0 left-0 right-0 z-[60] px-4 flex items-center justify-between"
                style={{ 
                    background: headerBg, 
                    backdropFilter: headerBlur,
                    paddingTop: 'calc(var(--safe-area-inset-top) + 0.75rem)',
                    paddingBottom: '0.75rem'
                }}
            >
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/40 backdrop-blur-xl border border-white/10 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <span className="text-white font-black text-lg tracking-tight">Astrologer Profile</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={handleShare}
                      className="h-10 px-4 rounded-full flex items-center gap-2 bg-solar-gold/10 text-solar-gold border border-solar-gold/20 font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all shadow-lg"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            </motion.header>

            {/* Content Container - Tightened Paddings */}
            <div className="px-5" style={{ paddingTop: 'calc(var(--safe-area-inset-top) + 4.2rem)' }}>
                
                {/* Identity Section - Ultra Compact */}
                <div className="flex gap-5 items-start mb-6">
                    <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-electric-violet to-solar-gold p-0.5 shadow-xl shadow-electric-violet/20">
                            <div className="w-full h-full rounded-full bg-[#0b1026] overflow-hidden border-2 border-[#0b1026]">
                                <img 
                                    src={getImageUrl(astrologer.image || astrologer.profileImage)} 
                                    alt={astrologer.displayName} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                    }}
                                />
                            </div>
                        </div>
                        <div className={`absolute bottom-2 right-0 w-5 h-5 rounded-full border-4 border-[#0b1026] shadow-lg ${astrologer.isChatOnline || astrologer.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl font-black text-white leading-tight break-words pr-2">{astrologer.displayName || astrologer.name}</h1>
                            <button className="bg-solar-gold text-[#0b1026] text-[10px] font-black px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-lg shadow-solar-gold/20 flex-shrink-0 uppercase">FOLLOW</button>
                        </div>
                        <div className="text-[11px] space-y-1 mb-3 min-w-0">
                            <p className="font-black text-electric-violet leading-tight tracking-wider uppercase">
                                {Array.isArray(astrologer.skills) ? astrologer.skills.join(", ") : (astrologer.skills || "Vedic")}
                            </p>
                            <p className="text-slate-400 leading-tight font-medium">
                                {Array.isArray(astrologer.languages) ? astrologer.languages.join(", ") : "English, Hindi, Telugu"}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < Math.floor(rating) ? "text-solar-gold fill-solar-gold" : "text-slate-800"} />
                                ))}
                            </div>
                            <div className="flex items-baseline gap-2 ml-auto">
                                <span className="text-lg font-black text-rose-500">₹{astrologer.charges?.chatPerMinute || 25}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/min</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Summary - Seamless Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="glass-panel rounded-3xl p-4 border border-white/5 flex items-center gap-4 bg-white/5">
                        <div className="w-10 h-10 rounded-2xl bg-electric-violet/10 flex items-center justify-center text-electric-violet">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white leading-none mb-1">10k+</p>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-black">Consultations</p>
                        </div>
                    </div>
                    <div className="glass-panel rounded-3xl p-4 border border-white/5 flex items-center gap-4 bg-white/5">
                        <div className="w-10 h-10 rounded-2xl bg-solar-gold/10 flex items-center justify-center text-solar-gold">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-white leading-none mb-1">100k+</p>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-black">Mins Guided</p>
                        </div>
                    </div>
                </div>

                {/* Bio / Description */}
                <div className="mb-8">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Award size={14} className="text-solar-gold" />
                        Cosmic Bio
                    </h3>
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                        <p className="text-sm text-slate-300 leading-relaxed italic opacity-90">
                            "{astrologer.bio || `${astrologer.displayName} is a famous cosmic guide with deep expertise in planetary movements and sacred remedies.`}"
                        </p>
                    </div>
                </div>

                {/* Gallery - Horizontal List if exists */}
                {galleryImages.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pl-1">
                            <Users size={14} className="text-blue-400" />
                            Sacred Gallery
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x no-scrollbar -mx-5 px-5">
                            {galleryImages.map((img, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => setSelectedImage(img)}
                                  className="flex-shrink-0 w-48 aspect-[4/3] rounded-[2rem] glass-panel border border-white/10 overflow-hidden snap-start relative group active:scale-95 transition-all shadow-xl shadow-black/20"
                                >
                                   <img 
                                        src={getImageUrl(img)} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                        }}
                                   />
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                      <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">Visual Insight {i+1}</span>
                                   </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Reviews Section */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">User Reviews</h2>
                    <button className="text-[10px] text-slate-400 font-bold">View All</button>
                </div>

                <div className="space-y-3">
                    {[
                        { name: "Balaji", rating: 5, text: "Thank you so much I got clarity I'll follow your remedies" },
                        { name: "Krishna", rating: 5, text: "Excellent guidance." }
                    ].map((rev, i) => (
                        <div key={i} className="glass-panel rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-electric-violet/10 flex items-center justify-center text-electric-violet text-xs font-black">
                                        {rev.name[0]}
                                    </div>
                                    <span className="text-xs font-black text-white">{rev.name}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className="text-solar-gold fill-solar-gold" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight font-medium">{rev.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Floating Actions */}
            <div className="fixed bottom-[calc(var(--safe-area-inset-bottom)+5.5rem)] left-6 right-6 z-50 flex gap-4">
                <button 
                  disabled={initiating}
                  onClick={() => startChat(astrologer._id, astrologer.charges?.chatPerMinute || 25)}
                  className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                >
                    <MessageCircle size={20} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-400">Chat</span>
                </button>
                <button 
                  disabled={initiating}
                  onClick={() => startCall(astrologer._id, astrologer.charges?.chatPerMinute || 25)}
                  className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-3xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-black/40"
                >
                    <Phone size={20} className="text-green-500" />
                    <span className="text-sm font-black text-slate-200">Call</span>
                </button>
            </div>

            {/* Tailwind utility for hidden scrollbar */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
