"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export default function FilterModal({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    availableSkills,
    availableLanguages
}) {
    const [activeTab, setActiveTab] = useState("Sort by");
    const [filters, setFilters] = useState(initialFilters || {
        sortBy: "Popularity",
        skills: [],
        languages: [],
        genders: []
    });

    // Sync filters when initialFilters change (e.g. when opening)
    useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters, isOpen]);

    if (!isOpen) return null;

    const tabs = ["Sort by", "Skill", "Language", "Gender", "Price"];

    const sortOptions = [
        "Popularity",
        "Experience: High to Low",
        "Experience: Low to High",
        "Orders: High to Low",
        "Orders: Low to High",
        "Rating: High to Low"
    ];

    const genderOptions = ["Male", "Female", "Other"];
    const priceOptions = ["Price: High to Low", "Price: Low to High"];

    const handleSortChange = (option) => {
        setFilters({ ...filters, sortBy: option });
    };

    const handleCheckboxChange = (category, value) => {
        setFilters(prev => {
            const current = prev[category] || [];
            if (current.includes(value)) {
                return { ...prev, [category]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [category]: [...current, value] };
            }
        });
    };

    const renderRightPanel = () => {
        switch (activeTab) {
            case "Sort by":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-end items-center mb-1">
                            <button onClick={() => handleSortChange("Popularity")} className="text-[13px] text-slate-400 hover:text-white">Clear</button>
                        </div>
                        {sortOptions.map(option => (
                            <div key={option} onClick={() => handleSortChange(option)} className="flex items-center gap-3 cursor-pointer p-1">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    filters.sortBy === option 
                                        ? 'border-electric-violet bg-electric-violet' 
                                        : 'border-slate-500'
                                }`}>
                                    {filters.sortBy === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className={`text-sm ${filters.sortBy === option ? 'text-white font-medium' : 'text-slate-300'}`}>
                                    {option}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            case "Skill":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-1">
                            <button onClick={() => setFilters(prev => ({...prev, skills: [...availableSkills]}))} className="text-[13px] text-electric-violet font-medium">Select All</button>
                            <button onClick={() => setFilters(prev => ({...prev, skills: []}))} className="text-[13px] text-slate-400 hover:text-white">Clear</button>
                        </div>
                        {availableSkills.map(skill => (
                            <div key={skill} onClick={() => handleCheckboxChange("skills", skill)} className="flex items-center gap-3 cursor-pointer p-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    filters.skills.includes(skill)
                                        ? 'border-electric-violet bg-electric-violet'
                                        : 'border-slate-500'
                                }`}>
                                    {filters.skills.includes(skill) && <Check size={14} className="text-white" />}
                                </div>
                                <span className={`text-sm ${filters.skills.includes(skill) ? 'text-white font-medium' : 'text-slate-300'}`}>
                                    {skill}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            case "Language":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-1">
                            <button onClick={() => setFilters(prev => ({...prev, languages: [...availableLanguages]}))} className="text-[13px] text-electric-violet font-medium">Select All</button>
                            <button onClick={() => setFilters(prev => ({...prev, languages: []}))} className="text-[13px] text-slate-400 hover:text-white">Clear</button>
                        </div>
                        {availableLanguages.map(language => (
                            <div key={language} onClick={() => handleCheckboxChange("languages", language)} className="flex items-center gap-3 cursor-pointer p-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    filters.languages.includes(language)
                                        ? 'border-electric-violet bg-electric-violet'
                                        : 'border-slate-500'
                                }`}>
                                    {filters.languages.includes(language) && <Check size={14} className="text-white" />}
                                </div>
                                <span className={`text-sm ${filters.languages.includes(language) ? 'text-white font-medium' : 'text-slate-300'}`}>
                                    {language}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            case "Gender":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-1">
                            <button onClick={() => setFilters(prev => ({...prev, genders: [...genderOptions]}))} className="text-[13px] text-electric-violet font-medium">Select All</button>
                            <button onClick={() => setFilters(prev => ({...prev, genders: []}))} className="text-[13px] text-slate-400 hover:text-white">Clear</button>
                        </div>
                        {genderOptions.map(gender => (
                            <div key={gender} onClick={() => handleCheckboxChange("genders", gender)} className="flex items-center gap-3 cursor-pointer p-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    filters.genders.includes(gender)
                                        ? 'border-electric-violet bg-electric-violet'
                                        : 'border-slate-500'
                                }`}>
                                    {filters.genders.includes(gender) && <Check size={14} className="text-white" />}
                                </div>
                                <span className={`text-sm ${filters.genders.includes(gender) ? 'text-white font-medium' : 'text-slate-300'}`}>
                                    {gender}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            case "Price":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-end items-center mb-1">
                            <button onClick={() => handleSortChange("Popularity")} className="text-[13px] text-slate-400 hover:text-white">Clear</button>
                        </div>
                        {priceOptions.map(option => (
                            <div key={option} onClick={() => handleSortChange(option)} className="flex items-center gap-3 cursor-pointer p-1">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    filters.sortBy === option 
                                        ? 'border-electric-violet bg-electric-violet' 
                                        : 'border-slate-500'
                                }`}>
                                    {filters.sortBy === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className={`text-sm ${filters.sortBy === option ? 'text-white font-medium' : 'text-slate-300'}`}>
                                    {option}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-[#0f1117] border border-white/10 w-full max-w-[400px] h-[75vh] max-h-[600px] rounded-2xl flex flex-col relative animate-in zoom-in-95 duration-300 z-10 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-white font-bold text-lg">Sort & Filter</h2>
                    <button onClick={onClose} className="p-1 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body: 2 columns */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Tabs */}
                    <div className="w-[120px] bg-[#1a1d27] flex flex-col border-r border-white/10 overflow-y-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-left px-4 py-4 text-sm transition-colors relative ${
                                    activeTab === tab 
                                        ? 'bg-[#0f1117] text-white font-medium' 
                                        : 'text-slate-400 hover:bg-white/5'
                                }`}
                            >
                                {activeTab === tab && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-violet"></div>
                                )}
                                {tab}
                                {tab === "Skill" && filters.skills.length > 0 && (
                                    <span className="ml-1 w-2 h-2 inline-block rounded-full bg-electric-violet"></span>
                                )}
                                {tab === "Language" && filters.languages.length > 0 && (
                                    <span className="ml-1 w-2 h-2 inline-block rounded-full bg-electric-violet"></span>
                                )}
                                {tab === "Gender" && filters.genders.length > 0 && (
                                    <span className="ml-1 w-2 h-2 inline-block rounded-full bg-electric-violet"></span>
                                )}
                                {tab === "Price" && priceOptions.includes(filters.sortBy) && (
                                    <span className="ml-1 w-2 h-2 inline-block rounded-full bg-electric-violet"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 p-5 overflow-y-auto">
                        {renderRightPanel()}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0f1117] flex gap-3">
                    <button 
                        onClick={() => {
                            setFilters({ sortBy: "Popularity", skills: [], languages: [], genders: [] });
                        }}
                        className="px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={() => onApply(filters)}
                        className="flex-1 py-3 rounded-xl bg-solar-gold text-black font-bold text-[15px] shadow-lg shadow-solar-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
