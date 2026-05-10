"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, MessageCircle, Zap, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "hide_notice_banner_v3";
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || "https://whatsapp.com/channel/0029Vb7jVuaLtOj7Q889qV1k";

const NOTICES = [
  {
    id: "whatsapp",
    icon: MessageCircle,
    color: "var(--accent)",
    title: "Official Community",
    desc: "Join our WhatsApp for daily giveaways",
    cta: "Join Now",
    link: WHATSAPP_URL
  },
  {
    id: "delivery",
    icon: Zap,
    color: "#fbbf24",
    title: "Instant Delivery",
    desc: "99% of orders completed in < 2 mins",
    cta: "View Stats",
    link: WHATSAPP_URL
  },
  {
    id: "support",
    icon: ShieldCheck,
    color: "#10b981",
    title: "Verified Secure",
    desc: "Official partners for all major games",
    cta: "Learn More",
    link: WHATSAPP_URL
  }
];

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NOTICES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  const closeBanner = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!visible) return null;

  const current = NOTICES[index];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="relative z-[70] bg-[var(--card)]/80 border-b border-[var(--border)] backdrop-blur-2xl overflow-hidden group/banner"
        >
          {/* Animated Mesh Gradient Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent blur-3xl animate-pulse" />
            <div className="absolute top-0 -right-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent blur-3xl animate-pulse delay-700" />
          </div>

          {/* Particle System Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  x: [0, 5, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-1 rounded-full bg-[var(--accent)]"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 18}%`
                }}
              />
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-4 h-10 sm:h-12 flex items-center justify-between gap-4 relative">
            <Link
              href={current.link}
              className="flex-1 h-full flex items-center gap-4 sm:gap-10 overflow-hidden group/link"
            >
              {/* STATUS HUB */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-xl bg-[var(--background)] border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40" />
                    <div className="relative w-full h-full bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40 whitespace-nowrap">Broadcast</span>
                </div>
                <div className="w-[1px] h-3 bg-[var(--border)]" />
                <div className="flex items-center gap-1.5">
                  <Clock size={10} className="text-[var(--muted)]" />
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* DYNAMIC CONTENT SWITCHER */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150 }}
                    className="flex items-center gap-3 sm:gap-5 w-full"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center relative overflow-hidden group-hover/link:border-[var(--accent)]/30 transition-colors shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--accent)]/5 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      <Icon size={16} style={{ color: current.color }} className="relative z-10 group-hover/link:scale-110 transition-transform" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[11px] font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                          {current.title}
                        </h4>
                        <span className="hidden md:block px-1.5 py-0.5 rounded-md bg-[var(--accent)]/[0.08] text-[var(--accent)] text-[7px] font-black uppercase tracking-widest">New</span>
                      </div>
                      <p className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest mt-1 truncate group-hover/link:text-[var(--foreground)] transition-colors leading-none">
                        {current.desc}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ACTION CTA */}
              <div className="hidden lg:flex items-center gap-2 group/cta">
                <span className="text-[10px] font-black italic uppercase tracking-[0.2em] text-[var(--accent)] opacity-80 group-hover/cta:opacity-100 group-hover/cta:translate-x-[-4px] transition-all">
                  {current.cta}
                </span>
                <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 group-hover/cta:scale-110 transition-all">
                  <ArrowRight size={12} strokeWidth={3} />
                </div>
              </div>
            </Link>

            {/* CLOSE ACTION */}
            <button
              onClick={closeBanner}
              className="w-8 h-8 rounded-2xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all group/close shrink-0"
            >
              <X size={14} className="group-hover/close:rotate-90 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
