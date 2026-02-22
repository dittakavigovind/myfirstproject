"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Sun, Moon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FeaturedAstrologerManager from '@/components/admin/FeaturedAstrologerManager';

export default function HoroscopeAdminDashboard() {
    const router = useRouter();

    const options = [
        {
            title: "Daily Horoscope",
            desc: "Manage daily predictions, lucky colors, and cosmic vibes.",
            icon: <Sun size={32} className="text-orange-500" />,
            link: "/admin/horoscope/daily",
            color: "from-orange-500/10 to-amber-500/10 border-orange-200"
        },
        {
            title: "Weekly Horoscope",
            desc: "Set weekly guidance and special advice for upcoming weeks.",
            icon: <Calendar size={32} className="text-blue-500" />,
            link: "/admin/horoscope/weekly",
            color: "from-blue-500/10 to-cyan-500/10 border-blue-200"
        },
        {
            title: "Monthly Horoscope",
            desc: "Plan monthly overviews covering career, love, and health.",
            icon: <Moon size={32} className="text-purple-500" />,
            link: "/admin/horoscope/monthly",
            color: "from-purple-500/10 to-indigo-500/10 border-purple-200"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Horoscope Management</h1>
                    <p className="text-slate-500">Select a category to manage predictions instantly.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {options.map((opt, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => router.push(opt.link)}
                            className={`relative bg-gradient-to-br ${opt.color} border rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group`}
                        >
                            <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                {opt.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{opt.title}</h3>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                {opt.desc}
                            </p>
                            <div className="flex items-center text-sm font-bold text-slate-900 gap-2 group-hover:gap-4 transition-all">
                                Manage <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <FeaturedAstrologerManager />
            </div>
        </div>
    );
}
