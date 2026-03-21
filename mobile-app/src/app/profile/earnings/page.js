"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Wallet, Info, ChevronRight, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CosmicCard from "@/components/CosmicCard";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function EarningsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        total: user?.walletBalance || 0,
        withdrawn: 0,
    });
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleRequestPayout = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount < 500) {
            setMessage({ type: "error", text: "Minimum withdrawal amount is ₹500" });
            return;
        }
        if (amount > stats.total) {
            setMessage({ type: "error", text: "Insufficient balance" });
            return;
        }

        setLoading(true);
        try {
            // Future API call: await api.post('/payouts/request', { amount });
            setMessage({ type: "success", text: "Payout request submitted successfully!" });
            setWithdrawAmount("");
        } catch (err) {
            setMessage({ type: "error", text: "Failed to submit request. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cosmic-indigo pb-20 p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 text-white">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-white uppercase tracking-widest">Earnings</h1>
            </div>

            {/* Total Earnings Card */}
            <CosmicCard className="bg-gradient-to-tr from-cosmic-indigo to-electric-violet/20 border-white/10 p-6 mb-6">
                <p className="text-slate-400 text-sm font-medium mb-2">Total balance</p>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">₹{stats.total.toLocaleString()}</span>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <Info size={18} className="text-orange-400 mt-0.5" />
                    <p className="text-xs font-medium text-orange-200/80 leading-relaxed">
                        Balance should be at least ₹500 to request payout
                    </p>
                </div>
            </CosmicCard>

            {/* Withdraw Amount Input */}
            <div className="mb-6 space-y-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Enter Amount to Withdraw</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-xl">₹</span>
                    <input 
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setWithdrawAmount(val);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white font-bold text-xl focus:outline-none focus:ring-2 focus:ring-solar-gold/50 transition-all placeholder:text-slate-600"
                        placeholder="0.00"
                        inputMode="numeric"
                    />
                </div>
                {message.text && (
                    <p className={`text-xs font-bold ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                        {message.text}
                    </p>
                )}
            </div>

            {/* Payout Button */}
            <button 
                onClick={handleRequestPayout}
                disabled={loading || stats.total < 500}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                    stats.total >= 500 
                    ? 'bg-solar-gold text-cosmic-indigo shadow-solar-gold/20' 
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
            >
                {loading ? "Processing..." : "Request payout"}
            </button>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 italic">For any queries please contact</p>
                <a href="mailto:support@way2astro.com" className="text-xs text-solar-gold font-bold">support@way2astro.com</a>
            </div>
        </div>
    );
}
