'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05070a] text-white">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-400">Something went wrong!</h2>
                <p className="text-white/60">{error.message || "An unexpected error occurred."}</p>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
