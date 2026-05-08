"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const COMMUNITY_URL = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || "https://whatsapp.com/channel/0029Vb7jVuaLtOj7Q889qV1k";
const STORAGE_KEY = "community_popup_dismissed_v9";

export default function CommunityPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 4000);
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
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Compact Themed Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-[280px] bg-[var(--card)] border border-[var(--white)]/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-6 flex flex-col items-center gap-5">
              {/* Header Section */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/5">
                  <MessageSquare size={24} />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-black uppercase tracking-tight text-[var(--foreground)]">
                    Official Channel
                  </h2>
                  <p className="text-[9px] font-bold text-[var(--muted)]/60 uppercase tracking-widest">
                    Updates & Giveaways
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-2 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={COMMUNITY_URL}
                  size={100}
                  level="M"
                />
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <a
                  href={COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-[var(--accent)] flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <span className="text-black font-black uppercase tracking-[0.1em] italic text-xs">Join Now</span>
                  <ArrowRight size={14} className="text-black" />
                </a>

                <button
                  onClick={handleClose}
                  className="w-full text-[9px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-5 text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
