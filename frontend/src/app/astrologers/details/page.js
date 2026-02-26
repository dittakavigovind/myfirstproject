"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import API from '@/lib/api';
import Link from 'next/link';
import { Star, MessageCircle, Phone, Video, CheckCircle, Share2, Heart, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AstrologerGallery from '@/components/AstrologerGallery';
import CosmicLoader from '@/components/CosmicLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl } from '@/lib/urlHelper';
import { Suspense } from 'react';

export default function AstrologerProfileWrapper() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0c29]">
                <CosmicLoader size="lg" message="Aligning the Stars..." />
            </div>
        }>
            <AstrologerProfile />
        </Suspense>
    );
}

function AstrologerProfile() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const { featureFlags } = useTheme();
    const [astro, setAstro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Protect Route from Astrologers
    useEffect(() => {
        if (!authLoading && user && user.role === 'astrologer') {
            router.push('/astrologer/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (id) fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await API.get(`/astro/astrologers/${id}`);
            if (!res.data.data) {
                setNotFound(true);
            } else {
                const data = res.data.data;
                setAstro(data);

                // SEO: Canonical Redirect to Slug if accessed via ID
                if (data.slug && data.slug !== id) {
                    router.replace(`/astrologers/details?id=${data.slug}`);
                }
            }
        } catch (error) {
            console.error(error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const isOwner = user && (user._id === astro?.userId || user.role === 'admin');

    const handleAuthAction = (actionUrl) => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(actionUrl)}`);
        } else {
            router.push(actionUrl);
        }
    };

    const handleCallAction = () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        } else {
            // Redirect to Chat page where call can be initiated (In-App)
            router.push(`/chat-with-astrologer/session?id=${astro.slug || astro._id}`);
        }
    };

    // If finished loading but no astro, show Not Found
    if (!loading && (notFound || !astro)) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl font-black text-slate-800 mb-4">404</h1>
                <p className="text-slate-600 mb-6">Astrologer not found</p>
                <Link href="/astrologers">
                    <button className="bg-astro-navy text-white px-6 py-3 rounded-xl font-bold">Back to Astrologers</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20 pt-8">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0c29]"
                    >
                        <CosmicLoader size="lg" message="Aligning the Stars..." />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        className="max-w-6xl mx-auto px-4 sm:px-6"
                    >
                        {/* Profile Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 mb-8 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12">

                                {/* Left: Image */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full p-1.5 border-4 border-yellow-400/30">
                                        <div className="w-full h-full rounded-full overflow-hidden relative group">
                                            <img
                                                src={resolveImageUrl(astro.image) || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                                alt={astro.displayName}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    </div>
                                    <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-8 rounded-full transition-colors w-full shadow-lg shadow-yellow-400/20">
                                        Follow
                                    </button>
                                </div>

                                {/* Right: Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                                {astro.displayName}
                                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500 fill-current" />
                                            </h1>
                                            <p className="text-slate-500 font-medium text-base md:text-lg mt-1">{astro.skills.join(', ')}</p>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit mx-auto md:mx-0">
                                            <span className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-md font-bold text-sm">
                                                {astro.rating} <Star size={12} fill="white" />
                                            </span>
                                            <span className="text-xs md:text-sm text-slate-400 font-medium">({astro.reviewCount} Reviews)</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-slate-600 mb-8 font-medium">
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            {astro.languages.join(', ')}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            Exp: {astro.experienceYears} Years
                                        </span>
                                        <span className="flex items-center gap-2 text-indigo-600 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                            ₹{astro.charges?.chatPerMinute}/min
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {featureFlags?.enableChat && (
                                            <button
                                                onClick={() => handleAuthAction(`/chat-with-astrologer/session?id=${astro.slug || astro._id}`)}
                                                className="py-3 px-4 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap active:scale-95 shadow-sm"
                                            >
                                                <MessageCircle size={18} />
                                                Start Chat (₹{astro.charges?.chatPerMinute || 0}/min)
                                            </button>
                                        )}
                                        {featureFlags?.enableCall && (
                                            <button
                                                onClick={handleCallAction}
                                                className="py-3 px-4 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap active:scale-95 shadow-sm"
                                            >
                                                <Phone size={18} />
                                                Start Call (₹{astro.charges?.callPerMinute || 0}/min)
                                            </button>
                                        )}
                                    </div>

                                    <div className="w-full h-px bg-slate-100 my-8"></div>

                                    {/* Gallery Section */}
                                    <div className="mb-8">
                                        <AstrologerGallery
                                            images={astro.gallery || []}
                                            astrologerId={astro._id}
                                            isOwner={isOwner}
                                            onGalleryUpdate={(newGallery) => setAstro(prev => ({ ...prev, gallery: newGallery }))}
                                        />
                                    </div>


                                    {/* About Me */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-3">About me</h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                                            {astro.bio || `I am ${astro.displayName}, a certified Astrologer with ${astro.experienceYears} years of experience in ${astro.skills[0] || 'Vedic Astrology'}. I have helped thousands of people find clarity in their lives through my readings.`}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Reviews Section Placeholder */}
                        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Rating & Reviews</h3>
                                <div className="h-2 w-32 bg-green-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-3/4"></div>
                                </div>
                            </div>
                            <div className="text-center py-10 text-slate-400 font-medium">
                                No reviews yet. Be the first to consult!
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

