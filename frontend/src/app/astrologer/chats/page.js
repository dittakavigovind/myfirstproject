"use client";
import { useState, useEffect } from 'react';
import API from '../../../lib/api';
import ChatWindow from '../../../components/ChatWindow';
import { useAuth } from '../../../context/AuthContext';
import { User, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AstrologerChatPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'astrologer')) {
            router.push('/login');
            return;
        }

        const fetchChats = async () => {
            try {
                const { data } = await API.get('/chat');
                setChats(data);
            } catch (err) {
                console.error("Failed to fetch chats", err);
            }
        };

        if (user) fetchChats();
    }, [user, loading, router]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-6xl mx-auto p-4 gap-4">

            {/* Sidebar List */}
            <div className={`w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col ${selectedChat ? 'hidden md:flex' : ''}`}>
                <h2 className="text-xl font-bold text-astro-navy mb-4 flex items-center gap-2">
                    <MessageSquare /> Active Chats
                </h2>

                {chats.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">No active chats.</p>
                ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[70vh]">
                        {chats.map(chat => {
                            const partner = chat.participants.find(p => p._id !== user._id);
                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition hover:bg-gray-100 ${selectedChat?._id === chat._id ? 'bg-astro-yellow/20 border-l-4 border-astro-yellow' : 'border border-gray-100'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                        {partner?.name ? partner.name.charAt(0) : <User size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 truncate">{partner?.name || "Unknown User"}</h4>
                                        <p className="text-xs text-gray-500 truncate">
                                            {chat.lastMessage ? "New message available" : "Click to start chatting"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Chat Window Area */}
            <div className={`w-full md:w-2/3 ${selectedChat ? 'block' : 'hidden md:block'}`}>
                {selectedChat ? (
                    <>
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="md:hidden mb-2 text-sm text-gray-600 underline"
                        >
                            ← Back to Chats
                        </button>
                        <ChatWindow
                            chatId={selectedChat._id}
                            currentUser={user}
                            partnerName={selectedChat.participants.find(p => p._id !== user._id)?.name}
                        />
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg p-10">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
