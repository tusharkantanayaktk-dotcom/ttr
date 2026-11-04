"use client";

import { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiRepeat,
  FiAward,
  FiCreditCard,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiSmartphone,
  FiDownload,
  FiLayers,
  FiActivity,
  FiCalendar,
  FiFilter,
  FiChevronDown,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function formatYMD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return formatYMD(new Date());
}

export default function AnalyticsTab() {
  const [range, setRange] = useState("1d");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  // Bottomsheet state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempRange, setTempRange] = useState("1d");
  const [tempCustomRange, setTempCustomRange] = useState({ from: "", to: "" });
  const [dateError, setDateError] = useState("");

  const getActiveRangeLabel = () => {
    if (range === "custom" && customRange.from && customRange.to) {
      const f = new Date(customRange.from);
      const t = new Date(customRange.to);
      const fStr = f.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const tStr = t.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${fStr} – ${tStr}`;
    }
    switch (range) {
      case "1d":
        return "24H (Today)";
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      case "all":
        return "All Time";
      default:
        return "24H";
    }
  };

  const openFilterSheet = () => {
    setTempRange(range);
    setTempCustomRange({
      from: customRange.from || formatYMD(new Date(Date.now() - 7 * 86400000)),
      to: customRange.to || getTodayString(),
    });
    setDateError("");
    setIsFilterOpen(true);
  };

  const applyFilter = () => {
    if (tempRange === "custom") {
      if (!tempCustomRange.from || !tempCustomRange.to) {
        setDateError("Please select both start and end dates.");
        return;
      }
      if (new Date(tempCustomRange.from) > new Date(tempCustomRange.to)) {
        setDateError("Start date cannot be after end date.");
        return;
      }
    }

    setDateError("");
    setRange(tempRange);
    setCustomRange(tempCustomRange);
    setIsFilterOpen(false);
    fetchAnalytics(tempRange, tempCustomRange);
  };

  const resetFilter = () => {
    setTempRange("1d");
    setTempCustomRange({ from: "", to: "" });
    setDateError("");
    setRange("1d");
    setCustomRange({ from: "", to: "" });
    setIsFilterOpen(false);
    fetchAnalytics("1d", { from: "", to: "" });
  };

  const fetchAnalytics = async (selectedRange = range, customDates = customRange) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      let url = `/api/admin/analytics?range=${selectedRange}`;
      if (selectedRange === "custom" && customDates?.from && customDates?.to) {
        url = `/api/admin/analytics?from=${encodeURIComponent(customDates.from)}&to=${encodeURIComponent(customDates.to)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load analytics");
      }

      setAnalyticsData(json.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range, customRange);
  }, []);

  if (loading && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[var(--muted)] animate-pulse text-center px-4">
          Aggregating store analytics, peak hours & PWA metrics...
        </p>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="p-6 sm:p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <FiAlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
        <p className="text-sm font-bold text-red-400 mb-4">{error}</p>
        <button
          onClick={() => fetchAnalytics(range)}
          className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-black border border-[var(--border)] rounded-lg text-xs font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    summary = {},
    userMetrics = {},
    peakHours = {},
    topProducts = [],
    topGames = [],
    paymentMethods = [],
    topSpenders = [],
    pwaStats = {},
    tierSplit = {},
  } = analyticsData || {};

  const maxHourlyOrders = Math.max(...(peakHours.hourlyBreakdown?.map((h) => h.ordersCount) || [1]), 1);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Analytics</h2>

        <div className="flex items-center gap-2">
          {/* Filter Bottomsheet Trigger Button */}
          <button
            type="button"
            onClick={openFilterSheet}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] border border-[var(--border)] hover:border-[var(--accent)]/50 text-xs font-bold text-[var(--foreground)] active:scale-95 transition-all shadow-sm cursor-pointer group"
            title="Filter Analytics by timeframe or custom dates"
          >
            <FiFilter className="w-3.5 h-3.5 text-[var(--accent)] group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate max-w-[110px] min-[380px]:max-w-[160px] sm:max-w-none">{getActiveRangeLabel()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
            <FiChevronDown className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors shrink-0" />
          </button>

          <button
            onClick={() => fetchAnalytics(range, customRange)}
            disabled={loading}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh Analytics"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[var(--accent)]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ================= COMPACT STORE & APP OVERVIEW (1 ROW, 3 CARDS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5">
        {/* CARD 1: REVENUE & SALES */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FiDollarSign className="w-3.5 h-3.5" /> Revenue & Orders
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {summary.successfulOrders || 0} Successful
              </span>
            </div>

            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                ₹{(summary.totalRevenue || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[var(--muted)] block font-medium mt-0.5">
                Total store sales across selected timeframe
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <FiTrendingUp className="w-3 h-3 text-cyan-400" />
              <span>AOV:</span>
              <strong className="text-[var(--foreground)]">₹{summary.aov || 0}</strong>
            </span>
            <span>
              Conv: <strong className="text-cyan-400">{summary.conversionRate || 0}%</strong>
            </span>
          </div>
        </div>

        {/* CARD 2: CUSTOMERS & RETENTION */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <FiRepeat className="w-3.5 h-3.5" /> Customer Retention
              </span>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                {userMetrics.returningBuyersCount || 0} Repeat Buyers
              </span>
            </div>

            <div className="mt-2.5">
              <span className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                {userMetrics.returningUserRate || 0}%
              </span>
              <span className="text-[10px] text-[var(--muted)] block font-medium mt-0.5">
                Repeat purchase rate ({summary.totalOrders || 0} total orders)
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <FiClock className="w-3 h-3 text-amber-400" />
              <span>Busiest:</span>
              <strong className="text-amber-400 font-bold">{peakHours.peakHour ? peakHours.peakHour.label : "N/A"}</strong>
            </span>
            <span>
              Orders: <strong className="text-[var(--foreground)]">{peakHours.peakHour?.ordersCount || 0}</strong>
            </span>
          </div>
        </div>

        {/* CARD 3: APP & MOBILE INSTALLS (PWA) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FiSmartphone className="w-3.5 h-3.5" /> App & Mobile
              </span>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                {pwaStats.allTimePwaInstalls || 0} Total Installs
              </span>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                  {pwaStats.periodPwaInstalls || 0}
                </span>
                <span className="text-xs font-bold text-cyan-400">New Installs</span>
              </div>
              <span className="text-[10px] text-[var(--muted)] block font-medium mt-0.5">
                {pwaStats.periodPwaLaunches || 0} launches in this timeframe
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>
              Conversion: <strong className="text-cyan-400">{pwaStats.installConversionRate || 0}%</strong>
            </span>
            {pwaStats.platformBreakdown && pwaStats.platformBreakdown.length > 0 ? (
              <span className="font-bold text-[10px] text-[var(--foreground)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
                {pwaStats.platformBreakdown[0].platform}: {pwaStats.platformBreakdown[0].installs}
              </span>
            ) : (
              <span className="text-[10px] text-[var(--muted)]">Mobile PWA</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= PEAK HOURS ANALYSIS ================= */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
              <FiClock className="text-amber-400 shrink-0" /> Orders by Hour (24h)
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              See what times get the most orders
            </p>
          </div>
          {peakHours.peakHour && (
            <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold shrink-0">
              <span>🔥 Busiest: <strong>{peakHours.peakHour.label} - {(peakHours.peakHour.hour + 1) % 24}:00</strong></span>
            </div>
          )}
        </div>

        {/* 24-Hour Interactive Bar Chart with horizontal touch scroll */}
        <div className="pt-3 pb-1">
          <div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-1">
            <div className="min-w-[440px] sm:min-w-0">
              <div className="grid grid-cols-24 gap-1 sm:gap-1.5 items-end h-36 sm:h-40 px-1 sm:px-2 border-b border-[var(--border)]">
                {peakHours.hourlyBreakdown?.map((h) => {
                  const heightPercent = maxHourlyOrders > 0 ? (h.ordersCount / maxHourlyOrders) * 100 : 0;
                  const isPeak = peakHours.peakHour && peakHours.peakHour.hour === h.hour && h.ordersCount > 0;

                  return (
                    <div key={h.hour} className="flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-black/90 text-white border border-[var(--border)] px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap z-20 shadow-xl pointer-events-none">
                        <span className="font-extrabold text-[var(--accent)]">{h.label}</span>
                        <span>{h.ordersCount} orders</span>
                        <span className="text-emerald-400">₹{h.totalRevenue.toLocaleString("en-IN")}</span>
                      </div>

                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`w-full rounded-t-md transition-all cursor-pointer ${
                          isPeak
                            ? "bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                            : h.ordersCount > 0
                            ? "bg-gradient-to-t from-[var(--accent)] to-cyan-300 group-hover:brightness-125"
                            : "bg-[var(--border)] opacity-30"
                        }`}
                      />
                      <span className="text-[8px] sm:text-[9px] font-bold text-[var(--muted)] mt-1.5 group-hover:text-[var(--foreground)]">
                        {h.hour % 3 === 0 ? `${h.hour}h` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center text-[9px] sm:text-[10px] text-[var(--muted)] mt-2.5 px-1 sm:px-2 gap-1">
            <span>🌙 Midnight (00:00)</span>
            <span>🌅 Morning (08:00)</span>
            <span>☀️ Afternoon (14:00)</span>
            <span>🌆 Evening / Night (20:00)</span>
          </div>
        </div>
      </div>

      {/* ================= RETURNING USERS & ORDER STATUS SPLIT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Customer Acquisition vs Retention */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                <FiUsers className="text-purple-400 shrink-0" size={15} /> Customer Loyalty
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400">
                {userMetrics.returningUserRate || 0}% Repeat Rate
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              New vs. returning buyer conversion and spend split
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>New Buyers</span>
              </div>
              <h4 className="text-xl font-black text-[var(--foreground)] mt-1.5 tracking-tight">
                {userMetrics.newBuyersCount || 0}
              </h4>
              <p className="text-[11px] font-semibold text-[var(--muted)] mt-0.5">
                ₹{(userMetrics.newBuyersRevenue || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Returning Buyers</span>
              </div>
              <h4 className="text-xl font-black text-[var(--foreground)] mt-1.5 tracking-tight">
                {userMetrics.returningBuyersCount || 0}
              </h4>
              <p className="text-[11px] font-semibold text-[var(--muted)] mt-0.5">
                ₹{(userMetrics.returningBuyersRevenue || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Retention Ratio Stacked Bar */}
          <div className="space-y-1.5 pt-1 border-t border-[var(--border)]/60">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-[var(--muted)]">Retention Ratio</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-cyan-400 font-bold">New: {100 - (userMetrics.returningUserRate || 0)}%</span>
                <span className="text-purple-400 font-bold">Returning: {userMetrics.returningUserRate || 0}%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-[var(--foreground)]/[0.06] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.max(100 - (userMetrics.returningUserRate || 0), 0)}%` }}
                className="bg-cyan-500 transition-all duration-500 rounded-l-full"
                title={`New: ${100 - (userMetrics.returningUserRate || 0)}%`}
              />
              <div
                style={{ width: `${Math.max(userMetrics.returningUserRate || 0, 0)}%` }}
                className="bg-purple-500 transition-all duration-500 rounded-r-full"
                title={`Returning: ${userMetrics.returningUserRate || 0}%`}
              />
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                <FiShoppingBag className="text-[var(--accent)] shrink-0" size={15} /> Order Pipeline
              </h3>
              <span className="text-xs font-bold text-[var(--muted)]">
                {summary.totalOrders || 0} Total in period
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              Fulfillment and transaction status breakdown
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1.5">
                <FiCheckCircle size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block">Success</span>
              <h4 className="text-base sm:text-lg font-black text-emerald-500 mt-0.5">{summary.successfulOrders || 0}</h4>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1.5">
                <FiClock size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block">Pending</span>
              <h4 className="text-base sm:text-lg font-black text-amber-500 mt-0.5">{summary.pendingOrders || 0}</h4>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1.5">
                <FiXCircle size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block">Failed</span>
              <h4 className="text-base sm:text-lg font-black text-rose-500 mt-0.5">{summary.failedOrders || 0}</h4>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-center">
              <div className="w-7 h-7 mx-auto rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1.5">
                <FiRepeat size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block">Refund</span>
              <h4 className="text-base sm:text-lg font-black text-blue-500 mt-0.5">{summary.refundOrders || 0}</h4>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--muted)] text-[11px] font-medium">All-Time Platform Orders:</span>
            <span className="font-black text-[var(--foreground)] tracking-tight">{(summary.allTimeOrdersCount || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* ================= RESELLER vs RETAIL (B2B vs B2C) SPLIT ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
              <FiUsers className="text-[var(--accent)] shrink-0" /> Reseller vs. Retail Split (B2B vs. B2C)
            </h3>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Compare volume and order economics between bulk resellers and regular retail customers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
              {tierSplit.totalResellersRegistered || 0} Registered Resellers
            </span>
          </div>
        </div>

        {/* Visual Revenue Ratio Progress Bar */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-1.5 text-xs font-bold">
            <div className="flex items-center gap-1.5 sm:gap-2 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <span>Retail (B2C): {tierSplit.retail?.revenueShare || 0}%</span>
              <span className="text-[10px] text-[var(--muted)] font-normal">
                (₹{(tierSplit.retail?.revenue || 0).toLocaleString("en-IN")})
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
              <span>Reseller (B2B): {tierSplit.reseller?.revenueShare || 0}%</span>
              <span className="text-[10px] text-[var(--muted)] font-normal">
                (₹{(tierSplit.reseller?.revenue || 0).toLocaleString("en-IN")})
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-[var(--foreground)]/[0.08] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.max(tierSplit.retail?.revenueShare || 0, 0)}%` }}
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 rounded-l-full"
              title={`Retail: ${tierSplit.retail?.revenueShare || 0}%`}
            />
            <div
              style={{ width: `${Math.max(tierSplit.reseller?.revenueShare || 0, 0)}%` }}
              className="bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500 rounded-r-full"
              title={`Reseller: ${tierSplit.reseller?.revenueShare || 0}%`}
            />
          </div>
        </div>

        {/* 2 Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Retail Column */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Retail Customers (B2C)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                Regular Users
              </span>
            </div>

            <div className="my-3">
              <span className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                ₹{(tierSplit.retail?.revenue || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-[var(--muted)] block font-medium mt-0.5">
                {tierSplit.retail?.ordersCount || 0} orders ({tierSplit.retail?.uniqueBuyers || 0} unique buyers)
              </span>
            </div>

            <div className="pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Avg Order Value (AOV):</span>
              <strong className="text-[var(--foreground)] font-bold">
                ₹{tierSplit.retail?.aov || 0}
              </strong>
            </div>
          </div>

          {/* Reseller Column */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Resellers & Admins (B2B)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                Tier / Bulk Pricing
              </span>
            </div>

            <div className="my-3">
              <span className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                ₹{(tierSplit.reseller?.revenue || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-[var(--muted)] block font-medium mt-0.5">
                {tierSplit.reseller?.ordersCount || 0} orders ({tierSplit.reseller?.activeResellersCount || 0} active resellers)
              </span>
            </div>

            <div className="pt-2.5 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Avg Order Value (AOV):</span>
              <strong className="text-purple-400 font-bold">
                ₹{tierSplit.reseller?.aov || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Top Performing Resellers List (if any active) */}
        {tierSplit.topResellers && tierSplit.topResellers.length > 0 ? (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Top Contributing Resellers (This Timeframe)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tierSplit.topResellers.map((r, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-[var(--foreground)] truncate block text-xs">
                      {r.name || r.email || r.phone || "Reseller"}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {r.ordersCount} orders placed
                    </span>
                  </div>
                  <span className="text-xs font-black text-purple-400 shrink-0">
                    ₹{r.totalSpent.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[var(--muted)] text-[11px]">
              Tip: You can assign users to the <strong>Admin (Reseller)</strong> role in the Users tab to grant wholesale pricing slabs.
            </span>
            <span className="text-[10px] font-bold text-[var(--accent)] shrink-0 self-start sm:self-auto">
              B2B Ready
            </span>
          </div>
        )}
      </div>

      {/* ================= HIGHEST SELLING PRODUCTS ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
              <FiAward className="text-amber-400 shrink-0" /> Highest Selling Products (Top Packages)
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Ranked by total quantity sold and revenue generated
            </p>
          </div>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-[var(--muted)] py-6 text-center">No product sales in this timeframe.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="min-w-[500px] w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)] uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Game</th>
                  <th className="py-2.5 px-3 text-right">Orders Sold</th>
                  <th className="py-2.5 px-3 text-right">Avg Price</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {topProducts.map((p, index) => (
                  <tr key={index} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[var(--muted)]">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-[var(--foreground)]">
                      {p.itemName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase">
                        {p.gameSlug}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-cyan-400">
                      {p.ordersCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--muted)] font-medium">
                      ₹{Math.round(p.avgPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400">
                      ₹{p.totalRevenue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= TOP GAMES & PAYMENT METHODS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Top Games */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <FiLayers className="text-[var(--accent)] shrink-0" /> Top Games by Revenue
          </h3>
          <div className="space-y-2.5">
            {topGames.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">No game data available.</p>
            ) : (
              topGames.map((g, i) => {
                const totalGameRevenue = summary.totalRevenue || 1;
                const sharePercent = Math.round((g.totalRevenue / totalGameRevenue) * 100) || 0;
                return (
                  <div key={i} className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold uppercase text-[var(--foreground)]">{g.gameSlug}</span>
                      <div className="text-right">
                        <span className="font-black text-emerald-400">₹{g.totalRevenue.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-[var(--muted)] ml-2">({g.ordersCount} orders)</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--card)] rounded-full overflow-hidden">
                      <div style={{ width: `${sharePercent}%` }} className="h-full bg-[var(--accent)] rounded-full" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <FiCreditCard className="text-emerald-400 shrink-0" /> Payment Methods Share
          </h3>
          <div className="space-y-2.5">
            {paymentMethods.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">No payment method records.</p>
            ) : (
              paymentMethods.map((pm, i) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold uppercase text-[var(--foreground)]">{pm._id}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-400">₹{(pm.totalRevenue || 0).toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {pm.successfulOrders} / {pm.totalOrders} successful
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= TOP VIP SPENDERS ================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
          <FiAward className="text-amber-400 shrink-0" /> Top Spenders & VIP Customers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {topSpenders.length === 0 ? (
            <p className="text-xs text-[var(--muted)] col-span-3 text-center py-4">No customer orders recorded.</p>
          ) : (
            topSpenders.slice(0, 6).map((user, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)] relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[var(--muted)]">VIP #{i + 1}</span>
                  <span className="text-xs font-black text-emerald-400">₹{user.totalSpent.toLocaleString("en-IN")}</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--foreground)] mt-1.5 truncate">
                  {user.samplePhone || user.sampleEmail || user.samplePlayerId || user._id || "Customer"}
                </h4>
                <div className="flex justify-between items-center text-[10px] text-[var(--muted)] mt-1">
                  <span>{user.ordersCount} total orders</span>
                  <span>AOV: ₹{Math.round(user.totalSpent / user.ordersCount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= FILTER BOTTOMSHEET ================= */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Bottomsheet Drawer */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative bg-[var(--card)] w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[var(--border)] p-4 sm:p-5 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col z-10 pb-6 sm:pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Indicator */}
              <div className="w-10 h-1 rounded-full bg-[var(--foreground)]/20 mx-auto mb-3 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[var(--foreground)]">
                      Filter Timeframe
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      Select preset timeframe or pick custom date range
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Body (Scrollable) */}
              <div className="py-4 space-y-4 overflow-y-auto">
                {/* Timeframe Presets */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] block mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "24H (Today)", sub: "Last 24 hours", value: "1d" },
                      { label: "7 Days", sub: "Last week", value: "7d" },
                      { label: "30 Days", sub: "Last month", value: "30d" },
                      { label: "90 Days", sub: "Last 3 months", value: "90d" },
                      { label: "All Time", sub: "All store history", value: "all" },
                      { label: "Custom Range", sub: "Choose from/to", value: "custom" },
                    ].map((preset) => {
                      const isSelected = tempRange === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            setTempRange(preset.value);
                            setDateError("");
                            if (preset.value === "custom" && !tempCustomRange.from) {
                              const today = getTodayString();
                              const sevenDaysAgo = formatYMD(new Date(Date.now() - 7 * 86400000));
                              setTempCustomRange({ from: sevenDaysAgo, to: today });
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md font-bold"
                              : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-black truncate">{preset.label}</span>
                            {isSelected && <FiCheck className="w-3 h-3 text-black shrink-0" />}
                          </div>
                          <span className={`text-[9px] block truncate ${isSelected ? "text-black/80 font-medium" : "text-[var(--muted)]"}`}>
                            {preset.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Range Picker */}
                {tempRange === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-2 border-t border-[var(--border)]"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                        Select Custom Date Range
                      </label>
                      <span className="text-[10px] text-[var(--accent)] font-semibold">
                        Choose start & end dates
                      </span>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[10px] font-bold text-[var(--muted)] block mb-1">
                          From (Start Date)
                        </span>
                        <input
                          type="date"
                          value={tempCustomRange.from}
                          max={tempCustomRange.to || getTodayString()}
                          onChange={(e) => {
                            setTempCustomRange((prev) => ({ ...prev, from: e.target.value }));
                            setDateError("");
                          }}
                          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors scheme-dark"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[var(--muted)] block mb-1">
                          To (End Date)
                        </span>
                        <input
                          type="date"
                          value={tempCustomRange.to}
                          min={tempCustomRange.from}
                          max={getTodayString()}
                          onChange={(e) => {
                            setTempCustomRange((prev) => ({ ...prev, to: e.target.value }));
                            setDateError("");
                          }}
                          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-2.5 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors scheme-dark"
                        />
                      </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div>
                      <span className="text-[9px] font-bold uppercase text-[var(--muted)] block mb-1.5">
                        Date Shortcuts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            label: "Today",
                            getDates: () => {
                              const t = getTodayString();
                              return { from: t, to: t };
                            },
                          },
                          {
                            label: "Yesterday",
                            getDates: () => {
                              const y = formatYMD(new Date(Date.now() - 86400000));
                              return { from: y, to: y };
                            },
                          },
                          {
                            label: "Last 7 Days",
                            getDates: () => {
                              const t = getTodayString();
                              const f = formatYMD(new Date(Date.now() - 7 * 86400000));
                              return { from: f, to: t };
                            },
                          },
                          {
                            label: "This Month",
                            getDates: () => {
                              const now = new Date();
                              const first = formatYMD(new Date(now.getFullYear(), now.getMonth(), 1));
                              return { from: first, to: getTodayString() };
                            },
                          },
                          {
                            label: "Last Month",
                            getDates: () => {
                              const now = new Date();
                              const first = formatYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1));
                              const last = formatYMD(new Date(now.getFullYear(), now.getMonth(), 0));
                              return { from: first, to: last };
                            },
                          },
                        ].map((sc) => (
                          <button
                            key={sc.label}
                            type="button"
                            onClick={() => {
                              setTempCustomRange(sc.getDates());
                              setDateError("");
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[var(--background)] hover:bg-[var(--foreground)]/[0.06] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          >
                            {sc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Notice */}
                    {dateError && (
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{dateError}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-colors cursor-pointer"
                >
                  Reset to 24H
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyFilter}
                    className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[var(--accent)] text-black hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
