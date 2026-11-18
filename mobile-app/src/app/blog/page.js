"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, BookOpen, Calendar, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import ToTopButton from "@/components/ToTopButton";
import { motion } from "framer-motion";

const POSTS_PER_PAGE = 9;

function getPageNumbers(current, total) {
    if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
        return [1, 2, 3, 4, '...', total];
    }
    if (current >= total - 2) {
        return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function BlogList() {
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchBlogs(1);
    }, []);

    const fetchBlogs = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/blog/posts?page=${pageNumber}&limit=${POSTS_PER_PAGE}`);
            if (data && data.success) {
                setBlogs(data.data || []);
                setTotal(data.total || (data.data ? data.data.length : 0));
                setTotalPages(data.pages || 1);
                setCurrentPage(pageNumber);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
        fetchBlogs(newPage);

        // Smoothly scroll back to top of main container or window
        const scrollContainer = document.getElementById("main-scroll-container");
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const startItem = total === 0 ? 0 : (currentPage - 1) * POSTS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * POSTS_PER_PAGE, total);

    return (
        <div className="min-h-screen pb-28 animate-in fade-in duration-500 pt-safe">
            {/* Header */}
            <div className="pt-3 px-4 flex items-center justify-between mb-5">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="text-right">
                    <h1 className="text-xl font-black text-white tracking-tight">Cosmic Wisdom</h1>
                    <p className="text-[10px] text-solar-gold font-bold uppercase tracking-widest mt-0.5">Vedic Articles</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center pt-24 gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-electric-violet animate-spin" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Unlocking Secrets...</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center pt-24 px-6">
                    <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center text-slate-500 mx-auto mb-4">
                        <BookOpen size={36} />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">The stars have no stories today.</p>
                </div>
            ) : (
                <>
                    {/* Articles Count Header */}
                    <div className="px-4 mb-4 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-solar-gold" />
                            Showing <strong className="text-white font-bold">{startItem}-{endItem}</strong> of <strong className="text-white font-bold">{total}</strong>
                        </span>
                        {totalPages > 1 && (
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-white/[0.06] border border-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                                Page {currentPage} of {totalPages}
                            </span>
                        )}
                    </div>

                    {/* Blog Cards List */}
                    <div className="px-4 space-y-4">
                        {blogs.map((blog, i) => (
                            <motion.div
                                key={blog._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.25) }}
                            >
                                <div 
                                    className="rounded-[26px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.35)] active:scale-[0.98]"
                                    onClick={() => router.push(`/blog/detail?slug=${blog.slug}`)}
                                >
                                    <div className="h-44 w-full bg-[#0c102a] relative overflow-hidden">
                                        {blog.featuredImage ? (
                                            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#12163b] to-[#07091a] flex items-center justify-center">
                                                <BookOpen size={30} className="text-white/20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050716] via-transparent to-black/20" />
                                        <div className="absolute top-3 left-3">
                                            <span className="text-[9px] font-black text-solar-gold bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {blog.categories?.[0]?.name || "Astrology"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4.5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mb-1.5">
                                                <Calendar size={11} className="opacity-70" />
                                                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-base font-black text-white mb-1.5 line-clamp-2 leading-snug">{blog.title}</h3>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">{blog.excerpt || "Explore the profound insights and celestial guidance curated for you."}</p>
                                        </div>
                                        <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center text-[10px] font-black text-solar-gold tracking-wider uppercase">
                                                Read Article <ChevronRight size={13} className="ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-4 mt-8 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl max-w-full overflow-x-auto no-scrollbar shadow-inner">
                                {/* Prev Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {/* Page Numbers */}
                                {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                                    if (p === '...') {
                                        return (
                                            <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-500 font-bold">
                                                …
                                            </span>
                                        );
                                    }
                                    const isActive = p === currentPage;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-solar-gold to-amber-500 text-black font-black shadow-md scale-105'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                                {/* Next Button */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Floating To Top Button */}
            <ToTopButton bottomClass="bottom-24" />
        </div>
    );
}

