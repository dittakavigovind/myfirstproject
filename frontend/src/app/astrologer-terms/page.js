"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Users, PlayCircle, ShieldCheck, Ban,
    Handshake, Clock, Wallet, Landmark, Gavel,
    Power, Globe, Mail, MapPin, ChevronRight,
    AlertCircle, Lock, Scale, Sparkles, UserCheck,
    Coins, FileWarning, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function AstrologerTermsPage() {
    const lastUpdated = "February 21, 2026"; // Or system date

    return (
        <main className="min-h-screen bg-[#05070a] text-white pb-24 selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Hero Section */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-astro-navy bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#05070a] to-[#05070a] z-0"></div>

                {/* Decorative BG Elements */}
                <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                            <UserCheck className="w-3 h-3 text-astro-yellow" />
                            <span className="text-indigo-100 text-[10px] font-black tracking-[0.2em] uppercase">Service Provider Agreement</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Astrologer <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-amber-200 uppercase">Terms</span>
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
                        {/* Intro Header */}
                        <div className="p-8 bg-indigo-500/5 rounded-[2rem] border border-white/5 text-center">
                            <p className="text-indigo-200/80 font-black text-xs uppercase tracking-[0.4em] mb-2">Way2Astro.com</p>
                            <p className="text-indigo-100/60 text-xs font-bold font-mono">Owned & Operated by Go Digital Media and Solutions</p>
                        </div>

                        {/* 1. Introduction */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <FileText className="text-astro-yellow" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">1. Introduction</h2>
                            </div>
                            <p>These Terms and Conditions (“Agreement”) govern the relationship between <span className="text-white font-bold">Go Digital Media and Solutions</span> (“Company”, “Way2Astro”, “Platform”, “we”, “us”) and any astrologer, consultant, practitioner, coach, advisor, or professional (“Service Provider” or “Astrologer”) who registers to provide astrology consultation services on Way2Astro.com.</p>
                            <p>The Company provides astrology consultations, spiritual advisory services, horoscope analysis, life guidance, and allied services (“Consultation Services”) through its website and applications.</p>
                            <p className="font-bold text-indigo-200/80 uppercase text-xs tracking-widest">By registering as a Service Provider, you:</p>
                            <ul className="list-none p-0 space-y-3">
                                {[
                                    'Confirm that you have read and understood this Agreement.',
                                    'Agree to be legally bound by these Terms.',
                                    'Acknowledge that you are acting as an independent contractor.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-indigo-100/70">
                                        <ChevronRight size={16} className="text-astro-yellow mt-1 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-red-400 font-black text-[10px] uppercase italic border-l-2 border-red-500/30 pl-4 py-1">If you do not agree, you must not register or provide services on the Platform.</p>
                        </section>

                        {/* 2. Nature of Relationship */}
                        <section className="space-y-4 bg-white/2 p-8 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4 mb-2">
                                <Users className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">2. Nature of Relationship</h2>
                            </div>
                            <p className="text-indigo-100/70 text-sm leading-relaxed mb-4 font-bold">The Astrologer:</p>
                            <ul className="list-none p-0 space-y-2">
                                {['Is an independent Service Provider.', 'Is not an employee, partner, agent, or representative of the Company.', 'Has no authority to bind the Company legally.', 'Is solely responsible for tax compliance and statutory obligations.'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-indigo-100/60">• {item}</li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/50 text-[10px] italic pt-4 border-t border-white/5 uppercase font-black tracking-widest text-center">This Agreement does not constitute employment.</p>
                        </section>

                        {/* 3. Services */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <PlayCircle className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">3. Services</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase text-indigo-300 tracking-widest underline decoration-white/20 underline-offset-4 mb-4">A. Scope</h3>
                                    <p className="text-xs text-indigo-100/60">The Service Provider agrees to offer astrology and related consultation services remotely through:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Chat', 'Audio Call', 'Video Call', 'Live Streaming'].map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-tighter text-indigo-200/60">{item}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase text-indigo-300 tracking-widest underline decoration-white/20 underline-offset-4 mb-4">B. No Minimum Guarantee</h3>
                                    <p className="text-xs text-indigo-100/60">The Company does not guarantee:</p>
                                    <ul className="list-none p-0 space-y-1">
                                        {['Minimum working hours', 'Minimum income', 'User referrals', 'Fixed compensation'].map((item, i) => (
                                            <li key={i} className="text-[10px] text-indigo-100/40 font-bold">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <p className="text-xs text-indigo-100/70 p-4 bg-white/2 rounded-xl border border-white/5 italic text-center">Consultations are provided on an as-needed basis depending on user demand.</p>
                        </section>

                        {/* 4. Account Responsibility */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <ShieldCheck className="text-emerald-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">4. Account & Profile Responsibility</h2>
                            </div>
                            <p className="text-indigo-100/70">The Service Provider agrees to:</p>
                            <ul className="list-none p-0 space-y-2 mb-6">
                                {[
                                    'Provide accurate qualifications, credentials, and experience details.',
                                    'Update information regularly.',
                                    'Maintain confidentiality of login credentials.',
                                    'Not allow third-party access to their account.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-indigo-100/70">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 space-y-4">
                                <p className="text-red-400 font-bold text-sm m-0">Fake profiles, fake reviews, self-bookings, or manipulation of ratings will result in:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Immediate termination', 'Withholding of payouts', 'Penalty up to INR 51,000', 'Permanent blacklisting'].map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black uppercase text-red-200/60">{item}</span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 5. Restrictions */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <Ban className="text-red-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">5. Platform Usage Restrictions</h2>
                            </div>
                            <p className="text-indigo-100/70 font-bold text-sm">The Service Provider shall not:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                                {[
                                    'Reverse engineer platform systems',
                                    'Contact users outside the Platform',
                                    'Share personal contact details',
                                    'Promote competing platforms',
                                    'Collect direct payments from users',
                                    'Provide unlawful/unethical services',
                                    'Practice medicine/law/finance',
                                    'Provide services to minors'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs text-red-100/40 p-3 bg-white/2 rounded-xl border border-white/5">
                                        <AlertCircle size={14} className="text-red-500 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 6. Non-Solicitation */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">6. Non-Solicitation</h2>
                            <p>The Service Provider agrees not to solicit users outside the platform or build a personal brand using our user base. This applies during the Agreement and for <span className="text-white font-black underline decoration-astro-yellow decoration-2">1 year after termination</span>.</p>
                        </section>

                        {/* 7. Online Availability */}
                        <section className="space-y-4 bg-indigo-500/5 p-8 rounded-3xl border border-indigo-500/10">
                            <div className="flex items-center gap-4 mb-2">
                                <Clock className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">7. Online Availability Requirements</h2>
                            </div>
                            <p className="text-indigo-100/70 text-sm italic">Service Providers are expected to:</p>
                            <ul className="space-y-3 list-none p-0">
                                {[
                                    'Maintain regular online presence.',
                                    'Follow minimum activity requirements.',
                                    'Update next online time after logging out.'
                                ].map((item, i) => (
                                    <li key={i} className="text-xs font-bold text-indigo-100/50 flex gap-2">• {item}</li>
                                ))}
                            </ul>
                            <p className="text-[10px] text-white/30 pt-4 border-t border-white/5 uppercase font-black tracking-widest text-center">Standards affect Ranking, Badge eligibility, and Visibility.</p>
                        </section>

                        {/* 8. Revenue Share */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <Wallet className="text-emerald-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">8. Pricing & Revenue Share</h2>
                            </div>
                            <p className="text-indigo-100/70">Pricing is finalized during onboarding and may be revised subject to Company approval.</p>
                            <div className="p-8 bg-white/2 rounded-3xl border border-white/5 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-white/5 pb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Standard Split</p>
                                        <p className="text-4xl font-black text-white m-0">60/40</p>
                                        <p className="text-xs text-white/40">Company / Astrologer</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-200/60">
                                            <ChevronRight size={14} className="text-astro-yellow" /> Green Badge improves splitting
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-200/60">
                                            <ChevronRight size={14} className="text-astro-yellow" /> Promotional sessions reduced payout
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-indigo-100/40 text-center leading-relaxed">The Company reserves the right to deduct payment gateway charges, deduct refund amounts, and withhold payments for suspicious activity.</p>
                            </div>
                        </section>

                        {/* 9. Taxes */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <Coins className="text-astro-yellow" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">9. Payments, Taxes & GST</h2>
                            </div>
                            <p className="text-indigo-100/70 text-sm">The Service Provider is responsible for tax compliance, must provide PAN/GST details, and agrees to TDS deduction as per law.</p>
                            <p className="text-red-400 font-bold text-xs uppercase tracking-widest text-center py-2 px-4 bg-red-500/5 rounded-lg">Non-compliance leads to payment withholding or suspension.</p>
                        </section>

                        {/* 10. Refunds */}
                        <section className="bg-orange-500/5 p-8 rounded-3xl border border-orange-500/10 space-y-4">
                            <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">10. Refund Policy Impact</h2>
                            <p className="text-indigo-100/70 text-sm italic">If a user refund is approved, the astrologer's share will be deducted proportionally. Company's decision is final.</p>
                        </section>

                        {/* 11 & 12. Streaming & Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b border-indigo-500/30 pb-2">11. Live Streaming Rules</h2>
                                <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">Keep camera focused on face, maintain professional conduct, and avoid sharing contact details or abusive speech. Violations carry penalties up to INR 51,000.</p>
                            </section>
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter border-b border-indigo-500/30 pb-2">12. Content Ownership</h2>
                                <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">All live streams, videos, and recordings become the exclusive property of Go Digital Media and Solutions with perpetual worldwide rights.</p>
                            </section>
                        </div>

                        {/* 13. Confidentiality */}
                        <section className="space-y-4 border-t border-white/5 pt-8">
                            <div className="flex items-center gap-4 mb-2">
                                <Lock className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">13. Confidentiality</h2>
                            </div>
                            <p className="text-sm text-indigo-100/70">The Service Provider agrees not to disclose user information or misuse company data. Confidentiality obligations survive termination.</p>
                        </section>

                        {/* 14. Indemnification */}
                        <section className="bg-white/2 p-8 rounded-3xl border border-white/5 space-y-4">
                            <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">14. Indemnification</h2>
                            <p className="text-xs text-indigo-100/50 leading-relaxed">Service Provider agrees to indemnify and hold harmless the Company against user disputes, legal claims, and misrepresentation of qualifications.</p>
                        </section>

                        {/* 15. Limitation of Liability */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <Scale className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">15. Limitation of Liability</h2>
                            </div>
                            <p className="text-xs text-indigo-100/70 font-medium italic">Way2Astro is not responsible for consultation outcomes or platform interruptions. Maximum liability is capped at payouts made in the last 3 months.</p>
                        </section>

                        {/* 16. Notice Period */}
                        <section className="bg-red-500/5 p-8 rounded-[2.5rem] border border-red-500/10 space-y-6 text-center">
                            <h2 className="text-3xl font-black text-white m-0 uppercase tracking-tighter">16. Mandatory Notice Period</h2>
                            <div className="py-4 px-8 bg-red-500/10 rounded-2xl border border-red-500/20 inline-block">
                                <p className="text-red-200 text-xl font-black m-0 tracking-tighter uppercase whitespace-pre">MINIMUM 3 MONTHS WRITTEN NOTICE</p>
                            </div>
                            <p className="text-xs text-indigo-200/40 font-bold max-w-sm mx-auto">Failure to comply results in withholding of payouts and forfeiture of incentives.</p>
                        </section>

                        {/* 17. Termination */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <Power className="text-red-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">17. Termination Rights</h2>
                            </div>
                            <p className="text-sm text-indigo-100/70">The Company may suspend or terminate accounts without notice for violations. Payouts may be withheld during investigations.</p>
                        </section>

                        {/* 18. Governing Law */}
                        <section className="space-y-4 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-4 mb-2">
                                <Gavel className="text-indigo-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">18. Governing Law</h2>
                            </div>
                            <p className="text-indigo-100/70 text-sm">Agreement governed by Laws of India. Disputes resolved via Arbitration in Hyderabad in English.</p>
                        </section>

                        {/* 19. Disclaimer */}
                        <section className="space-y-4 bg-white/2 p-8 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4 mb-2">
                                <FileWarning className="text-orange-400" size={24} />
                                <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">19. Disclaimer</h2>
                            </div>
                            <p className="text-xs text-indigo-100/60 leading-relaxed italic">Platform is provided “AS IS”. Company does not guarantee uninterrupted access, user demand, earnings, or ranking stability. Service Provider operates at their own risk.</p>
                        </section>

                        {/* 20. Acceptance */}
                        <section className="space-y-4 text-center mt-12 bg-white/5 p-12 rounded-[3rem] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Sparkles className="text-astro-yellow opacity-10" size={60} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 underline decoration-astro-yellow decoration-4 underline-offset-8">20. Acceptance</h2>
                            <p className="text-indigo-100/70 leading-relaxed font-bold italic max-w-2xl mx-auto">By registering as a Service Provider on Way2Astro.com, you confirm legal capacity to contract, accept independent contractor status, and agree to revenue share terms and platform rules.</p>
                        </section>

                        {/* Contact Info Footer */}
                        <div className="mt-16 pt-12 border-t border-white/10 flex flex-col items-center text-center space-y-8">
                            <div className="space-y-4 text-center">
                                <p className="text-astro-yellow font-black text-2xl m-0 tracking-tight">Way2Astro.com</p>
                                <p className="text-indigo-200/60 text-xs font-bold font-mono">Owned & Operated by Go Digital Media and Solutions</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-12">
                                <div className="flex items-center gap-3 text-indigo-100/70">
                                    <Mail size={18} className="text-astro-yellow" />
                                    <span className="font-bold text-sm tracking-tight">legal@way2astro.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-indigo-100/70">
                                    <MapPin size={18} className="text-astro-yellow" />
                                    <span className="font-bold text-sm tracking-tight">Hyderabad, India</span>
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
