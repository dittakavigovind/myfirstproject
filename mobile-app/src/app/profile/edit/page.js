"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ChevronLeft, Camera, Save, Loader2, Image as ImageIcon, Calendar, Clock, MapPin, Info } from "lucide-react";
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

    const formatBirthDate = (rawDate) => {
        if (!rawDate) return "Not Set";
        const str = String(rawDate).trim();
        const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymdMatch) {
            return `${ymdMatch[3]}/${ymdMatch[2]}/${ymdMatch[1]}`;
        }
        const d = new Date(str);
        if (isNaN(d.getTime())) return str;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatBirthTime = (rawTime) => {
        if (!rawTime) return "Not Set";
        const str = String(rawTime).trim();
        if (str.includes('T')) {
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
        }
        const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
        if (ampmMatch) {
            return `${parseInt(ampmMatch[1], 10)}:${ampmMatch[2]} ${ampmMatch[3].toUpperCase()}`;
        }
        const hmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
        if (hmMatch) {
            const hours = parseInt(hmMatch[1], 10);
            const mins = hmMatch[2];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            return `${h12}:${mins} ${ampm}`;
        }
        return str;
    };

    const dobDisplay = formatBirthDate(user?.birthDetails?.date || user?.birthDetails?.dob);
    const tobDisplay = formatBirthTime(user?.birthDetails?.time || user?.birthDetails?.tob);
    const pobDisplay = user?.birthDetails?.place || user?.birthDetails?.pob || "Not Set";

    const birthDetailRows = [
        {
            label: "Date of Birth",
            value: dobDisplay,
            icon: Calendar,
            iconClass: "bg-blue-500/15 border-blue-500/20 text-blue-400"
        },
        {
            label: "Time of Birth",
            value: tobDisplay,
            icon: Clock,
            iconClass: "bg-purple-500/15 border-purple-500/20 text-purple-400"
        },
        {
            label: "Place of Birth",
            value: pobDisplay,
            icon: MapPin,
            iconClass: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400",
            wrap: true
        }
    ];

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="flex items-center pt-1 pb-3 relative">
                <button 
                    type="button"
                    onClick={() => router.back()}
                    className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/10 active:scale-90 transition-all z-10 text-white/80 hover:text-white"
                    aria-label="Back"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-2">
                    <h1 className="text-base font-black text-white tracking-tight">Edit Profile</h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                
                {/* Photo Upload Section */}
                <div className="p-4 rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-2.5">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-[22px] p-0.5 bg-gradient-to-tr from-electric-violet via-fuchsia-500 to-solar-gold shadow-xl shadow-electric-violet/25">
                            <div className="w-full h-full rounded-[20px] overflow-hidden bg-[#0c102a] border border-white/10 relative">
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <Loader2 size={22} className="text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            type="button"
                            onClick={handleImageClick}
                            disabled={uploading}
                            className="absolute -bottom-1 -right-1 w-8 h-8 bg-electric-violet rounded-full flex items-center justify-center border-2 border-[#050716] shadow-lg active:scale-90 transition-all disabled:opacity-50"
                            aria-label="Upload photo"
                        >
                            <Camera size={13} className="text-white" />
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
                    <p className="text-[11px] text-slate-400 font-medium">Tap camera icon to update photo</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Display Name</label>
                        <input 
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            disabled={!isAdmin}
                            className={`w-full h-12 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet/50 transition-all ${!isAdmin ? 'text-slate-400 opacity-60 cursor-not-allowed' : 'text-white'}`}
                            placeholder="Enter your name"
                            required
                        />
                        {!isAdmin && <p className="text-[10px] text-slate-500 mt-1 ml-1 font-medium">Display name cannot be changed.</p>}
                    </div>

                    {isAstrologer && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bio / About Me</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 text-sm text-white font-medium focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet/50 transition-all resize-none leading-relaxed"
                                placeholder="Tell users about your experience and expertise..."
                            />
                        </div>
                    )}

                    {!isAstrologer && (
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 block">Birth Details</label>

                            <div className="rounded-[22px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 divide-y divide-white/[0.07] overflow-hidden">
                                {birthDetailRows.map((row) => {
                                    const Icon = row.icon;
                                    return (
                                        <div key={row.label} className="px-3.5 py-2.5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${row.iconClass}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</span>
                                            </div>
                                            <span className={`text-[13px] font-bold text-white text-right min-w-0 ${row.wrap ? 'leading-snug break-words' : 'whitespace-nowrap'}`}>
                                                {row.value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/20">
                                <Info size={14} className="text-indigo-300 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-300 font-medium leading-snug">
                                    To change or update your birth details, please log in to our website (<span className="text-indigo-300 font-bold">way2astro.com</span>).
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-1">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-solar-gold to-amber-500 text-black flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-solar-gold/20 font-black text-xs uppercase tracking-widest"
                    >
                        {saving ? (
                            <Loader2 size={22} className="animate-spin text-black" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save size={16} />
                                <span>Save Changes</span>
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
