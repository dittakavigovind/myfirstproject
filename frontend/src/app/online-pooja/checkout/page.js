'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { resolveImageUrl, API_BASE } from '../../../lib/urlHelper';
import { X, Loader2, CreditCard, User, Phone, Mail, Home, Info, BookOpen, Plus, MapPin, Tag, Smartphone, ChevronLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import LocationSearch from '../../../components/LocationSearch';
import Image from 'next/image';

const CheckoutContent = () => {
    const { user, token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const templeSlug = searchParams.get('temple');
    const sevaId = searchParams.get('seva');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [temple, setTemple] = useState(null);
    const [seva, setSeva] = useState(null);

    // Country Codes matching login page
    const countryCodes = [
        { code: '+91', country: 'India', digits: 10 },
        { code: '+1', country: 'USA', digits: 10 },
        { code: '+44', country: 'UK', digits: 10 },
        { code: '+971', country: 'UAE', digits: 9 },
        { code: '+65', country: 'Singapore', digits: 8 },
    ];

    const [countryCode, setCountryCode] = useState('+91');
    const [formData, setFormData] = useState({
        devotees: [{ name: user?.name || '', nakshatra: '' }],
        gotram: '',
        phoneNumber: '', // Will be initialized in useEffect
        email: user?.email || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        performDate: ''
    });

    // Fetch Temple & Seva Details
    useEffect(() => {
        const fetchDetails = async () => {
            if (!templeSlug || !sevaId) {
                toast.error("Invalid booking parameters");
                router.push('/online-pooja');
                return;
            }
            try {
                const response = await axios.get(`${API_BASE}/pooja/temples/${templeSlug}`);
                if (response.data.success) {
                    const fetchedTemple = response.data.data;
                    setTemple(fetchedTemple);

                    const targetSeva = fetchedTemple.sevas?.find(s => s._id === sevaId);
                    if (targetSeva) {
                        setSeva(targetSeva);
                        if (targetSeva.dateSelectionType === 'Fixed') {
                            setFormData(prev => ({
                                ...prev,
                                performDate: new Date(targetSeva.fixedDate).toISOString().split('T')[0]
                            }));
                        }
                    } else {
                        toast.error("Seva not found");
                        router.push(`/online-pooja/details?slug=${templeSlug}`);
                    }
                }
            } catch (err) {
                console.error('Error fetching details:', err);
                toast.error("Failed to load booking details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [templeSlug, sevaId, router]);

    // Reset phone number when country code changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, phoneNumber: '' }));
    }, [countryCode]);

    // Initialize phone number and country code from user data
    useEffect(() => {
        if (user?.phone && formData.phoneNumber === '') {
            const matchedCode = countryCodes.find(c => user.phone.startsWith(c.code));
            if (matchedCode) {
                setCountryCode(matchedCode.code);
                setFormData(prev => ({
                    ...prev,
                    phoneNumber: user.phone.replace(matchedCode.code, '').slice(0, matchedCode.digits)
                }));
            } else {
                setFormData(prev => ({ ...prev, phoneNumber: user.phone.slice(-10) }));
            }
        }
    }, [user]);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
    const [availableCoupons, setAvailableCoupons] = useState([]);

    // Fetch Available Coupons on mount
    useEffect(() => {
        if (temple?._id) {
            const fetchCoupons = async () => {
                try {
                    const res = await axios.get(`${API_BASE}/pooja/coupons/active?templeId=${temple._id}`);
                    if (res.data.success) {
                        setAvailableCoupons(res.data.data);
                    }
                } catch (err) {
                    console.error('Error fetching available coupons:', err);
                }
            };
            fetchCoupons();
        }
    }, [temple]);

    // Restore saved progress on mount
    useEffect(() => {
        if (seva?._id && typeof window !== 'undefined') {
            const savedProgress = localStorage.getItem(`poojaBooking_${seva._id}`);
            if (savedProgress) {
                try {
                    const parsed = JSON.parse(savedProgress);
                    setFormData(parsed.formData);
                    if (parsed.countryCode) {
                        setCountryCode(parsed.countryCode);
                    }
                    if (parsed.couponCode) {
                        setCouponCode(parsed.couponCode);
                        if (token) {
                            setTimeout(() => {
                                handleApplyCoupon(parsed.couponCode);
                            }, 500);
                        }
                    }
                    localStorage.removeItem(`poojaBooking_${seva._id}`);
                    toast.success('Your previously entered details were restored!');
                } catch (e) {
                    console.error("Failed to parse saved booking progress");
                }
            }
        }
    }, [seva?._id, token]);

    const saveProgressAndLogin = () => {
        if (!seva?._id) return;
        localStorage.setItem(`poojaBooking_${seva._id}`, JSON.stringify({
            formData,
            countryCode,
            couponCode
        }));
        toast.error('Please login to continue');
        const redirectUrl = encodeURIComponent(`/online-pooja/checkout/?temple=${templeSlug}&seva=${sevaId}`);
        router.push(`/login?redirect=${redirectUrl}`);
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === 'phoneNumber') {
            const currentCountry = countryCodes.find(c => c.code === countryCode);
            const digits = currentCountry?.digits || 10;
            value = value.replace(/\D/g, '').slice(0, digits);
        }

        if (name === 'pincode') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        if (['city', 'state', 'country'].includes(name)) {
            value = value.replace(/[^a-zA-Z\s]/g, '');
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleLocationSelect = (locationData) => {
        const { city, state, country, pincode } = locationData;
        setFormData(prev => ({
            ...prev,
            city: city || '',
            state: state || '',
            country: 'India',
            pincode: pincode || ''
        }));
        if (city) {
            toast.success(`Location set-up complete`);
        }
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

    const handleApplyCoupon = async (autoCode = null) => {
        const codeToApply = typeof autoCode === 'string' ? autoCode : couponCode;

        if (!codeToApply.trim()) {
            setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });
            return;
        }

        if (!token) {
            saveProgressAndLogin();
            return;
        }

        setCouponLoading(true);
        setCouponMessage({ type: '', text: '' });

        try {
            const res = await axios.post(`${API_BASE}/pooja/coupons/validate`, {
                code: codeToApply,
                amount: seva.price,
                templeId: temple._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setAppliedCoupon({
                    code: codeToApply.toUpperCase(),
                    discountAmount: res.data.discountAmount,
                    finalAmount: res.data.finalAmount
                });
                setCouponMessage({ type: 'success', text: `Coupon applied! You saved ₹${res.data.discountAmount}` });
            }
        } catch (error) {
            setAppliedCoupon(null);
            setCouponMessage({ type: 'error', text: error.response?.data?.message || 'Invalid coupon code' });
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMessage({ type: '', text: '' });
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!token) {
            saveProgressAndLogin();
            return;
        }

        if (!termsAccepted) {
            toast.error('Please accept the Terms & Conditions to proceed');
            return;
        }

        const currentCountry = countryCodes.find(c => c.code === countryCode);
        const requiredDigits = currentCountry?.digits || 10;

        if (!formData.phoneNumber || formData.phoneNumber.length !== requiredDigits) {
            toast.error(`Please enter a valid ${requiredDigits}-digit phone number`);
            return;
        }

        if (!formData.address?.trim()) {
            toast.error('Please enter your full address');
            return;
        }

        if (!formData.city?.trim()) {
            toast.error('Please enter your city');
            return;
        }

        if (!formData.state?.trim()) {
            toast.error('Please enter your state');
            return;
        }

        if (!formData.country?.trim()) {
            toast.error('Please enter your country');
            return;
        }

        if (formData.pincode?.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return;
        }

        setSubmitting(true);

        try {
            const orderRes = await axios.post(`${API_BASE}/pooja/booking/create-order`, {
                templeId: temple._id,
                sevaName: seva.name,
                sevaPrice: seva.price,
                devoteeDetails: {
                    devotees: formData.devotees,
                    gotram: formData.gotram,
                    phoneNumber: `${countryCode}${formData.phoneNumber}`,
                    email: formData.email
                },
                deliveryAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    country: formData.country
                },
                performDate: formData.performDate,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message);
            }

            const { order_id, amount, currency, key_id, bookingId } = orderRes.data;

            const res = await loadRazorpay();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setSubmitting(false);
                return;
            }

            const options = {
                key: key_id,
                amount: amount * 100,
                currency: currency,
                name: "Way2Astro Online Pooja",
                description: `${seva.name} at ${temple.name}`,
                order_id: order_id,
                handler: async (response) => {
                    try {
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
                    contact: `${countryCode}${formData.phoneNumber}`
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
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-astro-light">
                <Loader2 className="w-12 h-12 text-astro-navy animate-spin mb-4" />
                <p className="text-astro-navy font-medium">Preparing Booking Details...</p>
            </div>
        );
    }

    if (!temple || !seva) return null;

    return (
        <div className="bg-astro-light min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-[calc(65px+env(safe-area-inset-top,0px))] md:top-[calc(81px+env(safe-area-inset-top,0px))] lg:top-[calc(125px+env(safe-area-inset-top,0px))] z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/online-pooja/details?slug=${templeSlug}`)}
                        className="flex items-center text-astro-navy hover:text-astro-yellow font-bold transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Temple
                    </button>
                    <span className="font-bold text-astro-navy text-sm md:text-base hidden sm:block">
                        Secure Checkout
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-[calc(200px+env(safe-area-inset-top,0px))] space-y-6">
                        <div className="bg-astro-navy text-white rounded-[2rem] shadow-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <span className="text-6xl font-black">ॐ</span>
                            </div>

                            <span className="bg-astro-yellow text-astro-navy text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                Booking Seva
                            </span>

                            <h2 className="text-xl md:text-2xl font-bold mt-4 mb-2 leading-tight">
                                {seva.name}
                            </h2>
                            <p className="text-white/70 text-sm mb-6 flex items-start gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                {temple.name}
                            </p>

                            <div className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
                                {appliedCoupon ? (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-sm text-white/60">
                                            <span>Original Price</span>
                                            <span className="line-through">₹{seva.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-astro-yellow">
                                            <span>Discount ({appliedCoupon.code})</span>
                                            <span>- ₹{appliedCoupon.discountAmount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-2xl font-black text-white pt-2 border-t border-white/10 mt-2">
                                            <span>Total</span>
                                            <span>₹{appliedCoupon.finalAmount}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-sm text-white/60 mb-1">Total Amount</div>
                                        <div className="text-3xl font-black text-astro-yellow">
                                            ₹{seva.price}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Info className="w-5 h-5 mr-3 text-white/40 flex-shrink-0" />
                                    <div className="text-xs text-white/70 leading-relaxed">
                                        Please provide accurate details for a successful Sankalpa.
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <BookOpen className="w-5 h-5 mr-3 text-white/40 flex-shrink-0" />
                                    <div className="text-xs text-white/70 leading-relaxed">
                                        Prasadam will be shipped to the address provided.
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <BookOpen className="w-5 h-5 mr-3 text-white/40 flex-shrink-0" />
                                    <div className="text-xs text-white/70 leading-relaxed">
                                        Change of address will be allowed 36hrs before seva date.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Preview */}
                        <div className="bg-white rounded-[2rem] shadow-sm p-3 relative h-48 hidden lg:block overflow-hidden">
                            <Image
                                src={temple.images?.[0] ? resolveImageUrl(temple.images[0]) : '/placeholder-temple.jpg'}
                                alt="Temple"
                                fill
                                className="object-cover rounded-[1.5rem]"
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-[1.5rem]" />
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <h1 className="text-2xl font-black text-astro-navy tracking-tight">Devotee Details</h1>
                            <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-10">
                            {/* Devotees mapping array */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Family Members (Max 4)</label>
                                    {formData.devotees.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={addDevotee}
                                            className="text-astro-navy hover:bg-astro-navy hover:text-white font-bold text-[10px] uppercase tracking-wider flex items-center bg-gray-100 px-4 py-2 rounded-full transition-all duration-300 shadow-sm"
                                        >
                                            <Plus className="w-3 h-3 mr-1.5" /> Add Person
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {formData.devotees.map((devotee, idx) => (
                                        <div key={idx} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 relative group transition-all duration-300 focus-within:border-astro-navy/30 focus-within:bg-white focus-within:shadow-lg">
                                            {formData.devotees.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDevotee(idx)}
                                                    className="absolute -top-3 -right-3 bg-white text-red-400 hover:text-red-600 p-2 rounded-full shadow-md border border-slate-100 transition-all hover:scale-110 active:scale-90"
                                                >
                                                    <X className="w-4 h-4" />
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
                                                            className="w-full bg-white border-slate-200 border rounded-2xl py-3 pl-11 pr-4 focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium text-sm"
                                                            placeholder="Enter name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nakshatra (Optional)</label>
                                                    <div className="relative">
                                                        <select
                                                            value={devotee.nakshatra}
                                                            onChange={(e) => handleDevoteeChange(idx, 'nakshatra', e.target.value)}
                                                            className="w-full bg-white border-slate-200 border rounded-2xl py-3 px-4 focus:border-astro-navy outline-none transition-all text-slate-700 font-medium cursor-pointer appearance-none text-sm"
                                                        >
                                                            <option value="" className="text-slate-400">Unknown / Don't Know</option>
                                                            <option value="Ashwini">Ashwini</option>
                                                            <option value="Bharani">Bharani</option>
                                                            <option value="Krittika">Krittika</option>
                                                            <option value="Rohini">Rohini</option>
                                                            <option value="Mrigashira">Mrigashira</option>
                                                            <option value="Ardra">Ardra</option>
                                                            <option value="Punarvasu">Punarvasu</option>
                                                            <option value="Pushya">Pushya</option>
                                                            <option value="Ashlesha">Ashlesha</option>
                                                            <option value="Magha">Magha</option>
                                                            <option value="Purva Phalguni">Purva Phalguni</option>
                                                            <option value="Uttara Phalguni">Uttara Phalguni</option>
                                                            <option value="Hasta">Hasta</option>
                                                            <option value="Chitra">Chitra</option>
                                                            <option value="Swati">Swati</option>
                                                            <option value="Vishakha">Vishakha</option>
                                                            <option value="Anuradha">Anuradha</option>
                                                            <option value="Jyeshtha">Jyeshtha</option>
                                                            <option value="Mula">Mula</option>
                                                            <option value="Purva Ashadha">Purva Ashadha</option>
                                                            <option value="Uttara Ashadha">Uttara Ashadha</option>
                                                            <option value="Shravana">Shravana</option>
                                                            <option value="Dhanishta">Dhanishta</option>
                                                            <option value="Shatabhisha">Shatabhisha</option>
                                                            <option value="Purva Bhadrapada">Purva Bhadrapada</option>
                                                            <option value="Uttara Bhadrapada">Uttara Bhadrapada</option>
                                                            <option value="Revati">Revati</option>
                                                        </select>
                                                        <div className="absolute inset-y-0 right-4 items-center flex pointer-events-none">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-5 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gotram *</label>
                                            <input
                                                required
                                                name="gotram"
                                                value={formData.gotram}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3 px-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium text-sm"
                                                placeholder="e.g. Kasyapasa"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone *</label>
                                            <div className="flex group relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 group-focus-within:text-astro-navy transition-colors">
                                                    <Smartphone className="w-4 h-4" />
                                                </div>
                                                <select
                                                    value={countryCode}
                                                    onChange={(e) => setCountryCode(e.target.value)}
                                                    className="pl-9 pr-2 border border-r-0 border-slate-100 bg-slate-50 text-slate-700 font-bold text-sm focus:outline-none focus:border-astro-navy rounded-l-2xl h-[52px] transition-all cursor-pointer hover:bg-slate-100"
                                                >
                                                    {countryCodes.map(c => (
                                                        <option key={c.code} value={c.code}>{c.code}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    required
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border-slate-100 border-2 rounded-r-2xl py-3 px-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium text-sm"
                                                    placeholder="9999999999"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium text-sm"
                                                placeholder="Email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pooja Perform Date Selection */}
                                <div className="pt-6 mt-6 border-t border-slate-100">
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CreditCard className="w-5 h-5 text-astro-navy" />
                                            <h4 className="text-[12px] font-black text-astro-navy uppercase tracking-widest">Pooja Performance Date</h4>
                                        </div>

                                        {seva?.dateSelectionType === 'Fixed' ? (
                                            <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Date (Fixed)</label>
                                                    <div className="bg-astro-navy text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Fixed</div>
                                                </div>
                                                <input
                                                    type="date"
                                                    disabled
                                                    value={new Date(seva.fixedDate).toISOString().split('T')[0]}
                                                    className="w-full bg-slate-50 border-slate-200 border rounded-xl py-3 px-4 font-black text-astro-navy opacity-70 cursor-not-allowed text-sm"
                                                />
                                                <p className="text-xs text-slate-500 font-medium pt-1">
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
                                                            className="w-full bg-white border-slate-200 border-2 rounded-2xl py-3 px-4 focus:border-astro-navy outline-none transition-all font-black text-astro-navy text-sm"
                                                        />
                                                    </div>
                                                    {seva?.dateSelectionType === 'Range' && (
                                                        <div className="md:w-64 p-4 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden flex flex-col justify-center mt-4 md:mt-0">
                                                            <div className="absolute -right-4 -top-4 text-orange-500/10 pointer-events-none">
                                                                <Calendar className="w-24 h-24" />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    Availability Area
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="bg-white px-2.5 py-1.5 rounded-xl border border-orange-100 shadow-sm">
                                                                        <p className="text-xs font-black text-astro-navy">
                                                                            {new Date(seva.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-orange-400 font-bold text-xs">to</span>
                                                                    <div className="bg-white px-2.5 py-1.5 rounded-xl border border-orange-100 shadow-sm">
                                                                        <p className="text-xs font-black text-astro-navy">
                                                                            {new Date(seva.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 italic font-medium ml-1">
                                                    * Please select a date within the allowed availability window for this seva.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-xl font-black text-astro-navy tracking-tight">Prasadam Delivery Address</h3>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>
                                <div className="space-y-5">
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
                                                className="w-full bg-slate-50 border-slate-100 border-2 rounded-2xl py-3 pl-11 pr-4 focus:bg-white focus:border-astro-navy outline-none transition-all placeholder:text-slate-300 font-medium resize-none shadow-inner text-sm"
                                                placeholder="Apartment name, Street, Land-mark..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="col-span-2 sm:col-span-1 space-y-1.5 min-h-[48px]">
                                            <LocationSearch
                                                onLocationSelect={handleLocationSelect}
                                                placeholder="City *"
                                                defaultValue={formData.city}
                                                showLeftIcon={false}
                                                showIcon={false}
                                                restrictCountry="IN"
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
                                                readOnly
                                                name="country"
                                                value={formData.country}
                                                className="w-full bg-slate-100 border-slate-200 border-2 rounded-xl py-3 px-4 outline-none font-bold text-slate-500 text-sm cursor-not-allowed"
                                                placeholder="Country *"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <h3 className="text-xl font-black text-astro-navy tracking-tight">Have a Coupon Code?</h3>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-50 border border-green-200 p-5 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                                                    <Tag className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-green-800">{appliedCoupon.code} Applied</p>
                                                    <p className="text-sm text-green-600 font-medium tracking-wide">You saved ₹{appliedCoupon.discountAmount}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="text-sm font-bold text-red-500 hover:text-red-600 bg-red-100/50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {availableCoupons.length > 0 && (
                                                <div className="relative">
                                                    <select
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        className="w-full bg-white border-2 border-astro-yellow/50 rounded-2xl py-4 pl-5 pr-12 focus:border-astro-yellow outline-none font-bold text-base h-16 cursor-pointer appearance-none shadow-sm transition-colors"
                                                    >
                                                        <option value="">Select an available offer...</option>
                                                        {availableCoupons.map((c) => (
                                                            <option key={c._id} value={c.code}>
                                                                {c.code} - Save {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-5 items-center flex pointer-events-none">
                                                        <Tag className="w-6 h-6 text-astro-yellow" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex flex-col sm:flex-row gap-4 relative">
                                                <div className="relative flex-1">
                                                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Or enter a discount code"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                        className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:border-astro-navy outline-none uppercase font-mono tracking-wider font-bold text-base h-16 transition-colors"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    disabled={couponLoading || !couponCode.trim()}
                                                    className="bg-astro-navy text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-astro-yellow hover:text-astro-navy transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-16 shadow-lg shadow-astro-navy/20"
                                                >
                                                    {couponLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {couponMessage.text && !appliedCoupon && (
                                        <p className={`text-sm font-bold mt-4 ml-2 flex items-center gap-2 ${couponMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                            {couponMessage.type === 'error' ? <X className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Terms and Conditions Checkbox */}
                            <div className="pt-6 border-t border-slate-100">
                                <label className="flex items-start cursor-pointer group select-none">
                                    <div className="relative flex items-center mt-1">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                        />
                                        <div className="w-6 h-6 border-2 border-slate-300 rounded-lg flex items-center justify-center transition-all duration-300 peer-checked:bg-astro-navy peer-checked:border-astro-navy group-hover:border-astro-navy/50">
                                            <svg className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${termsAccepted ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="ml-4 text-sm font-bold text-slate-500 leading-relaxed group-hover:text-astro-navy transition-colors">
                                        I agree to the <span className="text-astro-navy underline decoration-astro-yellow decoration-2 underline-offset-4">Terms and Conditions</span> and acknowledge that I have read the service <span className="text-astro-navy underline decoration-astro-yellow decoration-2 underline-offset-4">Disclaimer</span>.
                                    </span>
                                </label>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="group w-full bg-astro-navy text-white h-20 rounded-[2rem] font-black text-xl hover:bg-astro-yellow hover:text-astro-navy border-2 border-astro-navy hover:border-astro-yellow transition-all duration-500 shadow-2xl shadow-astro-navy/20 hover:shadow-astro-yellow/30 flex items-center justify-center overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-7 h-7 animate-spin mr-3" />
                                            <span>Processing Secure Payment...</span>
                                        </>
                                    ) : (
                                        <div className="relative flex items-center">
                                            <span>Pay ₹{appliedCoupon ? appliedCoupon.finalAmount : seva.price} Securely</span>
                                            <CreditCard className="w-6 h-6 ml-4 group-hover:rotate-12 transition-transform" />
                                        </div>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-2 mt-5">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                    <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">Secure 256-bit SSL encrypted payment</p>
                                </div>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-astro-light">
                <Loader2 className="w-12 h-12 text-astro-navy animate-spin mb-4" />
                <p className="text-astro-navy font-medium">Securing Checkout Details...</p>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
};

export default CheckoutPage;
