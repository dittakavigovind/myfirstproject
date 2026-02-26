"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import { API_BASE } from '@/lib/urlHelper';

export default function SinglePostPageWrapper() {
    return (
        <Suspense fallback={<div className="p-20 text-center animate-pulse">Loading Article...</div>}>
            <SinglePostPage />
        </Suspense>
    );
}

function SinglePostPage() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPost = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }
            try {
                // In production, ensure this points to the correct backend API URL if not proxied
                const res = await fetch(`${API_BASE}/blog/posts/${slug}`, {
                    cache: 'no-store',
                });
                if (res.ok) {
                    const data = await res.json();
                    setPost(data.data);
                } else {
                    setPost(null);
                }
            } catch (error) {
                console.error("Failed to fetch post:", error);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };
        getPost();
    }, [slug]);

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Article...</div>;
    if (!post) return <div className="p-20 text-center font-bold text-slate-500">Article Not Found</div>;

    return <BlogPostClient post={post} />;
}
