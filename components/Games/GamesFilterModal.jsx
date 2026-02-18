"use client";

import { FiX } from "react-icons/fi";

export default function GamesFilterModal({
  open,
  onClose,
  sort,
  setSort,
  hideOOS,
  setHideOOS,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Filter & Sort
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/10"
          >
            <FiX />
          </button>
        </div>

        {/* SORT */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Sort By</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSort("az")}
              className={`flex-1 py-2 rounded-xl border transition ${
                sort === "az"
                  ? "border-[var(--accent)]"
                  : "border-white/10"
              }`}
            >
              A – Z
            </button>
            <button
              onClick={() => setSort("za")}
              className={`flex-1 py-2 rounded-xl border transition ${
                sort === "za"
                  ? "border-[var(--accent)]"
                  : "border-white/10"
              }`}
            >
              Z – A
            </button>
          </div>
        </div>

        {/* HIDE OOS */}
        <label className="flex items-center gap-2 text-sm mb-6">
          <input
            type="checkbox"
            checked={hideOOS}
            onChange={(e) => setHideOOS(e.target.checked)}
          />
          Hide Out-of-Stock
        </label>

        {/* APPLY */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-semibold"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
