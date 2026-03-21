"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, Edit, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import CosmicLoader from "@/components/CosmicLoader";

export default function Chat() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/chat');
            // Backend returns array directly from exports.getChats
            setConversations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(chat => {
            const otherParticipant = chat.participants.find(p => p._id !== user?.id);
            const nameMatch = otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            const messageMatch = chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
            return nameMatch || messageMatch;
        });
    }, [conversations, searchQuery, user?.id]);

    const getChatPartner = (chat) => {
        return chat.participants.find(p => p._id !== user?.id) || { name: "System" };
    };

    if (authLoading || loading) return <CosmicLoader message="Fetching cosmic signals..." />;

    const isAstrologer = user?.role === 'astrologer';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Messages</h2>
                {!isAstrologer && (
                    <button className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-electric-violet">
                        <Edit size={18} />
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="glass-panel rounded-xl flex items-center px-4 py-3 border border-white/10 shadow-lg">
                <Search size={18} className="text-slate-400 mr-3" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-slate-500"
                />
            </div>

            {/* Conversation List */}
            <div className="space-y-3">
                {filteredConversations.map((chat) => {
                    const partner = getChatPartner(chat);
                    return (
                        <div 
                            key={chat._id} 
                            onClick={() => router.push(`/chat/${chat._id}`)}
                            className="glass-panel rounded-xl p-4 flex gap-4 items-center relative overflow-hidden group cursor-pointer"
                        >
                            {/* Highlight on touch/hover */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative">
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
                                    {partner.profileImage ? (
                                        <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-slate-500" />
                                    )}
                                </div>
                                {/* TODO: Implement real-time unread count indicator */}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-white font-bold text-base truncate">{partner.name}</h3>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
                                    </span>
                                </div>
                                <p className="text-sm truncate text-slate-400">
                                    {chat.lastMessage?.content || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {filteredConversations.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500 mb-4">
                            <MessageCircle size={24} />
                        </div>
                        <p className="text-slate-400 font-medium font-bold uppercase tracking-widest text-xs">No conversations found</p>
                    </div>
                )}
            </div>

            <div className="h-10" />
        </div>
    );
}
