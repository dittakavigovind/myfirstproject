"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export function useConsultation() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const startChat = async (astrologerId, chatRate) => {
        if (!user) {
            router.push("/auth");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 1. Initial Balance Check (Frontend)
            const minBalanceRequired = (chatRate || 10) * 5;
            if ((user.walletBalance || 0) < minBalanceRequired) {
                setError(`Insufficient balance. Minimum ₹${minBalanceRequired} (5 mins) required.`);
                // Small delay before redirecting to wallet so user can read error
                setTimeout(() => router.push("/wallet"), 2000);
                return;
            }

            // 2. Call API to start paid chat
            const { data } = await api.post("/chat/start-paid", { astrologerId });

            if (data.success) {
                // 3. Redirect to chat room
                router.push(`/chat/room?id=${data.roomId}`);
            } else {
                setError(data.message || "Failed to start consultation.");
            }
        } catch (err) {
            console.error("Start Consultation Error:", err);
            setError(err.response?.data?.message || "Cosmic connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startCall = async (astrologerId, callRate) => {
        // Implementation for calls (Agora integration usually goes here)
        setError("Voice calls are coming soon to the stars.");
    };

    return {
        startChat,
        startCall,
        loading,
        error
    };
}
