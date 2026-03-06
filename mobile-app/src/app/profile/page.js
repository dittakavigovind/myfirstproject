"use client";

import { useRouter } from "next/navigation";
import { User, Settings, Wallet, CreditCard, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CosmicCard from "@/components/CosmicCard";

export default function Profile() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const displayName = user?.name?.split(' ')[0] || "Seeker";

    const menuItems = [
        { icon: Wallet, label: "Wallet Balance", value: `₹${user?.walletBalance || 0}`, color: "text-green-400", bg: "bg-green-400/10", route: "/wallet" },
        { icon: CreditCard, label: "Payment History", color: "text-blue-400", bg: "bg-blue-400/10", route: "/wallet" }, // Redirects to wallet for now
        { icon: Settings, label: "Settings", color: "text-slate-400", bg: "bg-white/5" },
        { icon: HelpCircle, label: "Help & Support", color: "text-solar-gold", bg: "bg-solar-gold/10" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Profile Header */}
            <CosmicCard className="text-center py-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-electric-violet to-solar-gold p-1 mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                    <div className="w-full h-full rounded-full bg-cosmic-indigo flex items-center justify-center overflow-hidden border-2 border-white/10">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <User size={40} className="text-white/80" />
                        )}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{displayName} ✨</h2>
                <p className="text-slate-400 font-medium mb-4">{user?.phone || "+91 98765 43210"}</p>

                <button className="px-6 py-2 rounded-full glass-pill text-sm font-bold text-white border-white/20 hover:bg-white/10 transition-colors">
                    Edit Profile
                </button>
            </CosmicCard>

            {/* Menu List */}
            <div className="space-y-3">
                {menuItems.map((item, i) => (
                    <div
                        key={i}
                        onClick={() => item.route && router.push(item.route)}
                        className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                                <item.icon size={20} />
                            </div>
                            <span className="text-white font-medium text-base">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.value && <span className="text-electric-violet font-bold bg-electric-violet/10 px-3 py-1 rounded-lg text-sm">{item.value}</span>}
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Logout */}
            <button
                onClick={logout}
                className="w-full glass-panel p-4 rounded-xl flex items-center justify-center gap-2 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/10 transition-colors mt-8"
            >
                <LogOut size={18} />
                Log Out
            </button>

            <div className="h-10" />
        </div>
    );
}
