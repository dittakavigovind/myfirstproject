"use client";

import ProfessionalReport from '../../../components/professional/ProfessionalReport';

export default function AdminProfessionalReportPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Professional Report</h1>
                <p className="text-slate-500">Generate and download comprehensive astrological reports for clients.</p>
            </div>
            <ProfessionalReport />
        </div>
    );
}
