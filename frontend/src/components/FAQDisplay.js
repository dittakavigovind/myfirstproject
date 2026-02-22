"use client";
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQDisplay({ faqs = [], description = "" }) {
    const [openIndex, setOpenIndex] = useState(null);

    // If no FAQs and no description, don't render anything
    if ((!faqs || faqs.length === 0) && !description) return null;

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Prepare JSON-LD Schema
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="mt-10 mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {description && (
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-100 p-8 md:p-12 mb-10">
                    <div
                        className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium text-lg"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>
            )}

            {faqs.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-blue-50 rounded-full text-blue-600 shadow-sm border border-blue-100/50">
                            <HelpCircle size={22} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Frequently Asked Questions</h2>
                    </div>

                    <div className="grid gap-5">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex items-center justify-between p-6 md:px-8 text-left hover:bg-slate-50/30 transition-colors"
                                >
                                    <span className="font-bold text-slate-800 text-lg pr-8">{faq.question}</span>
                                    <div className={`p-2 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                        <ChevronDown size={18} />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="p-6 md:px-8 pt-0 text-slate-500 leading-loose text-base font-medium">
                                                <div className="pt-4 border-t border-slate-100/80">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inject JSON-LD Schema */}
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
        </div>
    );
}
