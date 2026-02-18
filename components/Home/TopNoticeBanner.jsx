"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "hide_notice_banner";
const ROTATE_INTERVAL = 5000;

/* ================= ENV ================= */
const SUPPORT_WHATSAPP_URL =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL || "#";

/* ================= BANNERS ================= */
const BANNERS = [
  {
    id: "channel",
    title: "Join our WhatsApp Channel",
    subtitle: "Unlock exclusive deals & daily giveaways!",
    cta: "Join Now",
    link: SUPPORT_WHATSAPP_URL,
    icon: MessageCircle,
    color: "bg-green-500",
  },
  {
    id: "sale",
    title: "Flash Sale Alert! 🔥",
    subtitle: "Get up to 30% OFF on BGMI UC today.",
    cta: "Shop Now",
    link: "/games/bgmi",
    icon: ArrowRight,
    color: "bg-orange-500",
  },
  {
    id: "membership",
    title: "Become a Pro Member",
    subtitle: "Zero fees, instant delivery & priority support.",
    cta: "Upgrade",
    link: "/membership",
    icon: MessageCircle, // or a crown icon if available, generic fallback
    color: "bg-blue-500",
  },
];

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  /* ================= SHOW ONCE ================= */
  useEffect(() => {
    const hidden = sessionStorage.getItem(STORAGE_KEY);
    if (!hidden) setVisible(true);
  }, []);

  /* ================= ROTATE ================= */
  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BANNERS.length);
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  const banner = BANNERS[index];
  const Icon = banner.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-[40] bg-[var(--card)] border-b border-[var(--border)] overflow-hidden"
        >
          {/* BACKGROUND GLOW */}
          <div className="absolute inset-0 bg-linear-to-r from-[var(--accent)]/5 via-transparent to-[var(--accent)]/5 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-4 relative">

            {/* LINK WRAPPER */}
            <Link
              href={banner.link}
              className="flex-1 flex items-center justify-center sm:justify-start gap-3 group cursor-pointer"
            >
              {/* ICON BADGE */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full ${banner.color} flex items-center justify-center text-white shadow-lg shadow-${banner.color.split('-')[1]}-500/30 transform group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={14} fill="currentColor" className="text-white" />
              </div>

              {/* CONTENT ANIMATION */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-left overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={banner.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                  >
                    <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                      {banner.title}
                    </span>
                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--muted)]" />
                    <span className="text-xs sm:text-sm text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                      {banner.subtitle}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* CTA ARROW (MOBILE HIDDEN) */}
              <motion.div
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[var(--accent)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              >
                {banner.cta} <ArrowRight size={12} />
              </motion.div>
            </Link>

            {/* CLOSE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // setVisible(false); // Immediate visual feedback handled by AnimatePresence
                // Add a small delay effectively or just let exit animation play
                setVisible(false);
                sessionStorage.setItem(STORAGE_KEY, "true");
              }}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Close banner"
            >
              <X size={14} />
            </button>
          </div>

          {/* PROGRESS BAR (OPTIONAL, SUBTLE) */}
          <motion.div
            key={index}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: ROTATE_INTERVAL / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-[1px] bg-[var(--accent)]/30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
