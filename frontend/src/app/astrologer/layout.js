"use client";

import AstrologerSidebar from '../../components/AstrologerSidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AstrologerLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'astrologer')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            {/* Simple spinner to avoid heavy imports if CosmicLoader not available here, or use it if imported */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!user || user.role !== 'astrologer') return null;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <AstrologerSidebar />
            <div className="flex-1 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}
