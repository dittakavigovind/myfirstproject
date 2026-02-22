"use client";
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import API from '../lib/api';
import { Send, User } from 'lucide-react';
import { SERVER_BASE } from '../lib/urlHelper';

let socket;

export default function ChatWindow({ chatId, currentUser, partnerName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize Socket
        socket = io(SERVER_BASE);

        socket.emit('join_chat', chatId);

        // Listen for messages
        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Fetch initial history
        const fetchHistory = async () => {
            try {
                const { data } = await API.get(`/chat/${chatId}/messages`);
                setMessages(data);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };

        if (chatId) fetchHistory();

        return () => {
            socket.disconnect();
        };
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            roomId: chatId,
            senderId: currentUser._id,
            content: newMessage
        };

        // Emit to socket (server saves it)
        socket.emit('send_message', messageData);
        setNewMessage("");
    };

    return (
        <div className="flex flex-col h-[500px] border border-gray-200 rounded-lg bg-gray-50">
            {/* Header */}
            <div className="p-4 bg-astro-navy text-white rounded-t-lg shadow">
                <h3 className="font-bold flex items-center gap-2">
                    <User size={18} />
                    {partnerName || "Chat"}
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => {
                    const isMe = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg text-sm ${isMe ? 'bg-astro-yellow text-astro-navy rounded-br-none font-medium' : 'bg-white border border-gray-200 rounded-bl-none text-gray-800'}`}>
                                <p>{msg.content}</p>
                                <span className="text-[10px] opacity-70 block text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white rounded-b-lg flex gap-2">
                <input
                    type="text"
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-astro-yellow/50 text-sm"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-astro-navy text-white p-2 rounded-full hover:bg-opacity-90 transition"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
