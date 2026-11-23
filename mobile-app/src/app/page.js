"use client";

import CosmicCard from "@/components/CosmicCard";
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Star, 
  MessageCircle, 
  Phone, 
  FileText, 
  ArrowRight, 
  Heart, 
  BookOpen, 
  Scroll, 
  Calendar, 
  ChevronRight,
  Globe,
  Clock,
  ShieldAlert,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";

export default function Home() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { birthDetails } = useBirthDetails();
  const router = useRouter();

  const [horoscope, setHoroscope] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [astrologers, setAstrologers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [sessionCounts, setSessionCounts] = useState({});
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerError, setBannerError] = useState(false);

  // Determine user's sign or default to Aries
  const userSign = user?.birthDetails?.moonSign ? user.birthDetails.moonSign.toLowerCase() : "aries";
  const displaySign = userSign.charAt(0).toUpperCase() + userSign.slice(1);

  // Zodiac symbols mapping
  const zodiacSymbols = {
    aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
    leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
    sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
  };

  


  useEffect(() => {
    if (user?.role === 'astrologer') {
      router.replace('/profile');
      return;
    }

    fetchDashboardData();

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
  }, [user, router, socket]);

  useEffect(() => {
    if (user && user.role !== 'astrologer' && !user.isGuest) {
      const pollInterval = setInterval(pollAstrologers, 15000);

      // Fetch following list silently
      api.get("/users/following", {
        headers: { 'X-Silent-Error': 'true' },
        silent: true
      }).then(res => {
        if (res.data && res.data.success && res.data.following) {
          setFollowingIds(res.data.following.map(a => a._id || a.id));
        }
      }).catch(err => console.warn("Failed to fetch following", err));

      // Fetch chat history for most interacted silently
      api.get("/chat/history", {
        headers: { 'X-Silent-Error': 'true' },
        silent: true
      }).then(res => {
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
      }).catch(err => console.warn("Failed to fetch chat history", err));

      return () => clearInterval(pollInterval);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    // Safety timer: ensure loading spinner never gets stuck indefinitely
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    try {
      const isAstro = user?.role === 'astrologer';

      // Fetch horoscope, astrologers (if applicable), and blogs in parallel with safe fallbacks
      const fetchPromises = [
        api.get("/horoscope-manager/daily").catch(() => ({ data: { data: null } })),
        api.get("/blog/posts?limit=5").catch(() => ({ data: { data: [] } })),
        api.get("/site-settings").catch(() => ({ data: { settings: null } }))
      ];

      // Only fetch live astrologers if the user is NOT an astrologer
      if (!isAstro) {
        fetchPromises.push(api.get("/astro/astrologers").catch(() => ({ data: { data: [] } })));
      }

      const results = await Promise.all(fetchPromises);
      const horoscopeRes = results[0];
      const blogRes = results[1];
      const settingsRes = results[2];
      const astroRes = !isAstro ? results[3] : { data: { data: [] } };

      if (horoscopeRes?.data && horoscopeRes.data.data) {
        setHoroscope(horoscopeRes.data.data);
      }

      if (settingsRes?.data && settingsRes.data.settings) {
        setSiteSettings(settingsRes.data.settings);
      }

      if (!isAstro && astroRes?.data && astroRes.data.data) {
        setAstrologers(astroRes.data.data);
      }

      if (blogRes?.data && blogRes.data.data) {
        setBlogs(blogRes.data.data);
      }
    } catch (error) {
      console.warn("Notice: Error fetching dashboard data:", error);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const pollAstrologers = async () => {
    if (user?.role === 'astrologer') return;
    try {
      const astroRes = await api.get("/astro/astrologers", {
        headers: { 'X-Silent-Error': 'true' },
        silent: true
      });
      if (astroRes?.data && astroRes.data.data) {
        setAstrologers(astroRes.data.data);
      }
    } catch (error) {
      console.warn("Silent polling notice:", error);
    }
  };

  const sortedAstrologers = useMemo(() => {
    return [...astrologers].sort((a, b) => {
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

      // Tier 2: Following (Sorted by last following to oldest following - which means reverse following index)
      if (isFollowing(a) && !isFollowing(b)) return -1;
      if (!isFollowing(a) && isFollowing(b)) return 1;
      if (isFollowing(a) && isFollowing(b)) {
        return getFollowingIndex(b) - getFollowingIndex(a);
      }

      // Tier 3: Most interacted (session count)
      const sessionsA = getSessionCount(a);
      const sessionsB = getSessionCount(b);
      if (sessionsA > 0 || sessionsB > 0) {
        if (sessionsA !== sessionsB) {
          return sessionsB - sessionsA;
        }
      }

      // Tier 4: Offline (Everyone else)
      return getCreatedTime(b) - getCreatedTime(a);
    });
  }, [astrologers, followingIds, sessionCounts]);

  const promoEnabled = user?.role === 'astrologer' ? siteSettings?.astrologerPromoEnabled 
                     : user?.role === 'manager' ? siteSettings?.managerPromoEnabled 
                     : siteSettings?.mobilePromoEnabled;
                     
  const promoBannerUrl = user?.role === 'astrologer' ? siteSettings?.astrologerPromoBannerUrl 
                       : user?.role === 'manager' ? siteSettings?.managerPromoBannerUrl 
                       : siteSettings?.mobilePromoBannerUrl;

  const promoLink = user?.role === 'astrologer' ? siteSettings?.astrologerPromoLink 
                  : user?.role === 'manager' ? siteSettings?.managerPromoLink 
                  : siteSettings?.mobilePromoLink;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-hidden">

      {/* Welcome & Clickable Rasi Indicator */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
            Hello, {user?.name?.split(' ')[0] || "Seeker"} ✨
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            The cosmos is aligned in your favor today.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => router.push(`/horoscope?sign=${userSign}`)}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          className="px-3 py-1 rounded-full bg-violet-500/10 hover:bg-violet-500/20 active:bg-violet-500/30 border border-amber-400/30 hover:border-amber-400/60 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.15)] cursor-pointer select-none transition-all group"
          title={`View ${displaySign} Daily Horoscope & Predictions`}
          aria-label={`View ${displaySign} Daily Horoscope & Predictions`}
        >
          <span className="relative flex h-2 w-2 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400 animate-blink shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          </span>
          <span className="text-[10px] font-bold text-amber-300 group-hover:text-amber-200 uppercase tracking-wider transition-colors">
            {displaySign}
          </span>
          <ChevronRight size={10} className="text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all -mr-0.5" />
        </motion.button>
      </div>

      {/* Quick Action Squircles (Two Rows of Astrological Services) */}
      <div className="space-y-2.5 pt-1">
        {/* Row 1: Primary Communication & Core Charts */}
        <div className="grid grid-cols-5 gap-2 px-0.5">
          {[
            { label: "Chat", route: "/explore", icon: MessageCircle, color: "text-blue-300", bg: "from-blue-500/20 to-indigo-500/20 border-blue-400/30 shadow-[0_4px_20px_rgba(59,130,246,0.2)]", hideForAstro: true },
            { label: "Call", route: "/explore", icon: Phone, color: "text-emerald-300", bg: "from-emerald-500/20 to-teal-500/20 border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.2)]", hideForAstro: true },
            {
              label: "Kundli",
              route: (birthDetails && birthDetails.date)
                ? `/kundli/result?name=${encodeURIComponent(birthDetails.name)}&date=${birthDetails.date}&time=${birthDetails.time}&lat=${birthDetails.lat}&lng=${birthDetails.lng}&tz=${birthDetails.timezone}&place=${encodeURIComponent(birthDetails.place)}`
                : "/kundli",
              icon: Scroll,
              color: "text-amber-300",
              bg: "from-amber-500/20 to-yellow-500/20 border-amber-400/30 shadow-[0_4px_20px_rgba(251,191,36,0.2)]"
            },
            { label: "Panchang", route: "/panchang", icon: Calendar, color: "text-orange-300", bg: "from-orange-500/20 to-red-500/20 border-orange-400/30 shadow-[0_4px_20px_rgba(249,115,22,0.2)]" },
            { label: "Match", route: "/matchmaking", icon: Heart, color: "text-pink-300", bg: "from-pink-500/20 to-rose-500/20 border-pink-400/30 shadow-[0_4px_20px_rgba(244,63,94,0.2)]" }
          ].filter(action => !(user?.role === 'astrologer' && action.hideForAstro)).map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => router.push(action.route)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 + (i * 0.03), type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform group"
            >
              <div className={`w-[52px] h-[52px] rounded-[20px] flex items-center justify-center bg-gradient-to-b ${action.bg} border backdrop-blur-xl relative overflow-hidden transition-all group-hover:shadow-lg`}>
                {/* Top glass reflection */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <action.icon size={22} strokeWidth={2} className={`${action.color} drop-shadow-sm`} />
              </div>
              <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white tracking-tight transition-colors">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Row 2: Live Planets, Dasha, Dosha, Hora, Choghadiya & More Services */}
        <div className="grid grid-cols-6 gap-1.5 px-0.5 pt-0.5">
          {[
            {
              label: "Live Planets",
              route: "/calculators/gochar",
              icon: Globe,
              color: "text-purple-300",
              bg: "from-purple-500/20 to-indigo-500/20 border-purple-400/30 shadow-[0_4px_20px_rgba(168,85,247,0.2)]"
            },
            {
              label: "Dasha",
              route: "/calculators/dasha",
              icon: Clock,
              color: "text-cyan-300",
              bg: "from-cyan-500/20 to-teal-500/20 border-cyan-400/30 shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
            },
            {
              label: "Dosha",
              route: "/dosha",
              icon: ShieldAlert,
              color: "text-rose-300",
              bg: "from-rose-500/20 to-red-500/20 border-rose-400/30 shadow-[0_4px_20px_rgba(244,63,94,0.2)]"
            },
            {
              label: "Hora",
              route: "/calculators/hora-muhurat",
              icon: Sun,
              color: "text-amber-300",
              bg: "from-amber-500/20 to-orange-500/20 border-amber-400/30 shadow-[0_4px_20px_rgba(251,191,36,0.2)]"
            },
            {
              label: "Choghadiya",
              route: "/calculators/choghadiya",
              icon: Sparkles,
              color: "text-emerald-300",
              bg: "from-emerald-500/20 to-teal-500/20 border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
            },
            {
              label: "More",
              route: "/services",
              icon: LayoutGrid,
              color: "text-fuchsia-300",
              bg: "from-fuchsia-500/20 to-pink-500/20 border-fuchsia-400/30 shadow-[0_4px_20px_rgba(217,70,239,0.2)]"
            }
          ].map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => router.push(action.route)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + (i * 0.025), type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform group"
            >
              <div className={`w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-[18px] flex items-center justify-center bg-gradient-to-b ${action.bg} border backdrop-blur-xl relative overflow-hidden transition-all group-hover:shadow-lg`}>
                {/* Top glass reflection */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <action.icon size={20} strokeWidth={2} className={`${action.color} drop-shadow-sm`} />
              </div>
              <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-slate-300 group-hover:text-white tracking-tight text-center leading-tight line-clamp-1 truncate max-w-full">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Promotional Banner */}
      {promoEnabled && promoBannerUrl && !bannerError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
          onClick={() => {
            if (promoLink) {
              if (promoLink.startsWith('http')) {
                window.open(promoLink, '_blank');
              } else {
                router.push(promoLink);
              }
            }
          }}
        >
          <div className="w-full rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 relative flex items-center justify-center bg-black/20">
            <img
              src={getImageUrl(promoBannerUrl)}
              alt="Promotion"
              onError={() => setBannerError(true)}
              className="w-full h-auto object-contain"
            />
          </div>
        </motion.div>
      )}

      {user?.role !== 'astrologer' && (
        <div className="pt-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              Live Astrologers
            </h3>
            <button 
              onClick={() => router.push("/explore")} 
              className="text-xs text-violet-400 font-bold flex items-center gap-1 active:scale-95 transition-all"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
            </div>
          ) : astrologers.length > 0 ? (
            <div className="grid grid-cols-4 gap-y-4 gap-x-2.5 pt-1 pb-2">
              {sortedAstrologers.slice(0, 20).map((astro) => (
                <div
                  key={astro._id}
                  onClick={() => router.push(`/astrologer?id=${astro.slug || astro._id}`)}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform cursor-pointer group"
                >
                  <div className="relative">
                    {astro.badgeText && (
                      <div className="absolute -top-1 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[7px] font-black uppercase px-1.5 py-[1.5px] rounded-full z-20 shadow-md border border-[#050716] whitespace-nowrap">
                        {astro.badgeText}
                      </div>
                    )}
                    
                    {/* Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#050716] z-10 ${
                      astro.isBusy ? 'bg-amber-400' : (astro.isChatOnline || astro.isVoiceOnline || astro.isVideoOnline) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'
                    }`} />
                    
                    {/* Avatar Ring */}
                    <div className="w-[62px] h-[62px] rounded-[22px] bg-gradient-to-tr from-violet-500/40 via-purple-500/30 to-amber-400/40 p-[2px] shadow-md group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-[20px] bg-[#0c102a] overflow-hidden">
                        <img
                          src={getImageUrl(astro.image || astro.profileImage, astro.gender)}
                          alt={astro.displayName || astro.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getImageUrl(null, astro.gender);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center w-full px-0.5">
                    <p className="text-[11px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                      {astro.displayName || astro.name}
                    </p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-amber-400/10 text-[9px] text-amber-300 font-extrabold tracking-tight">
                      ₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-slate-400">No live astrologers right now.</p>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchDashboardData(); }}
                className="px-3 py-1 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold active:scale-95 transition-all"
              >
                ↻ Refresh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Blog Carousel */}
      {blogs.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-electric-violet" />
              Latest Wisdom
            </h3>
            <button
              onClick={() => router.push('/blog')}
              className="text-xs text-electric-violet font-semibold active:scale-95 transition-all"
            >
              Read Blogs
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex-shrink-0 w-64"
              >
                <CosmicCard
                  className="p-0 overflow-hidden border-white/5 h-full flex flex-col"
                  onClick={() => router.push(`/blog/detail?slug=${blog.slug}`)}
                >
                  <div className="h-32 w-full bg-slate-800 relative overflow-hidden">
                    {blog.featuredImage ? (
                      <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-cosmic-indigo">
                        <Sparkles size={32} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-cosmic-indigo via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-snug">{blog.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">{blog.excerpt || "Dive into the cosmic secrets and planetary shifts..."}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-medium text-electric-violet bg-electric-violet/10 px-2 py-0.5 rounded-full">
                        {blog.categories?.[0]?.name || "Astrology"}
                      </span>
                      <ArrowRight size={14} className="text-slate-500" />
                    </div>
                  </div>
                </CosmicCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer for bottom nav */}
      <div className="h-6" />
    </div>
  );
}
