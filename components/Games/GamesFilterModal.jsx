"use client";

import { motion } from "framer-motion";
import { FiX, FiCheck, FiArrowDown, FiArrowUp, FiMinusCircle } from "react-icons/fi";

export default function GamesFilterModal({
  open,
  onClose,
  sort,
  setSort,
  hideOOS,
  setHideOOS,
}) {
  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative bg-[var(--card)] w-full max-w-[340px] overflow-hidden rounded-2xl border border-[var(--border)] p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h3 className="text-base font-extrabold uppercase tracking-tight text-[var(--foreground)]">
              Filter <span className="text-[var(--accent)]">&</span> Sort
            </h3>
            <span className="text-[9px] font-semibold text-[var(--muted)] uppercase tracking-wider">Configure view preferences</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--foreground)] transition-all active:scale-95"
            aria-label="Close Filter"
          >
            <FiX size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-4">
          {/* SORT SECTION */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1 h-2.5 bg-[var(--accent)] rounded-full" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Order Preference</p>
            </div>

            <div className="flex gap-2">
              {[
                { id: "az", icon: FiArrowDown, label: "A - Z" },
                { id: "za", icon: FiArrowUp, label: "Z - A" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSort(item.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all duration-200 ${sort === item.id
                    ? "bg-[var(--accent)] border-[var(--accent)] text-black font-extrabold"
                    : "bg-[var(--foreground)]/[0.03] border-[var(--border)] text-[var(--foreground)]/70 hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                    }`}
                >
                  <item.icon size={14} />
                  <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* OPTIONS SECTION */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1 h-2.5 bg-[var(--accent)] rounded-full" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Display Rules</p>
            </div>

            <button
              onClick={() => setHideOOS(!hideOOS)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className={`
                  w-4 h-4 rounded-md flex items-center justify-center transition-all
                  ${hideOOS ? "bg-[var(--accent)] text-black" : "bg-[var(--foreground)]/10 text-transparent"}
                `}>
                  <FiCheck size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-tight text-[var(--foreground)]/80 group-hover:text-[var(--foreground)] transition-colors">
                  Hide Out-of-Stock
                </span>
              </div>
              <FiMinusCircle className={`transition-colors text-sm ${hideOOS ? "text-[var(--accent)]" : "text-[var(--foreground)]/20"}`} />
            </button>
          </div>
        </div>

        {/* APPLY ACTION */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-extrabold uppercase tracking-wider text-xs hover:bg-[var(--accent)] hover:text-black transition-all active:scale-[0.98] cursor-pointer"
        >
          Apply Filters
        </button>
      </motion.div>
    </motion.div>
  );
}
