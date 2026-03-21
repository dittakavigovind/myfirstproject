"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Calendar, User, Share2, Sparkles } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";

function BlogDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");
    
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchBlog();
        }
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
        const shareText = `Read this wisdom on Way2Astro: ${blog.title}`;
        const shareUrl = window.location.href;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                text: shareText,
                url: shareUrl
            }).catch(() => window.open(whatsappUrl, '_blank'));
        } else {
            window.open(whatsappUrl, '_blank');
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
                <Sparkles size={48} className="text-slate-700 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Wisdom Not Found</h2>
                <p className="text-sm text-slate-500 mb-6">The stars haven't spoken this secret yet.</p>
                <button onClick={() => router.push('/blog')} className="px-6 py-2 rounded-xl glass-pill text-white font-bold text-xs uppercase tracking-widest">Back to Blogs</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 animate-in fade-in duration-500">
            {/* Header / Featured Image */}
            <div className="relative h-72 w-full overflow-hidden">
                {blog.featuredImage ? (
                    <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-cosmic-indigo flex items-center justify-center">
                        <Sparkles size={64} className="text-white/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cosmic-indigo via-cosmic-indigo/40 to-transparent" />
                
                <button 
                    onClick={() => router.back()}
                    className="absolute top-6 left-4 p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition-all z-20"
                >
                    <ArrowLeft size={20} />
                </button>

                <button 
                    onClick={handleShare}
                    className="absolute top-6 right-4 p-2.5 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition-all z-20"
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
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Written By</p>
                            <p className="text-sm font-bold text-white leading-none">{blog.author?.name || "Way2Astro Team"}</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div 
                        className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4 prose-headings:text-white prose-headings:font-black prose-a:text-electric-violet prose-img:rounded-3xl prose-strong:text-white blog-content-rendered"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </CosmicCard>
            </div>

            <style jsx global>{`
                .blog-content-rendered p { margin-bottom: 1.5rem; }
                .blog-content-rendered h2, .blog-content-rendered h3 { margin-top: 2rem; margin-bottom: 1rem; color: white; font-weight: 800; }
                .blog-content-rendered img { border-radius: 1.5rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
            `}</style>
        </div>
    );
}

export default function BlogDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-cosmic-indigo">
                <div className="w-8 h-8 rounded-full border-t-2 border-electric-violet animate-spin" />
            </div>
        }>
            <BlogDetailContent />
        </Suspense>
    );
}
