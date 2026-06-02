import { Suspense } from 'react';
import ChatRoomClient from './ChatRoomClient';

export const metadata = {
    title: 'Chat Session | Way2Astro',
    description: 'Connect with our expert astrologers for personalized guidance and celestial insights.',
};

export default function ChatRoomPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Chat Session...</div>}>
            <ChatRoomClient />
        </Suspense>
    );
}
