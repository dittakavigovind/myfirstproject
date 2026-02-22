"use client";

import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { useParams } from 'next/navigation';
import BlogSidebar from '../../../components/blog/BlogSidebar';
import BlogCard from '../../../components/blog/BlogCard';
import Breadcrumbs from '../../../components/common/Breadcrumbs';

export default function CategoryStats() {
    const params = useParams(); // { category }
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]); // Need categories for sidebar
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!params?.category) return;

            try {
                const [postRes, catRes] = await Promise.all([
                    API.get(`/blog/posts?category=${params.category}&status=published`),
                    API.get('/blog/categories')
                ]);
                setPosts(postRes.data.data);
                setCategories(catRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params]);

    // Helper to get current category name
    const currentCategoryName = categories.find(c => c.slug === params?.category)?.name || 'Category';

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <BlogSidebar categories={categories} />

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        <Breadcrumbs
                            items={[
                                { label: 'Blog', href: '/blog' },
                                { label: currentCategoryName }
                            ]}
                        />
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{currentCategoryName}</h1>
                            <p className="text-gray-500 text-sm">Browsing articles in {currentCategoryName}</p>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {posts.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {posts.map(post => (
                                            <BlogCard key={post._id} post={post} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-12 text-center rounded-xl text-gray-400">
                                        No posts found in this category.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
