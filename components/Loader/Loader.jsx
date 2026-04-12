"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/public/logo.png";

/**
 * SimpleLoader - A clean, fast, and user-friendly loader.
 * Replaces the complex orbital animation with a premium pulse logo.
 */
export default function Loader({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)] overflow-hidden"
    : "relative w-full py-24 flex flex-col items-center justify-center bg-transparent overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[var(--accent)]/10 blur-[80px] rounded-full" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Pulsing Logo */}
        <div
          className="relative mb-8"
        >
          <Image
            src={logo}
            alt="Logo"
            width={120}
            height={40}
            priority
            className="object-contain"
          />
          
          {/* Subtle underline glow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[var(--accent)]/40 blur-[2px]" />
        </div>

        {/* Simplified Progress / Text */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
                className="w-1 h-1 rounded-full bg-[var(--accent)]"
              />
            ))}
          </div>
          
          <motion.p
            animate={{ opacity: [0.4, 0.5, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--foreground)]/60"
          >
            Just a moment...
          </motion.p>
        </div>
      </div>

      {/* Simplified Corner Accents */}
      {fullScreen && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <div className="absolute top-6 left-6 w-12 h-px bg-[var(--accent)]" />
          <div className="absolute top-6 left-6 w-px h-12 bg-[var(--accent)]" />
          <div className="absolute bottom-6 right-6 w-12 h-px bg-[var(--accent)]" />
          <div className="absolute bottom-6 right-6 w-px h-12 bg-[var(--accent)]" />
        </div>
      )}
    </div>
  );
}

