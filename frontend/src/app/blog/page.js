"use client";

import { useEffect, useState } from 'react';
import API from '../../lib/api';
import BlogSidebar from '../../components/blog/BlogSidebar';
import BlogCard from '../../components/blog/BlogCard';
import Breadcrumbs from '../../components/common/Breadcrumbs';

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
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
                {/* Search Bar / Header could go here */}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <BlogSidebar categories={categories} />

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        <Breadcrumbs
                            items={[
                                { label: 'Blog' }
                            ]}
                        />
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Latest Wisdom</h1>
                            <p className="text-gray-500 text-sm">Explore our latest articles and updates.</p>
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
