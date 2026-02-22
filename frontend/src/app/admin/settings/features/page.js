"use client";

import FeatureSettings from '@/components/admin/settings/FeatureSettings';

export default function FeatureSettingsPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <h1 className="text-3xl font-black text-slate-800 mb-8">Platform Features</h1>
            <FeatureSettings />
        </div>
    );
}
