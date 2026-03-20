import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ImageIcon, Copy, MessageCircle, Sun, Moon, ArrowDown, Share2, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import analytics from '../lib/analytics';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { t, tData } from '../utils/translations';
import { useTheme } from '../context/ThemeContext';
import { resolveImageUrl } from '../lib/urlHelper';

export default function PanchangShareModal({ isOpen, onClose, data, location, date, lang = 'en' }) {
    const { logos } = useTheme();
    const cardRef = useRef(null); // Ref for visible modal content
    const printRef = useRef(null); // Ref for high-quality hidden card (Auto Height)
    const instaRef = useRef(null); // Ref for Instagram hidden card (Fixed 1080x1350)
    const [isGenerating, setIsGenerating] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        if (isOpen) {
            analytics.track('VIEW', 'PANCHANG', 'modal_open', { location, date });
        }

        // Warmup: Generate a low-res version immediately to cache fonts/images
        const timer = setTimeout(async () => {
            if (printRef.current) {
                try {
                    await toPng(printRef.current, { cacheBust: false, pixelRatio: 0.5 });
                } catch (e) {
                    console.warn("Warmup generation failed (non-critical):", e);
                }
            }
        }, 1000);

        return () => {
            setMounted(false);
            clearTimeout(timer);
        };
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const formattedDate = new Date(date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Helper to format full date-time string to time only
    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';

        // Extract time if format is "DD-MM-YYYY | hh:mm:ss A"
        if (dtStr.includes(' | ')) {
            return dtStr.split(' | ')[1];
        }

        // Already a time string?
        if (/^\d{1,2}:\d{2}/.test(dtStr) && !dtStr.includes('-')) return dtStr;

        // ISO format?
        if (dtStr.includes('T')) {
            const d = new Date(dtStr);
            if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }

        // Legacy format "DD-MM-YYYY HH:mm:ss"?
        if (/^\d{2}-\d{2}-\d{4}/.test(dtStr) && dtStr.includes(' ')) {
            return dtStr.split(' ')[1];
        }

        return dtStr;
    }

    const shareText = lang === 'hi'
        ? `*दैनिक पंचांग - ${formattedDate}*\nस्थान: ${location}\n\n*हिंदू वर्ष:* ${tData('samvatsara', data.samvat?.name, lang)} (${data.samvat?.vikram})\n*मास:* ${tData('masa', data.masa?.amanta, lang)}\n*ऋतु:* ${tData('ritu', data.ritu, lang)}\n*वार:* ${tData('vara', data.vara, lang)}\n*पक्ष:* ${tData('paksha', data.tithi?.paksha, lang)}\n*तिथि:* ${tData('tithi', data.tithi?.name, lang)} (${t('upto', lang)} ${formatTime(data.tithi?.end)})\n*नक्षत्र:* ${tData('nakshatra', data.nakshatra?.name, lang)} (${t('upto', lang)} ${formatTime(data.nakshatra?.end)})\n*योग:* ${tData('yoga', data.yoga?.name, lang)}\n*करण:* ${tData('karana', data.karana?.name, lang)}\n*अमृत काल:* ${formatTime(data.amritKaal?.start)} - ${formatTime(data.amritKaal?.end)}\n*राहु काल:* ${formatTime(data.rahuKalam?.start)} - ${formatTime(data.rahuKalam?.end)}\n\n*सूर्योदय:* ${data.sun?.sunrise} | *सूर्यास्त:* ${data.sun?.sunset}\n*चंद्र राशि:* ${tData('rashi', data.moon?.rashi, lang)}\n\nपूर्ण विवरण Way2Astro.com पर देखें!`
        : lang === 'te'
            ? `*దైనందిన పంచాంగం - ${formattedDate}*\nప్రదేశం: ${location}\n\n*హిందూ సంవత్సరం:* ${tData('samvatsara', data.samvat?.name, lang)} (${data.samvat?.vikram})\n*మాసం:* ${tData('masa', data.masa?.amanta, lang)}\n*ఋతువు:* ${tData('ritu', data.ritu, lang)}\n*వారం:* ${tData('vara', data.vara, lang)}\n*పక్షం:* ${tData('paksha', data.tithi?.paksha, lang)}\n*తిథి:* ${tData('tithi', data.tithi?.name, lang)} (${formatTime(data.tithi?.end)} ${t('upto', lang)})\n*నక్షత్రం:* ${tData('nakshatra', data.nakshatra?.name, lang)} (${formatTime(data.nakshatra?.end)} ${t('upto', lang)})\n*యోగం:* ${tData('yoga', data.yoga?.name, lang)}\n*కరణం:* ${tData('karana', data.karana?.name, lang)}\n*అమృత కాలం:* ${formatTime(data.amritKaal?.start)} - ${formatTime(data.amritKaal?.end)}\n*రాహు కాలం:* ${formatTime(data.rahuKalam?.start)} - ${formatTime(data.rahuKalam?.end)}\n\n*సూర్యోదయం:* ${data.sun?.sunrise} | *సూర్యాస్తమయం:* ${data.sun?.sunset}\n*చంద్ర రాశి:* ${tData('rashi', data.moon?.rashi, lang)}\n\nపూర్తి వివరాల కోసం Way2Astro.com ని సందర్శించండి!`
            : `*Daily Panchang - ${formattedDate}*\nLocation: ${location}\n\n*Hindu Year:* ${data.samvat?.name} (${data.samvat?.vikram})\n*Masa:* ${data.masa?.amanta}\n*Ruthu:* ${data.ritu}\n*Vara:* ${data.vara}\n*Paksha:* ${data.tithi?.paksha}\n*Tithi:* ${data.tithi?.name} (${t('upto', lang)} ${formatTime(data.tithi?.end)})\n*Nakshatra:* ${data.nakshatra?.name} (${t('upto', lang)} ${formatTime(data.nakshatra?.end)})\n*Yoga:* ${data.yoga?.name}\n*Karana:* ${data.karana?.name}\n*Amrit Kal:* ${formatTime(data.amritKaal?.start)} - ${formatTime(data.amritKaal?.end)}\n*Rahu Kal:* ${formatTime(data.rahuKalam?.start)} - ${formatTime(data.rahuKalam?.end)}\n\n*Sunrise:* ${data.sun?.sunrise} | *Sunset:* ${data.sun?.sunset}\n*Moon Sign:* ${data.moon?.rashi}\n\nCheck full details on Way2Astro.com!`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    const generateImage = async (ref) => {
        if (!ref.current) return null;
        return await toPng(ref.current, {
            cacheBust: true,
            useCORS: true,
            pixelRatio: 2, // Higher quality for text
            backgroundColor: '#ffffff' // Ensure white background for the card
        });
    };

    const handleDownloadImage = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow render
        try {
            const dataUrl = await generateImage(printRef);
            if (!dataUrl) throw new Error("Image generation failed");

            const link = document.createElement('a');
            const d = new Date(date);
            const safeDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            link.download = `way2astro-panchang-${safeDate}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            analytics.track('SHARE', 'PANCHANG', 'download_image', { location, date });
        } catch (error) {
            console.error('Failed to download image:', error);
            alert('Failed to generate image.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyImage = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const dataUrl = await generateImage(printRef);
            if (!dataUrl) throw new Error("Image generation failed");

            const blob = await (await fetch(dataUrl)).blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            analytics.track('SHARE', 'PANCHANG', 'copy_to_clipboard', { location, date });
            alert("Image copied to clipboard!");
        } catch (error) {
            console.error('Failed to copy image', error);
            alert("Failed to copy image.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleInstagramShare = async () => {
        if (!instaRef.current) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const dataUrl = await generateImage(instaRef);
            if (!dataUrl) throw new Error("Image generation failed");

            const d = new Date(date);
            const safeDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const fileName = `way2astro-panchang-insta-${safeDate}.png`;

            if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
                // Capacitor Native Sharing
                const base64Data = dataUrl.split(',')[1];
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });
                await Share.share({
                    title: 'Way2Astro Panchang',
                    url: savedFile.uri,
                    dialogTitle: 'Share to Instagram'
                });
            } else {
                // Web Fallback: Web Share API or Download
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], fileName, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file] });
                } else {
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            analytics.track('SHARE', 'PANCHANG', 'instagram_share', { location, date });
        } catch (error) {
            console.error('Failed to share to Instagram', error);
            // Ignore AbortError when user cancels share
            if (error && error.message !== 'Share canceled') {
                console.error(error);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // Shared Card Content Function to allow reuse for Preview and Print
    const CardContent = ({ isHighRes = false, isInstagram = false }) => (
        <div className={`bg-white overflow-hidden relative flex flex-col ${isHighRes ? (isInstagram ? 'w-[1080px] h-[1350px] border-[12px]' : 'w-[1080px] h-auto border-[12px]') : 'w-full h-auto border-4'} border-astro-yellow`}>
            {/* Header / Branding */}
            <div className={`${isHighRes ? (isInstagram ? 'p-4' : 'p-12') : 'p-4'} bg-astro-navy text-white text-center relative overflow-hidden shrink-0`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                {/* Logo Placeholder */}
                <div className={`flex justify-center ${isHighRes ? (isInstagram ? 'mb-2' : 'mb-6') : 'mb-2'}`}>
                    {/* Replaced with Text Logo if image fails, or use path if available */}
                    <h2 className={`${isHighRes ? (isInstagram ? 'text-5xl' : 'text-7xl') : 'text-xl'} font-black tracking-tighter text-white`}>
                        WAY2<span className="text-astro-yellow">ASTRO</span>
                    </h2>
                </div>
                <p className={`${isHighRes ? (isInstagram ? 'text-2xl mt-1' : 'text-4xl mt-4') : 'text-xs'} uppercase tracking-widest opacity-80`}>{lang === 'hi' ? 'दैनिक खगोलीय गाइड' : lang === 'te' ? 'పంచాంగం' : 'Daily Celestial Guide'}</p>
            </div>

            {/* Date & Location */}
            <div className={`bg-orange-50 text-center border-b border-orange-100 shrink-0 ${isHighRes ? (isInstagram ? 'p-3' : 'p-10') : 'p-3'}`}>
                <h3 className={`${isHighRes ? (isInstagram ? 'text-4xl mb-1' : 'text-7xl mb-4') : 'text-lg'} font-bold text-gray-800`}>{formattedDate}</h3>
                <p className={`${isHighRes ? (isInstagram ? 'text-2xl' : 'text-5xl') : 'text-sm'} text-gray-500 font-medium`}>📍 {location}</p>
            </div>

            {/* Panchang Grid */}
            <div className={`${isHighRes ? (isInstagram ? 'p-4 gap-1' : 'p-12 gap-5') : 'p-4 gap-2'} grid bg-white content-start`}>
                {[
                    { label: `🗓️ ${t('hinduYear', lang)}`, value: `${tData('samvatsara', data.samvat?.name, lang) || ''} (${data.samvat?.vikram || ''})` },
                    { label: `🌒 ${t('masa', lang)}`, value: tData('masa', data.masa?.amanta, lang) },
                    { label: `🌦️ ${t('ritu', lang)}`, value: tData('ritu', data.ritu, lang) },
                    { label: `📅 ${t('vara', lang)}`, value: tData('vara', data.vara, lang) },
                    { label: `🌓 ${t('paksha', lang)}`, value: tData('paksha', data.tithi?.paksha, lang) },
                    { label: `✨ ${t('tithi', lang)}`, value: `${tData('tithi', data.tithi?.name, lang)} ${lang === 'te' ? `${formatTime(data.tithi?.end)} ${t('upto', lang)}` : `(${t('upto', lang)} ${formatTime(data.tithi?.end)})`}` },
                    { label: `🌟 ${t('nakshatra', lang)}`, value: `${tData('nakshatra', data.nakshatra?.name, lang)} ${lang === 'te' ? `${formatTime(data.nakshatra?.end)} ${t('upto', lang)}` : `(${t('upto', lang)} ${formatTime(data.nakshatra?.end)})`}` },
                    { label: `🧘 ${t('yoga', lang)}`, value: tData('yoga', data.yoga?.name, lang) },
                    { label: `🦁 ${t('karana', lang)}`, value: tData('karana', data.karana?.name, lang) },
                    { label: `🍯 ${t('amritKaal', lang)}`, value: `${formatTime(data.amritKaal?.start)} - ${formatTime(data.amritKaal?.end)}`, isTime: true },
                    { label: `⚠️ ${t('rahuKalam', lang)}`, value: `${formatTime(data.rahuKalam?.start)} - ${formatTime(data.rahuKalam?.end)}`, isTime: true, isBad: true },
                ].map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center border-b border-dashed border-gray-200 ${isHighRes ? (isInstagram ? 'pb-1 last:border-0' : 'pb-3 last:border-0') : 'pb-1 last:border-0'}`}>
                        <span className={`${isHighRes ? (isInstagram ? 'text-3xl' : 'text-5xl') : 'text-xs'} text-gray-500 font-medium`}>{item.label}</span>
                        <div className="text-right">
                            <span className={`block ${isHighRes ? (isInstagram ? 'text-3xl' : 'text-5xl') : 'text-xs'} font-bold ${item.isBad ? 'text-rose-600' : 'text-astro-navy'}`}>
                                {item.value || '-'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Features Section (Follows the grid directly now) */}
            {isInstagram && isHighRes && (
                <div className="pb-2 px-8 text-center bg-white shrink-0 border-t border-gray-100">
                    <div className="border-t-4 border-dashed border-gray-100 w-1/4 mx-auto mb-3"></div>
                    <p className="text-astro-navy font-black text-2xl mb-3 tracking-widest uppercase">
                        {lang === 'hi' ? '✨ हमारी सेवाएं ✨' : lang === 'te' ? '✨ మా సేవలు ✨' : '✨ OUR SERVICES ✨'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xl font-bold text-gray-700">
                        {[
                            { icon: '📜', hi: 'कुण्डली', te: 'కుండలి', en: 'Kundli' },
                            { icon: '💑', hi: 'मिलान', te: 'పొంతన', en: 'Matching' },
                            { icon: '🔍', hi: 'दोष जांच', te: 'దోష తనిఖీ', en: 'Dosha Check' },
                            { icon: '🔮', hi: 'राशिफल', te: 'రాశిఫలాలు', en: 'Horoscope' },
                            { icon: '⏳', hi: 'दशा', te: 'దశ', en: 'Dasha' },
                            { icon: '🪐', hi: 'गोचर', te: 'గోచారం', en: 'Gochar' },
                            { icon: '💍', hi: 'विवाह', te: 'వివాహం', en: 'Marriage' },
                            { icon: '💼', hi: 'करियर', te: 'కెరీర్', en: 'Career' },
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                                <span>{s.icon}</span>
                                <span>{lang === 'hi' ? s.hi : lang === 'te' ? s.te : s.en}</span>
                                {i < 7 && <span className="ml-4 text-gray-300 opacity-50">|</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Logo box to fill the gap in Instagram Card */}
            {isInstagram && isHighRes && (
                <div className="flex-grow bg-white flex items-center justify-center p-8">
                    {logos.panchangSharePromo ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <img
                                src={resolveImageUrl(logos.panchangSharePromo)}
                                alt="Promotion"
                                className="w-full h-auto max-h-full object-contain"
                            />
                        </div>
                    ) : (logos.report || logos.desktop) ? (
                        <div className="opacity-20 transform scale-150">
                            <img
                                src={resolveImageUrl(logos.report || logos.desktop)}
                                alt="Logo"
                                className="max-h-32 w-auto object-contain"
                            />
                        </div>
                    ) : (
                        <div className="opacity-15 transform scale-125">
                            <h2 className="text-9xl font-black tracking-tighter text-astro-navy">
                                WAY2<span className="text-astro-yellow">ASTRO</span>
                            </h2>
                        </div>
                    )}
                </div>
            )}

            {/* Spacer for non-Instagram layouts to push footer down if needed, mostly auto-height though */}
            {(!isInstagram || !isHighRes) && <div className="flex-grow bg-white"></div>}

            {/* Sun/Moon Section */}
            <div className={`bg-indigo-900 text-white flex justify-around items-center text-center shrink-0 border-t border-white/20 ${isHighRes ? (isInstagram ? 'p-3 text-2xl' : 'p-10 text-4xl') : 'p-3 text-xs'}`}>
                <div>
                    <span className="block text-astro-yellow mb-1 font-bold flex items-center justify-center gap-1">
                        <Sun size={isHighRes ? (isInstagram ? 32 : 64) : 12} /> {t('sunrise', lang)}
                    </span>
                    {data.sun?.sunrise}
                </div>
                <div className={`h-full w-px bg-white/20 ${isHighRes ? (isInstagram ? 'mx-2' : 'mx-4') : 'mx-1'}`}></div>
                <div>
                    <span className="block text-astro-yellow mb-1 font-bold flex items-center justify-center gap-1">
                        <ArrowDown size={isHighRes ? (isInstagram ? 32 : 64) : 12} /> {t('sunset', lang)}
                    </span>
                    {data.sun?.sunset}
                </div>
                <div className={`h-full w-px bg-white/20 ${isHighRes ? (isInstagram ? 'mx-2' : 'mx-4') : 'mx-1'}`}></div>
                <div>
                    <span className="block text-astro-yellow mb-1 font-bold flex items-center justify-center gap-1">
                        <Moon size={isHighRes ? (isInstagram ? 32 : 64) : 12} /> {t('moonSign', lang)}
                    </span>
                    {tData('rashi', data.moon?.rashi, lang)}
                </div>
            </div>

            {/* Footer */}
            <div className={`bg-gray-100 text-center shrink-0 border-t border-gray-200 ${isHighRes ? (isInstagram ? 'p-2' : 'p-6') : 'p-2'}`}>
                <p className={`${isHighRes ? (isInstagram ? 'text-3xl' : 'text-4xl') : 'text-[10px]'} text-gray-500 font-bold uppercase tracking-tighter`}>
                    {lang === 'hi'
                        ? (isInstagram ? '✨ अधिक जानकारी के लिए Way2Astro.com पर जाएं ✨' : 'पूर्ण विवरण के लिए Way2Astro.com पर जाएं')
                        : lang === 'te'
                            ? (isInstagram ? '✨ మరిన్ని వివరాల కోసం Way2Astro.com ని సందర్శించండి ✨' : 'పూర్తి వివరాల కోసం Way2Astro.com ని సందర్శించండి')
                            : (isInstagram ? '✨ Visit Way2Astro.com for more details ✨' : 'Visit Way2Astro.com for full details')}
                </p>
            </div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[max(4rem,env(safe-area-inset-top,4rem))] sm:items-center sm:pt-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* MODAL WRAPPER */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800 z-10 flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Share2 size={18} className="text-astro-yellow" /> {lang === 'hi' ? 'पंचांग शेयर करें' : lang === 'te' ? 'పంచాంగం షేర్ చేయండి' : 'Share Panchang'}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Visible Preview Card */}
                        <div ref={cardRef} className="relative w-full bg-[#0B1120] p-4 sm:p-6 flex justify-center flex-1 overflow-y-auto min-h-0">
                            <div className="w-full max-w-[320px] rounded-xl overflow-hidden shadow-2xl ring-4 ring-slate-800 h-max mx-auto mt-0 lg:my-auto">
                                <CardContent isHighRes={false} />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 p-4 bg-[#0F1623] border-t border-slate-800 flex items-center justify-between gap-3">
                            <button
                                onClick={handleDownloadImage}
                                disabled={isGenerating}
                                className="w-12 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                                title="Download Image"
                            >
                                <Download size={18} />
                            </button>

                            <button
                                onClick={handleCopyImage}
                                disabled={isGenerating}
                                className="w-12 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                                title="Copy to Clipboard"
                            >
                                <Copy size={18} />
                            </button>

                            <button
                                onClick={handleInstagramShare}
                                disabled={isGenerating}
                                className="flex-1 h-10 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-lg transition-colors bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                            >
                                <Instagram size={16} /> {lang === 'hi' ? 'शेयर करें' : lang === 'te' ? 'షేర్ చేయండి' : 'Share'}
                            </button>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => analytics.track('SHARE', 'PANCHANG', 'whatsapp_share', { location, date })}
                                className="flex-1 h-10 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                <MessageCircle size={18} /> Whatsapp
                            </a>
                        </div>
                    </motion.div>

                    {/* HIDDEN HIGH-RES CARD FOR GENERATION (AUTO HEIGHT) */}
                    <div className="fixed top-0 left-[-9999px] z-[-50] opacity-100 pointer-events-none">
                        <div ref={printRef}>
                            <CardContent isHighRes={true} />
                        </div>
                    </div>

                    {/* HIDDEN INSTAGRAM CARD FOR GENERATION (FIXED 1080x1350) */}
                    <div className="fixed top-0 left-[-9999px] z-[-50] opacity-100 pointer-events-none">
                        <div ref={instaRef}>
                            <CardContent isHighRes={true} isInstagram={true} />
                        </div>
                    </div>

                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
