"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrendingUp,
  FiUser,
  FiShoppingBag,
  FiAward,
  FiActivity,
  FiZap,
  FiShield
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import AuthGuard from "@/components/AuthGuard";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("current"); // current (this month) | previous (prev month)

  const limit = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    fetch(`/api/leaderboard?limit=${limit}&range=${range === 'current' ? 'monthly' : 'prev_monthly'}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.success ? res.data : []);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/50", icon: FaTrophy };
    if (rank === 2) return { color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/50", icon: FiAward };
    if (rank === 3) return { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/50", icon: FiAward };
    return { color: "text-[var(--muted)]", bg: "bg-[var(--card)]/50", border: "border-[var(--border)]", icon: FiUser };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const podiumData = data.slice(0, 3);
  const remainingData = data.slice(3);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-4 px-4 relative overflow-hidden">
        {/* BACKGROUND DECORATION */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.05] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">

          {/* HEADER SECTION */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 mb-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-black italic tracking-tighter mb-1"
            >
              TOP <span className="text-[var(--accent)]">PLAYERS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--muted)] text-xs font-medium uppercase tracking-widest max-w-md mx-auto"
            >
              Top players for this month.
            </motion.p>
          </div>

          {/* RANGE TOGGLE */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-[var(--card)]/50 border border-[var(--border)] rounded-xl backdrop-blur-md">
              {[{ id: "current", label: "This Month" }, { id: "previous", label: "Prev Month" }].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 relative overflow-hidden ${range === r.id
                    ? "text-white"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  <span className="relative z-10 uppercase tracking-tighter">{r.label}</span>
                  {range === r.id && (
                    <motion.div
                      layoutId="activeRange"
                      className="absolute inset-0 bg-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--card)]/50 animate-pulse rounded-xl border border-[var(--border)]" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 border border-dashed border-[var(--border)] rounded-3xl bg-[var(--card)]/20 backdrop-blur-sm"
            >
              <div className="inline-flex p-4 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mb-6">
                <FiZap size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2 uppercase tracking-tight">No Rankings Yet</h2>
              <p className="text-[var(--muted)] text-xs max-w-xs mx-auto mb-8">
                Be the first one to show up on the leaderboard!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">

              {/* PODIUM SECTION */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-3xl mx-auto px-1 sm:px-4">
                {/* 2nd Place */}
                <div className="">
                  {podiumData[1] && <PodiumCard user={podiumData[1]} rank={2} style={getRankStyle(2)} />}
                </div>

                {/* 1st Place */}
                <div className="transform -translate-y-2 sm:-translate-y-8">
                  {podiumData[0] && <PodiumCard user={podiumData[0]} rank={1} style={getRankStyle(1)} isMain={true} />}
                </div>

                {/* 3rd Place */}
                <div className="">
                  {podiumData[2] && <PodiumCard user={podiumData[2]} rank={3} style={getRankStyle(3)} />}
                </div>
              </div>

              {/* LIST SECTION */}
              {remainingData.length > 0 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="max-w-2xl mx-auto space-y-3 px-4"
                >
                  <div className="flex items-center justify-between px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                    <span>Player</span>
                    <div className="flex justify-end">
                      <span className="w-24 text-right">Total</span>
                    </div>
                  </div>

                  {remainingData.map((item, index) => {
                    const rank = index + 4;
                    const style = getRankStyle(rank);
                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        className="group flex items-center justify-between py-2 px-4 rounded-lg hover:bg-[var(--foreground)]/[0.03] transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-[var(--muted)] italic w-6">#{rank}</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">{item.user?.name || "Player"}</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="w-24 text-right">
                            <span className="text-sm font-bold text-[var(--accent)] tracking-tighter">₹{item.totalSpent}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* SCANLINE EFFECT */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-50 bg-[length:100%_4px] pointer-events-none opacity-10" />
      </div>
    </AuthGuard>
  );
}

function PodiumCard({ user, rank, style, isMain = false }) {
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: isMain ? -6 : -3 }}
      transition={{ duration: 0.5 }}
      className={`relative group p-1.5 sm:p-2.5 rounded-xl flex flex-col items-center text-center ${isMain ? 'sm:scale-105' : ''}`}
    >

      {/* RANK BADGE */}
      <div className={`relative z-10 mb-1.5 sm:mb-2 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border ${style.border} bg-[var(--card)]/20`}>
        <Icon size={isMain ? 24 : 16} className={`sm:hidden ${style.color}`} />
        <Icon className={`hidden sm:block ${style.color}`} size={isMain ? 32 : 24} />
        <div className={`absolute -bottom-1 -right-1 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-black italic text-[6px] sm:text-[8px] border ${style.border} bg-black text-white`}>
          #{rank}
        </div>
      </div>

      {/* USER INFO */}
      <div className="relative z-10 space-y-0.5 sm:space-y-1">
        <h3 className={`font-black tracking-tight leading-tight truncate w-full ${isMain ? 'text-xs sm:text-xl' : 'text-[10px] sm:text-base'}`}>
          {user.user?.name || "Anonymous"}
        </h3>
        <p className="text-[7px] sm:text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">
          Rank
        </p>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center mt-2 pt-2 border-t border-white/5">
        <span className="text-[6px] sm:text-[8px] font-black text-[var(--muted)] uppercase">Total</span>
        <span className={`text-xs sm:text-sm font-black tracking-tighter ${style.color}`}>₹{user.totalSpent}</span>
      </div>

    </motion.div>
  );
}

