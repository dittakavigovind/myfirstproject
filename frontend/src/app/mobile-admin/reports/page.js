"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Calendar, UserX } from 'lucide-react';
import API from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/reports');
            if (res.data.success) {
                setReports(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const getImageUrl = (user) => {
        if (!user) return null;
        return user.profilePic || user.image || user.avatar || null;
    };

    const getName = (user) => {
        if (!user) return 'Unknown';
        return user.displayName || user.name || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        User Reports
                    </h1>
                    <p className="text-slate-400 mt-1">Monitor all user and astrologer reports submitted across the platform.</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition flex items-center justify-center shadow-lg active:scale-95"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                    <ShieldAlert size={48} className="mx-auto text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-white">No Reports Found</h3>
                    <p className="text-slate-400 mt-2">The platform looks clean. No reports have been submitted yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={report._id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                                <div className="flex items-center gap-2 text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg w-fit">
                                    <ShieldAlert size={16} />
                                    Reason: {report.reason}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Calendar size={14} />
                                    {new Date(report.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Reporter */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Reported By</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                                            {getImageUrl(report.reporterId) ? (
                                                <img src={getImageUrl(report.reporterId)} alt="Reporter" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500"><UserX size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{getName(report.reporterId)}</div>
                                            <div className="text-xs text-slate-400 capitalize">{report.reporterModel}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reported */}
                                <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                    <span className="text-xs font-bold text-red-500/70 uppercase tracking-wider mb-3 block">Target (Reported)</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-red-500/20">
                                            {getImageUrl(report.reportedId) ? (
                                                <img src={getImageUrl(report.reportedId)} alt="Reported" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500"><UserX size={16} /></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-red-100">{getName(report.reportedId)}</div>
                                            <div className="text-xs text-red-400/70 capitalize">{report.reportedModel}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {report.description && (
                                <div className="mt-4 bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                                    <span className="text-xs font-bold text-slate-500 block mb-1">Description</span>
                                    <p className="text-slate-300 text-sm leading-relaxed">{report.description}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
