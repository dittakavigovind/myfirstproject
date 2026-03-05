"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyEmail } = useAuth();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const handleVerification = async () => {
            const res = await verifyEmail(token);
            if (res.success) {
                setStatus('success');
                setMessage(res.message);
            } else {
                setStatus('error');
                setMessage(res.message);
            }
        };

        handleVerification();
    }, [token, verifyEmail]);

    return (
        <div className="min-h-screen bg-[#1e1b4b] flex items-center justify-center p-6 relative overflow-hidden">
            {/* background effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-astro-yellow/10 blur-[100px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] w-full max-w-md text-center relative z-10 shadow-2xl"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-astro-yellow animate-spin mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2">Verifying Email</h2>
                        <p className="text-slate-300">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2">Account Activated!</h2>
                        <p className="text-slate-300 mb-8">{message}</p>
                        <Link
                            href="/login"
                            className="w-full bg-astro-yellow hover:bg-yellow-400 text-astro-navy font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-xl shadow-yellow-500/20"
                        >
                            Back to Login <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-400 mb-6" />
                        <h2 className="text-2xl font-black text-white mb-2">Verification Failed</h2>
                        <p className="text-slate-300 mb-8">{message}</p>
                        <Link
                            href="/login"
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/20 transition-all"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
