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
        fetchHistory();
        fetchPlans();
        if (checkUser) checkUser();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await API.get('/wallet/plans');
            if (res.data.success) {
                setPlans(res.data.data);
                if (res.data.gst) setGstConfig(res.data.gst);
            }
        } catch (error) {
            console.error('Failed to fetch wallet plans:', error);
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
            console.error('Failed to fetch wallet history:', error);
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
        const amount = getRechargeAmount();
        if (amount <= 0) return;
        setShowBreakdown(true);
    };

    const handleConfirmRecharge = async () => {
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
                
                const options = {
                    key: res.data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: (amount * 100).toString(),
                    currency: 'INR',
                    name: 'Way2Astro',
                    description: 'Wallet Recharge',
                    order_id: orderId,
                    theme: { color: '#6b21a8' }
                };

                try {
                    const paymentResponse = await Checkout.open(options);
                    
                    try {
                        const verifyRes = await API.post('/wallet/verify-payment', {
                            ...(paymentResponse.response || paymentResponse), // fallback in case it's directly returned
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
            <div className="flex items-center gap-4 mb-6 pt-2">
                <button 
                    onClick={() => router.back()}
                    className="p-2 bg-white/5 rounded-full text-white/60 hover:bg-white/10 active:scale-95 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm font-black text-white uppercase tracking-widest">My Wallet</h1>
            </div>

            {/* Balance Card */}
            <div className="mt-2">
                <div className="relative h-48 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-electric-violet p-8 flex flex-col justify-between shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-indigo-100/60 text-xs font-black uppercase tracking-widest mb-1">Total Balance</p>
                            <h2 className="text-4xl font-black text-white">₹{user?.walletBalance || 0}</h2>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-white">
                            <Wallet size={24} />
                        </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                            <TrendingUp size={12} className="text-emerald-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Safe & Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recharge Plans */}
            <div className="mt-10">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1 flex items-center gap-2">
                    <Plus size={14} className="text-solar-gold" /> Recharge Credits
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {plans.map((plan) => (
                        <button
                            key={plan._id}
                            onClick={() => {
                                setSelectedPlan(plan._id);
                                setCustomAmount(plan.amount.toString());
                            }}
                            className={`relative p-4 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden ${
                                selectedPlan === plan._id
                                    ? 'border-solar-gold bg-solar-gold/10 scale-[1.02] shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            {selectedPlan === plan._id && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-solar-gold/20 to-transparent" />
                            )}
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-black text-xl">₹{plan.amount}</h4>
                                    {plan.tag && (
                                        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-solar-gold to-amber-500 text-[10px] font-black text-black uppercase tracking-widest shadow-lg shadow-solar-gold/20">
                                            {plan.tag}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className={`text-sm font-bold ${selectedPlan === plan._id ? 'text-solar-gold' : 'text-slate-400'}`}>
                                        {plan.label}
                                    </p>
                                    {plan.bonus > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                                            <Sparkles size={12} />
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
                    className={`mt-3 relative glass-panel p-3 pl-5 rounded-[2.5rem] border-white/5 cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedPlan === 'custom' ? 'ring-2 ring-solar-gold bg-solar-gold/10' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    <div className="flex-1">
                        <p className={`text-[10px] font-bold uppercase tracking-tighter mb-1 ${selectedPlan === 'custom' ? 'text-solar-gold/80' : 'text-slate-500'}`}>Custom Amount</p>
                        <div className="flex items-center">
                            <span className={`text-xl font-black mr-1 ${selectedPlan === 'custom' ? 'text-solar-gold' : 'text-white'}`}>₹</span>
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => {
                                    setCustomAmount(e.target.value);
                                    setSelectedPlan('custom');
                                }}
                                placeholder="Enter amount"
                                className={`bg-transparent text-xl font-black outline-none w-full placeholder:text-white/20 ${selectedPlan === 'custom' ? 'text-solar-gold' : 'text-white'}`}
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRechargeClick();
                        }}
                        disabled={getRechargeAmount() <= 0 || processing}
                        className="h-12 px-8 rounded-full bg-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {processing ? '...' : 'Pay'}
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
                            onClick={() => setShowBreakdown(false)}
                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/60 hover:bg-white/10"
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
                            className="w-full h-14 rounded-[2rem] bg-gradient-to-r from-solar-gold to-orange-500 text-astro-navy font-black text-lg shadow-xl shadow-solar-gold/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                        >
                            Proceed to Pay ₹{(getRechargeAmount() * (gstConfig.enabled ? (1 + gstConfig.percentage / 100) : 1)).toFixed(2)}
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
