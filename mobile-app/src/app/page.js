"use client";

import CosmicCard from "@/components/CosmicCard";
import { Sparkles, Moon, Sun, Star, MessageCircle, Phone, FileText, ArrowRight, Heart, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useBirthDetails } from "@/context/BirthDetailsContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function Home() {
  const { user } = useAuth();
  const { birthDetails } = useBirthDetails();
  const router = useRouter();

  const [horoscope, setHoroscope] = useState(null);
  const [astrologers, setAstrologers] = useState([]);
  const [blogs, setBlogs] = useState([]);
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

  const getImageUrl = (path) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    if (path.startsWith("http")) return path;
    return `http://192.168.29.133:5000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    if (user?.role === 'astrologer') {
      router.replace('/profile');
      return;
    }
    
    fetchDashboardData();

    // Set up polling for astrologer statuses every 15 seconds (only for Seekers)
    let pollInterval = setInterval(pollAstrologers, 15000);
    return () => clearInterval(pollInterval);
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      const isAstro = user?.role === 'astrologer';
      
      // Fetch horoscope, astrologers (if applicable), and blogs in parallel
      const fetchPromises = [
        api.get("/horoscope-manager/daily").catch(() => ({ data: { data: null } })),
        api.get("/blog/posts?limit=5").catch(() => ({ data: { data: [] } }))
      ];

      // Only fetch live astrologers if the user is NOT an astrologer
      if (!isAstro) {
        fetchPromises.push(api.get("/astro/astrologers").catch(() => ({ data: { data: [] } })));
      }

      const results = await Promise.all(fetchPromises);
      const horoscopeRes = results[0];
      const blogRes = results[1];
      const astroRes = !isAstro ? results[2] : { data: { data: [] } };

      if (horoscopeRes.data && horoscopeRes.data.data) {
        setHoroscope(horoscopeRes.data.data);
      }

      if (!isAstro && astroRes.data && astroRes.data.data) {
        // Take just the top 3
        setAstrologers(astroRes.data.data.slice(0, 3));
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
        setAstrologers(astroRes.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Silent polling error:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden">

      {/* Welcome Banner */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-white">Hello, {user?.name?.split(' ')[0] || "Seeker"} ✨</h1>
        <p className="text-sm text-slate-400">Your cosmic journey continues.</p>
      </div>

      {/* Daily Horoscope Highlight Widget */}
      <CosmicCard className="mt-4 bg-gradient-to-br from-electric-violet/20 to-cosmic-indigo border-electric-violet/30" delay={0.1}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-electric-violet/20 rounded-xl text-electric-violet">
              <Sun size={20} />
            </span>
            <h2 className="text-lg font-bold">Today's Insight</h2>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/10 text-slate-300">
            {displaySign} {zodiacSymbols[userSign] || "✨"}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-t-2 border-electric-violet animate-spin" />
          </div>
        ) : horoscope && horoscope.signs && horoscope.signs[userSign] ? (
          <>
            <p className="text-sm text-slate-200 leading-relaxed mb-4 line-clamp-3">
              {horoscope.signs[userSign].prediction || "Cosmic energies are flowing. Read your full sign for details."}
            </p>
            <button
              onClick={() => router.push(`/horoscope?sign=${userSign}`)}
              className="w-full py-2.5 rounded-xl bg-electric-violet/20 hover:bg-electric-violet/30 transition-colors text-electric-violet font-semibold text-sm flex items-center justify-center gap-2"
            >
              Read Full Horoscope <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-400 italic mb-4">
            Your cosmic insight is currently aligning. Please check back later.
          </p>
        )}
      </CosmicCard>

      {/* Quick Actions (Glass Pills) */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider pl-1">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Chat", route: "/explore", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10", hideForAstro: true },
            { label: "Call", route: "/explore", icon: Phone, color: "text-green-400", bg: "bg-green-400/10", hideForAstro: true },
            {
              label: "Kundli",
              route: (birthDetails && birthDetails.date)
                ? `/kundli/result?name=${encodeURIComponent(birthDetails.name)}&date=${birthDetails.date}&time=${birthDetails.time}&lat=${birthDetails.lat}&lng=${birthDetails.lng}&tz=${birthDetails.timezone}&place=${encodeURIComponent(birthDetails.place)}`
                : "/kundli",
              icon: FileText,
              color: "text-solar-gold",
              bg: "bg-solar-gold/10"
            },
            { label: "Matching", route: "/matchmaking", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
            { label: "Panchang", route: "/panchang", icon: Sun, color: "text-orange-400", bg: "bg-orange-400/10" }
          ].filter(action => !(user?.role === 'astrologer' && action.hideForAstro)).map((action, i) => (
            <motion.button
              key={action.label}
              onClick={() => router.push(action.route)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="flex-1 min-w-[70px] flex flex-col items-center gap-2 p-3 rounded-[2rem] glass-panel border-white/5 bg-gradient-to-b from-white/5 to-transparent active:scale-95 transition-all"
            >
              <div className={`p-2 rounded-xl ${action.bg} ${action.color}`}>
                <action.icon size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recommended Astrologers Banner (Mini) */}
      {user?.role !== 'astrologer' && (
        <CosmicCard delay={0.4} noHover>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-solar-gold" />
              Live Astrologers
            </h3>
            <button onClick={() => router.push("/explore")} className="text-xs text-electric-violet font-semibold active:scale-95 transition-all">View All</button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-t-2 border-electric-violet animate-spin" />
            </div>
          ) : astrologers.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {astrologers.map((astro) => (
                <div 
                  key={astro._id} 
                  onClick={() => router.push(`/astrologer?id=${astro._id}`)}
                  className="flex-shrink-0 w-28 glass-panel rounded-2xl p-3 flex flex-col items-center gap-2 relative active:scale-95 transition-all cursor-pointer border-white/5 bg-gradient-to-b from-white/5 to-transparent"
                >
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-cosmic-indigo shadow-lg ${astro.isChatOnline || astro.isOnline ? 'bg-green-500' : 'bg-slate-500'
                    }`} />
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden text-center p-0.5">
                    <img 
                      src={getImageUrl(astro.image || astro.profileImage)} 
                      alt={astro.displayName || astro.name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                      }}
                    />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-[11px] font-bold text-white break-words w-full px-1">{astro.displayName || astro.name}</p>
                    <p className="text-[10px] text-solar-gold font-bold">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">No live astrologers right now.</p>
          )}
        </CosmicCard>
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
