"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { TermsModal, PrivacyModal } from "./LegalModals";

export default function AuthPage() {
    const [step, setStep] = useState(1);
    const [countryIso, setCountryIso] = useState("in");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const countryCodes = [
        { code: '+91', iso: 'in', minLength: 10, maxLength: 10 },
        { code: '+1', iso: 'us', minLength: 10, maxLength: 10 },
        { code: '+1', iso: 'ca', minLength: 10, maxLength: 10 },
        { code: '+44', iso: 'gb', minLength: 10, maxLength: 10 },
        { code: '+81', iso: 'jp', minLength: 10, maxLength: 10 },
        { code: '+61', iso: 'au', minLength: 9, maxLength: 9 },
        { code: '+60', iso: 'my', minLength: 9, maxLength: 10 },
        { code: '+971', iso: 'ae', minLength: 9, maxLength: 9 },
        { code: '+65', iso: 'sg', minLength: 8, maxLength: 8 },
    ];

    const currentCountry = countryCodes.find(c => c.iso === countryIso) || countryCodes[0];
    const countryCode = currentCountry.code;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (phone.length < currentCountry.minLength || phone.length > currentCountry.maxLength) {
            const digitStr = currentCountry.minLength === currentCountry.maxLength 
                ? currentCountry.minLength 
                : `${currentCountry.minLength}-${currentCountry.maxLength}`;
            setError(`Please enter a valid ${digitStr}-digit mobile number`);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formattedPhone = countryCode + phone;
            await api.post("/auth/send-whatsapp-otp", { mobile_number: formattedPhone });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length < 4) {
            setError("Please enter a valid OTP");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formattedPhone = countryCode + phone;
            const response = await api.post("/auth/verify-whatsapp-otp", {
                mobile_number: formattedPhone,
                otp
            });

            if (response.data.success) {
                // Log the user in via context
                await login(response.data.token, response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center px-6 relative overflow-hidden bg-cosmic-indigo">
            {/* Ambient background glow */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-electric-violet/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-solar-gold/10 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm mx-auto"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-violet to-solar-gold p-0.5 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                        <div className="w-full h-full bg-cosmic-indigo rounded-2xl flex items-center justify-center">
                            <Sparkles size={32} className="text-solar-gold" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Way2Astro</h1>
                    <p className="text-slate-400 font-medium tracking-wide">Enter the Cosmic Realm</p>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    {error && (
                        <div className="absolute top-0 left-0 right-0 bg-red-500/20 text-red-200 text-xs font-bold text-center py-2 backdrop-blur-md z-20">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendOtp}
                                className="space-y-5 mt-2"
                            >
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">SignUp/Login</label>
                                    <div className="flex group relative items-center">
                                        <div className="relative flex-shrink-0" ref={dropdownRef}>
                                            <button 
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="flex items-center justify-between pl-4 pr-3 border border-r-0 border-white/10 rounded-l-xl bg-white/5 text-white font-bold text-sm focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/50 h-[52px] transition-all min-w-[95px]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img 
                                                        src={`https://flagcdn.com/w20/${currentCountry.iso}.png`} 
                                                        alt="flag" 
                                                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm" 
                                                    />
                                                    <span className="text-left leading-none">{countryCode}</span>
                                                </div>
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-white/50 shrink-0 ml-2" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                            
                                            <AnimatePresence>
                                                {showCountryDropdown && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        className="absolute top-full left-0 mt-1 w-[120px] max-h-[200px] overflow-y-auto bg-cosmic-indigo border border-white/10 rounded-xl shadow-2xl z-50 py-1"
                                                    >
                                                        {countryCodes.map(c => (
                                                            <button
                                                                key={`${c.iso}-${c.code}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setCountryIso(c.iso);
                                                                    setPhone("");
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 text-left transition-colors"
                                                            >
                                                                <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.iso} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                                                <span className="text-sm font-bold text-white">{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, currentCountry.maxLength);
                                                setPhone(val);
                                            }}
                                            placeholder={`Enter WhatsApp number`}
                                            className="w-full bg-white/5 border border-white/10 rounded-r-xl px-4 text-white placeholder:text-slate-500 placeholder:text-[13px] focus:outline-none focus:ring-2 focus:ring-electric-violet/50 transition-all font-medium h-[52px]"
                                            disabled={loading}
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-center">We'll send an OTP via WhatsApp</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || phone.length < currentCountry.minLength || phone.length > currentCountry.maxLength}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-violet to-indigo-600 text-white font-bold tracking-wide shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                        <>
                                            Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-5 text-center px-4">
                                    <p className="text-[11px] text-slate-400/80 leading-relaxed font-medium">
                                        By continuing, you agree to our{" "}
                                        <button type="button" onClick={() => setShowTerms(true)} className="text-electric-violet/90 font-bold hover:underline transition-all">
                                            Terms
                                        </button>{" "}
                                        and{" "}
                                        <button type="button" onClick={() => setShowPrivacy(true)} className="text-electric-violet/90 font-bold hover:underline transition-all">
                                            Privacy Policy
                                        </button>.
                                    </p>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-5 mt-2"
                            >
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Code</label>
                                        <button type="button" onClick={() => setStep(1)} className="text-xs text-electric-violet font-semibold">Change Number</button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-solar-gold" />
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOtp(val);
                                            }}
                                            placeholder="Enter OTP"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white tracking-[0.2em] font-bold text-lg placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-solar-gold/50 transition-all"
                                            disabled={loading}
                                            maxLength={6}
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-center">OTP sent to {countryCode} {phone}</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-violet to-indigo-600 text-white font-bold tracking-wide shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Enter"}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Legal Modals */}
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
            <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </div>
    );
}
