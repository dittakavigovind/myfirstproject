"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Ultra-Modern Apple Glassmorphic Card Container
 */
export default function CosmicCard({ children, className, onClick, delay = 0, noHover = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
            whileHover={noHover || !onClick ? {} : { scale: 1.01 }}
            whileTap={noHover || !onClick ? {} : { scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "rounded-[24px] p-5 overflow-hidden relative group backdrop-blur-2xl bg-white/[0.05] border border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.4)]",
                onClick && "cursor-pointer active:scale-[0.98] transition-transform",
                className
            )}
        >
            {/* Top Specular Rim Light */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {children}
        </motion.div>
    );
}
