
"use client";

import { useState, useRef } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import API from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl } from '@/lib/urlHelper';

export default function AstrologerGallery({ images = [], astrologerId, isOwner, onGalleryUpdate }) {
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const scrollRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await API.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const fullUrl = res.data.filePath; // Backend returns full URL

                // Update Gallery via API
                const newGallery = [...images, fullUrl];
                await API.put(`/astro/astrologers/${astrologerId}`, { gallery: newGallery });

                onGalleryUpdate(newGallery);
                toast.success('Image added to gallery');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imgUrl) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const newGallery = images.filter(img => img !== imgUrl);
            await API.put(`/astro/astrologers/${astrologerId}`, { gallery: newGallery });
            onGalleryUpdate(newGallery);
            toast.success('Image removed');
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (images.length === 0 && !isOwner) return null;

    return (
        <div className="space-y-4 group">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Gallery</h3>
                {isOwner && images.length < 3 && (
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2">
                        {uploading ? <span className="animate-spin">⌛</span> : <Plus size={14} />}
                        Add Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                )}
            </div>

            <div className="relative px-2 group">
                {/* Scroll Buttons - Mobile Only */}
                {images.length > 1 && (
                    <div className="md:hidden">
                        <button
                            onClick={(e) => { e.preventDefault(); scroll('left'); }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-1.5 rounded-full shadow-md text-slate-800 border border-slate-100 active:scale-95 transition-transform"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); scroll('right'); }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-1.5 rounded-full shadow-md text-slate-800 border border-slate-100 active:scale-95 transition-transform"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    className="flex gap-4 pb-4 px-1 justify-start overflow-x-auto scrollbar-hide md:overflow-hidden md:justify-start"
                >
                    {images.slice(0, 3).map((img, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={img}
                            className="relative flex-shrink-0 w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden cursor-pointer group/item shadow-sm border border-slate-100"
                            onClick={() => setSelectedImage(img)}
                        >
                            <img src={resolveImageUrl(img)} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                            {isOwner && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors pointer-events-none" />
                        </motion.div>
                    ))}

                    {images.length === 0 && isOwner && (
                        <div className="w-40 h-40 md:w-56 md:h-56 flex items-center justify-center text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm flex-shrink-0 p-4">
                            Upload photos to showcase your work
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors">
                            <X size={32} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative max-w-4xl max-h-[85vh] w-auto h-auto p-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={resolveImageUrl(selectedImage)}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                                alt="Gallery View"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
