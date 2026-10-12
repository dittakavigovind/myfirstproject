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
        <div className="min-h-screen pb-28 animate-in fade-in duration-500">
            {/* Header */}
            <div className="pt-6 px-4 flex items-center justify-between mb-6">
                <button 
                    onClick={() => router.back()}
                    className="p-2 bg-white/5 rounded-full text-slate-400 border border-white/5 active:scale-95 transition-all"
                    aria-label="Go back"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="text-right">
                    <h1 className="text-xl font-black text-white">Latest Wisdom</h1>
                    <p className="text-[10px] text-electric-violet font-bold uppercase tracking-widest mt-0.5">Cosmic Articles</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center pt-20 gap-4">
                    <div className="w-10 h-10 rounded-full border-t-2 border-electric-violet animate-spin" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Unlocking Secrets...</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center pt-20 px-6">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-400 font-medium">The stars have no stories today.</p>
                </div>
            ) : (
                <>
                    {/* Articles Count Header */}
                    <div className="px-4 mb-4 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-electric-violet" />
                            Showing <strong className="text-white font-bold">{startItem}-{endItem}</strong> of <strong className="text-white font-bold">{total}</strong>
                        </span>
                        {totalPages > 1 && (
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                Page {currentPage} of {totalPages}
                            </span>
                        )}
                    </div>

                    {/* Blog Cards List */}
                    <div className="px-4 space-y-6">
                        {blogs.map((blog, i) => (
                            <motion.div
                                key={blog._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                            >
                                <CosmicCard 
                                    className="p-0 overflow-hidden border-white/5 flex flex-col h-full transition-all duration-300"
                                    onClick={() => router.push(`/blog/detail?slug=${blog.slug}`)}
                                >
                                    <div className="h-44 w-full bg-slate-800 relative overflow-hidden">
                                        {blog.featuredImage ? (
                                            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-cosmic-indigo flex items-center justify-center">
                                                <BookOpen size={30} className="text-white/10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[9px] font-black text-electric-violet bg-electric-violet/10 px-2 py-0.5 rounded-full uppercase">
                                                    {blog.categories?.[0]?.name || "Astrology"}
                                                </span>
                                                <div className="flex items-center gap-1 text-slate-500 text-[9px] font-bold uppercase">
                                                    <Calendar size={10} />
                                                    {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                            <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug">{blog.title}</h3>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{blog.excerpt || "Explore the profound insights and celestial guidance curated for you."}</p>
                                        </div>
                                        <div className="flex items-center justify-end mt-4">
                                            <div className="flex items-center text-[10px] font-black text-white">
                                                READ POST <ChevronRight size={14} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </CosmicCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-4 mt-8 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-full overflow-x-auto no-scrollbar">
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
                                                    ? 'bg-electric-violet text-white shadow-md shadow-electric-violet/40 scale-105'
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

