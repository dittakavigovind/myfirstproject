"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
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
                await login(response.data.token, response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-between px-6 py-8 relative overflow-hidden bg-[#050716] select-none">
            {/* iOS Dynamic Ambient Nebula Background */}
            <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/25 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-[110px]" />

            {/* Subtle Starfield Grid Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            {/* Top Bar / Safe Area Spacer */}
            <div className="relative z-10 pt-safe flex items-center justify-between text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Vedic Sanctuary
                </span>
                <span className="text-[11px] font-medium tracking-wider text-slate-400">Way2Astro</span>
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-sm mx-auto my-auto"
            >
                {/* Brand Identity / Emblem */}
                <div className="text-center mb-8">
                    <div className="relative inline-flex items-center justify-center mb-5">
                        {/* Outer Glow Halo */}
                        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-amber-500/50 via-rose-500/30 to-amber-300/40 blur-xl opacity-75 animate-pulse" />
                        
                        {/* Squircle App Icon Badge */}
                        <div className="relative w-20 h-20 rounded-[26px] bg-gradient-to-b from-white/20 to-white/5 p-[1.5px] shadow-[0_12px_36px_rgba(249,115,22,0.35)] backdrop-blur-xl">
                            <img
                                src="/icons/app-icon.webp"
                                alt="Way2Astro"
                                width={80}
                                height={80}
                                className="w-full h-full rounded-[24px] object-cover"
                                loading="eager"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        Way2Astro
                    </h1>
                    <p className="text-xs uppercase tracking-[0.25em] text-violet-300/80 font-semibold mt-1.5">
                        Your Personal Cosmic Guide
                    </p>
                </div>

                {/* Ultra-Modern Frosted Glass Card */}
                <div className="relative rounded-[28px] p-6 sm:p-7 backdrop-blur-2xl bg-white/[0.05] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                    {/* Top Specular Rim Light */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium text-center backdrop-blur-md"
                        >
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                onSubmit={handleSendOtp}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Mobile Number
                                    </label>
                                    
                                    {/* Glass Input Group */}
                                    <div className="flex items-center rounded-2xl bg-black/25 border border-white/10 focus-within:border-violet-400/60 focus-within:ring-4 focus-within:ring-violet-500/20 transition-all p-1">
                                        {/* Country Code Picker */}
                                        <div className="relative shrink-0" ref={dropdownRef}>
                                            <button 
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-sm transition-all"
                                            >
                                                <img 
                                                    src={`https://flagcdn.com/w20/${currentCountry.iso}.png`} 
                                                    alt="flag" 
                                                    className="w-4 h-3 object-cover rounded-xs" 
                                                />
                                                <span className="text-xs">{countryCode}</span>
                                                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="text-white/60">
                                                    <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            
                                            <AnimatePresence>
                                                {showCountryDropdown && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                                        className="absolute top-full left-0 mt-2 w-36 max-h-52 overflow-y-auto bg-[#0d122e] border border-white/15 rounded-2xl shadow-2xl z-50 py-1.5 backdrop-blur-xl"
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
                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-white/[0.08] transition-colors"
                                                            >
                                                                <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.iso} className="w-4 h-3 object-cover rounded-xs" />
                                                                <span className="text-xs font-semibold text-white">{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Input */}
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, currentCountry.maxLength);
                                                setPhone(val);
                                            }}
                                            placeholder="WhatsApp number"
                                            className="w-full bg-transparent px-3 py-2.5 text-white font-medium text-base placeholder:text-slate-500 placeholder:text-sm focus:outline-none"
                                            disabled={loading}
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400/90 mt-2 text-center flex items-center justify-center gap-1.5">
                                        <ShieldCheck size={13} className="text-violet-400" />
                                        Instant OTP via WhatsApp
                                    </p>
                                </div>

                                {/* iOS Gradient Action Button */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || phone.length < currentCountry.minLength || phone.length > currentCountry.maxLength}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-bold text-sm tracking-wide shadow-[0_8px_25px_rgba(124,58,237,0.45)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin text-white" />
                                    ) : (
                                        <>
                                            Continue <ArrowRight size={16} />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-5"
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                            Verification Code
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)} 
                                            className="text-xs text-violet-400 font-semibold hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                    
                                    <div className="relative rounded-2xl bg-black/25 border border-white/10 focus-within:border-amber-400/60 focus-within:ring-4 focus-within:ring-amber-500/20 transition-all p-1 flex items-center">
                                        <div className="pl-3 pr-2 text-amber-400">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOtp(val);
                                            }}
                                            placeholder="• • • • • •"
                                            className="w-full bg-transparent py-2.5 text-white tracking-[0.3em] font-extrabold text-xl placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-500 placeholder:text-sm focus:outline-none"
                                            disabled={loading}
                                            maxLength={6}
                                            inputMode="numeric"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400/90 mt-2 text-center">
                                        Sent to <span className="text-white font-medium">{countryCode} {phone}</span>
                                    </p>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || otp.length < 4}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-bold text-sm tracking-wide shadow-[0_8px_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin text-white" /> : "Verify & Enter"}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Bottom Safe Area / Legal Links */}
            <div className="relative z-10 pb-safe text-center">
                <p className="text-[11px] text-slate-400/80 leading-relaxed font-medium">
                    By signing in, you agree to our{" "}
                    <button type="button" onClick={() => setShowTerms(true)} className="text-violet-300 font-semibold underline decoration-violet-500/40 underline-offset-2">
                        Terms
                    </button>{" "}
                    and{" "}
                    <button type="button" onClick={() => setShowPrivacy(true)} className="text-violet-300 font-semibold underline decoration-violet-500/40 underline-offset-2">
                        Privacy Policy
                    </button>
                </p>
            </div>

            {/* Legal Modals */}
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
            <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </div>
    );
}
