"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#0b1026] text-slate-300 pb-24">
            <div className="flex items-center gap-4 px-5 z-50 relative sticky top-0 bg-[#0b1026] py-4 border-b border-white/5">
                <button 
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white m-0">About Us</h3>
            </div>
            
            <div className="px-5 py-6 text-sm text-justify leading-relaxed">
                <h3 className="text-lg font-bold text-white mt-6 mb-2">Ancient Wisdom for the Digital World</h3>
                <p className="mb-4">Way2Astro is a modern Vedic astrology platform dedicated to bringing the ancient wisdom of Jyotish Shastra to your fingertips.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">Our Mission</h3>
                <p className="mb-4">Our mission is to make the sacred knowledge of Vedic astrology accessible to everyone. Through digital tools and accurate astrological insights, Way2Astro helps individuals gain clarity about important life decisions such as marriage, career, health, and financial growth.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">Our Vision</h3>
                <p className="mb-4">Our vision is to build a trusted global platform where ancient Vedic wisdom meets modern digital innovation. Way2Astro strives to help millions of people discover clarity, positivity, and spiritual guidance through astrology, horoscope insights, and sacred temple rituals.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">Our Astrology Expertise</h3>
                <p className="mb-4">Way2Astro focuses on authentic Vedic astrology principles to provide meaningful insights and guidance.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Vedic Astrology (Jyotish)</h4>
                <p className="mb-4">Accurate planetary calculations based on traditional Indian astrology to understand life patterns and potential future events.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Panchang & Muhurat</h4>
                <p className="mb-4">Information about auspicious timings for important activities such as marriages, travel, investments, and ceremonies.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Horoscope Predictions</h4>
                <p className="mb-4">Daily, weekly, and monthly horoscope insights designed to help individuals understand planetary influences and make informed decisions.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">Spiritual Services</h3>
                <p className="mb-4">Designed to help you connect with divine blessings and cosmic wisdom from anywhere in the world.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Online Temple Seva</h4>
                <p className="mb-4">Users can book sacred temple rituals online, including Archana, Akshithalu, Talambrala Muthyam, Navagraha Pooja, and Vedic blessings performed by qualified priests at renowned temples.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Astrology Tools</h4>
                <p className="mb-4">Way2Astro provides astrology tools for planetary positions, Panchang details, horoscope analysis, and other traditional Vedic astrology calculations.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Knowledge Base</h4>
                <p className="mb-4">Through detailed articles and guides, users can learn about Vedic astrology, planetary influences, spiritual practices, and ancient Hindu traditions.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">Our Spiritual Philosophy</h3>
                <p className="mb-4">According to Vedic astrology, planetary movements reflect the deeper cosmic rhythm of the universe. These celestial influences play an important role in shaping human experiences and life events. By understanding planetary positions and cosmic timing, individuals can align their actions with favorable energies and make wiser life decisions.</p>
                <p className="mb-4">Way2Astro bridges the gap between ancient spiritual knowledge and modern digital access, helping people explore astrology and devotion from anywhere in the world.</p>
            </div>
        </main>
    );
}
