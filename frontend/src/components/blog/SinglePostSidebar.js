"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import API from '@/lib/api';
import { FaFire, FaClock, FaCompass } from 'react-icons/fa'; // Importing icons for cleaner code, or use SVGs as before

const MOCK_TRENDING = [
    { _id: 't1', title: 'How Astrotalk Is Using AI to Become a Smarter Platform', slug: 'ai-astrology', publishedAt: new Date().toISOString(), category: { slug: 'astrology', name: 'Astrology' } },
    { _id: 't2', title: 'Mars in Scorpio: Why Does Winning seem to be all you can think about!', slug: 'mars-scorpio', publishedAt: new Date(Date.now() - 86400000).toISOString(), category: { slug: 'zodiac', name: 'Zodiac' } },
    { _id: 't3', title: 'Suddenly Everyone’s Talking About Marriage? ‘Jupiter in Cancer’ Might Be the Reason', slug: 'jupiter-cancer', publishedAt: new Date(Date.now() - 172800000).toISOString(), category: { slug: 'planets', name: 'Planets' } },
    { _id: 't4', title: 'Life Path Number 18: Meaning, Numerology & Personality', slug: 'life-path-18', publishedAt: new Date(Date.now() - 259200000).toISOString(), category: { slug: 'numerology', name: 'Numerology' } },
];

const MOCK_RECENT = [
    { _id: 'r1', title: 'Khazani Ayurveda: Ancient Remedies Backed by Astrotalk', slug: 'ayurveda-remedies', publishedAt: new Date().toISOString(), category: { slug: 'ayurveda', name: 'Ayurveda' } },
    { _id: 'r2', title: 'Understanding the 12 Houses in Astrology', slug: '12-houses', publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(), category: { slug: 'astrology', name: 'Astrology' } },
    { _id: 'r3', title: 'The Power of Gemstones: Which One Suits You?', slug: 'gemstones', publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(), category: { slug: 'gemstones', name: 'Gemstones' } },
];

export default function SinglePostSidebar({ currentPostId, currentCategory }) {
    // Tabs state removed
    // Data
    const [trending] = useState(MOCK_TRENDING);
    const [recent] = useState(MOCK_RECENT);
    const [related, setRelated] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                // Fetch Related (same category, exclude current)
                let relatedResData = [];
                if (currentCategory && currentCategory._id) {
                    const relatedRes = await API.get(`/blog/posts?category=${currentCategory._id}&limit=5`);
                    relatedResData = relatedRes.data.data.filter(p => p._id !== currentPostId).slice(0, 4);
                }

                // If no related posts, maybe fallback to recent or just empty
                if (relatedResData.length === 0) {
                    // relatedResData = MOCK_RECENT; // Optional fallback
                }

                // Fetch Categories
                const catRes = await API.get('/blog/categories');

                setRelated(relatedResData);
                setCategories(catRes.data.data);

            } catch (err) {
                console.error("Error fetching sidebar data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentPostId) {
            fetchSidebarData();
        }
    }, [currentPostId, currentCategory]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}-${month}-${d.getFullYear()}`;
    };

    const SidebarSection = ({ title, subTitle, icon, posts, isDarkIcon = false, showContent = true }) => (
        <div className="mb-0">
            <div className="flex items-center gap-4 py-4">
                <div className={`w-12 h-12 rounded-full grid place-items-center flex-shrink-0 shadow-sm
                    ${isDarkIcon ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                    {icon}
                </div>
                <div className="text-left">
                    <h2 className="font-bold text-gray-900 text-xl leading-none">{title}</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{subTitle}</p>
                </div>
            </div>

            {showContent && (
                <div className="ml-6 pl-6 pt-2 mb-4 border-l border-dotted border-gray-300">
                    <div className="flex flex-col gap-4">
                        {posts.length > 0 ? posts.map((post, idx) => (
                            <Link key={post._id || idx} href={`/blog/${post.categories?.[0]?.slug || 'general'}/${post.slug}`} className="group flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-astro-maroon transition-colors flex-shrink-0 mt-2"></span>
                                <div>
                                    <h4 className="font-medium text-gray-600 group-hover:text-astro-maroon transition-colors line-clamp-2 text-sm leading-snug">
                                        {post.title}
                                    </h4>
                                    <div className="mt-1 text-xs text-gray-400 font-medium">
                                        {formatDate(post.publishedAt)}
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-gray-400 text-sm italic py-2">No posts available.</div>
                        )}
                    </div>
                </div>
            )}

            <div className="border-b border-gray-100 mx-2 mb-4"></div>
        </div>
    );

    return (
        <div className="lg:pl-8 pt-4">
            {/* Trending Section */}
            <SidebarSection
                title="Trending Now"
                subTitle="Trending Stories"
                icon={<FaFire className="w-5 h-5" />}
                posts={[]}
                isDarkIcon={true}
                showContent={false}
            />

            {/* Recent Section */}
            <SidebarSection
                title="Recent Blog"
                subTitle="Recent Stories"
                icon={<FaClock className="w-5 h-5" />}
                posts={[]}
                isDarkIcon={true}
                showContent={false}
            />

            {/* Related Section */}
            <SidebarSection
                title="Related Blog"
                subTitle="Related Stories"
                icon={<FaCompass className="w-5 h-5" />}
                posts={related}
                isDarkIcon={true}
            />

            {/* Categories */}

            {/* Categories */}
            <div className="mb-0">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-900 grid place-items-center flex-shrink-0 text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-none text-xl">Categories</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select Topic</p>
                    </div>
                </div>

                <div className="ml-6 pl-6 pt-2 mb-4 border-l border-dotted border-gray-300">
                    <div className="flex flex-col gap-3">
                        {categories.map(cat => (
                            <Link key={cat._id} href={`/blog/${cat.slug}`} className="flex items-center gap-3 text-gray-600 hover:text-astro-maroon transition-colors group">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-astro-maroon transition-colors"></span>
                                <span className="text-sm font-medium uppercase tracking-wide">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
