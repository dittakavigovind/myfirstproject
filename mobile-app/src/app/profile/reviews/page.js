"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, User, X, Quote, MessageSquare, Edit3, Send, CornerDownRight, CheckCircle2 } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ReviewsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isEditingReply, setIsEditingReply] = useState(false);

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

    const openReviewModal = (review) => {
        setSelectedReview(review);
        setIsEditingReply(false);
        setReplyText(review.reply?.comment || "");
    };

    const handleSendReply = async () => {
        if (!replyText || !replyText.trim()) {
            toast.error("Please enter a reply message");
            return;
        }
        setIsSubmittingReply(true);
        try {
            const { data } = await api.post(`/reviews/${selectedReview._id}/reply`, {
                comment: replyText.trim()
            });
            if (data.success) {
                toast.success("Reply posted successfully!");
                const updatedReply = data.data;
                setReviews(prev => prev.map(r => r._id === selectedReview._id ? { ...r, reply: updatedReply } : r));
                setSelectedReview(prev => ({ ...prev, reply: updatedReply }));
                setIsEditingReply(false);
            }
        } catch (err) {
            console.error("Error replying to review:", err);
            toast.error(err.response?.data?.message || "Failed to post reply");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleUpdateReply = async () => {
        if (!replyText || !replyText.trim()) {
            toast.error("Please enter your updated reply");
            return;
        }
        setIsSubmittingReply(true);
        try {
            const { data } = await api.put(`/reviews/${selectedReview._id}/reply`, {
                comment: replyText.trim()
            });
            if (data.success) {
                toast.success("Reply updated successfully!");
                const updatedReply = data.data;
                setReviews(prev => prev.map(r => r._id === selectedReview._id ? { ...r, reply: updatedReply } : r));
                setSelectedReview(prev => ({ ...prev, reply: updatedReply }));
                setIsEditingReply(false);
            }
        } catch (err) {
            console.error("Error updating reply:", err);
            toast.error(err.response?.data?.message || "Failed to update reply");
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 pt-safe px-3.5 no-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3.5 pt-2">
                <button 
                    onClick={() => router.back()} 
                    className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-all text-white/80 hover:text-white backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-lg font-black text-white tracking-tight">Seeker Reviews</h1>
                    <p className="text-[10px] text-slate-400 font-medium">Ratings & Testimonials</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-9 h-9 rounded-full border-2 border-t-electric-violet border-white/10 animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center text-slate-500 mx-auto mb-3">
                        <Star size={30} />
                    </div>
                    <p className="text-sm font-black text-white">No reviews yet</p>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-[220px] mx-auto">Feedback from your seekers will appear here.</p>
                </div>
            ) : (
                <>
                    {/* Rating Summary Card (Compact & Sleek) */}
                    <div className="p-3.5 mb-3 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                                {stats.distribution.map((item) => (
                                    <div key={item.stars} className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400 w-3.5">{item.stars}★</span>
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percentage}%` }}
                                                className="h-full bg-gradient-to-r from-solar-gold to-amber-500"
                                            />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 w-7 text-right">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center pl-3 border-l border-white/10 shrink-0 min-w-[76px]">
                                <div className="text-3xl font-black text-white tracking-tight leading-none mb-1">{stats.average}</div>
                                <div className="flex justify-center gap-0.5 text-solar-gold mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={11} fill={i < Math.floor(stats.average) ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{stats.total} Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List (Compact & Clean) */}
                    <div className="space-y-2.5">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => openReviewModal(review)}
                                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/10 flex gap-3 cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                            >
                                <div className="w-9 h-9 rounded-xl bg-electric-violet/15 border border-electric-violet/25 flex items-center justify-center shrink-0 overflow-hidden">
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
                                        <div>
                                            <h3 className="text-white font-bold text-xs truncate max-w-[150px]">
                                                {review.reviewerName || "Anonymous Seeker"}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="flex gap-0.5 text-solar-gold">
                                                    {[...Array(5)].map((_, idx) => (
                                                        <Star key={idx} size={8.5} fill={idx < review.rating ? "currentColor" : "none"} />
                                                    ))}
                                                </div>
                                                <span className="text-[9.5px] text-slate-500 font-medium">
                                                    • {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                        {!review.reply?.comment ? (
                                            <span className="text-[9px] font-bold text-electric-violet bg-electric-violet/15 px-2 py-0.5 rounded-full border border-electric-violet/30 flex items-center gap-1 shrink-0">
                                                <MessageSquare size={8} /> Reply
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 shrink-0">
                                                <CheckCircle2 size={8} /> Replied
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 mt-1">{review.comment}</p>

                                    {/* Astrologer Reply Preview */}
                                    {review.reply && review.reply.comment && (
                                        <div className="mt-2 pt-1.5 border-t border-white/5 pl-2 border-l-2 border-l-electric-violet/50 bg-white/[0.02] rounded-r-lg p-1.5">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[9px] font-black text-electric-violet flex items-center gap-1">
                                                    <CornerDownRight size={9} /> Your Response
                                                </span>
                                                {review.reply.isEdited && (
                                                    <span className="text-[8px] text-slate-400 font-medium italic">(Edited)</span>
                                                )}
                                            </div>
                                            <p className="text-slate-300 text-[10.5px] leading-snug line-clamp-1">{review.reply.comment}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Review Detail Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReview(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 15 }}
                            className="relative w-full max-w-sm max-h-[90vh] flex flex-col bg-[#0c102a]/95 backdrop-blur-3xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-5 overflow-y-auto no-scrollbar">
                                <button 
                                    onClick={() => setSelectedReview(null)}
                                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={15} />
                                </button>

                                <div className="flex flex-col items-center text-center pt-1">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-electric-violet to-solar-gold p-0.5 mb-2 shadow-lg">
                                        <div className="w-full h-full rounded-[10px] bg-[#0c102a] flex items-center justify-center overflow-hidden">
                                            {selectedReview.userId?.profileImage ? (
                                                <img src={selectedReview.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-base font-black text-solar-gold">
                                                    {(selectedReview.reviewerName || "U").charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-sm font-black text-white mb-0.5">
                                        {selectedReview.reviewerName || "Anonymous Seeker"}
                                    </h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                                        {new Date(selectedReview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>

                                    <div className="flex gap-1 text-solar-gold mb-2.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={13} fill={i < selectedReview.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>

                                    <div className="relative w-full">
                                        <p className="text-slate-200 text-xs leading-relaxed relative z-10 italic bg-white/[0.03] p-3 rounded-xl border border-white/5">
                                            "{selectedReview.comment}"
                                        </p>
                                    </div>

                                    {/* Astrologer Reply Section */}
                                    {!selectedReview.reply || !selectedReview.reply.comment ? (
                                        /* 1. Astrologer has not replied yet */
                                        <div className="w-full mt-3.5 pt-3 border-t border-white/10 text-left">
                                            <label className="text-[11px] font-bold text-white flex items-center gap-1.5 mb-1.5">
                                                <MessageSquare size={12} className="text-electric-violet" />
                                                Reply to Seeker
                                            </label>
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write your response to this review..."
                                                rows={3}
                                                maxLength={500}
                                                className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-violet/50 transition-all resize-none"
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[8.5px] text-slate-400 font-medium">
                                                    Can be modified once later
                                                </span>
                                                <button
                                                    onClick={handleSendReply}
                                                    disabled={isSubmittingReply || !replyText.trim()}
                                                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-electric-violet to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md"
                                                >
                                                    {isSubmittingReply ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send size={11} /> Send Reply
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : isEditingReply ? (
                                        /* 2. Astrologer is editing their reply (Allowed only once) */
                                        <div className="w-full mt-3.5 pt-3 border-t border-white/10 text-left">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[11px] font-bold text-solar-gold flex items-center gap-1.5">
                                                    <Edit3 size={12} /> Edit Your Response
                                                </label>
                                                <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                                    Final Edit
                                                </span>
                                            </div>
                                            <p className="text-[9.5px] text-slate-400 mb-2 font-medium">
                                                ⚠️ You can edit this reply only once. Make sure your response is complete before saving.
                                            </p>
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                rows={3}
                                                maxLength={500}
                                                className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-solar-gold/50 transition-all resize-none"
                                            />
                                            <div className="flex justify-between items-center mt-2.5">
                                                <button
                                                    onClick={() => {
                                                        setIsEditingReply(false);
                                                        setReplyText(selectedReview.reply.comment);
                                                    }}
                                                    disabled={isSubmittingReply}
                                                    className="px-3 py-1 rounded-full bg-white/[0.08] text-slate-300 text-xs font-bold active:scale-95 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateReply}
                                                    disabled={isSubmittingReply || !replyText.trim() || replyText.trim() === selectedReview.reply.comment}
                                                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-solar-gold to-amber-500 text-black text-xs font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md"
                                                >
                                                    {isSubmittingReply ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                    ) : (
                                                        "Save Changes"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* 3. Astrologer has replied (View Mode) */
                                        <div className="w-full mt-3.5 pt-3 border-t border-white/10 text-left">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-electric-violet flex items-center gap-1.5">
                                                    <CornerDownRight size={12} /> Your Response
                                                    {selectedReview.reply.isEdited && (
                                                        <span className="text-[8.5px] text-slate-400 font-medium italic">(Edited)</span>
                                                    )}
                                                </span>
                                                {selectedReview.reply.editCount === 0 ? (
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingReply(true);
                                                            setReplyText(selectedReview.reply.comment);
                                                        }}
                                                        className="px-2 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-[9.5px] font-bold text-white flex items-center gap-1 active:scale-95 transition-all"
                                                    >
                                                        <Edit3 size={9} /> Edit Reply
                                                    </button>
                                                ) : (
                                                    <span className="text-[8.5px] font-bold text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/10">
                                                        Finalized (1 edit used)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-200 text-xs leading-relaxed">
                                                {selectedReview.reply.comment}
                                            </div>
                                            {selectedReview.reply.editCount === 0 && (
                                                <p className="text-[9px] text-amber-400/80 mt-1.5 font-medium">
                                                    ℹ️ You can edit your response only once.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-white/5 p-3 flex justify-center border-t border-white/5 shrink-0">
                                <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider text-center">
                                    Verified consultation review
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hidden scrollbar styles */}
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
