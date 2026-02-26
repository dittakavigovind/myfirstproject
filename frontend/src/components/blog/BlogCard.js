"use client";

import Link from 'next/link';
import { resolveImageUrl } from '@/lib/urlHelper';

export default function BlogCard({ post }) {
    return (
        <Link
            href={`/blog/category/article?category=${post.categories?.[0]?.slug || 'general'}&slug=${post.slug}`}
            className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 group h-full"
        >
            <div className="h-48 bg-gray-200 overflow-hidden relative">
                {post.featuredImage ? (
                    <img
                        src={resolveImageUrl(post.featuredImage)}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-sm">No Image</span>
                    </div>
                )}

                {/* Views Badge */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {post.views || 0}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                {post.categories?.[0] && (
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
                        {post.categories[0].name}
                    </span>
                )}

                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                    {post.title}
                </h2>

                <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                    {post.excerpt}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400 mt-auto uppercase tracking-wide">
                    <span>{post.author?.name || 'Admin'}</span>
                    <span>{(() => {
                        const d = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
                        const day = String(d.getDate()).padStart(2, '0');
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        return `${day}-${month}-${d.getFullYear()}`;
                    })()}</span>
                </div>
            </div>
        </Link>
    );
}
