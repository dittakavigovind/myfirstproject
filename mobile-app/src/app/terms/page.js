"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
    return (
        <main className="min-h-screen bg-[#0b1026] text-slate-300 pb-24">
            <div className="flex items-center gap-4 px-5 z-50 relative sticky top-0 bg-[#0b1026] py-4 border-b border-white/5">
                <button 
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white m-0">Terms & Conditions</h3>
            </div>
            
            <div className="px-5 py-6 text-sm text-justify leading-relaxed">
                <p className="mb-6 text-slate-400">Last Updated: June 16, 2026</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Introduction</h3>
                <p className="mb-4">This Website and Mobile Application, Way2Astro (“Platform”, “App”, “we”, “us”, “our”, or “Company”) is owned and operated by Go Digital Media and Solutions. These Terms and Conditions (“Agreement”) govern your access to and use of our platform through which astrology consultations, horoscope services, Kundli reports, spiritual advisory services, and related services (“Services”) are made available.</p>
                <p className="mb-4">By accessing or using the Platform, you agree to be legally bound by this Agreement. If you do not agree to any part of these Terms, you must not use the Platform.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">2. Important Health & Safety Notice</h3>
                <p className="mb-4">If you are thinking about harming yourself or others, or if you are experiencing a medical or mental health emergency, you must immediately contact local police, emergency services, or a suicide prevention helpline. Way2Astro is not a suicide prevention service, mental health crisis platform, medical diagnosis platform, or a substitute for in-person professional care. Use of the Platform in such situations is entirely at your own risk.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">3. User Accounts & Eligibility</h3>
                <p className="mb-4">By registering, you confirm that you are at least 18 years of age and legally capable of entering into a binding contract under the Indian Contract Act, 1872. You agree to provide accurate information and maintain the confidentiality of your account. We reserve the right to suspend or terminate accounts for false information, misuse, or violation of these Terms.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">4. Services & Astrologer Interactions</h3>
                <p className="mb-4">Way2Astro acts as an intermediary providing Chat, Audio, and Video consultations with independent astrologers (“Service Providers”). We do not guarantee the accuracy of predictions, outcomes of advice, or effectiveness of remedies. By using the call feature, you consent to being contacted even if your number is on DND. Service Providers are solely responsible for their advice.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">5. User Generated Content (UGC) & Conduct</h3>
                <p className="mb-4">We maintain a <strong>Zero Tolerance Policy</strong> for objectionable content and abusive users, in strict compliance with App Store and Google Play guidelines.</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Users must not post abusive, defamatory, obscene, or unlawful content; promote hate speech, self-harm, black magic, illegal drugs, or discrimination; or engage in harassment.</li>
                    <li>There is no tolerance for sexual exploitation or child abuse material.</li>
                    <li><strong>Reporting & Blocking:</strong> The Platform provides in-app features to flag objectionable content and block abusive users. Flagged content and reported users will be reviewed within 24 hours, and appropriate action, including permanent bans, will be taken.</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">6. Wallet, Payment & Refund Policy</h3>
                <p className="mb-4 text-xs text-slate-400">Effective Date: June 16, 2026<br/>Operated by: Go Digital Media and Solutions</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">6.1 Overview</h4>
                <p className="mb-4">This policy governs all financial transactions on Way2astro, including wallet recharges, service payments, and refunds. Way2astro's in-app wallet functions as a Closed System Prepaid Payment Instrument (PPI) as recognised under RBI's Master Directions on PPIs (2021). Payment processing is handled by authorized Payment Aggregators (like Razorpay) and conforms to Apple App Store and Google Play billing guidelines where applicable.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">6.2 Wallet Recharge</h4>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Minimum and maximum recharge amounts apply per transaction.</li>
                    <li>All recharges are in Indian Rupees (INR) and are credited to your Way2astro Wallet instantly upon confirmation.</li>
                    <li>GST at 18% is applicable on all transactions as per the GST Act. Invoices are available in the App under Account &gt; Transaction History.</li>
                </ul>

                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">6.3 Wallet Usage</h4>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Wallet balance can ONLY be used for astrologer consultation services within the Way2astro App.</li>
                    <li>Wallet balance CANNOT be transferred to other users or withdrawn to any external bank account.</li>
                    <li>Real-money balance has NO EXPIRY. Promotional/bonus credits expire as specified at the time of credit (typically 14–90 days).</li>
                </ul>

                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">6.4 Refund Policy</h4>
                <p className="mb-2"><strong>Technical Failures:</strong> If a consultation is interrupted due to a technical failure on our platform, the unused/interrupted session amount will be refunded to your Way2astro Wallet within 24 hours.</p>
                <p className="mb-2"><strong>Failed Recharges:</strong> If payment is debited from your bank but not credited to your Wallet, it will be automatically refunded to the source account within 5–7 working days.</p>
                <p className="mb-2"><strong>Non-Refundable Situations:</strong></p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Completed consultation sessions where service was delivered.</li>
                    <li>Sessions abandoned by the user after the astrologer joined.</li>
                    <li>Dissatisfaction with the nature or accuracy of astrological predictions.</li>
                    <li>Promotional credits or bonus amounts.</li>
                </ul>
                <p className="mb-4"><strong>Refund to Source:</strong> All refunds of real money (non-promotional) will be returned to the ORIGINAL PAYMENT SOURCE used for recharge, unless it is a technical session interruption (which is refunded to the Wallet).</p>

                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">6.5 Account Closure & Wallet Balance</h4>
                <p className="mb-4">Upon account deletion, requests will be processed within 30 days. Any remaining paid Wallet balance (excluding promotional credits) will be refunded to a verified bank account within 15 working days. Promotional credits are forfeited.</p>

                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">6.6 Dispute Resolution</h4>
                <p className="mb-4">For payment-related disputes, contact support@way2astro.com. If unresolved within 7 days, escalate to grievance@way2astro.com. Further unresolved disputes (within 30 days) may be escalated to your bank, the RBI Banking Ombudsman, or consumer redressal commissions.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">7. Disclaimer & Limitation of Liability</h3>
                <p className="mb-4">Services are provided “AS IS”. We do not guarantee accuracy, reliability, or uninterrupted service. Way2Astro shall not be liable for decisions made based on advice, losses arising from use of Platform, or indirect damages. Maximum liability shall not exceed the amount paid for the service in question.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">8. Intellectual Property</h3>
                <p className="mb-4">All content including text, graphics, designs, logos, and software is the property of Go Digital Media and Solutions. Unauthorized commercial use is strictly prohibited.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">9. Indemnification</h3>
                <p className="mb-4">You agree to indemnify and hold harmless Way2Astro and Go Digital Media and Solutions from claims arising from misuse, violation of these Terms, or infringement of third-party rights.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">10. Governing Law & Jurisdiction</h3>
                <p className="mb-4">These Terms shall be governed by the laws of India. Disputes shall be resolved via arbitration under the Arbitration and Conciliation Act, 1996, in Hyderabad, India, in English. Courts of Hyderabad shall have exclusive jurisdiction.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">11. Termination</h3>
                <p className="mb-4">We may suspend or terminate accounts without prior notice for violations, security concerns, or legal compliance. Unused credits may lapse as per policy.</p>

                <p className="mb-4 mt-8 font-bold text-center">Owned & Operated by Go Digital Media and Solutions<br/>info@way2astro.com | Hyderabad, India</p>
            </div>
        </main>
    );
}
