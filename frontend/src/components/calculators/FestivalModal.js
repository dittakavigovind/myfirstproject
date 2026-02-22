import React, { useRef, useState } from 'react';
import { X, Calendar, Share2, MessageCircle, Download, ImageIcon, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

export default function FestivalModal({ isOpen, onClose, festival, date, panchang }) {
    const cardRef = useRef(null); // Ref for the visible modal content (unused for gen now)
    const printRef = useRef(null); // Ref for the hidden high-quality card
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen || !festival) return null;

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const shareText = `* ${festival.name}* \n_${formattedDate} _\n\n${festival.description} \n\n * Panchang Details:*\nPaksha: ${panchang.tithi.paksha} \nTithi: ${panchang.tithi.name} \nMonth: ${panchang.masa.amanta} \n\nCheck more on Way2Astro!`;

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    const generateImage = async (ref) => {
        if (!ref.current) return null;
        // Generate with high quality settings
        return await toPng(ref.current, {
            cacheBust: true,
            // We don't set backgroundColor here because the card has its own gradient
            useCORS: true,
            pixelRatio: 1, // 1:1 mapping for 1080x1080
            width: 1080, // Match element styling
            height: 1350 // Match element styling
        });
    };

    const handleDownloadImage = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        // dataUrl generation needs a moment for state overlap
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const dataUrl = await generateImage(printRef);
            if (!dataUrl) throw new Error("Image generation failed");

            const link = document.createElement('a');
            link.download = `${festival.name.replace(/\s+/g, '_')}_Way2Astro.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download image:', error);
            alert(`Failed to generate image: ${error.message || 'Unknown error'}`);
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
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);

            alert("Image copied to clipboard! You can now paste it in WhatsApp/Telegram.");
        } catch (error) {
            console.error('Failed to copy image', error);
            alert("Failed to copy image. Your browser might not support this feature.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShareImage = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            const dataUrl = await generateImage(printRef);
            if (!dataUrl) throw new Error("Image generation failed");

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `${festival.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: festival.name,
                    text: `Check out ${festival.name} on Way2Astro!`,
                    files: [file]
                });
            } else {
                // Fallback to download if share not supported
                const link = document.createElement('a');
                link.download = `${festival.name.replace(/\s+/g, '_')}_Way2Astro.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Failed to share image', error);
            alert("Failed to share image.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* VISIBLE MODAL - MATCHING DESIGN */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-800"
                    >
                        {/* Header with Close Button */}
                        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white">Festivals</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Card - Dark Navy Theme */}
                        <div ref={cardRef} className="relative w-full bg-[#0B1120] overflow-hidden group">

                            {/* Detailed Background styling */}
                            <div className="absolute inset-0 border-[12px] border-[#0B1120] rounded-none z-20 pointer-events-none"></div>
                            <div className="absolute inset-3 border border-amber-500/20 rounded-xl z-20 pointer-events-none"></div>

                            {/* Content Container */}
                            <div className="relative z-10 w-full flex flex-col items-center p-6 text-white">

                                {/* Icon Circle */}
                                <div className="mt-4 mb-4 relative">
                                    <div className="w-20 h-20 rounded-full border border-amber-500/50 flex items-center justify-center bg-[#0B1120] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                            {/* Dynamic Icon or Fallback - defaulting to Om for now as specific icons are missing */}
                                            <img
                                                src={"/icons/om.png"}
                                                alt="icon"
                                                className="w-10 h-10 object-contain brightness-200"
                                                crossOrigin="anonymous"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-amber-100 font-serif tracking-wide text-center mb-2">
                                    {festival.name}
                                </h2>

                                {/* Deity Tag */}
                                {festival.deity && (
                                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-[#1a202c] px-3 py-1 rounded-full border border-amber-500/20 mb-3">
                                        {festival.deity}
                                    </span>
                                )}

                                {/* Date */}
                                <p className="text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase mb-6">
                                    {formattedDate}
                                </p>

                                {/* Quote */}
                                <div className="text-center mb-8 px-4">
                                    <p className="text-slate-400 font-light text-xs italic leading-relaxed">
                                        "{festival.description}"
                                    </p>
                                </div>

                                {/* Panchang Grid - 2x2 with Separators */}
                                <div className="w-full border-t border-slate-800 border-b border-slate-800 mb-6">
                                    <div className="grid grid-cols-2">
                                        {/* Paksha */}
                                        <div className="p-3 text-center border-r border-b border-slate-800">
                                            <span className="block text-[8px] text-amber-600 uppercase font-bold tracking-wider mb-0.5">Paksha</span>
                                            <span className="block text-xs font-bold text-white">{panchang.tithi.paksha}</span>
                                        </div>
                                        {/* Tithi */}
                                        <div className="p-3 text-center border-b border-slate-800">
                                            <span className="block text-[8px] text-amber-600 uppercase font-bold tracking-wider mb-0.5">Tithi</span>
                                            <span className="block text-xs font-bold text-white">{panchang.tithi.name}</span>
                                        </div>
                                        {/* Month */}
                                        <div className="p-3 text-center border-r border-slate-800">
                                            <span className="block text-[8px] text-amber-600 uppercase font-bold tracking-wider mb-0.5">Month</span>
                                            <span className="block text-xs font-bold text-white">{panchang.masa.amanta}</span>
                                        </div>
                                        {/* Nakshatra */}
                                        <div className="p-3 text-center">
                                            <span className="block text-[8px] text-amber-600 uppercase font-bold tracking-wider mb-0.5">Nakshatra</span>
                                            <span className="block text-xs font-bold text-white">{panchang.nakshatra?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer URL */}
                                <div className="mb-2">
                                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase">
                                        WWW.WAY2ASTRO.COM
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 bg-[#0F1623] border-t border-slate-800 flex items-center justify-between gap-3">

                            {/* Download Icon Button */}
                            <button
                                onClick={handleDownloadImage}
                                disabled={isGenerating}
                                className="w-12 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                            >
                                <Download size={18} />
                            </button>

                            {/* Copy Button */}
                            <button
                                onClick={handleCopyImage}
                                disabled={isGenerating}
                                className="w-12 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                                title="Copy to Clipboard"
                            >
                                <Copy size={18} />
                            </button>

                            {/* Share Card Button */}
                            <button
                                onClick={handleShareImage}
                                disabled={isGenerating}
                                className="flex-1 h-10 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                <ImageIcon size={16} />
                                Share
                            </button>

                            {/* Whatsapp Text Button */}
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 h-10 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                <MessageCircle size={18} />
                                Whatsapp
                            </a>
                        </div>
                    </motion.div>

                    {/* HIDDEN HIGH-RES CARD FOR GENERATION (Same design but scaled up) */}
                    <div className="fixed top-0 left-[-9999px] z-[-50] opacity-100 pointer-events-none">
                        <div
                            ref={printRef}
                            style={{
                                width: '1080px',
                                height: '1350px', // Portrait aspect ratio for social media
                                backgroundColor: '#0B1120',
                            }}
                            className="relative flex flex-col items-center p-16 text-white"
                        >
                            {/* Borders */}
                            <div className="absolute inset-0 border-[30px] border-[#0B1120] z-20"></div>
                            <div className="absolute inset-8 border-2 border-amber-500/20 rounded-3xl z-20"></div>

                            {/* Content */}
                            <div className="mt-16 mb-8 relative z-30 flex flex-col items-center w-full">
                                {/* Icon */}
                                <div className="w-40 h-40 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-[#0B1120] shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-10">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        {/* Use local OM PNG which exists, ignoring the missing festival-specific icons for now to prevent generation errors */}
                                        <img
                                            src="/icons/om.png"
                                            alt="icon"
                                            className="w-20 h-20 object-contain brightness-200"
                                            crossOrigin="anonymous"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-6xl font-bold text-amber-100 font-serif tracking-wide text-center mb-6">
                                    {festival.name}
                                </h1>

                                {/* Deity Tag */}
                                {festival.deity && (
                                    <span className="text-2xl text-amber-500 font-bold uppercase tracking-widest bg-[#1a202c] px-8 py-3 rounded-full border border-amber-500/20 mb-8">
                                        {festival.deity}
                                    </span>
                                )}

                                {/* Date */}
                                <p className="text-2xl text-slate-400 font-bold tracking-[0.15em] uppercase mb-16">
                                    {formattedDate}
                                </p>

                                {/* Quote */}
                                <div className="text-center mb-20 px-12 w-full max-w-4xl">
                                    <p className="text-slate-400 font-light text-4xl italic leading-relaxed">
                                        "{festival.description}"
                                    </p>
                                </div>

                                {/* Panchang Grid */}
                                <div className="w-full max-w-3xl border-t-2 border-b-2 border-slate-800 mb-16">
                                    <div className="grid grid-cols-2">
                                        <div className="p-8 text-center border-r-2 border-b-2 border-slate-800">
                                            <span className="block text-xl text-amber-600 uppercase font-bold tracking-wider mb-2">Paksha</span>
                                            <span className="block text-3xl font-bold text-white">{panchang.tithi.paksha}</span>
                                        </div>
                                        <div className="p-8 text-center border-b-2 border-slate-800">
                                            <span className="block text-xl text-amber-600 uppercase font-bold tracking-wider mb-2">Tithi</span>
                                            <span className="block text-3xl font-bold text-white">{panchang.tithi.name}</span>
                                        </div>
                                        <div className="p-8 text-center border-r-2 border-slate-800">
                                            <span className="block text-xl text-amber-600 uppercase font-bold tracking-wider mb-2">Month</span>
                                            <span className="block text-3xl font-bold text-white">{panchang.masa.amanta}</span>
                                        </div>
                                        <div className="p-8 text-center">
                                            <span className="block text-xl text-amber-600 uppercase font-bold tracking-wider mb-2">Nakshatra</span>
                                            <span className="block text-3xl font-bold text-white">{panchang.nakshatra?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer URL */}
                                <div className="mt-auto mb-12">
                                    <span className="text-2xl font-bold tracking-[0.3em] text-slate-600 uppercase">
                                        WWW.WAY2ASTRO.COM
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
