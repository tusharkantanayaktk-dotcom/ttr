"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, MessageCircle, Zap, ShieldCheck, Clock, Gift, Star, Info, AlertCircle } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "hide_notice_banner_v3";

const ICON_MAP = {
  MessageCircle, Zap, ShieldCheck, Clock, Gift, Star, Info, AlertCircle
};

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [config, setConfig] = useState({ enabled: false, notices: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/top-notice")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setConfig(data.data);
          if (data.data.enabled && data.data.notices && data.data.notices.length > 0) {
            if (!localStorage.getItem(STORAGE_KEY)) {
              setTimeout(() => setVisible(true), 1200);
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
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
  const Icon = ICON_MAP[current.icon] || MessageCircle;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="relative z-[70] bg-[var(--card)] border-b border-[var(--border)] backdrop-blur-md select-none overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 relative">
            <Link
              href={current.link || "/"}
              className="flex-1 min-w-0 flex items-center gap-2.5 group"
            >
              {/* Sleek Icon Badge */}
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{ 
                  backgroundColor: current.color ? `${current.color}15` : "var(--accent)/15", 
                  color: current.color || "var(--accent)" 
                }}
              >
                <Icon size={13} strokeWidth={2.2} />
              </div>

              {/* Dynamic Animated Content */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id || index}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs"
                  >
                    <span className="font-bold text-[var(--foreground)] truncate">
                      {current.title}
                    </span>

                    {current.desc && (
                      <span className="text-[var(--muted)] hidden md:inline truncate font-normal">
                        — {current.desc}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] group-hover:underline text-[11px] sm:text-xs shrink-0">
                      {current.cta || "View"} <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Link>

            {/* Clean Close Button */}
            <button
              onClick={closeBanner}
              className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
