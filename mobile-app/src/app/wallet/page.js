"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Checkout } from 'capacitor-razorpay';
import {
    ArrowLeft, Wallet, Plus, ChevronRight,
    History, CreditCard, Sparkles, ShieldCheck,
    TrendingUp, ArrowUpRight, ArrowDownLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";
import { maskUserName } from "@/utils/maskUtils";
import toast from "react-hot-toast";

export default function WalletPage() {
    const router = useRouter();
    const { user, checkUser } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [gstConfig, setGstConfig] = useState({ enabled: true, percentage: 18 });

    const [plans, setPlans] = useState([]);

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchHistory();
            if (checkUser) checkUser();
        } else {
            setLoading(false);
        }
        fetchPlans();
    }, [user]);

    const fetchPlans = async () => {
        try {
            const res = await API.get('/wallet/plans');
            if (res.data.success) {
                setPlans(res.data.data);
                if (res.data.gst) setGstConfig(res.data.gst);
            }
        } catch (error) {
            console.warn('Failed to fetch wallet plans:', error);
        }
    };



    const fetchHistory = async () => {
        try {
            const res = await API.get('/wallet/transactions');
            if (res.data.success) {
                const grouped = res.data.transactions.reduce((acc, tx) => {
                    if (tx.referenceModel === 'Session' && tx.referenceId) {
                        const refId = typeof tx.referenceId === 'object' ? tx.referenceId._id : tx.referenceId;
                        const existing = acc.find(item => {
                            const itemRefId = typeof item.referenceId === 'object' ? item.referenceId._id : item.referenceId;
                            return item.referenceModel === 'Session' && itemRefId === refId && item.type === tx.type;
                        });
                        
                        if (existing) {
                            existing.amount += tx.amount;
                            if (new Date(tx.createdAt) > new Date(existing.createdAt)) {
                                existing.createdAt = tx.createdAt;
                            }
                            return acc;
                        }
                    }
                    acc.push({ ...tx });
                    return acc;
                }, []);
                
                grouped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setHistory(grouped);
            }
        } catch (error) {
            console.warn('Failed to fetch wallet history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchHistory(),
                checkUser ? checkUser() : Promise.resolve()
            ]);
            toast.success("Refreshed successfully");
        } catch (error) {
            console.error('Failed to refresh:', error);
            toast.error("Failed to refresh");
        }
    };

    const getRechargeAmount = () => {
        if (selectedPlan === 'custom') return parseFloat(customAmount) || 0;
        return plans.find(p => p._id === selectedPlan)?.amount || 0;
    };

    const getBonusAmount = () => {
        if (selectedPlan === 'custom') return 0;
        return plans.find(p => p._id === selectedPlan)?.bonus || 0;
    };

    const handleRechargeClick = () => {
        if (processing) return;
        const amount = getRechargeAmount();
        if (amount <= 0) return;
        setShowBreakdown(true);
    };

    const handleConfirmRecharge = async () => {
        if (processing) return;
        const amount = getRechargeAmount();
        if (amount <= 0) return;
        
        setProcessing(true);

        try {
            const payload = { amount };
            if (selectedPlan !== 'custom') {
                payload.planId = selectedPlan;
            }
            // Initiate Razorpay Order on Backend
            const res = await API.post('/wallet/recharge', payload);
            if (res.data.success) {
                const orderId = res.data.order_id;
                const totalPayPaise = Math.round((res.data.totalAmount || (amount * (gstConfig.enabled ? (1 + gstConfig.percentage / 100) : 1))) * 100);
                
                const options = {
                    key: res.data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: totalPayPaise.toString(),
                    currency: 'INR',
                    name: 'Way2Astro',
                    description: 'Wallet Recharge',
                    order_id: orderId,
                    prefill: {
                        name: user?.name || '',
                        email: user?.email || '',
                        contact: user?.phone || ''
                    },
                    theme: { color: '#6b21a8' }
                };

                try {
                    const paymentResponse = await Checkout.open(options);
                    
                    try {
                        let responseData = paymentResponse.response || paymentResponse;
                        if (typeof responseData === 'string') {
                            try { responseData = JSON.parse(responseData); } catch (e) { console.error('Parse err:', e); }
                        }

                        const verifyRes = await API.post('/wallet/verify-payment', {
                            ...responseData,
                            amount: amount
                        });

                        if (verifyRes.data.success) {
                            toast.success('Payment Successful!');
                            if (checkUser) await checkUser();
                            setShowBreakdown(false);
                            router.push('/explore');
                            return;
                        } else {
                            toast.error('Payment Verification Failed');
                        }
                    } catch (verifyError) {
                        toast.error('Payment Verification Failed');
                        console.error('Verify error:', verifyError);
                    }
                } catch (error) {
                    console.warn('Checkout cancelled or error:', error);
                    toast.error('Payment Cancelled or Failed');
                    try {
                        await API.post('/wallet/cancel-payment', { order_id: orderId });
                        fetchHistory();
                    } catch (cancelError) {
                        console.error('Cancel API Error:', cancelError);
                    }
                }
            }
        } catch (error) {
            console.error('Recharge Initiation Failed:', error);
            toast.error('Failed to initiate recharge. Check network.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="pb-40 animate-in fade-in duration-500 px-4">
            {/* Minimal Sub-header with Back Button */}
            <div className="flex items-center gap-3.5 mb-5 pt-2">
                <button 
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/12 flex items-center justify-center text-white active:scale-90 transition-all shadow-sm"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-base font-extrabold text-white tracking-tight leading-none">Cosmic Wallet</h1>
                    <p className="text-[10px] text-violet-300 font-semibold tracking-wider uppercase mt-1">Recharge & Balance</p>
                </div>
            </div>

            {/* Apple Wallet Style Holographic Balance Card */}
            <div className="mt-1">
                <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-700 to-[#0e1138] p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-white/20">
                    {/* Top specular rim light */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                    
                    {/* Background glows */}
                    <div className="absolute top-[-30%] right-[-15%] w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-30%] left-[-15%] w-56 h-56 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className="text-violet-200/80 text-[10px] font-extrabold uppercase tracking-[0.2em] block mb-1">
                                Available Balance
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-amber-300">₹</span>
                                <h2 className="text-4xl font-black text-white tracking-tight leading-none">{user?.walletBalance || 0}</h2>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.12] backdrop-blur-xl border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                            <Wallet size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between relative z-10 mt-6 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                            <ShieldCheck size={13} className="text-emerald-300" />
                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Instant & Secured</span>
                        </div>
                        <span className="text-[10px] font-semibold text-violet-200/70">Way2Astro Credits</span>
                    </div>
                </div>
            </div>

            {/* Recharge Plans */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-3.5 px-1">
                    <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-[0.18em] flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" /> Select Recharge Pack
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {plans.map((plan) => (
                        <button
                            key={plan._id}
                            onClick={() => {
                                setSelectedPlan(plan._id);
                                setCustomAmount(plan.amount.toString());
                            }}
                            className={`relative p-4 rounded-[24px] border transition-all duration-200 text-left overflow-hidden active:scale-[0.98] ${
                                selectedPlan === plan._id
                                    ? 'border-amber-400/80 bg-amber-400/10 shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                                    : 'border-white/10 bg-white/[0.05] hover:bg-white/[0.08]'
                            }`}
                        >
                            {selectedPlan === plan._id && (
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                            )}
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-extrabold text-xl tracking-tight">₹{plan.amount}</h4>
                                    {plan.tag && (
                                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[9px] font-black text-black uppercase tracking-wider shadow-sm">
                                            {plan.tag}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className={`text-xs font-semibold ${selectedPlan === plan._id ? 'text-amber-300' : 'text-slate-400'}`}>
                                        {plan.label}
                                    </p>
                                    {plan.bonus > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                                            <Sparkles size={10} />
                                            +₹{plan.bonus}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div 
                    onClick={() => setSelectedPlan('custom')}
                    className={`mt-3 relative p-2.5 pl-4 rounded-full border transition-all duration-200 flex items-center justify-between ${
                        selectedPlan === 'custom' 
                            ? 'border-amber-400/80 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]' 
                            : 'border-white/10 bg-white/[0.05]'
                    }`}
                >
                    <div className="flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">Custom Recharge</span>
                        <div className="flex items-center mt-0.5">
                            <span className="text-lg font-bold text-amber-300 mr-1">₹</span>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => {
                                    setCustomAmount(e.target.value);
                                    setSelectedPlan('custom');
                                }}
                                placeholder="Enter custom amount"
                                className="bg-transparent text-base font-extrabold outline-none w-full text-white placeholder:text-slate-500 placeholder:text-xs placeholder:font-normal"
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRechargeClick();
                        }}
                        disabled={getRechargeAmount() <= 0 || processing}
                        className="h-11 px-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs tracking-wider shadow-[0_4px_16px_rgba(124,58,237,0.4)] flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processing ? '...' : 'Recharge'}
                    </button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={14} /> Recent Activity
                    </h3>
                    <button onClick={handleRefresh} disabled={loading} className="text-[10px] font-black text-electric-violet uppercase tracking-widest disabled:opacity-50">Refresh</button>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center text-slate-500 text-sm py-8">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-8">No transactions found.</div>
                    ) : (
                        history.map((tx) => (
                            <div 
                                key={tx._id} 
                                onClick={() => {
                                    if (tx.referenceId?.roomId) {
                                        if (tx.referenceId?.sessionType !== 'audio') {
                                            router.push(`/chat/room?id=${tx.referenceId.roomId}`);
                                        } else {
                                            setToastMessage("Audio call history cannot be replayed.");
                                            setTimeout(() => setToastMessage(''), 3000);
                                        }
                                    } else if (tx.status === 'pending' || tx.status === 'failed') {
                                        setCustomAmount(tx.amount.toString());
                                        setSelectedPlan('custom');
                                        setShowBreakdown(true);
                                    }
                                }}
                                className={`glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5 bg-white/5 ${(tx.referenceId?.roomId || tx.status === 'pending' || tx.status === 'failed') ? 'cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0 px-3">
                                        <h4 className="text-xs font-black text-white capitalize truncate">
                                            {tx.referenceId?.astrologerId?.displayName 
                                                ? `${tx.referenceId.sessionType || 'Session'} with ${user?.role === 'astrologer' ? maskUserName(tx.referenceId.userId?.name || tx.referenceId.userId?.displayName || 'User') : tx.referenceId.astrologerId.displayName}`
                                                : (tx.description || tx.type).replace(/for session .*/i, '').trim()}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                                            {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-sm font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.type === 'credit' ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* GST Breakdown Modal */}
            {showBreakdown && getRechargeAmount() > 0 && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-astro-dark border-t border-white/10 rounded-t-[2.5rem] p-6 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300 relative">
                        <button 
                            onClick={() => !processing && setShowBreakdown(false)}
                            disabled={processing}
                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/60 hover:bg-white/10 disabled:opacity-40"
                        >
                            <span className="sr-only">Close</span>
                            <Plus size={20} className="rotate-45" />
                        </button>
                        
                        <h3 className="text-xl font-black text-white mb-6">Payment Breakdown</h3>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <span className="text-sm font-bold text-slate-400">Recharge Amount</span>
                                <span className="text-lg font-black text-white">₹{getRechargeAmount().toFixed(2)}</span>
                            </div>
                            {getBonusAmount() > 0 && (
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <span className="text-sm font-bold text-slate-400">Bonus Perks Added</span>
                                    <span className="text-lg font-black text-emerald-400">+₹{getBonusAmount().toFixed(2)}</span>
                                </div>
                            )}
                            {gstConfig.enabled && (
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <span className="text-sm font-bold text-slate-400">GST ({gstConfig.percentage}%)</span>
                                    <span className="text-lg font-black text-white">₹{(getRechargeAmount() * (gstConfig.percentage / 100)).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-base font-black text-indigo-400 uppercase tracking-wider">Total Wallet Update</span>
                                <span className="text-2xl font-black text-indigo-400">₹{(getRechargeAmount() + getBonusAmount()).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmRecharge}
                            disabled={processing}
                            className="w-full h-14 rounded-[2rem] bg-gradient-to-r from-solar-gold to-orange-500 text-astro-navy font-black text-lg shadow-xl shadow-solar-gold/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-astro-navy border-t-transparent rounded-full animate-spin" />
                                    Opening Payment Gateway...
                                </span>
                            ) : (
                                `Proceed to Pay ₹${(getRechargeAmount() * (gstConfig.enabled ? (1 + gstConfig.percentage / 100) : 1)).toFixed(2)}`
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                        className="fixed top-1/2 left-1/2 z-50 px-6 py-4 bg-[#1e2337] border border-solar-gold/30 rounded-2xl shadow-2xl shadow-black flex items-center justify-center min-w-[280px]"
                    >
                        <span className="text-sm font-medium text-white text-center">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
