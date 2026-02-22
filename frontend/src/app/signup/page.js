"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <div className="h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
