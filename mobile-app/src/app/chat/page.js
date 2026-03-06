"use client";

import { MessageCircle, Search, Edit } from "lucide-react";

export default function Chat() {
    const conversations = [
        { name: "Astro Dev", message: "Your weekly transit looks great!", time: "10:42 AM", unread: 2, img: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
        { name: "Pandit Raj", message: "Remember to do the pooja on Tuesday.", time: "Yesterday", unread: 0, img: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Messages</h2>
                <button className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-electric-violet">
                    <Edit size={18} />
                </button>
            </div>

            {/* Search */}
            <div className="glass-panel rounded-xl flex items-center px-4 py-3 border border-white/10 shadow-lg">
                <Search size={18} className="text-slate-400 mr-3" />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
                />
            </div>

            {/* Conversation List */}
            <div className="space-y-3">
                {conversations.map((chat, i) => (
                    <div key={i} className="glass-panel rounded-xl p-4 flex gap-4 items-center relative overflow-hidden group cursor-pointer">
                        {/* Highlight on touch/hover */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative">
                            <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20">
                                <img src={chat.img} alt={chat.name} className="w-full h-full object-cover" />
                            </div>
                            {chat.unread > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-electric-violet flex items-center justify-center text-[10px] font-bold text-white border-2 border-cosmic-indigo">
                                    {chat.unread}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-white font-bold text-base truncate">{chat.name}</h3>
                                <span className={`text-xs ${chat.unread > 0 ? 'text-electric-violet font-semibold' : 'text-slate-500'}`}>
                                    {chat.time}
                                </span>
                            </div>
                            <p className={`text-sm truncate ${chat.unread > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                                {chat.message}
                            </p>
                        </div>
                    </div>
                ))}

                {conversations.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500 mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <p className="text-slate-400 font-medium">No active conversations</p>
                    </div>
                )}
            </div>

            <div className="h-10" />
        </div>
    );
}
