"use client";

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CosmicLoader from '../CosmicLoader';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                router.push('/'); // Or unauthorized page
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <CosmicLoader message="Verifying Access..." size="lg" />
            </div>
        );
    }

    if (!user) return null;
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return null;

    return children;
}
