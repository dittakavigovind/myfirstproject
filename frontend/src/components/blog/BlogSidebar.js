"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BlogSidebar({ categories }) {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-1/4 mb-8 lg:mb-0">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg grid place-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Categories</h3>
                        <p className="text-xs text-gray-500">Select Topic</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <Link
                        href="/blog"
                        className={`block px-4 py-3 rounded-lg transition-colors ${pathname === '/blog' ? 'bg-orange-50 text-orange-600 font-medium border-l-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        All Categories
                    </Link>
                    {categories.filter(cat => cat.postCount > 0).map(cat => (
                        <Link
                            key={cat._id}
                            href={`/blog/${cat.slug}`}
                            className={`block px-4 py-3 rounded-lg transition-colors ${pathname.includes(`/blog/${cat.slug}`) ? 'bg-orange-50 text-orange-600 font-medium border-l-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {cat.name}
                            <span className="text-xs text-gray-400 ml-2">({cat.postCount})</span>
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
