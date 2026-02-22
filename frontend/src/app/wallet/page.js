'use client';

import { useState, useEffect } from 'react';
import { getWalletBalance, addMoney, getTransactions, verifyPayment } from '../../services/walletService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchWalletData();
        }
    }, [user, authLoading]);

    const fetchWalletData = async () => {
        try {
            const [balanceData, transactionsData] = await Promise.all([
                getWalletBalance(),
                getTransactions(1, 10) // Initial page
            ]);

            if (balanceData.success) {
                setBalance(balanceData.balance);
            }
            if (transactionsData.success) {
                setTransactions(transactionsData.transactions);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setProcessing(true);
        try {
            // 1. Create Order on Backend
            const orderData = await addMoney(amount);

            if (!orderData.success) {
                toast.error(orderData.message || 'Failed to create order');
                setProcessing(false);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100, // Amount in paise
                currency: orderData.currency,
                name: "Way2Astro",
                description: "Wallet Recharge",
                image: "/logo.png", // Ensure logo exists in public folder
                order_id: orderData.order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: orderData.amount
                        });

                        if (verifyRes.success) {
                            toast.success('Payment Successful! Wallet updated.');
                            setBalance(verifyRes.balance);
                            setAmount('');
                            // Refresh transactions
                            const txRes = await getTransactions(1, 10);
                            if (txRes.success) setTransactions(txRes.transactions);
                        } else {
                            toast.error(verifyRes.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Verification Error:', error);
                        toast.error('Payment verification failed');
                    } finally {
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: {
                    color: "#6b21a8" // Purple-700
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(response.error.description || 'Payment Failed');
                setProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Add Money Error:', error);
            toast.error('Something went wrong initializing payment');
            setProcessing(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                    <p className="mt-2 text-gray-600">Manage your balance and transactions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Balance Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-gray-500 font-medium mb-2">Available Balance</h2>
                            <p className="text-4xl font-bold text-gray-900">₹ {balance.toFixed(2)}</p>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Money to Wallet</h3>
                            <form onSubmit={handleAddMoney} className="flex gap-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                                        min="1"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200"
                                >
                                    {processing ? 'Processing...' : 'Add Money'}
                                </button>
                            </form>
                            <p className="text-xs text-gray-400 mt-3">
                                Secure payments via Razorpay
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats or Promo (Optional placeholder) */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-4">Why recharge?</h3>
                        <ul className="space-y-3 text-indigo-100">
                            <li className="flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-full">✓</span>
                                Instant Talk to Astrologer
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-full">✓</span>
                                Download Detailed Reports
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-full">✓</span>
                                Book Special Pujas
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-full">✓</span>
                                Get Exclusive Offers
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Transactions History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Description</th>
                                        <th className="px-6 py-4 font-semibold">Type</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {(() => {
                                                    const d = new Date(tx.createdAt);
                                                    const day = String(d.getDate()).padStart(2, '0');
                                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                                    const year = d.getFullYear();
                                                    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                                    return `${day}-${month}-${year}, ${time}`;
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                                {tx.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {tx.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-800' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
}
