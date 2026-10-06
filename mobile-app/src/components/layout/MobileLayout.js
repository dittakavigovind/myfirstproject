"use client";

import ModernHeader from "./ModernHeader";
import BottomNav from "./BottomNav";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import VersionCheckOverlay from "./VersionCheckOverlay";

export default function MobileLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    
    const isProfile = pathname === "/astrologer";
    const isSpecialPage = pathname === "/auth" || pathname.startsWith("/chat/");

    // Handle Hardware Back Button & Edge Swipe in Capacitor
    useEffect(() => {
        let listenerObj = null;
        
        const setupBackButton = async () => {
            if (typeof window !== "undefined" && window.Capacitor) {
                try {
                    const { App } = await import("@capacitor/app");
                    listenerObj = await App.addListener("backButton", () => {
                        // Define which paths should exit the app when back is pressed
                        const exitPaths = ["/", "/auth", "/explore", "/wallet", "/profile"];
                        
                        // Use window.location.pathname to get the current actual path, 
                        // as Next's usePathname in useEffect closure might be stale
                        const currentPath = window.location.pathname;
                        
                        if (exitPaths.includes(currentPath)) {
                            App.exitApp();
                        } else {
                            router.back();
                        }
                    });
                } catch (e) {
                    console.error("Failed to setup capacitor back button:", e);
                }
            }
        };
        
        setupBackButton();
        
        return () => {
            if (listenerObj && typeof listenerObj.remove === "function") {
                listenerObj.remove();
            }
        };
    }, [router]);

    return (
        <div 
            className={`relative h-[100dvh] flex flex-col max-w-md mx-auto overflow-hidden shadow-2xl shadow-electric-violet/5`}
            style={{ paddingTop: isProfile || isSpecialPage ? 'var(--safe-area-inset-top)' : 'calc(var(--safe-area-inset-top) + 4rem)' }}
        >
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-electric-violet/20 blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-solar-gold/10 blur-[100px] pointer-events-none" />

            <VersionCheckOverlay />

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
