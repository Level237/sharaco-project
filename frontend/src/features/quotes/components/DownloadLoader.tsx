
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileDown, CheckCircle2, Loader2 } from "lucide-react";

interface DownloadLoaderProps {
    isVisible: boolean;
    filename?: string;
}

export function DownloadLoader({ isVisible, filename = "devis.pdf" }: DownloadLoaderProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xl z-[200]"
                    />

                    {/* Loader Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 30 
                        }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md px-6"
                    >
                        <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
                            {/* Animated Background Glow */}
                            <motion.div
                                animate={{ 
                                    opacity: [0.3, 0.5, 0.3],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-violet-500/20 rounded-3xl -z-10"
                            />

                            {/* Icon Section */}
                            <div className="flex flex-col items-center gap-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="relative"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-[#0ea5e9] flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(14,165,233,0.5)]">
                                        <Loader2 className="w-10 h-10 text-white" />
                                    </div>
                                    
                                    {/* Orbiting dots */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-2"
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-400" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-2"
                                    >
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400" />
                                    </motion.div>
                                </motion.div>

                                {/* Text Section */}
                                <div className="text-center space-y-2">
                                    <motion.h3 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl font-black text-white tracking-tight"
                                    >
                                        Génération du PDF
                                    </motion.h3>
                                    
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm font-medium text-zinc-400"
                                    >
                                        Préparation de votre document...
                                    </motion.p>

                                    {/* Filename */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        <FileDown className="w-3.5 h-3.5 text-sky-400" />
                                        <span className="text-[11px] font-mono font-bold text-zinc-300">
                                            {filename}
                                        </span>
                                    </motion.div>
                                </div>

                                {/* Progress Bar */}
                                <motion.div 
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "100%" }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="w-full h-1 bg-white/5 rounded-full overflow-hidden"
                                >
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "100%" }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                            repeatDelay: 0.5
                                        }}
                                        className="w-full h-full bg-gradient-to-r from-transparent via-sky-500 to-transparent"
                                    />
                                </motion.div>

                                {/* Status Dots */}
                                <div className="flex items-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0.3, scale: 0.8 }}
                                            animate={{ 
                                                opacity: [0.3, 1, 0.3],
                                                scale: [0.8, 1.2, 0.8]
                                            }}
                                            transition={{ 
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2
                                            }}
                                            className="w-1.5 h-1.5 rounded-full bg-sky-400"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}