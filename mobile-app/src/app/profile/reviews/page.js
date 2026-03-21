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
        <div className="min-h-screen bg-cosmic-indigo pb-20 p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 text-white">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-white uppercase tracking-widest">My Reviews</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-t-electric-violet border-white/10 animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20">
                    <Star size={48} className="text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews yet</p>
                    <p className="text-[10px] text-slate-500 mt-2">Feedback from your seekers will appear here.</p>
                </div>
            ) : (
                <>
                    {/* Rating Summary Card */}
                    <CosmicCard className="p-6 mb-8 border-white/10 bg-white/5">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex-1 space-y-2">
                                {stats.distribution.map((item) => (
                                    <div key={item.stars} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 w-4">{item.stars}★</span>
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percentage}%` }}
                                                className="h-full bg-electric-violet"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 w-8">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-black text-white mb-2">{stats.average}</div>
                                <div className="flex justify-center gap-0.5 text-solar-gold mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.floor(stats.average) ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{stats.total} Reviews</p>
                            </div>
                        </div>
                    </CosmicCard>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedReview(review)}
                                className="glass-panel p-4 rounded-2xl border-white/5 flex gap-4 cursor-pointer active:scale-[0.98] transition-all"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                    {review.userId?.profileImage ? (
                                        <img src={review.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-white font-bold text-sm">
                                            {review.isAnonymous ? "Secret Seeker" : (review.userId?.name || "Anonymous User")}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5 text-solar-gold mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{review.comment}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Review Detail Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReview(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm glass-panel bg-cosmic-indigo border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <button 
                                    onClick={() => setSelectedReview(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="flex flex-col items-center text-center pt-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-electric-violet to-solar-gold p-[2px] mb-4">
                                        <div className="w-full h-full rounded-full bg-cosmic-indigo flex items-center justify-center overflow-hidden">
                                            {selectedReview.userId?.profileImage ? (
                                                <img src={selectedReview.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={32} className="text-slate-500" />
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-bold text-white mb-1">
                                        {selectedReview.isAnonymous ? "Secret Seeker" : (selectedReview.userId?.name || "Anonymous User")}
                                    </h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                                        Published {new Date(selectedReview.createdAt).toLocaleDateString()}
                                    </p>

                                    <div className="flex gap-1 text-solar-gold mb-8">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={18} fill={i < selectedReview.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                                        ))}
                                    </div>

                                    <div className="relative w-full">
                                        <Quote size={40} className="absolute -top-6 -left-2 text-white/5 rotate-180" />
                                        <p className="text-slate-200 text-sm leading-relaxed relative z-10 italic">
                                            "{selectedReview.comment}"
                                        </p>
                                        <Quote size={40} className="absolute -bottom-6 -right-2 text-white/5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 p-6 flex justify-center border-t border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                    Reviews cannot be edited or deleted by service providers
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
