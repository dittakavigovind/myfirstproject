"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Info, Star } from 'lucide-react';
import { t } from '../../utils/translations';

export default function PlanetInsightModal({ isOpen, onClose, planetName, insight, planetData, lang = 'en' }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                >
                    {/* Header */}
                    <div className="relative h-32 bg-slate-900 flex items-center px-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        </div>

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                                <span className="text-3xl font-black">{planetName.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white leading-tight">
                                    {lang === 'hi' ? (planetName === 'Sun' ? 'सूर्य' : planetName === 'Moon' ? 'चन्द्र' : planetName === 'Mars' ? 'मंगल' : planetName === 'Mercury' ? 'बुध' : planetName === 'Jupiter' ? 'गुरु' : planetName === 'Venus' ? 'शुक्र' : planetName === 'Saturn' ? 'शनि' : planetName === 'Rahu' ? 'राहु' : planetName === 'Ketu' ? 'केतु' : planetName) :
                                        lang === 'te' ? (planetName === 'Sun' ? 'సూర్యుడు' : planetName === 'Moon' ? 'చంద్రుడు' : planetName === 'Mars' ? 'కుజుడు' : planetName === 'Mercury' ? 'బుధుడు' : planetName === 'Jupiter' ? 'గురువు' : planetName === 'Venus' ? 'శుక్రుడు' : planetName === 'Saturn' ? 'శని' : planetName === 'Rahu' ? 'రాహువు' : planetName === 'Ketu' ? 'కేతువు' : planetName) :
                                            planetName}
                                </h2>
                                <p className="text-indigo-200 text-sm font-medium">{t('cosmicInsight', lang)}</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        {/* Description */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{t('significance', lang)}</span>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed">
                                {insight?.description || t('generalInfluence', lang)}
                            </p>
                        </div>

                        {/* Specific Insight */}
                        <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-12 h-12 text-indigo-600" />
                            </div>

                            <div className="relative z-10 space-y-2">
                                <h4 className="text-indigo-900 font-black flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-indigo-900" />
                                    {t('yourPlacement', lang)}
                                </h4>
                                <p className="text-indigo-800 text-sm font-bold opacity-90 leading-relaxed">
                                    {lang === 'hi' ? (planetData?.signName === 'Aries' ? 'मेष' : planetData?.signName === 'Taurus' ? 'वृषभ' : planetData?.signName === 'Gemini' ? 'मिथुन' : planetData?.signName === 'Cancer' ? 'कर्क' : planetData?.signName === 'Leo' ? 'सिंह' : planetData?.signName === 'Virgo' ? 'कन्या' : planetData?.signName === 'Libra' ? 'तुला' : planetData?.signName === 'Scorpio' ? 'वृश्चिक' : planetData?.signName === 'Sagittarius' ? 'धनु' : planetData?.signName === 'Capricorn' ? 'मकर' : planetData?.signName === 'Aquarius' ? 'कुंभ' : planetData?.signName === 'Pisces' ? 'मीन' : planetData?.signName) :
                                        lang === 'te' ? (planetData?.signName === 'Aries' ? 'మేషం' : planetData?.signName === 'Taurus' ? 'వృషభం' : planetData?.signName === 'Gemini' ? 'మిధునం' : planetData?.signName === 'Cancer' ? 'కర్కాటకం' : planetData?.signName === 'Leo' ? 'సింహం' : planetData?.signName === 'Virgo' ? 'కన్య' : planetData?.signName === 'Libra' ? 'తుల' : planetData?.signName === 'Scorpio' ? 'వృశ్చికం' : planetData?.signName === 'Sagittarius' ? 'ధనుస్సు' : planetData?.signName === 'Capricorn' ? 'మకరం' : planetData?.signName === 'Aquarius' ? 'కుంభం' : planetData?.signName === 'Pisces' ? 'మీనం' : planetData?.signName) :
                                            planetData?.signName}: {insight?.signSpecific || insight?.relationSpecific || t('uniquePlacement', lang)}
                                </p>
                            </div>
                        </div>

                        {/* Additional Meta */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('dignity', lang)}</span>
                                <span className="text-sm font-black text-slate-700">
                                    {lang === 'hi' ? (planetData?.relation === 'Own House' ? 'स्वग्रही' : planetData?.relation === 'Exalted' ? 'उच्च' : planetData?.relation === 'Debilitated' ? 'नीच' : planetData?.relation === 'Friendly House' ? 'मित्र क्षेत्री' : planetData?.relation === 'Enemy House' ? 'शत्रु क्षेत्री' : planetData?.relation === 'Neutral House' || planetData?.relation === 'Neutral' ? 'तटस्थ' : planetData?.relation) :
                                        lang === 'te' ? (planetData?.relation === 'Own House' ? 'స్వక్షేత్రం' : planetData?.relation === 'Exalted' ? 'ఉచ్చ' : planetData?.relation === 'Debilitated' ? 'నీచ' : planetData?.relation === 'Friendly House' ? 'మిత్ర క్షేత్రం' : planetData?.relation === 'Enemy House' ? 'శత్రు క్షేత్రం' : planetData?.relation === 'Neutral House' || planetData?.relation === 'Neutral' ? 'తటస్థ క్షేత్రం' : planetData?.relation) :
                                            (planetData?.relation || t('neutral', lang))}
                                </span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('degSign', lang)}</span>
                                <span className="text-sm font-black text-slate-700">
                                    {planetData?.deg}° {lang === 'hi' ? (planetData?.signName === 'Aries' ? 'मेष' : planetData?.signName === 'Taurus' ? 'वृषभ' : planetData?.signName === 'Gemini' ? 'मिथुन' : planetData?.signName === 'Cancer' ? 'कर्क' : planetData?.signName === 'Leo' ? 'सिंह' : planetData?.signName === 'Virgo' ? 'कन्या' : planetData?.signName === 'Libra' ? 'तुला' : planetData?.signName === 'Scorpio' ? 'वृश्चिक' : planetData?.signName === 'Sagittarius' ? 'धनु' : planetData?.signName === 'Capricorn' ? 'मकर' : planetData?.signName === 'Aquarius' ? 'कुंभ' : planetData?.signName === 'Pisces' ? 'मीन' : planetData?.signName) :
                                        lang === 'te' ? (planetData?.signName === 'Aries' ? 'మేషం' : planetData?.signName === 'Taurus' ? 'వృషభం' : planetData?.signName === 'Gemini' ? 'మిధునం' : planetData?.signName === 'Cancer' ? 'కర్కాటకం' : planetData?.signName === 'Leo' ? 'సింహం' : planetData?.signName === 'Virgo' ? 'కన్య' : planetData?.signName === 'Libra' ? 'తుల' : planetData?.signName === 'Scorpio' ? 'వృశ్చికం' : planetData?.signName === 'Sagittarius' ? 'ధనుస్సు' : planetData?.signName === 'Capricorn' ? 'మకరం' : planetData?.signName === 'Aquarius' ? 'కుంభం' : planetData?.signName === 'Pisces' ? 'మీనం' : planetData?.signName) :
                                            planetData?.signName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                            {t('closeInsight', lang)}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
