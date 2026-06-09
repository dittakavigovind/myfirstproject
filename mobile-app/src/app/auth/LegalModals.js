import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TermsModal({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-cosmic-indigo border border-white/10 rounded-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
                    >
                        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5 shrink-0">
                            <h2 className="text-white font-bold text-lg">Terms & Conditions</h2>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-full active:scale-95 transition-all">✕</button>
                        </div>
                        <div className="p-5 overflow-y-auto text-slate-300 text-sm leading-relaxed text-justify">
                            <h3 className="text-base font-bold text-white mb-2">1. Introduction</h3>
                            <p className="mb-4">This Website, Way2Astro.com (“Platform”, “Website”, “we”, “us”, “our”, or “Company”) is owned and operated by Go Digital Media and Solutions. These Terms and Conditions (“Agreement”) govern your access to and use of our online platform through which astrology consultations, horoscope services, Kundli reports, spiritual advisory services, and related services (“Services”) are made available.</p>
                            <p className="mb-4">By accessing or using the Platform, you agree to be legally bound by this Agreement. If you do not agree to any part of these Terms, you must not use the Platform.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">2. Important Health & Safety Notice</h3>
                            <p className="mb-4">If you are thinking about harming yourself or others, or if you are experiencing a medical or mental health emergency, you must immediately contact local police, emergency services, or a suicide prevention helpline. Way2Astro is not a suicide prevention service, mental health crisis platform, medical diagnosis platform, or substitute for in-person professional care. You should never delay, avoid, or discontinue professional medical or psychological treatment because of advice received on this Platform. Use of the Platform in such situations is entirely at your own risk.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">3. Modifications to Terms</h3>
                            <p className="mb-4">We reserve the right to modify, amend, or update these Terms at any time. It is your responsibility to review these Terms periodically. Continued use of the Platform after updates constitutes acceptance of the revised Terms.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">4. User Consent</h3>
                            <p className="mb-4">By registering or using the Platform, you confirm that you are at least 18 years of age, are legally capable of entering into a binding contract under the Indian Contract Act, 1872, and agree to comply with these Terms and our Privacy Policy. If you are under 18 years of age, you must not use this Platform.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">5. General Description of Services</h3>
                            <p className="mb-4">Way2Astro provides free astrology content, paid astrology consultations, Kundli reports, horoscope services, audio/video consultations, and chat-based astrology services. The Platform acts only as an intermediary between users and astrologers (“Service Providers”). We do not guarantee accuracy of predictions, outcomes of advice, or effectiveness of remedies. Astrological services are based on traditional interpretations and may vary between Service Providers.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">6. Registration & Account Responsibility</h3>
                            <p className="mb-4">To access certain services, you must register using your phone number (OTP verification) or email address. You agree to provide accurate, complete, and updated information, and to maintain confidentiality of your account. We reserve the right to suspend or terminate accounts for false information, misuse, or violation of these Terms.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">7. Call & Chat with Service Providers</h3>
                            <p className="mb-4">Way2Astro provides consultation features including Chat, Audio calls, and Video calls. By using the call feature, you consent to being contacted even if your number is on DND. Service Providers operate independently and are not employees of Way2Astro. They are solely responsible for their advice. Way2Astro does not assume responsibility for predictions or outcomes.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">8. Content & Conduct Rules</h3>
                            <p className="mb-4">Users must not post abusive, defamatory, obscene, or unlawful content; promote hate speech or discrimination; upload malware; or engage in harassment. Violation may result in immediate account termination and legal action.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">9. Refund & Cancellation Policy</h3>
                            <p className="mb-4 font-semibold text-slate-200">Astrology Services:</p>
                            <p className="mb-4">No refund once consultation has started. Refund requests must be raised within 24 hours (subject to review). No refund for dissatisfaction based on prediction accuracy.</p>
                            <p className="mb-4 font-semibold text-slate-200">Technical Issues:</p>
                            <p className="mb-4">Refund may be considered in cases of network interruption, call disconnection, consultant language mismatch, or inappropriate behavior. No refund for wrong birth details entered, wrong phone number, or completed connected calls.</p>
                            
                            <p className="mb-4 mt-8 font-bold text-center text-xs">Owned & Operated by Go Digital Media and Solutions<br/>info@way2astro.com | Hyderabad, India</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function PrivacyModal({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                        className="bg-cosmic-indigo border border-white/10 rounded-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
                    >
                        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5 shrink-0">
                            <h2 className="text-white font-bold text-lg">Privacy Policy</h2>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-full active:scale-95 transition-all">✕</button>
                        </div>
                        <div className="p-5 overflow-y-auto text-slate-300 text-sm leading-relaxed text-justify">
                            <h3 className="text-base font-bold text-white mb-2">1. Introduction</h3>
                            <p className="mb-4">Way2Astro.com (“we”, “our”, “us”, or “Website”) is owned and operated by Go Digital Media and Solutions. We are committed to protecting the privacy of all users including visitors, registered users, customers, and astrologers who use our platform.</p>
                            <p className="mb-4">This Privacy Policy explains how we collect, use, process, store, and safeguard your personal information when you access or use Way2Astro.com. By using this Website, you agree to the terms of this Privacy Policy.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">2. Legal Compliance</h3>
                            <p className="mb-4">This Privacy Policy is published in accordance with The Information Technology Act, 2000, The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, The Digital Personal Data Protection Act, 2023, The Consumer Protection Act, 2019, and other applicable Indian laws. We follow industry-standard security practices to ensure safe handling of personal and sensitive data.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">3. User Consent</h3>
                            <p className="mb-4">By accessing and using Way2Astro.com, you confirm that you have read and understood this Privacy Policy. You provide consent for collection, storage, processing, and disclosure of your personal data as described herein. You agree that continued use of the Website constitutes acceptance of updates to this Policy. If you do not agree with this Privacy Policy, please discontinue use of the Website immediately.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">4. Information We Collect</h3>
                            <p className="mb-2 font-semibold text-slate-200">A. Personal Information:</p>
                            <p className="mb-4">We may collect personal information such as Full Name, Phone Number (for OTP verification and account security), Email Address, Date of Birth and Birth Details (for Kundli and horoscope generation), Gender, Location, Profile Photograph (if uploaded), Payment details (processed securely through third-party payment gateways), and IP Address and device information. Your phone number is used only for verification and communication through our secure platform. It is never directly shared with astrologers. Calls are routed via our intermediary system to protect your privacy.</p>
                            
                            <p className="mb-2 font-semibold text-slate-200">B. Non-Personal Information:</p>
                            <p className="mb-4">We may also collect browser type, device identifiers, IP address, internet service provider details, referring and exit URLs, pages visited and session duration, and cookies and analytics data. This information is used to improve website performance, enhance user experience, and ensure security.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">5. Purpose of Data Collection</h3>
                            <p className="mb-4">We collect your information to create and manage your user account, generate personalized astrology reports such as Kundli, horoscope, and divisional charts, facilitate consultations between users and astrologers, process payments securely, improve website functionality and user experience, prevent fraud and misuse, and comply with legal and regulatory obligations.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">6. Profile Deletion and Data Retention</h3>
                            <p className="mb-4">Users may delete their account from the Account Settings section of the Website. Upon deletion request, personal data will be removed within a reasonable timeframe. Certain records may be retained where required under applicable law. We retain personal data only for as long as necessary to fulfill legitimate business purposes or legal obligations.</p>

                            <h3 className="text-base font-bold text-white mt-6 mb-2">7. Security Measures</h3>
                            <p className="mb-4">We implement appropriate technical and organizational measures including SSL encryption, secure servers, encrypted payment processing, firewalls and monitoring systems, and restricted access controls. While we strive to protect your data, no method of transmission over the Internet is completely secure. Users are responsible for safeguarding their login credentials.</p>

                            <p className="mb-4 mt-8 font-bold text-center text-xs">Owned & Operated by Go Digital Media and Solutions<br/>info@way2astro.com | Hyderabad, India</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
