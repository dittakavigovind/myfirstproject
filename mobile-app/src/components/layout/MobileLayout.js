"use client";

import ModernHeader from "./ModernHeader";
import BottomNav from "./BottomNav";
import { usePathname } from "next/navigation";

export default function MobileLayout({ children }) {
    const pathname = usePathname();
    const isProfile = pathname === "/astrologer";
    const hideLayoutElements =
        pathname === "/auth" ||
        pathname.startsWith("/chat/");

    // Don't show global sidebar/header on auth or chat
    const isSpecialPage = pathname === "/auth" || pathname.startsWith("/chat/");

    return (
        <div 
            className={`relative h-[100dvh] flex flex-col max-w-md mx-auto overflow-hidden shadow-2xl shadow-electric-violet/5`}
            style={{ paddingTop: isProfile || isSpecialPage ? 'var(--safe-area-inset-top)' : 'calc(var(--safe-area-inset-top) + 4rem)' }}
        >
            {/* Background glow effects */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-electric-violet/20 blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-solar-gold/10 blur-[100px] pointer-events-none" />

            {!isSpecialPage && !isProfile && <ModernHeader />}

            <main 
                id="main-scroll-container"
                className={`relative z-10 flex-1 overflow-y-auto overflow-x-hidden ${isSpecialPage ? '' : 'px-4 pb-24'}`}
            >
                {children}
            </main>

            {!isSpecialPage && <BottomNav />}
        </div>
    );
}
