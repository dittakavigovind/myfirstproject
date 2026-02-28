'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../../../lib/urlHelper';
import { useAuth } from '../../../../context/AuthContext';
import { Download, Filter, Search, Loader2, Eye, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBookings = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
        temple: ''
    });

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_BASE}/pooja/admin/bookings?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_BASE}/pooja/admin/bookings/export?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pooja-bookings-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export successful');
        } catch (err) {
            toast.error('Failed to export data');
        } finally {
            setExportLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-600';
            case 'Pending': return 'bg-yellow-100 text-yellow-600';
            case 'Failed': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-astro-navy">Pooja Bookings</h1>
                    <p className="text-gray-500">Track and manage online seva bookings</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exportLoading}
                    className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
                >
                    {exportLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 pl-1 uppercase tracking-widest">Status</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 pl-1 uppercase tracking-widest">Start Date</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 pl-1 uppercase tracking-widest">End Date</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:border-astro-navy"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: '', startDate: '', endDate: '', temple: '' })}
                            className="w-full py-2.5 px-4 text-gray-400 hover:text-astro-navy font-bold transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Booking ID</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Devotee</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Address</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Temple & Seva</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Perform Date</th>
                                <th className="px-6 py-4 text-xs font-black text-astro-navy uppercase tracking-widest">Booking Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-astro-navy" />
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No bookings found for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-astro-navy">{booking.bookingId}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {booking.devoteeDetails.devotees?.map((d, i) => (
                                                    <div key={i} className="flex flex-col border-l-2 border-astro-yellow/30 pl-2 mb-1 last:mb-0">
                                                        <span className="text-sm font-bold text-gray-700">{d.name}</span>
                                                        {d.nakshatra && <span className="text-[10px] text-gray-400">Nakshatra: {d.nakshatra}</span>}
                                                    </div>
                                                ))}
                                                <div className="mt-1 pt-1 border-t border-gray-100 italic">
                                                    <span className="text-[10px] text-gray-400 block">Gotram: {booking.devoteeDetails.gotram}</span>
                                                    <span className="text-[10px] text-gray-400 block">{booking.devoteeDetails.phoneNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.deliveryAddress ? (
                                                <div className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                                                    <p className="font-bold text-astro-navy mb-1">{booking.deliveryAddress.address}</p>
                                                    <p>{booking.deliveryAddress.city}, {booking.deliveryAddress.state}</p>
                                                    <p>{booking.deliveryAddress.pincode}, {booking.deliveryAddress.country}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-astro-navy">{booking.temple?.name || 'N/A'}</span>
                                                <span className="text-xs text-astro-yellow font-bold uppercase">{booking.sevaDetails.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black">₹{booking.sevaDetails.price}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(booking.payment.status)}`}>
                                                {booking.payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.performDate ? (
                                                <div className="flex items-center text-sm font-black text-astro-navy bg-astro-yellow/10 px-3 py-1.5 rounded-xl border border-astro-yellow/20">
                                                    <Calendar className="w-3.5 h-3.5 mr-2 text-astro-navy" />
                                                    {new Date(booking.performDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">As scheduled</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
