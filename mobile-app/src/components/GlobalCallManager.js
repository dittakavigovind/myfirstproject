"use client";

import { useEffect, useState } from 'react';
import CallRoomClient from '@/app/call/room/CallRoomClient';
import { Suspense } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function GlobalCallManager() {
    const [roomId, setRoomId] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleStartCall = (e) => {
            console.log("GlobalCallManager received start-global-call event", e.detail);
            toast.success("Opening Call Interface...");
            const { roomId: newRoomId } = e.detail;
            setRoomId(newRoomId);
            setIsVisible(true);
        };

        window.addEventListener('start-global-call', handleStartCall);
        return () => {
            window.removeEventListener('start-global-call', handleStartCall);
        };
    }, []);

    // Also listen for Next.js routing away from the page, just in case they use back button?
    // Actually, since it's an overlay, it doesn't hook into router history.

    if (!roomId) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] bg-slate-900 transition-opacity duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading Call Interface...</div>}>
                <CallRoomClient 
                    globalRoomId={roomId} 
                    onMinimize={() => setIsVisible(false)} 
                    onCallEnded={() => {
                        setRoomId(null);
                        setIsVisible(false);
                    }} 
                />
            </Suspense>
        </div>
    );
}
