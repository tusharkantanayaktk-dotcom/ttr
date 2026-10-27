"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Clock,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RefreshCcw,
  Wallet,
  X,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert
} from "lucide-react";

export default function WalletTab() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState("add"); // add or remove
  const [adjustDescription, setAdjustDescription] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [totalWalletCredit, setTotalWalletCredit] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedKey, setCopiedKey] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("wallets"); // "wallets" | "history"
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  const limit = 10;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const filteredTransactions = transactions.filter((tx) => {
    if (historyStatusFilter !== "all" && tx.status !== historyStatusFilter) {
      return false;
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchTid = tx.transactionId?.toLowerCase().includes(q);
      const matchUser = tx.userId?.toLowerCase().includes(q);
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchType = tx.type?.toLowerCase().includes(q);
      if (!matchTid && !matchUser && !matchDesc && !matchType) return false;
    }
    return true;
  });

  // 300ms debounce for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "wallet",
        order: "desc",
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        setTotalWalletCredit(data.totalWalletCredit || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch users failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/wallet/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (err) {
      console.error("Fetch transactions failed", err);
    }
  };

  const handleAdjustWallet = async () => {
    const numAmount = parseFloat(adjustAmount);
    if (!selectedUser || isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage({ type: "error", text: "Please enter a valid amount greater than 0" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch("/api/admin/wallet/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.userId || selectedUser._id,
          amount: numAmount,
          type: adjustType,
          description: adjustDescription,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: `Wallet successfully ${adjustType === "add" ? "credited" : "debited"} with ₹${numAmount}!`,
        });
        setAdjustAmount("");
        setAdjustDescription("");
        setSelectedUser(null);
        fetchUsers();
        fetchTransactions();
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to adjust wallet" });
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
      }
    } catch (err) {
      console.error("Adjust wallet error", err);
      setStatusMessage({ type: "error", text: "Network error occurred" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] truncate flex items-center gap-2">
            <Wallet size={18} className="text-[var(--accent)] shrink-0" />
            User Wallets
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
            Manage customer balances and review wallet credit transactions
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            <CreditCard size={13} className="text-[var(--accent)]" />
            <span>₹{totalWalletCredit.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Total</span>
          </div>

          <button
            onClick={() => {
              fetchUsers();
              fetchTransactions();
            }}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
            title="Refresh"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATUS NOTIFICATION ================= */}
      <AnimatePresence>
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOP TAB TOGGLE ================= */}
      <div className="flex p-1 bg-[var(--card)]/80 border border-[var(--border)] rounded-xl gap-1 w-full sm:max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("wallets")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "wallets"
              ? "bg-[var(--accent)] text-black shadow-xs font-extrabold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <User size={13} />
          <span>User Wallets</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "wallets"
                ? "bg-black/15 text-black"
                : "bg-[var(--foreground)]/[0.08] text-[var(--muted)]"
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "history"
              ? "bg-[var(--accent)] text-black shadow-xs font-extrabold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Clock size={13} />
          <span>Activity History</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "history"
                ? "bg-black/15 text-black"
                : "bg-[var(--foreground)]/[0.08] text-[var(--muted)]"
            }`}
          >
            {transactions.length}
          </span>
        </button>
      </div>

      {/* ================= USERS SECTION ================= */}
      {activeTab === "wallets" && (
        <div className="space-y-2.5">
          {/* Section Header & Continuous Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-0.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
              <User size={13} className="text-[var(--accent)]" />
              Wallet Balances ({users.length})
            </span>

          {/* Search Pill */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search user name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-[var(--card)]/80 border border-[var(--border)] text-xs font-semibold focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* User Wallets Content */}
        {loading ? (
          <div className="p-10 text-center text-xs font-semibold text-[var(--muted)] animate-pulse border border-[var(--border)] rounded-xl bg-[var(--card)]/40">
            Loading user balances...
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                  <tr className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-[var(--foreground)]/[0.025] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-black text-xs shrink-0">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--foreground)] truncate">{user.name || "N/A"}</p>
                            <p className="text-[10px] text-[var(--muted)] truncate">{user.email || user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-[var(--muted)]">
                        {user.userId || user._id}
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-sm text-[var(--accent)] tabular-nums">
                        ₹{(user.wallet || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1 rounded-lg bg-[var(--accent)] text-black text-xs font-extrabold shadow-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-xs text-[var(--muted)]">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE RESPONSIVE CARDS (PREVENTS HORIZONTAL OVERFLOW) */}
            <div className="md:hidden space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] transition-all flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-black text-xs shrink-0">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                        {user.name || "N/A"}
                      </p>
                      <p className="text-[10px] text-[var(--muted)] truncate mt-0.5">
                        {user.email || user.phone || "No contact"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase block leading-none mb-0.5">
                        Balance
                      </span>
                      <span className="text-xs font-black text-[var(--accent)] tabular-nums leading-none">
                        ₹{(user.wallet || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-black font-extrabold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-10 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
                  No users found
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 px-0.5 text-xs">
                <span className="text-[11px] font-semibold text-[var(--muted)]">
                  Page <b className="text-[var(--foreground)]">{page}</b> of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* ================= GLOBAL WALLET ACTIVITY ================= */}
      {activeTab === "history" && (
        <div className="space-y-2.5">
          {/* Activity Header & Search/Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-0.5">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {["all", "success", "pending", "failed"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setHistoryStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    historyStatusFilter === status
                      ? "bg-[var(--accent)] text-black shadow-xs"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* History Search Pill */}
            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search TID, user ID, remark..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-[var(--card)]/80 border border-[var(--border)] text-xs font-semibold focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/50"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/60 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
              <tr className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">
                <th className="px-4 py-3">TID</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Balance After</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/60">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.type === "deposit" || tx.type === "admin_add" || tx.type === "refund";
                return (
                  <tr key={tx._id} className="hover:bg-[var(--foreground)]/[0.025] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[10px] font-bold text-[var(--foreground)]">
                      {tx.transactionId}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-[var(--muted)]">
                      {tx.userId}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold tracking-wider ${
                          isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-black text-xs ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                      {isPositive ? "+" : "-"}₹{tx.amount}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[var(--muted)]">
                      ₹{tx.balanceAfter?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          tx.status === "success"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : tx.status === "pending"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-[var(--muted)]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {tx.status === "pending" && tx.type === "deposit" && (
                          <button
                            onClick={async () => {
                              if (!confirm("Check payment gateway for this deposit?")) return;
                              try {
                                const res = await fetch("/api/admin/wallet/verify", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ orderId: tx.transactionId }),
                                });
                                const data = await res.json();
                                alert(data.message);
                                fetchTransactions();
                                fetchUsers();
                              } catch (err) {
                                alert("Verification failed");
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-[var(--accent)] text-black text-[9px] font-black uppercase hover:brightness-105 cursor-pointer"
                          >
                            Verify
                          </button>
                        )}

                        {tx.status !== "success" && (
                          <button
                            onClick={async () => {
                              if (!confirm("Manually mark this transaction as SUCCESS?")) return;
                              try {
                                const res = await fetch("/api/admin/wallet/mark-success", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ orderId: tx.transactionId }),
                                });
                                const data = await res.json();
                                alert(data.message);
                                fetchTransactions();
                                fetchUsers();
                              } catch (err) {
                                alert("Failed to mark success");
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-extrabold uppercase hover:bg-emerald-500 transition-colors cursor-pointer"
                          >
                            Success
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            const msg =
                              tx.status === "success"
                                ? "This transaction is marked SUCCESS. Marking as failed will DEDUCT the funds from the user's wallet. Continue?"
                                : "Mark this transaction as failed?";
                            if (!confirm(msg)) return;
                            try {
                              const res = await fetch("/api/admin/wallet/mark-failed", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ orderId: tx.transactionId }),
                              });
                              const data = await res.json();
                              alert(data.message);
                              fetchTransactions();
                              fetchUsers();
                            } catch (err) {
                              alert("Failed to update transaction");
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-rose-600/90 text-white text-[9px] font-extrabold uppercase hover:bg-rose-500 transition-colors cursor-pointer"
                        >
                          Failed
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-[var(--muted)]">
                    No wallet activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE COMPACT ACTIVITY CARDS (PREVENTS ROW CLIPPING) */}
        <div className="md:hidden space-y-2">
          {filteredTransactions.map((tx) => {
            const isPositive = tx.type === "deposit" || tx.type === "admin_add" || tx.type === "refund";
            return (
              <div
                key={tx._id}
                className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 space-y-2"
              >
                {/* Row 1: Type + Amount */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${
                        isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        tx.status === "success"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : tx.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <span className={`text-sm font-black tabular-nums ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                    {isPositive ? "+" : "-"}₹{tx.amount}
                  </span>
                </div>

                {/* Row 2: User ID & Balance After */}
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span className="font-mono text-[10px] truncate max-w-[150px]">
                    User: {tx.userId}
                  </span>
                  <span className="font-mono text-[10.5px]">
                    After: <strong className="text-[var(--foreground)]">₹{tx.balanceAfter?.toFixed(2) || "0.00"}</strong>
                  </span>
                </div>

                {/* Row 3: TID & Date + Quick Actions */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)]/40 text-[10px] text-[var(--muted)]">
                  <div className="flex items-center gap-1 font-mono">
                    <span className="truncate max-w-[130px]" title={tx.transactionId}>
                      #{tx.transactionId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(tx.transactionId, tx._id)}
                      className="p-0.5 rounded text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                      {copiedKey === tx._id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {tx.status === "pending" && tx.type === "deposit" && (
                      <button
                        onClick={async () => {
                          if (!confirm("Check gateway?")) return;
                          try {
                            const res = await fetch("/api/admin/wallet/verify", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ orderId: tx.transactionId }),
                            });
                            const data = await res.json();
                            alert(data.message);
                            fetchTransactions();
                            fetchUsers();
                          } catch (err) {
                            alert("Verification failed");
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-[var(--accent)] text-black text-[9px] font-black uppercase"
                      >
                        Verify
                      </button>
                    )}

                    {tx.status !== "success" && (
                      <button
                        onClick={async () => {
                          if (!confirm("Mark as success?")) return;
                          try {
                            const res = await fetch("/api/admin/wallet/mark-success", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ orderId: tx.transactionId }),
                            });
                            const data = await res.json();
                            alert(data.message);
                            fetchTransactions();
                            fetchUsers();
                          } catch (err) {
                            alert("Failed to mark success");
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold"
                      >
                        OK
                      </button>
                    )}

                    <button
                      onClick={async () => {
                        const msg =
                          tx.status === "success"
                            ? "This transaction is SUCCESS. Marking as failed will DEDUCT funds. Continue?"
                            : "Mark as failed?";
                        if (!confirm(msg)) return;
                        try {
                          const res = await fetch("/api/admin/wallet/mark-failed", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ orderId: tx.transactionId }),
                          });
                          const data = await res.json();
                          alert(data.message);
                          fetchTransactions();
                          fetchUsers();
                        } catch (err) {
                          alert("Failed");
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-rose-600/90 text-white text-[9px] font-bold"
                    >
                      Fail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredTransactions.length === 0 && (
            <div className="py-10 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
              No wallet activity found
            </div>
          )}
        </div>
      </div>
      )}

      {/* ================= ADJUST WALLET BOTTOM SHEET / MODAL ================= */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[1001] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col p-4 sm:p-5 space-y-3.5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                    <Wallet size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                      Adjust Wallet Balance
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      Credit or debit customer wallet funds
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-black text-xs shrink-0">
                    {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[var(--foreground)] truncate">{selectedUser.name}</p>
                    <p className="text-[10px] text-[var(--muted)] truncate font-mono">
                      {selectedUser.email || selectedUser.phone}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase block leading-none mb-0.5">
                    Current
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-500 tabular-nums">
                    ₹{(selectedUser.wallet || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Type Segmented Pills */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setAdjustType("add")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    adjustType === "add"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Plus size={13} strokeWidth={3} />
                  <span>Add Credits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType("remove")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    adjustType === "remove"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Minus size={13} strokeWidth={3} />
                  <span>Deduct Credits</span>
                </button>
              </div>

              {/* Quick Amount Preset Chips */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                  Quick Amount Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[100, 200, 500, 1000, 2000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustAmount(preset.toString())}
                      className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] font-mono pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full h-9 pl-7 pr-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-xs font-black text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                  Reason / Description (Optional)
                </label>
                <input
                  type="text"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  placeholder="e.g. Refund for Order #12345"
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-xs font-semibold text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleAdjustWallet}
                disabled={adjusting}
                className={`w-full h-10 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  adjustType === "add"
                    ? "bg-emerald-600 hover:bg-emerald-500 active:scale-98"
                    : "bg-rose-600 hover:bg-rose-500 active:scale-98"
                } disabled:opacity-50`}
              >
                {adjusting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : adjustType === "add" ? (
                  <Plus size={14} strokeWidth={3} />
                ) : (
                  <Minus size={14} strokeWidth={3} />
                )}
                <span>
                  {adjusting
                    ? "Processing Adjustment..."
                    : `Confirm ${adjustType === "add" ? "Credit" : "Debit"} (₹${adjustAmount || 0})`}
                </span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
