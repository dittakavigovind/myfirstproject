'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../lib/urlHelper';
import { X, Loader2, CreditCard, User, Phone, Mail, Home, Info, BookOpen, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const BookingModal = ({ isOpen, onClose, temple, seva }) => {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [formData, setFormData] = useState({
        devotees: [{ name: user?.name || '', nakshatra: '' }],
        gotram: '',
        phoneNumber: user?.phone || '',
        email: user?.email || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        performDate: seva?.dateSelectionType === 'Fixed' ? new Date(seva.fixedDate).toISOString().split('T')[0] : ''
    });

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'phoneNumber') {
            // Remove non-digits and limit to 10 characters
            value = value.replace(/\D/g, '').slice(0, 10);
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleDevoteeChange = (index, field, value) => {
        const newDevotees = [...formData.devotees];
        newDevotees[index][field] = value;
        setFormData({ ...formData, devotees: newDevotees });
    };

    const addDevotee = () => {
        if (formData.devotees.length < 4) {
            setFormData({
                ...formData,
                devotees: [...formData.devotees, { name: '', nakshatra: '' }]
            });
        }
    };

    const removeDevotee = (index) => {
        const newDevotees = formData.devotees.filter((_, i) => i !== index);
        setFormData({ ...formData, devotees: newDevotees });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Please login to book a seva');
            router.push('/login');
            return;
        }

        if (!termsAccepted) {
            toast.error('Please accept the Terms & Conditions to proceed');
            return;
        }

        if (formData.phoneNumber.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order on Backend
            const orderRes = await axios.post(`${API_BASE}/pooja/booking/create-order`, {
                templeId: temple._id,
                sevaName: seva.name,
                sevaPrice: seva.price,
                devoteeDetails: {
                    devotees: formData.devotees,
                    gotram: formData.gotram,
                    phoneNumber: formData.phoneNumber,
                    email: formData.email
                },
                deliveryAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    country: formData.country
                },
                performDate: formData.performDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message);
            }

            const { order_id, amount, currency, key_id, bookingId } = orderRes.data;

            // 2. Initialize Razorpay Checkout
            const options = {
                key: key_id,
                amount: amount * 100,
                currency: currency,
                name: "Way2Astro Online Pooja",
                description: `${seva.name} at ${temple.name}`,
                order_id: order_id,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await axios.post(`${API_BASE}/pooja/booking/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (verifyRes.data.success) {
                            toast.success('Pooja Booked Successfully!');
                            router.push(`/online-pooja/payment-status?status=success&bookingId=${bookingId}`);
                            onClose();
                        } else {
                            router.push(`/online-pooja/payment-status?status=failed&bookingId=${bookingId}`);
                        }
                    } catch (err) {
                        console.error('Verification Error:', err);
                        toast.error('Payment verification failed');
                        router.push(`/online-pooja/payment-status?status=failed&bookingId=${bookingId}`);
                    }
                },
                prefill: {
                    name: formData.devotees[0]?.name || '',
                    email: formData.email,
                    contact: formData.phoneNumber
                },
                theme: {
                    color: "#0b1c3d"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment Failed');
                router.push(`/online-pooja/payment-status?status=failed&bookingId=${bookingId}`);
            });
            rzp.open();

        } catch (error) {
            console.error('Booking Error:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Sidebar / Info */}
                    <div className="w-full md:w-80 bg-astro-navy p-8 text-white hidden md:block">
                        <div className="mb-8">
                            <span className="bg-astro-yellow text-astro-navy text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                Booking Seva
                            </span>
                            <h2 className="text-2xl font-bold mt-4 mb-2">{seva.name}</h2>
                            <p className="text-white/60 text-sm">{temple.name}</p>
                        </div>

                        <div className="text-3xl font-black mb-8">
                            ₹{seva.price}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <Info className="w-5 h-5 mr-3 text-astro-yellow flex-shrink-0" />
                                <div className="text-xs text-white/70 leading-relaxed">
                                    Please provide accurate details for a successful Sankalpa.
                                </div>
                            </div>
                            <div className="flex items-start">
                                <BookOpen className="w-5 h-5 mr-3 text-astro-yellow flex-shrink-0" />
                                <div className="text-xs text-white/70 leading-relaxed">
                                    E-Prasadam will be shipped to the address provided below.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto">
                        <div className="flex items-center justify-between mb-8 pr-12 md:pr-0">
                            <h3 className="text-2xl font-black text-astro-navy tracking-tight">Devotee Details</h3>
                            <div className="h-1 w-8 md:w-12 bg-astro-yellow rounded-full"></div>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-8">
                            {/* Devotee Info Section */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Family Members (Max 4)</label>
                                    {formData.devotees.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={addDevotee}
                                            className="text-astro-navy hover:bg-astro-navy hover:text-white font-bold text-[10px] uppercase tracking-wider flex items-center bg-gray-100 px-4 py-2 rounded-full transition-all duration-300 border border-transparent shadow-sm hover:shadow-md"
                                        >
                                            <Plus className="w-3 h-3 mr-1.5" /> Add Person
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {formData.devotees.map((devotee, idx) => (
                                        <div key={idx} className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative group transition-all duration-300 hover:border-astro-yellow/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                                            {formData.devotees.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDevotee(idx)}
                                                    className="absolute -top-2 -right-2 bg-white text-red-400 hover:text-red-600 p-1.5 rounded-full shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Person {idx + 1} Name *</label>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                        <input
                                                            required
                                                            value={devotee.name}
                                                            onChange={(e) => handleDevoteeChange(idx, 'name', e.target.value)}
                                                            className="w-full bg-white border-slate-200 border rounded-2xl py-3 pl-11 pr-4 focus:border-astro-navy focus:ring-4 focus:ring-astro-navy/5 outline-none transition-all placeholder:text-slate-300 font-medium"
                                                            placeholder="Enter name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nakshatra (Optional)</label>
                                                    <div className="relative">
                                                        <input
                                                            value={devotee.nakshatra}
                                                            onChange={(e) => handleDevoteeChange(idx, 'nakshatra', e.target.value)}
                                                            className="w-full bg-white border-slate-200 border rounded-2xl py-3 px-5 focus:border-astro-navy focus:ring-4 focus:ring-astro-navy/5 outline-none transition-all placeholder:text-slate-300 font-medium"
                                                            placeholder="e.g. Rohini, Ashwani"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Common Fields Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gotram *</label>
                                        <input
                                            required
                                            name="gotram"
                                            value={formData.gotram}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3.5 px-5 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium"
                                            placeholder="e.g. Kasyapasa"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                            <input
                                                required
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3.5 pl-10 pr-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium"
                                                placeholder="Phone number"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3.5 pl-10 pr-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium"
                                                placeholder="Email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pooja Perform Date Selection */}
                                <div className="pt-4 border-t border-slate-100/50">
                                    <div className="bg-astro-navy/5 p-6 rounded-3xl border border-astro-navy/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <CreditCard className="w-5 h-5 text-astro-navy" />
                                            <h4 className="text-sm font-black text-astro-navy uppercase tracking-wider">Pooja Performance Date</h4>
                                        </div>

                                        {seva?.dateSelectionType === 'Fixed' ? (
                                            <div className="space-y-2 bg-white p-4 rounded-2xl border border-astro-navy/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Date (Fixed)</label>
                                                    <div className="bg-astro-navy text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Fixed</div>
                                                </div>
                                                <input
                                                    type="date"
                                                    disabled
                                                    value={new Date(seva.fixedDate).toISOString().split('T')[0]}
                                                    className="w-full bg-slate-50 border-slate-200 border-2 rounded-2xl py-3.5 px-5 font-black text-astro-navy opacity-70 cursor-not-allowed"
                                                />
                                                <p className="text-[10px] text-slate-400 font-bold mt-1 ml-1">
                                                    {new Date(seva.fixedDate).toLocaleDateString('en-IN', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                                            Select Your Preferred Date *
                                                        </label>
                                                        <input
                                                            required
                                                            type="date"
                                                            name="performDate"
                                                            value={formData.performDate}
                                                            onChange={handleChange}
                                                            min={seva?.dateSelectionType === 'Range' ? new Date(seva.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                            max={seva?.dateSelectionType === 'Range' ? new Date(seva.endDate).toISOString().split('T')[0] : undefined}
                                                            className="w-full bg-white border-slate-200 border-2 rounded-2xl py-3.5 px-5 focus:border-astro-navy outline-none transition-all font-black text-astro-navy"
                                                        />
                                                    </div>
                                                    {seva?.dateSelectionType === 'Range' && (
                                                        <div className="md:w-48 p-4 bg-white rounded-2xl border border-slate-100 flex flex-col justify-center">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available range</p>
                                                            <p className="text-xs font-bold text-astro-navy">
                                                                {new Date(seva.startDate).toLocaleDateString('en-GB')} - {new Date(seva.endDate).toLocaleDateString('en-GB')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-400 italic">
                                                    * Please select a date within the allowed availability window for this seva.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-xl font-black text-astro-navy tracking-tight">Prasadam Delivery Address</h3>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Complete House Address *</label>
                                        <div className="relative">
                                            <Home className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                                            <textarea
                                                required
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium resize-none shadow-inner"
                                                placeholder="Apartment name, Street, Land-mark..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="col-span-1 sm:col-span-1 space-y-1.5">
                                            <input
                                                required
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-xl py-3 px-4 focus:bg-white focus:border-astro-navy outline-none transition-all font-medium placeholder:text-slate-300 text-sm"
                                                placeholder="City *"
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 space-y-1.5">
                                            <input
                                                required
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-xl py-3 px-4 focus:bg-white focus:border-astro-navy outline-none transition-all font-medium placeholder:text-slate-300 text-sm"
                                                placeholder="State *"
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 space-y-1.5">
                                            <input
                                                required
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-xl py-3 px-4 focus:bg-white focus:border-astro-navy outline-none transition-all font-medium placeholder:text-slate-300 text-sm"
                                                placeholder="Pincode *"
                                            />
                                        </div>
                                        <div className="col-span-1 sm:col-span-1 space-y-1.5">
                                            <input
                                                required
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-xl py-3 px-4 focus:bg-white focus:border-astro-navy outline-none transition-all font-medium placeholder:text-slate-300 text-sm"
                                                placeholder="Country *"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Conditions Checkbox */}
                            <div className="pt-4 px-1">
                                <label className="flex items-start cursor-pointer group select-none">
                                    <div className="relative flex items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                        />
                                        <div className="w-5 h-5 border-2 border-slate-200 rounded-lg flex items-center justify-center transition-all duration-300 peer-checked:bg-astro-navy peer-checked:border-astro-navy group-hover:border-astro-navy/50">
                                            <svg className={`w-3 h-3 text-white transition-transform duration-300 ${termsAccepted ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="ml-3 text-xs font-bold text-gray-500 leading-relaxed group-hover:text-astro-navy transition-colors">
                                        I agree to the <span className="text-astro-navy underline decoration-astro-yellow decoration-2 underline-offset-4">Terms and Conditions</span> and acknowledge that I have read the service <span className="text-astro-navy underline decoration-astro-yellow decoration-2 underline-offset-4">Disclaimer</span>.
                                    </span>
                                </label>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full bg-astro-navy text-white h-16 rounded-2xl font-black text-lg hover:bg-astro-yellow hover:text-astro-navy border-2 border-astro-navy hover:border-astro-yellow transition-all duration-500 shadow-xl shadow-astro-navy/20 hover:shadow-astro-yellow/30 flex items-center justify-center overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                            <span>Processing Your Request...</span>
                                        </>
                                    ) : (
                                        <div className="relative flex items-center">
                                            <span>Confirm & Pay ₹{seva.price}</span>
                                            <CreditCard className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform" />
                                        </div>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">Secure 256-bit SSL encrypted payment</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
