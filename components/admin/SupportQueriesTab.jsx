"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
  Inbox
} from "lucide-react";
import Skeleton from "../Skeleton";


export default function SupportQueriesTab() {
  const [queries, setQueries] = useState([]);
  const [activeQuery, setActiveQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempStatusFilter, setTempStatusFilter] = useState("");

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
    fetchQueries();
  }, [page, limit, search, statusFilter]);

  /* ================= FETCH QUERIES ================= */
  const fetchQueries = async () => {
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
        `/api/admin/support-queries?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setQueries(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch support queries failed", err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE QUERY STATUS ================= */
  const updateQueryStatus = async (id, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/support-queries/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update status");
        return;
      }

      fetchQueries();
    } finally {
      setUpdating(false);
    }
  };

  const statusMeta = {
    open: {
      label: "Open",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <AlertCircle size={12} />
    },
    in_progress: {
      label: "In Progress",
      class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <RefreshCcw size={12} className="animate-spin-slow" />
    },
    resolved: {
      label: "Resolved",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />
    },
    closed: {
      label: "Closed",
      class: "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]",
      icon: <X size={12} />
    },
  };

  const getStatus = (status) => status || "open";

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-8 max-w-full overflow-x-hidden">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Support Queries</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <MessageSquare size={13} className="text-[var(--accent)]" />
            <span>{pagination.total} Queries</span>
          </div>
          <button
            onClick={fetchQueries}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none"
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
          placeholder="Search queries by Email, Message, Order ID..."
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

        {/* Combined Filter Trigger Button */}
        <button
          type="button"
          onClick={() => {
            setTempStatusFilter(statusFilter);
            setIsFilterOpen(true);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
            statusFilter
              ? "bg-[var(--accent)] text-black font-extrabold shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
          }`}
          title="Filter Queries by status"
        >
          <Filter size={13} className={statusFilter ? "text-black" : "text-[var(--accent)]"} />
          <span className="capitalize text-[11px] truncate max-w-[90px]">
            {statusFilter ? statusMeta[statusFilter]?.label || statusFilter : "Filter"}
          </span>
          {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />}
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={80} className="w-full rounded-2xl" />
              ))}
            </div>
          ) : (

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {queries.map((q, idx) => {
                const status = getStatus(q.status);
                const meta = statusMeta[status];

                return (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setActiveQuery(q)}
                    className="group relative rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.01] hover:bg-[var(--foreground)]/[0.03] transition-all cursor-pointer p-3 flex items-center gap-3"
                  >
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ backgroundColor: meta.label === 'Open' ? '#f59e0b' : meta.label === 'Resolved' ? '#10b981' : '#3b82f6' }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider ${meta.class}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                        <span className="text-[9px] font-medium text-[var(--muted)]/60 truncate">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)]">
                        {q.email || "Unknown User"}
                      </h4>

                      <p className="text-[10px] text-[var(--muted)]/60 truncate mt-0.5">
                        {q.message}
                      </p>
                    </div>

                    <ChevronRight size={16} className="text-[var(--muted)]/40 group-hover:text-[var(--foreground)] transition-colors shrink-0" />
                  </motion.div>
                );
              })}

              {!queries.length && (
                <div className="py-16 text-center border border-dashed border-[var(--border)] rounded-2xl">
                  <Inbox className="mx-auto text-[var(--muted)]/20 mb-2" size={32} />
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">No queries found</p>
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
      </div>

      {/* ================= BOTTOM SHEET ================= */}
      <AnimatePresence>
        {activeQuery && (
          <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuery(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-lg bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
            >
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/20" />
              </div>

              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[var(--foreground)] truncate">Query Details</h3>
                  <p className="text-[10px] text-[var(--muted)] font-mono truncate">
                    #{String(activeQuery._id).slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <CustomDropdown
                    value={getStatus(activeQuery.status)}
                    compact
                    onChange={(newStatus) => {
                      updateQueryStatus(activeQuery._id, newStatus);
                      setActiveQuery((prev) => (prev ? { ...prev, status: newStatus } : null));
                    }}
                    disabled={updating}
                    options={[
                      { value: "open", label: "Open" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "resolved", label: "Resolved" },
                      { value: "closed", label: "Closed" },
                    ]}
                  />

                  <button
                    onClick={() => setActiveQuery(null)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--foreground)]/[0.06] hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-[var(--muted)] transition-all cursor-pointer"
                    title="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailBlock label="Email" value={activeQuery.email || "N/A"} icon={<Mail size={12} />} />
                  <DetailBlock label="Phone" value={activeQuery.phone || "N/A"} icon={<Phone size={12} />} />
                  <DetailBlock label="Type" value={activeQuery.type} emphasize icon={<MessageSquare size={12} />} />
                  <DetailBlock label="Date" value={new Date(activeQuery.createdAt).toLocaleString()} icon={<Clock size={12} />} />
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/70">
                  <p className="text-[9.5px] font-black text-[var(--muted)]/60 uppercase tracking-wider">Message</p>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
                    {activeQuery.message}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= FILTER BOTTOMSHEET ================= */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Bottomsheet Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-[var(--card)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] p-4 sm:p-5 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col z-10 pb-6 sm:pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator Handle */}
              <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/20 mx-auto mb-3 sm:hidden" />

              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--foreground)]">Filter Queries</h3>
                  <p className="text-[11px] text-[var(--muted)]">Filter customer inquiries by resolution status</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all outline-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="py-4 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] block">
                  Select Status
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "", label: "All Queries", desc: "Show all tickets", icon: <Inbox size={14} className="text-[var(--muted)]" /> },
                    { value: "open", label: "Open", desc: "Awaiting review", icon: <AlertCircle size={14} className="text-amber-400" /> },
                    { value: "in_progress", label: "In Progress", desc: "Being processed", icon: <RefreshCcw size={14} className="text-blue-400" /> },
                    { value: "resolved", label: "Resolved", desc: "Issue fixed", icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
                    { value: "closed", label: "Closed", desc: "Ticket closed", icon: <X size={14} className="text-rose-400" /> },
                  ].map((option) => {
                    const isSelected = tempStatusFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTempStatusFilter(option.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md font-extrabold"
                            : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40"
                        } ${option.value === "" ? "col-span-2" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black flex items-center gap-1.5">
                            {option.icon}
                            {option.label}
                          </span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />}
                        </div>
                        <span className={`text-[9px] ${isSelected ? "text-black/80 font-medium" : "text-[var(--muted)]"}`}>
                          {option.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTempStatusFilter("");
                    setStatusFilter("");
                    setPage(1);
                    setIsFilterOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] transition-all cursor-pointer"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(tempStatusFilter);
                    setPage(1);
                    setIsFilterOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Apply Filter
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
function CustomDropdown({ value, onChange, options, disabled, compact }) {
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
    open: "text-amber-500",
    in_progress: "text-blue-500",
    resolved: "text-emerald-500",
    closed: "text-rose-500",
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-1.5 px-2.5 
          ${compact ? "h-8 min-w-[105px]" : "h-11 w-full px-4"}
          rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          text-[10px] font-black uppercase transition-all cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.08] active:scale-[0.98]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : "text-[var(--foreground)]"}
        `}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${styles[value] || "text-[var(--muted)]"}`} />
          <span className={styles[value] || "text-[var(--foreground)]"}>
            {selectedOption?.label}
          </span>
        </div>
        <ChevronDown size={12} className={`transition-transform duration-300 text-[var(--muted)] ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-[1200] right-0 min-w-[130px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase rounded-lg transition-all
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

function DetailBlock({ label, value, emphasize, icon }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase flex items-center gap-1.5">
        <span className="text-[var(--accent)]">{icon}</span> {label}
      </p>
      <p className={`text-sm font-bold ${emphasize ? "text-[var(--accent)] capitalize italic" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}
