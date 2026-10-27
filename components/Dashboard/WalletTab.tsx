"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiShield,
  FiTrendingUp,
  FiActivity,
  FiZap
} from "react-icons/fi";
import { FaWallet, FaIndianRupeeSign } from "react-icons/fa6";

interface WalletTabProps {
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
}

export default function WalletTab({
  walletBalance,
  setWalletBalance,
}: WalletTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [storedPhone, setStoredPhone] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleAmountChange = (raw: string) => {
    // Strip minus signs and non-numeric characters (allow only digits and single decimal)
    const sanitized = raw.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    const clean = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized;

    setAmount(clean);
    if (clean !== "" && Number(clean) < 1) {
      setAmountError("Minimum amount is ₹1.");
    } else {
      setAmountError("");
    }
  };

  const fetchTransactions = useCallback(async (p = 1, quiet = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!quiet) setLoadingTransactions(true);
    try {
      const res = await fetch(`/api/user/wallet/transactions?page=${p}&limit=6`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
        setPage(data.pagination?.page || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!quiet) setLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    const phone = localStorage.getItem("phone");
    if (phone) setStoredPhone(phone);
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleProceed = async () => {
    if (!amount || Number(amount) < 1) {
      setAmountError("Minimum amount is ₹1.");
      return;
    }
    if (!method) return alert("Please select a payment method.");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/wallet/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), mobile: storedPhone }),
      });
      const data = await res.json();
      if (data.success) window.location.href = data.paymentUrl;
      else alert(data.message);
    } catch (err) {
      alert("Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orderId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/wallet/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.newWallet);
        fetchTransactions(page, true);
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-[var(--foreground)] uppercase italic">
            My <span className="text-[var(--accent)]">Wallet</span>
          </h2>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">
            Balance
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT: BALANCE & RECHARGE (CLEAN, CARDLESS, PREMIUM) */}
        <div className="lg:col-span-7 space-y-6">

          {/* BALANCE HERO (NO CARD BORDER, AMBIENT BACKGROUND SVG) */}
          <div className="relative pb-4 border-b border-[var(--border)]/50 overflow-hidden">
            {/* Ambient Wallet Vector SVG Watermark */}
            <svg
              className="absolute -bottom-2 -right-2 w-28 h-28 opacity-[0.035] dark:opacity-[0.06] text-[var(--accent)] pointer-events-none select-none transition-transform duration-500 hover:scale-105"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M16 3H4a2 2 0 0 0-2 2v2h18V5a2 2 0 0 0-2-2z" />
              <circle cx="16" cy="14" r="1.5" />
            </svg>

            <div className="flex items-start justify-between relative">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  Available Balance
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[var(--accent)]">₹</span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--foreground)]">
                    {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-xs font-mono text-[var(--muted)] mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{storedPhone ? `+91 ${storedPhone.slice(0, 3)}••••${storedPhone.slice(-3)}` : 'Active Account'}</span>
                </div>
              </div>

              {/* Pure Floating Vector SVG Icon (No card-like box or border) */}
              <div className="text-[var(--accent)] flex items-center justify-center shrink-0 pr-1">
                <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  <path d="M16 3H4a2 2 0 0 0-2 2v2h18V5a2 2 0 0 0-2-2z" />
                  <circle cx="16" cy="14" r="1.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* RECHARGE INPUT & CHIPS */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                Enter Amount to Add
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--accent)] pointer-events-none">₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  placeholder="0.00"
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border bg-[var(--card)]/40 
                             focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all 
                             text-xl font-bold placeholder:opacity-20 shadow-xs ${
                               amountError ? "border-rose-500/80 focus:border-rose-500" : "border-[var(--border)]"
                             }`}
                />
              </div>
              {amountError && (
                <div className="flex items-center gap-1.5 text-rose-500 text-[11px] font-semibold mt-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{amountError}</span>
                </div>
              )}

              {/* Quick Amount Chips */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                {[100, 500, 1000, 2000].map((val) => {
                  const isSelected = amount === val.toString();
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val.toString());
                        setAmountError("");
                      }}
                      className={`py-1.5 sm:py-2 rounded-lg border text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-extrabold shadow-xs"
                          : "border-[var(--border)]/70 bg-[var(--card)]/30 text-[var(--foreground)]/80 hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                      }`}
                    >
                      +₹{val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)] block mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMethod("upi")}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    method === "upi"
                      ? "border-[var(--accent)] bg-[var(--accent)]/[0.08]"
                      : "border-[var(--border)]/70 bg-[var(--card)]/30 hover:border-[var(--border)]"
                  }`}
                >
                  <div className="w-7 h-7 flex items-center justify-center text-[var(--accent)] shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h7v8l10-12h-7z" />
                    </svg>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold leading-none">UPI Pay</p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Instant recharge</p>
                  </div>
                  {method === "upi" && (
                    <FiCheckCircle size={16} className="text-[var(--accent)] shrink-0" />
                  )}
                </button>

                <button
                  disabled
                  type="button"
                  className="p-3 rounded-xl border border-[var(--border)]/40 bg-[var(--card)]/10 opacity-40 cursor-not-allowed flex items-center gap-3"
                >
                  <div className="w-7 h-7 flex items-center justify-center text-[var(--muted)] shrink-0">
                    <FiCreditCard size={17} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold leading-none">Crypto</p>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Offline</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleProceed}
              disabled={loading || !method || !amount || Number(amount) < 1}
              className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-black uppercase tracking-wider text-xs
                         flex items-center justify-center gap-2 shadow-md shadow-[var(--accent)]/20
                         hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Add Money</span>
                  <FiArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: TRANSACTIONS (Tight Layout) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FiActivity size={16} className="text-[var(--accent)]" />
                <h3 className="text-sm font-black uppercase tracking-widest leading-none">History</h3>
            </div>
            <span className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40">Recent Activity</span>
          </div>

          <div className="space-y-2.5">
            {loadingTransactions ? (
              [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-16 animate-pulse bg-[var(--card)]/30 rounded-2xl border border-[var(--border)]" />)
            ) : transactions.length > 0 ? (
              <>
                <AnimatePresence mode="popLayout">
                    {transactions.map((tx) => (
                    <motion.div
                        layout
                        key={tx._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--card)] transition-all flex justify-between items-center group shadow-sm"
                    >
                        <div className="flex gap-3 items-center min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type.includes("add") || tx.type === "deposit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {tx.type.includes("add") || tx.type === "deposit" ? <FiPlus size={12} /> : <FiMinus size={12} />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[11px] uppercase tracking-tight text-[var(--foreground)] truncate leading-none mb-1">
                            {tx.type.replace("_", " ")}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-[var(--muted)]">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                <span className="text-[9px] font-mono text-[var(--muted)] font-medium truncate max-w-[80px]">#{tx.transactionId.slice(-8)}</span>
                            </div>
                        </div>
                        </div>
                        <div className="text-right shrink-0">
                        <p className={`font-black text-sm ${tx.type.includes("add") || tx.type === "deposit" ? "text-green-500" : "text-red-500"}`}>
                            {tx.type.includes("add") || tx.type === "deposit" ? "+" : "-"}₹{tx.amount.toFixed(0)}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                            {tx.status === "pending" && tx.type === "deposit" && (
                            <button onClick={() => handleVerify(tx.transactionId)} className="text-[8px] px-2 py-0.5 rounded-lg bg-[var(--accent)] text-black font-black uppercase tracking-tighter hover:brightness-110 active:scale-95 transition shadow-sm shadow-[var(--accent)]/30">Verify</button>
                            )}
                            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${tx.status === "success" ? "bg-green-500/5 text-green-500 border-green-500/10" : "bg-yellow-500/5 text-yellow-500 border-yellow-500/10"}`}>
                            {tx.status}
                            </span>
                        </div>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                    <button onClick={() => fetchTransactions(page - 1)} disabled={page === 1} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] disabled:opacity-20 transition-all"><FiArrowRight size={14} className="rotate-180" /></button>
                    <span className="text-[10px] font-black text-[var(--foreground)]">{page} <span className="opacity-20">/</span> {totalPages}</span>
                    <button onClick={() => fetchTransactions(page + 1)} disabled={page === totalPages} className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] disabled:opacity-20 transition-all"><FiArrowRight size={14} /></button>
                    </div>
                )}
              </>
            ) : (
                <div className="text-center py-12 rounded-3xl border-2 border-dashed border-[var(--border)] opacity-40">
                    <FiActivity size={24} className="mx-auto mb-2 text-[var(--muted)]" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">No History Yet</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
