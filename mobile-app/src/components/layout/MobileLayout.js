"use client";

import ModernHeader from "./ModernHeader";
import BottomNav from "./BottomNav";
import { usePathname } from "next/navigation";

export default function MobileLayout({ children }) {
    const pathname = usePathname();
    const hideLayoutElements =
        pathname === "/auth" ||
        pathname === "/horoscope" ||
        pathname === "/wallet" ||
        pathname.startsWith("/astrologer/") ||
        pathname.startsWith("/chat/");

    return (
        <div className={`relative min-h-screen max-w-md mx-auto overflow-hidden shadow-2xl shadow-electric-violet/5 ${hideLayoutElements ? '' : 'pb-24 pt-20'}`}>
            {/* Background glow effects */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-electric-violet/20 blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-solar-gold/10 blur-[100px] pointer-events-none" />

            {!hideLayoutElements && <ModernHeader />}

            <main className="relative z-10 px-4 h-full">
                {children}
            </main>

            {!hideLayoutElements && <BottomNav />}
        </div>
    );
}
