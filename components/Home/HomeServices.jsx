"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="px-4 bg-[var(--background)] !py-0">
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] group transition-all duration-300"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] text-blue-600">
               Build Your Site
             </h3>
          </div>
          <p className="text-[10px] text-[var(--muted)] font-medium leading-tight opacity-70 max-w-[220px]">
            We build clean, fast websites and software for your business.
          </p>
        </div>

        <motion.a
          href="https://wa.me/919178521537"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card)]/80 border border-[var(--border)] text-blue-600 font-black text-[10px] uppercase tracking-wider transition-all shadow-sm"
        >
          <FaWhatsapp size={16} className="text-green-500" />
          <span>Contact</span>
        </motion.a>
      </motion.div>
    </section>
  );
}
