import { Suspense } from 'react';
import SignClient from '../../../components/horoscope/SignClient';

export default function HoroscopeDetailWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div></div>}>
            <HoroscopeDetail />
        </Suspense>
    );
}

function HoroscopeDetail() {
    return <SignClient />;
}
