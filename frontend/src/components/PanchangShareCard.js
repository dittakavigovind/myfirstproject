"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Download } from 'lucide-react';
import analytics from '../lib/analytics';
import { useEffect } from 'react';
import { t, tData } from '../utils/translations';

const PanchangShareCard = forwardRef(({ data, location, date, showButton = true, lang = 'en' }, ref) => {
    const cardRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Track view when card is visible
        if (showButton) {
            analytics.track('VIEW', 'PANCHANG', 'share_card_view', { location, date });
        }
    }, [showButton, location, date]);

    // Helper to format full date-time string to time only
    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';
        if (dtStr.includes(' | ')) return dtStr.split(' | ')[1];
        if (/^\d{1,2}:\d{2}/.test(dtStr) && !dtStr.includes('-')) return dtStr;
        if (dtStr.includes('T')) {
            const d = new Date(dtStr);
            if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }
        if (/^\d{2}-\d{2}-\d{4}/.test(dtStr) && dtStr.includes(' ')) {
            return dtStr.split(' ')[1];
        }
        return dtStr;
    }

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
                        title: t('dailyPanchang', lang),
                        text: `${t('dailyPanchang', lang)} for ${location}!`,
                        files: [file]
                    });
                    analytics.track('SHARE', 'PANCHANG', 'web_share_api', { location, date, lang });
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
                    {loading ? (lang === 'hi' ? 'तैयार हो रहा है...' : 'Generating...') : <><Share2 size={18} /> {lang === 'hi' ? 'पंचांग शेयर करें' : 'Share Panchang'}</>}
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
                    <h3 className="text-lg font-bold text-gray-800">{new Date(date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                    <p className="text-sm text-gray-500 font-medium lowercase">📍 {location}</p>
                </div>

                {/* Panchang Grid */}
                <div className="p-4 grid gap-3">
                    {data.ayanam && (
                        <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                            <span className="text-sm text-gray-500 font-medium">☀️ {t('ayanam', lang)}</span>
                            <span className="font-bold text-astro-navy">{tData('ayanam', data.ayanam, lang)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-500 font-medium">✨ {t('tithi', lang)}</span>
                        <span className="font-bold text-astro-navy text-right">{tData('tithi', data.tithi?.name, lang)} <br/> <small className="text-[10px] opacity-60 font-medium">{lang === 'te' ? `${formatTime(data.tithi?.end)} ${t('upto', lang)}` : `(${t('upto', lang)} ${formatTime(data.tithi?.end)})`}</small></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-500 font-medium">🌟 {t('nakshatra', lang)}</span>
                        <span className="font-bold text-astro-navy text-right">{tData('nakshatra', data.nakshatra?.name, lang)} <br/> <small className="text-[10px] opacity-60 font-medium">{lang === 'te' ? `${formatTime(data.nakshatra?.end)} ${t('upto', lang)}` : `(${t('upto', lang)} ${formatTime(data.nakshatra?.end)})`}</small></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2">
                        <span className="text-sm text-gray-500 font-medium">🧘 {t('yoga', lang)}</span>
                        <span className="font-bold text-astro-navy">{tData('yoga', data.yoga?.name, lang)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                        <span className="text-sm text-gray-500 font-medium">📅 {t('vara', lang)}</span>
                        <span className="font-bold text-astro-navy">{tData('vara', data.vara, lang)}</span>
                    </div>
                </div>

                {/* Sun/Moon */}
                <div className="bg-indigo-900 text-white p-3 flex justify-around items-center text-center text-xs">
                    <div>
                        <span className="block text-astro-yellow mb-1 font-bold">{t('sunrise', lang)}</span>
                        {data.sun?.sunrise}
                    </div>
                    <div>
                        <span className="block text-astro-yellow mb-1 font-bold">{t('sunset', lang)}</span>
                        {data.sun?.sunset}
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div>
                        <span className="block text-astro-yellow mb-1 font-bold">{t('moonSign', lang)}</span>
                        {tData('rashi', data.moon?.rashi, lang)}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-100 p-2 text-center text-[8px] uppercase tracking-tighter">
                    <p className="text-gray-500 font-black">{lang === 'hi' ? 'पूर्ण विवरण के लिए Way2Astro.com पर जाएं' : 'Visit Way2Astro.com for full details'}</p>
                </div>
            </div>
        </div>
    );
});

PanchangShareCard.displayName = 'PanchangShareCard';

export default PanchangShareCard;
