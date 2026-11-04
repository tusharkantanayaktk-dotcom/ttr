"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Clock,
  User,
  Gamepad2,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Hash,
  Loader2,
  Calendar,
  Smartphone,
  ChevronDown,
  ShoppingBag,
  Target,
  TrendingUp,
  Activity,
  Package,
  Mail,
  Copy,
  Check,
  Phone
} from "lucide-react";
import Skeleton from "../Skeleton";


export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);
  const [filters, setFilters] = useState({
    status: "",
    gameSlug: "",
    from: "",
    to: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    "1d": { count: 0, totalValue: 0 },
    "7d": { count: 0, totalValue: 0 },
    "30d": { count: 0, totalValue: 0 },
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, limit, search, filters]);

  /* ================= FETCH STATS ================= */
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Fetch stats failed", err);
    } finally {
      setStatsLoading(false);
    }
  };

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.status && { status: filters.status }),
        ...(filters.gameSlug && { gameSlug: filters.gameSlug }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(
        `/api/admin/orders?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setOrders(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch orders failed", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update order");
        return;
      }

      fetchOrders();
    } finally {
      setUpdating(false);
    }
  };

  const statusMeta = {
    pending: {
      label: "Pending",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock size={12} />
    },
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
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Orders</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <ShoppingBag size={13} className="text-[var(--accent)]" />
            <span>{pagination.total} Orders</span>
          </div>
          <button
            onClick={fetchOrders}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none"
            title="Refresh"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      {/* ================= COMPACT STATS OVERVIEW ================= */}
      <StatsOverview stats={stats} loading={statsLoading} />

      {/* ================= COMBINED SEARCH & FILTERS CAPSULE ================= */}
      <div className="relative flex items-center w-full rounded-2xl sm:rounded-full border border-[var(--border)] bg-[var(--card)]/80 focus-within:border-[var(--accent)]/50 focus-within:ring-2 focus-within:ring-[var(--accent)]/15 transition-all shadow-xs h-9 sm:h-9.5 px-3">
        <Search className="text-[var(--muted)]/50 shrink-0 mr-2" size={14} />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by Order ID, Email, or Game Platform..."
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

        {/* Combined Filter Button */}
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className={`relative p-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${
            Object.values(filters).some(Boolean)
              ? "bg-[var(--accent)] text-black font-extrabold shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
          }`}
          title="Filter Orders"
        >
          <Filter size={14} className={Object.values(filters).some(Boolean) ? "text-black" : "text-[var(--accent)]"} />
          {Object.values(filters).some(Boolean) && (
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
          )}
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Loading Orders...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                  <tr className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
                    <th className="px-5 py-3.5">Game / User</th>
                    <th className="px-5 py-3.5">Date / Time</th>
                    <th className="px-5 py-3.5">Item & Credentials</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/70">
                  {orders.map((o, idx) => {
                    const meta = statusMeta[o.status] || statusMeta.pending;
                    return (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setSelectedOrder(o)}
                        className="group hover:bg-[var(--foreground)]/[0.035] transition-colors cursor-pointer"
                      >
                        {/* 1. Game & Customer */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                              <Gamepad2 size={15} />
                            </div>
                            <div className="flex flex-col min-w-0 max-w-[210px]">
                              <span className="text-[var(--foreground)] font-extrabold uppercase text-xs tracking-tight truncate">
                                {o.gameSlug}
                              </span>
                              <span className="text-[11px] text-[var(--muted)] truncate mt-0.5 flex items-center gap-1 font-medium">
                                <Mail size={10} className="text-[var(--accent)] shrink-0 opacity-70" />
                                <span className="truncate">{o.email || "Guest User"}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Date & Time */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-[var(--foreground)]">
                              {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="text-[10px] text-[var(--muted)] font-mono mt-0.5">
                              {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                        </td>

                        {/* 3. Item & Credentials */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[var(--foreground)] truncate block">
                              {o.itemName}
                            </span>
                            {o.playerId && (
                              <div className="text-[11px] font-mono text-cyan-400 font-bold truncate">
                                ID: {o.playerId} {o.zoneId ? `(${o.zoneId})` : ""}
                              </div>
                            )}
                            <span className="text-[9.5px] text-[var(--muted)]/50 font-mono uppercase block truncate" title={o.orderId}>
                              #{o.orderId}
                            </span>
                          </div>
                        </td>

                        {/* 4. Payment Method */}
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] font-black uppercase text-[var(--muted)] bg-[var(--foreground)]/[0.04] px-2 py-1 rounded-md border border-[var(--border)] tracking-wider">
                            {o.paymentMethod || "wallet"}
                          </span>
                        </td>

                        {/* 5. Price */}
                        <td className="px-5 py-3.5">
                          <span className="text-base font-black text-emerald-400 tabular-nums">
                            ₹{o.price}
                          </span>
                        </td>

                        {/* 6. Status */}
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            value={o.status}
                            disabled={updating}
                            compact
                            onChange={(v) => updateOrderStatus(o.orderId, v)}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "success", label: "Success" },
                              { value: "failed", label: "Failed" },
                              { value: "refund", label: "Refund" },
                            ]}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-2.5">
              {orders.map((o, idx) => {
                const meta = statusMeta[o.status] || statusMeta.pending;
                return (
                  <motion.div
                    key={o._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedOrder(o)}
                    className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 hover:bg-[var(--card)] active:scale-[0.99] transition-all cursor-pointer space-y-2.5 shadow-sm"
                  >
                    {/* Top Row: Game Badge on left, Price & Payment Method on right */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                          <Gamepad2 size={13} />
                        </div>
                        <span className="font-extrabold text-[var(--foreground)] text-xs uppercase tracking-tight truncate">
                          {o.gameSlug}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm sm:text-base font-black text-emerald-400 tabular-nums leading-none">
                          ₹{o.price}
                        </span>
                        <span className="text-[9px] uppercase font-extrabold text-[var(--muted)] px-1.5 py-0.5 rounded-md bg-[var(--foreground)]/[0.04] border border-[var(--border)] leading-none">
                          {o.paymentMethod || "wallet"}
                        </span>
                      </div>
                    </div>

                    {/* Middle Card: Item Name, Player Credentials & Customer Email */}
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.025] border border-[var(--border)]/60 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-[var(--foreground)] block truncate">
                          {o.itemName}
                        </span>
                        {o.playerId ? (
                          <span className="text-[11px] font-mono font-bold text-cyan-400 block truncate mt-0.5">
                            ID: {o.playerId} {o.zoneId ? `(${o.zoneId})` : ""}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--muted)] block mt-0.5">Direct Top-up</span>
                        )}
                      </div>

                      {/* Customer Email Pill */}
                      <div className="flex items-center gap-1 text-[10px] text-[var(--muted)] min-w-0 max-w-[140px] sm:max-w-[180px] bg-[var(--card)] px-2 py-1 rounded-lg border border-[var(--border)]/80 shrink-0">
                        <Mail size={10} className="text-[var(--accent)] shrink-0 opacity-70" />
                        <span className="truncate text-[var(--foreground)]/80 font-medium">{o.email || "Guest"}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Date & Order ID on Left, Status Dropdown on Right */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/40 text-[10px] text-[var(--muted)]">
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="text-[10px] font-medium text-[var(--foreground)]/80">
                          {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="font-mono text-[9px] text-[var(--muted)]/50 truncate" title={o.orderId}>
                          #{o.orderId}
                        </span>
                      </div>

                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown
                          value={o.status}
                          disabled={updating}
                          onChange={(v) => updateOrderStatus(o.orderId, v)}
                          compact
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "success", label: "Success" },
                            { value: "failed", label: "Failed" },
                            { value: "refund", label: "Refund" },
                          ]}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!orders.length && (
              <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <ShoppingBag className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">No orders found</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Page <b className="text-[var(--foreground)]">{pagination.page}</b> of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER ================= */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] shadow-2xl z-[1110] flex flex-col"
            >
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-[var(--foreground)]">
                    Order <span className="text-[var(--accent)]">Details</span>
                  </h3>

                  <button
                    onClick={() => setSelectedOrder(null)}
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
                      {selectedOrder.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedOrder.orderId, "orderId")}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all bg-[var(--foreground)]/[0.05] hover:bg-[var(--accent)] hover:text-white shrink-0 cursor-pointer"
                  >
                    {copiedKey === "orderId" ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
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
                      <span className="text-xl font-black text-emerald-500 leading-none">₹{selectedOrder.price}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.05] text-[var(--muted)] border border-[var(--border)]">
                        {selectedOrder.paymentMethod || "wallet"}
                      </span>
                    </div>
                  </div>

                  <StatusDropdown
                    value={selectedOrder.status}
                    compact
                    onChange={(v) => {
                      updateOrderStatus(selectedOrder.orderId, v);
                      setSelectedOrder((prev) => (prev ? { ...prev, status: v } : null));
                    }}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "success", label: "Success" },
                      { value: "failed", label: "Failed" },
                      { value: "refund", label: "Refund" },
                    ]}
                  />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar">

                {/* HERO: PLAYER FULFILLMENT CREDENTIALS (1-TAP QUICK COPY) */}
                <div className="p-3 rounded-xl bg-[var(--accent)]/[0.04] border border-[var(--accent)]/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                      <Smartphone size={13} />
                      Player Credentials
                    </span>
                    <span className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate max-w-[150px]">
                      {selectedOrder.gameSlug}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Player ID */}
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
                      <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-tight">Player ID</span>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-xs font-mono font-black text-[var(--foreground)] truncate">
                          {selectedOrder.playerId || "N/A"}
                        </span>
                        {selectedOrder.playerId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.playerId, "playerId")}
                            className="p-1 rounded hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
                            title="Copy Player ID"
                          >
                            {copiedKey === "playerId" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Zone ID / Server */}
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
                      <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-tight">Server / Zone ID</span>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-xs font-mono font-black text-[var(--foreground)] truncate">
                          {selectedOrder.zoneId || "GLOBAL"}
                        </span>
                        {selectedOrder.zoneId && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.zoneId, "zoneId")}
                            className="p-1 rounded hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
                            title="Copy Zone ID"
                          >
                            {copiedKey === "zoneId" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Item Ordered */}
                  <div className="p-2 rounded-lg bg-[var(--card)]/70 border border-[var(--border)]/70 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Item</span>
                    <span className="font-extrabold text-[var(--foreground)] text-right truncate">
                      {selectedOrder.itemName}
                    </span>
                  </div>
                </div>

                {/* CUSTOMER DETAILS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-wider px-0.5 flex items-center gap-1.5">
                    <User size={12} className="text-[var(--accent)]" />
                    Customer Details
                  </span>
                  <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Email</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-[var(--foreground)] truncate" title={selectedOrder.email}>
                          {selectedOrder.email || "Guest"}
                        </span>
                        {selectedOrder.email && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedOrder.email, "email")}
                            className="p-1 rounded hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
                            title="Copy Email"
                          >
                            {copiedKey === "email" ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--border)]/40">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Phone</span>
                      <span className="text-xs font-mono font-bold text-[var(--accent)]">
                        {selectedOrder.phone || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--border)]/40">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">Order Time</span>
                      <span className="text-[11px] font-medium text-[var(--foreground)]/80">
                        {new Date(selectedOrder.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT & SYSTEM STATUS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-wider px-0.5 flex items-center gap-1.5">
                    <CreditCard size={12} className="text-[var(--accent)]" />
                    Payment & Topup
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60">
                      <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-tight block">Payment Status</span>
                      <span className="text-xs font-bold uppercase text-[var(--accent)] mt-0.5 block truncate">
                        {selectedOrder.paymentStatus || "PENDING"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60">
                      <span className="text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-tight block">Topup Status</span>
                      <span className="text-xs font-bold uppercase text-[var(--foreground)] mt-0.5 block truncate">
                        {selectedOrder.topupStatus || "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* ================= FILTER BOTTOMSHEET ================= */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Bottomsheet Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col z-10 pb-6 sm:pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator Handle */}
              <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/20 mx-auto mb-3 sm:hidden" />

              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--foreground)]">Filters</h3>
                  <p className="text-[11px] text-[var(--muted)]">Filter orders by status, game, and date range</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 rounded-xl bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all outline-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="py-4 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Status</label>
                    <div className="relative">
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full h-10 pl-3 pr-8 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-bold uppercase focus:border-[var(--accent)] outline-none appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[var(--card)]">All Status</option>
                        <option value="pending" className="bg-[var(--card)]">Pending</option>
                        <option value="success" className="bg-[var(--card)]">Success</option>
                        <option value="failed" className="bg-[var(--card)]">Failed</option>
                        <option value="refund" className="bg-[var(--card)]">Refund</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Game Slug</label>
                    <input
                      placeholder="e.g. mobile-legends"
                      value={filters.gameSlug}
                      onChange={(e) => setFilters({ ...filters, gameSlug: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-bold uppercase focus:border-[var(--accent)] outline-none placeholder:text-[var(--muted)]/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Date From</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-semibold focus:border-[var(--accent)] outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Date To</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-xs font-semibold focus:border-[var(--accent)] outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ status: "", gameSlug: "", from: "", to: "" });
                    setPage(1);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] transition-all cursor-pointer"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function StatusDropdown({ value, onChange, options, disabled, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = {
    pending: "text-amber-500",
    success: "text-emerald-500",
    failed: "text-rose-500",
    refund: "text-blue-500",
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2 px-3 
          ${compact ? "h-8 min-w-[100px]" : "h-10 min-w-[120px]"}
          rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          text-[10px] font-black uppercase transition-all
          ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.08]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : ""}
        `}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${styles[value]}`} />
          <span className={styles[value]}>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-[1200] right-0 w-full min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left text-[9px] font-black uppercase rounded-lg transition-all
                  ${option.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPERS Interface ================= */

function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[var(--muted)]/60">
        <span className="text-[var(--accent)] shrink-0">{icon}</span>
        <h4 className="text-[9px] font-black uppercase tracking-wider">{title}</h4>
        <div className="h-px flex-1 bg-[var(--border)] opacity-40" />
      </div>
      <div className="rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/60 px-3 py-1.5 space-y-1">
        {children}
      </div>
    </div>
  );
}

function DrawerDetail({ label, value, emphasize }) {
  return (
    <div className="flex justify-between items-center gap-3 py-0.5 group">
      <span className="text-[8.5px] font-bold text-[var(--muted)]/60 uppercase tracking-tight group-hover:text-[var(--muted)]/80 transition-colors whitespace-nowrap">
        {label}
      </span>
      <span className={`text-[11px] font-bold text-right truncate ${
        emphasize ? "text-[var(--accent)] italic uppercase" : "text-[var(--foreground)]/80"
      }`}>
        {value || "N/A"}
      </span>
    </div>
  );
}

function StatsOverview({ stats, loading }) {
  const periods = [
    { key: "1d", label: "24H" },
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
  ];

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Skeleton height={42} className="rounded-xl" />
        <Skeleton height={42} className="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {/* ORDER VOLUME */}
      <div className="p-2 sm:p-2.5 px-3 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Package size={15} className="text-blue-500 shrink-0" />
          <span className="text-xs font-bold text-[var(--foreground)]">Order Volume</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {periods.map((p, idx) => (
            <div key={p.key} className="flex items-center gap-2.5">
              {idx > 0 && <div className="h-3.5 w-[1px] bg-[var(--border)]" />}
              <div className="text-right">
                <span className="text-[8px] text-[var(--muted)] block font-semibold leading-none mb-0.5">{p.label}</span>
                <span className="font-bold text-xs text-[var(--foreground)] leading-none">{stats[p.key]?.count ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL REVENUE */}
      <div className="p-2 sm:p-2.5 px-3 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <IndianRupee size={15} className="text-emerald-500 shrink-0" />
          <span className="text-xs font-bold text-[var(--foreground)]">Total Revenue</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          {periods.map((p, idx) => (
            <div key={p.key} className="flex items-center gap-2.5">
              {idx > 0 && <div className="h-3.5 w-[1px] bg-[var(--border)]" />}
              <div className="text-right">
                <span className="text-[8px] text-[var(--muted)] block font-semibold leading-none mb-0.5">{p.label}</span>
                <span className="font-bold text-xs text-[var(--foreground)] leading-none whitespace-nowrap">₹{Number(stats[p.key]?.totalValue || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
