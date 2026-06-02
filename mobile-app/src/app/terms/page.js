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
                <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Introduction</h3>
                <p className="mb-4">This Website, Way2Astro.com (“Platform”, “Website”, “we”, “us”, “our”, or “Company”) is owned and operated by Go Digital Media and Solutions. These Terms and Conditions (“Agreement”) govern your access to and use of our online platform through which astrology consultations, horoscope services, Kundli reports, spiritual advisory services, and related services (“Services”) are made available.</p>
                <p className="mb-4">By accessing or using the Platform, you agree to be legally bound by this Agreement. If you do not agree to any part of these Terms, you must not use the Platform.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">2. Important Health & Safety Notice</h3>
                <p className="mb-4">If you are thinking about harming yourself or others, or if you are experiencing a medical or mental health emergency, you must immediately contact local police, emergency services, or a suicide prevention helpline. Way2Astro is not a suicide prevention service, mental health crisis platform, medical diagnosis platform, or substitute for in-person professional care. You should never delay, avoid, or discontinue professional medical or psychological treatment because of advice received on this Platform. Use of the Platform in such situations is entirely at your own risk.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">3. Modifications to Terms</h3>
                <p className="mb-4">We reserve the right to modify, amend, or update these Terms at any time. It is your responsibility to review these Terms periodically. Continued use of the Platform after updates constitutes acceptance of the revised Terms.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">4. User Consent</h3>
                <p className="mb-4">By registering or using the Platform, you confirm that you are at least 18 years of age, are legally capable of entering into a binding contract under the Indian Contract Act, 1872, and agree to comply with these Terms and our Privacy Policy. If you are under 18 years of age, you must not use this Platform.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">5. General Description of Services</h3>
                <p className="mb-4">Way2Astro provides free astrology content, paid astrology consultations, Kundli reports, horoscope services, audio/video consultations, and chat-based astrology services. The Platform acts only as an intermediary between users and astrologers (“Service Providers”). We do not guarantee accuracy of predictions, outcomes of advice, or effectiveness of remedies. Astrological services are based on traditional interpretations and may vary between Service Providers.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">6. Registration & Account Responsibility</h3>
                <p className="mb-4">To access certain services, you must register using your phone number (OTP verification) or email address. You agree to provide accurate, complete, and updated information, and to maintain confidentiality of your account. We reserve the right to suspend or terminate accounts for false information, misuse, or violation of these Terms.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">7. Call & Chat with Service Providers</h3>
                <p className="mb-4">Way2Astro provides consultation features including Chat, Audio calls, and Video calls. By using the call feature, you consent to being contacted even if your number is on DND. Service Providers operate independently and are not employees of Way2Astro. They are solely responsible for their advice. Way2Astro does not assume responsibility for predictions or outcomes.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">8. Content & Conduct Rules</h3>
                <p className="mb-4">Users must not post abusive, defamatory, obscene, or unlawful content; promote hate speech or discrimination; upload malware; or engage in harassment. Violation may result in immediate account termination and legal action.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">9. Refund & Cancellation Policy</h3>
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Astrology Services</h4>
                <p className="mb-4">No refund once consultation has started. Refund requests must be raised within 24 hours (subject to review). No refund for dissatisfaction based on prediction accuracy.</p>
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">Technical Issues</h4>
                <p className="mb-4">Refund may be considered in cases of network interruption, call disconnection, consultant language mismatch, or inappropriate behavior. No refund for wrong birth details entered, wrong phone number, or completed connected calls.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">10. Way2Astro Wallet Policy</h3>
                <p className="mb-4">Way2Astro may maintain a digital wallet system with two types of credits: Real Service Credits (purchased) and Virtual Service Credits (promotional). Credits have no cash value, are non-transferable and cannot be withdrawn. Virtual Credits expire in 14 days. Real Credits expire up to 1 year. Expired credits are non-refundable.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">11. Disclaimer & Limitation of Liability</h3>
                <p className="mb-4">Services are provided “AS IS”. We do not guarantee accuracy, reliability, or uninterrupted service. Way2Astro shall not be liable for decisions made based on advice, losses arising from use of Platform, indirect or consequential damages, or unauthorized access to accounts. Maximum liability shall not exceed the amount paid for the service in question.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">12. Prohibited Activities</h3>
                <p className="mb-4">Prohibited activities include hate speech, sexual exploitation, child abuse material, black magic / witchcraft promotion, terrorist content, illegal drug promotion, sale of weapons, gambling promotion, harassment, and discrimination. Zero tolerance policy applies. Accounts violating these standards will be terminated immediately.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">13. Intellectual Property</h3>
                <p className="mb-4">All content including text, graphics, designs, logos, and software is the property of Go Digital Media and Solutions. Unauthorized commercial use is strictly prohibited.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">14. Indemnification</h3>
                <p className="mb-4">You agree to indemnify and hold harmless Way2Astro and Go Digital Media and Solutions from claims arising from misuse, violation of these Terms, or infringement of third-party rights.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">15. Governing Law & Jurisdiction</h3>
                <p className="mb-4">These Terms shall be governed by the laws of India. Disputes shall be resolved via arbitration under the Arbitration and Conciliation Act, 1996, in Hyderabad, India, in English. Courts of Hyderabad shall have exclusive jurisdiction.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">16. Termination</h3>
                <p className="mb-4">We may suspend or terminate accounts without prior notice for violations, security concerns, or legal compliance. Unused credits may lapse as per policy.</p>
                
                <p className="mb-4 mt-8 font-bold text-center">Owned & Operated by Go Digital Media and Solutions<br/>info@way2astro.com | Hyderabad, India</p>
            </div>
        </main>
    );
}
