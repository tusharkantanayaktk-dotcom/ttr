"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="px-4 bg-[var(--background)] pt-1 pb-4 sm:pb-6">
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto flex items-center justify-between gap-3 py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-xl bg-[var(--card)]/50 border border-[var(--border)] transition-all duration-300"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
             <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.1em] text-[var(--accent)] truncate">
               Build Your Site
             </h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[var(--muted)] font-medium leading-tight opacity-80 max-w-lg truncate sm:whitespace-normal">
            We build clean, fast websites and software for your business.
          </p>
        </div>

        <a
          href="https://wa.me/919178521537"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--foreground)] font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 shrink-0"
        >
          <FaWhatsapp size={14} className="text-green-500" />
          <span>Contact</span>
        </a>
      </motion.div>
    </section>
  );
}
