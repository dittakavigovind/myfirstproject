"use client";

import { useRouter } from "next/navigation";
import { Mail, Info, Shield, FileText, UserCheck, AlertTriangle, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import CosmicCard from "@/components/CosmicCard";

export default function SupportPage() {
    const router = useRouter();

    const supportLinks = [
        { icon: Info, label: "About Us", color: "text-blue-400", bg: "bg-blue-400/10", route: "/about" },
        { icon: Shield, label: "Privacy Policy", color: "text-green-400", bg: "bg-green-400/10", route: "/privacy" },
        { icon: FileText, label: "Terms of Service", color: "text-purple-400", bg: "bg-purple-400/10", route: "/terms" },
        { icon: UserCheck, label: "Astrologer Terms", color: "text-rose-400", bg: "bg-rose-400/10", route: "/astrologer-terms" },
        { icon: AlertTriangle, label: "Disclaimer", color: "text-solar-gold", bg: "bg-solar-gold/10", route: "/disclaimer" },
    ];

    return (
        <div className="min-h-screen bg-[#0b1026] text-white p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2 mt-2">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-black tracking-wide">Support & Legal</h1>
            </div>

            {/* Email Support */}
            <CosmicCard className="p-6 bg-gradient-to-br from-[#1a1438] to-[#0b1026] border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.4)] relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-electric-violet/10 rounded-full blur-2xl transition-all" />
                <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-electric-violet/10 flex items-center justify-center border border-electric-violet/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Mail size={32} className="text-electric-violet" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">Contact Support</h2>
                        <p className="text-xs text-slate-400 mb-5">We usually respond within 24-48 hours.</p>
                        <a 
                            href="mailto:info@way2astro.com"
                            className="inline-flex items-center justify-center w-full max-w-[240px] py-3.5 rounded-2xl bg-gradient-to-r from-electric-violet to-fuchsia-600 text-sm font-black text-white shadow-lg shadow-electric-violet/25 active:scale-95 transition-all"
                        >
                            info@way2astro.com
                        </a>
                    </div>
                </div>
            </CosmicCard>

            {/* Legal Links */}
            <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Legal & Information</h3>
                <div className="space-y-3">
                    {supportLinks.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(item.route)}
                            className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors border border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                                    <item.icon size={20} strokeWidth={2} />
                                </div>
                                <span className="text-white font-medium text-base">{item.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="h-6" />
        </div>
    );
}
