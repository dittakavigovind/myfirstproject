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
        <div className="min-h-screen text-white p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 pt-safe overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2 pt-2">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-all text-white/80 hover:text-white backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black tracking-tight">Support & Legal</h1>
                    <p className="text-[10px] text-slate-400 font-medium">Assistance & Policies</p>
                </div>
            </div>

            {/* Email Support Card */}
            <div className="p-6 rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-electric-violet/15 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col items-center text-center space-y-3.5 relative z-10">
                    <div className="w-16 h-16 rounded-[22px] bg-electric-violet/15 flex items-center justify-center border border-electric-violet/30 shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                        <Mail size={28} className="text-electric-violet" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white mb-1">Direct Helpdesk</h2>
                        <p className="text-xs text-slate-400 mb-4">Our celestial team typically responds within 24 hours.</p>
                        <a 
                            href="mailto:info@way2astro.com"
                            className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-electric-violet to-purple-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-electric-violet/25 active:scale-95 transition-all border border-white/15"
                        >
                            info@way2astro.com
                        </a>
                    </div>
                </div>
            </div>

            {/* Apple Inset Grouped Table */}
            <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Legal Documents</h3>
                <div className="rounded-[24px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] divide-y divide-white/5">
                    {supportLinks.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => router.push(item.route)}
                            className="p-4 flex items-center justify-between cursor-pointer group active:bg-white/[0.08] transition-colors"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`p-2.5 rounded-2xl ${item.bg} ${item.color} shadow-sm border border-white/5`}>
                                    <item.icon size={18} strokeWidth={2} />
                                </div>
                                <span className="text-white font-bold text-sm">{item.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-6" />
        </div>
    );
}
