"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PullToRefresh({ onRefresh, children }) {
    const pathname = usePathname();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullProgress, setPullProgress] = useState(0);
    const controls = useAnimation();
    const spinnerControls = useAnimation();

    const containerRef = useRef(null);
    const startY = useRef(0);
    const currentY = useRef(0);
    const isPulling = useRef(false);

    const threshold = 100;
    const maxPull = 150;

    // Reset container scroll position and animations on route changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
        controls.set({ y: 0 });
        spinnerControls.set({ y: -50, rotate: 0, opacity: 0 });
    }, [pathname]);

    useEffect(() => {
        // We attach listeners to the container
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e) => {
            if (container.scrollTop <= 0 && e.touches.length > 0) {
                const y = e.touches[0].clientY;
                startY.current = y;
                currentY.current = y;
                isPulling.current = false;
            } else {
                isPulling.current = false;
            }
        };

        const handleTouchMove = (e) => {
            if (isRefreshing || e.touches.length === 0) return;

            if (container.scrollTop > 0) {
                isPulling.current = false;
                setPullProgress(0);
                controls.set({ y: 0 });
                spinnerControls.set({ y: -50, rotate: 0, opacity: 0 });
                return;
            }

            currentY.current = e.touches[0].clientY;
            const deltaY = currentY.current - startY.current;

            if (deltaY > 15) {
                isPulling.current = true;
                const pullDistance = Math.min((deltaY - 15) * 0.4, maxPull);
                controls.set({ y: pullDistance });

                const progress = Math.min(pullDistance / threshold, 1);
                setPullProgress(progress);

                spinnerControls.set({
                    y: -50 + pullDistance,
                    rotate: progress * 360,
                    opacity: progress
                });
            } else {
                isPulling.current = false;
                controls.set({ y: 0 });
                spinnerControls.set({ y: -50, rotate: 0, opacity: 0 });
            }
        };

        const handleTouchEnd = async () => {
            if (!isPulling.current || isRefreshing) {
                isPulling.current = false;
                startY.current = 0;
                currentY.current = 0;
                controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                spinnerControls.start({ y: -50, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                setPullProgress(0);
                return;
            }
            isPulling.current = false;

            const deltaY = currentY.current - startY.current;
            const pullDistance = Math.min(Math.max(deltaY - 15, 0) * 0.4, maxPull);

            startY.current = 0;
            currentY.current = 0;

            if (pullDistance >= threshold) {
                setIsRefreshing(true);
                // Animate to refreshing state
                controls.start({ y: 60, transition: { type: "spring", stiffness: 300, damping: 20 } });
                spinnerControls.start({ y: 10, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });

                try {
                    if (onRefresh) {
                        await onRefresh();
                    } else {
                        window.location.reload();
                        // wait a bit so animation doesn't look abrupt if it reloads quickly
                        await new Promise(r => setTimeout(r, 500));
                    }
                } finally {
                    setIsRefreshing(false);
                    setPullProgress(0);
                    controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                    spinnerControls.start({ y: -50, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                }
            } else {
                controls.start({ y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                spinnerControls.start({ y: -50, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
                setPullProgress(0);
            }
        };

        container.addEventListener("touchstart", handleTouchStart, { passive: true });
        container.addEventListener("touchmove", handleTouchMove, { passive: true });
        container.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isRefreshing, onRefresh, controls, spinnerControls]);

    return (
        <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden relative no-scrollbar" id="main-scroll-container">
            {/* Pull to refresh spinner */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
                animate={spinnerControls}
                initial={{ y: -50, opacity: 0 }}
            >
                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-electric-violet shadow-lg border border-white/20">
                    <Loader2 className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
            </motion.div>

            {/* Content container */}
            <motion.div animate={controls} className="min-h-full">
                {children}
            </motion.div>
        </div>
    );
}
