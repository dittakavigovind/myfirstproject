"use client";
import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import { Download, Search, Filter } from 'lucide-react';

export default function ActivityReport() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        astrologerId: ''
    });

    // Fetch Astrologers for filter dropdown (optional, can be a search input)
    const [astrologers, setAstrologers] = useState([]);

    useEffect(() => {
        fetchAstrologers();
        fetchReports();
    }, []);

    const fetchAstrologers = async () => {
        try {
            const { data } = await API.get('/astro/astrologers?includeInactive=true');
            if (data.success) setAstrologers(data.data);
        } catch (e) { console.error(e); }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const { data } = await API.get(`/activity/reports/admin?${query}`);
            if (data.success) {
                setReports(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Activity Report</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                    <input
                        type="date"
                        name="from"
                        value={filters.from}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                    <input
                        type="date"
                        name="to"
                        value={filters.to}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Astrologer</label>
                    <select
                        name="astrologerId"
                        value={filters.astrologerId}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-48"
                    >
                        <option value="">All Astrologers</option>
                        {astrologers.map(astro => (
                            <option key={astro._id} value={astro._id}>{astro.displayName}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={fetchReports}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 h-[42px]"
                >
                    <Search size={18} /> Search
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-600">Date</th>
                            <th className="p-4 font-semibold text-slate-600">Astrologer</th>
                            <th className="p-4 font-semibold text-slate-600">Online (Min)</th>
                            <th className="p-4 font-semibold text-slate-600">Voice (Min)</th>
                            <th className="p-4 font-semibold text-slate-600">Video (Min)</th>
                            <th className="p-4 font-semibold text-slate-600">Chat (Min)</th>
                            <th className="p-4 font-semibold text-slate-600">Total Calls</th>
                            <th className="p-4 font-semibold text-slate-600">Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="p-8 text-center text-slate-500">Loading data...</td></tr>
                        ) : reports.length === 0 ? (
                            <tr><td colSpan="8" className="p-8 text-center text-slate-500">No records found</td></tr>
                        ) : (
                            reports.map(report => (
                                <tr key={report._id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 text-slate-600">
                                        {(() => {
                                            const d = new Date(report.date);
                                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                        })()}
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">
                                        {report.astrologerId?.displayName || 'Unknown'}
                                    </td>
                                    <td className="p-4 text-blue-600 font-medium">
                                        {report.onlineDurationMinutes}
                                    </td>
                                    <td className="p-4 text-slate-600">{report.totalVoiceMinutes}</td>
                                    <td className="p-4 text-slate-600">{report.totalVideoMinutes}</td>
                                    <td className="p-4 text-slate-600">{report.totalChatMinutes}</td>
                                    <td className="p-4 text-slate-600">{report.totalCallsCount}</td>
                                    <td className="p-4 font-medium text-green-600">
                                        ₹{report.totalNetEarnings?.toFixed(2) || '0.00'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
