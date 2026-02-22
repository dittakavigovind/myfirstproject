"use client";

import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { useEffect } from 'react';
import API from '../../lib/api';

export default function AdminLayout({ children }) {
    return (
        <AdminProvider>
            <InnerAdminLayout>{children}</InnerAdminLayout>
        </AdminProvider>
    );
}

function InnerAdminLayout({ children }) {
    const { user, loading } = useAuth();
    const { stats } = useAdmin();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!user || !['admin', 'manager'].includes(user.role)) {
        return <div className="min-h-screen flex items-center justify-center">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <AdminSidebar pendingRequestsCount={stats?.pendingRequests || 0} />
            <div className="flex-1 overflow-x-hidden">
                {/* Main Content Area */}
                {children}
            </div>
        </div>
    );
}
