"use client";

import { useEffect } from 'react';
import API from '@/lib/api';
import { resolveImageUrl } from '@/lib/urlHelper';
import SinglePostSidebar from '@/components/blog/SinglePostSidebar';
import FAQDisplay from '@/components/FAQDisplay';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { FaWhatsapp, FaTwitter, FaLinkedinIn, FaFacebookF, FaTumblr } from 'react-icons/fa';

export default function BlogPostClient({ post }) {
    useEffect(() => {
        if (post) {
            // Increment view count separately
            const viewKey = `viewed_post_${post._id}`;
            if (!sessionStorage.getItem(viewKey)) {
                API.post(`/blog/posts/view/${post._id}`)
                    .then(() => sessionStorage.setItem(viewKey, 'true'))
                    .catch(err => console.error("Error incrementing view:", err));
            }
        }
    }, [post]);

    if (!post) return <div className="p-20 text-center">Article Not Found</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Header Section (Simple White Header as per image, assuming Nav is global) */}

            <div className="max-w-7xl mx-auto px-4 pt-4 lg:pt-6 pb-8 lg:pb-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* LEFT COLUMN: Main Content */}
                    <div className="w-full lg:w-2/3">
                        {/* Breadcrumbs */}
                        <Breadcrumbs
                            items={[
                                { label: 'Blog', href: '/blog' },
                                { label: post.categories?.[0]?.name || 'Uncategorized', href: `/blog/category/?category=${post.categories?.[0]?.slug || ''}` },
                                { label: post.title }
                            ]}
                        />

                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-900/10 border border-slate-100">
                            {/* Title */}
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                                {post.title}
                            </h1>

                            {/* Featured Image */}
                            {post.featuredImage && (
                                <div className="rounded-[2rem] overflow-hidden shadow-lg mb-10 relative">
                                    <img
                                        src={resolveImageUrl(post.featuredImage)}
                                        alt={post.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}

                            {/* Social Share Buttons */}
                            <div className="flex gap-3 mb-10">
                                <button
                                    onClick={() => {
                                        const url = `https://way2astro.com/blog/category/article/?category=${post.categories?.[0]?.slug || ''}&slug=${post.slug}`;
                                        const text = `Check out this article: ${post.title}\n\n${url}`;
                                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                                    title="Share on WhatsApp"
                                >
                                    <FaWhatsapp size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = `https://way2astro.com/blog/category/article/?category=${post.categories?.[0]?.slug || ''}&slug=${post.slug}`;
                                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, '_blank');
                                    }}
                                    className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                                    title="Share on Twitter"
                                >
                                    <FaTwitter size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = `https://way2astro.com/blog/category/article/?category=${post.categories?.[0]?.slug || ''}&slug=${post.slug}`;
                                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                    className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                                    title="Share on LinkedIn"
                                >
                                    <FaLinkedinIn size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = `https://way2astro.com/blog/category/article/?category=${post.categories?.[0]?.slug || ''}&slug=${post.slug}`;
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                    className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                                    title="Share on Facebook"
                                >
                                    <FaFacebookF size={18} />
                                </button>
                            </div>

                            {/* Article Text */}
                            <article className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
                                <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
                            </article>
                        </div>

                        {/* FAQs */}
                        {post.faqs && post.faqs.length > 0 && (
                            <div className="mt-16">
                                <FAQDisplay faqs={post.faqs} />
                            </div>
                        )}
                    </div>


                    {/* RIGHT COLUMN: Sidebar */}
                    <aside className="w-full lg:w-1/3">
                        <SinglePostSidebar currentPostId={post._id} currentCategory={post.categories?.[0]} />
                    </aside>

                </div>
            </div>
        </div>
    );
}
