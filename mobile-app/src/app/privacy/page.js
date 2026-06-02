"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#0b1026] text-slate-300 pb-24">
            <div className="flex items-center gap-4 px-5 z-50 relative sticky top-0 bg-[#0b1026] py-4 border-b border-white/5">
                <button 
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all text-white hover:bg-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white m-0">Privacy Policy</h3>
            </div>
            
            <div className="px-5 py-6 text-sm text-justify leading-relaxed">
                <h3 className="text-lg font-bold text-white mt-6 mb-2">1. Introduction</h3>
                <p className="mb-4">Way2Astro.com (“we”, “our”, “us”, or “Website”) is owned and operated by Go Digital Media and Solutions. We are committed to protecting the privacy of all users including visitors, registered users, customers, and astrologers who use our platform.</p>
                <p className="mb-4">This Privacy Policy explains how we collect, use, process, store, and safeguard your personal information when you access or use Way2Astro.com. By using this Website, you agree to the terms of this Privacy Policy.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">2. Legal Compliance</h3>
                <p className="mb-4">This Privacy Policy is published in accordance with The Information Technology Act, 2000, The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, The Digital Personal Data Protection Act, 2023, The Consumer Protection Act, 2019, and other applicable Indian laws. We follow industry-standard security practices to ensure safe handling of personal and sensitive data.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">3. User Consent</h3>
                <p className="mb-4">By accessing and using Way2Astro.com, you confirm that you have read and understood this Privacy Policy. You provide consent for collection, storage, processing, and disclosure of your personal data as described herein. You agree that continued use of the Website constitutes acceptance of updates to this Policy. If you do not agree with this Privacy Policy, please discontinue use of the Website immediately.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">4. Information We Collect</h3>
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">A. Personal Information</h4>
                <p className="mb-4">We may collect personal information such as Full Name, Phone Number (for OTP verification and account security), Email Address, Date of Birth and Birth Details (for Kundli and horoscope generation), Gender, Location, Profile Photograph (if uploaded), Payment details (processed securely through third-party payment gateways), and IP Address and device information. Your phone number is used only for verification and communication through our secure platform. It is never directly shared with astrologers. Calls are routed via our intermediary system to protect your privacy.</p>
                
                <h4 className="text-base font-semibold text-slate-200 mt-4 mb-2">B. Non-Personal Information</h4>
                <p className="mb-4">We may also collect browser type, device identifiers, IP address, internet service provider details, referring and exit URLs, pages visited and session duration, and cookies and analytics data. This information is used to improve website performance, enhance user experience, and ensure security.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">5. Purpose of Data Collection</h3>
                <p className="mb-4">We collect your information to create and manage your user account, generate personalized astrology reports such as Kundli, horoscope, and divisional charts, facilitate consultations between users and astrologers, process payments securely, improve website functionality and user experience, prevent fraud and misuse, and comply with legal and regulatory obligations. Providing optional information such as date of birth is voluntary unless required for specific services.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">6. Profile Deletion and Data Retention</h3>
                <p className="mb-4">Users may delete their account from the Account Settings section of the Website. Upon deletion request, personal data will be removed within a reasonable timeframe. Certain records may be retained where required under applicable law. We retain personal data only for as long as necessary to fulfill legitimate business purposes or legal obligations.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">7. Consent Management and User Rights</h3>
                <p className="mb-4">Users have the right to access their personal data, request correction of inaccurate data, request deletion of personal data, and withdraw consent for data processing. To exercise these rights, contact info@way2astro.com. We will respond within a reasonable and lawful timeframe.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">8. Voice and Video Interaction</h3>
                <p className="mb-4">Way2Astro may provide audio or video interaction features. When you grant microphone permission, we may record audio for consultation purposes. Such recordings are stored securely and may be deleted after a reasonable period unless required by law. Way2Astro is not responsible for any personal information voluntarily shared by users directly with astrologers during chat, audio, or video sessions. Users are advised not to share highly sensitive personal information unless necessary.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">9. Cookies and Tracking Technologies</h3>
                <p className="mb-4">We use cookies and similar technologies to remember login sessions, personalize content, improve website performance, analyze traffic patterns, and display relevant advertisements. You may disable cookies in your browser settings; however, some features of the Website may not function properly.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">10. Third-Party Services</h3>
                <p className="mb-4">We may use third-party service providers for payment processing, cloud hosting, analytics services, and SMS/OTP verification. We are not responsible for the privacy practices of third-party websites linked from our platform. Users are encouraged to review their respective privacy policies. Mobile information and SMS opt-in data are not shared with third parties for marketing purposes.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">11. Security Measures</h3>
                <p className="mb-4">We implement appropriate technical and organizational measures including SSL encryption, secure servers, encrypted payment processing, firewalls and monitoring systems, and restricted access controls. While we strive to protect your data, no method of transmission over the Internet is completely secure. Users are responsible for safeguarding their login credentials.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">12. Disclaimer – Astrology Services</h3>
                <p className="mb-4">Way2Astro acts as a technology platform connecting users and astrologers. We do not guarantee accuracy, reliability, or outcomes of predictions. Astrology services are based on traditional knowledge and interpretations. No guaranteed results are promised. Users are advised to exercise discretion while selecting astrologers and interpreting advice. Way2Astro does not control or mandate the methods, qualifications, or advice of astrologers.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">13. Mental Health Disclaimer</h3>
                <p className="mb-4">Way2Astro does not provide medical or psychological treatment. Users experiencing severe emotional distress, suicidal thoughts, or mental health crises should seek immediate professional medical assistance. We may share information with law enforcement authorities if required by law.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">14. Children’s Privacy</h3>
                <p className="mb-4">Our services are intended for users aged 18 years and above. We do not knowingly collect personal data from children under 13 years of age. If such information is identified, it will be deleted immediately.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">15. Dispute Resolution</h3>
                <p className="mb-4">This Privacy Policy shall be governed by the laws of India. Any disputes arising under this Policy shall be subject to the jurisdiction of courts located in Hyderabad, India. Arbitration, if applicable, shall be conducted under the Arbitration and Conciliation Act, 1996.</p>

                <h3 className="text-lg font-bold text-white mt-6 mb-2">16. Grievance Officer</h3>
                <p className="mb-4">In accordance with the Information Technology Act, 2000: Company is Go Digital Media and Solutions, Website is Way2Astro.com, and Email is info@way2astro.com. The Grievance Officer will respond to complaints within 7–15 working days.</p>
            </div>
        </main>
    );
}
