"use client";

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AstrologerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'astrologer')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-24">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Astrologer Portal</h1>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <p className="text-slate-600">Welcome, {user.name}. Manage your consultations here.</p>
                {/* Astrologer specific content will go here */}
            </div>
        </div>
    );
}
