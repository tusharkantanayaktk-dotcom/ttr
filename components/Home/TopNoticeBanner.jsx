"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  MessageCircle,
  Zap,
  ShieldCheck,
  Clock,
  Gift,
  Star,
  Info,
  AlertCircle,
  Sparkles,
  Bell,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Link from "next/link";

const STORAGE_KEY = "hide_notice_banner_v4";

const ICON_MAP = {
  MessageCircle,
  Zap,
  ShieldCheck,
  Clock,
  Gift,
  Star,
  Info,
  AlertCircle,
  Sparkles,
  Bell,
  FaWhatsapp,
  WhatsApp: FaWhatsapp,
  whatsapp: FaWhatsapp,
};

function getNoticeIcon(current) {
  if (!current) return MessageCircle;
  const title = (current.title || "").toLowerCase();
  const link = (current.link || "").toLowerCase();
  if (
    current.icon === "WhatsApp" ||
    current.icon === "FaWhatsapp" ||
    title.includes("whatsapp") ||
    link.includes("whatsapp") ||
    link.includes("wa.me")
  ) {
    return FaWhatsapp;
  }
  return ICON_MAP[current.icon] || MessageCircle;
}

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [config, setConfig] = useState({ enabled: false, notices: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/top-notice")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setConfig(data.data);
          if (data.data.enabled && data.data.notices && data.data.notices.length > 0) {
            if (!localStorage.getItem(STORAGE_KEY)) {
              setTimeout(() => setVisible(true), 800);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Top notice fetch failed", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!visible || !config.notices || config.notices.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % config.notices.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible, config.notices]);

  const closeBanner = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (loading || !visible || !config.enabled || !config.notices || config.notices.length === 0) return null;

  const current = config.notices[index];
  const Icon = getNoticeIcon(current);
  const isExternal = Boolean(current.link && (current.link.startsWith("http://") || current.link.startsWith("https://")));

  const ContentBody = (
    <div className="flex-1 min-w-0 flex items-center gap-2.5 sm:gap-3.5">
      {/* Icon Badge */}
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-md shadow-[var(--accent)]/20"
        style={{
          background: current.color
            ? `linear-gradient(135deg, ${current.color}, ${current.color}dd)`
            : "linear-gradient(135deg, var(--accent), var(--accent-hover))",
          color: "#ffffff",
        }}
      >
        <Icon size={15} strokeWidth={2.4} />
      </div>

      {/* Official Status Indicator */}
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]"></span>
        </span>
        <span>Official</span>
      </span>

      {/* Dynamic Animated Content */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || index}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center flex-wrap sm:flex-nowrap gap-x-2 gap-y-0.5 min-w-0"
          >
            <span className="font-extrabold text-xs sm:text-sm text-[var(--foreground)] tracking-tight truncate">
              {current.title}
            </span>

            {current.desc && (
              <span className="text-[11px] sm:text-xs text-[var(--muted)] font-medium hidden md:inline truncate">
                • {current.desc}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Index Pill (if multiple notices) */}
      {config.notices.length > 1 && (
        <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md bg-[var(--foreground)]/5 border border-[var(--border)] text-[9px] font-bold text-[var(--muted)] shrink-0">
          {index + 1}/{config.notices.length}
        </span>
      )}

      {/* Premium CTA Pill Button */}
      <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[var(--accent)]/25 group-hover:shadow-[0_0_15px_var(--accent)]/40 transition-all shrink-0 active:scale-95">
        <span>{current.cta || "Join"}</span>
        <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-[70] select-none overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-12 pt-2 sm:pt-2.5 pb-1">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/[0.08] via-[var(--card)] to-[var(--accent)]/[0.05] dark:from-[var(--accent)]/[0.15] dark:via-[var(--card)] dark:to-[var(--accent)]/[0.08] backdrop-blur-xl shadow-lg shadow-[var(--accent)]/5 hover:shadow-[var(--accent)]/10 transition-all duration-300">
              {/* Top ambient iridescent accent line */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />
              {/* Subtle ambient light glow */}
              <div className="absolute -left-10 -top-10 w-28 h-28 bg-[var(--accent)]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-3.5 relative">
                {isExternal ? (
                  <a
                    href={current.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 flex items-center group cursor-pointer"
                  >
                    {ContentBody}
                  </a>
                ) : (
                  <Link
                    href={current.link || "/"}
                    className="flex-1 min-w-0 flex items-center group cursor-pointer"
                  >
                    {ContentBody}
                  </Link>
                )}

                {/* Clean Close Button */}
                <button
                  onClick={closeBanner}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 active:scale-90 transition-all shrink-0 border border-transparent hover:border-[var(--border)]"
                  aria-label="Close notification"
                >
                  <X size={14} className="transition-transform duration-200 hover:rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
