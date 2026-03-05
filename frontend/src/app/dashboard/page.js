"use client";

import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../lib/api';
import { SERVER_BASE } from '../../lib/urlHelper';
import { addMoney, verifyPayment } from '../../services/walletService';
import LocationSearch from '../../components/LocationSearch';
import DatePicker from "react-datepicker";
import CustomDateInput from '../../components/common/CustomDateInput';

import TimeInput from '../../components/TimeInput';
import "react-datepicker/dist/react-datepicker.css";
import {
    Wallet, Plus, ScrollText, Calendar, HeartHandshake, Sparkles,
    MapPin, Clock, Edit2, User as UserIcon, X, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, login, loading, logout, updateUser } = useAuth();
    const router = useRouter();

    const [showEdit, setShowEdit] = useState(false);
    // Initialize form state with nulls/empty strings
    const [editForm, setEditForm] = useState({
        name: '',
        date: null,
        time: null,
        place: '',
        lat: '',
        lng: '',
        timezone: 5.5,
        profileImage: '',
        gender: 'male'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);

    // Pooja Orders State
    const [poojaOrders, setPoojaOrders] = useState([]);
    const [poojaLoading, setPoojaLoading] = useState(true);

    // Saved Profiles State
    const [showAddChart, setShowAddChart] = useState(false);
    const [chartForm, setChartForm] = useState({
        name: '',
        date: null,
        time: new Date(new Date().setHours(0, 0, 0, 0)),
        place: '',
        lat: '',
        lng: '',
        timezone: 5.5
    });
    const [isSavingChart, setIsSavingChart] = useState(false);

    // Edit Address State
    const [showEditAddress, setShowEditAddress] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [addressForm, setAddressForm] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // Add Funds State
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeLoading, setRechargeLoading] = useState(false);

    // Effect to pre-fill data when modal opens or user changes
    useEffect(() => {
        if (showEdit && user) {
            let parsedDate = null;
            let parsedTime = null;

            // Parse Date
            if (user.birthDetails?.date) {
                parsedDate = new Date(user.birthDetails.date);
            } else if (user.birthDetails?.dob) {
                parsedDate = new Date(user.birthDetails.dob);
            }

            // Parse Time (Can be HH:mm or ISO string)
            const timeStr = user.birthDetails?.time || user.birthDetails?.tob;
            if (timeStr) {
                parsedTime = new Date();
                if (typeof timeStr === 'string' && timeStr.includes('T')) {
                    // Handle ISO string from legacy or mis-formatted saves
                    const t = new Date(timeStr);
                    if (!isNaN(t)) {
                        parsedTime.setHours(t.getHours(), t.getMinutes(), 0, 0);
                    }
                } else if (typeof timeStr === 'string' && timeStr.includes(':')) {
                    // Handle standard HH:mm format
                    const [h, m] = timeStr.split(':');
                    parsedTime.setHours(parseInt(h), parseInt(m), 0, 0);
                } else {
                    parsedTime.setHours(0, 0, 0, 0);
                }
            } else {
                // Default to 12:00 AM if not set
                parsedTime = new Date();
                parsedTime.setHours(0, 0, 0, 0);
            }

            setEditForm({
                name: user.name || '',
                date: parsedDate,
                time: parsedTime,
                place: user.birthDetails?.place || '',
                lat: user.birthDetails?.lat || '',
                lng: user.birthDetails?.lng || '',
                timezone: user.birthDetails?.timezone || 5.5,
                profileImage: user.profileImage || '',
                gender: user.gender || 'male'
            });
        }
    }, [user, showEdit]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const { data } = await API.get('/users/activity');
                if (data.success) {
                    setRecentActivity(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch activity", err);
            } finally {
                setActivityLoading(false);
            }
        };

        const fetchPoojaOrders = async () => {
            try {
                const { data } = await API.get('/pooja/booking/my-bookings');
                if (data.success) {
                    setPoojaOrders(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch pooja orders", err);
            } finally {
                setPoojaLoading(false);
            }
        };

        if (user) {
            fetchActivity();
            fetchPoojaOrders();
        }
    }, [user]);

    const handleLocSelect = (loc) => {
        setEditForm(prev => ({
            ...prev,
            place: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng,
            timezone: loc.timezone || 5.5
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const toastId = toast.loading('Uploading image...');
            const res = await API.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                // Backend now returns full URL or path. 
                // If it starts with http, use it. If not, prepend.
                let fullUrl = res.data.filePath;
                if (!fullUrl.startsWith('http')) {
                    fullUrl = SERVER_BASE + fullUrl;
                }

                setEditForm(prev => ({ ...prev, profileImage: fullUrl }));
                toast.success('Image uploaded!', { id: toastId });
            } else {
                toast.error('Upload failed', { id: toastId });
            }
        } catch (err) {
            console.error('Upload failed', err);
            toast.error('Image upload failed');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation: Ensure we don't accidentally wipe data.
        // If we are editing, we expect at least some data.
        if (!editForm.name) {
            toast.error("Name is required");
            return;
        }

        try {
            // Partial Update Logic: Only send what changed
            const payload = { userId: user._id };
            let hasChanges = false;

            // Name
            if (editForm.name !== (user.name || '')) {
                payload.name = editForm.name;
                hasChanges = true;
            }

            // Gender
            if (editForm.gender !== user.gender) {
                payload.gender = editForm.gender;
                hasChanges = true;
            }

            // Format Date for comparison and payload (Local date, not UTC)
            const formatLocalDate = (date) => {
                if (!date) return '';
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const newDateStr = formatLocalDate(editForm.date);
            const oldDateStr = formatLocalDate(user.birthDetails?.date);

            if (newDateStr !== oldDateStr) {
                payload.date = newDateStr;
                hasChanges = true;
            }

            // Format Time
            const newTimeStr = editForm.time ? editForm.time.toTimeString().slice(0, 5) : '';
            const oldTimeStr = user.birthDetails?.time || '';

            if (newTimeStr !== oldTimeStr) {
                payload.time = newTimeStr;
                hasChanges = true;
            }

            // Place/Location
            if (editForm.place !== (user.birthDetails?.place || '')) {
                payload.place = editForm.place;
                payload.lat = editForm.lat;
                payload.lng = editForm.lng;
                payload.timezone = editForm.timezone;
                hasChanges = true;
            }

            // Profile Image
            if (editForm.profileImage !== (user.profileImage || '')) {
                payload.profileImage = editForm.profileImage;
                hasChanges = true;
            }

            if (!hasChanges) {
                toast("No changes to save", { icon: 'ℹ️' });
                return;
            }

            const res = await API.post('/astro/save-profile', payload);

            if (res.data.success) {
                // Update Context
                updateUser({ ...user, ...res.data.data });
                toast.success('Profile Updated Successfully');
                setShowEdit(false);
            }
        } catch (error) {
            console.error(error);
            const status = error?.response?.status;
            const msg = error?.response?.data?.message || error?.message || 'Failed to update profile';

            if (status === 401 || status === 404) {
                toast.error("Session expired or user not found. Logging out...");
                setTimeout(() => {
                    logout();
                }, 1500);
                return;
            }

            toast.error(msg);
        }
    };

    const handleSaveChart = async (e) => {
        e.preventDefault();
        if (!chartForm.name || !chartForm.date) {
            toast.error("Name and Date are required");
            return;
        }

        setIsSavingChart(true);
        try {
            const payload = {
                ...chartForm,
                date: chartForm.date.toISOString().split('T')[0],
                time: chartForm.time.toTimeString().slice(0, 5)
            };
            const res = await API.post('/astro/save-chart', payload);
            if (res.data.success) {
                updateUser({ ...user, savedCharts: res.data.data });
                toast.success('Profile saved to your hub!');
                setShowAddChart(false);
                setChartForm({
                    name: '',
                    date: null,
                    time: new Date(new Date().setHours(0, 0, 0, 0)),
                    place: '',
                    lat: '',
                    lng: '',
                    timezone: 5.5
                });
            }
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || 'Failed to save profile';
            toast.error(msg);
        } finally {
            setIsSavingChart(false);
        }
    };

    const handleDeleteChart = async (chartId) => {
        if (!confirm('Are you sure you want to remove this profile?')) return;
        try {
            const res = await API.delete(`/astro/delete-chart/${chartId}`);
            if (res.data.success) {
                updateUser({ ...user, savedCharts: res.data.data });
                toast.success('Profile removed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove profile');
        }
    };

    const handleEditAddress = (booking) => {
        setSelectedBooking(booking);
        setAddressForm({
            address: booking.deliveryAddress?.address || '',
            city: booking.deliveryAddress?.city || '',
            state: booking.deliveryAddress?.state || '',
            pincode: booking.deliveryAddress?.pincode || '',
            country: 'India'
        });
        setShowEditAddress(true);
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        if (!addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            toast.error("Please fill all address fields");
            return;
        }

        if (!/^\d{6}$/.test(addressForm.pincode)) {
            toast.error("Please enter a valid 6-digit Pincode");
            return;
        }

        setIsSavingAddress(true);
        try {
            const res = await API.put(`/pooja/booking/${selectedBooking._id}/address`, {
                deliveryAddress: addressForm
            });
            if (res.data.success) {
                // Refresh bookings
                const { data } = await API.get('/pooja/booking/my-bookings');
                if (data.success) {
                    setPoojaOrders(data.data);
                }
                toast.success('Address updated successfully');
                setShowEditAddress(false);
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'Failed to update address');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleRecharge = async (e) => {
        if (e) e.preventDefault();
        const amt = parseFloat(rechargeAmount);
        if (!amt || isNaN(amt) || amt <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setRechargeLoading(true);
        try {
            const orderData = await addMoney(amt);
            if (!orderData.success) {
                toast.error(orderData.message || 'Failed to create order');
                setRechargeLoading(false);
                return;
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100,
                currency: orderData.currency,
                name: "Way2Astro",
                description: "Wallet Recharge",
                image: "/logo.png",
                order_id: orderData.order_id,
                handler: async function (response) {
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: orderData.amount
                        });

                        if (verifyRes.success) {
                            toast.success('Payment Successful!');
                            updateUser({ ...user, walletBalance: verifyRes.balance });
                            setShowAddFunds(false);
                            setRechargeAmount('');
                        } else {
                            toast.error(verifyRes.message || 'Verification failed');
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error('Payment verification failed');
                    } finally {
                        setRechargeLoading(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: "#6366f1" },
                modal: {
                    ondismiss: () => setRechargeLoading(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error(error);
            toast.error('Payment initialization failed');
            setRechargeLoading(false);
        }
    };



    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pt-8 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Welcome */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Your cosmic journey continues today.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Wallet & Profile */}
                    <div className="space-y-8 lg:sticky lg:top-8">

                        {/* Wallet Card */}
                        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden group transition-all duration-300 hover:shadow-orange-500/30 ring-1 ring-white/10">
                            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-orange-100 text-xs font-bold uppercase tracking-widest opacity-90 mb-1">Total Balance</p>
                                        <h2 className="text-4xl font-black tracking-tight">₹ {user.walletBalance || 0}</h2>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                                        <Wallet size={24} className="text-white" />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowAddFunds(true)}
                                    className="flex items-center gap-3 bg-white text-orange-600 text-sm font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all w-max mt-6"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                    <span>Add Funds</span>
                                </button>
                            </div>
                            {/* Decorative Circles */}
                            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 relative overflow-hidden group hover:border-blue-100 transition-all duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-bold text-slate-800 text-lg">My Profile</h3>
                                <button
                                    onClick={() => setShowEdit(true)}
                                    className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all duration-300 group-hover:scale-110"
                                    title="Edit Profile"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center mb-8 relative">
                                <div className="w-28 h-28 rounded-full bg-slate-50 p-1.5 shadow-inner mb-4 relative group-hover:scale-105 transition-transform duration-300">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl text-slate-300 overflow-hidden shadow-sm border border-slate-100 relative">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (user.role === 'astrologer' && user.astrologerProfile?.image ?
                                            <img src={user.astrologerProfile.image} alt="Profile" className="w-full h-full object-cover" /> :
                                            (user.name?.[0] || <UserIcon size={40} />)
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                                </div>
                                <h4 className="font-black text-xl text-slate-900 mb-1">{user.name}</h4>
                                <p className="text-slate-400 text-sm font-medium">{user.email}</p>
                            </div>

                            <div className="space-y-4">
                                <ProfileItem
                                    icon={<Calendar size={18} />}
                                    label="Date of Birth"
                                    value={(user.birthDetails?.date || user.birthDetails?.dob) ? (() => {
                                        const d = new Date(user.birthDetails.date || user.birthDetails.dob);
                                        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                    })() : 'Not Set'}
                                    color="blue"
                                />
                                <ProfileItem
                                    icon={<Clock size={18} />}
                                    label="Time of Birth"
                                    value={(() => {
                                        const tob = user.birthDetails?.time || user.birthDetails?.tob;
                                        if (!tob) return 'Not Set';

                                        // Handle ISO String
                                        if (tob.includes('T')) {
                                            const d = new Date(tob);
                                            if (!isNaN(d)) {
                                                return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                            }
                                        }

                                        // Handle HH:mm format
                                        if (tob.includes(':')) {
                                            const [h, m] = tob.split(':');
                                            const hours = parseInt(h);
                                            const ampm = hours >= 12 ? 'PM' : 'AM';
                                            const h12 = hours % 12 || 12;
                                            return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
                                        }

                                        return tob;
                                    })()}
                                    color="purple"
                                />
                                <ProfileItem
                                    icon={<MapPin size={18} />}
                                    label="Place of Birth"
                                    value={user.birthDetails?.place || user.birthDetails?.pob || 'Not Set'}
                                    color="green"
                                />
                                <ProfileItem
                                    icon={<UserIcon size={18} />}
                                    label="Gender"
                                    value={user.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : 'Not Set'}
                                    color="orange"
                                />
                            </div>

                            {((user.birthDetails?.date || user.birthDetails?.dob) &&
                                (user.birthDetails?.time || user.birthDetails?.tob) &&
                                (user.birthDetails?.lat || user.birthDetails?.latitude)) && (
                                    <>
                                        <div className="mt-8 pt-8 border-t border-slate-50">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                                Cosmic Identity
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <Link
                                                    href={`/calculators/moon-sign-calculator?action=calculate&source=profile&name=${encodeURIComponent(user.name)}&date=${user.birthDetails?.date || user.birthDetails?.dob}&time=${user.birthDetails?.time || user.birthDetails?.tob}&place=${encodeURIComponent(user.birthDetails?.place || user.birthDetails?.pob)}&lat=${user.birthDetails?.lat || user.birthDetails?.latitude}&lng=${user.birthDetails?.lng || user.birthDetails?.longitude}&tz=${user.birthDetails?.timezone || user.birthDetails?.tz || 5.5}`}
                                                    className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rashi (Moon)</span>
                                                        <ArrowUpRight size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors">{user.birthDetails?.moonSign || 'Pending...'}</span>
                                                </Link>
                                                <Link
                                                    href={`/calculators/ascendant-calculator?action=calculate&source=profile&name=${encodeURIComponent(user.name)}&date=${user.birthDetails?.date || user.birthDetails?.dob}&time=${user.birthDetails?.time || user.birthDetails?.tob}&place=${encodeURIComponent(user.birthDetails?.place || user.birthDetails?.pob)}&lat=${user.birthDetails?.lat || user.birthDetails?.latitude}&lng=${user.birthDetails?.lng || user.birthDetails?.longitude}&tz=${user.birthDetails?.timezone || user.birthDetails?.tz || 5.5}`}
                                                    className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lagna (Asc)</span>
                                                        <ArrowUpRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">{user.birthDetails?.ascendant || 'Pending...'}</span>
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-indigo-100 transition-colors">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tithi</span>
                                                    <span className="text-xs font-black text-slate-700">{user.birthDetails?.tithi || '-'}</span>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-indigo-100 transition-colors">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Varam</span>
                                                    <span className="text-xs font-black text-slate-700">{user.birthDetails?.vara || '-'}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 mb-3">
                                                <Link
                                                    href={`/calculators/nakshatra-calculator?action=calculate&source=profile&name=${encodeURIComponent(user.name)}&date=${user.birthDetails?.date || user.birthDetails?.dob}&time=${user.birthDetails?.time || user.birthDetails?.tob}&place=${encodeURIComponent(user.birthDetails?.place || user.birthDetails?.pob)}&lat=${user.birthDetails?.lat || user.birthDetails?.latitude}&lng=${user.birthDetails?.lng || user.birthDetails?.longitude}&tz=${user.birthDetails?.timezone || user.birthDetails?.tz || 5.5}`}
                                                    className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nakshatram</span>
                                                        <ArrowUpRight size={12} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-700 group-hover:text-orange-600 transition-colors">{user.birthDetails?.nakshatra ? `${user.birthDetails.nakshatra} (Pada ${user.birthDetails.pada || 1})` : '-'}</span>
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-indigo-100 transition-colors">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Yoga</span>
                                                    <span className="text-xs font-black text-slate-700">{user.birthDetails?.yoga || '-'}</span>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 hover:border-indigo-100 transition-colors">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Karanam</span>
                                                    <span className="text-xs font-black text-slate-700">{user.birthDetails?.karana || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-8"
                                        >
                                            <Link
                                                href={`/kundli?action=view_my_kundli&source=profile&name=${encodeURIComponent(user.name)}&gender=${user.gender}&date=${user.birthDetails?.date || user.birthDetails?.dob}&time=${user.birthDetails?.time || user.birthDetails?.tob}&place=${encodeURIComponent(user.birthDetails?.place || user.birthDetails?.pob)}&lat=${user.birthDetails?.lat || user.birthDetails?.latitude}&lng=${user.birthDetails?.lng || user.birthDetails?.longitude}&tz=${user.birthDetails?.timezone || user.birthDetails?.tz || 5.5}`}
                                                className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-bold text-sm transition-all shadow-sm border border-indigo-100 group/btn"
                                            >
                                                <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                <span>View My Kundli</span>
                                                <ChevronRight size={16} />
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                        </div>
                    </div>

                    {/* Right Column: Quick Actions & Content */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 text-xl">Quick Actions</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <ActionCard
                                    title="Get Kundli"
                                    desc="Detailed Life Report & Charts"
                                    icon={<ScrollText size={24} />}
                                    color="purple"
                                    link={((user.birthDetails?.date || user.birthDetails?.dob) && (user.birthDetails?.time || user.birthDetails?.tob) && (user.birthDetails?.lat || user.birthDetails?.latitude)) ? `/kundli?action=view_my_kundli&source=profile&name=${encodeURIComponent(user.name)}&gender=${user.gender}&date=${user.birthDetails?.date || user.birthDetails?.dob}&time=${user.birthDetails?.time || user.birthDetails?.tob}&place=${encodeURIComponent(user.birthDetails?.place || user.birthDetails?.pob)}&lat=${user.birthDetails?.lat || user.birthDetails?.latitude}&lng=${user.birthDetails?.lng || user.birthDetails?.longitude}&tz=${user.birthDetails?.timezone || user.birthDetails?.tz || 5.5}` : "/kundli"}
                                />
                                <ActionCard
                                    title="Daily Panchang"
                                    desc="Auspicious Timings for Today"
                                    icon={<Calendar size={24} />}
                                    color="orange"
                                    link="/panchang"
                                />
                                <ActionCard
                                    title="Matchmaking"
                                    desc="Check Love Compatibility"
                                    icon={<HeartHandshake size={24} />}
                                    color="rose"
                                    link="/matchmaking"
                                />
                                <ActionCard
                                    title="Daily Horoscope"
                                    desc="Your Personal Predictions"
                                    icon={<Sparkles size={24} />}
                                    color="indigo"
                                    link={user.birthDetails?.moonSign
                                        ? `/horoscope/details?sign=${user.birthDetails.moonSign.toLowerCase()}&tab=daily`
                                        : "/horoscope"}
                                />
                            </div>
                        </div>

                        {/* Saved Profiles Hub (New) */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-xl">Cosmic Family Hub</h3>
                                    <p className="text-slate-400 text-sm font-medium">Saved profiles for quick access (Max 2)</p>
                                </div>
                                <button
                                    onClick={() => setShowAddChart(true)}
                                    disabled={user.savedCharts?.length >= 2}
                                    className={`flex items-center gap-2 py-2 px-5 text-white rounded-xl text-sm font-bold transition-all shadow-lg ${user.savedCharts?.length >= 2 ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
                                >
                                    <Plus size={18} />
                                    <span>{user.savedCharts?.length >= 2 ? 'Limit Reached' : 'Add New'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.savedCharts?.length > 0 ? (
                                    user.savedCharts.map((chart) => (
                                        <div key={chart._id} className="group relative bg-slate-50 border border-slate-100 rounded-[2rem] p-5 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {chart.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-slate-800 truncate">{chart.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        {(() => {
                                                            const d = new Date(chart.date);
                                                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                                        })()} • {chart.time}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/kundli/result?name=${encodeURIComponent(chart.name)}&date=${chart.date.split('T')[0]}&time=${chart.time}&lat=${chart.lat}&lng=${chart.lng}&tz=${chart.timezone || 5.5}&place=${encodeURIComponent(chart.place || '')}`}
                                                        className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors"
                                                        title="View Kundli"
                                                    >
                                                        <ArrowUpRight size={20} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteChart(chart._id)}
                                                        className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-10 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-200 mb-3">
                                            <UserIcon size={20} />
                                        </div>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No profiles saved yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex-1 min-h-[200px] flex flex-col">
                            <h3 className="font-bold text-slate-800 text-xl mb-6">Recent Activity</h3>

                            {activityLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                                </div>
                            ) : recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.map((act) => (
                                        <div key={act._id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-blue-500">
                                                {act.actionType === 'KUNDLI' && <ScrollText size={20} />}
                                                {act.actionType === 'MATCHMAKING' && <HeartHandshake size={20} />}
                                                {act.actionType === 'DOSHA' && <Sparkles size={20} />}
                                                {act.actionType === 'HOROSCOPE' && <Sparkles size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">{act.actionType}</h4>
                                                <p className="text-sm text-slate-500 font-medium mb-1">{act.description}</p>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    {(() => {
                                                        const d = new Date(act.createdAt);
                                                        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                        <Sparkles size={24} />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest text-center">Your cosmic journey history will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* My Pooja Orders */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex-1 min-h-[200px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-xl">My Pooja & Seva Orders</h3>
                                    <p className="text-slate-400 text-sm font-medium">Track your booked rituals</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">
                                    <HeartHandshake size={24} />
                                </div>
                            </div>

                            {poojaLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
                            ) : poojaOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {poojaOrders.map((order) => {
                                        const isPaid = order.payment?.status === 'Paid';
                                        const isFailed = order.payment?.status === 'Failed';

                                        const now = new Date();
                                        const performDate = new Date(order.performDate);
                                        const isPast = performDate < now;

                                        return (
                                            <div key={order._id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border transition-colors ${isPast ? 'bg-slate-50 opacity-60 grayscale border-slate-200' : 'bg-slate-50 border-slate-100 hover:border-orange-200'}`}>
                                                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-200 shadow-inner">
                                                    {order.temple?.profileImage || order.temple?.coverImage ? (
                                                        <img src={order.temple.profileImage || order.temple.coverImage} className="w-full h-full object-cover" alt="Temple" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                            <HeartHandshake size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${isPaid ? 'bg-green-100 text-green-700' : isFailed ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {order.payment?.status || 'Pending'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${order.bookingStatus === 'Confirmed' ? 'bg-blue-100 text-blue-700' : order.bookingStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : order.bookingStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                                                            }`}>
                                                            {order.bookingStatus}
                                                        </span>

                                                        {/* Edit Address Badge */}
                                                        {(order.bookingStatus === 'Confirmed' || isPaid) && order.bookingStatus !== 'Completed' && (() => {
                                                            const performDate = new Date(order.performDate);
                                                            const now = new Date();
                                                            const hoursUntilPooja = (performDate - now) / (1000 * 60 * 60);

                                                            if (hoursUntilPooja >= 36) {
                                                                return (
                                                                    <button
                                                                        onClick={() => handleEditAddress(order)}
                                                                        className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1"
                                                                        title="Edit Delivery Address"
                                                                    >
                                                                        <Edit2 size={10} />
                                                                        Edit Address
                                                                    </button>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 truncate leading-snug">{order.sevaDetails?.name}</h4>
                                                    <Link href={`/online-pooja/details/?slug=${order.temple?.slug || ''}`} className="text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors inline-block mb-1">
                                                        {order.temple?.name || 'Unknown Temple'}
                                                    </Link>

                                                    <div className="flex flex-col gap-1 text-xs text-slate-500 font-medium mt-1">
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} className="text-slate-400" />
                                                                Perform Date: {order.performDate ? new Date(order.performDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                                                            </span>
                                                            <span className="flex items-center gap-1 font-bold">
                                                                ₹{order.sevaDetails?.price - (order.discountAmount || 0)}
                                                            </span>
                                                            <span className="text-slate-400">ID: {order.bookingId}</span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-1 pb-2 border-b border-slate-100">
                                                            Booked on: {new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')}
                                                        </div>
                                                        <div className="pt-2 space-y-1.5">
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-slate-400 font-bold shrink-0">Devotees:</span>
                                                                <span className="text-slate-600">
                                                                    {order.devoteeDetails?.devotees?.map(d => d.name).join(', ') || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-slate-400 font-bold shrink-0">Address:</span>
                                                                <span className="text-slate-600 line-clamp-2" title={`${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`}>
                                                                    {order.deliveryAddress?.address || 'N/A'}, {order.deliveryAddress?.city || ''}, {order.deliveryAddress?.state || ''} {order.deliveryAddress?.pincode || ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isPaid && !isFailed && (
                                                    <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-3 flex sm:flex-col items-center sm:items-end gap-2 text-xs border-t sm:border-t-0 border-slate-200 sm:border-l sm:pl-4">
                                                        <span className="text-slate-400">Complete payment to confirm</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-200 mb-4 border border-orange-50">
                                        <HeartHandshake size={32} />
                                    </div>
                                    <h4 className="text-slate-700 font-black text-lg mb-1">No Orders Yet</h4>
                                    <p className="text-slate-400 font-medium text-sm text-center mb-6 max-w-xs">You haven't booked any rituals or sevas yet.</p>
                                    <Link href="/online-pooja" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:scale-95">
                                        Explore Pooja
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEdit && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                            onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 relative shadow-2xl flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-slate-800">Edit Profile</h2>
                                    <button onClick={() => setShowEdit(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    {/* Profile Image Upload */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative group cursor-pointer w-24 h-24">
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-indigo-200 bg-slate-50 flex items-center justify-center relative hover:bg-slate-100 transition-colors">
                                                {editForm.profileImage ? (
                                                    <img src={editForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={32} className="text-slate-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit2 size={20} className="text-white" />
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                title="Change Profile Photo"
                                            />
                                        </div>
                                    </div>

                                    <InputGroup label="Full Name" required>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full border-none bg-slate-50 p-4 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                                            placeholder="Enter your full name"
                                        />
                                    </InputGroup>

                                    {/* Gender Selection */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                        <div className="flex gap-4">
                                            {['male', 'female', 'other'].map((g) => (
                                                <label key={g} className={`flex-1 relative cursor-pointer group`}>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        checked={editForm.gender === g}
                                                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                                        className="peer sr-only"
                                                    />
                                                    <div className={`
                                                        p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all duration-300
                                                        ${editForm.gender === g
                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner'
                                                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-white'}
                                                    `}>

                                                        <span className="font-bold capitalize text-sm tracking-wide">{g}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Date of Birth" className="relative z-30">
                                            <div className="relative">
                                                <DatePicker customInput={<CustomDateInput placeholder='Select Date' Icon={Calendar} />} selected={editForm.date} onChange={(date) => setEditForm({ ...editForm, date })} dateFormat="dd/MM/yyyy" className="w-full border-none bg-slate-50 p-4 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300 px-4" showMonthDropdown showYearDropdown dropdownMode="select" wrapperClassName="w-full" popperClassName="!z-[9999]" portalId="root-portal" autoComplete="off" />
                                            </div>
                                        </InputGroup>

                                        <InputGroup label="Time of Birth" className="relative z-20">
                                            <div className="bg-slate-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all p-1">
                                                <TimeInput
                                                    value={editForm.time}
                                                    onChange={(time) => setEditForm({ ...editForm, time })}
                                                    className="w-full bg-transparent p-3 text-slate-800 outline-none font-bold"
                                                />
                                            </div>
                                        </InputGroup>
                                    </div>

                                    <InputGroup label="Place of Birth" className="relative z-10">
                                        <div className="[&_input]:border-none [&_input]:bg-slate-50 [&_input]:rounded-xl [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500/20 [&_input]:focus:bg-white [&_input]:transition-all [&_input]:font-bold [&_input]:w-full [&_input]:placeholder:text-slate-300">
                                            <LocationSearch
                                                onLocationSelect={handleLocSelect}
                                                placeholder="Search City"
                                                defaultValue={editForm.place}
                                                darkMode={false}
                                                showIcon={false}
                                            />
                                        </div>
                                        {user.birthDetails?.place && (
                                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium px-2">
                                                <MapPin size={12} className="text-blue-500" />
                                                <span>Current: <span className="text-slate-700">{user.birthDetails.place}</span></span>
                                            </div>
                                        )}
                                    </InputGroup>

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowEdit(false)}
                                            className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 font-bold transition-all text-sm uppercase tracking-wide"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all font-bold text-sm uppercase tracking-wide"
                                        >

                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Chart Modal */}
                <AnimatePresence>
                    {showAddChart && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                            onClick={(e) => e.target === e.currentTarget && setShowAddChart(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 relative shadow-2xl flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800">Add Cosmic Profile</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Create family or friend profile</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAddChart(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveChart} className="space-y-6">
                                    <InputGroup label="Full Name" required>
                                        <input
                                            type="text"
                                            value={chartForm.name}
                                            onChange={(e) => setChartForm({ ...chartForm, name: e.target.value })}
                                            className="w-full border-none bg-slate-50 p-4 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                                            placeholder="e.g. Spouse, Child, Friend"
                                        />
                                    </InputGroup>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Date of Birth" required className="relative z-30">
                                            <div className="relative">
                                                <DatePicker customInput={<CustomDateInput placeholder='Select Date' Icon={Calendar} />} selected={chartForm.date} onChange={(date) => setChartForm({ ...chartForm, date })} dateFormat="dd/MM/yyyy" className="w-full border-none bg-slate-50 p-4 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300 px-4" showMonthDropdown showYearDropdown dropdownMode="select" wrapperClassName="w-full" popperClassName="!z-[9999]" portalId="root-portal" autoComplete="off" />
                                            </div>
                                        </InputGroup>

                                        <InputGroup label="Time of Birth" required className="relative z-20">
                                            <div className="bg-slate-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all p-1">
                                                <TimeInput
                                                    value={chartForm.time}
                                                    onChange={(time) => setChartForm({ ...chartForm, time })}
                                                    className="w-full bg-transparent p-3 text-slate-800 outline-none font-bold"
                                                />
                                            </div>
                                        </InputGroup>
                                    </div>

                                    <InputGroup label="Place of Birth" className="relative z-10">
                                        <div className="[&_input]:border-none [&_input]:bg-slate-50 [&_input]:rounded-xl [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500/20 [&_input]:focus:bg-white [&_input]:transition-all [&_input]:font-bold [&_input]:w-full [&_input]:placeholder:text-slate-300">
                                            <LocationSearch
                                                onLocationSelect={(loc) => setChartForm({
                                                    ...chartForm,
                                                    place: loc.formattedAddress,
                                                    lat: loc.lat,
                                                    lng: loc.lng,
                                                    timezone: loc.timezone || 5.5
                                                })}
                                                placeholder="Search City"
                                                darkMode={false}
                                                showIcon={false}
                                            />
                                        </div>
                                    </InputGroup>

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddChart(false)}
                                            className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 font-bold transition-all text-sm uppercase tracking-wide"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingChart}
                                            className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all font-bold text-sm uppercase tracking-wide disabled:opacity-50"
                                        >
                                            {isSavingChart ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Address Modal */}
                <AnimatePresence>
                    {showEditAddress && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                            onClick={(e) => e.target === e.currentTarget && setShowEditAddress(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 relative shadow-2xl flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800">Update Address</h2>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">For Order ID: {selectedBooking?.bookingId}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowEditAddress(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateAddress} className="space-y-6">
                                    <InputGroup label="Complete House Address" required>
                                        <textarea
                                            value={addressForm.address}
                                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                            className="w-full border-none bg-slate-50 p-4 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium placeholder:text-slate-300 min-h-[100px] resize-none"
                                            placeholder="House No, Floor, Street Name..."
                                        />
                                    </InputGroup>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Search City (India Only)" required className="relative z-30">
                                            <div className="[&_input]:border-none [&_input]:bg-slate-50 [&_input]:rounded-xl [&_input]:text-slate-800 [&_input]:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500/20 [&_input]:focus:bg-white [&_input]:transition-all [&_input]:font-bold [&_input]:w-full [&_input]:placeholder:text-slate-300">
                                                <LocationSearch
                                                    onLocationSelect={(loc) => setAddressForm(prev => ({
                                                        ...prev,
                                                        city: loc.city || '',
                                                        state: loc.state || '',
                                                        pincode: loc.pincode || '',
                                                        country: 'India'
                                                    }))}
                                                    placeholder="Search City"
                                                    defaultValue={addressForm.city}
                                                    restrictCountry="IN"
                                                    darkMode={false}
                                                    showIcon={false}
                                                />
                                            </div>
                                        </InputGroup>

                                        <InputGroup label="State" required>
                                            <input
                                                type="text"
                                                readOnly
                                                value={addressForm.state}
                                                className="w-full border-none bg-slate-100 p-4 rounded-xl text-slate-500 italic outline-none font-bold"
                                                placeholder="State"
                                            />
                                        </InputGroup>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputGroup label="Pincode" required>
                                            <input
                                                type="text"
                                                value={addressForm.pincode}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setAddressForm({ ...addressForm, pincode: value });
                                                }}
                                                className="w-full border-none bg-slate-50 p-4 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                                                placeholder="Pincode"
                                            />
                                        </InputGroup>

                                        <InputGroup label="Country">
                                            <input
                                                type="text"
                                                readOnly
                                                value="India"
                                                className="w-full border-none bg-slate-100 p-4 rounded-xl text-slate-500 italic outline-none font-bold"
                                            />
                                        </InputGroup>
                                    </div>

                                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditAddress(false)}
                                            className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 font-bold transition-all text-sm uppercase tracking-wide"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingAddress}
                                            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all font-bold text-sm uppercase tracking-wide disabled:opacity-50"
                                        >
                                            {isSavingAddress ? 'Saving...' : 'Update Address'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Funds Modal */}
                <AnimatePresence>
                    {showAddFunds && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                            onClick={(e) => e.target === e.currentTarget && !rechargeLoading && setShowAddFunds(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 relative shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                                            <Wallet size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-800">Add Funds</h2>
                                    </div>
                                    {!rechargeLoading && (
                                        <button onClick={() => setShowAddFunds(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all">
                                            <X size={24} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Amount to recharge</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                value={rechargeAmount}
                                                onChange={(e) => setRechargeAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                                disabled={rechargeLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {[100, 200, 500, 1000].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setRechargeAmount(amt.toString())}
                                                className={`py-3 rounded-xl font-bold transition-all border-2 ${rechargeAmount === amt.toString() ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                                                disabled={rechargeLoading}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleRecharge}
                                        disabled={rechargeLoading || !rechargeAmount}
                                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 transition-all"
                                    >
                                        {rechargeLoading ? (
                                            <>
                                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={20} strokeWidth={3} />
                                                <span>Proceed to Pay</span>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-slate-400 font-medium">Secured by Razorpay • Instant settlement</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Sub-components for cleaner code
const InputGroup = ({ label, required, children, className = '' }) => (
    <div className={`w-full ${className}`}>
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

function ProfileItem({ icon, label, value, color }) {
    const colors = {
        blue: 'text-blue-500 bg-blue-50 group-hover:bg-blue-100',
        purple: 'text-purple-500 bg-purple-50 group-hover:bg-purple-100',
        green: 'text-green-500 bg-emerald-50 group-hover:bg-emerald-100',
        orange: 'text-orange-500 bg-orange-50 group-hover:bg-orange-100',
    };

    return (
        <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-50 group">
            <div className={`p-3 rounded-xl ${colors[color]} transition-colors`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-700">{value}</p>
            </div>
        </div>
    );
}

function ActionCard({ title, desc, icon, color, link }) {
    const styles = {
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    };

    const style = styles[color];

    return (
        <Link href={link} className="no-underline group h-full">
            <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center ${style.text} group-hover:scale-110 transition-transform duration-300`}>
                        {icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
                </div>
            </div>
        </Link>
    );
}
