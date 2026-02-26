"use client";

import { useEffect, useState } from 'react';
import API from '../../lib/api';
import Link from 'next/link';
import { PenTool, Trash2, Edit, Plus } from 'lucide-react';

export default function BlogManager() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await API.get('/blog/posts/admin');
            setPosts(res.data.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await API.delete(`/blog/posts/${id}`);
            alert('Post Deleted');
            fetchPosts();
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading content...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Blog Posts</h2>
                    <p className="text-sm text-slate-500">Manage your platform content</p>
                </div>
                <Link href="/admin/blog/create" className="bg-astro-navy text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md hover:bg-slate-800 transition flex items-center gap-2">
                    <Plus size={18} /> Create New Post
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {error && <div className="p-4 bg-red-50 text-red-700 text-center border-b border-red-100">{error}</div>}

                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Views</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.map(post => (
                            <tr key={post._id} className="hover:bg-slate-50/50 transition">
                                <td className="p-4 font-medium text-slate-800">{post.title}</td>
                                <td className="p-4 text-slate-500">
                                    {post.categories?.length > 0
                                        ? post.categories.map(c => c.name).join(', ')
                                        : (post.category?.name || 'Uncategorized')}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${post.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500">{post.views}</td>
                                <td className="p-4 text-slate-400">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 flex gap-2">
                                    <Link href={`/admin/blog/edit/details?id=${post._id}`} className="text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded transition">
                                        <Edit size={16} />
                                    </Link>
                                    <button onClick={() => handleDelete(post._id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded transition">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && !loading && <div className="p-8 text-center text-slate-400">No posts found.</div>}
            </div>
        </div>
    );
}
