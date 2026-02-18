"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * AtomicPulseLoader - A sophisticated, orbit-based futuristic loader.
 * Features 3-axis orbital rings and a core "singularity" glow.
 */
export default function PremiumLoader({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508] overflow-hidden"
    : "relative w-full py-24 flex flex-col items-center justify-center bg-transparent overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Background Ambient Depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative flex flex-col items-center">

        {/* Orbital Assembly */}
        <div className="relative w-32 h-32 flex items-center justify-center">

          {/* Ring 1 - Vertical Orbit */}
          <motion.div
            animate={{ rotateX: 360, rotateY: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-[var(--accent)]/20"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]" />
          </motion.div>

          {/* Ring 2 - Slanted Orbit */}
          <motion.div
            animate={{ rotateX: -360, rotateZ: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-[var(--accent)]/15"
            style={{ transformStyle: "preserve-3d", rotate: "45deg" }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent-hover)] shadow-[0_0_10px_var(--accent-hover)]" />
          </motion.div>

          {/* Ring 3 - Horizontal Orbit */}
          <motion.div
            animate={{ rotateY: 360, rotateZ: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 rounded-full border border-[var(--accent)]/10"
            style={{ transformStyle: "preserve-3d", rotate: "-45deg" }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
          </motion.div>

          {/* The Nucleus */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 0.7, 0.4],
              boxShadow: [
                "0 0 20px rgba(var(--accent-rgb), 0.2)",
                "0 0 50px rgba(var(--accent-rgb), 0.5)",
                "0 0 20px rgba(var(--accent-rgb), 0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-6 rounded-full bg-[var(--accent)] relative z-10"
          >
            <div className="absolute inset-0 rounded-full bg-white/20 blur-[2px]" />
          </motion.div>

        </div>

        {/* Brand/Status Module */}
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/90">
                Tronics <span className="text-[var(--accent)]">Core</span>
              </span>
            </div>

            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

            <motion.p
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-3 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30"
            >
              Establishing Secure Connection...
            </motion.p>
          </motion.div>
        </div>

      </div>

      {/* Decorative HUD Elements */}
      {fullScreen && (
        <>
          <div className="absolute top-12 left-12 w-24 h-px bg-gradient-to-r from-[var(--accent)]/30 to-transparent" />
          <div className="absolute top-12 left-12 w-px h-12 bg-gradient-to-b from-[var(--accent)]/30 to-transparent" />

          <div className="absolute bottom-12 right-12 w-24 h-px bg-gradient-to-l from-[var(--accent)]/30 to-transparent" />
          <div className="absolute bottom-12 right-12 w-px h-12 bg-gradient-to-t from-[var(--accent)]/30 to-transparent" />

          <div className="absolute bottom-12 left-12 opacity-10">
            <div className="grid grid-cols-2 gap-1 font-mono text-[7px] text-white">
              <span>SYS_AUTH:</span> <span className="text-[var(--accent)]">OK</span>
              <span>DATA_SYNC:</span> <span className="text-[var(--accent)]">WAIT</span>
              <span>ENCR_LAY:</span> <span className="text-[var(--accent)]">AES-256</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
