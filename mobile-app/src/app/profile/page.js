"use client";

import { useRouter } from "next/navigation";
import { 
    User, Settings, Wallet, CreditCard, HelpCircle, LogOut, ChevronRight, 
    ShoppingBag, MessageCircle, History, Sparkles, BookOpen, FileText,
    Apple, Globe, Youtube, Facebook, Instagram, Linkedin, Heart,
    Star, DollarSign, Phone, Video
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CosmicCard from "@/components/CosmicCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

const Toggle = ({ enabled, onChange, loading, color = "bg-green-500" }) => (
    <button 
        type="button"
        disabled={loading}
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!loading) onChange(!enabled);
        }}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${enabled ? color : 'bg-slate-700'} ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <motion.div 
            animate={{ x: enabled ? 24 : 0 }}
            className="w-4 h-4 bg-white rounded-full shadow-sm"
        />
    </button>
);

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const router = useRouter();
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const timerRef = useRef(null);
    
    const isAstrologer = user?.role === 'astrologer';
    const displayName = user?.name?.split(' ')[0] || "Seeker";

    const handleToggle = async (field, value) => {
        setUpdatingStatus(true);
        try {
            const body = { [field]: value };
            const { data } = await api.post("/users/status", body);
            if (data.success) {
                setUser(prev => ({ ...prev, ...data.user }));
            }
        } catch (error) {
            console.error("Status update failed:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    // 20-Second Auto-Off Rule: If Master is ON but NO services are enabled, turn OFF after 20s
    useEffect(() => {
        if (!isAstrologer) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        if (user?.isOnline && !user?.isChatOnline && !user?.isVoiceOnline && !user?.isVideoOnline) {
            timerRef.current = setTimeout(() => {
                console.log("Auto-OFF: No services enabled within 20s");
                handleToggle('status', false);
            }, 20000);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [user?.isOnline, user?.isChatOnline, user?.isVoiceOnline, user?.isVideoOnline]);

    const userMenuItems = [
        { icon: Wallet, label: "Wallet Balance", value: `₹${user?.walletBalance || 0}`, color: "text-green-400", bg: "bg-green-400/10", route: "/wallet" },
        { icon: ShoppingBag, label: "Book a Pooja", color: "text-solar-gold", bg: "bg-solar-gold/10", route: "/explore", badge: "New" },
        { icon: MessageCircle, label: "Customer Support Chat", color: "text-purple-400", bg: "bg-purple-400/10", route: "/explore" },
        { icon: History, label: "Order History", color: "text-orange-400", bg: "bg-orange-400/10", route: "/wallet" },
        { icon: Sparkles, label: "AstroRemedy", color: "text-indigo-400", bg: "bg-indigo-400/10", route: "/explore" },
        { icon: BookOpen, label: "Astrology Blog", color: "text-electric-violet", bg: "bg-electric-violet/10", route: "/blog" },
        { icon: MessageCircle, label: "Chat with Astrologers", color: "text-blue-400", bg: "bg-blue-400/10", route: "/explore" },
        { icon: Heart, label: "My Following", color: "text-rose-400", bg: "bg-rose-400/10", route: "/explore" },
        { icon: FileText, label: "My Kundli", color: "text-solar-gold", bg: "bg-solar-gold/10", route: "/kundli" },
        { icon: Sparkles, label: "Free Services", color: "text-cyan-400", bg: "bg-cyan-400/10", route: "/panchang" },
        { icon: Settings, label: "Settings", color: "text-slate-400", bg: "bg-white/5", route: "/profile" },
    ];

    const [showPricingModal, setShowPricingModal] = useState(false);
    const [prices, setPrices] = useState({
        chat: user?.chatPrice || 15,
        call: user?.callPrice || 15,
        video: user?.videoPrice || 15
    });
    const [updatingPrices, setUpdatingPrices] = useState(false);

    useEffect(() => {
        if (user && !showPricingModal) {
            setPrices({
                chat: user.chatPrice || 15,
                call: user.callPrice || 15,
                video: user.videoPrice || 15
            });
        }
    }, [user?.chatPrice, user?.callPrice, user?.videoPrice, showPricingModal]);

    const handleUpdatePrices = async () => {
        if (prices.chat < 15 || prices.call < 15 || prices.video < 15) {
            alert("Minimum price for any service is ₹15/min");
            return;
        }
        
        if (user?.isChatOnline || user?.isVoiceOnline || user?.isVideoOnline) {
             alert("Cannot change pricing while availability is enabled. Please turn off availability first.");
             return;
        }

        setUpdatingPrices(true);
        try {
            const { data } = await api.put("/users/profile", {
                chatPrice: prices.chat,
                callPrice: prices.call,
                videoPrice: prices.video
            });
            if (data.success) {
                setUser({ ...user, ...data.user });
                setShowPricingModal(false);
            }
        } catch (error) {
            console.error("Failed to update prices", error);
        } finally {
            setUpdatingPrices(false);
        }
    };

    const astroMenuItems = [
        { icon: DollarSign, label: "Earnings", value: `₹${user?.walletBalance || 0}`, color: "text-green-400", bg: "bg-green-400/10", route: "/profile/earnings" },
        { icon: Star, label: "My Reviews", color: "text-solar-gold", bg: "bg-solar-gold/10", route: "/profile/reviews" },
        { icon: History, label: "Consultation History", color: "text-blue-400", bg: "bg-blue-400/10", route: "/history" },
        { icon: Settings, label: "Pricing & Settings", color: "text-slate-400", bg: "bg-white/5", onClick: () => setShowPricingModal(true) },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Profile Header */}
            <CosmicCard className="text-center py-8 bg-gradient-to-tr from-cosmic-indigo to-electric-violet/10 border-white/10 relative overflow-hidden">
                {isAstrologer && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`} />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{user?.isOnline ? "Online" : "Offline"}</span>
                        <Toggle 
                            enabled={user?.isOnline} 
                            onChange={(val) => handleToggle('status', val)} 
                            loading={updatingStatus} 
                        />
                    </div>
                )}
                
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-electric-violet to-solar-gold p-1 mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                    <div className="w-full h-full rounded-full bg-cosmic-indigo flex items-center justify-center overflow-hidden border-2 border-white/10">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <User size={40} className="text-white/80" />
                        )}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{isAstrologer ? `Astro ${displayName}` : displayName} ✨</h2>
                <p className="text-slate-400 font-medium mb-4">{user?.phone || "+91 9948505111"}</p>

                <div className="flex justify-center gap-3">
                    <button className="px-6 py-2 rounded-full glass-pill text-sm font-bold text-white border-white/20 hover:bg-white/10 transition-colors">
                        Edit Profile
                    </button>
                    {isAstrologer && (
                         <button 
                            onClick={() => setShowPricingModal(true)}
                            className="px-6 py-2 rounded-full glass-pill text-sm font-bold text-electric-violet bg-electric-violet/10 border-electric-violet/20"
                         >
                            ₹{user?.chatPrice || 15}/min
                        </button>
                    )}
                </div>
            </CosmicCard>

            {/* Astrologer Availability Toggles */}
            {isAstrologer && user?.isOnline && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Chat", icon: MessageCircle, field: 'isChatOnline', enabled: user?.isChatOnline, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                        { label: "Voice", icon: Phone, field: 'isVoiceOnline', enabled: user?.isVoiceOnline, color: 'text-green-400', bg: 'bg-green-400/10' },
                        { label: "Video", icon: Video, field: 'isVideoOnline', enabled: user?.isVideoOnline, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    ].map((mode) => (
                        <div key={mode.label} className="glass-panel p-3 rounded-2xl flex flex-col items-center gap-2 text-center border-white/5">
                            <div className={`p-2 rounded-xl ${mode.bg} ${mode.color}`}>
                                <mode.icon size={18} />
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{mode.label}</span>
                            <Toggle 
                                enabled={mode.enabled} 
                                onChange={(val) => handleToggle(mode.field, val)} 
                                loading={updatingStatus} 
                                color={mode.label === 'Chat' ? 'bg-blue-500' : mode.label === 'Voice' ? 'bg-green-500' : 'bg-purple-500'}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Menu List */}
            <div className="space-y-3">
                {(isAstrologer ? astroMenuItems : userMenuItems).map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => item.onClick ? item.onClick() : item.route && router.push(item.route)}
                        className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                                <item.icon size={20} strokeWidth={2} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium text-base">{item.label}</span>
                                {item.badge && (
                                    <span className="text-[10px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.value && <span className="text-electric-violet font-bold bg-electric-violet/10 px-3 py-1 rounded-lg text-sm">{item.value}</span>}
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pricing Modal */}
            <AnimatePresence>
                {showPricingModal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !updatingPrices && setShowPricingModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-lg glass-panel p-6 rounded-3xl border-white/10 z-10"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Pricing Adjustments</h3>
                            <p className="text-slate-400 text-sm mb-6 font-medium leading-relaxed">
                                Set your consultation price per minute. <br/>
                                <span className="text-solar-gold font-bold italic">Minimum ₹15/min for all services.</span>
                            </p>

                            <div className="space-y-4 mb-8">
                                {[
                                    { label: "Chat Price", icon: MessageCircle, field: 'chat', color: "text-blue-400" },
                                    { label: "Voice Price", icon: Phone, field: 'call', color: "text-green-400" },
                                    { label: "Video Price", icon: Video, field: 'video', color: "text-purple-400" },
                                ].map((field) => (
                                    <div key={field.field} className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-white/5 ${field.color}`}>
                                                <field.icon size={18} />
                                            </div>
                                            <span className="text-white font-bold">{field.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-solar-gold font-black">₹</span>
                                            <input 
                                                type="number" 
                                                value={prices[field.field]}
                                                onChange={(e) => setPrices({...prices, [field.field]: parseInt(e.target.value) || 0})}
                                                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-black text-right focus:outline-none focus:border-solar-gold transition-colors"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={handleUpdatePrices}
                                disabled={updatingPrices}
                                className="w-full py-4 rounded-2xl bg-solar-gold text-cosmic-indigo font-black text-lg shadow-lg shadow-solar-gold/20 active:scale-95 transition-all"
                            >
                                {updatingPrices ? "Updating..." : "Save Prices"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Logout */}
            <button
                onClick={() => {
                    if (user?.isChatOnline || user?.isVoiceOnline || user?.isVideoOnline) {
                        alert("Please turn off Chat, Voice, and Video availability before logging out.");
                        return;
                    }
                    logout();
                }}
                className="w-full glass-panel p-4 rounded-xl flex items-center justify-center gap-2 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/10 transition-colors mt-8"
            >
                <LogOut size={18} />
                Log Out
            </button>

            {/* Social Icons Section */}
            <div className="mt-8 text-center pb-8 opacity-70">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4 italic">Also available on</p>
                <div className="flex justify-center gap-4">
                    {[
                        { icon: Apple, color: "bg-white/5 text-white" },
                        { icon: Globe, color: "bg-green-500/10 text-green-400" },
                        { icon: Youtube, color: "bg-red-500/10 text-red-500" },
                        { icon: Facebook, color: "bg-blue-600/10 text-blue-500" },
                        { icon: Instagram, color: "bg-pink-500/10 text-pink-500" },
                        { icon: Linkedin, color: "bg-blue-700/10 text-blue-600" }
                    ].map((social, i) => (
                        <motion.div 
                            key={i} 
                            whileTap={{ scale: 0.9 }}
                            className={`p-2.5 rounded-xl ${social.color} border border-white/5 active:bg-white/10 transition-all cursor-pointer`}
                        >
                            <social.icon size={20} strokeWidth={1.5} />
                        </motion.div>
                    ))}
                </div>
                <div className="mt-8">
                    <p className="text-[10px] text-slate-600 font-black tracking-widest uppercase">Version 1.1.465</p>
                </div>
            </div>

            <div className="h-10" />
        </div>
    );
}
