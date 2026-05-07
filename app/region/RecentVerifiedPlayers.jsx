"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiClock, FiUser, FiGlobe, FiChevronRight } from "react-icons/fi";
import { getVerifiedPlayers } from "@/utils/storage/verifiedPlayerStorage";

export default function RecentVerifiedPlayers({
  onSelect,
  limit = 10,
}) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    setPlayers(getVerifiedPlayers(limit));
  }, [limit]);

  if (!players.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1 px-1">
        <FiUser className="text-[var(--muted)]" size={12} />
        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">Recent Players</span>
      </div>

      <div className="space-y-2">
        {players.map((p, index) => (
          <motion.button
            key={`${p.playerId}-${p.zoneId}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(p)}
            className="group w-full flex items-center justify-between p-3 rounded-xl bg-[var(--card)]/20 border border-[var(--border)]/20 hover:border-[var(--accent)]/50 hover:bg-[var(--card)]/40 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                <FiUser size={14} />
              </div>
              <div className="text-left">
                <p className="font-black text-xs tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors uppercase italic leading-none mb-0.5">
                  {p.username}
                </p>

                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--foreground)]/50 uppercase tracking-tighter">
                  <span>{p.playerId}</span>
                  {p.zoneId && p.zoneId !== "NA" && (
                    <>
                      <span className="opacity-20">/</span>
                      <span>{p.zoneId}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--foreground)]/[0.05] border border-[var(--border)]/10">
                <FiGlobe size={10} className="text-[var(--accent)]" />
                <span className="text-[9px] font-black text-[var(--foreground)]/70 uppercase tracking-tighter">{p.region}</span>
              </div>

              <FiChevronRight className="text-[var(--foreground)]/20 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" size={14} />
            </div>

            {/* HOVER GLOW */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)]/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
