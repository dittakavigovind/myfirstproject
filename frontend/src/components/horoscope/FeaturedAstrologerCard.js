"use client";

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { CheckCircle, Phone, Instagram, Facebook, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '@/lib/urlHelper';

export default function FeaturedAstrologerCard() {
    const [astrologer, setAstrologer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            const { data } = await API.get('/horoscope-manager/featured-astrologer');
            if (data.success && data.data) {
                setAstrologer(data.data);
            }
        } catch (error) {
            console.error("Error fetching featured astrologer:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/10 h-40 w-full md:w-[450px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-astro-yellow"></div>
        </div>
    );

    if (!astrologer) return null;

    // Date Validation
    const now = new Date();
    // Reset time part for accurate date comparison if needed, but simple timestamp comparison is safer if dates include time.
    // However, DB stores full ISO. Let's assume day-level comparison or full timestamp if user wants specific time.
    // The Input type="date" sets time to 00:00:00 UTC usually or local.
    // Let's standard check:

    // If startDate exists and today is before startDate -> Hide
    if (astrologer.startDate && now < new Date(astrologer.startDate)) return null;

    // If endDate exists and today is after endDate -> Hide
    // Note: endDate from input type="date" is 00:00:00 of that day. 
    // Usually "To Date" implies "through the end of that day".
    // So we should compare against endDate + 1 day OR check if greater than endDate set to 23:59:59.
    // Let's do strict check for now: if now > endDate (00:00), it expires at start of that day.
    // User expectation is usually inclusive. Let's add 1 day to endDate for comparison.
    if (astrologer.endDate) {
        const end = new Date(astrologer.endDate);
        end.setHours(23, 59, 59, 999);
        if (now > end) return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 rounded-2xl p-4 flex gap-5 items-center relative group w-full md:w-[450px] hover:bg-white/15 transition-all"
        >
            {/* Left: Image */}
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative">
                    <div className="w-28 h-36 rounded-2xl p-0.5 bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-lg">
                        <div className="w-full h-full rounded-xl border-2 border-white/20 overflow-hidden bg-white/10">
                            <img
                                src={resolveImageUrl(astrologer.image)}
                                alt={astrologer.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white text-lg leading-tight break-words pr-1">
                        {astrologer.name}
                    </h3>

                </div>

                <div className="text-sm text-white/80 mb-4 line-clamp-3 leading-relaxed font-light">
                    {astrologer.description}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {astrologer.mobileNumber && (
                        <a
                            href={`tel:${astrologer.mobileNumber}`}
                            className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-bold py-2 px-6 rounded-lg text-sm transition-all shadow-lg active:scale-95"
                        >
                            <Phone size={16} /> Call Now
                        </a>
                    )}

                    {astrologer.socialLinks?.instagram && (
                        <a
                            href={astrologer.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"
                        >
                            <Instagram size={18} />
                        </a>
                    )}
                    {astrologer.socialLinks?.facebook && (
                        <a
                            href={astrologer.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"
                        >
                            <Facebook size={18} />
                        </a>
                    )}
                    {astrologer.socialLinks?.website && (
                        <a
                            href={astrologer.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"
                        >
                            <Globe size={18} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
