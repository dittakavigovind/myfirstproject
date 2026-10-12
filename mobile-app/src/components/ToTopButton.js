"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ToTopButton({ bottomClass = "bottom-24" }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = (e) => {
            const scrollContainer = document.getElementById("main-scroll-container");
            const containerScroll = scrollContainer ? scrollContainer.scrollTop : 0;
            const windowScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const targetScroll = e?.target?.scrollTop || 0;
            const scrollTop = Math.max(containerScroll, windowScroll, targetScroll);
            setVisible(scrollTop > 150);
        };

        // Scroll events do not bubble, but capture: true intercepts them from ANY scrolling container
        window.addEventListener("scroll", handleScroll, { passive: true, capture: true });

        const scrollContainer = document.getElementById("main-scroll-container");
        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        }

        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
            if (scrollContainer) {
                scrollContainer.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    const scrollToTop = () => {
        const scrollContainer = document.getElementById("main-scroll-container");
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (document.documentElement) {
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <div className={`fixed ${bottomClass} left-0 right-0 z-50 pointer-events-none`}>
                    <div className="max-w-md mx-auto px-4 flex justify-end">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 12 }}
                            transition={{ duration: 0.2 }}
                            onClick={scrollToTop}
                            className="pointer-events-auto w-11 h-11 rounded-full bg-gradient-to-tr from-electric-violet to-purple-500 hover:from-purple-500 hover:to-electric-violet text-white shadow-xl shadow-electric-violet/50 border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform duration-150 cursor-pointer"
                            aria-label="Scroll to top"
                            title="To Top"
                        >
                            <ArrowUp size={20} className="stroke-[2.5]" />
                        </motion.button>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

