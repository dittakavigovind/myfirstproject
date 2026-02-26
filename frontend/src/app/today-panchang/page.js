"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TodayPanchangRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/panchang');
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-pulse text-indigo-900 font-bold">Redirecting to Panchang...</div>
        </div>
    );
}
