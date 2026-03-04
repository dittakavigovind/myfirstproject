"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { API_BASE } from '../../../../lib/urlHelper';
import DatePicker from 'react-datepicker';
import CustomDateInput from '../../../../components/common/CustomDateInput';

export default function CouponsManager() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: 0,
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: 100,
        isActive: true,
        temple: ''
    });

    const [temples, setTemples] = useState([]);

    useEffect(() => {
        fetchCoupons();
        fetchTemples();
    }, []);

    const fetchTemples = async () => {
        try {
            const res = await axios.get(`${API_BASE}/pooja/temples`);
            if (res.data.success) {
                setTemples(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch temples", error);
        }
    };

    const fetchCoupons = async () => {
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;
            const res = await axios.get(`${API_BASE}/pooja/admin/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch coupons error", error);
            toast.error("Failed to load coupons");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;
            const dataToSubmit = { ...formData };
            if (dataToSubmit.maxDiscount === '') dataToSubmit.maxDiscount = null;
            if (dataToSubmit.temple === '') dataToSubmit.temple = null;

            if (editId) {
                await axios.put(`${API_BASE}/pooja/admin/coupons/${editId}`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Coupon updated successfully");
            } else {
                await axios.post(`${API_BASE}/pooja/admin/coupons`, dataToSubmit, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Coupon created successfully");
            }

            setIsModalOpen(false);
            setEditId(null);
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue || 0,
            maxDiscount: coupon.maxDiscount || '',
            validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
            validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit,
            isActive: coupon.isActive,
            temple: coupon.temple || ''
        });
        setEditId(coupon._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;
            await axios.delete(`${API_BASE}/pooja/admin/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (error) {
            toast.error("Failed to delete coupon");
        }
    };

    const openNewModal = () => {
        setFormData({
            code: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minOrderValue: 0,
            maxDiscount: '',
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: '',
            usageLimit: 100,
            isActive: true,
            temple: ''
        });
        setEditId(null);
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8">Loading coupons...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Tag className="text-astro-navy" size={28} />
                        Discount Coupons
                    </h1>
                    <p className="text-slate-500 mt-1">Manage promotional codes for Pooja Bookings</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 bg-astro-navy text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Create Coupon
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">CODE</th>
                                <th className="px-6 py-4">DISCOUNT</th>
                                <th className="px-6 py-4">TEMPLE</th>
                                <th className="px-6 py-4">USAGE</th>
                                <th className="px-6 py-4">VALID UNTIL</th>
                                <th className="px-6 py-4 text-center">STATUS</th>
                                <th className="px-6 py-4 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        No coupons found. Give your users some discounts!
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-astro-navy">{coupon.code}</td>
                                        <td className="px-6 py-4">
                                            {coupon.discountType === 'PERCENTAGE'
                                                ? `${coupon.discountValue}% (Max ₹${coupon.maxDiscount || '∞'})`
                                                : `₹${coupon.discountValue}`
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {coupon.temple ? (temples.find(t => t._id === coupon.temple)?.name || 'Specific') : 'Global'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {coupon.usedCount} / {coupon.usageLimit}
                                        </td>
                                        <td className="px-6 py-4">{new Date(coupon.validUntil).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            {coupon.isActive && new Date(coupon.validUntil) > new Date() ? (
                                                <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">Active</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">Inactive/Expired</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleEdit(coupon)} className="text-blue-500 hover:text-blue-700 transition">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-700 transition">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-slate-900">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Coupon Code (e.g. FESTIVAL10)</label>
                                    <input type="text" name="code" value={formData.code} onChange={handleInputChange} required className="w-full border border-slate-200 p-2.5 rounded-xl uppercase font-mono" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Applicable Temple (Optional)</label>
                                    <select name="temple" value={formData.temple} onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded-xl">
                                        <option value="">Global (All Temples)</option>
                                        {temples.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Type</label>
                                    <select name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded-xl">
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Value ({formData.discountType === 'PERCENTAGE' ? '%' : '₹'})</label>
                                    <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} required min="1" className="w-full border border-slate-200 p-2.5 rounded-xl" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Min Order Value (₹)</label>
                                    <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} min="0" className="w-full border border-slate-200 p-2.5 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Max Discount (₹)</label>
                                    <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} placeholder="Leave blank for none" min="0" className="w-full border border-slate-200 p-2.5 rounded-xl" disabled={formData.discountType === 'FIXED'} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Valid From</label>
                                    <DatePicker
                                        selected={formData.validFrom ? new Date(formData.validFrom) : null}
                                        onChange={(date) => setFormData(prev => ({ ...prev, validFrom: date }))}
                                        customInput={<CustomDateInput className="p-2.5" />}
                                        dateFormat="dd-MM-yyyy"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Valid Until</label>
                                    <DatePicker
                                        selected={formData.validUntil ? new Date(formData.validUntil) : null}
                                        onChange={(date) => setFormData(prev => ({ ...prev, validUntil: date }))}
                                        minDate={formData.validFrom ? new Date(formData.validFrom) : new Date()}
                                        customInput={<CustomDateInput className="p-2.5" />}
                                        dateFormat="dd-MM-yyyy"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Usage Limit</label>
                                    <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} required min="1" className="w-full border border-slate-200 p-2.5 rounded-xl" />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 text-astro-navy rounded cursor-pointer" />
                                    <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 cursor-pointer">Active Coupon</label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 text-white bg-astro-navy hover:bg-slate-800 rounded-xl font-medium shadow-sm transition-colors">{editId ? 'Save Changes' : 'Create Coupon'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
