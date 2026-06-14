"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CosmicCard from "@/components/CosmicCard";
import FilterModal from "@/components/FilterModal";
import { Search, Filter, Award, MessageCircle, Phone, X, Star, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useConsultation } from "@/hooks/useConsultation";
import { useSocket } from "@/context/SocketContext";

export default function Explore() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { socket } = useSocket();
    const { startChat, startCall, loading: initiating, error: consultError } = useConsultation();
    const [astrologers, setAstrologers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [followingIds, setFollowingIds] = useState([]);
    const [sessionCounts, setSessionCounts] = useState({});
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        sortBy: "Popularity",
        skills: [],
        languages: [],
        genders: []
    });

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


    useEffect(() => {
        if (!authLoading && user?.role === 'astrologer') {
            router.replace("/");
            return;
        }
        fetchAstrologers();

        if (socket) {
            const handleStatusChange = (data) => {
                setAstrologers((prev) => 
                    prev.map(astro => 
                        astro._id === data.astrologerId ? { ...astro, ...data } : astro
                    )
                );
            };
            socket.on("astrologer_status_changed", handleStatusChange);
            return () => {
                socket.off("astrologer_status_changed", handleStatusChange);
            };
        }
    }, [user, authLoading, socket]);

    useEffect(() => {
        if (user && user.role !== 'astrologer') {
            const pollInterval = setInterval(fetchAstrologersSilent, 15000);
            
            // Fetch following list
            api.get("/users/following").then(res => {
                if (res.data && res.data.success && res.data.following) {
                    setFollowingIds(res.data.following.map(a => a._id || a.id));
                }
            }).catch(err => console.error("Failed to fetch following", err));

            // Fetch chat history for most interacted
            api.get("/chat/history").then(res => {
                if (res.data && res.data.success && res.data.sessions) {
                    const counts = {};
                    res.data.sessions.forEach(session => {
                        const astroId = session.astrologerId?._id || session.astrologerId;
                        if (astroId) {
                            counts[astroId] = (counts[astroId] || 0) + 1;
                        }
                    });
                    setSessionCounts(counts);
                }
            }).catch(err => console.error("Failed to fetch chat history", err));

            return () => clearInterval(pollInterval);
        }
    }, [user]);

    const fetchAstrologers = async () => {
        try {
            const { data } = await api.get("/astro/astrologers");
            setAstrologers(data.data || []);
        } catch (error) {
            console.error("Failed to fetch astrologers", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAstrologersSilent = async () => {
        try {
            const { data } = await api.get("/astro/astrologers");
            if (data && data.success) {
                setAstrologers(data.data || []);
            }
        } catch (error) {
            console.error("Silent status poll failed", error);
        }
    };

    const availableSkills = useMemo(() => {
        const skills = new Set();
        astrologers.forEach(astro => {
            if (Array.isArray(astro.skills)) {
                astro.skills.forEach(s => skills.add(s));
            } else if (astro.skills) {
                skills.add(astro.skills);
            }
        });
        return Array.from(skills).sort();
    }, [astrologers]);

    const availableLanguages = useMemo(() => {
        const langs = new Set();
        astrologers.forEach(astro => {
            if (Array.isArray(astro.languages)) {
                astro.languages.forEach(l => langs.add(l));
            } else if (astro.languages) {
                langs.add(astro.languages);
            }
        });
        return Array.from(langs).sort();
    }, [astrologers]);

    const filteredAstrologers = useMemo(() => {
        return astrologers.filter(astro => {
            // Search Query
            const nameMatch = (astro.displayName || astro.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            const skillsMatch = Array.isArray(astro.skills) 
                ? astro.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                : (astro.skills || "").toLowerCase().includes(searchQuery.toLowerCase());
            const languageMatch = Array.isArray(astro.languages)
                ? astro.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
                : (astro.languages || "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSearch = nameMatch || skillsMatch || languageMatch;
            if (!matchesSearch) return false;

            // Specialty Pills (selectedFilter)
            if (selectedFilter !== "All") {
                const matchesPill = Array.isArray(astro.skills)
                    ? astro.skills.some(s => s.toLowerCase() === selectedFilter.toLowerCase())
                    : (astro.skills || "").toLowerCase() === selectedFilter.toLowerCase();
                if (!matchesPill) return false;
            }
            
            // Advanced Filters
            if (advancedFilters.skills && advancedFilters.skills.length > 0) {
                const astroSkills = Array.isArray(astro.skills) ? astro.skills : [astro.skills].filter(Boolean);
                const hasSkill = advancedFilters.skills.some(skill => astroSkills.includes(skill));
                if (!hasSkill) return false;
            }
            
            if (advancedFilters.languages && advancedFilters.languages.length > 0) {
                const astroLangs = Array.isArray(astro.languages) ? astro.languages : [astro.languages].filter(Boolean);
                const hasLang = advancedFilters.languages.some(lang => astroLangs.includes(lang));
                if (!hasLang) return false;
            }
            
            if (advancedFilters.genders && advancedFilters.genders.length > 0) {
                const astroGender = astro.gender || "Other";
                if (!advancedFilters.genders.includes(astroGender)) return false;
            }

            return true;
        });
    }, [astrologers, searchQuery, selectedFilter, advancedFilters]);

    const sortedAstrologers = useMemo(() => {
        let sorted = [...filteredAstrologers];
        
        if (advancedFilters.sortBy === "Popularity") {
            sorted.sort((a, b) => {
                const isOnline = (astro) => astro.isChatOnline || astro.isVoiceOnline;
                const isFollowing = (astro) => followingIds.includes(astro._id || astro.id);
                const getSessionCount = (astro) => sessionCounts[astro._id || astro.id] || 0;
                const getCreatedTime = (astro) => astro.createdAt ? new Date(astro.createdAt).getTime() : 0;
                const getFollowingIndex = (astro) => followingIds.indexOf(astro._id || astro.id);

                const now = new Date();
                const isCurrentlyPinned = (astro) => {
                    if (!astro.isPinned) return false;
                    if (astro.pinStartTime && astro.pinEndTime) {
                        return new Date(astro.pinStartTime) <= now && new Date(astro.pinEndTime) >= now;
                    }
                    return true;
                };

                const aPinned = isCurrentlyPinned(a);
                const bPinned = isCurrentlyPinned(b);

                // Tier 0: Pinned
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                if (aPinned && bPinned) {
                    return (a.pinOrder || 0) - (b.pinOrder || 0);
                }

                // Tier 1: Online
                if (isOnline(a) && !isOnline(b)) return -1;
                if (!isOnline(a) && isOnline(b)) return 1;
                if (isOnline(a) && isOnline(b)) {
                    return getCreatedTime(b) - getCreatedTime(a);
                }

                // Tier 2: Following
                if (isFollowing(a) && !isFollowing(b)) return -1;
                if (!isFollowing(a) && isFollowing(b)) return 1;
                if (isFollowing(a) && isFollowing(b)) {
                    return getFollowingIndex(b) - getFollowingIndex(a);
                }

                // Tier 3: Most interacted
                const sessionsA = getSessionCount(a);
                const sessionsB = getSessionCount(b);
                if (sessionsA > 0 || sessionsB > 0) {
                    if (sessionsA !== sessionsB) {
                        return sessionsB - sessionsA;
                    }
                }

                // Tier 4: Offline
                return getCreatedTime(b) - getCreatedTime(a);
            });
        } else {
            sorted.sort((a, b) => {
                const getPrice = (astro) => astro.charges?.chatPerMinute || astro.chatRate || 25;
                const getExp = (astro) => astro.experienceYears || astro.experience || 0;
                const getOrders = (astro) => {
                    if (typeof astro.orders === 'number') return astro.orders;
                    if (typeof astro.orders === 'string') {
                        const num = parseInt(astro.orders.replace(/[^0-9]/g, ''));
                        return isNaN(num) ? 0 : num;
                    }
                    return 0;
                };
                const getRating = (astro) => astro.rating || 4.5;

                switch (advancedFilters.sortBy) {
                    case "Experience: High to Low":
                        return getExp(b) - getExp(a);
                    case "Experience: Low to High":
                        return getExp(a) - getExp(b);
                    case "Orders: High to Low":
                        return getOrders(b) - getOrders(a);
                    case "Orders: Low to High":
                        return getOrders(a) - getOrders(b);
                    case "Price: High to Low":
                        return getPrice(b) - getPrice(a);
                    case "Price: Low to High":
                        return getPrice(a) - getPrice(b);
                    case "Rating: High to Low":
                        return getRating(b) - getRating(a);
                    default:
                        return 0;
                }
            });
        }
        return sorted;
    }, [filteredAstrologers, followingIds, sessionCounts, advancedFilters.sortBy]);

    return (
        <>
            {/* Error Banner for Consultation */}
            {consultError && (
                <div className="fixed top-[88px] left-4 right-4 z-[40] bg-rose-500 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top duration-300">
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{consultError}</span>
                </div>
            )}

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden pt-6">

            {/* Search and Filter */}
            <div className="flex gap-3">
                <div className="flex-1 glass-panel rounded-xl flex items-center px-4 py-2.5 border border-white/10 active:border-electric-violet/50 transition-all">
                    <Search size={18} className="text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search astrologers, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="glass-panel rounded-xl px-4 flex items-center justify-center text-electric-violet border border-white/5 relative"
                >
                    <Filter size={18} />
                    {(advancedFilters.skills.length > 0 || advancedFilters.languages.length > 0 || advancedFilters.genders.length > 0 || advancedFilters.sortBy !== "Popularity") && (
                        <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    )}
                </button>
            </div>

            {/* Specialty Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-1 px-1">
                {["All", "Tarot", "Vedic", "Numerology", "Vastu", "Palmistry"].map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setSelectedFilter(tag)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 border ${
                            selectedFilter === tag 
                            ? 'bg-electric-violet text-white border-electric-violet shadow-lg shadow-electric-violet/20 scale-105' 
                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 active:scale-95'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Astrologer List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-electric-violet animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Summoning astrologers...</p>
                    </div>
                ) : sortedAstrologers.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Search size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-300 tracking-wide">No results found</p>
                        <p className="text-xs text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    sortedAstrologers.map((astro, i) => (
                        <CosmicCard
                            key={astro._id || i}
                            delay={0.1 + (i * 0.05)}
                            className="p-3 transition-transform active:scale-[0.98] border-white/5 hover:border-white/10 relative overflow-hidden"
                            onClick={() => router.push(`/astrologer?id=${astro._id || astro.id || i}`)}
                        >
                            {astro.badgeText && (
                                <div 
                                    className="bg-solar-gold text-black shadow-md border-y border-black/10 flex items-center justify-center font-bold tracking-wide z-20 pointer-events-none"
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '-34px',
                                        width: '100px',
                                        transform: 'rotate(-45deg)',
                                        padding: '2px 0'
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '8px',
                                        transform: astro.badgeText.length > 8 ? 'scale(0.75)' : 'scale(0.9)',
                                        lineHeight: 1,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {astro.badgeText}
                                    </span>
                                </div>
                            )}
                            <div className="flex gap-2.5 relative z-0 items-center">
                                {/* Left Column: Avatar & Stars */}
                                <div className="flex flex-col items-center flex-shrink-0 w-[60px]">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 p-0.5 relative">
                                        <img 
                                            src={getImageUrl(astro.image || astro.profileImage, astro.gender)} 
                                            alt={astro.displayName || astro.name} 
                                            className="w-full h-full rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = getImageUrl(null, astro.gender);
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center mt-1.5 gap-[1px]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={8} className={i < Math.floor(astro.rating || 4.5) ? "text-solar-gold fill-solar-gold" : "text-slate-600 fill-slate-600"} />
                                        ))}
                                    </div>
                                    <p className="text-[8px] text-slate-500 mt-0.5 font-medium">{astro.orders || '5k+'} orders</p>
                                </div>

                                {/* Center Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-start items-center gap-1.5">
                                        <h3 className="text-white font-bold text-[13px] truncate">{astro.displayName || astro.name}</h3>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                            <Check size={8} strokeWidth={3} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                        {Array.isArray(astro.skills) ? astro.skills.slice(0, 3).join(", ") : (astro.skills || "Expert")}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                        {Array.isArray(astro.languages) ? astro.languages.join(", ") : "English, Hindi, Telugu"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Exp: {astro.experienceYears || astro.experience || "5"} Yrs</p>
                                    
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-slate-500 line-through text-[10px]">₹{Math.floor((astro.charges?.chatPerMinute || astro.chatRate || 25) * 1.5)}</span>
                                        <span className="text-rose-400 font-bold text-[12px]">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</span>
                                    </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="flex flex-col items-end justify-center flex-shrink-0 gap-2">
                                    {user?.globalFeatures?.chatEnabled !== false && astro?.features?.chatEnabled !== false && (
                                        <button 
                                            disabled={initiating || !astro.isChatOnline || astro.isBusy}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startChat(astro._id, astro.charges?.chatPerMinute || astro.chatRate || 25);
                                            }}
                                            className={`w-[68px] py-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                                (astro.isChatOnline && !astro.isBusy) 
                                                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 active:scale-95' 
                                                    : 'border-white/10 text-slate-400 bg-white/5'
                                            }`}
                                        >
                                            <span className="text-[10px] font-bold leading-none mb-1">Chat</span>
                                            <span className={`text-[8px] leading-none ${astro.isBusy ? 'text-amber-400' : (!astro.isChatOnline ? 'text-slate-400' : '')}`}>
                                                {astro.isBusy ? 'Busy' : (!astro.isChatOnline ? 'Offline' : 'Online')}
                                            </span>
                                        </button>
                                    )}
                                    {user?.globalFeatures?.voiceEnabled !== false && astro?.features?.voiceEnabled !== false && (
                                        <button 
                                            disabled={initiating || !astro.isVoiceOnline || astro.isBusy}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startCall(astro._id, astro.charges?.callPerMinute || astro.callRate || 25);
                                            }}
                                            className={`w-[68px] py-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                                (astro.isVoiceOnline && !astro.isBusy) 
                                                    ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 active:scale-95' 
                                                    : 'border-white/10 text-slate-400 bg-white/5'
                                            }`}
                                        >
                                            <span className="text-[10px] font-bold leading-none mb-1">Call</span>
                                            <span className={`text-[8px] leading-none ${astro.isBusy ? 'text-amber-400' : (!astro.isVoiceOnline ? 'text-slate-400' : '')}`}>
                                                {astro.isBusy ? 'Busy' : (!astro.isVoiceOnline ? 'Offline' : 'Online')}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </CosmicCard>
                    ))
                )}
            </div>

            <div className="h-20" />
        </div>

        <FilterModal 
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApply={(newFilters) => {
                setAdvancedFilters(newFilters);
                setIsFilterModalOpen(false);
            }}
            initialFilters={advancedFilters}
            availableSkills={availableSkills}
            availableLanguages={availableLanguages}
        />
        </>
    );
}
