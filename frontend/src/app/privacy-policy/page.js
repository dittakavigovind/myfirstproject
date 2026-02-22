"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, ChevronRight, Globe, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
                <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                            <Shield className="w-3 h-3 text-astro-yellow" />
                            <span className="text-indigo-100 text-[10px] font-black tracking-[0.2em] uppercase">Security & Trust</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-orange-300 to-amber-200">Policy</span>
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
                                <h2 className="text-2xl font-black text-white m-0">1. Introduction</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                Way2Astro.com (“we”, “our”, “us”, or “Website”) is owned and operated by Go Digital Media and Solutions. We are committed to protecting the privacy of all users including visitors, registered users, customers, and astrologers who use our platform.
                            </p>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                This Privacy Policy explains how we collect, use, process, store, and safeguard your personal information when you access or use Way2Astro.com.
                            </p>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                By using this Website, you agree to the terms of this Privacy Policy.
                            </p>
                        </section>

                        {/* 2. Legal Compliance */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Shield className="text-emerald-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">2. Legal Compliance</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">This Privacy Policy is published in accordance with:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
                                {[
                                    'The Information Technology Act, 2000',
                                    'The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011',
                                    'The Digital Personal Data Protection Act, 2023',
                                    'The Consumer Protection Act, 2019',
                                    'Other applicable Indian laws'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 bg-white/2 pb-0 p-3 rounded-xl border border-white/5 text-[10px] font-bold text-indigo-100/80">
                                        <ChevronRight size={14} className="text-astro-yellow shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">
                                We follow industry-standard security practices to ensure safe handling of personal and sensitive data.
                            </p>
                        </section>

                        {/* 3. User Consent */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">3. User Consent</h2>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">By accessing and using Way2Astro.com, you:</p>
                            <ul className="space-y-2 list-none p-0">
                                {[
                                    'Confirm that you have read and understood this Privacy Policy.',
                                    'Provide consent for collection, storage, processing, and disclosure of your personal data as described herein.',
                                    'Agree that continued use of the Website constitutes acceptance of updates to this Policy.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 bg-white/2 p-4 rounded-xl border border-white/5 text-sm font-medium text-indigo-100/70">
                                        <div className="w-1.5 h-1.5 rounded-full bg-astro-yellow mt-2 shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/70 leading-relaxed font-medium italic">If you do not agree with this Privacy Policy, please discontinue use of the Website immediately.</p>
                        </section>

                        {/* 4. Information We Collect */}
                        <section className="space-y-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Lock className="text-indigo-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">4. Information We Collect</h2>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-astro-yellow uppercase tracking-widest">A. Personal Information</h3>
                                <p className="text-indigo-100/70 leading-relaxed">We may collect the following personal information:</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                                    {[
                                        'Full Name',
                                        'Phone Number (for OTP verification and account security)',
                                        'Email Address',
                                        'Date of Birth and Birth Details (for Kundli and horoscope generation)',
                                        'Gender',
                                        'Location',
                                        'Profile Photograph (if uploaded)',
                                        'Payment details (processed securely through third-party payment gateways)',
                                        'IP Address and device information'
                                    ].map((item, i) => (
                                        <li key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-bold text-indigo-100/80 flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-indigo-100/70 leading-relaxed font-medium p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    Your phone number is used only for verification and communication through our secure platform. It is never directly shared with astrologers. Calls are routed via our intermediary system to protect your privacy.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-astro-yellow uppercase tracking-widest">B. Non-Personal Information</h3>
                                <p className="text-indigo-100/70 leading-relaxed">We may also collect:</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                                    {[
                                        'Browser type',
                                        'Device identifiers',
                                        'IP address',
                                        'Internet service provider details',
                                        'Referring and exit URLs',
                                        'Pages visited and session duration',
                                        'Cookies and analytics data'
                                    ].map((item, i) => (
                                        <li key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-bold text-indigo-100/80 flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-indigo-100/60 text-xs leading-relaxed">This information is used to improve website performance, enhance user experience, and ensure security.</p>
                            </div>
                        </section>

                        {/* 5. Purpose */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white m-0">5. Purpose of Data Collection</h2>
                            <p className="text-indigo-100/70 leading-relaxed">We collect your information to:</p>
                            <ul className="space-y-3 list-none p-0">
                                {[
                                    'Create and manage your user account',
                                    'Generate personalized astrology reports such as Kundli, horoscope, and divisional charts',
                                    'Facilitate consultations between users and astrologers',
                                    'Process payments securely',
                                    'Improve website functionality and user experience',
                                    'Prevent fraud and misuse',
                                    'Comply with legal and regulatory obligations'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-indigo-100/70">
                                        <ChevronRight size={14} className="text-astro-yellow" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/60 text-sm leading-relaxed">Providing optional information such as date of birth is voluntary unless required for specific services.</p>
                        </section>

                        {/* 6. Profile Deletion */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">6. Profile Deletion and Data Retention</h2>
                            <p className="text-indigo-100/70 leading-relaxed">Users may delete their account from the Account Settings section of the Website.</p>
                            <p className="text-indigo-100/70 leading-relaxed">Upon deletion request:</p>
                            <ul className="space-y-2 list-none p-0 pl-4">
                                <li className="text-sm text-indigo-100/70">• Personal data will be removed within a reasonable timeframe.</li>
                                <li className="text-sm text-indigo-100/70">• Certain records may be retained where required under applicable law.</li>
                            </ul>
                            <p className="text-indigo-100/70 leading-relaxed">We retain personal data only for as long as necessary to fulfill legitimate business purposes or legal obligations.</p>
                        </section>

                        {/* 7. Consent Management */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">7. Consent Management and User Rights</h2>
                            <p className="text-indigo-100/70 leading-relaxed font-medium">Users have the right to:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                                {[
                                    'Access their personal data',
                                    'Request correction of inaccurate data',
                                    'Request deletion of personal data',
                                    'Withdraw consent for data processing'
                                ].map((item, i) => (
                                    <li key={i} className="bg-white/2 p-4 rounded-xl border border-white/5 text-sm font-medium text-indigo-100/70 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-astro-yellow shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                <p className="text-indigo-100/80 text-sm font-bold m-0">To exercise these rights, contact:</p>
                                <p className="text-astro-yellow font-black text-sm m-0 mt-1">Email: support@way2astro.com</p>
                                <p className="text-indigo-100/60 text-xs mt-4">We will respond within a reasonable and lawful timeframe.</p>
                            </div>
                        </section>

                        {/* 8. Voice and Video */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">8. Voice and Video Interaction</h2>
                            <p className="text-indigo-100/70 leading-relaxed">Way2Astro may provide audio or video interaction features.</p>
                            <p className="text-indigo-100/70 leading-relaxed">When you grant microphone permission, we may record audio for consultation purposes. Such recordings are stored securely and may be deleted after a reasonable period unless required by law.</p>
                            <p className="text-indigo-100/70 leading-relaxed">Way2Astro is not responsible for any personal information voluntarily shared by users directly with astrologers during chat, audio, or video sessions.</p>
                            <p className="text-indigo-100/70 leading-relaxed italic">Users are advised not to share highly sensitive personal information unless necessary.</p>
                        </section>

                        {/* 9. Cookies */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">9. Cookies and Tracking Technologies</h2>
                            <p className="text-indigo-100/70 leading-relaxed">We use cookies and similar technologies to:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                                {[
                                    'Remember login sessions',
                                    'Personalize content',
                                    'Improve website performance',
                                    'Analyze traffic patterns',
                                    'Display relevant advertisements'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-indigo-100/70">
                                        <ChevronRight size={14} className="text-astro-yellow shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/60 text-xs leading-relaxed italic">You may disable cookies in your browser settings; however, some features of the Website may not function properly.</p>
                        </section>

                        {/* 10. Third-Party Services */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">10. Third-Party Services</h2>
                            <p className="text-indigo-100/70 leading-relaxed">We may use third-party service providers for:</p>
                            <ul className="grid grid-cols-2 gap-3 list-none p-0 mb-6">
                                {['Payment processing', 'Cloud hosting', 'Analytics services', 'SMS/OTP verification'].map((item, i) => (
                                    <li key={i} className="bg-white/2 p-3 rounded-lg border border-white/5 text-xs font-bold text-indigo-100/70 text-center">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/70 leading-relaxed">We are not responsible for the privacy practices of third-party websites linked from our platform. Users are encouraged to review their respective privacy policies.</p>
                            <p className="text-emerald-400 font-bold text-sm">Mobile information and SMS opt-in data are not shared with third parties for marketing purposes.</p>
                        </section>

                        {/* 11. Security Measures */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Lock className="text-emerald-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0">11. Security Measures</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed">We implement appropriate technical and organizational measures including:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                                {[
                                    'SSL encryption',
                                    'Secure servers',
                                    'Encrypted payment processing',
                                    'Firewalls and monitoring systems',
                                    'Restricted access controls'
                                ].map((item, i) => (
                                    <li key={i} className="bg-white/2 p-4 rounded-xl border border-white/5 flex items-center gap-3 text-sm font-medium text-indigo-100/70">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-indigo-100/60 text-xs leading-relaxed italic">While we strive to protect your data, no method of transmission over the Internet is completely secure. Users are responsible for safeguarding their login credentials.</p>
                        </section>

                        {/* 12. Disclaimer */}
                        <section className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                            <h2 className="text-2xl font-black text-white m-0 uppercase tracking-tighter">12. Disclaimer – Astrology Services</h2>
                            <p className="text-indigo-100/70 leading-relaxed">Way2Astro acts as a technology platform connecting users and astrologers.</p>
                            <ul className="space-y-3 list-none p-0">
                                {[
                                    'We do not guarantee accuracy, reliability, or outcomes of predictions.',
                                    'Astrology services are based on traditional knowledge and interpretations.',
                                    'No guaranteed results are promised.',
                                    'Users are advised to exercise discretion while selecting astrologers and interpreting advice.',
                                    'Way2Astro does not control or mandate the methods, qualifications, or advice of astrologers.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-indigo-100/70">
                                        <ChevronRight size={14} className="text-astro-yellow shrink-0 mt-1" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 13. Mental Health Disclaimer */}
                        <section className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10 space-y-4">
                            <h2 className="text-2xl font-black text-white m-0">13. Mental Health Disclaimer</h2>
                            <p className="text-indigo-100/70 leading-relaxed">Way2Astro does not provide medical or psychological treatment.</p>
                            <p className="text-red-300 font-bold leading-relaxed">Users experiencing severe emotional distress, suicidal thoughts, or mental health crises should seek immediate professional medical assistance.</p>
                            <p className="text-indigo-100/70 leading-relaxed">We may share information with law enforcement authorities if required by law.</p>
                        </section>

                        {/* 14. Children's Privacy */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">14. Children’s Privacy</h2>
                            <p className="text-indigo-100/70 leading-relaxed">Our services are intended for users aged 18 years and above.</p>
                            <p className="text-indigo-100/70 leading-relaxed">We do not knowingly collect personal data from children under 13 years of age. If such information is identified, it will be deleted immediately.</p>
                        </section>

                        {/* 15. Dispute Resolution */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-white">15. Dispute Resolution</h2>
                            <p className="text-indigo-100/70 leading-relaxed">This Privacy Policy shall be governed by the laws of India.</p>
                            <p className="text-indigo-100/70 leading-relaxed">Any disputes arising under this Policy shall be subject to the jurisdiction of courts located in [Insert City], India.</p>
                            <p className="text-indigo-100/70 leading-relaxed underline">Arbitration, if applicable, shall be conducted under the Arbitration and Conciliation Act, 1996.</p>
                        </section>

                        {/* 16. Grievance Officer */}
                        <section className="bg-white/2 p-8 rounded-3xl border border-white/10 space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <Mail className="text-astro-yellow" size={24} />
                                <h2 className="text-2xl font-black text-white m-0">16. Grievance Officer</h2>
                            </div>
                            <p className="text-indigo-100/70 leading-relaxed">In accordance with the Information Technology Act, 2000:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Company</p>
                                    <p className="text-white font-bold">Go Digital Media and Solutions</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Website</p>
                                    <p className="text-white font-bold">Way2Astro.com</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email</p>
                                    <p className="text-astro-yellow font-black">support@way2astro.com</p>
                                </div>
                            </div>
                            <p className="text-indigo-100/60 text-xs italic pt-4 border-t border-white/5">The Grievance Officer will respond to complaints within 7–15 working days.</p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
