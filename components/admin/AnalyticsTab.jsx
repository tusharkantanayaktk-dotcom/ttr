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
  FiActivity
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function AnalyticsTab() {
  const [range, setRange] = useState("1d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (selectedRange = range) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`, {
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
    fetchAnalytics(range);
  }, [range]);

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
  } = analyticsData || {};

  const maxHourlyOrders = Math.max(...(peakHours.hourlyBreakdown?.map((h) => h.ordersCount) || [1]), 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Analytics</h2>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
            {[
              { label: "24H", value: "1d" },
              { label: "7D", value: "7d" },
              { label: "30D", value: "30d" },
              { label: "All", value: "all" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRange(tab.value)}
                className={`py-1 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  range === tab.value
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(range)}
            disabled={loading}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none shrink-0"
            title="Refresh Analytics"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ================= COMBINED COMPACT STATS ================= */}
      <div className="p-3 sm:p-4 rounded-xl bg-[var(--card)]/50 border border-[var(--border)] space-y-3">
        {/* Top: Store Performance */}
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
              Store Performance
            </span>
            <span className="text-[10px] text-[var(--muted)] font-medium">
              {summary.totalOrders || 0} Total Orders
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {/* Revenue */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <span>Revenue</span>
                <FiDollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
                  ₹{(summary.totalRevenue || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {summary.successfulOrders || 0} orders
                </span>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <span>Avg Order Value</span>
                <FiTrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
                  ₹{summary.aov || 0}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">
                  {summary.conversionRate || 0}% conv
                </span>
              </div>
            </div>

            {/* Busiest Hour */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <span>Busiest Hour</span>
                <FiClock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
                  {peakHours.peakHour ? peakHours.peakHour.label : "N/A"}
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {peakHours.peakHour?.ordersCount || 0} orders
                </span>
              </div>
            </div>

            {/* Repeat Buyers */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <span>Repeat Buyers</span>
                <FiRepeat className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-1 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
                  {userMetrics.returningUserRate || 0}%
                </span>
                <span className="text-[10px] text-purple-400 font-bold">
                  {userMetrics.returningBuyersCount || 0} buyers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: App & Mobile Installs */}
        <div className="pt-2.5 border-t border-[var(--border)]/60">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
              <FiSmartphone className="w-3 h-3 text-cyan-400" /> App & Mobile Installs
            </span>
            <span className="text-[10px] font-bold text-cyan-400">
              Total Installs: {pwaStats.allTimePwaInstalls || 0}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {/* New Installs */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                <span>New Installs</span>
                <span className="text-[10px] text-[var(--muted)] font-normal">{pwaStats.installConversionRate || 0}% rate</span>
              </div>
              <p className="text-base sm:text-lg font-black text-[var(--foreground)] mt-1">
                {pwaStats.periodPwaInstalls || 0}
              </p>
            </div>

            {/* App Opens */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <span>App Opens</span>
                <span className="text-[10px] text-[var(--muted)] font-normal">Launches</span>
              </div>
              <p className="text-base sm:text-lg font-black text-[var(--foreground)] mt-1">
                {pwaStats.periodPwaLaunches || 0}
              </p>
            </div>

            {/* Prompts Shown */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-purple-400">
                <span>Prompts Shown</span>
                <span className="text-[10px] text-[var(--muted)] font-normal">Views</span>
              </div>
              <p className="text-base sm:text-lg font-black text-[var(--foreground)] mt-1">
                {pwaStats.periodPromptShown || 0}
              </p>
            </div>

            {/* Dismissed */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-400">
                <span>Dismissed</span>
                <span className="text-[10px] text-[var(--muted)] font-normal">Closed</span>
              </div>
              <p className="text-base sm:text-lg font-black text-[var(--foreground)] mt-1">
                {pwaStats.periodPromptDismiss || 0}
              </p>
            </div>
          </div>

          {/* PWA Platform Breakdown */}
          {pwaStats.platformBreakdown && pwaStats.platformBreakdown.length > 0 && (
            <div className="flex items-center gap-2 pt-2 text-[10px] text-[var(--muted)] font-medium flex-wrap">
              <span className="font-bold uppercase text-[9px]">Platforms:</span>
              {pwaStats.platformBreakdown.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-[10px]"
                >
                  {item.platform}: <strong className="text-cyan-400">{item.installs}</strong> ({item.launches} opens)
                </span>
              ))}
            </div>
          )}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Customer Acquisition vs Retention */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <FiUsers className="text-purple-400 shrink-0" /> New vs. Returning Buyers
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Analyze customer loyalty and repeat purchasing patterns
          </p>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase text-cyan-400">New Buyers</span>
              <h4 className="text-lg sm:text-xl font-black text-[var(--foreground)] mt-1">
                {userMetrics.newBuyersCount || 0}
              </h4>
              <p className="text-[10px] text-[var(--muted)] mt-0.5">
                ₹{(userMetrics.newBuyersRevenue || 0).toLocaleString("en-IN")} revenue
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase text-purple-400">Returning Buyers</span>
              <h4 className="text-lg sm:text-xl font-black text-[var(--foreground)] mt-1">
                {userMetrics.returningBuyersCount || 0}
              </h4>
              <p className="text-[10px] text-[var(--muted)] mt-0.5">
                ₹{(userMetrics.returningBuyersRevenue || 0).toLocaleString("en-IN")} revenue
              </p>
            </div>
          </div>

          {/* Retention Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[var(--muted)]">Retention Ratio</span>
              <span className="text-purple-400">{userMetrics.returningUserRate || 0}% Repeat Rate</span>
            </div>
            <div className="h-3 w-full bg-[var(--background)] rounded-full overflow-hidden flex border border-[var(--border)]">
              <div
                style={{ width: `${100 - (userMetrics.returningUserRate || 0)}%` }}
                className="bg-cyan-500 transition-all duration-500"
                title="New Buyers"
              />
              <div
                style={{ width: `${userMetrics.returningUserRate || 0}%` }}
                className="bg-purple-500 transition-all duration-500"
                title="Returning Buyers"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--muted)] font-medium pt-0.5">
              <span>🔵 New: {100 - (userMetrics.returningUserRate || 0)}%</span>
              <span>🟣 Returning: {userMetrics.returningUserRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <FiShoppingBag className="text-[var(--accent)] shrink-0" /> Order Fulfillment Pipeline
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            Total of <strong>{summary.totalOrders || 0}</strong> transactions placed in this period
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <FiCheckCircle className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
              <span className="text-[10px] font-bold uppercase text-emerald-400">Success</span>
              <h4 className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">{summary.successfulOrders || 0}</h4>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <FiClock className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <span className="text-[10px] font-bold uppercase text-amber-400">Pending</span>
              <h4 className="text-base sm:text-lg font-black text-amber-400 mt-0.5">{summary.pendingOrders || 0}</h4>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <FiXCircle className="w-4 h-4 mx-auto text-red-400 mb-1" />
              <span className="text-[10px] font-bold uppercase text-red-400">Failed</span>
              <h4 className="text-base sm:text-lg font-black text-red-400 mt-0.5">{summary.failedOrders || 0}</h4>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <FiRepeat className="w-4 h-4 mx-auto text-blue-400 mb-1" />
              <span className="text-[10px] font-bold uppercase text-blue-400">Refund</span>
              <h4 className="text-base sm:text-lg font-black text-blue-400 mt-0.5">{summary.refundOrders || 0}</h4>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--muted)] font-medium">All-Time Platform Orders:</span>
            <span className="font-black text-[var(--foreground)]">{summary.allTimeOrdersCount?.toLocaleString() || 0}</span>
          </div>
        </div>
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
            topSpenders.map((user, i) => (
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
    </div>
  );
}
