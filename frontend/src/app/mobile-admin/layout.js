"use client";

import MobileAdminSidebar from '../../components/MobileAdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function MobileAdminLayout({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Authenticating...</div>;

    if (!user || !['admin', 'manager'].includes(user.role)) {
        return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Access Denied to Mobile Control Panel</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
            <MobileAdminSidebar />
            <div className="flex-1 overflow-x-hidden p-8">
                {children}
            </div>
        </div>
    );
}
