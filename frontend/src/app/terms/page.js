"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Scale, FileText, ChevronRight, Globe, Mail, MapPin, AlertCircle, Wallet, RefreshCcw, UserCheck, MessageSquare, Ban, Landmark, Gavel, Power } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
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
                <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                            <Scale className="w-3 h-3 text-astro-yellow" />
                            <span className="text-indigo-100 text-[10px] font-black tracking-[0.2em] uppercase">User Agreement</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-amber-200">Conditions</span>
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
                        {/* 1. Introduction */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <FileText className="text-astro-yellow" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">1. Introduction</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                This Website, Way2Astro.com (“Platform”, “Website”, “we”, “us”, “our”, or “Company”) is owned and operated by Go Digital Media and Solutions.
                            </p>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                These Terms and Conditions (“Agreement”) govern your access to and use of our online platform through which astrology consultations, horoscope services, Kundli reports, spiritual advisory services, and related services (“Services”) are made available.
                            </p>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                By accessing or using the Platform, you agree to be legally bound by this Agreement. If you do not agree to any part of these Terms, you must not use the Platform.
                            </p>
                        </section>

                        {/* 2. Health & Safety Notice */}
                        <section className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10 space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <ShieldAlert className="text-red-400" size={24} />
                                <h2 className="text-xl font-black text-white m-0 uppercase tracking-tight">2. IMPORTANT HEALTH & SAFETY NOTICE</h2>
                            </div>
                            <p className="text-red-200/80 text-sm font-bold uppercase tracking-wide leading-relaxed p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                IF YOU ARE THINKING ABOUT HARMING YOURSELF OR OTHERS, OR IF YOU ARE EXPERIENCING A MEDICAL OR MENTAL HEALTH EMERGENCY, YOU MUST IMMEDIATELY CONTACT LOCAL POLICE, EMERGENCY SERVICES, OR A SUICIDE PREVENTION HELPLINE (E.G., AASRA: +91-22-27546669).
                            </p>
                            <div className="space-y-4">
                                <p className="text-indigo-100/60 text-sm font-bold m-0 uppercase tracking-[0.2em]">Way2Astro is NOT:</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                                    {[
                                        'A suicide prevention service',
                                        'A mental health crisis platform',
                                        'A medical diagnosis platform',
                                        'A substitute for in-person professional care'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-red-200/50 p-3 bg-white/2 rounded-lg">
                                            <AlertCircle size={14} className="shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-indigo-100/70 text-sm leading-relaxed">
                                    You should never delay, avoid, or discontinue professional medical or psychological treatment because of advice received on this Platform. Use of the Platform in such situations is entirely at your own risk.
                                </p>
                            </div>
                        </section>

                        {/* 3 & 4. Modifications & Consent */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Modifications to Terms</h2>
                                <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">
                                    We reserve the right to modify, amend, or update these Terms at any time. It is your responsibility to review these Terms periodically. Continued use of the Platform after updates constitutes acceptance of the revised Terms.
                                </p>
                            </section>
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">4. User Consent</h2>
                                <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">By registering or using the Platform, you:</p>
                                <ul className="space-y-2 list-none p-0">
                                    <li className="flex items-center gap-2 text-xs text-indigo-100/60">• Confirm that you are at least 18 years of age</li>
                                    <li className="flex items-center gap-2 text-xs text-indigo-100/60">• Confirm that you are legally capable of entering into a binding contract under the Indian Contract Act, 1872</li>
                                    <li className="flex items-center gap-2 text-xs text-indigo-100/60">• Agree to comply with these Terms and our Privacy Policy</li>
                                </ul>
                                <p className="text-red-400 text-[10px] font-black uppercase italic">If you are under 18 years of age, you must not use this Platform.</p>
                            </section>
                        </div>

                        {/* 5. General Description of Services */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Globe className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">5. General Description of Services</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed">Way2Astro provides:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 mb-6 font-medium">
                                {[
                                    'Free astrology content',
                                    'Paid astrology consultations',
                                    'Kundli reports',
                                    'Horoscope services',
                                    'Audio/video consultations',
                                    'Chat-based astrology services'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-indigo-100/70">
                                        <ChevronRight size={14} className="text-astro-yellow shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-6 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                                <p className="text-indigo-100/70 text-sm italic">The Platform acts only as an intermediary between users and astrologers (“Service Providers”). We do not guarantee:</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['Accuracy of predictions', 'Outcomes of advice', 'Effectiveness of remedies'].map((item, i) => (
                                        <li key={i} className="text-[10px] font-black uppercase text-indigo-100/40 text-center p-2 border border-white/5 rounded-lg">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-indigo-100/60 text-xs text-center border-t border-white/5 pt-4">Astrological services are based on traditional interpretations and may vary between Service Providers.</p>
                            </div>
                        </section>

                        {/* 6. Registration */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <UserCheck className="text-emerald-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">6. Registration & Account Responsibility</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed">To access certain services, you must register using your phone number (OTP verification) or email address. You agree to provide accurate, complete, and updated information, and to maintain confidentiality of your account.</p>
                            <p className="text-red-400 text-sm font-bold">We reserve the right to suspend or terminate accounts for false information, misuse, or violation of these Terms.</p>
                        </section>

                        {/* 7. Call & Chat */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <MessageSquare className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">7. Call & Chat with Service Providers</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">Way2Astro provides consultation features including Chat, Audio calls, and Video calls. By using the call feature, you consent to being contacted even if your number is on DND.</p>
                                </div>
                                <div className="space-y-4 font-bold text-xs text-indigo-100/60">
                                    <p className="m-0 border-l-2 border-indigo-500 pl-4 py-1">Service Providers operate independently and are not employees of Way2Astro.</p>
                                    <p className="m-0 border-l-2 border-indigo-500 pl-4 py-1">They are solely responsible for their advice.</p>
                                    <p className="m-0 border-l-2 border-indigo-500 pl-4 py-1">Way2Astro does not assume responsibility for predictions or outcomes.</p>
                                </div>
                            </div>
                        </section>

                        {/* 8. Content & Conduct */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">8. Content & Conduct Rules</h2>
                            <p className="text-indigo-100/70 leading-relaxed">Users must not post abusive, defamatory, obscene, or unlawful content; promote hate speech or discrimination; upload malware; or engage in harassment. Violation may result in immediate account termination and legal action.</p>
                        </section>

                        {/* 9. Refund & Cancellation */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <RefreshCcw className="text-orange-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">9. Refund & Cancellation Policy</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                                    <h3 className="text-lg font-black text-white mb-4">Astrology Services</h3>
                                    <ul className="space-y-2 list-none p-0">
                                        <li className="text-sm text-indigo-200/70 flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                                            No refund once consultation has started.
                                        </li>
                                        <li className="text-sm text-indigo-200/70 flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                                            Refund requests must be raised within 24 hours (subject to review).
                                        </li>
                                        <li className="text-sm text-indigo-200/70 flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                                            No refund for dissatisfaction based on prediction accuracy.
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <h3 className="text-lg font-black text-white mb-4">Technical Issues</h3>
                                    <p className="text-sm text-indigo-200/80 mb-3 font-medium">Refund may be considered in cases of:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['Network interruption', 'Call disconnection', 'Consultant language mismatch', 'Inappropriate behavior'].map((item, i) => (
                                            <div key={i} className="text-[10px] bg-white/5 p-2 rounded-lg text-center border border-white/5 uppercase font-black text-indigo-100/50">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                                    <h3 className="text-sm font-black text-red-400 mb-4 uppercase tracking-widest">No refund for:</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {['Wrong birth details entered', 'Wrong phone number', 'Completed connected calls'].map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-200/60 font-mono">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 10. Way2Astro Wallet */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Wallet className="text-emerald-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">10. Way2Astro Wallet Policy</h2>
                            </div>
                            <div className="p-8 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 space-y-6">
                                <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">Way2Astro may maintain a digital wallet system with two types of credits: <span className="text-white font-black">Real Service Credits</span> (purchased) and <span className="text-white font-black">Virtual Service Credits</span> (promotional).</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ul className="space-y-2 list-none p-0">
                                        <li className="text-xs text-indigo-100/60">• Credits have no cash value</li>
                                        <li className="text-xs text-indigo-100/60">• Non-transferable and cannot be withdrawn</li>
                                    </ul>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-100/40">
                                            <span>Virtual Credits Expiry</span>
                                            <span className="text-emerald-400">14 Days</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-100/40">
                                            <span>Real Credits Expiry</span>
                                            <span className="text-emerald-400">Up to 1 Year</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-red-400 text-[10px] font-black uppercase text-center border-t border-white/5 pt-4 m-0">Expired credits are non-refundable.</p>
                            </div>
                        </section>

                        {/* 11. Disclaimer & Liability */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Scale className="text-astro-yellow" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">11. Disclaimer & Limitation of Liability</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium italic">Services are provided “AS IS”. We do not guarantee accuracy, reliability, or uninterrupted service.</p>
                            <div className="p-6 bg-white/2 rounded-2xl border border-white/5 space-y-4">
                                <p className="text-sm text-indigo-100/70 font-bold uppercase tracking-tight">Way2Astro shall not be liable for:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none p-0">
                                    {[
                                        'Decisions made based on advice',
                                        'Losses arising from use of Platform',
                                        'Indirect or consequential damages',
                                        'Unauthorized access to accounts'
                                    ].map((item, i) => (
                                        <li key={i} className="text-xs text-indigo-100/50 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-astro-yellow shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-indigo-100/80 font-black text-sm text-center pt-4 border-t border-white/5">Maximum liability shall not exceed the amount paid for the service in question.</p>
                            </div>
                        </section>

                        {/* 12. Prohibited Activities */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Ban className="text-red-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tight">12. Prohibited Activities</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'Hate speech', 'Sexual exploitation', 'Child abuse material', 'Black magic / witchcraft promotion',
                                    'Terrorist content', 'Illegal drug promotion', 'Sale of weapons', 'Gambling promotion',
                                    'Harassment', 'Discrimination'
                                ].map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-200/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-red-200/50 text-xs italic mt-3 font-bold">Zero tolerance policy applies. Accounts violating these standards will be terminated immediately.</p>
                        </section>

                        {/* 13. Intellectual Property */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Landmark className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">13. Intellectual Property</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed">All content including text, graphics, designs, logos, and software is the property of Go Digital Media and Solutions. Unauthorized commercial use is strictly prohibited.</p>
                        </section>

                        {/* 14. Indemnification */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">14. Indemnification</h2>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">You agree to indemnify and hold harmless Way2Astro and Go Digital Media and Solutions from claims arising from misuse, violation of these Terms, or infringement of third-party rights.</p>
                        </section>

                        {/* 15. Governing Law */}
                        <section className="bg-indigo-500/5 p-8 rounded-3xl border border-indigo-500/10 space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <Gavel className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">15. Governing Law & Jurisdiction</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-indigo-100/70 leading-relaxed font-medium">These Terms shall be governed by the laws of India. Disputes shall be resolved via arbitration under the Arbitration and Conciliation Act, 1996, in Hyderabad, India, in English.</p>
                                <p className="text-indigo-100/80 font-black text-sm flex items-center gap-2">
                                    <ChevronRight size={16} className="text-astro-yellow shrink-0" />
                                    Courts of Hyderabad shall have exclusive jurisdiction.
                                </p>
                            </div>
                        </section>

                        {/* 16. Termination */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Power className="text-red-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tight">16. Termination</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">We may suspend or terminate accounts without prior notice for violations, security concerns, or legal compliance. Unused credits may lapse as per policy.</p>
                        </section>

                        {/* Contact Info Footer */}
                        <div className="mt-16 pt-12 border-t border-white/10 flex flex-col items-center text-center space-y-8">
                            <div className="space-y-4 text-center">
                                <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Contact Information</h4>
                                <div className="space-y-1">
                                    <p className="text-astro-yellow font-black text-xl m-0 tracking-tight">Way2Astro.com</p>
                                    <p className="text-indigo-200/60 text-xs font-bold font-mono">Owned & Operated by Go Digital Media and Solutions</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-8">
                                <div className="flex items-center gap-3 text-indigo-100/70">
                                    <Mail size={18} className="text-astro-yellow" />
                                    <span className="font-bold text-sm">support@way2astro.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-indigo-100/70">
                                    <MapPin size={18} className="text-astro-yellow" />
                                    <span className="font-bold text-sm">Way2Astro HQ, Hyderabad, India</span>
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
