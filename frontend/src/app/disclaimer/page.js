"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, FileText, ChevronRight, Globe, Mail, MapPin, AlertCircle, Sparkles, Scale, Gavel, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DisclaimerPage() {
    const lastUpdated = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <main className="min-h-screen bg-[#05070a] text-white pb-24 selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Hero Section */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] z-0"></div>

                {/* Decorative BG Elements */}
                <div className="absolute top-[-10%] right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-1/4 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                            <AlertTriangle className="w-3 h-3 text-astro-yellow" />
                            <span className="text-amber-100 text-[10px] font-black tracking-[0.2em] uppercase">Limitation of Liability</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">
                            Discl<span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-amber-200">aimer</span>
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-indigo-200/60 font-medium text-sm">
                            <span className="flex items-center gap-1"><Globe size={14} /> Way2Astro.com</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>Last Updated: {lastUpdated}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 relative z-10 -mt-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
                >
                    <div className="prose prose-invert max-w-none space-y-12">
                        {/* Header Intro */}
                        <div className="p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 text-center">
                            <p className="text-indigo-100/70 leading-relaxed font-medium m-0">
                                This Disclaimer governs your use of Way2Astro.com (“Website”, “Platform”, “we”, “us”, “our”), owned and operated by <span className="text-white font-black">Go Digital Media and Solutions</span>.
                            </p>
                            <p className="text-indigo-100/70 leading-relaxed font-medium mt-4 m-0">
                                By accessing or using this Website, you agree to the terms stated in this Disclaimer.
                            </p>
                        </div>

                        {/* 1. Entertainment Purposes */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Sparkles className="text-astro-yellow" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">1. Entertainment Purposes Only</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                All information, astrology reports, horoscope predictions, consultations, spiritual guidance, numerology insights, tarot readings, and related content available on Way2Astro.com are provided strictly for entertainment and general informational purposes only.
                            </p>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                Astrology is a belief-based system rooted in traditional knowledge and interpretation. The services offered on this Platform are not scientifically proven methods and should not be treated as factual, guaranteed, or absolute.
                            </p>
                        </section>

                        {/* 2. No Professional Advice */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Heart className="text-rose-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">2. No Professional Advice</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium italic">
                                Any prediction, advice, consultation, or message received through Way2Astro.com:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    'Is NOT a substitute for professional medical advice',
                                    'Is NOT a substitute for legal consultation',
                                    'Is NOT a substitute for financial advisory services',
                                    'Is NOT a substitute for psychological or psychiatric treatment'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/2 rounded-xl border border-white/5 text-xs font-bold text-rose-200/40">
                                        <AlertCircle size={14} className="shrink-0" /> {item}
                                    </div>
                                ))}
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium mt-6">
                                You must always seek advice from a licensed professional such as a qualified doctor, a registered psychiatrist, a licensed lawyer, or a certified financial advisor.
                            </p>
                            <p className="text-red-400 text-sm font-black p-4 bg-red-500/5 rounded-xl border border-red-500/10 uppercase tracking-tight">
                                You should never delay or avoid seeking professional advice because of information obtained through this Platform.
                            </p>
                        </section>

                        {/* 3. No Guarantees */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Scale className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">3. No Guarantees or Warranties</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">Way2Astro.com:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
                                {[
                                    'Makes no guarantees regarding accuracy of predictions',
                                    'Makes no promises regarding outcomes',
                                    'Provides no implied warranties',
                                    'Does not assure effectiveness of remedies'
                                ].map((item, i) => (
                                    <li key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-bold text-indigo-100/60 flex items-center gap-3">
                                        <ChevronRight size={14} className="text-astro-yellow shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/70 leading-relaxed font-medium mt-4">
                                Use of the Website and services is entirely at your own discretion and risk.
                            </p>
                        </section>

                        {/* 4. Platform Role */}
                        <section className="bg-white/2 p-8 rounded-3xl border border-white/5 space-y-6">
                            <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter text-center italic">4. Platform Role & Responsibility</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <p className="text-indigo-100/70 text-sm leading-relaxed m-0">Way2Astro.com operates as a technology platform that connects users with independent astrologers and spiritual advisors.</p>
                                <ul className="space-y-2 list-none p-0 text-xs font-bold text-indigo-100/40">
                                    <li>• Astrologers are independent service providers</li>
                                    <li>• Way2Astro does not control or influence their advice</li>
                                    <li>• Way2Astro does not endorse specific remedies</li>
                                    <li>• Interaction is at the sole discretion of the user</li>
                                </ul>
                            </div>
                        </section>

                        {/* 5. Company Information */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <MapPin className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">5. Company Information</h2>
                            </div>
                            <div className="p-6 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                                <p className="text-indigo-100/70 leading-relaxed font-medium">Way2Astro.com is owned and operated by: <span className="text-white font-black">Go Digital Media and Solutions</span>.</p>
                                <p className="text-indigo-100/70 text-sm leading-relaxed">
                                    Way2Astro is an online digital product/platform operated by the above entity.
                                </p>
                                <p className="text-indigo-100/70 text-sm leading-relaxed font-bold border-l-2 border-astro-yellow pl-4">
                                    All transactions and user data collected on this Platform are managed and processed by Go Digital Media and Solutions in accordance with our Privacy Policy and applicable Indian laws.
                                </p>
                            </div>
                        </section>

                        {/* 6. Limitation of Liability */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Gavel className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">6. Limitation of Liability</h2>
                            </div>
                            <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">Under no circumstances shall Way2Astro.com or Go Digital Media and Solutions be liable for:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Emotional distress', 'Financial loss', 'Relationship decisions', 'Business decisions', 'Health decisions'].map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-indigo-100/40">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-red-400 text-xs font-black uppercase tracking-widest mt-4">Your reliance on any information provided through the Platform is solely at your own risk.</p>
                        </section>

                        {/* 7. Emergency Notice */}
                        <section className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10 space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <ShieldAlert className="text-red-400" size={24} />
                                <h2 className="text-xl font-black text-white m-0 uppercase tracking-tight">7. Emergency Notice</h2>
                            </div>
                            <p className="text-red-200/80 text-sm font-bold uppercase tracking-wide leading-relaxed">
                                WAY2ASTRO IS NOT A CRISIS SERVICE.
                            </p>
                            <p className="text-indigo-100/70 text-sm leading-relaxed">
                                If you are experiencing suicidal thoughts, facing a medical emergency, or in danger of harming yourself or others, please immediately contact emergency services or a suicide prevention helpline.
                            </p>
                        </section>

                        {/* 8. Acceptance */}
                        <section className="space-y-4 border-t border-white/10 pt-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">8. Acceptance of Disclaimer</h2>
                            <p className="text-indigo-100/70 leading-relaxed font-medium italic underline underline-offset-8 decoration-astro-yellow/30">
                                By continuing to use Way2Astro.com, you acknowledge that you understand astrology is interpretative and belief-based, you accept full responsibility for your decisions, and you release Way2Astro and Go Digital Media and Solutions from any liability.
                            </p>
                        </section>

                        {/* Contact Info Footer */}
                        <div className="mt-16 pt-12 border-t border-white/10 flex flex-col items-center text-center space-y-8">
                            <div className="space-y-4 text-center">
                                <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Company Information</h4>
                                <div className="space-y-1">
                                    <p className="text-astro-yellow font-black text-xl m-0 tracking-tight">Way2Astro.com</p>
                                    <p className="text-indigo-200/60 text-xs font-bold font-mono uppercase">Owned & Operated by Go Digital Media and Solutions</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-8">
                                <div className="flex items-center gap-3 text-indigo-100/70">
                                    <Mail size={18} className="text-astro-yellow" />
                                    <span className="font-bold text-sm">support@way2astro.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-indigo-100/70">
                                    <MapPin size={18} className="text-astro-yellow" />
                                    <span className="font-bold text-sm">Way2Astro HQ, India</span>
                                </div>
                            </div>

                            <Link href="/">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-indigo-100"
                                >
                                    Back to Sanctuary
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
