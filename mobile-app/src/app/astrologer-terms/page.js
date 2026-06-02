"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AstrologerTermsPage() {
    return (
        <main className="min-h-screen bg-[#0b1026] text-slate-300 pb-24">
            <div className="flex items-center gap-4 px-5 z-50 relative sticky top-0 bg-[#0b1026] py-4 border-b border-white/5">
                <button 
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white m-0">Astrologer Terms</h3>
            </div>
            
            <div className="px-5 py-6 text-sm text-justify leading-relaxed">
                <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Introduction</h3>
                <p className="mb-4">These Terms and Conditions (“Agreement”) govern the relationship between Go Digital Media and Solutions (“Company”, “Way2Astro”, “Platform”, “we”, “us”) and any astrologer, consultant, practitioner, coach, advisor, or professional (“Service Provider” or “Astrologer”) who registers to provide astrology consultation services on Way2Astro.com.</p>
                <p className="mb-4">The Company provides astrology consultations, spiritual advisory services, horoscope analysis, life guidance, and allied services (“Consultation Services”) through its website and applications.</p>
                <p className="mb-4">By registering as a Service Provider, you confirm that you have read and understood this Agreement, agree to be legally bound by these Terms, and acknowledge that you are acting as an independent contractor. If you do not agree, you must not register or provide services on the Platform.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">2. Nature of Relationship</h3>
                <p className="mb-4">The Astrologer is an independent Service Provider. They are not an employee, partner, agent, or representative of the Company. They have no authority to bind the Company legally and are solely responsible for tax compliance and statutory obligations. This Agreement does not constitute employment.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">3. Services</h3>
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">A. Scope</h4>
                <p className="mb-4">The Service Provider agrees to offer astrology and related consultation services remotely through Chat, Audio Call, Video Call, and Live Streaming.</p>
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">B. No Minimum Guarantee</h4>
                <p className="mb-4">The Company does not guarantee minimum working hours, minimum income, user referrals, or fixed compensation. Consultations are provided on an as-needed basis depending on user demand.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">4. Account & Profile Responsibility</h3>
                <p className="mb-4">The Service Provider agrees to provide accurate qualifications, credentials, and experience details, update information regularly, maintain confidentiality of login credentials, and not allow third-party access to their account.</p>
                <p className="mb-4">Fake profiles, fake reviews, self-bookings, or manipulation of ratings will result in immediate termination, withholding of payouts, penalty up to INR 51,000, or permanent blacklisting.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">5. Platform Usage Restrictions</h3>
                <p className="mb-4">The Service Provider shall not reverse engineer platform systems, contact users outside the Platform, share personal contact details, promote competing platforms, collect direct payments from users, provide unlawful/unethical services, practice medicine/law/finance, or provide services to minors.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">6. Non-Solicitation</h3>
                <p className="mb-4">The Service Provider agrees not to solicit users outside the platform or build a personal brand using our user base. This applies during the Agreement and for 1 year after termination.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">7. Online Availability Requirements</h3>
                <p className="mb-4">Service Providers are expected to maintain regular online presence, follow minimum activity requirements, and update next online time after logging out. Standards affect Ranking, Badge eligibility, and Visibility.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">8. Pricing & Revenue Share</h3>
                <p className="mb-4">Pricing is finalized during onboarding and may be revised subject to Company approval. The Standard Split is 60/40 (Company / Astrologer). Green Badge improves splitting. Promotional sessions have reduced payout. The Company reserves the right to deduct payment gateway charges, deduct refund amounts, and withhold payments for suspicious activity.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">9. Payments, Taxes & GST</h3>
                <p className="mb-4">The Service Provider is responsible for tax compliance, must provide PAN/GST details, and agrees to TDS deduction as per law. Non-compliance leads to payment withholding or suspension.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">10. Refund Policy Impact</h3>
                <p className="mb-4">If a user refund is approved, the astrologer's share will be deducted proportionally. Company's decision is final.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">11. Live Streaming Rules</h3>
                <p className="mb-4">Keep camera focused on face, maintain professional conduct, and avoid sharing contact details or abusive speech. Violations carry penalties up to INR 51,000.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">12. Content Ownership</h3>
                <p className="mb-4">All live streams, videos, and recordings become the exclusive property of Go Digital Media and Solutions with perpetual worldwide rights.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">13. Confidentiality</h3>
                <p className="mb-4">The Service Provider agrees not to disclose user information or misuse company data. Confidentiality obligations survive termination.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">14. Indemnification</h3>
                <p className="mb-4">Service Provider agrees to indemnify and hold harmless the Company against user disputes, legal claims, and misrepresentation of qualifications.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">15. Limitation of Liability</h3>
                <p className="mb-4">Way2Astro is not responsible for consultation outcomes or platform interruptions. Maximum liability is capped at payouts made in the last 3 months.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">16. Mandatory Notice Period</h3>
                <p className="mb-4">Minimum 3 months written notice is required before leaving the platform. Failure to comply results in withholding of payouts and forfeiture of incentives.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">17. Termination Rights</h3>
                <p className="mb-4">The Company may suspend or terminate accounts without notice for violations. Payouts may be withheld during investigations.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">18. Governing Law</h3>
                <p className="mb-4">Agreement governed by Laws of India. Disputes resolved via Arbitration in Hyderabad in English.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">19. Disclaimer</h3>
                <p className="mb-4">Platform is provided “AS IS”. Company does not guarantee uninterrupted access, user demand, earnings, or ranking stability. Service Provider operates at their own risk.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">20. Acceptance</h3>
                <p className="mb-4">By registering as a Service Provider on Way2Astro.com, you confirm legal capacity to contract, accept independent contractor status, and agree to revenue share terms and platform rules.</p>
                
                <p className="mb-4 mt-8 font-bold text-center">Owned & Operated by Go Digital Media and Solutions<br/>legal@way2astro.com | Hyderabad, India</p>
            </div>
        </main>
    );
}
