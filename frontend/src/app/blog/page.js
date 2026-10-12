"use client";

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import API from '../../lib/api';
import BlogSidebar from '../../components/blog/BlogSidebar';
import BlogCard from '../../components/blog/BlogCard';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import HeroSection from '../../components/common/HeroSection';
import ToTopButton from '../../components/common/ToTopButton';
import { ChevronLeft, ChevronRight, Layers, RotateCcw, BookOpen } from 'lucide-react';

const POSTS_PER_PAGE = 9;

function getPageNumbers(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
        return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
}

function BlogListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryQuery = searchParams.get('category') || '';
    const pageQuery = parseInt(searchParams.get('page')) || 1;

    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(pageQuery);
    const [loading, setLoading] = useState(true);

    const scrollToContent = useCallback(() => {
        const el = document.getElementById('blog-content-top');
        if (el) {
            const offset = 140; // account for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = Math.max(0, elementPosition - offset);
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, []);

    // Fetch posts and categories
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    status: 'published',
                    limit: String(POSTS_PER_PAGE),
                    page: String(pageQuery)
                });
                if (categoryQuery) {
                    params.set('category', categoryQuery);
                }

                const [postRes, catRes] = await Promise.all([
                    API.get(`/blog/posts?${params.toString()}`),
                    API.get('/blog/categories')
                ]);

                if (!isMounted) return;

                const postData = postRes.data;
                setPosts(postData.data || []);
                setTotal(postData.total || 0);
                setTotalPages(postData.pages || 1);
                setCurrentPage(postData.page || pageQuery);
                setCategories(catRes.data.data || []);
            } catch (err) {
                console.error("Failed to fetch blog data:", err);
                if (isMounted) {
                    setPosts([]);
                    setTotal(0);
                    setTotalPages(1);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [categoryQuery, pageQuery]);

    // Handle Page Navigation
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
        const params = new URLSearchParams();
        if (categoryQuery) params.set('category', categoryQuery);
        if (newPage > 1) params.set('page', String(newPage));
        const qs = params.toString();
        router.push(qs ? `/blog?${qs}` : '/blog', { scroll: false });
        scrollToContent();
    };

    // Handle Category Filter Selection
    const handleSelectCategory = (slug) => {
        const params = new URLSearchParams();
        if (slug) {
            params.set('category', slug);
        }
        // Always reset to page 1 when selecting a category
        const qs = params.toString();
        router.push(qs ? `/blog?${qs}` : '/blog', { scroll: false });
        scrollToContent();
    };

    const currentCategoryObj = categories.find(c => c.slug === categoryQuery);
    const activeCategories = (categories || []).filter(cat => (cat.postCount ?? 0) > 0);
    const totalPublishedPosts = activeCategories.reduce((acc, cat) => acc + (cat.postCount || 0), 0);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <HeroSection
                title="Astrology"
                highlightText="Blog"
                subtitle="Explore our latest articles and updates on Vedic Astrology, Festivals, and Spirituality."
                icon="📝"
                align="center"
                extraPaddingBottom={true}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20 pb-8">
                {/* 2-Column Layout with items-start to allow the sidebar to stick/float */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Floating Categories Sidebar on Left */}
                    <BlogSidebar
                        categories={categories}
                        activeCategory={categoryQuery}
                        onSelectCategory={handleSelectCategory}
                    />

                    {/* Main Content Area */}
                    <main
                        id="blog-content-top"
                        className="w-full lg:flex-1 bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 shadow-xl md:shadow-2xl border border-slate-100"
                    >
                        {/* Breadcrumbs */}
                        <Breadcrumbs
                            items={[
                                { label: 'Blog', href: categoryQuery ? '/blog' : undefined },
                                ...(categoryQuery ? [{ label: currentCategoryObj?.name || 'Category' }] : [])
                            ]}
                        />

                        {/* Title and Filter Info */}
                        <div className="mb-6 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    {categoryQuery ? (
                                        <>
                                            <span className="text-orange-500">#</span>
                                            {currentCategoryObj?.name || 'Category'}
                                        </>
                                    ) : (
                                        'Latest Wisdom'
                                    )}
                                </h1>
                                <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                                    {categoryQuery ? (
                                        <>
                                            Showing articles filed under <span className="text-slate-800 font-bold">{currentCategoryObj?.name || categoryQuery}</span>
                                            {total > 0 && <span> ({total} total)</span>}
                                        </>
                                    ) : (
                                        <>Explore latest astrological insights, festive guides, and Vedic wisdom.</>
                                    )}
                                </p>
                            </div>

                            {categoryQuery && (
                                <button
                                    type="button"
                                    onClick={() => handleSelectCategory('')}
                                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-slate-200"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Clear Category Filter
                                </button>
                            )}
                        </div>

                        {/* Mobile Horizontal Quick-Filter Chips */}
                        <div className="lg:hidden mb-6 -mx-1 px-1">
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                                <button
                                    type="button"
                                    onClick={() => handleSelectCategory('')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                                        !categoryQuery
                                            ? 'bg-orange-500 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    All ({totalPublishedPosts})
                                </button>
                                {activeCategories.map(cat => {
                                    const isCurrent = categoryQuery === cat.slug;
                                    return (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => handleSelectCategory(cat.slug)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                                                isCurrent
                                                    ? 'bg-orange-500 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat.name} ({cat.postCount})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content States */}
                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                    <div key={i} className="bg-slate-100 h-96 rounded-2xl flex flex-col p-4 gap-3">
                                        <div className="h-44 bg-slate-200 rounded-xl"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {posts.length > 0 ? (
                                    <>
                                        {/* 3x3 Grid (9 posts) */}
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {posts.map(post => (
                                                <BlogCard key={post._id} post={post} />
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                {/* Counter Info */}
                                                <p className="text-xs sm:text-sm font-medium text-slate-500 order-2 sm:order-1">
                                                    Showing <span className="font-bold text-slate-800">{(currentPage - 1) * POSTS_PER_PAGE + 1}</span> to{' '}
                                                    <span className="font-bold text-slate-800">{Math.min(currentPage * POSTS_PER_PAGE, total)}</span> of{' '}
                                                    <span className="font-bold text-slate-800">{total}</span> articles
                                                </p>

                                                {/* Page Buttons */}
                                                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                                                    {/* Prev Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage <= 1}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                                            currentPage <= 1
                                                                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                                                                : 'text-slate-700 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 shadow-sm active:scale-95'
                                                        }`}
                                                        aria-label="Previous Page"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Prev</span>
                                                    </button>

                                                    {/* Page Numbers */}
                                                    {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                                                        if (p === '...') {
                                                            return (
                                                                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold select-none">
                                                                    …
                                                                </span>
                                                            );
                                                        }
                                                        const isCurrent = p === currentPage;
                                                        return (
                                                            <button
                                                                key={p}
                                                                type="button"
                                                                onClick={() => handlePageChange(p)}
                                                                className={`min-w-[38px] h-9 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                                                    isCurrent
                                                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 scale-105 ring-2 ring-orange-400/20'
                                                                        : 'text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 active:scale-95'
                                                                }`}
                                                                aria-label={`Page ${p}`}
                                                                aria-current={isCurrent ? 'page' : undefined}
                                                            >
                                                                {p}
                                                            </button>
                                                        );
                                                    })}

                                                    {/* Next Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage >= totalPages}
                                                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                                            currentPage >= totalPages
                                                                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                                                                : 'text-slate-700 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 shadow-sm active:scale-95'
                                                        }`}
                                                        aria-label="Next Page"
                                                    >
                                                        <span className="hidden sm:inline">Next</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-12 text-center my-6">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-400">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">No articles found</h3>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                                            {categoryQuery
                                                ? `There are no published articles currently under ${currentCategoryObj?.name || 'this category'}.`
                                                : 'There are no published articles available right now.'}
                                        </p>
                                        {categoryQuery && (
                                            <button
                                                type="button"
                                                onClick={() => handleSelectCategory('')}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all active:scale-95"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                View All Articles
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
            <ToTopButton />
        </div>
    );
}

export default function BlogListing() {
    return (
        <Suspense fallback={
            <div className="bg-slate-50 min-h-screen">
                <HeroSection
                    title="Astrology"
                    highlightText="Blog"
                    subtitle="Explore our latest articles and updates on Vedic Astrology, Festivals, and Spirituality."
                    icon="📝"
                    align="center"
                    extraPaddingBottom={true}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20 pb-8">
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-8 shadow-xl min-h-[400px] animate-pulse"></div>
                </div>
            </div>
        }>
            <BlogListingContent />
        </Suspense>
    );
}
