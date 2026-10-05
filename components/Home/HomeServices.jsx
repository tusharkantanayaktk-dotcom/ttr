"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="px-4 bg-[var(--background)] pt-2 pb-8 sm:pb-10">
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] transition-all duration-300"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-blue-500" />
             <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.1em] text-blue-600">
               Build Your Site
             </h3>
          </div>
          <p className="text-xs text-[var(--muted)] font-medium leading-relaxed opacity-80 max-w-lg">
            We build clean, fast websites and software for your business.
          </p>
        </div>

        <a
          href="https://wa.me/919178521537"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-blue-600 font-black text-xs uppercase tracking-wider transition-colors active:scale-95 shrink-0"
        >
          <FaWhatsapp size={16} className="text-green-500" />
          <span>Contact</span>
        </a>
      </motion.div>
    </section>
  );
}
