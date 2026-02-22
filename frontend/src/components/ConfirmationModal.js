"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-3xl shadow-2xl w-[90%] max-w-md pointer-events-auto border border-white/20 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Header */}
                            <div className={`h-2 w-full ${isDanger ? 'bg-red-500' : 'bg-astro-yellow'}`}></div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{title}</h3>
                                <p className="text-slate-600 mb-8 leading-relaxed">{message}</p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3.5 px-6 rounded-xl font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all active:scale-[0.98]"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${isDanger
                                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                                : 'bg-astro-navy hover:bg-blue-900 shadow-blue-900/30'
                                            }`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
