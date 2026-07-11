const fs = require('fs');

let code = fs.readFileSync('mobile-app/src/app/astrologer/AstrologerProfileClient.js', 'utf8');

// 1. Add Icons
code = code.replace(
    'ChevronUp\n} from "lucide-react";',
    'ChevronUp,\n    MoreVertical,\n    Ban,\n    Flag,\n    Unlock,\n    AlertCircle\n} from "lucide-react";'
);

// 2. Add State Variables
code = code.replace(
    'const [isBioExpanded, setIsBioExpanded] = useState(false);',
    `const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [isBlockedByMe, setIsBlockedByMe] = useState(false);
    const [isBlockedByThem, setIsBlockedByThem] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');`
);

// 3. Update fetchAstrologer
code = code.replace(
    /const fetchAstrologer = async \(\) => \{\s+try \{\s+const \{ data \} = await api\.get\(\`\/astro\/astrologers\/\$\{astrologerId\}\`\);\s+setAstrologer\(data\.data\);\s+\} catch \(error\)/,
    `const fetchAstrologer = async () => {
        try {
            const { data } = await api.get(\`/astro/astrologers/\${astrologerId}\`);
            setAstrologer(data.data);
            setIsBlockedByMe(data.isBlockedByMe || false);
            setIsBlockedByThem(data.isBlockedByThem || false);
        } catch (error)`
);

// 4. Add Block/Report Handlers
code = code.replace(
    /const fetchAstrologer = async \(\) => \{/,
    `const handleBlockUser = async () => {
        try {
            await api.post('/moderation/block', {
                blockedId: astrologer._id,
                blockedModel: 'Astrologer'
            });
            setIsBlockedByMe(true);
            setShowBlockModal(false);
        } catch (error) {
            console.error('Failed to block:', error);
        }
    };

    const handleUnblockUser = async () => {
        try {
            await api.post('/moderation/unblock', {
                blockedId: astrologer._id
            });
            setIsBlockedByMe(false);
        } catch (error) {
            console.error('Failed to unblock:', error);
        }
    };

    const handleReportUser = async () => {
        if (!reportReason.trim()) return;
        try {
            await api.post('/moderation/report', {
                reportedId: astrologer._id,
                reportedModel: 'Astrologer',
                reason: reportReason
            });
            setShowReportModal(false);
            setReportReason('');
            alert('Astrologer reported successfully.');
        } catch (error) {
            console.error('Failed to report:', error);
        }
    };

    const fetchAstrologer = async () => {`
);

// 5. Add 3-Dot Menu next to Share button
code = code.replace(
    /<button\s+onClick=\{handleShare\}/,
    `<div className="relative">
                        <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/40 backdrop-blur-xl border border-white/10 active:scale-90 transition-all mr-2">
                            <MoreVertical size={18} className="text-white" />
                        </button>
                        {showMoreMenu && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowMoreMenu(false)} />
                                <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-[101] overflow-hidden">
                                    <button 
                                        onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 border-b border-white/5 flex items-center gap-2"
                                    >
                                        <Flag size={14} /> Report
                                    </button>
                                    <button 
                                        onClick={() => { setShowMoreMenu(false); setShowBlockModal(true); }}
                                        className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 font-medium flex items-center gap-2"
                                    >
                                        <Ban size={14} /> Block
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleShare}`
);

// 6. Update Chat/Call buttons logic
const buttonReplacement = `{isBlockedByMe ? (
                        <button
                            onClick={handleUnblockUser}
                            className="w-full py-3 rounded-xl bg-slate-800 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg border border-slate-700"
                        >
                            <Unlock size={14} className="text-slate-300" />
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Unblock to Interact</span>
                        </button>
                    ) : isBlockedByThem ? (
                        <button
                            disabled
                            className="w-full py-3 rounded-xl bg-rose-500/10 flex items-center justify-center gap-2 shadow-lg border border-rose-500/20 opacity-80"
                        >
                            <Ban size={14} className="text-rose-400" />
                            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Unavailable</span>
                        </button>
                    ) : (
                        <>
                            {user?.globalFeatures?.chatEnabled !== false && astrologer?.features?.chatEnabled !== false && (
                                <button
                                    disabled={initiating}
                                    onClick={() => startChat(astrologer._id, astrologer.charges?.chatPerMinute || 25)}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <MessageCircle size={12} className="text-white" />
                                        <span className="text-xs font-black text-white leading-none">Chat</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest mt-1">
                                        {astrologer.isBusy ? 'Busy' : astrologer.isChatOnline ? 'Available' : 'Offline'}
                                    </span>
                                </button>
                            )}
                            {user?.globalFeatures?.voiceEnabled !== false && astrologer?.features?.voiceEnabled !== false && (
                                <button
                                    disabled={initiating}
                                    onClick={() => startCall(astrologer._id, astrologer.charges?.callPerMinute || 25)}
                                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-lg border border-white/10"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Phone size={12} className="text-white" />
                                        <span className="text-xs font-black text-white leading-none">Call</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest mt-1">
                                        {astrologer.isBusy ? 'Busy' : astrologer.isVoiceOnline ? 'Available' : 'Offline'}
                                    </span>
                                </button>
                            )}
                        </>
                    )}`;

const regexButtons = /\{user\?\.globalFeatures\?\.chatEnabled \!== false && astrologer\?\.features\?\.chatEnabled \!== false && \([\s\S]*?<\/button>\s*\)\}\s*<\/div>/;
code = code.replace(regexButtons, buttonReplacement + '\n                </div>');

// 7. Add Modals at the end before closing div
const modals = `
            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
                        >
                            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                                <X size={20} />
                            </button>
                            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 border border-rose-500/30">
                                <Flag size={20} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Report Astrologer</h3>
                            <p className="text-sm text-slate-400 mb-4">Please describe the issue with this astrologer.</p>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Why are you reporting them?"
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm mb-4 focus:outline-none focus:border-rose-500/50 resize-none h-24"
                            />
                            <button 
                                onClick={handleReportUser}
                                disabled={!reportReason.trim()}
                                className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                Submit Report
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Block Modal */}
            <AnimatePresence>
                {showBlockModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-cosmic-indigo border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative text-center"
                        >
                            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
                                <AlertCircle size={28} className="text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Block Astrologer?</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Are you sure you want to block this astrologer? You will not be able to interact with them anymore.
                            </p>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleBlockUser}
                                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl active:scale-95 transition"
                                >
                                    Yes, Block
                                </button>
                                <button 
                                    onClick={() => setShowBlockModal(false)}
                                    className="w-full py-3.5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl active:scale-95 transition hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
`;

code = code.replace(/<\/div>\s*\);\s*\}\s*$/, modals + '\n        </div>\n    );\n}\n');

fs.writeFileSync('mobile-app/src/app/astrologer/AstrologerProfileClient.js', code);
console.log('Patched successfully.');
