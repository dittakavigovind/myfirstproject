"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Phone, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function AuthPage() {
    const [step, setStep] = useState(1);
    const [countryIso, setCountryIso] = useState("in");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
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
        { code: '+91', iso: 'in', digits: 10 },
        { code: '+1', iso: 'us', digits: 10 },
        { code: '+1', iso: 'ca', digits: 10 },
        { code: '+44', iso: 'gb', digits: 10 },
        { code: '+81', iso: 'jp', digits: 10 },
        { code: '+61', iso: 'au', digits: 9 },
        { code: '+60', iso: 'my', digits: 9 },
        { code: '+971', iso: 'ae', digits: 9 },
        { code: '+65', iso: 'sg', digits: 8 },
    ];

    const currentCountry = countryCodes.find(c => c.iso === countryIso) || countryCodes[0];
    const countryCode = currentCountry.code;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (phone.length < 10) {
            setError("Please enter a valid 10-digit phone number");
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
        <div className="min-h-screen flex flex-col justify-center px-6 relative overflow-hidden bg-cosmic-indigo">
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
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                                    <div className="flex group relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-electric-violet z-20 pointer-events-none">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="relative" ref={dropdownRef}>
                                            <button 
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="flex items-center justify-between pl-9 pr-2 border border-r-0 border-white/10 rounded-l-xl bg-white/5 text-white font-bold text-sm focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/50 h-[50px] transition-all min-w-[85px] w-full"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <img 
                                                        src={`https://flagcdn.com/w20/${currentCountry.iso}.png`} 
                                                        alt="flag" 
                                                        className="w-4 h-3 object-cover rounded-sm shadow-sm" 
                                                    />
                                                    <span className="text-left leading-none">{countryCode}</span>
                                                </div>
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-white/50 shrink-0 ml-1" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
                                                const digits = currentCountry.digits;
                                                const val = e.target.value.replace(/\D/g, '').slice(0, digits);
                                                setPhone(val);
                                            }}
                                            placeholder={`Enter mobile number`}
                                            className="w-full bg-white/5 border border-white/10 rounded-r-xl py-3.5 pl-4 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-electric-violet/50 transition-all font-medium"
                                            disabled={loading}
                                            inputMode="numeric"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-center">We'll send an OTP via WhatsApp</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-electric-violet to-indigo-600 text-white font-bold tracking-wide shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                        <>
                                            Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
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
        </div>
    );
}
