"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Download } from 'lucide-react';
import analytics from '../lib/analytics';
import { useEffect } from 'react';

const PanchangShareCard = forwardRef(({ data, location, date, showButton = true }, ref) => {
    const cardRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Track view when card is visible
        if (showButton) {
            analytics.track('VIEW', 'PANCHANG', 'share_card_view', { location, date });
        }
    }, [showButton, location, date]);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setLoading(true);

        try {
            // Generate Image
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            const blob = await (await fetch(dataUrl)).blob();
            // Sanitizing date for filename
            const safeDate = new Date(date).toISOString().split('T')[0];
            const file = new File([blob], `way2astro-panchang-${safeDate}.png`, { type: 'image/png' });

            let shared = false;

            // Try Web Share API
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: `Daily Panchang`,
                        text: `Check out today's Panchang details for ${location}!`,
                        files: [file]
                    });
                    analytics.track('SHARE', 'PANCHANG', 'web_share_api', { location, date });
                    shared = true;
                } catch (shareError) {
                    console.warn('Share failed or was cancelled, falling back to download:', shareError);
                    // Intentionally shared = false to trigger download
                }
            }

            // Fallback to Download if sharing failed or is unavailable
            if (!shared) {
                const link = document.createElement('a');
                link.download = `way2astro-panchang-${safeDate}.png`;
                link.href = dataUrl;
                link.click();
                analytics.track('SHARE', 'PANCHANG', 'download_fallback', { location, date });
            }

        } catch (error) {
            console.error('Error generating or sharing panchang:', error);
            // alert('Could not share image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        share: handleShare
    }));

    return (
        <div className="flex flex-col items-center gap-4 my-8">
            {showButton && (
                <button
                    onClick={handleShare}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-astro-navy to-indigo-900 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    {loading ? 'Generating...' : <><Share2 size={18} /> Share Panchang</>}
                </button>
            )}

            {/* Hidden off-screen if needed, or visible? Let's keep it visible but styled for sharing */}
            {/* We render it hidden or just wrapper div that captures standard layout */}

            <div className={`overflow-hidden rounded-xl shadow-2xl border-4 border-astro-yellow bg-white w-[350px] relative ${!showButton ? 'absolute -left-[9999px]' : ''}`} ref={cardRef}>
                {/* Header / Branding */}
                <div className="bg-astro-navy text-white p-4 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    {/* Logo Placeholder - Ideally use Image component if logo exists */}
                    <div className="flex justify-center mb-2">
                        <img src="/logo.svg" alt="Way2Astro" className="h-12 w-auto" />
                    </div>
                    <p className="text-xs uppercase tracking-widest opacity-80">Daily Celestial Guide</p>
                </div>

                {/* Date & Location */}
                <div className="bg-orange-50 p-3 text-center border-b border-orange-100">
                    <h3 className="text-lg font-bold text-gray-800">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                    <p className="text-sm text-gray-500 font-medium">📍 {location}</p>
                </div>

                {/* Panchang Grid */}
                <div className="p-4 grid gap-3">
                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-500 font-medium">✨ Tithi</span>
                        <span className="font-bold text-astro-navy">{data.tithi?.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-500 font-medium">🌟 Nakshatra</span>
                        <span className="font-bold text-astro-navy">{data.nakshatra?.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-500 font-medium">🧘 Yoga</span>
                        <span className="font-bold text-astro-navy">{data.yoga?.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                        <span className="text-sm text-gray-500 font-medium">📅 Vara</span>
                        <span className="font-bold text-astro-navy">{data.vara}</span>
                    </div>
                </div>

                {/* Sun/Moon */}
                <div className="bg-indigo-900 text-white p-3 flex justify-around items-center text-center text-xs">
                    <div>
                        <span className="block text-astro-yellow mb-1 font-bold">Sunrise</span>
                        {data.sun?.sunrise}
                    </div>
                    <div>
                        <span className="block text-astro-yellow mb-1 font-bold">Sunset</span>
                        {data.sun?.sunset}
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div>
                        <span className="block text-astro-yellow mb-1 font-bold">Moon Sign</span>
                        {data.moon?.rashi}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-100 p-2 text-center">
                    <p className="text-[10px] text-gray-500 font-bold">Visit Way2Astro.com for full details</p>
                </div>
            </div>
        </div>
    );
});

PanchangShareCard.displayName = 'PanchangShareCard';

export default PanchangShareCard;
