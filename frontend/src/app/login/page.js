"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Smartphone, Mail, ArrowRight, Eye, EyeOff, Sparkles, Star, Timer } from 'lucide-react';
import CosmicLoader from '../../components/CosmicLoader';

const OtpTimer = ({ onResend }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    return (
        <div className="text-center text-xs font-bold text-slate-500">
            {timeLeft > 0 ? (
                <span className="flex items-center justify-center gap-1 text-orange-500">
                    <Timer size={12} /> Resend OTP in {timeLeft}s
                </span>
            ) : (
                <button
                    type="button"
                    onClick={() => { setTimeLeft(30); onResend({ preventDefault: () => { } }); }}
                    className="text-indigo-600 hover:underline"
                >
                    Resend OTP
                </button>
            )}
        </div>
    );
};

export default function LoginPage() {
    const { user, login, sendOtp, verifyOtp } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    const [loginMethod, setLoginMethod] = useState('mobile');
    const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
    const [formData, setFormData] = useState({ phone: '', otp: '' });
    const [countryCode, setCountryCode] = useState('+91');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    useEffect(() => {
        if (user) {
            if (redirectPath) {
                router.push(redirectPath);
            } else if (user.role === 'astrologer') {
                router.push('/astrologer/dashboard');
            } else if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, router, redirectPath]);

    const countryCodes = [
        { code: '+91', country: 'India' },
        { code: '+1', country: 'USA' },
        { code: '+44', country: 'UK' },
        { code: '+971', country: 'UAE' },
        { code: '+65', country: 'Singapore' },
    ];


    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        setError('');
        const fullPhone = countryCode + formData.phone;
        const res = await sendOtp(fullPhone);
        setLoading(false);
        if (res.success) {
            setStep(2);
        } else {
            setError(res.message);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const fullPhone = countryCode + formData.phone;
        const res = await verifyOtp(fullPhone, formData.otp, redirectPath);
        setLoading(false);
        if (!res.success) setError(res.message);
    };

    return (
        // FIXED VIEWPORT CONTAINER: h-[calc(100vh-NavbarHeight)]
        // Using strict overflow-hidden to prevent ANY scrolling
        // Navbar is approx 76px-80px, adjusting to 80px safe area
        <div className="h-[calc(100vh-88px)] bg-slate-50 font-sans overflow-hidden flex flex-col relative">

            {/* 1. COMPACT HERO SECTION (Top ~35%) */}
            <div className="relative shrink-0 h-[35%] min-h-[180px] bg-[#1e1b4b]">
                {/* Background Gradient & Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black rounded-b-[2.5rem] md:rounded-b-[3rem] overflow-hidden z-0 shadow-xl">
                    <div className="absolute top-[-50%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-fuchsia-500/10 blur-[80px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                </div>

                {/* Hero Content (Centered & Compact) */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center pb-8 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-0.5 px-3 rounded-full bg-white/5 border border-white/10 text-astro-yellow text-[10px] font-bold tracking-[0.15em] uppercase mb-2 backdrop-blur-md shadow-lg">
                            ✨ Welcome Back
                        </span>
                        <h1 className="text-3xl font-black text-white mb-1 leading-tight tracking-tight">
                            Login to <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300">Way2Astro</span>
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* 2. FLOATING FORM CARD (Overlaps Hero) */}
            {/* -mt-16 pulls it up. flex-1 takes remaining height. justify-start ensures it starts near top of this section. */}
            <div className="flex-1 relative -mt-14 z-20 px-4 pb-2 flex items-start justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/15 border border-white/50 p-6 w-full max-w-[380px] backdrop-blur-sm"
                >

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-3 py-2 rounded-r-lg text-xs font-bold flex items-center shadow-sm mb-4">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key="mobile-form"
                            initial={{ opacity: 0, x: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {step === 1 ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">WhatsApp Number</label>
                                        <div className="flex group relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-green-600 transition-colors">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="pl-9 pr-2 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-700 font-bold text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 h-[44px] transition-all cursor-pointer hover:bg-slate-100"
                                            >
                                                {countryCodes.map(c => (
                                                    <option key={c.code} value={c.code}>{c.code}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="9999999999"
                                                maxLength="10"
                                                value={formData.phone}
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-r-xl py-2.5 px-4 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:outline-none transition-all placeholder:font-normal text-sm"
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 py-2 px-1">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms-step1"
                                                type="checkbox"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500 cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="terms-step1" className="text-[10px] text-slate-500 font-medium leading-relaxed cursor-pointer">
                                            I accept the <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link> of Way2Astro. I also agree to receiving updates on WhatsApp/email.
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || formData.phone.length !== 10 || !acceptedTerms}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transform transition-all active:scale-[0.98] mt-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>Get OTP <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="text-center bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                                        <p className="text-xs text-slate-600 font-medium">OTP sent to</p>
                                        <p className="text-sm font-black text-slate-900 mb-1">{countryCode} {formData.phone}</p>
                                        <button type="button" onClick={() => setStep(1)} className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">
                                            Change Number
                                        </button>
                                    </div>

                                    <div className="flex justify-center">
                                        <input
                                            type="text"
                                            required
                                            maxLength="6"
                                            placeholder="000000"
                                            value={formData.otp}
                                            autoFocus
                                            className="w-full text-center text-3xl font-black tracking-[0.5em] px-4 py-3 border-b-2 border-slate-200 focus:border-astro-navy focus:outline-none bg-transparent transition-all placeholder:text-slate-200"
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>

                                    <div className="flex items-start gap-3 py-2 px-1">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms-step2"
                                                type="checkbox"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="terms-step2" className="text-[10px] text-slate-500 font-medium leading-relaxed cursor-pointer">
                                            I accept the <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link> of Way2Astro. I also agree to receiving updates on WhatsApp/email.
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || formData.otp.length < 6 || !acceptedTerms}
                                        className="w-full bg-gradient-to-r from-astro-yellow to-orange-500 hover:from-orange-400 hover:to-orange-600 text-slate-900 text-sm font-black py-3 rounded-xl shadow-lg shadow-orange-500/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin"></span>
                                        ) : (
                                            <>Verify & Login <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>

                                    {/* OTP Timer & Resend */}
                                    <OtpTimer onResend={handleSendOtp} />
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>

                </motion.div>
            </div>

            {/* FULLSCREEN LOADER - SINGLE INSTANCE */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <CosmicLoader
                            size="md"
                            message={loginMethod === 'mobile' && step === 1 ? "Sending OTP..." : "Accessing Dashboard..."}
                            fullscreen={false}
                            transparent={true}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
