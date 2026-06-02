"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function DisclaimerPage() {
    return (
        <main className="min-h-screen bg-[#0b1026] text-slate-300 pb-24">
            <div className="flex items-center gap-4 px-5 z-50 relative sticky top-0 bg-[#0b1026] py-4 border-b border-white/5">
                <button 
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white m-0">Disclaimer</h3>
            </div>
            
            <div className="px-5 py-6 text-sm text-justify leading-relaxed">
                <p className="mb-4">This Disclaimer governs your use of Way2Astro.com (“Website”, “Platform”, “we”, “us”, “our”), owned and operated by Go Digital Media and Solutions. By accessing or using this Website, you agree to the terms stated in this Disclaimer.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Entertainment Purposes Only</h3>
                <p className="mb-4">All information, astrology reports, horoscope predictions, consultations, spiritual guidance, numerology insights, tarot readings, and related content available on Way2Astro.com are provided strictly for entertainment and general informational purposes only.</p>
                <p className="mb-4">Astrology is a belief-based system rooted in traditional knowledge and interpretation. The services offered on this Platform are not scientifically proven methods and should not be treated as factual, guaranteed, or absolute.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">2. No Professional Advice</h3>
                <p className="mb-4">Any prediction, advice, consultation, or message received through Way2Astro.com is NOT a substitute for professional medical advice, legal consultation, financial advisory services, or psychological or psychiatric treatment.</p>
                <p className="mb-4">You must always seek advice from a licensed professional such as a qualified doctor, a registered psychiatrist, a licensed lawyer, or a certified financial advisor. You should never delay or avoid seeking professional advice because of information obtained through this Platform.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">3. No Guarantees or Warranties</h3>
                <p className="mb-4">Way2Astro.com makes no guarantees regarding accuracy of predictions, makes no promises regarding outcomes, provides no implied warranties, and does not assure effectiveness of remedies. Use of the Website and services is entirely at your own discretion and risk.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">4. Platform Role & Responsibility</h3>
                <p className="mb-4">Way2Astro.com operates as a technology platform that connects users with independent astrologers and spiritual advisors. Astrologers are independent service providers. Way2Astro does not control or influence their advice and does not endorse specific remedies. Interaction is at the sole discretion of the user.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">5. Company Information</h3>
                <p className="mb-4">Way2Astro.com is owned and operated by: Go Digital Media and Solutions. Way2Astro is an online digital product/platform operated by the above entity. All transactions and user data collected on this Platform are managed and processed by Go Digital Media and Solutions in accordance with our Privacy Policy and applicable Indian laws.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">6. Limitation of Liability</h3>
                <p className="mb-4">Under no circumstances shall Way2Astro.com or Go Digital Media and Solutions be liable for emotional distress, financial loss, relationship decisions, business decisions, or health decisions. Your reliance on any information provided through the Platform is solely at your own risk.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">7. Emergency Notice</h3>
                <p className="mb-4">WAY2ASTRO IS NOT A CRISIS SERVICE. If you are experiencing suicidal thoughts, facing a medical emergency, or in danger of harming yourself or others, please immediately contact emergency services or a suicide prevention helpline.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">8. Acceptance of Disclaimer</h3>
                <p className="mb-4">By continuing to use Way2Astro.com, you acknowledge that you understand astrology is interpretative and belief-based, you accept full responsibility for your decisions, and you release Way2Astro and Go Digital Media and Solutions from any liability.</p>
                
                <p className="mb-4 mt-8 font-bold text-center">Owned & Operated by Go Digital Media and Solutions<br/>info@way2astro.com | Hyderabad, India</p>
            </div>
        </main>
    );
}
