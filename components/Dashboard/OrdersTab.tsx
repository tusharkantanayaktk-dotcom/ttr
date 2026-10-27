"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiZap,
  FiX,
  FiCheck,
  FiRotateCcw,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem, { OrderType } from "./OrderItem";

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / limit);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= LOAD ORDERS ================= */
  const fetchOrders = () => {
    if (!token) return;

    fetch("/api/order/user", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page,
        limit,
        search,
        status: statusFilter,
        paymentMethod: paymentFilter,
        dateRange: dateFilter,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        setOrders(data.orders || []);
        setTotalCount(data.totalCount || 0);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [token, page, search, statusFilter, paymentFilter, dateFilter, limit]);

  /* ================= RESET PAGE ON SEARCH/FILTER ================= */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, paymentFilter, dateFilter]);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (paymentFilter !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);

  /* ================= PAGE RANGE ================= */
  const getPageNumbers = () => {
    const pages: number[] = [];

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-4 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <div className="flex flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              My <span className="text-[var(--accent)]">Orders</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-[var(--muted)] max-w-xl mt-0.5">
              Track all your orders and delivery status.
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <div className="flex flex-col items-end text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Total Orders</span>
              <span className="text-base font-extrabold text-[var(--foreground)] leading-none mt-0.5">{totalCount}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SEARCH & FILTER BAR (Combined Single Capsule) */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center w-full rounded-xl border border-[var(--border)] bg-[var(--card)]/90 shadow-xs backdrop-blur-md focus-within:ring-2 focus-within:ring-[var(--accent)]/30 focus-within:border-[var(--accent)] transition-all overflow-hidden"
      >
        {/* Search Icon */}
        <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[var(--accent)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7.5" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
        </div>

        {/* Input Field */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="w-full py-2.5 bg-transparent outline-none text-xs font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] tracking-tight"
        />

        {/* Right Actions: Clear + Divider + Filter Button */}
        <div className="flex items-center gap-1.5 pr-2 shrink-0">
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
              title="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <div className="h-4 w-[1px] bg-[var(--border)]/70" />

          {/* Combined Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`relative p-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              activeFilterCount > 0
                ? "bg-[var(--accent)] text-black font-extrabold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
            }`}
            title={activeFilterCount === 0 ? "Filter Orders" : `${activeFilterCount} active filter(s)`}
          >
            {/* Modern Precision Filter Funnel SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {activeFilterCount > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black text-white leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* FILTER BOTTOM SHEET */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[1200] flex items-end justify-center">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[var(--card)] border-t border-x border-[var(--border)] rounded-t-3xl shadow-2xl z-10 overflow-hidden pb-safe"
            >
              {/* Drag Handle Indicator */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Filter Orders</h3>
                </div>

                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("all");
                        setPaymentFilter("all");
                        setDateFilter("all");
                      }}
                      className="text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>

              {/* Filter Options Content (Categorized Compact Chips) */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Category 1: Status */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Status</span>
                    {statusFilter !== "all" && (
                      <span className="text-[9px] font-black uppercase text-[var(--accent)]">{statusFilter}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: "all", label: "All" },
                      { id: "pending", label: "Pending" },
                      { id: "success", label: "Success" },
                      { id: "failed", label: "Failed" },
                      { id: "refund", label: "Refunded" },
                    ].map((item) => {
                      const isSelected = statusFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStatusFilter(item.id)}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all text-center truncate cursor-pointer ${
                            isSelected
                              ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-xs"
                              : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category 2: Payment Method */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Payment Method</span>
                    {paymentFilter !== "all" && (
                      <span className="text-[9px] font-black uppercase text-[var(--accent)]">{paymentFilter}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "all", label: "All Methods" },
                      { id: "upi", label: "UPI" },
                      { id: "wallet", label: "Wallet" },
                    ].map((item) => {
                      const isSelected = paymentFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPaymentFilter(item.id)}
                          className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center truncate cursor-pointer ${
                            isSelected
                              ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-xs"
                              : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category 3: Time Period */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Time Period</span>
                    {dateFilter !== "all" && (
                      <span className="text-[9px] font-black uppercase text-[var(--accent)]">{dateFilter === "7d" ? "7 Days" : "30 Days"}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "all", label: "All Time" },
                      { id: "7d", label: "Last 7 Days" },
                      { id: "30d", label: "Last 30 Days" },
                    ].map((item) => {
                      const isSelected = dateFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDateFilter(item.id)}
                          className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center truncate cursor-pointer ${
                            isSelected
                              ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-xs"
                              : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-[var(--border)] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black text-xs font-black uppercase tracking-wider text-center hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  Apply Filters ({totalCount} {totalCount === 1 ? 'Order' : 'Orders'})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= LIST ================= */}
      <AnimatePresence mode="wait">
        {orders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]/10"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--muted)]/5 flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-3xl text-[var(--muted)] opacity-20" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">No orders found</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="space-y-4"
          >
            <div className="space-y-3">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.orderId}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <OrderItem order={order} />
                </motion.div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 flex justify-center items-center gap-3"
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-20 transition-all shadow-sm"
                >
                  <FiChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                  {getPageNumbers().map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-[40px] h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${p === page
                          ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30"
                          : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-20 transition-all shadow-sm"
                >
                  <FiChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* INFO BANNER */}
            <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3 group overflow-hidden relative">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-sm">
                <FiZap />
              </div>
              <div className="flex-1">
                <h4 className="text-[9px] font-bold mb-0.5 uppercase text-indigo-400">Status Info</h4>
                <p className="text-[9px] text-[var(--muted)] leading-relaxed uppercase tracking-tight">
                  Orders process in 5-15 minutes.
                </p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all">
                Refresh
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
