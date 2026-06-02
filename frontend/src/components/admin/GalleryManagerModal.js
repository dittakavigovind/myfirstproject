import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Trash2, Loader2, AlertCircle } from 'lucide-react';
import API from '../../lib/api';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '../../lib/urlHelper';

export default function GalleryManagerModal({ astrologer, onClose, onSuccess }) {
    const [gallery, setGallery] = useState(astrologer?.gallery || []);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const MAX_IMAGES = 4;

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (gallery.length + files.length > MAX_IMAGES) {
            toast.error(`You can only upload up to ${MAX_IMAGES} images in total.`);
            return;
        }

        setUploading(true);
        const newGallery = [...gallery];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file.`);
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await API.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (res.data.success) {
                    newGallery.push(res.data.filePath);
                }
            } catch (err) {
                console.error("Upload error:", err);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setGallery(newGallery);
        setUploading(false);
    };

    const handleDelete = (index) => {
        const newGallery = [...gallery];
        newGallery.splice(index, 1);
        setGallery(newGallery);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await API.put(`/astro/astrologers/${astrologer._id}`, { gallery });
            if (res.data.success) {
                toast.success('Gallery updated successfully');
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.data.message || 'Failed to update gallery');
            }
        } catch (error) {
            console.error("Save gallery error:", error);
            toast.error(error.response?.data?.message || 'Failed to update gallery');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <ImageIcon className="text-indigo-600" /> Sacred Gallery Manager
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Manage images for {astrologer?.displayName || astrologer?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6">
                        <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Gallery Guidelines</p>
                            <ul className="list-disc pl-4 space-y-1 text-blue-700/80">
                                <li>Upload up to {MAX_IMAGES} images showcasing the astrologer's workspace, certificates, or pooja setup.</li>
                                <li>Only image files are allowed (JPG, PNG, WebP).</li>
                                <li>Images should be clear and well-lit.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mb-4 flex justify-between items-end">
                        <h4 className="font-bold text-slate-700">Current Images ({gallery.length}/{MAX_IMAGES})</h4>
                        
                        {gallery.length < MAX_IMAGES && (
                            <div>
                                <input
                                    type="file"
                                    id="gallery-upload"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="gallery-upload"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors ${
                                        uploading 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                    }`}
                                >
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Image Grid */}
                    {gallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {gallery.map((img, index) => (
                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                    <img 
                                        src={resolveImageUrl(img)} 
                                        alt={`Gallery ${index + 1}`} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDelete(index)}
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform transform hover:scale-110 shadow-lg"
                                            title="Remove Image"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon size={24} className="text-slate-400" />
                            </div>
                            <h5 className="font-bold text-slate-700 mb-1">No images yet</h5>
                            <p className="text-sm text-slate-500 max-w-sm">Upload images to help users get to know this astrologer better.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition"
                        disabled={saving || uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={saving || uploading}
                    >
                        {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Gallery'}
                    </button>
                </div>
            </div>
        </div>
    );
}
