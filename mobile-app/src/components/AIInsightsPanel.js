import { useState, useEffect } from "react";
import { Sparkles, AlertCircle, Star, Lightbulb, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { maskUserName } from "@/utils/maskUtils";

export default function AIInsightsPanel({ userId, isOpen, onClose, onTipSelect }) {
    const [activeTab, setActiveTab] = useState("summary");
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState(null);
    const [showFullSummary, setShowFullSummary] = useState(false);
    const [showAllThemes, setShowAllThemes] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchInsights();
        }
    }, [isOpen, userId]);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const id = typeof userId === 'object' ? userId._id : userId;
            const { data } = await api.get(`/astrologer/ai-insights/${id}`);
            if (data?.success) {
                setInsights(data.data);
                setSelectedLanguage("English");
            }
        } catch (error) {
            console.error("Failed to fetch AI insights:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = async (e) => {
        const lang = e.target.value;
        setSelectedLanguage(lang);
        if (lang === "English") {
            fetchInsights();
            return;
        }

        try {
            setIsTranslating(true);
            const id = typeof userId === 'object' ? userId._id : userId;
            const { data } = await api.post(`/astrologer/ai-insights/${id}/translate`, {
                data: insights,
                targetLanguage: lang
            });
            if (data?.success) {
                setInsights(data.data);
            }
        } catch (err) {
            console.error("Translation failed:", err);
        } finally {
            setIsTranslating(false);
        }
    };

    if (!isOpen) return null;

    const memory = insights?.memory;
    const summary = insights?.latestSummary;
    const rawUserName = typeof userId === 'object' ? (userId.name || 'User') : 'User';
    const userName = maskUserName(rawUserName);

    const overviewText = memory?.overallSummary || summary?.overview || "No detailed insights from past sessions yet.";
    const importantGuidance = summary?.importantGuidance || null;

    // Deduplicate and rank themes
    const processThemes = (themesArray) => {
        if (!themesArray || themesArray.length === 0) return ["General Consultation"];

        let processed = themesArray.map(t => {
            const lower = t.toLowerCase();
            if (lower.includes('marriage') || lower.includes('relationship')) return 'Marriage & Relationship';
            if (lower.includes('educat')) return 'Education';
            if (lower.includes('spirit') || lower.includes('pooja')) return 'Spirituality';
            if (lower.includes('career') || lower.includes('job') || lower.includes('work')) return 'Career Growth';
            if (lower.includes('financ') || lower.includes('money') || lower.includes('wealth')) return 'Finance';
            if (lower.includes('health') || lower.includes('medical')) return 'Health';
            if (lower.includes('family') || lower.includes('parent')) return 'Family Matters';
            return t.charAt(0).toUpperCase() + t.slice(1);
        });

        // Remove duplicates and empty
        return [...new Set(processed)].filter(Boolean);
    };

    const themesList = processThemes(memory?.themes?.length > 0 ? memory.themes : summary?.primaryConcerns);
    const displayThemes = showAllThemes ? themesList : themesList.slice(0, 5);
    const hasMoreThemes = themesList.length > 5;

    // Stats variables
    const rawLastConsultationDate = memory?.lastConsultationDate || summary?.createdAt;
    const lastConsultationDateStr = rawLastConsultationDate
        ? new Date(rawLastConsultationDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase() + " " + new Date(rawLastConsultationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    const customerSince = (typeof userId === 'object' && userId.createdAt)
        ? new Date(userId.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()
        : (memory?.createdAt ? new Date(memory.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase() : 'Unknown');

    const totalConsultations = memory?.consultationCount || (summary ? 1 : 0);

    // Combine all tips into a single array for "Things to Note"
    let conversationTips = [];
    if (memory?.conversationTips) {
        if (memory.conversationTips.openingQuestions) conversationTips.push(...memory.conversationTips.openingQuestions);
        if (memory.conversationTips.followUpAreas) conversationTips.push(...memory.conversationTips.followUpAreas);
        if (memory.conversationTips.reminders) conversationTips.push(...memory.conversationTips.reminders);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[999]"
                    />

                    {/* Bottom Sheet Modal */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed bottom-0 left-0 w-full z-[1000] bg-white dark:bg-slate-900 rounded-t-[32px] flex flex-col sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 shadow-2xl overflow-hidden"
                        style={{ maxHeight: "75vh", minHeight: "40vh" }}
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-3 pb-2 bg-white dark:bg-slate-900 cursor-pointer" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full" />
                        </div>

                        {/* Header Content */}
                        <div className="px-6 pt-2 pb-4 bg-white dark:bg-slate-900 z-10 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Sparkles size={14} fill="currentColor" /> Consultation History
                                </div>
                                <select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    disabled={isTranslating || loading || !insights}
                                    className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-lg border-none focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">हिंदी</option>
                                    <option value="Telugu">తెలుగు</option>
                                    <option value="Tamil">தமிழ்</option>
                                    <option value="Kannada">ಕನ್ನಡ</option>
                                    <option value="Malayalam">മലയാളം</option>
                                    <option value="Bengali">বাংলা</option>
                                    <option value="Marathi">मराठी</option>
                                    <option value="Gujarati">ગુજરાતી</option>
                                </select>
                            </div>
                            <h3 className="text-gray-900 dark:text-white font-bold text-xl capitalize">About: {userName}</h3>
                        </div>

                        {/* Custom Segmented Tabs */}
                        <div className="px-6 pb-4 bg-white dark:bg-slate-900 z-10 sticky top-[90px]">
                            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl w-full">
                                <button
                                    onClick={() => setActiveTab("summary")}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === "summary"
                                            ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        }`}
                                >
                                    Past Context
                                </button>
                                <button
                                    onClick={() => setActiveTab("tips")}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === "tips"
                                            ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        }`}
                                >
                                    Session Tips
                                </button>
                            </div>
                        </div>

                        {/* Main Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar bg-white dark:bg-slate-900 relative">
                            {loading || isTranslating ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-8 h-8 border-2 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-3"></div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        {isTranslating ? "Translating insights..." : "Consulting the cosmos..."}
                                    </p>
                                </div>
                            ) : !insights ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <AlertCircle className="text-gray-400 dark:text-gray-600 mb-2" size={32} />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">No past consultations found.</p>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeTab === "summary" && (
                                        <div className="space-y-4">
                                            {/* Primary Concerns Highlights */}
                                            <div>
                                                <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                    🎯 Primary Concerns
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {displayThemes.map((theme, idx) => (
                                                        <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 font-medium px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800/50 shadow-sm flex items-center text-sm">
                                                            <div className="w-1 h-1 rounded-full bg-orange-400 mr-2"></div>
                                                            {theme}
                                                        </div>
                                                    ))}
                                                    {hasMoreThemes && (
                                                        <button
                                                            onClick={() => setShowAllThemes(!showAllThemes)}
                                                            className="text-orange-500 text-sm font-semibold hover:text-orange-600 dark:hover:text-orange-400 px-2 py-1.5"
                                                        >
                                                            {showAllThemes ? "Show Less" : `+${themesList.length - 5} More`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Consultation Stats */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs border-t border-b border-gray-100 dark:border-gray-800 py-3 my-1">
                                                <div><span className="text-gray-500 dark:text-gray-400">Total:</span> <span className="text-gray-900 dark:text-white font-bold">{totalConsultations}</span></div>
                                                <div><span className="text-gray-500 dark:text-gray-400">Since:</span> <span className="text-gray-900 dark:text-white font-bold">{customerSince}</span></div>
                                                <div className="w-full"><span className="text-gray-500 dark:text-gray-400">Last Session:</span> <span className="text-gray-900 dark:text-white font-bold">{lastConsultationDateStr}</span></div>
                                            </div>

                                            {/* Detailed Insights */}
                                            <div>
                                                <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-full">
                                                        <Star size={12} className="text-orange-500" fill="currentColor" />
                                                    </div>
                                                    Insights from Past Sessions
                                                </h4>
                                                <div className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {showFullSummary ? overviewText : (
                                                        overviewText.length > 150
                                                            ? `${overviewText.substring(0, 150)}...`
                                                            : overviewText
                                                    )}
                                                </div>
                                                {overviewText.length > 150 && (
                                                    <button
                                                        onClick={() => setShowFullSummary(!showFullSummary)}
                                                        className="text-orange-500 text-xs font-semibold mt-1 hover:text-orange-600 dark:hover:text-orange-400"
                                                    >
                                                        {showFullSummary ? "Show less" : "Show more"}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Astrologer Suggestions */}
                                            {importantGuidance && (
                                                <div className="pt-1">
                                                    <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                                                            <Lightbulb size={12} className="text-blue-500" fill="currentColor" />
                                                        </div>
                                                        Astrologer's Suggestions
                                                    </h4>
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 shadow-sm border border-blue-100 dark:border-blue-900/30">
                                                        <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {importantGuidance}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "tips" && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-full">
                                                    <Lightbulb size={14} className="text-indigo-500" fill="currentColor" />
                                                </div>
                                                Conversation Tips
                                            </h4>

                                            {conversationTips.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {conversationTips.map((tip, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => onTipSelect?.(tip)}
                                                            className="flex gap-3 items-start p-2 -mx-2 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 active:bg-gray-100 dark:active:bg-slate-700 transition-colors"
                                                        >
                                                            <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed pointer-events-none">
                                                                {tip}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No specific tips available yet.</p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
