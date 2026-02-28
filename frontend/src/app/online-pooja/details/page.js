'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { resolveImageUrl, API_BASE } from '../../../lib/urlHelper';
import { Loader2, MapPin, ChevronLeft, Calendar, User, Phone, Mail, Home, Info, CheckCircle2 } from 'lucide-react';
import BookingModal from '../../../components/OnlinePooja/BookingModal';

const TempleDetailContent = () => {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const router = useRouter();
    const [temple, setTemple] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeva, setSelectedSeva] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchTemple = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_BASE}/pooja/temples/${slug}`);
                if (response.data.success) {
                    setTemple(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching temple:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTemple();
    }, [slug]);

    const handleBookNow = (seva) => {
        setSelectedSeva(seva);
        setIsBookingModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-astro-navy animate-spin mb-4" />
                <p className="text-astro-navy font-medium">Unlocking Divine Secrets...</p>
            </div>
        );
    }

    if (!temple) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-astro-navy mb-4">Temple Not Found</h1>
                <button
                    onClick={() => router.push('/online-pooja')}
                    className="inline-flex items-center text-astro-navy hover:text-astro-yellow font-bold transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Listing
                </button>
            </div>
        );
    }

    return (
        <div className="bg-astro-light min-h-screen pb-12">
            {/* Header / Navigation */}
            <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push('/online-pooja')}
                        className="flex items-center text-astro-navy hover:text-astro-yellow font-bold transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Listing
                    </button>
                    <div className="flex items-center text-sm font-medium text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 text-astro-navy" />
                        {temple.location}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Gallery & Description */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm p-4 mb-8">
                            {/* Main Image */}
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-4">
                                <Image
                                    src={temple.images && temple.images[activeImage] ? resolveImageUrl(temple.images[activeImage]) : '/placeholder-temple.jpg'}
                                    alt={temple.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Thumbnails */}
                            {temple.images && temple.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {temple.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-astro-yellow scale-95 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <Image
                                                src={resolveImageUrl(img)}
                                                alt={`${temple.name} thumbnail ${idx}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8">
                            <h1 className="text-2xl md:text-4xl font-black text-astro-navy mb-6 leading-tight break-words">
                                {temple.name}
                            </h1>
                            <div className="prose-astro max-w-none">
                                {temple.description.split('\n').map((para, i) => (
                                    <p key={i} className="text-gray-600 mb-4 leading-relaxed">
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sevas Sticky */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="bg-astro-navy text-white rounded-[2.5rem] shadow-xl p-8 mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="text-6xl font-black">ॐ</span>
                                </div>

                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <Calendar className="w-6 h-6 mr-3 text-astro-yellow" />
                                    Available Sevas
                                </h2>

                                <div className="space-y-4">
                                    {temple.sevas.map((seva, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all duration-300 group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-astro-yellow group-hover:scale-105 transition-transform origin-left">
                                                    {seva.name}
                                                </h3>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        {seva.originalPrice && seva.originalPrice > seva.price && (
                                                            <span className="text-white/40 text-sm line-through">
                                                                ₹{seva.originalPrice}
                                                            </span>
                                                        )}
                                                        <span className="text-xl font-black text-astro-yellow">
                                                            ₹{seva.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {seva.description && (
                                                <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
                                                    {seva.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-wider text-white/90 bg-white/5 py-2 px-3 rounded-xl border border-white/5 shadow-inner">
                                                <Calendar className="w-3.5 h-3.5 text-astro-yellow" />
                                                {seva.dateSelectionType === 'Fixed' && seva.fixedDate ? (
                                                    <span>Date: {new Date(seva.fixedDate).toLocaleDateString('en-GB')}</span>
                                                ) : seva.dateSelectionType === 'Range' && seva.startDate && seva.endDate ? (
                                                    <span>Range: {new Date(seva.startDate).toLocaleDateString('en-GB')} - {new Date(seva.endDate).toLocaleDateString('en-GB')}</span>
                                                ) : (
                                                    <span>Available Daily</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleBookNow(seva)}
                                                className="w-full bg-white text-astro-navy py-3 px-6 rounded-xl font-black hover:bg-astro-yellow transition-all duration-300 shadow-lg"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="flex items-center text-sm text-white/60 mb-4">
                                        <Info className="w-4 h-4 mr-2" />
                                        Important Information
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start text-xs text-white/80 italic">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-astro-yellow mt-0.5" />
                                            E-Prasadam will be shipped within 7-10 working days.
                                        </li>
                                        <li className="flex items-start text-xs text-white/80 italic">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-astro-yellow mt-0.5" />
                                            Authentic sankalp with your name & gotram.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal */}
            {isBookingModalOpen && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    temple={temple}
                    seva={selectedSeva}
                />
            )}
        </div>
    );
};

const TempleDetail = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-astro-navy animate-spin mb-4" />
                <p className="text-astro-navy font-medium">Loading Divine Energy...</p>
            </div>
        }>
            <TempleDetailContent />
        </Suspense>
    );
};

export default TempleDetail;
