"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Sparkles } from 'lucide-react';
import { Share } from '@capacitor/share';
import { getImageUrl } from '@/lib/utils';
import api from '@/lib/api';

export default function DailyBlessingModal({ isOpen, onClose, blessing }) {
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (isOpen && blessing) {
            // Track Impression when opened
            api.post('/analytics/daily-blessing', { 
                action: 'daily_blessing_impression',
                blessingId: blessing.id
            }).catch(console.error);
        }
    }, [isOpen, blessing]);

    if (!blessing) return null;

    const handleShare = async () => {
        setIsSharing(true);
        
        try {
            api.post('/analytics/daily-blessing', { 
                action: 'daily_blessing_share_clicked',
                blessingId: blessing.id
            }).catch(console.error);

            const shareData = {
                title: "Today's Divine Blessing",
                text: `${blessing.greeting}\n\n${blessing.message}\n\n✨ Start your day with divine blessings on Way2Astro.`,
                url: blessing.deepLink,
                dialogTitle: "Share Divine Blessing",
            };

            // Use Capacitor Share plugin
            const canShare = await Share.canShare();
            
            if (canShare.value) {
                await Share.share(shareData);
                api.post('/analytics/daily-blessing', { 
                    action: 'daily_blessing_shared',
                    blessingId: blessing.id
                }).catch(console.error);
            } else if (navigator.share) {
                // Fallback to web share api
                await navigator.share(shareData);
                api.post('/analytics/daily-blessing', { 
                    action: 'daily_blessing_shared',
                    blessingId: blessing.id
                }).catch(console.error);
            } else {
                // Final fallback
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert("Blessing link copied to clipboard!");
            }
        } catch (error) {
            console.log('Error sharing or share cancelled:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleClose = () => {
        api.post('/analytics/daily-blessing', { 
            action: 'daily_blessing_dismissed',
            blessingId: blessing.id
        }).catch(console.error);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    
                    {/* Modal Content */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] rounded-3xl overflow-hidden shadow-2xl border border-electric-violet/30 flex flex-col max-h-[90vh]"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={handleClose}
                            className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors"
                        >
                            <X size={18} className="text-white" />
                        </button>

                        {/* Image Container */}
                        <div className="w-full aspect-square relative bg-black shrink-0">
                            <img 
                                src={getImageUrl(blessing.imageUrl)} 
                                alt={blessing.deityName} 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Gradient Overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B] via-transparent to-transparent opacity-90" />
                            
                            <div className="absolute bottom-4 left-0 w-full text-center px-4">
                                <h2 className="text-2xl font-bold text-solar-gold flex items-center justify-center gap-2 drop-shadow-lg">
                                    <Sparkles size={20} />
                                    {blessing.greeting}
                                    <Sparkles size={20} />
                                </h2>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 flex flex-col items-center text-center overflow-y-auto hide-scrollbar">
                            <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-electric-violet/50" />
                                Today's Blessing
                                <span className="w-8 h-[1px] bg-electric-violet/50" />
                            </h3>
                            
                            <p className="text-white text-[15px] leading-relaxed italic font-serif mb-4">
                                "{blessing.message}"
                            </p>

                            {blessing.mantra && (
                                <p className="text-solar-gold font-bold text-lg mb-6 drop-shadow-md">
                                    {blessing.mantra}
                                </p>
                            )}

                            <button 
                                onClick={handleShare}
                                disabled={isSharing}
                                className="w-full bg-gradient-to-r from-electric-violet to-fuchsia-600 hover:from-electric-violet hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-electric-violet/30 active:scale-95 transition-all flex items-center justify-center gap-2 mb-3"
                            >
                                <Share2 size={20} />
                                Share Blessing
                            </button>
                            
                            <button 
                                onClick={handleClose}
                                className="w-full py-2 text-slate-400 text-sm font-medium hover:text-white transition-colors"
                            >
                                Continue to App →
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
