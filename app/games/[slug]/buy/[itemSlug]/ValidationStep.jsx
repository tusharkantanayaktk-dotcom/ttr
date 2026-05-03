import HelpImagePopup from "../../../../../components/HelpImage/HelpImagePopup";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";
import { FiUser, FiHash, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function ValidationStep({
  playerId,
  setPlayerId,
  zoneId,
  setZoneId,
  onValidate,
  loading,
  error = "",
  showZoneId = true,
  label = "Player Check",
  placeholder = "Enter Player ID",
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">{label}</h2>
        <HelpImagePopup />
      </div>

      <div className="space-y-4">
        {/* PLAYER ID INPUT */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent)] transition-colors">
            <FiUser size={18} />
          </div>
          <input
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder={placeholder}
            className="p-3 pl-12 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 w-full focus:border-[var(--accent)] transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-white/40"
            disabled={loading}
          />
        </div>

        {/* ZONE ID INPUT (OPTIONAL) */}
        {showZoneId && (
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--accent)] transition-colors">
              <FiHash size={18} />
            </div>
            <input
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              placeholder="Enter zone ID"
              className="p-3 pl-12 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 w-full focus:border-[var(--accent)] transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-white/40"
              disabled={loading}
            />
          </div>
        )}

        {/* ERROR MESSAGE */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 overflow-hidden"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider leading-relaxed">
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onValidate}
        disabled={loading}
        className={`py-3 rounded-lg w-full font-semibold transition flex items-center justify-center gap-2
          ${
            loading
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-[var(--accent)] text-black hover:opacity-90 shadow-lg shadow-[var(--accent)]/10"
          }`}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FiSearch size={18} />
          </motion.div>
        ) : (
          <FiSearch size={18} />
        )}
        <span>{loading ? "Validating…" : "Continue"}</span>
      </button>

      <RecentVerifiedPlayers
        limit={10}
        onSelect={(player) => {
          setPlayerId(player.playerId);
          if (showZoneId) setZoneId(player.zoneId);
        }}
      />
    </div>
  );
}
