"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Sparkles } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly"); // monthly | weekly | all

  const limit = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    fetch(`/api/leaderboard?limit=${limit}&range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.success && Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [range]);

  const podiumData = data.slice(0, 3);
  const remainingData = data.slice(3);

  // Reorder for Olympic Podium display: [2nd, 1st, 3rd]
  const secondPlace = podiumData[1];
  const firstPlace = podiumData[0];
  const thirdPlace = podiumData[2];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-6 sm:py-10 px-3 sm:px-6 relative">
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[radial-gradient(ellipse_at_top,var(--accent)_0%,transparent_70%)] opacity-[0.07] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6 sm:space-y-8">

          {/* HEADER SECTION */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[11px] font-mono font-medium text-[var(--muted)]">
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
              <span>HALL OF FAME</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--foreground)]">
              Top Spenders
            </h1>

            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
              Honoring our most active players and community members.
            </p>

            {/* TIME RANGE SELECTOR */}
            <div className="pt-2 flex justify-center">
              <div className="inline-flex p-1 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
                {[
                  { id: "monthly", label: "This Month" },
                  { id: "weekly", label: "This Week" }
                ].map((item) => {
                  const active = range === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setRange(item.id)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-[var(--accent)] text-white shadow-xs font-bold"
                          : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.03]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTENT SECTION */}
          {loading ? (
            <div className="space-y-6 max-w-3xl mx-auto pt-4">
              {/* Podium Skeleton */}
              <div className="grid grid-cols-3 gap-3 items-end h-56 sm:h-64">
                <div className="h-44 rounded-2xl bg-[var(--foreground)]/[0.03] animate-pulse border border-[var(--border)]" />
                <div className="h-56 rounded-2xl bg-[var(--foreground)]/[0.04] animate-pulse border border-[var(--border)]" />
                <div className="h-40 rounded-2xl bg-[var(--foreground)]/[0.03] animate-pulse border border-[var(--border)]" />
              </div>
              {/* Table Skeleton */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 bg-[var(--foreground)]/[0.03] rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ) : data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/40 max-w-lg mx-auto"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] mb-3">
                <Trophy size={22} />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mb-1">No Rankings Yet</h3>
              <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
                Be the first to claim your spot on the {range === "monthly" ? "monthly" : range === "weekly" ? "weekly" : "all-time"} leaderboard!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8 max-w-3xl mx-auto">

              {/* PODIUM SECTION (TOP 3) - OLYMPIC PEDESTAL */}
              {podiumData.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6 sm:pt-8 px-1">
                  {/* 2nd Place */}
                  <div className="w-full">
                    {secondPlace ? (
                      <PodiumPillar
                        item={secondPlace}
                        rank={2}
                        tier="silver"
                        badge="2nd"
                      />
                    ) : (
                      <div className="h-40 rounded-2xl border border-dashed border-[var(--border)] opacity-30" />
                    )}
                  </div>

                  {/* 1st Place (Center, Elevated) */}
                  <div className="w-full -translate-y-4 sm:-translate-y-6">
                    {firstPlace ? (
                      <PodiumPillar
                        item={firstPlace}
                        rank={1}
                        tier="gold"
                        badge="1st"
                        isChampion
                      />
                    ) : null}
                  </div>

                  {/* 3rd Place */}
                  <div className="w-full">
                    {thirdPlace ? (
                      <PodiumPillar
                        item={thirdPlace}
                        rank={3}
                        tier="bronze"
                        badge="3rd"
                      />
                    ) : (
                      <div className="h-36 rounded-2xl border border-dashed border-[var(--border)] opacity-30" />
                    )}
                  </div>
                </div>
              )}

              {/* LIST / TABLE SECTION (RANKS 4 TO 10) */}
              {remainingData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden"
                >
                  {/* Table Header */}
                  <div className="grid grid-cols-12 items-center px-4 py-2.5 bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--muted)]">
                    <div className="col-span-2 sm:col-span-1">Rank</div>
                    <div className="col-span-7 sm:col-span-8">Player</div>
                    <div className="hidden sm:block sm:col-span-1 text-right">Orders</div>
                    <div className="col-span-3 sm:col-span-2 text-right">Total Spent</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-[var(--border)]">
                    {remainingData.map((item, index) => {
                      const rank = index + 4;
                      return (
                        <div
                          key={index}
                          className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-[var(--foreground)]/[0.03] transition-colors group"
                        >
                          {/* Rank Number */}
                          <div className="col-span-2 sm:col-span-1">
                            <span className="font-mono font-bold text-xs text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                              #{rank < 10 ? `0${rank}` : rank}
                            </span>
                          </div>

                          {/* Player Identity */}
                          <div className="col-span-7 sm:col-span-8 flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.06] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
                              <PlayerAvatar
                                name={item.user?.name}
                                avatar={item.user?.avatar}
                                textClassName="text-[11px] font-bold"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-xs sm:text-sm text-[var(--foreground)] truncate block group-hover:text-[var(--accent)] transition-colors">
                                {item.user?.name || "Anonymous Player"}
                              </span>
                            </div>
                          </div>

                          {/* Orders Count (Desktop) */}
                          <div className="hidden sm:block sm:col-span-1 text-right font-mono text-xs text-[var(--muted)]">
                            {item.totalOrders || 1}
                          </div>

                          {/* Amount */}
                          <div className="col-span-3 sm:col-span-2 text-right">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[var(--foreground)]">
                              ₹{Number(item.totalSpent || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

/* =========================================================================
   PODIUM PILLAR COMPONENT (NO NESTED BOX-IN-A-BOX DESIGN)
   ========================================================================= */
function PodiumPillar({ item, rank, tier, badge, isChampion = false }) {
  const configs = {
    gold: {
      accentColor: "text-amber-500 dark:text-amber-400",
      bgGradient: "from-amber-500/[0.12] via-amber-500/[0.02] to-transparent",
      borderColor: "border-amber-500/40 hover:border-amber-500/70",
      badgeBg: "bg-amber-500 text-black",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    },
    silver: {
      accentColor: "text-slate-600 dark:text-slate-300",
      bgGradient: "from-slate-400/[0.08] via-slate-400/[0.02] to-transparent",
      borderColor: "border-slate-300 dark:border-slate-700 hover:border-slate-400",
      badgeBg: "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white",
      glow: "",
    },
    bronze: {
      accentColor: "text-amber-700 dark:text-amber-500",
      bgGradient: "from-amber-700/[0.08] via-amber-700/[0.02] to-transparent",
      borderColor: "border-amber-700/30 dark:border-amber-700/40 hover:border-amber-700/60",
      badgeBg: "bg-amber-700/80 text-white",
      glow: "",
    },
  };

  const cfg = configs[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-2xl border ${cfg.borderColor} bg-[var(--card)] p-3 sm:p-5 flex flex-col items-center text-center transition-all duration-300 ${cfg.glow} ${
        isChampion ? "ring-1 ring-amber-500/30" : ""
      }`}
    >
      {/* Background Subtle Gradient Wash */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${cfg.bgGradient} pointer-events-none`}
      />

      {/* Focus Viewfinder Corner Ticks */}
      <span className={`absolute top-2 left-2 w-2 h-2 border-t border-l ${cfg.borderColor} pointer-events-none opacity-60`} />
      <span className={`absolute top-2 right-2 w-2 h-2 border-t border-r ${cfg.borderColor} pointer-events-none opacity-60`} />
      <span className={`absolute bottom-2 left-2 w-2 h-2 border-b border-l ${cfg.borderColor} pointer-events-none opacity-60`} />
      <span className={`absolute bottom-2 right-2 w-2 h-2 border-b border-r ${cfg.borderColor} pointer-events-none opacity-60`} />

      {/* Avatar & Rank Crown */}
      <div className="relative mb-3 z-10">
        {/* Crown on Champion */}
        {isChampion && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
          >
            <Crown size={20} className="fill-amber-400 stroke-amber-500" />
          </motion.div>
        )}

        {/* Circular Avatar */}
        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-b ${
            isChampion
              ? "from-amber-400 to-amber-600 shadow-md"
              : tier === "silver"
              ? "from-slate-300 to-slate-500"
              : "from-amber-600 to-amber-800"
          }`}
        >
          <div className="w-full h-full rounded-full bg-[var(--card)] overflow-hidden flex items-center justify-center">
            <PlayerAvatar
              name={item.user?.name}
              avatar={item.user?.avatar}
              textClassName={isChampion ? "text-base sm:text-lg font-black" : "text-sm sm:text-base font-black"}
            />
          </div>
        </div>

        {/* Rank Badge Pill */}
        <div
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-mono shadow-xs ${cfg.badgeBg}`}
        >
          {badge}
        </div>
      </div>

      {/* Player Name */}
      <div className="relative z-10 w-full mb-1">
        <h3
          className={`font-black tracking-tight leading-tight truncate text-xs sm:text-sm text-[var(--foreground)]`}
          title={item.user?.name || "Player"}
        >
          {item.user?.name || "Anonymous Player"}
        </h3>
      </div>

      {/* Spend Amount (Clean Typography, No Heavy Black Inner Box) */}
      <div className="relative z-10">
        <span className={`text-sm sm:text-lg font-black tracking-tight font-mono ${cfg.accentColor}`}>
          ₹{Number(item.totalSpent || 0).toLocaleString("en-IN")}
        </span>
        <div className="text-[9.5px] font-mono text-[var(--muted)] font-medium">
          {item.totalOrders || 1} {item.totalOrders === 1 ? "order" : "orders"}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   PLAYER AVATAR WITH AUTOMATIC INITIAL FALLBACK
   ========================================================================= */
function PlayerAvatar({ name, avatar, textClassName = "text-sm sm:text-base font-black" }) {
  const [error, setError] = useState(false);

  const initial = (name || "Player").trim()[0]?.toUpperCase() || "P";

  if (!avatar || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center select-none bg-gradient-to-br from-[var(--foreground)]/[0.08] to-[var(--foreground)]/[0.02] text-[var(--foreground)] ${textClassName}`}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name || "Player"}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}
