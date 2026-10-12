"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Layers, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

function BlogSidebarContent({ categories = [], activeCategory: activeCategoryProp, onSelectCategory }) {
    const searchParams = useSearchParams();
    const queryCategory = searchParams.get('category') || '';
    const currentCategory = activeCategoryProp !== undefined ? activeCategoryProp : queryCategory;
    const [mobileExpanded, setMobileExpanded] = useState(false);

    const activeCategories = (categories || []).filter(cat => (cat.postCount ?? 0) > 0);
    const totalPublishedPosts = activeCategories.reduce((acc, cat) => acc + (cat.postCount || 0), 0);

    const handleCategoryClick = (e, slug) => {
        if (onSelectCategory) {
            e.preventDefault();
            onSelectCategory(slug);
            setMobileExpanded(false);
        }
    };

    return (
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 self-start lg:sticky lg:top-32 z-20 mb-6 lg:mb-0">
            {/* Floating Card Div */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 border border-slate-100/80">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-astro-yellow flex items-center justify-center shadow-md">
                            <Layers className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight leading-none">
                                Categories
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                                Select Topic
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentCategory && (
                            <Link
                                href="/blog"
                                onClick={(e) => handleCategoryClick(e, '')}
                                className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                                title="Reset to all topics"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span className="hidden sm:inline">Reset</span>
                            </Link>
                        )}

                        {/* Mobile Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setMobileExpanded(!mobileExpanded)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Toggle categories"
                        >
                            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Categories List (collapsible on mobile, always visible on desktop) */}
                <div className={`mt-4 space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full ${mobileExpanded ? 'block' : 'hidden lg:block'}`}>
                    {/* All Categories */}
                    <Link
                        href="/blog"
                        onClick={(e) => handleCategoryClick(e, '')}
                        className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                            !currentCategory
                                ? 'bg-gradient-to-r from-orange-50 via-amber-50/40 to-white text-orange-600 font-bold border-l-4 border-orange-500 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                        }`}
                    >
                        <span className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${!currentCategory ? 'bg-orange-500' : 'bg-slate-300 group-hover:bg-slate-400'} transition-colors`}></span>
                            All Categories
                        </span>
                        {totalPublishedPosts > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                !currentCategory
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            }`}>
                                {totalPublishedPosts}
                            </span>
                        )}
                    </Link>

                    {/* Category List */}
                    {activeCategories.map(cat => {
                        const isActive = currentCategory === cat.slug;
                        return (
                            <Link
                                key={cat._id}
                                href={`/blog?category=${cat.slug}`}
                                onClick={(e) => handleCategoryClick(e, cat.slug)}
                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                                    isActive
                                        ? 'bg-gradient-to-r from-orange-50 via-amber-50/40 to-white text-orange-600 font-bold border-l-4 border-orange-500 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-orange-500' : 'bg-slate-300 group-hover:bg-slate-400'} transition-colors`}></span>
                                    <span className="truncate">{cat.name}</span>
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2 ${
                                    isActive
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                }`}>
                                    {cat.postCount}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

export default function BlogSidebar(props) {
    return (
        <Suspense fallback={
            <aside className="w-full lg:w-72 xl:w-80 shrink-0 self-start lg:sticky lg:top-32 z-20 mb-6 lg:mb-0">
                <div className="bg-white p-6 rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-2/3 mb-4"></div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-9 bg-slate-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </aside>
        }>
            <BlogSidebarContent {...props} />
        </Suspense>
    );
}
