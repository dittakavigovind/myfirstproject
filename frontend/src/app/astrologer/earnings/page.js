'use client';
import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import StatsCards from '../../../components/earnings/StatsCards';
import EarningsGraph from '../../../components/earnings/EarningsGraph';
import SessionHistory from '../../../components/earnings/SessionHistory';
import { Loader2 } from 'lucide-react';

export default function EarningsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({ history: [], lifetime: {} });
    const [sessions, setSessions] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);

    const [range, setRange] = useState('month'); // week, month, all

    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutLoading, setPayoutLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [range]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel Fetch
            const [analyticsRes, sessionsRes] = await Promise.all([
                API.get(`/astro/earnings/analytics?range=${range}`),
                API.get(`/astro/earnings/sessions?limit=5`)
            ]);

            if (analyticsRes.data.success) {
                setAnalytics(analyticsRes.data.data);
                setWalletBalance(analyticsRes.data.data.walletBalance);
            }
            if (sessionsRes.data.success) {
                setSessions(sessionsRes.data.data);
            }

        } catch (error) {
            console.error("Failed to fetch earnings data", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayoutRequest = async () => {
        if (!payoutAmount || payoutAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        if (parseFloat(payoutAmount) > walletBalance) {
            alert("Insufficient wallet balance");
            return;
        }

        setPayoutLoading(true);
        try {
            const { data } = await API.post('/astro/earnings/payout', { amount: parseFloat(payoutAmount) });
            if (data.success) {
                alert("Payout requested successfully!");
                setShowPayoutModal(false);
                setPayoutAmount('');
                fetchData(); // Refresh balance
            }
        } catch (error) {
            alert(error.response?.data?.msg || "Payout request failed");
        } finally {
            setPayoutLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b border-slate-200 px-6 py-4 mb-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800">Earnings & Analytics</h1>
                    <div className="flex gap-4">
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="all">Lifetime</option>
                        </select>
                        <button
                            onClick={() => setShowPayoutModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                            Request Payout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6">

                {/* Key Metrics */}
                <StatsCards stats={analytics} walletBalance={walletBalance} />

                {/* Grid Layout for Graph and History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Graph Column */}
                    <div className="lg:col-span-3">
                        <EarningsGraph history={analytics.history} />
                    </div>

                    {/* Session List Column (Full Width for now, or split if needed) */}
                    <div className="lg:col-span-3">
                        <SessionHistory sessions={sessions} />
                    </div>
                </div>

            </main>

            {/* Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Request Payout</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Available Balance</label>
                                <div className="text-2xl font-bold text-green-600">₹{walletBalance.toFixed(2)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Amount to Withdraw</label>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPayoutModal(false)}
                                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayoutRequest}
                                disabled={payoutLoading}
                                className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                            >
                                {payoutLoading ? 'Processing...' : 'Confirm Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
