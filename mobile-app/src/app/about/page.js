"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen text-slate-300 pb-28 pt-safe">
            <div className="flex items-center gap-3 px-5 z-50 relative sticky top-0 bg-[#050716]/80 backdrop-blur-2xl py-3.5 border-b border-white/5">
                <button 
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-all text-white/80 hover:text-white backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-black text-white m-0 tracking-tight">About Way2Astro</h3>
            </div>
            
            <div className="px-5 py-6">
                <div className="rounded-[28px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-sm leading-relaxed text-slate-200 space-y-4">
                    <h3 className="text-base font-black text-solar-gold mb-1">Ancient Wisdom for the Digital World</h3>
                    <p className="text-slate-300">Way2Astro is a modern Vedic astrology platform dedicated to bringing the ancient wisdom of Jyotish Shastra to your fingertips.</p>

                    <h3 className="text-base font-black text-white pt-2 mb-1">Our Mission</h3>
                    <p className="text-slate-300">Our mission is to make the sacred knowledge of Vedic astrology accessible to everyone. Through digital tools and accurate astrological insights, Way2Astro helps individuals gain clarity about important life decisions such as marriage, career, health, and financial growth.</p>

                    <h3 className="text-base font-black text-white pt-2 mb-1">Our Vision</h3>
                    <p className="text-slate-300">Our vision is to build a trusted global platform where ancient Vedic wisdom meets modern digital innovation. Way2Astro strives to help millions of people discover clarity, positivity, and spiritual guidance through astrology, horoscope insights, and sacred temple rituals.</p>

                    <h3 className="text-base font-black text-white pt-2 mb-1">Our Astrology Expertise</h3>
                    <p className="text-slate-300">Way2Astro focuses on authentic Vedic astrology principles to provide meaningful insights and guidance.</p>
                    
                    <h4 className="text-sm font-bold text-electric-violet mt-2">Vedic Astrology (Jyotish)</h4>
                    <p className="text-slate-300">Accurate planetary calculations based on traditional Indian astrology to understand life patterns and potential future events.</p>
                    
                    <h4 className="text-sm font-bold text-electric-violet mt-2">Panchang & Muhurat</h4>
                    <p className="text-slate-300">Information about auspicious timings for important activities such as marriages, travel, investments, and ceremonies.</p>
                    
                    <h4 className="text-sm font-bold text-electric-violet mt-2">Horoscope Predictions</h4>
                    <p className="text-slate-300">Daily, weekly, and monthly horoscope insights designed to help individuals understand planetary influences and make informed decisions.</p>

                    <h3 className="text-base font-black text-white pt-2 mb-1">Spiritual Services</h3>
                    <p className="text-slate-300">Designed to help you connect with divine blessings and cosmic wisdom from anywhere in the world.</p>
                    
                    <h4 className="text-sm font-bold text-solar-gold mt-2">Online Temple Seva</h4>
                    <p className="text-slate-300">Users can book sacred temple rituals online, including Archana, Akshithalu, Talambrala Muthyam, Navagraha Pooja, and Vedic blessings performed by qualified priests at renowned temples.</p>
                    
                    <h4 className="text-sm font-bold text-solar-gold mt-2">Astrology Tools</h4>
                    <p className="text-slate-300">Way2Astro provides astrology tools for planetary positions, Panchang details, horoscope analysis, and other traditional Vedic astrology calculations.</p>
                    
                    <h4 className="text-sm font-bold text-solar-gold mt-2">Knowledge Base</h4>
                    <p className="text-slate-300">Through detailed articles and guides, users can learn about Vedic astrology, planetary influences, spiritual practices, and ancient Hindu traditions.</p>

                    <h3 className="text-base font-black text-white pt-2 mb-1">Our Spiritual Philosophy</h3>
                    <p className="text-slate-300">According to Vedic astrology, planetary movements reflect the deeper cosmic rhythm of the universe. These celestial influences play an important role in shaping human experiences and life events. By understanding planetary positions and cosmic timing, individuals can align their actions with favorable energies and make wiser life decisions.</p>
                    <p className="text-slate-300">Way2Astro bridges the gap between ancient spiritual knowledge and modern digital access, helping people explore astrology and devotion from anywhere in the world.</p>
                </div>
            </div>
        </main>
    );
}
