"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useBirthDetails } from '../../context/BirthDetailsContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import API from '../../lib/api';
import toast from 'react-hot-toast';
import LocationSearch from '../../components/LocationSearch';
import DatePicker from "react-datepicker";
import CustomDateInput from '../../components/common/CustomDateInput';

import TimeInput from '../../components/TimeInput';
import "react-datepicker/dist/react-datepicker.css";
import { Download, Heart, ShieldCheck, Info, Sparkles, ArrowLeft, User, Star, Users, BarChart, Activity, Briefcase, Smile } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import HeroSection from '../../components/common/HeroSection';

export default function MatchMakingPage() {
    const { birthDetails, isInitialized } = useBirthDetails();
    const { user } = useAuth();
    const router = useRouter();

    // State now stores Date objects for 'date' and 'time'
    const [boy, setBoy] = useState({ name: '', date: null, time: new Date(new Date().setHours(0, 0, 0, 0)), location: '', lat: '', lng: '', timezone: 5.5 });
    const [girl, setGirl] = useState({ name: '', date: null, time: new Date(new Date().setHours(0, 0, 0, 0)), location: '', lat: '', lng: '', timezone: 5.5 });

    const PromotionCard = () => (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                        <Sparkles size={20} className="text-astro-yellow" />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-sm">New Feature</h3>
                </div>
                <h2 className="text-xl font-black mb-2">Zodiac Compatibility</h2>
                <p className="text-indigo-100/80 text-xs font-medium leading-relaxed mb-6">
                    Don't have birth details? Check compatibility using only zodiac signs for deep insights into your love life.
                </p>
                <Link
                    href="/matchmaking/zodiac-compatibility"
                    className="inline-flex items-center gap-2 bg-astro-yellow text-astro-navy px-6 py-2 rounded-full font-black text-xs hover:scale-105 transition-all shadow-lg shadow-black/20"
                >
                    Try Now <ArrowLeft className="rotate-180" size={14} />
                </Link>
            </div>
        </div>
    );

    // Pre-fill based on context
    useEffect(() => {
        if (isInitialized && birthDetails && birthDetails.gender) {
            const details = {
                date: birthDetails.date ? new Date(birthDetails.date) : null,
                time: birthDetails.time ? (() => {
                    const d = new Date();
                    if (typeof birthDetails.time === 'string') {
                        const [h, m] = birthDetails.time.split(':');
                        d.setHours(h || 0, m || 0, 0, 0);
                    } else if (birthDetails.time instanceof Date) {
                        d.setHours(birthDetails.time.getHours(), birthDetails.time.getMinutes(), 0, 0);
                    }
                    return d;
                })() : new Date(new Date().setHours(0, 0, 0, 0)),
                location: birthDetails.place || '',
                lat: birthDetails.lat || '',
                lng: birthDetails.lng || '',
                timezone: birthDetails.timezone || 5.5
            };

            if (birthDetails.gender.toLowerCase() === 'male') {
                setBoy(prev => ({ ...prev, ...details }));
            } else if (birthDetails.gender.toLowerCase() === 'female') {
                setGirl(prev => ({ ...prev, ...details }));
            }
        }
    }, [isInitialized, birthDetails]);

    // Hydrate state from sessionStorage if returning from login
    useEffect(() => {
        const pending = sessionStorage.getItem('pendingMatchmaking');
        if (pending) {
            try {
                const data = JSON.parse(pending);
                if (data.boy) {
                    setBoy({
                        ...data.boy,
                        date: data.boy.date ? new Date(data.boy.date) : null,
                        time: data.boy.time ? new Date(data.boy.time) : new Date(new Date().setHours(0, 0, 0, 0))
                    });
                }
                if (data.girl) {
                    setGirl({
                        ...data.girl,
                        date: data.girl.date ? new Date(data.girl.date) : null,
                        time: data.girl.time ? new Date(data.girl.time) : new Date(new Date().setHours(0, 0, 0, 0))
                    });
                }
                if (data.result) {
                    setResult(data.result);
                }
            } catch (e) {
                console.error('Failed to parse pending matchmaking data', e);
            }
        }
    }, []);

    // Auto-trigger checkout if returning from login
    useEffect(() => {
        if (user && isInitialized) {
            const shouldTrigger = sessionStorage.getItem('triggerCheckout');
            if (shouldTrigger === 'true') {
                sessionStorage.removeItem('triggerCheckout');
                sessionStorage.removeItem('pendingMatchmaking'); // Clean up
                
                // Wait for the resultRef DOM to settle after hydration
                setTimeout(() => {
                    const btn = document.getElementById('download-pdf-btn');
                    if (btn) btn.click();
                }, 1500); // Give it 1.5s to fully render the results before taking the screenshot/payment
            }
        }
    }, [user, isInitialized]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const resultRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleDownload = async () => {
        if (!resultRef.current) return;

        if (!user) {
            toast.error('Please login to download the premium report');
            
            // Persist current state before redirecting
            sessionStorage.setItem('pendingMatchmaking', JSON.stringify({
                boy,
                girl,
                result
            }));
            sessionStorage.setItem('triggerCheckout', 'true');
            
            router.push('/login?redirect=/matchmaking');
            return;
        }

        const coupleId = btoa(encodeURIComponent(`${boy.name}-${boy.date}-${girl.name}-${girl.date}`));

        try {
            // Check if already paid
            const statusRes = await API.get(`/matchmaking/check-status/${encodeURIComponent(coupleId)}`);
            if (!statusRes.data.isPaid) {
                // Not paid, trigger Razorpay
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                // Create Order
                const { data: order } = await API.post('/matchmaking/create-order', { coupleId });

                const options = {
                    key: order.key_id, // Fetching securely from backend response
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Way2Astro',
                    description: 'Premium Matchmaking Report',
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            setIsDownloading(true);
                            await API.post('/matchmaking/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            toast.success('Payment successful! Generating PDF...');
                            generatePDF();
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            toast.error('Payment verification failed');
                            setIsDownloading(false);
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.mobileNumber
                    },
                    theme: {
                        color: '#6366f1' // Indigo
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    toast.error('Payment failed: ' + response.error.description);
                });
                rzp.open();
                return; // Stop here, wait for payment success
            }
            
            // Already paid, generate PDF directly
            generatePDF();
        } catch (error) {
            console.error('Error during checkout flow:', error);
            toast.error('Failed to process download request');
        }
    };

    const generatePDF = async () => {
        setIsDownloading(true);
        try {
            // Wait a moment for any animations to finish
            await new Promise(r => setTimeout(r, 1000));

            const canvas = await toPng(resultRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                style: {
                    borderRadius: '0',
                    width: '1000px', // Force width for consistent layout in PDF
                    margin: '0',
                }
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let currentY = margin;

            // Function to add watermark
            const addWatermark = (p) => {
                p.saveGraphicsState();
                p.setGState(new p.GState({ opacity: 0.04 }));
                p.setFontSize(25);
                p.setTextColor(100);
                p.setFont("helvetica", "bold");
                for (let y = 20; y < pageHeight; y += 70) {
                    p.text("way2astro.com", margin, y, { align: 'left', angle: 25 });
                    p.text("way2astro.com", pageWidth / 2, y, { align: 'center', angle: 25 });
                    p.text("way2astro.com", pageWidth - margin, y, { align: 'right', angle: 25 });
                }
                p.restoreGraphicsState();
            };

            const addFooter = (p, pageNum) => {
                p.setFontSize(8);
                p.setTextColor(150);
                p.text(`Page ${pageNum} - way2astro.com`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            };

            // First page setup
            let pageNum = 1;
            const sections = resultRef.current.querySelectorAll('[data-pdf-section]');

            // Wait for all elements/fonts to stabilize
            await new Promise(resolve => setTimeout(resolve, 800));

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const canvas = await toPng(section, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 3,
                    style: {
                        margin: '0',
                    }
                });

                const imgProps = pdf.getImageProperties(canvas);
                const sectionHeight = (imgProps.height * contentWidth) / imgProps.width;

                if (currentY + sectionHeight > (pageHeight - margin)) {
                    pdf.addPage();
                    pageNum++;
                    currentY = margin;
                }

                pdf.addImage(canvas, 'PNG', margin, currentY, contentWidth, sectionHeight, undefined, 'FAST');
                currentY += sectionHeight + 5; // Reduced gap for a tighter A4 layout
            }

            // Final Pass: Top Layer Watermark and Footer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let j = 1; j <= totalPages; j++) {
                pdf.setPage(j);
                addWatermark(pdf);
                addFooter(pdf, j);
            }

            pdf.save(`Matchmaking_Report_${boy.name || 'Boy'}_${girl.name || 'Girl'}.pdf`);
            toast.success('Report downloaded successfully!');
        } catch (err) {
            console.error('Download failed', err);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBoyLoc = (loc) => setBoy({ ...boy, location: loc.formattedAddress, lat: loc.lat, lng: loc.lng, timezone: loc.timezone || 5.5 });
    const handleGirlLoc = (loc) => setGirl({ ...girl, location: loc.formattedAddress, lat: loc.lat, lng: loc.lng, timezone: loc.timezone || 5.5 });

    const fetchMatch = async () => {
        if (!boy.date || !boy.time || !boy.lat || !girl.date || !girl.time || !girl.lat) {
            alert('Please enter all details for both Boy and Girl');
            return;
        }

        setLoading(true);
        try {
            // Format dates/times to strings (YYYY-MM-DD, HH:MM)
            const boyPayload = {
                ...boy,
                date: boy.date.toLocaleDateString('en-CA'),
                time: boy.time instanceof Date ? boy.time.toTimeString().slice(0, 5) : boy.time
            };
            const girlPayload = {
                ...girl,
                date: girl.date.toLocaleDateString('en-CA'),
                time: girl.time instanceof Date ? girl.time.toTimeString().slice(0, 5) : girl.time
            };

            const res = await API.post('/astro/match', { boy: boyPayload, girl: girlPayload });
            if (res.data.success) {
                setResult(res.data.data);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to calculate match');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <HeroSection
                title="Kundli"
                highlightText="Matching"
                subtitle="Check complete Ashtakoot Guna Milan compatibility between prospective partners."
                icon="❤️"
                align="center"
            />

            <div className="p-4 max-w-4xl mx-auto space-y-6">

                {/* Promotional Banner */}
                <PromotionCard />

                {/* Input Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Boy */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <h2 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            👨 Boy's Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Boy's Name"
                                    value={boy.name}
                                    onChange={(e) => setBoy({ ...boy, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                                <DatePicker customInput={<CustomDateInput placeholder='dd/mm/yyyy' Icon={Heart} iconColor="text-blue-500" />} selected={boy.date} onChange={date => setBoy({ ...boy, date })} dateFormat="dd/MM/yyyy" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium" wrapperClassName="w-full" showMonthDropdown showYearDropdown dropdownMode="select" portalId="root-portal" popperClassName="!z-[100]" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time of Birth</label>
                                <TimeInput
                                    value={boy.time}
                                    onChange={time => setBoy({ ...boy, time })}
                                    className="h-[50px]"
                                />
                            </div>

                            <div className="[&_input]:py-3 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-xl">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Place of Birth</label>
                                <LocationSearch onLocationSelect={handleBoyLoc} placeholder={"City"} darkMode={false} defaultValue={boy.place} />
                            </div>
                        </div>
                    </div>

                    {/* Girl */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100">
                        <h2 className="font-bold text-pink-800 mb-4 flex items-center gap-2">
                            👩 Girl's Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Girl's Name"
                                    value={girl.name}
                                    onChange={(e) => setGirl({ ...girl, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-pink-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                                <DatePicker customInput={<CustomDateInput placeholder='dd/mm/yyyy' Icon={Heart} iconColor="text-pink-500" />} selected={girl.date} onChange={date => setGirl({ ...girl, date })} dateFormat="dd/MM/yyyy" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-pink-500 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-300 font-medium" wrapperClassName="w-full" showMonthDropdown showYearDropdown dropdownMode="select" portalId="root-portal" popperClassName="!z-[100]" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time of Birth</label>
                                <TimeInput
                                    value={girl.time}
                                    onChange={time => setGirl({ ...girl, time })}
                                    className="h-[50px]"
                                />
                            </div>

                            <div className="[&_input]:py-3 [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-xl">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Place of Birth</label>
                                <LocationSearch onLocationSelect={handleGirlLoc} placeholder={"City"} darkMode={false} defaultValue={girl.place} />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchMatch}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:brightness-110 active:scale-95 transition-all transform"
                >
                    {loading ? 'Calculating Matches...' : 'Check Compatibility ❤️'}
                </button>

                {/* Results */}
                {result && (
                    <div ref={resultRef} className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        {/* PDF BRANDING HEADER */}
                        <div data-pdf-section="branding" className="px-2 pb-8 flex items-center justify-between border-b border-gray-100 mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                    <Heart className="fill-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">Way2Astro</h2>
                                    <p className="text-xs text-rose-600 font-black tracking-[0.2em] uppercase mt-1 flex items-center gap-2">
                                        Horoscope Matching
                                        <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[8px] tracking-normal font-black">PREMIUM</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Compatibility Analysis</p>
                                <p className="text-sm font-black text-slate-900">{boy.name || 'Boy'} & {girl.name || 'Girl'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-50 pb-6">
                            <div data-pdf-section="summary" className="text-left w-full">
                                <h2 className="text-3xl font-black text-slate-800">
                                    Compatibility Report
                                </h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Ashtakoot Guna Milan Result</p>
                            </div>
                            <div className="print:hidden">
                                <button
                                    id="download-pdf-btn"
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex items-center gap-2 py-2 px-6 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-xs font-black hover:scale-105 transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isDownloading ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <ShieldCheck className="w-4 h-4" />
                                    )}
                                    {isDownloading ? 'Architecting...' : 'Unlock Premium PDF (₹99)'}
                                </button>
                            </div>
                        </div>

                        {/* Birth Details Section for PDF */}
                        <div data-pdf-section="birth-details" className="mb-10">
                            <BirthDetailsTable boy={boy} girl={girl} result={result} />
                        </div>

                        <div data-pdf-section="total-score" className="text-center pb-10">
                            <h2 className="text-slate-500 font-black uppercase tracking-widest text-xs mb-3">Total Matching Score</h2>
                            <div className={`text-6xl font-black ${result.score.total >= 18 ? 'text-green-500' : 'text-rose-500'} flex items-center justify-center gap-2`}>
                                {result.score.total.toFixed(1)}
                                <span className="text-2xl text-gray-300 font-bold">/ 36</span>
                            </div>
                            <div className={`mt-4 inline-flex items-center gap-2 py-2 px-6 rounded-full font-bold text-sm ${result.score.total >= 18 ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                {result.score.total >= 18 ? '✅ Favorable Compatibility' : '⚠️ Low Compatibility'}
                            </div>
                        </div>

                        <div data-pdf-section="score-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <ScoreCard label="Varna" score={result.score.details.varna} max="1" desc="Professional Tendencies" />
                            <ScoreCard label="Vashya" score={result.score.details.vashya} max="2" desc="Mutual Control" />
                            <ScoreCard label="Tara" score={result.score.details.tara} max="3" desc="Destiny & Health" />
                            <ScoreCard label="Yoni" score={result.score.details.yoni} max="4" desc="Intimacy" />
                            <ScoreCard label="Maitri" score={result.score.details.maitri} max="5" desc="Friendship" />
                            <ScoreCard label="Gana" score={result.score.details.gana} max="6" desc="Temperament" />
                            <ScoreCard label="Bhakoot" score={result.score.details.bhakoot} max="7" desc="Progeny & Health" />
                            <ScoreCard label="Nadi" score={result.score.details.nadi} max="8" desc="Physique & Family" />
                        </div>

                        {/* Detailed Attribute Table */}
                        <div data-pdf-section="detailed-table">
                            <DetailedMatchTable result={result} />
                        </div>

                        <div data-pdf-section="advice" className="mt-10 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-indigo-900 font-black text-sm mb-1">Expert Advice</h4>
                                <p className="text-indigo-800/80 text-xs font-medium leading-relaxed">
                                    Guna Milan is a primary step. For a complete understanding, Manglik Dosha and planetary strengths in both charts should also be analyzed by an expert.
                                </p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div data-pdf-section="disclaimer" className="mt-10 pt-8 pb-12 border-t border-slate-100 text-center opacity-80">
                            <p className="text-[11px] text-slate-600 font-black leading-relaxed uppercase tracking-widest mb-3">Disclaimer</p>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                This report is purely based on classical Vedic Astrology observations. The results found in this report are for only educational purposes; these may change from context to person. No predictions or results should be taken as absolute truths or final commands for your life decisions. The predictions or results made in the report are not individual advice and should not be substituted for professional medical, legal, financial, or other expert advice. By using this software or the services of <a href="/" className="text-rose-600 hover:text-rose-700 font-bold decoration-none border-b border-rose-200">Way2Astro</a>, you agree to hold Way2Astro and its associates harmless from any liability arising out of the use of this report.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {isDownloading && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-white text-center">
                    <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-black mb-2">Architecting Full Report</h2>
                    <p className="text-rose-200 animate-pulse font-bold tracking-widest uppercase text-xs">Generating Premium PDF</p>
                </div>
            )}
        </div>
    );
}

function DetailedMatchTable({ result }) {
    const categories = [
        { key: 'varna', label: 'Varna', icon: <User size={18} className="text-indigo-500" />, max: 1 },
        { key: 'vashya', label: 'Vashya', icon: <Briefcase size={18} className="text-blue-500" />, max: 2 },
        { key: 'tara', label: 'Tara', icon: <Star size={18} className="text-amber-500" />, max: 3 },
        { key: 'yoni', label: 'Yoni', icon: <Heart size={18} className="text-rose-500" />, max: 4 },
        { key: 'maitri', label: 'Maitri', icon: <Smile size={18} className="text-emerald-500" />, max: 5 },
        { key: 'gana', label: 'Gana', icon: <Users size={18} className="text-purple-500" />, max: 6 },
        { key: 'bhakoot', label: 'Bhakoot', icon: <BarChart size={18} className="text-orange-500" />, max: 7 },
        { key: 'nadi', label: 'Nadi', icon: <Activity size={18} className="text-cyan-500" />, max: 8 },
    ];

    return (
        <div className="mt-12 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 px-2">
                <Sparkles className="text-rose-500" size={20} />
                Detailed Attribute Analysis
            </h3>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest w-[30%]">Attribute</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center w-[25%]">Boy</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center w-[25%]">Girl</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-center w-[20%]">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map((cat) => (
                            <tr key={cat.key} className="hover:bg-white transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 text-[11px] uppercase tracking-tight">{cat.label}</div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase">Max {cat.max} Points</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black whitespace-nowrap">
                                        {result.boy[cat.key] || '-'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className="inline-block px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-[10px] font-black whitespace-nowrap">
                                        {result.girl[cat.key] || '-'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className={`font-black text-xs ${result.score.details[cat.key] === cat.max ? 'text-green-600' : (result.score.details[cat.key] === 0 ? 'text-rose-500' : 'text-amber-600')}`}>
                                        {result.score.details[cat.key]} / {cat.max}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BirthDetailsTable({ boy, girl, result }) {
    const details = [
        { label: 'Name', boy: boy.name || 'Boy', girl: girl.name || 'Girl' },
        { label: 'Date', boy: boy.date?.toLocaleDateString('en-GB') || '-', girl: girl.date?.toLocaleDateString('en-GB') || '-' },
        { label: 'Time', boy: boy.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-', girl: girl.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-' },
        { label: 'Place', boy: boy.location?.split(',')[0] || '-', girl: girl.location?.split(',')[0] || '-' },
        { label: 'Nakshatra', boy: result.boy.tara || '-', girl: result.girl.tara || '-' },
        { label: 'Rasi', boy: result.boy.bhakoot || '-', girl: result.girl.bhakoot || '-' },
    ];

    return (
        <div className="mt-8 overflow-hidden">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 px-2">
                <Info className="text-blue-500" size={20} />
                Birth Details of Boy and Girl
            </h3>
            <div className="rounded-3xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Field</th>
                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-blue-600">Boy</th>
                            <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-pink-600">Girl</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {details.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-tight">{row.label}</td>
                                <td className="py-3 px-6 text-[11px] font-bold text-slate-700">{row.boy}</td>
                                <td className="py-3 px-6 text-[11px] font-bold text-slate-700">{row.girl}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ScoreCard({ label, score, max, desc }) {
    return (
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all duration-300">
            <div className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className="font-black text-2xl text-slate-800">
                {score}
                <span className="text-gray-300 text-xs ml-1">/ {max}</span>
            </div>
            <div className="mt-2 text-[9px] font-bold text-indigo-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                {desc}
            </div>
        </div>
    );
}
