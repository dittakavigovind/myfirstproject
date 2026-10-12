"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CategoryRedirect() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const categoryQuery = searchParams.get('category');
    const pageQuery = searchParams.get('page');

    useEffect(() => {
        const params = new URLSearchParams();
        if (categoryQuery) params.set('category', categoryQuery);
        if (pageQuery) params.set('page', pageQuery);
        const qs = params.toString();
        router.replace(qs ? `/blog?${qs}` : '/blog');
    }, [categoryQuery, pageQuery, router]);

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Category...</p>
            </div>
        </div>
    );
}

export default function CategoryStatsWrapper() {
    return (
        <Suspense fallback={<div className="bg-slate-50 min-h-screen"></div>}>
            <CategoryRedirect />
        </Suspense>
    );
}
