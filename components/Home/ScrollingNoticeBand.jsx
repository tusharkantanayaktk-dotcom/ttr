"use client";

import { motion } from "framer-motion";

const NOTICES = [
  "Welcome to Tronics Top-Up",
  "Fast and Safe Top-Ups",
  "24x7 Auto Delivery",
  "Live Chat Support Available",
];

export default function ScrollingNoticeBand() {
  return (
    <div className="w-full bg-[var(--card)]/50 backdrop-blur-sm border-y border-[var(--border)]/10 py-3 overflow-hidden my-6">
      <motion.div
        className="flex whitespace-nowrap gap-24 w-max"
        animate={{ x: "-50%" }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...NOTICES, ...NOTICES].map((text, idx) => (
          <span key={idx} className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-50">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
