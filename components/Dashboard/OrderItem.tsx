"use client";

import { useState } from "react";
import {
  FiShare2,
  FiCopy,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* ================= TYPES ================= */

export type OrderType = {
  orderId: string;
  gameSlug: string;
  itemName: string;
  playerId: string;
  zoneId: string;
  paymentMethod: string;
  price: number;
  status: string;
  topupStatus?: string;
  createdAt: string;
};

/* ================= GAME NAME ================= */

const getGameName = (slug: string) => {
  const s = (slug || "").toLowerCase();
  if (s.includes("mobile-legend") || s.includes("mlbb")) return "Mobile Legends";
  if (s.includes("pubg") || s.includes("bgmi")) return "BGMI";
  if (s.includes("free-fire") || s.includes("freefire")) return "Free Fire";
  if (s.includes("genshin")) return "Genshin Impact";
  if (s.includes("valorant")) return "Valorant";
  return slug
    .split("-")
    .filter((w) => !/\d{2,}$/.test(w))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || slug;
};

/* ================= MAIN ================= */

export default function OrderItem({ order }: { order: OrderType }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy order ID", err);
    }
  };

  const getDisplayStatus = () => {
    const s = (order.status || "").toLowerCase();
    const t = (order.topupStatus || "").toLowerCase();
    if (s === "refund" || t === "refund") return "refund";
    return t || s || "pending";
  };

  const currentStatus = getDisplayStatus();

  return (
    <>
      <div className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 hover:border-[var(--accent)]/40 transition-all p-3 sm:p-3.5 shadow-xs overflow-hidden">
        {/* Background Ambient Gaming Vector SVG Watermark */}
        <svg
          className="absolute -bottom-3 -right-3 w-28 h-28 opacity-[0.035] dark:opacity-[0.07] text-[var(--accent)] pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="6 3 18 3 22 9 12 22 2 9" />
          <line x1="2" y1="9" x2="22" y2="9" />
          <line x1="12" y1="22" x2="7" y2="9" />
          <line x1="12" y1="22" x2="17" y2="9" />
        </svg>

        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-[var(--accent)]/10 transition-colors pointer-events-none" />

        {/* ROW 1: Title + Price + Status + Receipt */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Pure Vector Gaming Icon (no card-like border) + Item Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 18 3 22 9 12 22 2 9" />
                <line x1="2" y1="9" x2="22" y2="9" />
                <line x1="12" y1="22" x2="7" y2="9" />
                <line x1="12" y1="22" x2="17" y2="9" />
              </svg>
            </div>

            <h3 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)] tracking-tight truncate leading-tight">
              {order.itemName}
            </h3>
          </div>

          {/* Right: Price + Status Badge + Receipt Button */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-black text-[var(--foreground)] tracking-tight">
              ₹{order.price.toFixed(2)}
            </span>

            {/* Status Badge */}
            <div className="flex items-center">
              {currentStatus === "success" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8.5px] font-black uppercase tracking-wider leading-none">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Success
                </span>
              )}
              {currentStatus === "pending" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8.5px] font-black uppercase tracking-wider leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending
                </span>
              )}
              {currentStatus === "failed" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8.5px] font-black uppercase tracking-wider leading-none">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Failed
                </span>
              )}
              {currentStatus === "refund" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8.5px] font-black uppercase tracking-wider leading-none">
                  Refunded
                </span>
              )}
            </div>

            {/* Receipt Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowReceipt(true)}
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg border border-[var(--border)]/80 hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black text-[var(--muted)] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ml-0.5"
              title="View Receipt"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V4a2 2 0 0 0-2-2z" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="16" y2="11" />
                <line x1="8" y1="15" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ROW 2: Order ID (with 1-click copy) + Date spanning full width to avoid collision */}
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono mt-1.5 pl-7 sm:pl-8">
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer group/copy"
            title="Click to copy full Order ID"
          >
            <span className="truncate max-w-[150px] sm:max-w-[260px]">
              #{order.orderId}
            </span>
            {copied ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold text-[8.5px] uppercase">
                <svg className="w-2.5 h-2.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </span>
            ) : (
              <svg className="w-3 h-3 opacity-40 group-hover/copy:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>

          <span>•</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>

        {/* ROW 3: Clean metadata bar */}
        <div className="mt-2.5 pt-2 border-t border-[var(--border)]/40 flex items-center justify-between gap-2 text-[10px] text-[var(--muted)] overflow-hidden">
          {/* Game & Player ID */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="inline-flex items-center gap-1 font-bold text-[var(--foreground)]/90 truncate shrink-0">
              <svg className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="4" />
                <path d="M6 12h4m-2-2v4" />
                <circle cx="15.5" cy="10" r="1" fill="currentColor" />
                <circle cx="17.5" cy="13" r="1" fill="currentColor" />
              </svg>
              <span className="truncate max-w-[95px] sm:max-w-none">{getGameName(order.gameSlug)}</span>
            </div>

            <span className="text-[var(--border)] shrink-0">•</span>

            <div className="inline-flex items-center gap-1 font-mono truncate">
              <svg className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="truncate">
                ID: <strong className="text-[var(--foreground)] font-bold">{order.playerId}</strong>
                {order.zoneId && order.zoneId !== "NA" && (
                  <span className="text-[var(--muted)]"> ({order.zoneId})</span>
                )}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="inline-flex items-center gap-1 uppercase font-bold text-[var(--foreground)]/80 shrink-0">
            {order.paymentMethod?.toLowerCase() === "wallet" ? (
              <svg className="w-3.5 h-3.5 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="13" rx="2.5" />
                <path d="M16 12h5v4h-5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity="0.25" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-[var(--muted)]" viewBox="0 0 24 24" fill="none">
                <path d="M14.2 3.5L8.5 13.5H13L10.5 20.5L18.5 9.5H13.8L16 3.5H14.2Z" fill="currentColor" />
              </svg>
            )}
            <span>{order.paymentMethod}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReceipt && (
          <ReceiptModal order={order} onClose={() => setShowReceipt(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ================= RECEIPT MODAL ================= */

function ReceiptModal({
  order,
  onClose,
}: {
  order: OrderType;
  onClose: () => void;
}) {
  const receiptText = `
ORDER RECEIPT
--------------------------
ORDER_ID:  ${order.orderId}
GAME:      ${getGameName(order.gameSlug)}
PLAYER:    ${order.playerId}
ZONE:      ${order.zoneId}
ITEM:      ${order.itemName}
PAYMENT:   ${order.paymentMethod.toUpperCase()}
DATE:      ${new Date(order.createdAt).toLocaleString()}
STATUS:    SUCCESS
--------------------------
`.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(receiptText);
    alert("LOG COPIED TO CLIPBOARD");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Order Receipt", text: receiptText });
    } else {
      await navigator.clipboard.writeText(receiptText);
      alert("SHARE NOT SUPPORTED. LOG COPIED.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] 
                   rounded-3xl p-6 sm:p-8 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />

        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
        >
          <FiX size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-3 border border-[var(--accent)]/20 shadow-xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="6 3 18 3 22 9 12 22 2 9" />
              <line x1="2" y1="9" x2="22" y2="9" />
              <line x1="12" y1="22" x2="7" y2="9" />
              <line x1="12" y1="22" x2="17" y2="9" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Order Receipt
          </h2>
        </div>

        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 mb-6">
          <pre className="text-[10px] sm:text-xs text-[var(--foreground)] font-mono whitespace-pre-wrap leading-relaxed">
            {receiptText}
          </pre>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-wider text-[10px]
                       bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]
                       hover:border-[var(--accent)]/50 transition-all active:scale-95"
          >
            <FiCopy className="text-sm" /> Copy
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-wider text-[10px]
                       bg-[var(--accent)] text-white
                       hover:brightness-110 transition-all active:scale-95"
          >
            <FiShare2 className="text-sm" /> Share
          </button>
        </div>
      </motion.div>
    </div>
  );
}

