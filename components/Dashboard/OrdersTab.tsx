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
  FiSliders,
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
      body: JSON.stringify({ page, limit, search, status: statusFilter }),
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
  }, [token, page, search, statusFilter, limit]);

  /* ================= RESET PAGE ON SEARCH/FILTER ================= */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filterOptions = [
    { id: "all", label: "All Orders", icon: FiPackage, color: "text-[var(--foreground)]", count: undefined },
    { id: "pending", label: "Pending", icon: FiClock, color: "text-amber-500", desc: "Adding to your game" },
    { id: "success", label: "Success", icon: FiCheckCircle, color: "text-emerald-500", desc: "Delivered successfully" },
    { id: "failed", label: "Failed", icon: FiAlertCircle, color: "text-rose-500", desc: "Order failed" },
    { id: "refund", label: "Refunded", icon: FiRotateCcw, color: "text-blue-500", desc: "Returned to wallet" },
  ];

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

      {/* SEARCH & FILTER BAR */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--accent)] z-10">
            <FiSearch size={16} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md
                       focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] outline-none transition-all 
                       text-xs font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] tracking-tight shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Trigger Button - Icon Only */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`relative h-[42px] w-[42px] rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-sm ${
            statusFilter !== "all"
              ? "bg-[var(--accent)] text-black border-[var(--accent)]"
              : "bg-[var(--card)]/80 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50"
          }`}
          title={statusFilter === "all" ? "Filter Orders" : `Filtered: ${statusFilter}`}
        >
          <FiSliders size={16} className={statusFilter !== "all" ? "text-black" : "text-[var(--accent)]"} />
          {statusFilter !== "all" && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--card)]" />
          )}
        </button>
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
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Filter Orders</h3>
                  <p className="text-[11px] text-[var(--muted)]">Filter your orders by current transaction status</p>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-colors"
                >
                  <FiX size={15} />
                </button>
              </div>

              {/* Status Filter Options */}
              <div className="p-4 space-y-2">
                {filterOptions.map((opt) => {
                  const isSelected = statusFilter === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                        isSelected
                          ? "bg-[var(--accent)]/[0.08] border-[var(--accent)] text-[var(--foreground)] shadow-sm"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] text-[var(--foreground)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-[var(--accent)] text-black"
                              : "bg-[var(--foreground)]/[0.05] " + opt.color
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{opt.label}</div>
                          {opt.desc && (
                            <div className="text-[10px] text-[var(--muted)]">{opt.desc}</div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-black flex items-center justify-center">
                          <FiCheck size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-2 border-t border-[var(--border)] flex items-center gap-2">
                {statusFilter !== "all" && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setIsFilterOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-center"
                  >
                    Reset Filter
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-black text-xs font-bold uppercase tracking-wider text-center hover:brightness-110 transition-all"
                >
                  Apply
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
