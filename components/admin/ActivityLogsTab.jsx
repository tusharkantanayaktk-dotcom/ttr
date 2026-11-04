"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiActivity,
  FiUsers,
  FiShield,
  FiSettings,
  FiDollarSign,
  FiShoppingBag,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiEye,
  FiMail,
  FiPhone,
  FiUserCheck,
  FiUserPlus,
  FiLogIn,
  FiPackage,
  FiCopy,
  FiCheck,
  FiSliders,
} from "react-icons/fi";
import Skeleton from "@/components/Skeleton";

// Helper for formatting dates
function formatLogTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  let relative = "Just now";
  if (diffDays > 0) relative = `${diffDays}d ago`;
  else if (diffHour > 0) relative = `${diffHour}h ago`;
  else if (diffMin > 0) relative = `${diffMin}m ago`;
  else if (diffSec > 10) relative = `${diffSec}s ago`;

  const full = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return { relative, full };
}

// Action configurations for badge and colors
const ACTION_CONFIG = {
  // Normal / User activities
  SIGNUP: { label: "Registration", icon: FiUserPlus, bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  SIGNUP_GOOGLE: { label: "Google Signup", icon: FiUserPlus, bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  LOGIN: { label: "Login", icon: FiLogIn, bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  LOGIN_GOOGLE: { label: "Google Login", icon: FiLogIn, bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  TOPUP_ORDER: { label: "Topup Placed", icon: FiShoppingBag, bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  TOPUP_SUCCESS: { label: "Topup Success", icon: FiCheckCircle, bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  TOPUP_FAILED: { label: "Topup Failed", icon: FiAlertCircle, bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  WALLET_DEPOSIT: { label: "Wallet Deposit", icon: FiCreditCard, bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },

  // Owner activities
  SETTINGS_UPDATE: { label: "Settings Change", icon: FiSettings, bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  PRICING_UPDATE: { label: "Price Update", icon: FiDollarSign, bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  ROLE_CHANGE: { label: "Role Change", icon: FiShield, bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  WALLET_ADJUST: { label: "Wallet Adjust", icon: FiCreditCard, bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  STOCK_UPDATE: { label: "Stock Update", icon: FiPackage, bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  BANNER_UPDATE: { label: "Banner Update", icon: FiSliders, bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
};

export default function ActivityLogsTab() {
  const [activeSubTab, setActiveSubTab] = useState("normal"); // "normal" | "owner"
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    normalCount: 0,
    ownerCount: 0,
    normalToday: 0,
    ownerToday: 0,
  });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Modal inspection state
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when switching tabs or filters
  useEffect(() => {
    setPage(1);
    setActionFilter("all");
  }, [activeSubTab]);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Fetch Activity Logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const params = new URLSearchParams({
        type: activeSubTab,
        page: String(page),
        limit: "20",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(actionFilter !== "all" && { action: actionFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/activity-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs || []);
        setPagination(data.data.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeSubTab, page, debouncedSearch, actionFilter, statusFilter]);

  // Available filter options per tab
  const filterOptions = useMemo(() => {
    if (activeSubTab === "normal") {
      return [
        { id: "all", label: "All Activities" },
        { id: "SIGNUP", label: "Signups" },
        { id: "LOGIN", label: "Logins" },
        { id: "TOPUP_ORDER", label: "Topup Orders" },
        { id: "TOPUP_SUCCESS", label: "Topup Success" },
        { id: "WALLET_DEPOSIT", label: "Wallet Deposits" },
      ];
    }
    return [
      { id: "all", label: "All Changes" },
      { id: "SETTINGS_UPDATE", label: "Store Settings" },
      { id: "PRICING_UPDATE", label: "Game Prices" },
      { id: "ROLE_CHANGE", label: "Role Updates" },
      { id: "WALLET_ADJUST", label: "Wallet Adjust" },
      { id: "STOCK_UPDATE", label: "Catalog Stock" },
    ];
  }, [activeSubTab]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ================= HEADER & TWO MAIN TABS ================= */}
      <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0">
            <FiActivity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--foreground)] truncate">
              Activity Logs
            </h2>
            <p className="text-[11px] text-[var(--muted)] truncate max-w-[200px] sm:max-w-none">
              Monitor live user interactions and audit owner configuration changes
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] text-xs font-bold text-[var(--foreground)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          title="Refresh logs"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[var(--accent)]" : ""}`} />
          <span className="hidden min-[380px]:inline">Refresh</span>
        </button>
      </div>

      {/* ================= TOP LEVEL TABS: NORMAL vs OWNER ================= */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 p-1 bg-[var(--card)]/70 border border-[var(--border)] rounded-2xl shadow-sm">
        {/* NORMAL USER TAB */}
        <button
          type="button"
          onClick={() => setActiveSubTab("normal")}
          className={`flex items-center justify-between p-2 sm:p-3 rounded-xl transition-all cursor-pointer text-left min-w-0 ${
            activeSubTab === "normal"
              ? "bg-[var(--accent)] text-black shadow-md font-bold"
              : "bg-transparent text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeSubTab === "normal" ? "bg-black/15 text-black" : "bg-[var(--accent)]/10 text-[var(--accent)]"
            }`}>
              <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-black truncate">
                  <span className="min-[440px]:hidden">Normal</span>
                  <span className="hidden min-[440px]:inline">Normal Activity</span>
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full hidden min-[480px]:inline-block shrink-0 ${
                  activeSubTab === "normal" ? "bg-black text-[var(--accent)]" : "bg-[var(--accent)]/20 text-[var(--accent)]"
                }`}>
                  Users
                </span>
              </div>
              <p className={`text-[9px] sm:text-[10px] truncate ${activeSubTab === "normal" ? "text-black/80 font-medium" : "text-[var(--muted)]"}`}>
                <span className="min-[480px]:hidden">Signins & topups</span>
                <span className="hidden min-[480px]:inline">Signins, logins, game topups, wallet recharges</span>
              </p>
            </div>
          </div>
          <span className={`text-[11px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shrink-0 ml-1.5 ${
            activeSubTab === "normal" ? "bg-black/20 text-black" : "bg-[var(--border)] text-[var(--muted)]"
          }`}>
            {stats.normalCount}
          </span>
        </button>

        {/* OWNER TAB */}
        <button
          type="button"
          onClick={() => setActiveSubTab("owner")}
          className={`flex items-center justify-between p-2 sm:p-3 rounded-xl transition-all cursor-pointer text-left min-w-0 ${
            activeSubTab === "owner"
              ? "bg-[var(--accent)] text-black shadow-md font-bold"
              : "bg-transparent text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeSubTab === "owner" ? "bg-black/15 text-black" : "bg-purple-500/10 text-purple-400"
            }`}>
              <FiShield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-black truncate">
                  <span className="min-[440px]:hidden">Owner</span>
                  <span className="hidden min-[440px]:inline">Owner Activity</span>
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full hidden min-[480px]:inline-block shrink-0 ${
                  activeSubTab === "owner" ? "bg-black text-[var(--accent)]" : "bg-purple-500/20 text-purple-400"
                }`}>
                  Audit
                </span>
              </div>
              <p className={`text-[9px] sm:text-[10px] truncate ${activeSubTab === "owner" ? "text-black/80 font-medium" : "text-[var(--muted)]"}`}>
                <span className="min-[480px]:hidden">Settings & prices</span>
                <span className="hidden min-[480px]:inline">Gmail tracking: store settings, price slabs, roles</span>
              </p>
            </div>
          </div>
          <span className={`text-[11px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shrink-0 ml-1.5 ${
            activeSubTab === "owner" ? "bg-black/20 text-black" : "bg-[var(--border)] text-[var(--muted)]"
          }`}>
            {stats.ownerCount}
          </span>
        </button>
      </div>

      {/* ================= STATS SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider truncate">
            {activeSubTab === "normal" ? "Total Logs" : "Total Edits"}
          </span>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <span className="text-lg sm:text-xl font-black text-[var(--foreground)]">
              {activeSubTab === "normal" ? stats.normalCount : stats.ownerCount}
            </span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
              All Time
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider truncate">
            {activeSubTab === "normal" ? "Today" : "Changes Today"}
          </span>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <span className="text-lg sm:text-xl font-black text-[var(--accent)]">
              {activeSubTab === "normal" ? stats.normalToday : stats.ownerToday}
            </span>
            <span className="text-[9px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded shrink-0">
              Today
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider truncate">
            {activeSubTab === "normal" ? "Active Mode" : "Identity"}
          </span>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <span className="text-xs sm:text-sm font-black text-[var(--foreground)] truncate">
              {activeSubTab === "normal" ? "User Actions" : "Owner Gmail"}
            </span>
            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
              Verified
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider truncate">
            Current Filter
          </span>
          <div className="flex items-baseline justify-between mt-1 gap-1">
            <span className="text-xs sm:text-sm font-black text-[var(--foreground)] truncate">
              {pagination.total} Matching
            </span>
            <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded shrink-0">
              {pagination.page}/{pagination.totalPages || 1}
            </span>
          </div>
        </div>
      </div>

      {/* ================= CONTROLS: SEARCH & FILTER PILLS ================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeSubTab === "normal"
                ? "Search user email, name, phone, order ID, or description..."
                : "Search owner Gmail, setting key, game price, description..."
            }
            className="w-full pl-9 pr-8 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterOptions.map((opt) => {
            const isSelected = actionFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActionFilter(opt.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--accent)] text-black font-bold shadow-sm"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= LOGS LIST / TABLE ================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-3 bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-3">
            {activeSubTab === "normal" ? "User / Identity" : "Changed By (Gmail)"}
          </div>
          <div className="col-span-4">
            {activeSubTab === "normal" ? "Activity Details" : "Setting / Price Modifications"}
          </div>
          <div className="col-span-1 text-right">Details</div>
        </div>

        {/* Content Rows */}
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width="16%" height={32} />
                <Skeleton width="18%" height={32} />
                <Skeleton width="26%" height={32} />
                <Skeleton width="34%" height={32} />
                <Skeleton width="6%" height={32} />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center justify-center mx-auto mb-3 text-[var(--muted)]">
              <FiClock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">
              No activity logs found
            </h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              {search || actionFilter !== "all"
                ? "Try adjusting your search criteria or clearing action filters."
                : activeSubTab === "normal"
                ? "User signins, logins, and topup events will show up here automatically."
                : "Owner modifications to settings, pricing, and user roles will be logged here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]/60">
            {logs.map((log) => {
              const timeInfo = formatLogTime(log.createdAt);
              const conf = ACTION_CONFIG[log.action] || {
                label: log.action,
                icon: FiActivity,
                bg: "bg-[var(--foreground)]/[0.05]",
                border: "border-[var(--border)]",
                text: "text-[var(--foreground)]",
              };
              const ActionIcon = conf.icon;
              const isOwnerTab = activeSubTab === "owner";

              return (
                <div
                  key={log._id}
                  className="p-3.5 sm:px-4 hover:bg-[var(--foreground)]/[0.015] transition-colors"
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 items-center">
                    {/* Time */}
                    <div className="col-span-2 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                        <FiClock className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                        <span className="truncate">{timeInfo.relative}</span>
                      </div>
                      <span className="text-[10px] text-[var(--muted)] block truncate mt-0.5">
                        {timeInfo.full}
                      </span>
                    </div>

                    {/* Action Badge */}
                    <div className="col-span-2">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${conf.bg} ${conf.border} ${conf.text} text-[11px] font-bold`}>
                        <ActionIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{conf.label}</span>
                      </div>
                    </div>

                    {/* Actor (User or Owner Gmail) */}
                    <div className="col-span-3 min-w-0">
                      {isOwnerTab ? (
                        /* OWNER GMAIL HIGHLIGHT */
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] font-black text-xs flex items-center justify-center shrink-0">
                            {(log.user?.email || "O")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-[var(--foreground)] truncate" title={log.user?.email || "owner"}>
                                {log.user?.email || "Unknown Gmail"}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(log.user?.email, `mail-${log._id}`)}
                                className="text-[var(--muted)] hover:text-[var(--accent)] cursor-pointer"
                                title="Copy Gmail"
                              >
                                {copiedKey === `mail-${log._id}` ? (
                                  <FiCheck className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <FiCopy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[9px] font-bold tracking-wider uppercase text-[var(--accent)] block">
                              Owner Account
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL USER IDENTITY */
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[var(--foreground)] truncate">
                              {log.user?.name || log.user?.email || log.user?.phone || "Anonymous User"}
                            </span>
                            {log.user?.email && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(log.user?.email, `mail-${log._id}`)}
                                className="text-[var(--muted)] hover:text-[var(--accent)] cursor-pointer shrink-0"
                                title="Copy Email"
                              >
                                {copiedKey === `mail-${log._id}` ? (
                                  <FiCheck className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <FiCopy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--muted)] truncate">
                            {log.user?.email && <span className="truncate">{log.user?.email}</span>}
                            {log.user?.phone && <span>• {log.user?.phone}</span>}
                            {log.user?.userId && (
                              <span className="font-mono text-[9px] bg-[var(--foreground)]/[0.05] px-1 rounded">
                                {log.user?.userId}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Activity Summary / Description */}
                    <div className="col-span-4 min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-1" title={log.description}>
                        {log.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--muted)]">
                        {log.target && (
                          <span className="bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.2 rounded font-mono text-[9px] text-[var(--foreground)]/80 truncate max-w-[150px]">
                            {log.target}
                          </span>
                        )}
                        {log.ip && (
                          <span className="truncate">IP: {log.ip}</span>
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 hover:bg-[var(--foreground)]/[0.06] rounded-lg text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="View Full Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${conf.bg} ${conf.border} ${conf.text} text-[10px] font-bold`}>
                        <ActionIcon className="w-3 h-3 shrink-0" />
                        <span>{conf.label}</span>
                      </div>
                      <span className="text-[10px] text-[var(--muted)]">
                        {timeInfo.relative}
                      </span>
                    </div>

                    {/* Actor */}
                    {isOwnerTab ? (
                      <div className="flex items-center gap-2 bg-[var(--foreground)]/[0.03] p-2 rounded-xl border border-[var(--border)]/50">
                        <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] font-black text-xs flex items-center justify-center shrink-0">
                          {(log.user?.email || "O")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-[var(--foreground)] truncate block">
                            {log.user?.email || "Unknown Gmail"}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-[var(--accent)] block">
                            Owner
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-[var(--foreground)]">
                        {log.user?.name || log.user?.email || log.user?.phone || "Anonymous"}
                        {log.user?.email && (
                          <span className="text-[10px] text-[var(--muted)] block font-normal truncate">
                            {log.user?.email}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs font-medium text-[var(--foreground)]/90">
                      {log.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/40 text-[10px] text-[var(--muted)]">
                      <span>{timeInfo.full}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="text-[var(--accent)] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <FiEye className="w-3 h-3" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--foreground)]/[0.02] border-t border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
              Showing page <strong className="text-[var(--foreground)]">{pagination.page}</strong> of{" "}
              <strong className="text-[var(--foreground)]">{pagination.totalPages}</strong> ({pagination.total} logs)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--foreground)] cursor-pointer"
                title="Previous page"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--foreground)] cursor-pointer"
                title="Next page"
              >
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= DETAILS INSPECTION MODAL ================= */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)]">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${
                    selectedLog.type === "owner" ? "bg-purple-500/10 text-purple-400" : "bg-[var(--accent)]/10 text-[var(--accent)]"
                  }`}>
                    {selectedLog.type === "owner" ? <FiShield className="w-4 h-4" /> : <FiActivity className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--foreground)]">
                      {selectedLog.title}
                    </h3>
                    <p className="text-[10px] text-[var(--muted)]">
                      {selectedLog.type === "owner" ? "Owner configuration modification audit" : "User activity record"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Meta summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-0.5">
                      Action Type
                    </span>
                    <span className="font-mono font-bold text-[var(--foreground)]">
                      {selectedLog.action}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-0.5">
                      Status
                    </span>
                    <span className={`font-bold capitalize ${
                      selectedLog.status === "success" ? "text-emerald-400" : selectedLog.status === "failed" ? "text-rose-400" : "text-blue-400"
                    }`}>
                      {selectedLog.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-0.5">
                      {selectedLog.type === "owner" ? "Owner Gmail" : "User Email"}
                    </span>
                    <span className="font-semibold text-[var(--foreground)] truncate block font-mono text-[11px]">
                      {selectedLog.user?.email || "N/A"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-0.5">
                      IP Address
                    </span>
                    <span className="font-mono text-[11px] text-[var(--foreground)] block">
                      {selectedLog.ip || "Unknown IP"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold block mb-1">
                    Event Description
                  </span>
                  <p className="text-xs font-medium text-[var(--foreground)] leading-relaxed">
                    {selectedLog.description}
                  </p>
                </div>

                {/* Structured Payload / Details */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--muted)] uppercase font-bold">
                        Detailed Payload / Parameters
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(selectedLog.details, null, 2), "modal-json")}
                        className="text-[10px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "modal-json" ? (
                          <>
                            <FiCheck className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-3 h-3" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3 rounded-xl bg-black/60 border border-[var(--border)] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 scrollbar-thin">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 px-4 border-t border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  {formatLogTime(selectedLog.createdAt).full}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-3.5 py-1.5 bg-[var(--accent)] text-black text-xs font-bold rounded-xl active:scale-95 transition-transform cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
