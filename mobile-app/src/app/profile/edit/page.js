"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ChevronLeft, Camera, Save, User, Loader2, Image as ImageIcon } from "lucide-react";
import CosmicCard from "@/components/CosmicCard";
import CosmicLoader from "@/components/CosmicLoader";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProfile() {
    const router = useRouter();
    const { user, checkUser } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        profileImage: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || user.name || "",
                bio: user.bio || "",
                profileImage: user.profileImage || ""
            });
            setLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        setShowPhotoOptions(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const uploadData = new FormData();
            uploadData.append('file', file);
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (data.success || data.filePath) {
                const path = data.filePath || data.url; 
                setFormData(prev => ({ ...prev, profileImage: path }));
            } else {
                toast.error("Image upload failed");
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { data } = await api.put('/users/profile', formData);
            if (data.success) {
                if (checkUser) await checkUser();
                router.back();
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Save error", error);
            toast.error("An error occurred while saving profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <CosmicLoader />;

    const isAstrologer = user?.role === 'astrologer';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-[#0b1026] pb-40">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0b1026]/80 backdrop-blur-2xl border-b border-white/5 pt-[var(--safe-area-inset-top)]">
                <div className="flex items-center px-4 h-16 relative">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-95 transition-all z-10"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-lg font-black text-white tracking-tight">Edit Profile</h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-6">
                
                {/* Photo Upload Section */}
                <CosmicCard className="p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-electric-violet to-solar-gold shadow-xl shadow-electric-violet/20">
                            <div className="w-full h-full rounded-full overflow-hidden bg-cosmic-indigo border-2 border-[#0b1026] relative">
                                {formData.profileImage ? (
                                    <img 
                                        src={getImageUrl(formData.profileImage, user?.gender)} 
                                        alt="Profile" 
                                        className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getImageUrl(null, user?.gender);
                                        }}
                                    />
                                ) : (
                                    <img src={getImageUrl(null, user?.gender)} alt="Profile" className="w-full h-full object-cover p-1 opacity-90" />
                                )}
                                
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                        <Loader2 size={24} className="text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            type="button"
                            onClick={handleImageClick}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-electric-violet rounded-full flex items-center justify-center border-2 border-[#0b1026] shadow-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Camera size={14} className="text-white" />
                        </button>
                        
                        {/* Hidden inputs for both methods */}
                        <input 
                            type="file"
                            ref={cameraInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            capture="user"
                            className="hidden"
                        />
                        <input 
                            type="file"
                            ref={galleryInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Tap the camera icon to upload a photo</p>
                </CosmicCard>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Display Name</label>
                        <input 
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            disabled={!isAdmin}
                            className={`w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 font-medium focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet/50 transition-all ${!isAdmin ? 'text-slate-400 opacity-60 cursor-not-allowed' : 'text-white'}`}
                            placeholder="Enter your name"
                            required
                        />
                        {!isAdmin && <p className="text-[10px] text-slate-500 mt-1 ml-1 font-medium">Display name cannot be changed.</p>}
                    </div>

                    {isAstrologer && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Bio / About Me</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet/50 transition-all resize-none"
                                placeholder="Tell users about your experience and expertise..."
                            />
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-6">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-electric-violet to-cosmic-indigo flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-white/10"
                    >
                        {saving ? (
                            <Loader2 size={24} className="text-white animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest">
                                <Save size={18} />
                                Save Profile
                            </div>
                        )}
                    </button>
                </div>
            </form>

            {/* Photo Selection Bottom Sheet */}
            <AnimatePresence>
                {showPhotoOptions && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setShowPhotoOptions(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ y: "100%" }} 
                            animate={{ y: 0 }} 
                            exit={{ y: "100%" }} 
                            className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border-white/10 z-10"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 text-center">Update Profile Photo</h3>
                            <div className="space-y-3">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowPhotoOptions(false); cameraInputRef.current?.click(); }}
                                    className="w-full py-4 rounded-2xl bg-electric-violet text-white font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
                                >
                                    <Camera size={20} /> Take a Selfie
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => { setShowPhotoOptions(false); galleryInputRef.current?.click(); }}
                                    className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/5"
                                >
                                    <ImageIcon size={20} /> Choose from Gallery
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowPhotoOptions(false)}
                                    className="w-full py-3 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all mt-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
