"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Smartphone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function SignupPage() {
    const { register, user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        const res = await register(formData.name, formData.email, formData.password, formData.mobileNumber);
        setLoading(false);

        if (res.success) {
            setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
            setFormData({ name: '', email: '', mobileNumber: '', password: '', confirmPassword: '' });
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#1e1b4b] flex items-center justify-center p-6 relative overflow-hidden">
            {/* background effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-astro-yellow/10 blur-[100px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2">Create Account</h2>
                    <p className="text-slate-300 text-sm">Join Way2Astro and start your cosmic journey</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/20 border border-green-500/50 text-green-200 p-4 rounded-xl text-sm font-bold mb-6">
                        {success}
                    </motion.div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-astro-yellow w-4 h-4 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-astro-yellow focus:ring-4 focus:ring-astro-yellow/10 transition-all placeholder:text-slate-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-astro-yellow w-4 h-4 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-astro-yellow focus:ring-4 focus:ring-astro-yellow/10 transition-all placeholder:text-slate-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-astro-yellow w-4 h-4 transition-colors" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Enter mobile number"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-astro-yellow focus:ring-4 focus:ring-astro-yellow/10 transition-all placeholder:text-slate-500"
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-astro-yellow w-4 h-4 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-astro-yellow focus:ring-4 focus:ring-astro-yellow/10 transition-all placeholder:text-slate-500"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-astro-yellow w-4 h-4 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-astro-yellow focus:ring-4 focus:ring-astro-yellow/10 transition-all placeholder:text-slate-500"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-1 py-1">
                            <input type="checkbox" id="show-pass" className="w-4 h-4 rounded border-white/10 bg-white/5 text-astro-yellow focus:ring-astro-yellow/30" onChange={() => setShowPassword(!showPassword)} />
                            <label htmlFor="show-pass" className="text-xs text-slate-400 cursor-pointer">Show Password</label>
                        </div>

                        <div className="py-2 px-1 text-center">
                            <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                                By continuing, you agree to our <Link href="/terms" className="text-astro-yellow font-bold hover:underline">Terms</Link> and <Link href="/privacy-policy" className="text-astro-yellow font-bold hover:underline">Privacy Policy</Link>.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-astro-yellow hover:bg-yellow-400 text-astro-navy font-black py-4 rounded-2xl shadow-xl shadow-yellow-500/10 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-astro-navy/30 border-t-astro-navy rounded-full animate-spin"></span>
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                )}

                <div className="text-center mt-8">
                    <p className="text-slate-400 text-xs">
                        Already have an account?
                        <Link href="/login" className="text-astro-yellow font-bold hover:underline ml-1">Log In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
