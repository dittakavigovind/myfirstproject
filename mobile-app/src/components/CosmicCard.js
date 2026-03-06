"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A reusable glassmorphic container with hover/touch animations.
 */
export default function CosmicCard({ children, className, onClick, delay = 0, noHover = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            whileHover={noHover || !onClick ? {} : { scale: 1.02 }}
            whileTap={noHover || !onClick ? {} : { scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "glass-panel rounded-2xl p-5 overflow-hidden relative group",
                onClick && "cursor-pointer",
                className
            )}
        >
            {/* Subtle highlight effect to simulate glass */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {children}
        </motion.div>
    );
}
