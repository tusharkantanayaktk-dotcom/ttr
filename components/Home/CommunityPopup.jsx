"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";

const COMMUNITY_URL = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || "https://whatsapp.com/channel/0029Vb7jVuaLtOj7Q889qV1k";
const STORAGE_KEY = "community_popup_dismissed_v14";

export default function CommunityPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Theme-aligned Wide Landscape Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[340px] sm:max-w-[380px] bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-[var(--background)]/80 backdrop-blur-md text-[var(--foreground)] hover:bg-[var(--background)] flex items-center justify-center transition-all border border-[var(--border)]"
              aria-label="Close popup"
            >
              <X size={14} />
            </button>

            {/* Clickable Wide Banner Image */}
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full aspect-[16/9] block overflow-hidden group bg-black"
            >
              <Image
                src="/join-whatsapp.jpg"
                alt="Join Us on WhatsApp"
                fill
                priority
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-between gap-3">
              <button
                onClick={handleClose}
                className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-wider px-2"
              >
                Maybe Later
              </button>

              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] !text-black font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <span className="!text-black">Join Now</span>
                <ArrowRight size={13} className="!text-black" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
