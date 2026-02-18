"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PremiumLoader - A high-end, futuristic loading component
 * Featuring glassmorphism, nested motion animations, and tactical aesthetics.
 *
 * @param {boolean} fullScreen - Whether the loader should cover the entire screen. Defaults to true.
 */
export default function PremiumLoader({ fullScreen = true }) {
  const [progress, setProgress] = useState(0);

  // Simulate progress for a more "active" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + Math.floor(Math.random() * 8) + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[var(--background)]/80 backdrop-blur-xl"
    : "relative w-full py-12 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] backdrop-blur-sm";

  return (
    <div className={containerClasses}>
      {/* Animated Background Highlights (Only for Full Screen) */}
      {fullScreen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent)] blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent)] blur-[150px]"
          />
        </div>
      )}

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center">

        {/* The "Core" Spinner */}
        <div className={`relative ${fullScreen ? 'w-32 h-32' : 'w-24 h-24'} flex items-center justify-center`}>

          {/* Outer Ring - Dashed Tactical */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--accent)]/30"
          />

          {/* Middle Ring - Glowing Sweep */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-2 border-transparent border-t-[var(--accent)] border-r-[var(--accent)]/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
            style={{
              boxShadow: '0 0 15px var(--accent)',
              filter: 'drop-shadow(0 0 5px var(--accent))'
            }}
          />

          {/* Inner Ring - Rapid Reverse */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border border-[var(--accent)]/40 border-b-[var(--accent)] shadow-[inset_0_0_10px_rgba(var(--accent-rgb),0.2)]"
          />

          {/* Center Pulsing Orb */}
          <motion.div
            animate={{
              scale: [0.85, 1.15, 0.85],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-4 rounded-full bg-[var(--accent)] shadow-[0_0_25px_var(--accent)]"
          />

          {/* Scanning Line Effect */}
          <motion.div
            animate={{
              translateY: [-60, 60, -60],
              opacity: [0, 0.5, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-[-20%] right-[-20%] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent blur-[1px]"
          />
        </div>

        {/* Loading Information */}
        <div className={`${fullScreen ? 'mt-12' : 'mt-8'} text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Status Text */}
            <div className="flex items-center gap-1 overflow-hidden">
              {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((char, i) => (
                <motion.span
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    delay: i * 0.1,
                    repeat: Infinity,
                    duration: 1.5,
                  }}
                  className={`${fullScreen ? 'text-sm' : 'text-xs'} font-bold tracking-[0.3em] text-[var(--foreground)]`}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Sub-status with Progress */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase font-medium tracking-widest text-[var(--muted)]">
                {progress < 40 ? "Initializing..." : progress < 80 ? "Loading Data..." : "Optimizing Assets..."} {progress}%
              </span>

              {/* Progress Bar Mini */}
              <div className={`${fullScreen ? 'w-48' : 'w-32'} h-[2px] bg-[var(--border)] rounded-full overflow-hidden mt-1`}>
                <motion.div
                  className="h-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tactical Ornament: Corners (Only for Full Screen) */}
      {fullScreen && (
        <div className="absolute inset-8 pointer-events-none border border-[var(--accent)]/10">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--accent)]/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--accent)]/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--accent)]/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--accent)]/50" />

          <div className="absolute top-1/2 left-0 w-2 h-[1px] bg-[var(--accent)]/30" />
          <div className="absolute top-1/2 right-0 w-2 h-[1px] bg-[var(--accent)]/30" />
        </div>
      )}
    </div>
  );
}
