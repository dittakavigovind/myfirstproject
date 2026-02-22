"use client";

import SeoManager from "../../../components/admin/SeoManager";
import ProtectedRoute from "../../../components/admin/ProtectedRoute";

export default function AdminSeoPage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <div className="min-h-screen bg-slate-50">
                <SeoManager />
            </div>
        </ProtectedRoute>
    );
}
