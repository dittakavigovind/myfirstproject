"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";


export default function BlogDetail({ params }) {
    const { slug } = use(params);
    const router = useRouter();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlog();
    }, [slug]);

    const fetchBlog = async () => {
        try {
            const { data } = await api.get(`/blog/posts/${slug}`);
            if (data && data.success) {
                setBlog(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch blog", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-cosmic-indigo">
                <div className="w-8 h-8 rounded-full border-t-2 border-electric-violet animate-spin" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cosmic-indigo text-center">
                <h2 className="text-xl font-bold text-white mb-4">Blog Post Not Found</h2>
                <button onClick={() => router.back()} className="px-6 py-2 rounded-xl glass-pill text-white">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative h-72 w-full overflow-hidden">
                {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-cosmic-indigo" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cosmic-indigo via-cosmic-indigo/40 to-transparent" />
                
                <button 
                    onClick={() => router.back()}
                    className="absolute top-6 left-4 p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>

                <button 
                    className="absolute top-6 right-4 p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition-all"
                >
                    <Share2 size={20} />
                </button>
            </div>

            {/* Content Container */}
            <div className="px-4 -mt-20 relative z-10">
                <CosmicCard className="p-6 mb-6" noHover>
                    {/* Category & Date */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-black text-electric-violet bg-electric-violet/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            {blog.categories?.[0]?.name || "Astrology"}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            <Calendar size={12} />
                            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-white mb-6 leading-tight">{blog.title}</h1>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-8">
                        <div className="w-10 h-10 rounded-full bg-electric-violet/20 flex items-center justify-center text-electric-violet">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Written By</p>
                            <p className="text-sm font-bold text-white">{blog.author?.name || "Way2Astro Team"}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div 
                        className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4
                            prose-headings:text-white prose-headings:font-black prose-a:text-electric-violet
                            prose-img:rounded-3xl prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </CosmicCard>
            </div>
        </div>
    );
}

