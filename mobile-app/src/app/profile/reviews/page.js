"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, User, X, Quote } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ReviewsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);

    const [stats, setStats] = useState({
        average: 0,
        total: 0,
        distribution: [
            { stars: 5, percentage: 0 },
            { stars: 4, percentage: 0 },
            { stars: 3, percentage: 0 },
            { stars: 2, percentage: 0 },
            { stars: 1, percentage: 0 },
        ]
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/reviews/me');
            if (data.success) {
                setReviews(data.data);
                calculateStats(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (reviewList) => {
        if (!reviewList || reviewList.length === 0) return;
        
        const total = reviewList.length;
        const sum = reviewList.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / total).toFixed(1);

        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewList.forEach(r => counts[r.rating]++);

        const dist = [5, 4, 3, 2, 1].map(s => ({
            stars: s,
            percentage: Math.round((counts[s] / total) * 100)
        }));

        setStats({ average: avg, total, distribution: dist });
    };

    return (
        <div className="min-h-screen pb-28 pt-safe px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pt-3">
                <button 
                    onClick={() => router.back()} 
                    className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-all text-white/80 hover:text-white backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Seeker Reviews</h1>
                    <p className="text-[10px] text-slate-400 font-medium">Ratings & Testimonials</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="w-10 h-10 rounded-full border-2 border-t-electric-violet border-white/10 animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center text-slate-500 mx-auto mb-4">
                        <Star size={36} />
                    </div>
                    <p className="text-base font-black text-white">No reviews yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">Feedback from your seekers will appear here.</p>
                </div>
            ) : (
                <>
                    {/* Rating Summary Card */}
                    <div className="p-6 mb-6 rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex-1 space-y-2">
                                {stats.distribution.map((item) => (
                                    <div key={item.stars} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 w-4">{item.stars}★</span>
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percentage}%` }}
                                                className="h-full bg-gradient-to-r from-solar-gold to-amber-500"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 w-8">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-black text-white mb-1.5 tracking-tight">{stats.average}</div>
                                <div className="flex justify-center gap-0.5 text-solar-gold mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={13} fill={i < Math.floor(stats.average) ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stats.total} Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => setSelectedReview(review)}
                                className="p-4 rounded-[22px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex gap-3.5 cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                            >
                                <div className="w-11 h-11 rounded-[16px] bg-electric-violet/15 border border-electric-violet/25 flex items-center justify-center shrink-0 overflow-hidden">
                                    {review.userId?.profileImage ? (
                                        <img src={review.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-black text-electric-violet">
                                            {(review.reviewerName || "U").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-white font-bold text-xs truncate">
                                            {review.reviewerName || "Anonymous Seeker"}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5 text-solar-gold mb-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={9} fill={i < review.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 font-normal">{review.comment}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Review Detail Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReview(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-[#0c102a]/95 backdrop-blur-3xl border border-white/15 rounded-[28px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-7">
                                <button 
                                    onClick={() => setSelectedReview(null)}
                                    className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white/70 hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex flex-col items-center text-center pt-2">
                                    <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-electric-violet to-solar-gold p-0.5 mb-3 shadow-lg">
                                        <div className="w-full h-full rounded-[20px] bg-[#0c102a] flex items-center justify-center overflow-hidden">
                                            {selectedReview.userId?.profileImage ? (
                                                <img src={selectedReview.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-black text-solar-gold">
                                                    {(selectedReview.reviewerName || "U").charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-base font-black text-white mb-0.5">
                                        {selectedReview.reviewerName || "Anonymous Seeker"}
                                    </h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                                        {new Date(selectedReview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>

                                    <div className="flex gap-1 text-solar-gold mb-5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={15} fill={i < selectedReview.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>

                                    <div className="relative w-full">
                                        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed relative z-10 italic bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                            "{selectedReview.comment}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 p-4 flex justify-center border-t border-white/5">
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                                    Verified consultation review
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
