"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Clock,
  User,
  Gamepad2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Hash,
  Smartphone,
  Copy,
  Check,
  Mail,
  Calendar,
  Layers
} from "lucide-react";
import Skeleton from "../Skeleton";

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    fetchTransactions();
  }, [page, limit, search, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(
        `/api/admin/transactions?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setTransactions(data?.data || []);
      setPagination(
        data?.pagination || {
          total: 0,
          page: 1,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Transaction fetch failed", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = {
    success: {
      label: "Success",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />
    },
    failed: {
      label: "Failed",
      class: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: <XCircle size={12} />
    },
    pending: {
      label: "Pending",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock size={12} />
    },
    refund: {
      label: "Refund",
      class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <AlertCircle size={12} />
    },
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Transactions</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <CreditCard size={13} className="text-[var(--accent)]" />
            <span>{pagination.total} Transactions</span>
          </div>
          <button
            onClick={fetchTransactions}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
            title="Refresh"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= COMBINED SEARCH & FILTERS CAPSULE ================= */}
      <div className="relative flex items-center w-full rounded-2xl sm:rounded-full border border-[var(--border)] bg-[var(--card)]/80 focus-within:border-[var(--accent)]/50 focus-within:ring-2 focus-within:ring-[var(--accent)]/15 transition-all shadow-xs h-9 sm:h-9.5 px-3">
        <Search className="text-[var(--muted)]/50 shrink-0 mr-2" size={14} />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search Order ID, Email, Player ID..."
          className="w-full bg-transparent text-[var(--foreground)] text-xs sm:text-sm placeholder:text-[var(--muted)]/40 outline-none"
        />

        {/* Clear 'X' button */}
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer shrink-0 mr-1"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}

        <div className="h-4 w-[1px] bg-[var(--border)]/70 mx-1 shrink-0" />

        {/* Combined Filter Dropdown */}
        <div className="relative shrink-0 flex items-center">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className={`h-7 pl-2 pr-6 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all ${
              statusFilter
                ? "bg-[var(--accent)] text-black font-extrabold shadow-xs"
                : "bg-transparent text-[var(--foreground)]/70 hover:text-[var(--foreground)]"
            }`}
          >
            <option value="" className="bg-[var(--card)] text-[var(--foreground)]">All Status</option>
            <option value="success" className="bg-[var(--card)] text-[var(--foreground)]">Success</option>
            <option value="pending" className="bg-[var(--card)] text-[var(--foreground)]">Pending</option>
            <option value="failed" className="bg-[var(--card)] text-[var(--foreground)]">Failed</option>
            <option value="refund" className="bg-[var(--card)] text-[var(--foreground)]">Refund</option>
          </select>
          <Filter
            size={11}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              statusFilter ? "text-black" : "text-[var(--accent)]"
            }`}
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={64} className="w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                  <tr className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
                    <th className="px-5 py-3.5">Date/Time</th>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer & Player</th>
                    <th className="px-5 py-3.5">Platform</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {transactions.map((t, idx) => {
                    const meta = statusMeta[t.status] || statusMeta.pending;
                    return (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setSelectedTx(t)}
                        className="group hover:bg-[var(--foreground)]/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-semibold text-xs">{new Date(t.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-[var(--muted)] font-mono">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-[11px] text-[var(--accent)] font-bold">{t.orderId}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col max-w-[180px]">
                            <span className="truncate text-[var(--foreground)] font-semibold text-xs">{t.email || "Guest User"}</span>
                            <span className="text-[10px] text-[var(--muted)] font-mono truncate">{t.playerId ? `ID: ${t.playerId}` : "No Player ID"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] truncate max-w-[140px]">
                            <Gamepad2 size={13} className="text-[var(--accent)] shrink-0" />
                            <span className="truncate">{t.itemName || t.gameSlug || "Game"}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-bold uppercase text-[var(--muted)] bg-[var(--foreground)]/[0.04] px-2 py-0.5 rounded-md border border-[var(--border)] tracking-wider">
                            {t.paymentMethod || "wallet"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-black text-emerald-500 tabular-nums">
                            ₹{t.price}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${meta.class}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE COMPACT 3-ROW CARD LIST */}
            <div className="lg:hidden space-y-2">
              {transactions.map((t, idx) => {
                const meta = statusMeta[t.status] || statusMeta.pending;
                return (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedTx(t)}
                    className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] active:scale-[0.99] transition-all cursor-pointer space-y-1.5"
                  >
                    {/* Top Row: Status + Game/Item Name & Price + Method */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shrink-0 ${meta.class}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                        <span className="text-[11px] font-bold text-[var(--foreground)] truncate">
                          {t.itemName || t.gameSlug || "Top-up"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-black text-emerald-500 leading-none">₹{t.price}</span>
                        <span className="text-[8px] uppercase font-bold text-[var(--muted)] px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.04] border border-[var(--border)] leading-none">
                          {t.paymentMethod || "wallet"}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Player ID & Server + Customer Gmail */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1 font-mono text-[10.5px] min-w-0">
                        {t.playerId ? (
                          <>
                            <span className="text-[var(--accent)] font-bold truncate">ID: {t.playerId}</span>
                            {t.zoneId && (
                              <span className="text-[var(--muted)] opacity-80 shrink-0">
                                ({t.zoneId})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[var(--muted)] text-[10px] italic">No Player ID</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[10.5px] text-[var(--muted)] min-w-0 ml-auto">
                        <Mail size={11} className="text-[var(--accent)] opacity-70 shrink-0" />
                        <span className="text-[var(--foreground)]/80 font-medium truncate max-w-[170px] sm:max-w-[220px]">
                          {t.email || "Guest"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Date & Time + Order ID + Details Link */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)]/30 text-[10px] text-[var(--muted)]">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span className="shrink-0 font-medium">
                          {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="opacity-30 shrink-0">·</span>
                        <span className="font-mono text-[9px] opacity-60 truncate" title={t.orderId}>
                          #{t.orderId}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 text-[var(--accent)] font-bold text-[11px] shrink-0">
                        <span>Details</span>
                        <ChevronRight size={11} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!transactions.length && (
              <div className="py-16 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/30">
                <Hash className="mx-auto text-[var(--muted)]/20 mb-2" size={36} />
                <p className="text-xs font-semibold text-[var(--muted)]">No transactions found</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/60">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Page <b className="text-[var(--foreground)]">{pagination.page}</b> of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-30 transition-all outline-none cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-30 transition-all outline-none cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= COMPACT SPACE-EFFICIENT DRAWER ================= */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 z-[1001] bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] shadow-2xl z-[1002] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[var(--foreground)]">
                    Payment <span className="text-[var(--accent)]">Details</span>
                  </h3>

                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.05] hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-[var(--muted)] transition-all cursor-pointer"
                    title="Close"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Order ID with 1-Tap Copy */}
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/60 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Hash size={12} className="text-[var(--accent)] shrink-0" />
                    <span className="font-mono text-[11px] font-bold text-[var(--foreground)] truncate">
                      {selectedTx.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedTx.orderId, "orderId")}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all bg-[var(--foreground)]/[0.05] hover:bg-[var(--accent)] hover:text-black shrink-0 cursor-pointer"
                  >
                    {copiedKey === "orderId" ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span className="text-emerald-500 font-extrabold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Price & Status Row */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[var(--foreground)]/[0.02] to-transparent border border-emerald-500/20">
                  <div>
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-[var(--muted)] block">Amount</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black text-emerald-500 leading-none">₹{selectedTx.price}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.05] text-[var(--muted)] border border-[var(--border)]">
                        {selectedTx.paymentMethod || "wallet"}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const meta = statusMeta[selectedTx.status] || statusMeta.pending;
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider ${meta.class}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar">
                {/* HERO: PLAYER FULFILLMENT CREDENTIALS (1-TAP QUICK COPY) */}
                <div className="p-3 rounded-xl bg-[var(--accent)]/[0.04] border border-[var(--accent)]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                      <Smartphone size={13} />
                      Player Credentials
                    </span>
                    <span className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate max-w-[150px]">
                      {selectedTx.gameSlug}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Player ID */}
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
                      <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-tight">Player ID</span>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-xs font-mono font-black text-[var(--foreground)] truncate">
                          {selectedTx.playerId || "N/A"}
                        </span>
                        {selectedTx.playerId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedTx.playerId, "playerId")}
                            className="p-1 rounded hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
                            title="Copy Player ID"
                          >
                            {copiedKey === "playerId" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Zone ID */}
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
                      <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-tight">Zone / Server</span>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-xs font-mono font-black text-[var(--foreground)] truncate">
                          {selectedTx.zoneId || "GLOBAL"}
                        </span>
                        {selectedTx.zoneId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedTx.zoneId, "zoneId")}
                            className="p-1 rounded hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
                            title="Copy Zone ID"
                          >
                            {copiedKey === "zoneId" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GAME & ITEM DETAILS */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.015] space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                    <Gamepad2 size={13} className="text-[var(--accent)]" />
                    Item Details
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">Game</span>
                      <span className="font-bold text-[var(--foreground)] truncate block mt-0.5">
                        {selectedTx.gameSlug || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">Item Name</span>
                      <span className="font-bold text-[var(--foreground)] truncate block mt-0.5">
                        {selectedTx.itemName || "Weekly Pass"}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-[var(--border)]/40 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Item ID / SKU</span>
                      <span className="font-mono text-[10px] text-[var(--muted)] truncate max-w-[200px]">
                        {selectedTx.itemSlug || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT & FULFILLMENT STATUS */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.015] space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                    <CreditCard size={13} className="text-[var(--accent)]" />
                    Payment & Delivery
                  </span>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">Method</span>
                      <span className="font-bold text-[var(--foreground)] uppercase truncate block mt-0.5">
                        {selectedTx.paymentMethod || "wallet"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">Payment</span>
                      <span className={`font-bold uppercase truncate block mt-0.5 ${selectedTx.paymentStatus === 'SUCCESS' ? 'text-emerald-500' : 'text-[var(--foreground)]'}`}>
                        {selectedTx.paymentStatus || selectedTx.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase block">Topup</span>
                      <span className={`font-bold uppercase truncate block mt-0.5 ${selectedTx.topupStatus === 'success' ? 'text-emerald-500' : 'text-[var(--foreground)]'}`}>
                        {selectedTx.topupStatus || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CUSTOMER INFORMATION */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.015] space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                    <User size={13} className="text-[var(--accent)]" />
                    Customer Info
                  </span>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Email</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-[var(--foreground)] truncate max-w-[200px]">
                          {selectedTx.email || "Guest User"}
                        </span>
                        {selectedTx.email && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedTx.email, "email")}
                            className="p-0.5 rounded text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                            title="Copy Email"
                          >
                            {copiedKey === "email" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedTx.phone && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/40">
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Phone</span>
                        <span className="font-mono text-[11px] text-[var(--foreground)]">{selectedTx.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/40">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Created At</span>
                      <span className="text-[10px] font-mono text-[var(--muted)]">
                        {new Date(selectedTx.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
