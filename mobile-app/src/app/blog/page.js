"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, BookOpen, Calendar, ChevronRight } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import { motion } from "framer-motion";

export default function BlogList() {
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const { data } = await api.get("/blog/posts");
            if (data && data.success) {
                setBlogs(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="pt-6 px-4 flex items-center justify-between mb-8">
                <button 
                    onClick={() => router.back()}
                    className="p-2 bg-white/5 rounded-full text-slate-400 border border-white/5 active:scale-95 transition-all"
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
                <div className="text-center pt-20">
                    <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500">The stars have no stories today.</p>
                </div>
            ) : (
                <div className="px-4 space-y-6">
                    {blogs.map((blog, i) => (
                        <motion.div
                            key={blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
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
            )}
        </div>
    );
}
