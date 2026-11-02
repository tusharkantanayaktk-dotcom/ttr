"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  CreditCard,
  Wallet,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useSupportConfig } from "@/lib/useSupportConfig";

/* =========================================================================
   COMPACT TOPIC CHIPS
   ========================================================================= */
const TOPIC_CHIPS = [
  { id: "Order Issue", label: "Orders", icon: ShoppingBag, color: "text-emerald-500" },
  { id: "Payment Issue", label: "Payment", icon: CreditCard, color: "text-amber-500" },
  { id: "Wallet Issue", label: "Wallet", icon: Wallet, color: "text-purple-500" },
  { id: "General Inquiry", label: "General", icon: MessageSquare, color: "text-sky-500" },
];

/* =========================================================================
   FREQUENTLY ASKED QUESTIONS
   ========================================================================= */
const FAQS = [
  {
    q: "How fast is delivery?",
    a: "Orders are processed automatically within 1 to 3 minutes via official server callbacks.",
  },
  {
    q: "UPI debited but order is pending?",
    a: "Banking servers sometimes take 2-5 minutes to confirm UPI callbacks. If not credited within 10 minutes, send your Order ID via WhatsApp for instant manual credit.",
  },
  {
    q: "How to top up wallet balance?",
    a: "Go to your Profile → Wallet → Top Up. Enter any amount (min ₹10) and scan the UPI QR. Wallet balance updates in seconds.",
  },
  {
    q: "What if an order fails permanently?",
    a: "If an order cannot be completed due to publisher maintenance, 100% of the funds are refunded instantly to your Tronics Wallet.",
  },
];

export default function QueryTab() {
  const supportConfig = useSupportConfig();
  const [queryType, setQueryType] = useState("Order Issue");
  const [userPhone, setUserPhone] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPhone = localStorage.getItem("phone");
    if (storedPhone && !userPhone) {
      setUserPhone(storedPhone);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryType || !userPhone.trim() || !queryMessage.trim()) return;

    setIsSubmitting(true);
    setStatus(null);

    const token = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");

    try {
      const res = await fetch("/api/support/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          email: storedEmail || null,
          phone: userPhone.trim(),
          type: queryType,
          message: queryMessage.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({
          type: "success",
          message: "Ticket registered! Our team will contact you shortly.",
        });
        setQueryMessage("");
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit ticket. Please message us on WhatsApp.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network issue. Please message us directly on WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">

      {/* ===================== COMPACT HEADER & QUICK ACTIONS ===================== */}
      <div className="space-y-4">
        {/* Title Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                Live Support Desk
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mt-0.5">
              Help & Support
            </h1>
          </div>

          {/* Instant WhatsApp Action Pill */}
          <a
            href={supportConfig.getWhatsAppChatUrl("Hello Tronics Support, I need help with my order")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all shadow-xs group cursor-pointer"
          >
            <FaWhatsapp className="text-sm group-hover:scale-110 transition-transform" />
            <span>Chat on WhatsApp</span>
            <ArrowUpRight size={12} className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Quick Contact Channels Strip */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={supportConfig.getWhatsAppChatUrl("Hello Tronics Support")}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.03] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FaWhatsapp className="text-emerald-500 text-sm shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[var(--foreground)] truncate">WhatsApp</div>
                <div className="text-[9px] text-[var(--muted)] font-mono truncate">Instant Reply</div>
              </div>
            </div>
            <ArrowUpRight size={11} className="text-[var(--muted)] group-hover:text-[var(--foreground)] shrink-0" />
          </a>

          <a
            href={supportConfig.whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.03] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FaWhatsapp className="text-emerald-400 text-sm shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[var(--foreground)] truncate">Channel</div>
                <div className="text-[9px] text-[var(--muted)] font-mono truncate">Updates</div>
              </div>
            </div>
            <ArrowUpRight size={11} className="text-[var(--muted)] group-hover:text-[var(--foreground)] shrink-0" />
          </a>

          <a
            href={supportConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.03] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FaInstagram className="text-pink-500 text-sm shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[var(--foreground)] truncate">Instagram</div>
                <div className="text-[9px] text-[var(--muted)] font-mono truncate">{`@${supportConfig.instagramLabel}`}</div>
              </div>
            </div>
            <ArrowUpRight size={11} className="text-[var(--muted)] group-hover:text-[var(--foreground)] shrink-0" />
          </a>
        </div>
      </div>

      {/* ===================== COMPACT TICKET FORM ===================== */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs relative">

        {/* Status Toast */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 mb-4 rounded-xl border flex items-center gap-2.5 text-xs ${
                status.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
              <span className="font-medium">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TOPIC COMPACT CHIPS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
              Issue Type
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TOPIC_CHIPS.map((chip) => {
                const active = queryType === chip.id;
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setQueryType(chip.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      active
                        ? "bg-[var(--accent)] text-black font-bold border-[var(--accent)] shadow-xs"
                        : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]/40"
                    }`}
                  >
                    <Icon size={13} className={active ? "text-black" : chip.color} />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTACT NUMBER */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
              WhatsApp Mobile Number
            </span>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-xs font-mono text-[var(--muted)]">
                <FaWhatsapp className="text-emerald-500 text-xs" />
                <span>+91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit number"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-14 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all"
              />
            </div>
          </div>

          {/* MESSAGE AREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                Message / Order ID
              </span>
              <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Zap size={10} />
                <span>Order ID = faster fix</span>
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Describe your issue (include your Order ID or Transaction ID)..."
              value={queryMessage}
              onChange={(e) => setQueryMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!queryType || !userPhone.trim() || !queryMessage.trim() || isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black font-extrabold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Submit Ticket</span>
                <Send size={12} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ===================== COMPACT FAQS ACCORDION ===================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
            Quick Answers (FAQs)
          </span>
          <span className="text-[9.5px] font-mono text-[var(--muted)]">Automated Help</span>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden shadow-xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--foreground)]/[0.02] transition-colors cursor-pointer gap-2"
                >
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[var(--muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[var(--accent)]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pt-0 text-[11.5px] text-[var(--muted)] leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
