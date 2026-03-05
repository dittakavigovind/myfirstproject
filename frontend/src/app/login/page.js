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
    const { user, login, register, sendOtp, verifyOtp, resendVerification, logout, setAuth, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    const [loginMethod, setLoginMethod] = useState('mobile'); // 'mobile' or 'email'
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [step, setStep] = useState(1); // 1 = Phone Input, 2 = OTP Input
    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [countryCode, setCountryCode] = useState('+91');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isProcessingGoogleAuth, setIsProcessingGoogleAuth] = useState(false);

    // 0. Hydration Guard
    useEffect(() => {
        setIsMounted(true);
        // If we have Google params, set processing immediately
        if (searchParams.get('googleAuth') === 'success') {
            setIsProcessingGoogleAuth(true);
        }
    }, [searchParams]);


    // 1. Process Google Auth Callback
    useEffect(() => {
        const googleAuthStatus = searchParams.get('googleAuth');
        const userDataStr = searchParams.get('userData');

        if (googleAuthStatus === 'success' && userDataStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataStr));
                setAuth(userData);

                // CRITICAL: We do NOT clear the URL yet. Wait for 'user' state to catch up.
            } catch (err) {
                console.error('Error parsing Google Auth data:', err);
                setError('Google authentication failed. Please try again.');
                setIsProcessingGoogleAuth(false);
            }
        } else if (googleAuthStatus === 'failed') {
            setError(searchParams.get('message') || 'Google authentication failed.');
            setIsProcessingGoogleAuth(false);
            // Cleanup failed params
            router.replace('/login/');
        }
    }, [searchParams, setAuth, router]);

    // 2. Separate Effect for URL Cleanup & Automatic Redirection
    useEffect(() => {
        if (!authLoading && user) {

            // Cleanup URL if needed using router.replace (not history.replaceState)
            // This ensures useSearchParams is updated
            if (searchParams.get('googleAuth') || searchParams.get('userData')) {
                router.replace('/login/');
                // We keep isProcessingGoogleAuth true until we actually leave the page
            }

            const dest = redirectPath || (user.role === 'astrologer' ? '/astrologer/dashboard' : user.role === 'admin' ? '/admin' : '/dashboard');

            const timer = setTimeout(() => {
                router.push(dest);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [user, authLoading, router, redirectPath, searchParams]);


    const countryCodes = [
        { code: '+91', country: 'India', digits: 10 },
        { code: '+1', country: 'USA', digits: 10 },
        { code: '+44', country: 'UK', digits: 10 },
        { code: '+971', country: 'UAE', digits: 9 },
        { code: '+65', country: 'Singapore', digits: 8 },
    ];

    // Reset phone number when country code changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, phone: '' }));
    }, [countryCode]);


    const handleSendOtp = async (e) => {
        e.preventDefault();
        const currentCountry = countryCodes.find(c => c.code === countryCode);
        const requiredDigits = currentCountry?.digits || 10;

        if (formData.phone.length !== requiredDigits) {
            setError(`Please enter a valid ${requiredDigits}-digit mobile number`);
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

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        if (authMode === 'login') {
            const res = await login(formData.email, formData.password, redirectPath);
            setLoading(false);
            if (!res.success) {
                if (res.emailNotVerified) {
                    setError('Email not verified. Please verify your email to login.');
                    setShowResend(true);
                } else {
                    setError(res.message);
                }
            }
        } else {
            if (formData.password !== formData.confirmPassword) {
                setLoading(false);
                setError('Passwords do not match');
                return;
            }
            const res = await register('', formData.email, formData.password, '');
            setLoading(false);
            if (res.success) {
                setSuccessMsg(res.message);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                setAuthMode('login'); // Switch back to login view after successful signup
            } else {
                setError(res.message);
            }
        }
    };


    const handleGoogleLogin = () => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        window.location.href = `${backendUrl}/auth/google`;
    };

    const handleResend = async () => {
        setResendLoading(true);
        const res = await resendVerification(formData.email);
        setResendLoading(false);
        if (res.success) {
            setError('Verification email resent! Please check your inbox.');
            setShowResend(false);
        } else {
            setError(res.message);
        }
    };

    // 4. Render Guards

    // If not mounted, don't render to avoid hydration mismatch
    if (!isMounted) return null;

    // Highest priority: If processing Google auth params, show a clean loader
    if (isProcessingGoogleAuth) {
        return <CosmicLoader message="Synchronizing Celestial Data..." />;
    }

    // If auth state is still loading from localStorage, show loader to prevent flicker
    if (authLoading) {
        return <CosmicLoader message="Connecting..." />;
    }

    // If user is already logged in, show a friendly redirection screen or a "Logout Instead" option
    if (user && !searchParams.get('userData')) {
        return (
            <div className="min-h-screen bg-[#0b1c3d] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 bg-astro-yellow rounded-full mx-auto flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <span className="text-3xl font-black text-astro-navy">{user.name?.charAt(0)}</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">Welcome Back, {user.name?.split(' ')[0]}!</h2>
                            <p className="text-slate-400 text-sm">You are currently logged in to Way2Astro.</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    const dest = redirectPath || (user.role === 'astrologer' ? '/astrologer/dashboard' : user.role === 'admin' ? '/admin' : '/dashboard');
                                    router.push(dest);
                                }}
                                className="w-full bg-astro-yellow hover:bg-yellow-400 text-astro-navy font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={logout}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl border border-white/10 transition-all text-sm"
                            >
                                Logout and use another account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                    {successMsg && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-3 py-2 rounded-r-lg text-xs font-bold flex flex-col gap-2 shadow-sm mb-4">
                            <div className="flex items-center">
                                <span className="mr-2">✔️</span> {successMsg}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-3 py-2 rounded-r-lg text-xs font-bold flex flex-col gap-2 shadow-sm mb-4">
                            <div className="flex items-center">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                            {showResend && (
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    className="text-indigo-600 hover:underline text-left text-[10px] font-black uppercase mt-1"
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* TOP PRIORITY: Google Login */}
                    <div className="space-y-4 mb-6">
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3.5 rounded-2xl text-sm font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all shadow-sm active:scale-[0.98]"
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

                    {/* Login Method Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                        <button
                            onClick={() => { setLoginMethod('mobile'); setError(''); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Smartphone size={14} /> WhatsApp
                        </button>
                        <button
                            onClick={() => { setLoginMethod('email'); setError(''); }}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Mail size={14} /> Email
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {loginMethod === 'mobile' ? (
                            <motion.div
                                key="mobile-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
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
                                                    placeholder="Enter mobile number"
                                                    value={formData.phone}
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-r-xl py-2.5 px-4 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 focus:outline-none transition-all placeholder:font-normal text-sm"
                                                    onChange={(e) => {
                                                        const currentCountry = countryCodes.find(c => c.code === countryCode);
                                                        const digits = currentCountry?.digits || 10;
                                                        setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, digits) });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="py-2 px-1 text-center">
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                By continuing, you agree to our <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms</Link> and <Link href="/privacy-policy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || formData.phone.length !== (countryCodes.find(c => c.code === countryCode)?.digits || 10)}
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

                                        <div className="py-2 px-1 text-center">
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                                By continuing, you agree to our <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms</Link> and <Link href="/privacy-policy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
                                            </p>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || formData.otp.length < 6}
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
                        ) : (
                            <motion.div
                                key="email-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-lg font-black text-slate-900">
                                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {authMode === 'login' ? 'Welcome back to your cosmic journey' : 'Start your celestial path with us'}
                                    </p>
                                </div>

                                <form onSubmit={handleEmailAuth} className="space-y-3">


                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                <Mail size={16} />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                placeholder="you@example.com"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:font-normal text-sm"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="Enter password"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl py-2.5 pl-10 pr-12 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:font-normal text-sm"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {authMode === 'signup' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                                    <Lock size={16} />
                                                </div>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    placeholder="Confirm password"
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl py-2.5 pl-10 pr-12 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:font-normal text-sm"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="py-2 px-1 text-center">
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                            By continuing, you agree to our <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms</Link> and <Link href="/privacy-policy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !formData.email || !formData.password || (authMode === 'signup' && formData.password !== formData.confirmPassword)}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transform transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>{authMode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center pt-2">
                                    <button
                                        onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); }}
                                        className="text-xs font-bold text-indigo-600 hover:underline"
                                    >
                                        {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                    </button>
                                </div>

                            </motion.div>
                        )}
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
