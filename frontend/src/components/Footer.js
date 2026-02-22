"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0a0a0f] text-white pt-12 pb-8 border-t border-white/5 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4 items-start">
                        <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10 px-1">
                            <Link href="/" className="text-white hover:text-astro-yellow transition-colors font-black text-lg">Way2Astro</Link> — India's most trusted premium astrology platform. We bring ancient Vedic wisdom to your fingertips with modern technology and precision.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 transition-colors cursor-pointer group">
                                <ShieldCheck size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 transition-colors cursor-pointer group">
                                <Sparkles size={20} className="text-astro-yellow group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Calculators</h4>
                        <ul className="space-y-3">
                            <li><Link href="/kundli" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Free Kundli</Link></li>
                            <li><Link href="/today-panchang" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Daily Panchang</Link></li>
                            <li><Link href="/horoscope" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Horoscope</Link></li>
                            <li><Link href="/divisional-charts" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Divisional Charts</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Company</h4>
                        <ul className="space-y-3">
                            <li><Link href="/blog" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Astrology Blog</Link></li>
                            <li><Link href="/about" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">About Us</Link></li>
                            <li><Link href="/privacy-policy" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Terms of Service</Link></li>
                            <li><Link href="/astrologer-terms" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Astrologer Terms</Link></li>
                            <li><Link href="/disclaimer" className="text-slate-400 hover:text-astro-yellow transition-colors text-sm font-bold">Disclaimer</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                <Mail size={16} className="text-indigo-400" />
                                support@way2astro.com
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                <Phone size={16} className="text-indigo-400" />
                                +91 000 000 0000
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm font-medium leading-loose">
                                <MapPin size={16} className="text-indigo-400 shrink-0" />
                                Hyderabad, India
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer Section */}
                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-emerald-400 w-5 h-5" />
                            <h5 className="text-sm font-black uppercase tracking-widest text-white">Astrological Disclaimer</h5>
                        </div>
                        <p className="text-slate-400 text-xs md:text-sm leading-loose font-medium text-justify">
                            Astrology is an ancient science that provides guidance based on planetary positions. The interpretations and insights provided by
                            Way2Astro are meant for informative purposes only and should not be used as a substitute for professional legal, medical, or
                            financial advice. While we strive for 100% accuracy in our calculations using standard Vedic principles, the results depend
                            on the accuracy of birth details provided. Way2Astro does not guarantee any specific outcomes and shall not be held
                            responsible for any decisions made based on its reports.
                        </p>
                    </div>

                    {/* Powered By Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Powered by</span>
                                <span className="text-sm font-black text-white px-2 py-0.5 rounded border border-white/20 bg-white/5">Swiss Ephemeris</span>
                            </div>
                            <div className="h-4 w-px bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Source</span>
                                <span className="text-sm font-black text-white px-2 py-0.5 rounded border border-white/20 bg-white/5">NASA JPL</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <span>100% Secure & Private Consultations</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} <Link href="/" className="hover:text-white transition-colors">Way2Astro</Link>. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
