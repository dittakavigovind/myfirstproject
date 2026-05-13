"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Wallet, Plus, ChevronRight,
    History, CreditCard, Sparkles, ShieldCheck,
    TrendingUp, ArrowUpRight, ArrowDownLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import API from "@/lib/api";

export default function WalletPage() {
    const router = useRouter();
    const { user, fetchProfile } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const plans = [
        { id: 1, amount: 100, bonus: 0, label: "Starter" },
        { id: 2, amount: 200, bonus: 20, label: "Popular", tag: "Hot" },
        { id: 3, amount: 500, bonus: 75, label: "Best Value", tag: "Recommended" },
        { id: 4, amount: 1000, bonus: 200, label: "Celestial" },
    ];

    useEffect(() => {
        fetchHistory();
        if (fetchProfile) fetchProfile();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await API.get('/wallet/transactions');
            if (res.data.success) {
                setHistory(res.data.transactions);
            }
        } catch (error) {
            console.error('Failed to fetch wallet history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async () => {
        if (!selectedPlan) return;
        setProcessing(true);
        const planToBuy = plans.find(p => p.id === selectedPlan);

        try {
            // Initiate Razorpay Order on Backend
            const res = await API.post('/wallet/recharge', { amount: planToBuy.amount });
            if (res.data.success) {
                const orderId = res.data.order.id;
                // For Native Mobile Apps, you would typically pass this orderId to a Razorpay Capacitor/Cordova Plugin here.
                // For now, we will alert to prove the API integration is physically connected to the node server.
                alert(`Razorpay Order Created: ${orderId}\nReady for Native Checkout Plugin Integration.`);
                
                // If using Web Checkout as fallback:
                // window.location.href = `https://your-checkout-url.com?order_id=${orderId}`;
            }
        } catch (error) {
            console.error('Recharge Initiation Failed:', error);
            alert('Failed to initiate recharge. Check network.');
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
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative glass-panel p-5 rounded-[2rem] border-white/5 cursor-pointer transition-all duration-300 ${selectedPlan === plan.id ? 'ring-2 ring-solar-gold bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            {plan.tag && (
                                <div className="absolute top-4 right-4 bg-solar-gold text-[8px] font-black text-astro-navy px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    {plan.tag}
                                </div>
                            )}
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">{plan.label}</p>
                            <h4 className="text-xl font-black text-white mb-2">₹{plan.amount}</h4>
                            {plan.bonus > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Sparkles size={10} className="text-solar-gold" />
                                    <span className="text-[10px] font-black text-solar-gold uppercase">+₹{plan.bonus} Extra</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={14} /> Recent Activity
                    </h3>
                    <button onClick={fetchHistory} className="text-[10px] font-black text-electric-violet uppercase tracking-widest">Refresh</button>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center text-slate-500 text-sm py-8">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-8">No transactions found.</div>
                    ) : (
                        history.map((tx) => (
                            <div key={tx._id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border-white/5 bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white capitalize">{tx.description || tx.type}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(tx.createdAt).toLocaleString()}</p>
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

            {/* Bottom Button - Positioned above Bottom Nav */}
            <div className="fixed bottom-24 left-0 right-0 px-4 pointer-events-none">
                <button
                    disabled={!selectedPlan || processing}
                    onClick={handleRecharge}
                    className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white font-black text-lg shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 pointer-events-auto"
                >
                    <CreditCard size={20} />
                    {processing ? 'Processing...' : 'Confirm Recharge'}
                </button>
            </div>
        </div>
    );
}
