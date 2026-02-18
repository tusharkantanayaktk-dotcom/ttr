"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiCode,
  FiLayout,
  FiServer,
  FiTerminal
} from "react-icons/fi";

const SERVICES = [
  {
    icon: FiLayout,
    label: "UI/UX",
    title: "WEB DESIGN",
  },
  {
    icon: FiCode,
    label: "DEV",
    title: "FULL-STACK",
  },
  {
    icon: FiServer,
    label: "OPS",
    title: "SERVER MGMT",
  },
];

export default function HomeServices() {
  return (
    <section className="py-8 px-4 bg-[var(--background)] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--accent)]/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="
          max-w-5xl mx-auto
          relative rounded-[1.5rem]
          bg-gradient-to-br from-[var(--card)]/90 to-[var(--card)]/40
          backdrop-blur-xl
          border border-[var(--border)]/50
          p-5 md:p-8
          overflow-hidden
          shadow-2xl shadow-black/20
          flex flex-col md:flex-row items-center gap-8 justify-between
          group
        "
      >
        {/* SCANLINE EFFECT */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-0 bg-[length:100%_4px] pointer-events-none opacity-10" />

        {/* --- LEFT: TITLE & CTA --- */}
        <div className="flex flex-col md:items-start items-center text-center md:text-left gap-4 z-10 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_8px_var(--accent)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">System ID: SVC-PRO</span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-[var(--foreground)] leading-tight tracking-tight">
            CUSTOM <span className="text-[var(--accent)] italic">DIGITAL SOLUTIONS</span>
          </h3>

          <p className="text-[var(--muted)] text-[11px] font-bold uppercase tracking-wider leading-relaxed opacity-70 max-w-[280px]">
            Tactical development & high-performance infrastructure deployment.
          </p>

          <motion.a
            href="https://wa.me/919178521537"
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[var(--accent)] overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_var(--accent)]/40"
            whileTap={{ scale: 0.98 }}
          >
            <FaWhatsapp className="text-xl text-white z-10" />
            <div className="flex flex-col items-start leading-none z-10 text-white">
              <span className="text-[8px] uppercase tracking-widest font-black opacity-80">Sync Link</span>
              <span className="text-sm font-black tracking-tight">+91 63723 05866</span>
            </div>
          </motion.a>
        </div>

        {/* --- RIGHT: SERVICE GRID --- */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto z-10">
          {SERVICES.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="
                relative overflow-hidden
                flex flex-col items-center gap-2
                p-4 rounded-xl
                bg-[var(--background)]/40
                border border-[var(--border)]/50
                hover:border-[var(--accent)]/40
                transition-all duration-500
                min-w-[90px] sm:min-w-[120px]
                group/card
              "
            >
              {/* Card Scanline */}
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent top-0 group-hover/card:animate-scan-y pointer-events-none" />

              <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]/50 text-[var(--accent)] group-hover/card:scale-110 group-hover/card:border-[var(--accent)]/30 transition-all duration-500">
                <service.icon size={18} />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-[var(--accent)] tracking-[0.15em] opacity-70">{service.label}</span>
                <span className="text-[10px] font-black text-[var(--foreground)] mt-0.5">{service.title}</span>
              </div>

              {/* Decorative Brackets */}
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[var(--border)]/20 group-hover/card:border-[var(--accent)]/30 transition-colors" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[var(--border)]/20 group-hover/card:border-[var(--accent)]/30 transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* DECORATIVE TERMINAL TAG */}
        <div className="absolute bottom-3 right-5 hidden md:flex items-center gap-2 opacity-20 select-none">
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Data.active</span>
          <FiTerminal className="text-xs" />
        </div>
      </motion.div>
    </section>
  );
}
