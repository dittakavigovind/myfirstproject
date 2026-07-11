"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import {
    ChevronLeft,
    Share2,
    Star,
    Users,
    Clock,
    MessageCircle,
    Phone,
    Heart,
    Shield,
    X,
    Award,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Ban,
    Flag,
    Unlock,
    AlertCircle
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import CosmicLoader from "@/components/CosmicLoader";
import CosmicCard from "@/components/CosmicCard";
import { useConsultation } from "@/hooks/useConsultation";

export default function AstrologerProfileClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const astrologerId = searchParams.get("id");
    const { user, loading: authLoading, setUser, checkUser } = useAuth();
    const { socket } = useSocket();
    const { startChat, startCall, loading: initiating, error: consultError } = useConsultation();
    const { scrollY } = useScroll();

    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (!scrollContainer) {
            const handleScroll = () => setIsScrolled(window.scrollY > 20);
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }

        const handleScroll = () => setIsScrolled(scrollContainer.scrollTop > 20);
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const [astrologer, setAstrologer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [followLoading, setFollowLoading] = useState(false);
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [isBlockedByThem, setIsBlockedByThem] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const isFollowing = useMemo(() => {
        if (!user || !user.following || !astrologer?._id) return false;
        return user.following.some(f => {
            const fId = typeof f === 'object' ? f._id : f;
            return fId === astrologer._id;
        });
    }, [user, astrologer?._id]);

    const [refreshing, setRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchAstrologer(),
            astrologer?._id ? fetchReviews(astrologer._id) : Promise.resolve(),
            checkUser ? checkUser() : Promise.resolve()
        ]);
        setRefreshing(false);
    };

    useEffect(() => {
        if (user?.role === 'astrologer') {
            router.replace("/");
            return;
        }
        if (astrologerId) {
            fetchAstrologer();
        }
    }, [astrologerId, user]);

    useEffect(() => {
        const actualId = astrologer?._id;
        if (!actualId) return;

        fetchReviews(actualId);

        if (socket) {
            const handleStatusChange = (data) => {
                if (data.astrologerId === actualId) {
                    setAstrologer((prev) => prev ? { ...prev, ...data } : null);
                }
            };
            const handleFollowerUpdate = (data) => {
                if (data.astrologerId === actualId) {
                    setAstrologer((prev) => prev ? { ...prev, followersCount: data.followersCount } : null);
                }
            };

            socket.on("astrologer_status_changed", handleStatusChange);
            socket.on("astrologer_follower_update", handleFollowerUpdate);

            return () => {
                socket.off("astrologer_status_changed", handleStatusChange);
                socket.off("astrologer_follower_update", handleFollowerUpdate);
            };
        }
    }, [astrologer?._id, user, socket]);

    const handleBlockUser = async () => {
        try {
            await api.post('/moderation/block', {
                blockedId: astrologer._id,
                blockedModel: 'Astrologer'
            });
            setIsBlockedByMe(true);
            setShowBlockModal(false);
        } catch (error) {
            console.error('Failed to block:', error);
        }
    };

    const handleUnblockUser = async () => {
        try {
            await api.post('/moderation/unblock', {
                blockedId: astrologer._id
            });
            setIsBlockedByMe(false);
        } catch (error) {
            console.error('Failed to unblock:', error);
        }
    };

    const handleReportUser = async () => {
        if (!reportReason.trim()) return;
        try {
            await api.post('/moderation/report', {
                reportedId: astrologer._id,
                reportedModel: 'Astrologer',
                reason: reportReason
            });
            setShowReportModal(false);
            setReportReason('');
            alert('Astrologer reported successfully.');
        } catch (error) {
            console.error('Failed to report:', error);
        }
    };

    const fetchAstrologer = async () => {
        try {
            const { data } = await api.get(`/astro/astrologers/${astrologerId}`);
            setAstrologer(data.data);
            setIsBlockedByMe(data.isBlockedByMe || false);
            setIsBlockedByThem(data.isBlockedByThem || false);
        } catch (error) {
            console.error("Failed to fetch astrologer", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (actualId = astrologer?._id) => {
        if (!actualId) return;
        try {
            const { data } = await api.get(`/reviews/astrologer/${actualId}`);
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) {
            alert("Please login to follow this astrologer.");
            return;
        }
        const actualId = astrologer?._id;
        if (!actualId) return;

        setFollowLoading(true);
        try {
            const { data } = await api.post(`/users/follow/${actualId}`);
            if (data.success) {
                if (setUser) {
                    setUser(prev => {
                        if (!prev) return prev;
                        const following = prev.following || [];
                        return {
                            ...prev,
                            following: data.isFollowing
                                ? [...following, actualId]
                                : following.filter(id => {
                                    const fId = typeof id === 'object' ? id._id : id;
                                    return fId !== actualId;
                                })
                        };
                    });
                }
                setAstrologer(prev => ({
                    ...prev,
                    followersCount: data.isFollowing ? (prev.followersCount || 0) + 1 : Math.max(0, (prev.followersCount || 0) - 1)
                }));
            }
        } catch (e) {
            console.error("Failed to toggle follow", e);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleShare = () => {
        if (!astrologer) return;
        const shareText = `Check out ${astrologer.displayName || astrologer.name} on Way2Astro!`;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const shareUrl = `${baseUrl}/astrologer?id=${astrologer.slug || astrologer._id}`;

        // WhatsApp Direct share with newline for better linkification
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;

        if (navigator.share) {
            navigator.share({
                title: astrologer.displayName,
                text: shareText,
                url: shareUrl
            }).catch(err => {
                // Fallback to WhatsApp if share fails or cancelled
                window.open(whatsappUrl, '_blank');
            });
        } else {
            window.open(whatsappUrl, '_blank');
        }
    };

    const getImageUrl = (path, gender = null) => {
        if (!path || path.includes('default-avatar.png')) {
            return gender === 'female' ? "https://cdn-icons-png.flaticon.com/512/4140/4140047.png" : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        }

        // If it's a full URL, ensure localhost is rewritten to the real network IP
        if (path.startsWith("http")) {
            return path.replace('localhost:5000', '192.168.29.133:5000');
        }

        const normalizedPath = path.replace(/\\/g, "/");
        return `http://192.168.29.133:5000${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
    };


    if (loading) return <CosmicLoader />;
    if (!astrologer) return <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">Astrologer not found</div>;

    const rating = parseFloat(astrologer.rating) || 4.9;

    // Use actual gallery if available, otherwise fallback to profile image
    const galleryImages = (astrologer.gallery && astrologer.gallery.length > 0)
        ? astrologer.gallery
        : [astrologer.image || astrologer.profileImage];

    return (
        <div className="min-h-screen pb-40 animate-in fade-in duration-700 bg-[#0b1026] text-white">

            {/* Image Modal Popup */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md"
                    >
                        <button className="absolute top-10 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                            <X size={28} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={getImageUrl(selectedImage)}
                            className="max-w-full max-h-[85vh] rounded-[2.5rem] object-contain shadow-2xl shadow-electric-violet/30"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getImageUrl(null, astrologer?.gender);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Banner for Consultation */}
            {consultError && (
                <div
                    className="fixed left-4 right-4 z-[100] bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-200 px-5 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl animate-in slide-in-from-top duration-300"
                    style={{ top: 'calc(var(--safe-area-inset-top) + 4.5rem)' }}
                >
                    <MessageCircle size={20} className="text-rose-500" />
                    <span className="text-sm font-black tracking-tight">{consultError}</span>
                </div>
            )}

            {/* Top Navigation - Seamless & Dynamic sticky */}
            <header
                className={`fixed top-0 left-0 right-0 z-[60] px-4 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'bg-[#0b1026]/90 backdrop-blur-md header-scrolled' : 'bg-transparent'}`}
                style={{
                    paddingTop: 'calc(var(--safe-area-inset-top) + 0.75rem)',
                    paddingBottom: '0.75rem'
                }}
            >
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/40 backdrop-blur-xl border border-white/10 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <span className="text-white font-black text-lg tracking-tight">Astrologer Profile</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleManualRefresh}
                        disabled={refreshing}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 active:scale-95 transition-all text-white opacity-80"
                    >
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/40 backdrop-blur-xl border border-white/10 active:scale-90 transition-all mr-2">
                            <MoreVertical size={18} className="text-white" />
                        </button>
                        {showMoreMenu && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowMoreMenu(false)} />
                                <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-[101] overflow-hidden">
                                    <button 
                                        onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 border-b border-white/5 flex items-center gap-2"
                                    >
                                        <Flag size={14} /> Report
                                    </button>
                                    <button 
                                        onClick={() => { setShowMoreMenu(false); setShowBlockModal(true); }}
                                        className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 font-medium flex items-center gap-2"
                                    >
                                        <Ban size={14} /> Block
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleShare}
                        className="h-10 px-4 rounded-full flex items-center gap-2 bg-solar-gold/10 text-solar-gold border border-solar-gold/20 font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all shadow-lg"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            </header>

            {/* Identity Section - Compact Horizontal */}
            <div
                className="relative pb-5 px-5 bg-[#0b1026] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5"
                style={{ paddingTop: 'calc(var(--safe-area-inset-top) + 5rem)' }}
            >
                <div className="flex items-center gap-4 mb-5">
                    <div className="relative group shrink-0">
                        <div className="relative w-16 h-16 rounded-full p-0.5 bg-[#0b1026] shadow-xl">
                            <div className="w-full h-full rounded-full overflow-hidden border border-white/10 bg-cosmic-indigo flex items-center justify-center">
                                <img
                                    src={getImageUrl(astrologer.image || astrologer.profileImage)}
                                    alt={astrologer.displayName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = getImageUrl(null, astrologer?.gender);
                                    }}
                                />
                            </div>
                        </div>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0b1026] shadow-lg ${astrologer.isBusy ? 'bg-amber-500' : (astrologer.isChatOnline || astrologer.isVoiceOnline || astrologer.isVideoOnline) ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-black text-white leading-tight mb-1 truncate pr-2">{astrologer.displayName || astrologer.name}</h1>
                        </div>
                        <p className="text-[10px] font-black text-electric-violet tracking-widest uppercase mb-2 truncate">
                            {Array.isArray(astrologer.skills) ? astrologer.skills.join(", ") : (astrologer.skills || "Vedic")}
                        </p>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                <Star size={10} className="text-solar-gold fill-solar-gold/50" />
                                <span className="text-[11px] font-bold text-white">{rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                <Users size={10} className="text-blue-400" />
                                <span className="text-[11px] font-bold text-white">{(astrologer.followersCount || 0) + (astrologer.fakeFollowers || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleFollowToggle}
                        disabled={followLoading || !user}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 ${isFollowing ? 'bg-slate-800 text-[#cbd5e1] border border-slate-700' : 'bg-gradient-to-r from-solar-gold to-amber-500 text-black shadow-solar-gold/20'}`}
                    >
                        {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <div className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-1">
                        <span className="text-sm font-black text-white">₹{astrologer.charges?.chatPerMinute || 25}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">/min</span>
                    </div>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex gap-3 mt-3">
                    {isBlockedByMe ? (
                        <button
                            onClick={handleUnblockUser}
                            className="w-full py-3 rounded-xl bg-slate-800 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg border border-slate-700"
                        >
                            <Unlock size={14} className="text-slate-300" />
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Unblock to Interact</span>
                        </button>
                    ) : isBlockedByThem ? (
                        <button
                            disabled
                            className="w-full py-3 rounded-xl bg-rose-500/10 flex items-center justify-center gap-2 shadow-lg border border-rose-500/20 opacity-80"
                        >
                            <Ban size={14} className="text-rose-400" />
                            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Unavailable</span>
                        </button>
                    ) : (
                        <>
                            {user?.globalFeatures?.chatEnabled !== false && astrologer?.features?.chatEnabled !== false && (
                                <button
                                    disabled={initiating}
                                    onClick={() => startChat(astrologer._id, astrologer.charges?.chatPerMinute || 25)}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <MessageCircle size={12} className="text-white" />
                                        <span className="text-xs font-black text-white leading-none">Chat</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest mt-1">
                                        {astrologer.isBusy ? 'Busy' : astrologer.isChatOnline ? 'Available' : 'Offline'}
                                    </span>
                                </button>
                            )}
                            {user?.globalFeatures?.voiceEnabled !== false && astrologer?.features?.voiceEnabled !== false && (
                                <button
                                    disabled={initiating}
                                    onClick={() => startCall(astrologer._id, astrologer.charges?.callPerMinute || 25)}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Phone size={12} className="text-white" />
                                        <span className="text-xs font-black text-white leading-none">Call</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest mt-1">
                                        {astrologer.isBusy ? 'Busy' : astrologer.isVoiceOnline ? 'Available' : 'Offline'}
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Stats Summary - Minimal Inline */}
            <div className="flex flex-wrap items-center justify-center gap-2 px-5 mt-4 relative z-10 mb-6">
                <div className="flex items-center gap-1">
                    <Shield size={12} className="text-electric-violet shrink-0" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">10k+ Consults</span>
                </div>
                <span className="text-white/20 text-[10px]">|</span>
                <div className="flex items-center gap-1">
                    <Clock size={12} className="text-solar-gold shrink-0" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">100k+ Mins Guided</span>
                </div>
                <span className="text-white/20 text-[10px]">|</span>
                <div className="flex items-center gap-1">
                    <Heart size={12} className="text-rose-500 fill-rose-500 shrink-0" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{(astrologer.followersCount || 0) + (astrologer.fakeFollowers || 0)} Followers</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-5">

                {/* Bio / Description */}
                <div className="mb-6">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Award size={14} className="text-solar-gold" />
                        Cosmic Bio
                    </h3>
                    <div className="relative">
                        <p className={`text-sm text-slate-300 leading-relaxed opacity-90 transition-all duration-300 ${!isBioExpanded ? 'line-clamp-3' : ''}`}>
                            {astrologer.bio || `${astrologer.displayName} is a famous cosmic guide with deep expertise in planetary movements and sacred remedies.`}
                        </p>
                        <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase tracking-wider mt-2 active:scale-95 transition-all"
                        >
                            {isBioExpanded ? 'Read Less' : 'Read More'}
                            {isBioExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    </div>
                </div>

                {/* Gallery - Horizontal List if exists */}
                {galleryImages.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 pl-1">
                            <Users size={14} className="text-blue-400" />
                            Sacred Gallery
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x no-scrollbar -mx-5 px-5">
                            {galleryImages.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className="flex-shrink-0 w-48 aspect-[4/3] rounded-[2rem] glass-panel border border-white/10 overflow-hidden snap-start relative group active:scale-95 transition-all shadow-xl shadow-black/20"
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getImageUrl(null, astrologer?.gender);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">Visual Insight {i + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Reviews Section */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">User Reviews</h2>
                    {reviews.length > 0 && <button className="text-[10px] text-slate-400 font-bold">View All</button>}
                </div>

                <div className="space-y-2 pb-6">
                    {reviews.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No reviews yet.</p>
                    ) : (
                        reviews.map((rev) => (
                            <div key={rev._id} className="glass-panel rounded-2xl p-3 border border-white/5">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        {rev.reviewerGender === 'Male' ? (
                                            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" alt="Male Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                                        ) : rev.reviewerGender === 'Female' ? (
                                            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" alt="Female Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                                        ) : rev.profileImage ? (
                                            <img src={getImageUrl(rev.profileImage)} alt={rev.reviewerName} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-electric-violet/10 flex items-center justify-center text-electric-violet text-xs font-black shrink-0">
                                                {rev.reviewerName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-[11px] font-black text-white">{rev.reviewerName}</span>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={8} className={i < rev.rating ? "text-solar-gold fill-solar-gold" : "text-slate-800"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{rev.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>


            {/* Tailwind utility for hidden scrollbar */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        
            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
                        >
                            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                                <Flag size={20} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Report Astrologer</h3>
                            <p className="text-sm text-slate-400 mb-4">Please describe the issue with this astrologer.</p>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Why are you reporting them?"
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm mb-4 focus:outline-none focus:border-rose-500/50 resize-none h-24"
                            />
                            <button 
                                onClick={handleReportUser}
                                disabled={!reportReason.trim()}
                                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                Submit Report
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Block Modal */}
            <AnimatePresence>
                {showBlockModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative text-center"
                        >
                            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                                <AlertCircle size={28} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Block Astrologer?</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Are you sure you want to block this astrologer? You will not be able to interact with them anymore.
                            </p>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleBlockUser}
                                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl active:scale-95 transition"
                                >
                                    Yes, Block
                                </button>
                                <button 
                                    onClick={() => setShowBlockModal(false)}
                                    className="w-full py-3.5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl active:scale-95 transition hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
