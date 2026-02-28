'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Home, Calendar } from 'lucide-react';
import Link from 'next/link';

const StatusContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const status = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');

    const isSuccess = status === 'success';

    return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 border border-gray-50 animate-in fade-in zoom-in duration-500">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? (
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    ) : (
                        <XCircle className="w-12 h-12 text-red-500" />
                    )}
                </div>

                <h1 className="text-3xl font-black text-astro-navy mb-4">
                    {isSuccess ? 'Divine Booking Confirmed!' : 'Payment Failed'}
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {isSuccess
                        ? `Your seva has been successfully scheduled. You will receive a confirmation email shortly with the details.`
                        : 'Something went wrong while processing your payment. Please try again or contact support if the issue persists.'}
                </p>

                {bookingId && (
                    <div className="bg-astro-light rounded-2xl p-6 mb-10 border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Booking ID</span>
                        <span className="text-xl font-black text-astro-navy">{bookingId}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <Link
                        href="/online-pooja"
                        className={`inline-flex items-center justify-center w-full py-4 rounded-2xl font-black transition-all duration-300 shadow-lg ${isSuccess ? 'bg-astro-navy text-white hover:bg-astro-yellow hover:text-astro-navy' : 'bg-astro-navy text-white hover:bg-gray-800'}`}
                    >
                        {isSuccess ? 'Explore More Sevas' : 'Try Again'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-full py-4 rounded-2xl font-bold text-gray-500 hover:text-astro-navy transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {isSuccess && (
                <div className="mt-12 text-gray-500 text-sm animate-in slide-in-from-bottom duration-700">
                    <p>May the blessings of the divine be with you always.</p>
                </div>
            )}
        </div>
    );
};

const PaymentStatus = () => {
    return (
        <div className="bg-astro-light min-h-screen">
            <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astro-navy"></div>
                </div>
            }>
                <StatusContent />
            </Suspense>
        </div>
    );
};

export default PaymentStatus;
