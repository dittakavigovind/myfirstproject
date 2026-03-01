"use client";

import { useEffect, useState } from 'react';
import API from '../../lib/api';
import BlogSidebar from '../../components/blog/BlogSidebar';
import BlogCard from '../../components/blog/BlogCard';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import HeroSection from '../../components/common/HeroSection';

export default function BlogListing() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postRes, catRes] = await Promise.all([
                    API.get('/blog/posts?status=published'),
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
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen pb-20 overflow-x-hidden">
            <HeroSection
                title="Astrology"
                highlightText="Blog"
                subtitle="Explore our latest articles and updates on Vedic Astrology, Festivals, and Spirituality."
                icon="📝"
                align="center"
                extraPaddingBottom={true}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-24 relative z-20 pb-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <BlogSidebar categories={categories} />

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4 bg-white rounded-[2.5rem] p-6 shadow-2xl border border-slate-100">
                        <Breadcrumbs
                            items={[
                                { label: 'Blog' }
                            ]}
                        />
                        <div className="mb-6 mt-4">
                            <h2 className="text-2xl font-black text-slate-900">Latest Wisdom</h2>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => (
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
                                        No posts available at the moment.
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
