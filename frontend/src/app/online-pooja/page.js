'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { resolveImageUrl, API_BASE } from '../../lib/urlHelper';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

const OnlinePoojaListing = () => {
    const [temples, setTemples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemples = async () => {
            try {
                const response = await axios.get(`${API_BASE}/pooja/temples`);
                if (response.data.success) {
                    setTemples(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching temples:', err);
                setError('Failed to load temples. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTemples();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-astro-navy animate-spin mb-4" />
                <p className="text-astro-navy font-medium">Seeking Temples...</p>
            </div>
        );
    }

    return (
        <div className="bg-astro-light min-h-screen">
            {/* Hero Section */}
            <div className="bg-astro-navy text-white py-8 md:py-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <span className="text-[12rem] font-black leading-none">ॐ</span>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side: Text Content */}
                        <div className="text-left">
                            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                                Online <span className="text-astro-yellow">Seva & Pooja</span>
                            </h1>
                            <p className="text-sm md:text-base text-white/80 max-w-xl leading-relaxed">
                                Bridge the distance between you and the divine. Book authentic temple sevas online from across India and receive holy prasadam delivered with care to your doorstep.
                            </p>
                        </div>

                        {/* Right Side: Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="text-xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg">🕉️</div>
                                <div>
                                    <h3 className="font-bold text-astro-yellow text-xs">Authentic Rituals</h3>
                                    <p className="text-white/40 text-[8px] uppercase font-bold tracking-widest mt-0.5">Vedic Traditions</p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="text-xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg">📜</div>
                                <div>
                                    <h3 className="font-bold text-astro-yellow text-xs">Personal Sankalpa</h3>
                                    <p className="text-white/40 text-[8px] uppercase font-bold tracking-widest mt-0.5">Names & Gotras</p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="text-xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg">📦</div>
                                <div>
                                    <h3 className="font-bold text-astro-yellow text-xs">Prasadam Delivery</h3>
                                    <p className="text-white/40 text-[8px] uppercase font-bold tracking-widest mt-0.5">Secure Shipping</p>
                                </div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                <div className="text-xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg">🛡️</div>
                                <div>
                                    <h3 className="font-bold text-astro-yellow text-xs">Secure Booking</h3>
                                    <p className="text-white/40 text-[8px] uppercase font-bold tracking-widest mt-0.5">Safe & Transparent</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {error ? (
                    <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center border border-red-100 shadow-sm">
                        <p className="font-bold text-lg mb-2">Notice</p>
                        <p>{error}</p>
                    </div>
                ) : temples.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-gray-100">
                        <div className="text-5xl mb-6">🪔</div>
                        <p className="text-gray-400 text-xl font-medium">No temples are currently participating in online bookings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {temples.map((temple) => (
                            <div
                                key={temple._id}
                                className="group bg-white rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
                            >
                                {/* Image Container */}
                                <Link
                                    href={`/online-pooja/details?slug=${temple.slug}`}
                                    className="relative block aspect-video overflow-hidden"
                                >
                                    <Image
                                        src={temple.images && temple.images[0] ? resolveImageUrl(temple.images[0]) : '/placeholder-temple.jpg'}
                                        alt={temple.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1 text-astro-yellow" />
                                            {temple.location}
                                        </div>
                                        {temple.sevas && temple.sevas.length > 0 && (
                                            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                                                <div className="w-1.5 h-1.5 bg-astro-yellow rounded-full animate-pulse"></div>
                                                {(() => {
                                                    const fixedSeva = temple.sevas.find(s => s.dateSelectionType === 'Fixed');
                                                    if (fixedSeva && fixedSeva.fixedDate) {
                                                        return new Date(fixedSeva.fixedDate).toLocaleDateString('en-GB');
                                                    }
                                                    const rangeSeva = temple.sevas.find(s => s.dateSelectionType === 'Range');
                                                    if (rangeSeva && rangeSeva.startDate && rangeSeva.endDate) {
                                                        return `${new Date(rangeSeva.startDate).toLocaleDateString('en-GB')} - ${new Date(rangeSeva.endDate).toLocaleDateString('en-GB')}`;
                                                    }
                                                    return "Available Daily";
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-6">
                                    {temple.sevas && temple.sevas.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Sevas</p>
                                            <div className="space-y-2.5">
                                                {temple.sevas.slice(0, 3).map((seva, sIdx) => (
                                                    <div key={sIdx} className="flex items-center text-[11px] font-bold text-astro-navy/80 hover:text-astro-navy transition-colors">
                                                        <span className="text-astro-yellow mr-2 font-black">•</span>
                                                        <span className="line-clamp-1">{seva.name}</span>
                                                    </div>
                                                ))}
                                                {temple.sevas.length > 3 && (
                                                    <p className="text-[10px] text-gray-400 font-black ml-3">+{temple.sevas.length - 3} more sevas</p>
                                                )}
                                            </div>
                                            <div className="mt-4 h-px w-full bg-gray-50"></div>
                                        </div>
                                    )}

                                    <h2 className="text-lg md:text-xl font-black text-astro-navy mb-3 group-hover:text-astro-yellow transition-colors duration-300 line-clamp-2 min-h-[3.5rem] flex items-center">
                                        {temple.name}
                                    </h2>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-6 leading-relaxed font-medium">
                                        {temple.description}
                                    </p>

                                    <Link
                                        href={`/online-pooja/details?slug=${temple.slug}`}
                                        className="inline-flex items-center justify-center w-full bg-astro-navy text-white py-3.5 px-6 rounded-xl font-black hover:bg-astro-yellow hover:text-astro-navy transition-all duration-300 shadow-xl shadow-astro-navy/20 hover:shadow-astro-yellow/30"
                                    >
                                        Explore Sevas
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Disclaimer Section */}
            <div className="bg-astro-navy/5 py-20 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-sm mb-6">
                        <span className="text-2xl">⚖️</span>
                    </div>
                    <h3 className="text-xl font-black text-astro-navy mb-4 uppercase tracking-wider">Disclaimer & Service Terms</h3>
                    <div className="space-y-4 text-gray-500 text-sm leading-relaxed font-medium text-justify md:text-center">
                        <p>
                            Way2Astro acts as a platform to facilitate online bookings for temple rituals. While we strive to ensure every Seva is performed as requested, the actual performance of rituals depends on temple availability and local regulations. In rare cases of temple closure or unforeseen circumstances, your Seva may be rescheduled to the next available date.
                        </p>
                        <p>
                            Prasadam delivery is handled by third-party logistics partners. Delivery timelines may vary based on your location and temple processing times. Perishable items may be substituted or excluded from mainland deliveries to maintain hygiene standards. By booking a Seva, you acknowledge that these spiritual services are performed on your behalf in a representative capacity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnlinePoojaListing;
