"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function PremiumFAQ({ items }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((faq, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className={`
                        rounded-2xl border transition-all duration-300 overflow-hidden
                        ${activeIndex === idx
                            ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/10'
                            : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-md'}
                    `}
                >
                    <button
                        onClick={() => toggleFAQ(idx)}
                        className="w-full text-left p-6 flex items-start justify-between gap-4 focus:outline-none group"
                    >
                        <span className={`
                            font-bold text-lg transition-colors duration-300
                            ${activeIndex === idx ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}
                        `}>
                            {faq.question}
                        </span>

                        <span className={`
                            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                            ${activeIndex === idx
                                ? 'bg-blue-600 text-white rotate-180 shadow-md shadow-blue-500/30'
                                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}
                        `}>
                            <ChevronDown className="w-5 h-5" />
                        </span>
                    </button>

                    <AnimatePresence>
                        {activeIndex === idx && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-base border-t border-blue-50/50 pt-4">
                                    <div className="relative pl-4 border-l-2 border-blue-100">
                                        {faq.answer}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
}
