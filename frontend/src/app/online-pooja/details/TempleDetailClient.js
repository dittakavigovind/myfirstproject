'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { resolveImageUrl, API_BASE } from '../../../lib/urlHelper';
import { Loader2, MapPin, ChevronLeft, Calendar, User, Phone, Mail, Home, Info, CheckCircle2, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const TempleDetailContent = ({ slug: propSlug }) => {
    const searchParams = useSearchParams();
    const slug = propSlug || searchParams.get('slug');
    const router = useRouter();
    const [temple, setTemple] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);
    const sevasRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (sevasRef.current) {
                const rect = sevasRef.current.getBoundingClientRect();
                const navbarHeight = window.innerWidth < 768 ? 64 : (window.innerWidth < 1024 ? 80 : 124);
                // Show floating button when the bottom of the sevas block scrolls past the sticky navbar
                if (rect.bottom < navbarHeight) {
                    setShowFloatingBtn(true);
                } else {
                    setShowFloatingBtn(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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

    useEffect(() => {
        if (temple && temple.sevas && typeof window !== 'undefined') {
            const sevaWithSavedProgress = temple.sevas.find(s => localStorage.getItem(`poojaBooking_${s._id}`));
            if (sevaWithSavedProgress) {
                router.push(`/online-pooja/checkout/?temple=${temple.slug}&seva=${sevaWithSavedProgress._id}`);
            }
        }
    }, [temple, router]);

    const handleBookNow = (seva) => {
        router.push(`/online-pooja/checkout/?temple=${temple.slug}&seva=${seva._id}`);
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
        <div className="bg-astro-light min-h-screen pb-28 lg:pb-12">
            {/* Header / Navigation */}
            <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-[calc(65px+env(safe-area-inset-top,0px))] md:top-[calc(81px+env(safe-area-inset-top,0px))] lg:top-[calc(125px+env(safe-area-inset-top,0px))] z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push('/online-pooja')}
                        className="flex items-center text-astro-navy hover:text-astro-yellow font-bold transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Listing
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const shareDomain = 'https://way2astro.com';
                                const url = `${shareDomain}/online-pooja/details/${temple.slug}/`;
                                const text = `Check out this Online Pooja: ${temple.name} at Way2Astro\n\n${url}`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-full font-bold text-sm transition-colors border border-[#25D366]/20"
                            title="Share on WhatsApp"
                        >
                            <FaWhatsapp className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                        <div className="flex items-center text-sm font-medium text-gray-500">
                            <MapPin className="w-4 h-4 mr-1 text-astro-navy" />
                            {temple.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Gallery & Description */}
                    <div className="lg:col-span-7 min-w-0 order-2 lg:order-1">
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

                        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 overflow-hidden break-words text-justify lg:text-left">
                            <h1 className="text-2xl md:text-4xl font-black text-astro-navy mb-6 leading-tight break-words text-left">
                                {temple.name}
                            </h1>
                            <div
                                className="prose-astro max-w-full break-words whitespace-pre-wrap text-gray-600 mb-4 leading-relaxed [&_p]:break-words [&_p]:text-justify [&_p]:whitespace-normal [&_p]:overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_*]:text-justify lg:[&_*]:text-left"
                                dangerouslySetInnerHTML={{ __html: temple.description }}
                            />
                        </div>

                        {/* FAQs Section */}
                        {temple.faqs && temple.faqs.length > 0 && temple.faqs.some(f => f.question && f.answer) && (
                            <div className="bg-white rounded-[2.5rem] shadow-sm p-8 mt-8">
                                <h2 className="text-2xl font-black text-astro-navy mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {temple.faqs.filter(f => f.question && f.answer).map((faq, idx) => (
                                        <div
                                            key={idx}
                                            className={`border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 ${openFaqIndex === idx ? 'bg-astro-light/30 shadow-sm' : 'hover:border-gray-200'}`}
                                        >
                                            <button
                                                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                                className="w-full text-left p-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-astro-navy rounded-2xl"
                                            >
                                                <h3 className="text-base font-bold text-astro-navy pr-8">{faq.question}</h3>
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openFaqIndex === idx ? 'bg-astro-navy text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>
                                            <div
                                                className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaqIndex === idx ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <div className="p-5 pt-0 border-t border-gray-100/50 mt-1">
                                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{faq.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sevas Sticky */}
                    <div className="lg:col-span-5 order-1 lg:order-2" ref={sevasRef}>
                        <div className="sticky lg:top-[calc(200px+env(safe-area-inset-top,0px))]">
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
                                                <div className="text-right flex flex-col items-end">
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

                                                    {/* Coupon Badge */}
                                                    <div className="mt-1 flex items-center gap-1 bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-500/30">
                                                        <Tag className="w-3 h-3" /> Use Coupon
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
                                            {seva.registrationEndDate && new Date() > new Date(seva.registrationEndDate) ? (
                                                <div className="w-full bg-red-500/20 text-red-100 py-3 px-6 rounded-xl font-black text-center border border-red-500/30">
                                                    Registrations Closed
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleBookNow(seva)}
                                                    className="w-full bg-white text-astro-navy py-3 px-6 rounded-xl font-black hover:bg-astro-yellow transition-all duration-300 shadow-lg"
                                                >
                                                    Book Now
                                                </button>
                                            )}
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
                                            Prasadam will be shipped within 1-2 weeks from seva date.
                                        </li>
                                        <li className="flex items-start text-xs text-white/80 italic">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-astro-yellow mt-0.5" />
                                            Authentic sankalp with your names & gotram.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Book Now Button */}
            <div
                className={`fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] lg:hidden z-50 transition-transform duration-300 ${showFloatingBtn ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="max-w-7xl mx-auto flex gap-3">
                    <button
                        onClick={() => {
                            if (sevasRef.current) {
                                const y = sevasRef.current.getBoundingClientRect().top + window.scrollY - 100;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                            }
                        }}
                        className="w-full bg-astro-navy text-white py-3.5 px-6 rounded-xl font-black text-lg hover:bg-astro-yellow transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-5 h-5" /> Select Seva
                    </button>
                </div>
            </div>
        </div>
    );
};

const TempleDetailClient = ({ slug }) => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-astro-navy animate-spin mb-4" />
                <p className="text-astro-navy font-medium">Loading Divine Energy...</p>
            </div>
        }>
            <TempleDetailContent slug={slug} />
        </Suspense>
    );
};

export default TempleDetailClient;
