"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGlobe,
  FiUser,
  FiHash,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu,
  FiZap
} from "react-icons/fi";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";
import RecentVerifiedPlayers from "./RecentVerifiedPlayers";

export default function RegionPage() {
  const [id, setId] = useState("");
  const [zone, setZone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!id || !zone) return;
    setLoading(true);

    try {
      const res = await fetch("/api/check-region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, zone }),
      });

      const data = await res.json();
      setResult(data);

      if (data?.success === 200) {
        saveVerifiedPlayer({
          playerId: id,
          zoneId: zone,
          username: data.data.username,
          region: data.data.region,
          savedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Check failed:", error);
      setResult({ success: 500, message: "System failure" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 sm:pt-12 pb-10 bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">

      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl relative z-10">

        {/* HEADER SECTION */}
        <div className="text-left mb-3.5 sm:mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight mb-1 flex items-center justify-start gap-2"
          >
            Region Check
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--muted)] text-xs opacity-70"
          >
            Check your game account region and player name
          </motion.p>
        </div>

        {/* MAIN HUD INTERFACE (CARD-LESS, COMPACT) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative py-2 overflow-hidden"
        >
          {/* Ambient Globe Vector SVG Watermark */}
          <svg
            className="absolute -bottom-6 -right-6 w-36 h-36 opacity-[0.035] dark:opacity-[0.06] text-[var(--accent)] pointer-events-none select-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/80">Player Info</span>
            </div>

            {/* Side-by-side inputs on all screens */}
            <div className="grid grid-cols-12 gap-2 sm:gap-3">
              <div className="col-span-7 sm:col-span-8">
                <HUDInput
                  icon={FiUser}
                  label="Player ID"
                  placeholder="00000000"
                  value={id}
                  onChange={setId}
                />
              </div>
              <div className="col-span-5 sm:col-span-4">
                <HUDInput
                  icon={FiHash}
                  label="Zone ID"
                  placeholder="1234"
                  value={zone}
                  onChange={setZone}
                />
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={loading || !id || !zone}
              className="group relative w-full h-10 sm:h-11 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-black uppercase tracking-wider text-xs transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden shadow-md shadow-[var(--accent)]/20 active:scale-[0.99] cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <FiSearch size={14} />
                  <span>Check Region</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* SCAN RESULT */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6"
            >
              {result?.success === 200 ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                    <FiCheckCircle size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <FiZap size={10} /> Verified
                    </div>

                    <h3 className="text-xl font-black italic tracking-tighter text-[var(--foreground)]">
                      {result.data?.username}
                    </h3>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/5 rounded-full">
                        <FiGlobe size={12} className="text-[var(--muted)]" />
                        <span className="text-xs font-bold text-[var(--foreground)] uppercase">{result.data?.region}</span>

                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                    <FiAlertCircle size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Error</div>
                    <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)] uppercase italic leading-none">Not Found</h3>
                    <p className="text-[10px] text-[var(--muted)] mt-1">Player not found. Please double-check your Player ID and Zone ID.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* RECENT RECORDS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <RecentVerifiedPlayers
            limit={5}
            onSelect={(player) => {
              setId(player.playerId);
              setZone(player.zoneId);
              setResult(null);
            }}
          />
        </motion.div>

        </div>
      </div>

      {/* FIXED OVERLAY SCANLINE */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] z-50 bg-[length:100%_4px] pointer-events-none opacity-10" />
    </div>
  );
}

function HUDInput({ icon: Icon, label, placeholder, value, onChange }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center gap-1.5 px-0.5">
        <Icon className="text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" size={13} />
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{label}</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)]/40 bg-[var(--card)]/40 focus-within:border-[var(--accent)]/50 focus-within:bg-[var(--card)]/60 transition-all duration-300">
        <input
          className="w-full h-10 sm:h-11 px-3.5 bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted)]/30 outline-none font-bold text-sm tracking-tight"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
      </div>
    </div>
  );
}
