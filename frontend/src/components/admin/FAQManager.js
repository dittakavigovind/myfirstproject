"use client";
import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

export default function FAQManager({ faqs = [], onChange }) {
    // We need stable unique IDs for framer-motion Reorder to work correctly
    // especially when fields are empty or identical.
    const [localFaqs, setLocalFaqs] = useState([]);

    useEffect(() => {
        // Initialize with IDs if they don't exist
        const initialFaqs = faqs.map((faq, index) => ({
            ...faq,
            id: faq.id || `faq-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
        }));
        setLocalFaqs(initialFaqs);
    }, [faqs]);

    const handleAdd = () => {
        const newFaq = {
            id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            question: '',
            answer: ''
        };
        const newFaqs = [newFaq, ...localFaqs];
        setLocalFaqs(newFaqs);
        onChange(newFaqs.map(({ id, ...rest }) => rest));
    };

    const handleRemove = (id) => {
        const newFaqs = localFaqs.filter(faq => faq.id !== id);
        setLocalFaqs(newFaqs);
        onChange(newFaqs.map(({ id, ...rest }) => rest));
    };

    const handleChange = (id, field, value) => {
        const newFaqs = localFaqs.map(faq =>
            faq.id === id ? { ...faq, [field]: value } : faq
        );
        setLocalFaqs(newFaqs);
        onChange(newFaqs.map(({ id, ...rest }) => rest));
    };

    const handleReorder = (newOrder) => {
        setLocalFaqs(newOrder);
        onChange(newOrder.map(({ id, ...rest }) => rest));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-700">Frequently Asked Questions (FAQ)</h3>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                >
                    <Plus size={16} /> Add Question
                </button>
            </div>

            {localFaqs.length === 0 && (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400 text-sm">
                    No FAQs added yet.
                </div>
            )}

            <Reorder.Group axis="y" values={localFaqs} onReorder={handleReorder} className="space-y-3">
                {localFaqs.map((faq) => (
                    <FAQItem
                        key={faq.id}
                        faq={faq}
                        onChange={handleChange}
                        onRemove={handleRemove}
                    />
                ))}
            </Reorder.Group>
        </div>
    );
}

function FAQItem({ faq, onChange, onRemove }) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={faq}
            dragListener={false}
            dragControls={dragControls}
            className="bg-white border border-slate-200 rounded-lg p-4 relative group hover:border-blue-300 transition-colors shadow-sm select-none"
        >
            <div className="absolute right-2 top-2 flex items-center gap-1">
                <div
                    onPointerDown={(e) => {
                        e.preventDefault(); // Prevent text selection
                        dragControls.start(e);
                    }}
                    className="p-1.5 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors select-none touch-none"
                >
                    <GripVertical size={18} />
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(faq.id)}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                    title="Remove FAQ"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="space-y-3 pr-12">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Question</label>
                    <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => onChange(faq.id, 'question', e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-medium"
                        placeholder="e.g., What is a Kundli?"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Answer</label>
                    <textarea
                        value={faq.answer}
                        onChange={(e) => onChange(faq.id, 'answer', e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 min-h-[80px] resize-y"
                        placeholder="Enter the answer..."
                    />
                </div>
            </div>
        </Reorder.Item>
    );
}
