"use client";

import { Bell, Search, Menu, User, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function ModernHeader() {
    const { user } = useAuth();
    const { scrollY } = useScroll();
    const router = useRouter();

    // Show only first name or Seeker
    const displayName = user?.name ? user.name.split(' ')[0] : "Seeker";

    // Condense header slightly on scroll
    const background = useTransform(
        scrollY,
        [0, 50],
        ["rgba(11, 16, 38, 0)", "rgba(11, 16, 38, 0.8)"]
    );

    const backdropFilter = useTransform(
        scrollY,
        [0, 50],
        ["blur(0px)", "blur(12px)"]
    );

    const borderBottom = useTransform(
        scrollY,
        [0, 50],
        ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.1)"]
    );

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between transition-all"
            style={{ background, backdropFilter, borderBottom }}
        >
            <div className="flex items-center gap-3">
                {/* Profile Avatar - Clickable */}
                <div
                    onClick={() => router.push('/profile')}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-electric-violet to-solar-gold p-[2px] cursor-pointer active:scale-95 transition-all"
                >
                    <div className="w-full h-full rounded-full bg-cosmic-indigo flex items-center justify-center overflow-hidden border border-white/20">
                        {user?.profileImage ? (
                            <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-white/80" />
                        )}
                    </div>
                </div>
                <div
                    onClick={() => router.push('/profile')}
                    className="flex flex-col cursor-pointer active:scale-95 transition-all"
                >
                    <span className="text-[9px] text-slate-400 font-black tracking-widest uppercase">Welcome Back</span>
                    <span className="text-sm font-black text-white leading-tight">{displayName} ✨</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push('/wallet')}
                    className="h-10 px-3 rounded-full glass-panel flex items-center gap-2 text-white hover:bg-white/10 transition-colors border-white/5"
                >
                    <Wallet size={16} className="text-solar-gold" />
                    <span className="text-xs font-black">₹{user?.walletBalance || 0}</span>
                </button>
                <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/10 transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b1026]" />
                </button>
            </div>
        </motion.header>
    );
}
