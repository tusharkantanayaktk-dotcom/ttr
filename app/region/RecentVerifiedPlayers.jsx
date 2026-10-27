"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiUser, FiGlobe, FiChevronRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { getVerifiedPlayers } from "@/utils/storage/verifiedPlayerStorage";

export default function RecentVerifiedPlayers({
  onSelect,
  limit = 10,
}) {
  const [players, setPlayers] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setPlayers(getVerifiedPlayers(limit));
  }, [limit]);

  if (!players.length) return null;

  return (
    <div className="space-y-2 pt-1">
      {/* Header with Show / Hide Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {/* History / Clock SVG */}
          <svg className="w-3 h-3 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">
            Recent Players ({players.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[9px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 uppercase tracking-tight py-0.5 px-1.5 rounded-md hover:bg-[var(--accent)]/10 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? "Hide" : "Show"}</span>
          {isExpanded ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-1.5 overflow-hidden pt-0.5"
          >
            {players.map((p, index) => (
              <motion.button
                key={`${p.playerId}-${p.zoneId}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelect(p)}
                className="group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--foreground)]/[0.03] hover:bg-[var(--accent)]/15 border border-[var(--border)]/60 hover:border-[var(--accent)]/50 transition-all text-left cursor-pointer active:scale-95"
              >
                <div className="w-5 h-5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                  {/* Gamer Headset / Avatar SVG */}
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14a8 8 0 0 1 16 0v2a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2a6 6 0 0 0-12 0h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-2z" />
                    <path d="M12 18v3m-3 0h6" />
                  </svg>
                </div>
                <div className="min-w-0 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[11px] text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-tight truncate max-w-[120px]">
                      {p.username}
                    </span>
                    {p.region && (
                      <span className="text-[8px] font-bold text-[var(--muted)] uppercase">
                        {p.region}
                      </span>
                    )}
                  </div>
                  <span className="text-[9.5px] text-[var(--muted)] font-mono block leading-none">
                    {p.playerId}{p.zoneId && p.zoneId !== "NA" ? ` / ${p.zoneId}` : ""}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
