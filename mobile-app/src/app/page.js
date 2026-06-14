"use client";

import CosmicCard from "@/components/CosmicCard";
import { Sparkles, Moon, Sun, Star, MessageCircle, Phone, FileText, ArrowRight, Heart, BookOpen, Scroll, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";

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

  // Determine user's sign or default to Aries
  const userSign = user?.birthDetails?.moonSign ? user.birthDetails.moonSign.toLowerCase() : "aries";
  const displaySign = userSign.charAt(0).toUpperCase() + userSign.slice(1);

  // Zodiac symbols mapping
  const zodiacSymbols = {
    aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
    leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
    sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
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
    if (user && user.role !== 'astrologer') {
      const pollInterval = setInterval(pollAstrologers, 15000);

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

  const fetchDashboardData = async () => {
    try {
      const isAstro = user?.role === 'astrologer';

      // Fetch horoscope, astrologers (if applicable), and blogs in parallel
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

      if (horoscopeRes.data && horoscopeRes.data.data) {
        setHoroscope(horoscopeRes.data.data);
      }

      if (settingsRes.data && settingsRes.data.settings) {
        setSiteSettings(settingsRes.data.settings);
      }

      if (!isAstro && astroRes.data && astroRes.data.data) {
        setAstrologers(astroRes.data.data);
      }

      if (blogRes.data && blogRes.data.data) {
        setBlogs(blogRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pollAstrologers = async () => {
    if (user?.role === 'astrologer') return;
    try {
      const astroRes = await api.get("/astro/astrologers");
      if (astroRes.data && astroRes.data.data) {
        setAstrologers(astroRes.data.data);
      }
    } catch (error) {
      console.error("Silent polling error:", error);
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

  return (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-hidden">

      {/* Welcome & Compact Horoscope Ticker */}
      <div className="pt-2 flex flex-col gap-3">
        <div>
          <h1 className="text-[23px] font-bold text-white leading-tight">Hello, {user?.name?.split(' ')[0] || "Seeker"} ✨</h1>
          <p className="text-sm text-slate-400">Your cosmic journey continues.</p>
        </div>

        {/* Ultra-compact Horoscope Ticker */}
        {loading ? (
          <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
        ) : horoscope && horoscope.signs && horoscope.signs[userSign] ? (
          <motion.div
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push(`/horoscope?sign=${userSign}`)}
            className="glass-panel border-electric-violet/30 bg-electric-violet/10 rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer active:scale-95 transition-all overflow-hidden relative"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-electric-violet/10 to-transparent pointer-events-none" />

            <span className="text-solar-gold animate-pulse shrink-0"><Sparkles size={16} /></span>
            <div className="flex-1 overflow-hidden">
              <p className="text-[13px] leading-snug text-white line-clamp-2">
                <span className="font-bold">{displaySign} Insight:</span> <span className="font-normal text-slate-300 ml-1">{horoscope.signs[userSign].prediction}</span>
              </p>
            </div>
            <ArrowRight size={14} className="text-electric-violet shrink-0 ml-1" />
          </motion.div>
        ) : null}
      </div>

      {/* Quick Actions (Floating Neon Circles) */}
      <div className="flex justify-between items-start px-1 py-2 mt-1">
        {[
          { label: "Chat", route: "/explore", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]", hideForAstro: true },
          { label: "Call", route: "/explore", icon: Phone, color: "text-green-400", bg: "bg-green-500/20 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]", hideForAstro: true },
          {
            label: "Kundli",
            route: (birthDetails && birthDetails.date)
              ? `/kundli/result?name=${encodeURIComponent(birthDetails.name)}&date=${birthDetails.date}&time=${birthDetails.time}&lat=${birthDetails.lat}&lng=${birthDetails.lng}&tz=${birthDetails.timezone}&place=${encodeURIComponent(birthDetails.place)}`
              : "/kundli",
            icon: Scroll,
            color: "text-solar-gold",
            bg: "bg-solar-gold/20 border border-solar-gold/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          },
          { label: "Panchang", route: "/panchang", icon: Calendar, color: "text-orange-400", bg: "bg-orange-500/20 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]" },
          { label: "Match", route: "/matchmaking", icon: Heart, color: "text-pink-400", bg: "bg-pink-500/20 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]" }
        ].filter(action => !(user?.role === 'astrologer' && action.hideForAstro)).map((action, i) => (
          <motion.button
            key={action.label}
            onClick={() => router.push(action.route)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (i * 0.05), type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-all group w-[60px]"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.bg} ${action.color} backdrop-blur-md relative overflow-hidden`}>
              {/* Glossy reflection */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-full pointer-events-none" />
              <action.icon size={20} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Promotional Banner */}
      {siteSettings?.mobilePromoEnabled && siteSettings?.mobilePromoBannerUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
          onClick={() => {
            if (siteSettings.mobilePromoLink) {
              if (siteSettings.mobilePromoLink.startsWith('http')) {
                window.open(siteSettings.mobilePromoLink, '_blank');
              } else {
                router.push(siteSettings.mobilePromoLink);
              }
            }
          }}
        >
          <div className="w-full rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/10 relative flex items-center justify-center bg-black/20">
            <img
              src={getImageUrl(siteSettings.mobilePromoBannerUrl)}
              alt="Promotion"
              className="w-full h-auto object-contain"
            />
          </div>
        </motion.div>
      )}

      {user?.role !== 'astrologer' && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-solar-gold" />
              Astrologers
            </h3>
            <button onClick={() => router.push("/explore")} className="text-xs text-electric-violet font-semibold active:scale-95 transition-all">View All</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-t-2 border-electric-violet animate-spin" />
            </div>
          ) : astrologers.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pt-2 pb-2 scrollbar-hide px-2 -mx-2">
              {sortedAstrologers.slice(0, 12).map((astro) => (
                <div
                  key={astro._id}
                  onClick={() => router.push(`/astrologer?id=${astro.slug || astro._id}`)}
                  className="flex-shrink-0 w-20 flex flex-col items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="relative">
                    {astro.badgeText && (
                      <div className="absolute -top-1.5 -right-2 bg-solar-gold text-black text-[7px] font-black uppercase px-1.5 py-[2px] rounded-full z-20 shadow-md border border-[#0F172A] whitespace-nowrap">
                        {astro.badgeText}
                      </div>
                    )}
                    <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#0F172A] shadow-sm z-10 ${astro.isBusy ? 'bg-amber-500' : (astro.isChatOnline || astro.isVoiceOnline || astro.isVideoOnline) ? 'bg-green-500' : 'bg-slate-500'
                      }`} />
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 border-[2.5px] border-electric-violet/40 overflow-hidden shadow-lg p-[2px]">
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
                  </div>
                  <div className="text-center w-full px-0.5">
                    <p className="text-[10px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">{astro.displayName || astro.name}</p>
                    <p className="text-[9px] text-solar-gold font-bold">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">No live astrologers right now.</p>
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
