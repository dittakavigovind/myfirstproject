"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import API from '../../../../lib/api';
import { RefreshCw, Heart, Briefcase, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';

const MarriageCareerResult = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('marriage');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const date = searchParams.get('date');
                const time = searchParams.get('time');
                const lat = parseFloat(searchParams.get('lat'));
                const lng = parseFloat(searchParams.get('lng'));
                const tz = parseFloat(searchParams.get('tz'));
                const gender = searchParams.get('gender');

                if (!date || !time || isNaN(lat) || isNaN(lng)) {
                    setError("Invalid birth details. Please go back and try again.");
                    setLoading(false);
                    return;
                }

                const payload = {
                    date,
                    time,
                    lat,
                    lng,
                    timezone: isNaN(tz) ? 5.5 : tz,
                    gender
                };

                const res = await API.post('/astro/marriage-career', payload);
                setData(res.data.data);
            } catch (error) {
                console.error("Error fetching analysis:", error);
                setError(error.response?.data?.message || "Failed to generate analysis. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (searchParams.get('date')) {
            fetchData();
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">Analyzing your timeline...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Analysis Failed</h3>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const PredictionTable = ({ periods, type }) => (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dasha / Antar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Strength</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {periods.map((period, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {period.start} <span className="text-slate-400 mx-2">to</span> {period.end}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                                    {period.mahadasha}
                                </span>
                                <span className="mx-1 text-slate-400">/</span>
                                <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-100">
                                    {period.antardasha}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${period.strength === 'Very High' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {period.strength}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={period.reason}>
                                {period.reason}
                            </td>
                        </tr>
                    ))}
                    {periods.length === 0 && (
                        <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                No highly specific periods found in the near future.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Timeline Analysis</h1>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* User Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                            {searchParams.get('name') || "User"}'s Prediction
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {searchParams.get('date')} at {searchParams.get('time')} • {searchParams.get('city')}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                            7th Lord: <span className="font-medium text-slate-700">{data.meta.seventhLord}</span> •
                            10th Lord: <span className="font-medium text-slate-700">{data.meta.tenthLord}</span>
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab('marriage')}
                            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'marriage'
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Heart className="w-4 h-4 mr-2" />
                            Marriage Periods
                        </button>
                        <button
                            onClick={() => setActiveTab('career')}
                            className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'career'
                                ? 'bg-white text-purple-600 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Career Growth
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'marriage' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
                                <Heart className="w-5 h-5 text-pink-500 mr-2" />
                                Favorable Marriage Timelines
                            </h3>
                            <p className="text-slate-600 text-sm max-w-2xl">
                                These periods are calculated based on the influence of your 7th house lord and natural marriage significators (Venus/Jupiter). A "Very High" strength indicates multiple factors aligning.
                            </p>
                        </div>
                        <PredictionTable periods={data.marriage} type="marriage" />
                    </div>
                )}

                {activeTab === 'career' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
                                <Briefcase className="w-5 h-5 text-blue-500 mr-2" />
                                Career Rise Timelines
                            </h3>
                            <p className="text-slate-600 text-sm max-w-2xl">
                                These periods highlight professional growth, promotions, or job changes. They are based on the 10th house lord and career significators like Saturn and the Sun.
                            </p>
                        </div>
                        <PredictionTable periods={data.career} type="career" />
                    </div>
                )}

            </main>
        </div>
    );
};

export default MarriageCareerResult;
