"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Image from "next/image";
import { useSupportConfig } from "@/lib/useSupportConfig";

const STORAGE_KEY = "community_popup_dismissed_v14";

export default function CommunityPopup() {
  const supportConfig = useSupportConfig();
  const communityUrl = supportConfig.whatsappChannelUrl;
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
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Theme-aligned Wide Landscape Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[340px] sm:max-w-[390px] bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col ring-1 ring-white/10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="group absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white/70 hover:text-white flex items-center justify-center transition-all border border-white/15 hover:border-white/30 active:scale-95 shadow-md"
              aria-label="Close popup"
            >
              <X size={14} className="transition-transform duration-200 group-hover:rotate-90" />
            </button>

            {/* Clickable Wide Banner Image with SVG Badge */}
            <a
              href={communityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full aspect-[16/9] block overflow-hidden group bg-black cursor-pointer"
            >
              {/* Official Channel Floating SVG Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white/90 shadow-lg pointer-events-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide">Official Channel</span>
                {/* Verified SVG Badge */}
                <svg
                  className="w-3.5 h-3.5 text-emerald-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  />
                </svg>
              </div>

              <Image
                src="/join-whatsapp.jpg"
                alt="Join Us on WhatsApp"
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Subtle Bottom Ambient Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--card)] to-transparent pointer-events-none" />
            </a>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-between gap-3">
              <button
                onClick={handleClose}
                className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors uppercase tracking-wider px-2.5 py-1.5 rounded-lg hover:bg-white/5 active:scale-95"
              >
                Maybe Later
              </button>

              <a
                href={communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group px-4 py-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] !text-black font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[var(--accent)]/20 hover:shadow-[0_0_20px_var(--accent)]/30 active:scale-[0.97] transition-all"
              >
                {/* Crisp WhatsApp SVG Icon */}
                <FaWhatsapp className="text-sm !text-black shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="!text-black">Join Now</span>
                <ArrowRight size={13} className="!text-black transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
