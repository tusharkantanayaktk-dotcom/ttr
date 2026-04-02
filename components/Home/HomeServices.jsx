"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="py-4 px-4 bg-[var(--background)]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm relative overflow-hidden group transition-colors duration-300"
      >
        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
             <div className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
             <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] opacity-80">
               Premium Services
             </h3>
          </div>
          <h2 className="text-base font-black text-[var(--foreground)] tracking-tight leading-tight">
            Build Your Website
          </h2>
          <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5 max-w-[240px] leading-relaxed">
            Professional software development and high-quality web solutions for any business.
          </p>
        </div>

        <motion.a
          href="https://wa.me/919178521537"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="relative z-20 flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--accent)] !text-black font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-[var(--accent)]/20 transition-all cursor-pointer group/btn"
        >
          <FaWhatsapp size={18} className="!text-black drop-shadow-sm" />
          <span className="!text-black">Contact Us</span>
        </motion.a>
      </motion.div>
    </section>
  );
}
