"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';

const CalculatorCard = ({ icon: Icon, title, description, href, color, premium, delay = 0 }) => {
    const colorClasses = {
        indigo: "from-indigo-500 to-blue-600 bg-indigo-50 text-indigo-600 shadow-indigo-200/50",
        rose: "from-rose-500 to-pink-600 bg-rose-50 text-rose-600 shadow-rose-200/50",
        emerald: "from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-600 shadow-emerald-200/50",
        amber: "from-amber-500 to-orange-600 bg-amber-50 text-amber-600 shadow-amber-200/50",
        violet: "from-violet-500 to-purple-600 bg-violet-50 text-violet-600 shadow-violet-200/50",
        blue: "from-blue-500 to-cyan-600 bg-blue-50 text-blue-600 shadow-blue-200/50",
        fuchsia: "from-fuchsia-500 to-pink-600 bg-fuchsia-50 text-fuchsia-600 shadow-fuchsia-200/50",
        cyan: "from-cyan-500 to-blue-600 bg-cyan-50 text-cyan-600 shadow-cyan-200/50",
        sky: "from-sky-500 to-blue-600 bg-sky-50 text-sky-600 shadow-sky-200/50",
    };

    const selectedColor = colorClasses[color] || colorClasses.indigo;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link href={href} className="block h-full">
                <div className="bg-white rounded-[2rem] p-8 h-full border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col relative overflow-hidden">
                    {/* Subtle Background Glow */}
                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity rounded-full blur-3xl -mr-16 -mt-16 bg-gradient-to-br ${selectedColor}`}></div>

                    <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-0 ${selectedColor}`}>
                            <Icon size={32} />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {premium && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-amber-500/20">
                                    <Lock size={10} /> Premium
                                </span>
                            )}
                            <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                                <ArrowRight size={24} />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-900 transition-colors">{title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed flex-grow">{description}</p>

                    <div className="mt-8 pt-6 border-t border-slate-50">
                        <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-2">
                            Calculate Now <ArrowRight size={16} />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default CalculatorCard;
