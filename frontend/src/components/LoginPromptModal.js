"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ArrowRight, Timer, X } from 'lucide-react';
import CosmicLoader from './CosmicLoader';

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

export default function LoginPromptModal() {
    const { user, sendOtp, verifyOtp, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const showLoginPrompt = searchParams.get('loginPrompt') === 'true';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ phone: '', otp: '' });
    const [countryIso, setCountryIso] = useState('in');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    useEffect(() => {
        setFormData(prev => ({ ...prev, phone: '' }));
    }, [countryIso]);

    // Close modal when user logs in
    useEffect(() => {
        if (user && showLoginPrompt) {
            closeModal();
        }
    }, [user, showLoginPrompt]);

    const closeModal = () => {
        // Remove loginPrompt from URL without triggering a full page reload
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('loginPrompt');
        const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
        router.replace(newUrl, { scroll: false });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (formData.phone.length < currentCountry.minLength || formData.phone.length > currentCountry.maxLength) {
            const digitStr = currentCountry.minLength === currentCountry.maxLength 
                ? currentCountry.minLength 
                : `${currentCountry.minLength}-${currentCountry.maxLength}`;
            setError(`Please enter a valid ${digitStr}-digit mobile number`);
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
        const res = await verifyOtp(fullPhone, formData.otp, pathname);
        setLoading(false);
        if (!res.success) setError(res.message);
        else closeModal();
    };

    const handleGoogleLogin = () => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        window.location.href = `${backendUrl}/auth/google`;
    };

    if (!isMounted || !showLoginPrompt || user || authLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1c3d]/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/15 border border-white/50 w-full max-w-[380px] relative overflow-hidden"
            >
                <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors z-20"
                >
                    <X size={18} />
                </button>
                
                <div className="bg-[#1e1b4b] pt-8 pb-10 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black rounded-b-[2rem] z-0"></div>
                    <div className="relative z-10">
                        <span className="inline-block py-0.5 px-3 rounded-full bg-white/10 border border-white/10 text-astro-yellow text-[10px] font-bold tracking-[0.15em] uppercase mb-2">
                            ✨ Welcome Back
                        </span>
                        <h2 className="text-2xl font-black text-white leading-tight">
                            Login to <span className="text-transparent bg-clip-text bg-gradient-to-r from-astro-yellow via-amber-200 to-orange-300">Way2Astro</span>
                        </h2>
                    </div>
                </div>

                <div className="p-5 -mt-6 relative z-20 bg-white rounded-t-[1.5rem]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-3 py-2 rounded-r-lg text-xs font-bold flex items-center gap-2 mb-4">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="space-y-3 mb-4">
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                <span className="bg-white px-3">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">WhatsApp Number</label>
                                    <div className="flex group relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-20 group-focus-within:text-green-600 transition-colors pointer-events-none">
                                            <Smartphone className="w-4 h-4" />
                                        </div>
                                        <div className="relative" ref={dropdownRef}>
                                            <button 
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="flex items-center justify-between pl-9 pr-2 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-700 font-bold text-sm focus:outline-none h-[40px] transition-all hover:bg-slate-100 min-w-[85px] w-full"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <img src={`https://flagcdn.com/w20/${currentCountry.iso}.png`} alt="flag" className="w-4 h-3 object-cover rounded-sm shadow-sm" />
                                                    <span className="text-left leading-none">{countryCode}</span>
                                                </div>
                                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-slate-400 shrink-0 ml-1" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                            
                                            <AnimatePresence>
                                                {showCountryDropdown && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                                        className="absolute top-full left-0 mt-1 w-[120px] max-h-[200px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1"
                                                    >
                                                        {countryCodes.map(c => (
                                                            <button
                                                                key={`${c.iso}-${c.code}`} type="button"
                                                                onClick={() => { setCountryIso(c.iso); setShowCountryDropdown(false); }}
                                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                                                            >
                                                                <img src={`https://flagcdn.com/w20/${c.iso}.png`} alt={c.iso} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                                                                <span className="text-sm font-bold text-slate-700">{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <input
                                            type="tel" required placeholder="Enter mobile number" value={formData.phone}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-r-xl py-2 px-4 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:outline-none transition-all placeholder:font-normal text-sm"
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, currentCountry.maxLength) })}
                                        />
                                    </div>
                                </div>
                                <div className="py-2 px-1 text-center">
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        By continuing, you agree to our <Link href="/terms" className="text-indigo-600 font-bold hover:underline" onClick={closeModal}>Terms</Link> and <Link href="/privacy-policy" className="text-indigo-600 font-bold hover:underline" onClick={closeModal}>Privacy Policy</Link>.
                                    </p>
                                </div>
                                <button
                                    type="submit" disabled={loading || formData.phone.length < currentCountry.minLength || formData.phone.length > currentCountry.maxLength}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl shadow-lg shadow-green-500/20 transform transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>Get OTP <ArrowRight className="w-4 h-4" /></>}
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
                                        type="text" required maxLength="6" placeholder="000000" value={formData.otp} autoFocus
                                        className="w-full text-center text-3xl font-black tracking-[0.5em] px-4 py-3 border-b-2 border-slate-200 focus:border-astro-navy focus:outline-none bg-transparent transition-all placeholder:text-slate-200"
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>

                                <button
                                    type="submit" disabled={loading || formData.otp.length < 6}
                                    className="w-full bg-gradient-to-r from-astro-yellow to-orange-500 hover:from-orange-400 hover:to-orange-600 text-slate-900 text-sm font-black py-3 rounded-xl shadow-lg shadow-orange-500/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    {loading ? <span className="w-4 h-4 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin"></span> : <>Verify & Login <ArrowRight className="w-4 h-4" /></>}
                                </button>

                                <OtpTimer onResend={handleSendOtp} />
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
