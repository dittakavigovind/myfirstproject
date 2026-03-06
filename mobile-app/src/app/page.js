"use client";

import CosmicCard from "@/components/CosmicCard";
import { Sparkles, Moon, Sun, Star, MessageCircle, Phone, FileText, ArrowRight, Heart } from "lucide-react";
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

  useEffect(() => {
    fetchDashboardData();

    // Set up polling for astrologer statuses every 15 seconds
    const pollInterval = setInterval(pollAstrologers, 15000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch horoscope and top astrologers in parallel
      const [horoscopeRes, astroRes] = await Promise.all([
        api.get("/horoscope-manager/daily").catch(() => ({ data: { data: null } })),
        api.get("/astro/astrologers").catch(() => ({ data: { data: [] } }))
      ]);

      if (horoscopeRes.data && horoscopeRes.data.data) {
        setHoroscope(horoscopeRes.data.data);
      }

      if (astroRes.data && astroRes.data.data) {
        // Take just the top 3
        setAstrologers(astroRes.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pollAstrologers = async () => {
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
    <div className="space-y-6 animate-in fade-in duration-500">

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
              onClick={() => router.push('/horoscope')}
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
            { label: "Chat", route: "/explore", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Call", route: "/explore", icon: Phone, color: "text-green-400", bg: "bg-green-400/10" },
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
          ].map((action, i) => (
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
      <CosmicCard delay={0.4} noHover>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-solar-gold" />
            Live Astrologers
          </h3>
          <button onClick={() => router.push("/explore")} className="text-xs text-electric-violet font-semibold">View All</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-t-2 border-electric-violet animate-spin" />
          </div>
        ) : astrologers.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {astrologers.map((astro) => (
              <div key={astro._id} className="flex-shrink-0 w-24 glass-panel rounded-xl p-3 flex flex-col items-center gap-2 relative">
                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${astro.isChatOnline || astro.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-500'
                  }`} />
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden text-center">
                  <img src={astro.image || astro.profileImage || "https://i.pravatar.cc/150"} alt={astro.displayName || astro.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-bold text-white truncate w-full">{astro.displayName || astro.name}</p>
                  <p className="text-[10px] text-slate-400">₹{astro.charges?.chatPerMinute || astro.chatRate || 25}/min</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">No live astrologers right now.</p>
        )}
      </CosmicCard>

      {/* Spacer for bottom nav */}
      <div className="h-6" />
    </div>
  );
}
