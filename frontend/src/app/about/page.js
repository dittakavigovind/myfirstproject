"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Star, 
    Target, 
    Eye, 
    Sparkles, 
    BookOpen, 
    Calendar, 
    MapPin, 
    Search, 
    Users, 
    ArrowRight,
    Compass,
    Shield
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#05070a] text-white pb-24 selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] z-0"></div>
                
                {/* Decorative BG Elements */}
                <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                            <Sparkles className="w-3.5 h-3.5 text-astro-yellow" />
                            <span className="text-indigo-100 text-[11px] font-black tracking-[0.25em] uppercase">About Way2Astro</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-tight">
                            Ancient Wisdom for the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-amber-200">Digital World</span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-indigo-100/70 leading-relaxed font-medium">
                            Way2Astro is a modern Vedic astrology platform dedicated to bringing the ancient wisdom of Jyotish Shastra to your fingertips.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Core Sections */}
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32"
                >
                    {/* Mission */}
                    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 hover:border-astro-yellow/30 transition-all duration-500 ease-out shadow-2xl overflow-hidden relative">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-astro-yellow/5 rounded-full blur-3xl group-hover:bg-astro-yellow/10 transition-colors"></div>
                        <div className="w-14 h-14 rounded-2xl bg-astro-yellow/10 flex items-center justify-center border border-astro-yellow/20 mb-8">
                            <Target className="text-astro-yellow w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-black mb-6">Our Mission</h2>
                        <p className="text-indigo-100/70 text-lg leading-relaxed font-medium">
                            Our mission is to make the sacred knowledge of Vedic astrology accessible to everyone. Through digital tools and accurate astrological insights, Way2Astro helps individuals gain clarity about important life decisions such as marriage, career, health, and financial growth.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 hover:border-purple-400/30 transition-all duration-500 ease-out shadow-2xl overflow-hidden relative">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-8">
                            <Eye className="text-purple-400 w-7 h-7" />
                        </div>
                        <h2 className="text-3xl font-black mb-6">Our Vision</h2>
                        <p className="text-indigo-100/70 text-lg leading-relaxed font-medium">
                            Our vision is to build a trusted global platform where ancient Vedic wisdom meets modern digital innovation. Way2Astro strives to help millions of people discover clarity, positivity, and spiritual guidance through astrology, horoscope insights, and sacred temple rituals.
                        </p>
                    </div>
                </motion.div>

                {/* Expertise Section */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Our Astrology <span className="text-astro-yellow">Expertise</span></h2>
                        <p className="text-indigo-100/60 max-w-2xl mx-auto text-lg">Way2Astro focuses on authentic Vedic astrology principles to provide meaningful insights and guidance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Vedic Astrology (Jyotish)",
                                desc: "Accurate planetary calculations based on traditional Indian astrology to understand life patterns and potential future events.",
                                icon: <Compass className="w-6 h-6 text-amber-300" />
                            },
                            {
                                title: "Panchang & Muhurat",
                                desc: "Information about auspicious timings for important activities such as marriages, travel, investments, and ceremonies.",
                                icon: <Calendar className="w-6 h-6 text-orange-400" />
                            },
                            {
                                title: "Horoscope Predictions",
                                desc: "Daily, weekly, and monthly horoscope insights designed to help individuals understand planetary influences and make informed decisions.",
                                icon: <Star className="w-6 h-6 text-yellow-200" />
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/2 border border-white/5 p-8 rounded-[2rem] hover:bg-white/5 transition-colors"
                            >
                                <div className="p-3 bg-white/5 w-fit rounded-xl border border-white/10 mb-6">{item.icon}</div>
                                <h3 className="text-xl font-black mb-4">{item.title}</h3>
                                <p className="text-indigo-100/60 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Services Section */}
                <section className="mb-32">
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 rounded-[3.5rem] p-10 md:p-20 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
                        <div className="relative z-10">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black mb-4">Spiritual Services</h2>
                                <p className="text-indigo-100/60 text-lg max-w-xl">Designed to help you connect with divine blessings and cosmic wisdom from anywhere in the world.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                            <Shield className="w-4 h-4 text-orange-400" />
                                        </div>
                                        Online Temple Seva
                                    </h3>
                                    <p className="text-indigo-100/60 text-sm leading-relaxed">
                                        Users can book sacred temple rituals online, including Archana, Akshithalu, Talambrala Muthyam, Navagraha Pooja, and Vedic blessings performed by qualified priests at renowned temples.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                            <Search className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        Astrology Tools
                                    </h3>
                                    <p className="text-indigo-100/60 text-sm leading-relaxed">
                                        Way2Astro provides astrology tools for planetary positions, Panchang details, horoscope analysis, and other traditional Vedic astrology calculations.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                            <BookOpen className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        Knowledge Base
                                    </h3>
                                    <p className="text-indigo-100/60 text-sm leading-relaxed">
                                        Through detailed articles and guides, users can learn about Vedic astrology, planetary influences, spiritual practices, and ancient Hindu traditions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section */}
                <section className="mb-32 max-w-4xl mx-auto text-center">
                    <div className="inline-block p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 mb-8">
                        <Users className="w-10 h-10 text-indigo-400 opacity-50" />
                    </div>
                    <h2 className="text-4xl font-black mb-8">Our Spiritual Philosophy</h2>
                    <div className="space-y-6 text-lg text-indigo-100/70 font-medium leading-relaxed">
                        <p>
                            According to Vedic astrology, planetary movements reflect the deeper cosmic rhythm of the universe. These celestial influences play an important role in shaping human experiences and life events.
                        </p>
                        <p>
                            By understanding planetary positions and cosmic timing, individuals can align their actions with favorable energies and make wiser life decisions.
                        </p>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow to-orange-400 font-black text-xl italic">
                            Way2Astro bridges the gap between ancient spiritual knowledge and modern digital access, helping people explore astrology and devotion from anywhere in the world.
                        </p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative overflow-hidden rounded-[3rem] bg-astro-yellow p-12 md:p-20 text-black text-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/10"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase">Begin Your Spiritual Journey</h2>
                        <p className="text-black/70 text-lg font-bold mb-10 leading-snug">
                            Whether you are exploring astrology for the first time or seeking deeper spiritual guidance, Way2Astro welcomes you.
                        </p>
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-3 py-4 px-10 rounded-full bg-black text-white font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                        >
                            Explore Way2Astro <ArrowRight size={18} />
                        </Link>
                    </div>
                    {/* Decorative cosmic circles */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 border-2 border-black/5 rounded-full -ml-32 opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 border-2 border-black/5 rounded-full -mr-40 opacity-20 group-hover:scale-110 transition-transform duration-1000"></div>
                </section>
            </div>
        </main>
    );
}
