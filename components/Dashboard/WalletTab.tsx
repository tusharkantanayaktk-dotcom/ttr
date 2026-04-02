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
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [storedPhone, setStoredPhone] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      setAmountError("Minimum ₹1");
      return;
    }
    if (!method) return alert("Select a payment method");

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
      alert("Error creating order");
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
    <div className="space-y-5 pb-6">
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
            Secure Credits Management
          </p>
        </div>
        <div className="h-8 px-3 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center gap-2">
            <FiShield size={12} className="text-[var(--accent)]" />
            <span className="text-[9px] font-black uppercase text-[var(--accent)]">Protected</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: ADD MONEY */}
        <div className="lg:col-span-7 space-y-6">

          {/* BALANCE CARD (Compact Premium) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-5 sm:p-7 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] shadow-xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] blur-[100px] rounded-full" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60 mb-2">
                  <FiTrendingUp className="text-[var(--accent)]" />
                  Available Credits
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--accent)]">₹</span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--foreground)] drop-shadow-sm">
                    {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-4 flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] opacity-40">User Identity</span>
                  <span className="text-[11px] font-mono font-bold text-[var(--foreground)] opacity-80">
                    {storedPhone ? `+91 ${storedPhone.slice(0, 3)}••••${storedPhone.slice(-3)}` : 'Anonymous Access'}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-[0_10px_30px_-5px_var(--accent)]/30 group-hover:scale-105 transition-transform duration-500">
                  <FaWallet className="text-2xl text-black" />
                </div>
                <div className="mt-4 flex -space-x-3 opacity-20 justify-end">
                  <div className="h-7 w-7 rounded-full bg-[var(--accent)]" />
                  <div className="h-7 w-7 rounded-full bg-[var(--foreground)]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ADD MONEY COMPONENT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)]/50 p-6 sm:p-8 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <FiPlus size={16} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Recharge Wallet</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-[var(--muted)] group-focus-within/input:text-[var(--accent)] transition-colors">₹</div>
                  <input
                    type="number"
                    value={amount}
                    placeholder="Enter Amount"
                    onChange={(e) => { setAmount(e.target.value); setAmountError(""); }}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] 
                                   focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all 
                                   text-2xl font-black placeholder:opacity-20 placeholder:font-bold"
                  />
                </div>
                {amountError && <p className="text-red-500 text-[9px] font-black uppercase pl-2">{amountError}</p>}

                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className="py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[9px] font-black uppercase tracking-tight
                                 hover:bg-[var(--accent)] hover:text-black transition-all active:scale-95"
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("upi")}
                    className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${method === "upi"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-inner"
                      : "border-[var(--border)] bg-[var(--background)]/30 hover:border-[var(--accent)]/30"
                      }`}
                  >
                    <div className={`p-2 rounded-lg transition-all ${method === "upi" ? "bg-[var(--accent)] text-black" : "bg-[var(--card)] text-[var(--muted)]"}`}>
                      <FiZap size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase">UPI Pay</p>
                      <p className="text-[9px] text-[var(--muted)] opacity-60">Instant Delivery</p>
                    </div>
                    {method === "upi" && <FiCheckCircle size={14} className="text-[var(--accent)] ml-auto" />}
                  </button>

                  <button disabled className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/20 opacity-30 cursor-not-allowed flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--card)] text-[var(--muted)]">
                      <FiCreditCard size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase">Crypto</p>
                      <p className="text-[9px] text-[var(--muted)]">Offline</p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={loading || !method}
                className="w-full py-5 rounded-2xl bg-[var(--accent)] text-black font-black uppercase tracking-[0.2em] text-[10px]
                           flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/30
                           hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {loading ? <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><span>Complete Recharge</span> <FiArrowRight /></>}
              </button>
            </div>
          </motion.div>
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
                        className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--card)] transition-all flex justify-between items-center group shadow-sm"
                    >
                        <div className="flex gap-3 items-center min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type.includes("add") || tx.type === "deposit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {tx.type.includes("add") || tx.type === "deposit" ? <FiPlus /> : <FiMinus />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[11px] uppercase tracking-tight text-[var(--foreground)] truncate leading-none mb-1">
                            {tx.type.replace("_", " ")}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-[var(--muted)] opacity-50">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                <span className="text-[8px] font-mono text-[var(--muted)] opacity-30 truncate max-w-[60px]">#{tx.transactionId.slice(-8)}</span>
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
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">Null History</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
