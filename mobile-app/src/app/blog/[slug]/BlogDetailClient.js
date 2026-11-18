"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { cleanBlogContent } from "@/lib/blogHelper";
import ToTopButton from "@/components/ToTopButton";

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

    const handleShare = () => {
        if (!blog) return;
        const shareDomain = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://way2astro.com';
        const blogSlug = blog.slug || slug || '';
        const shareUrl = `${shareDomain.replace(/\/+$/, '')}/blog/article/${blogSlug}`;
        const shareText = `Read this wisdom on Way2Astro: ${blog.title}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;

        if (navigator.share) {
            navigator.share({
                title: blog.title,
                text: shareText,
                url: shareUrl
            }).catch((err) => {
                if (err && err.name !== 'AbortError') {
                    window.open(whatsappUrl, '_blank');
                }
            });
        } else {
            window.open(whatsappUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-electric-violet animate-spin" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-center text-slate-500 mx-auto mb-4">
                    <Sparkles size={36} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Blog Post Not Found</h2>
                <button onClick={() => router.back()} className="px-6 py-3 rounded-full bg-gradient-to-r from-solar-gold to-amber-500 text-black font-black text-xs uppercase tracking-widest shadow-lg">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-500 px-4 pt-safe">
            {/* Header */}
            <div className="relative h-64 sm:h-72 w-full rounded-[28px] overflow-hidden mb-5 shadow-2xl border border-white/10 mt-3">
                {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#12163b] to-[#07091a]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050716] via-transparent to-black/30" />
                
                <button 
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/15 flex items-center justify-center active:scale-90 transition-all z-20 shadow-lg"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>

                <button 
                    onClick={handleShare}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/15 flex items-center justify-center active:scale-90 transition-all z-20 shadow-lg"
                    aria-label="Share"
                >
                    <Share2 size={16} />
                </button>
            </div>

            {/* Content Container */}
            <div className="space-y-4 px-1">
                {/* Category & Date */}
                <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-black text-solar-gold bg-solar-gold/15 border border-solar-gold/30 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
                        {blog.categories?.[0]?.name || "Astrology"}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={12} className="opacity-70" />
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </div>

                <h1 className="text-2xl font-black text-white leading-tight tracking-tight mb-4">{blog.title}</h1>

                {/* Author Info */}
                <div className="flex items-center gap-3 p-3.5 rounded-[20px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-electric-violet/15 border border-electric-violet/25 flex items-center justify-center text-electric-violet">
                        <User size={18} />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Author</p>
                        <p className="text-sm font-bold text-white leading-none">{blog.author?.name || "Way2Astro Team"}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div 
                    className="blog-content-rendered text-slate-200 leading-relaxed space-y-4 pt-1"
                    dangerouslySetInnerHTML={{ __html: cleanBlogContent(blog.content) }}
                />
            </div>
            <ToTopButton bottomClass="bottom-24" />
        </div>
    );
}

