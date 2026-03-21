"use client";

import { useState, useEffect, useRef } from 'react';
import API from '../../lib/api';
import { Upload, Copy, Trash2, Search, Link as LinkIcon, AlertCircle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaGallery() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await API.get('/media');
            if (res.data.success) {
                setMedia(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
            toast.error('Failed to load media gallery');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await API.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success('Image uploaded successfully');
                fetchMedia();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const handleDelete = async (item) => {
        if (item.usageCount > 0) {
            if (!confirm(`Warning: This image is used in ${item.usageCount} place(s). Deleting it will break those links. Are you sure?`)) {
                return;
            }
        } else {
            if (!confirm('Are you sure you want to delete this image?')) return;
        }

        try {
            await API.delete(`/media/${item._id}${item.usageCount > 0 ? '?force=true' : ''}`);
            toast.success('Image deleted');
            fetchMedia();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const filteredMedia = media.filter(item => 
        item.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Media Gallery</h2>
                    <p className="text-sm text-slate-500">Upload and manage images for your articles</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search images..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Upload size={18} />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse border border-slate-200"></div>
                    ))}
                </div>
            ) : filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredMedia.map((item) => (
                        <div key={item._id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all">
                            <div className="aspect-square relative overflow-hidden bg-slate-50">
                                <img 
                                    src={item.url} 
                                    alt={item.originalName} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <button 
                                        onClick={() => copyToClipboard(item.url)}
                                        className="p-2 bg-white text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                                        title="Copy Link"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item)}
                                        className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                {item.usageCount > 0 && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {item.usageCount} Usages
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-medium text-slate-700 truncate" title={item.originalName || item.filename}>
                                    {item.originalName || item.filename}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {(item.size / 1024 / 1024).toFixed(2)} MB • {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <LinkIcon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No images found</h3>
                    <p className="text-slate-500 mt-1 max-w-xs mx-auto text-sm">Upload your first image to get started. You can use the links in your blog posts.</p>
                </div>
            )}
        </div>
    );
}
