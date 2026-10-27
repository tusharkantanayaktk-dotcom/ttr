"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Coins,
  Trash2,
  Gamepad2,
  Save,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  ChevronDown,
  X,
  CheckCircle2
} from "lucide-react";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

export default function PricingTab({
  pricingType,
  setPricingType,
  slabs = [],
  setSlabs,
  overrides = [],
  setOverrides,
  savingPricing,
  onSave,
}) {
  const [pricingMode, setPricingMode] = useState("percent");
  const [games, setGames] = useState([]);
  const [itemsByGame, setItemsByGame] = useState({});
  const [fixedGameFilter, setFixedGameFilter] = useState("");
  const [fixedItemFilter, setFixedItemFilter] = useState("");
  const [loadingFixedPrices, setLoadingFixedPrices] = useState(false);
  const [gameSearch, setGameSearch] = useState("");
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const gameDropdownRef = useRef(null);

  // useRef so we never get stale closures or re-render loops
  const hydratedGamesRef = useRef(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        if (json.success) setGames(json.data.games || []);
      } catch (e) {
        console.error("Game fetch failed", e);
      }
    })();
  }, []);

  // Click outside to close game dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (gameDropdownRef.current && !gameDropdownRef.current.contains(event.target)) {
        setIsGameDropdownOpen(false);
      }
    }
    if (isGameDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isGameDropdownOpen]);

  const fetchItemsForGame = async (gameSlug) => {
    if (!gameSlug) return [];
    if (itemsByGame[gameSlug]) return itemsByGame[gameSlug];

    try {
      const res = await fetch(`${API_BASE}/games/${gameSlug}/items`);
      const json = await res.json();
      if (json.success) {
        const items = json.data.items || [];
        setItemsByGame((p) => ({ ...p, [gameSlug]: items }));
        return items;
      }
    } catch (e) {
      console.error("Item fetch failed", e);
    }
    return [];
  };

  // Reset hydrated-games tracking whenever role (pricingType) changes so fresh data loads
  useEffect(() => {
    hydratedGamesRef.current = new Set();
    setFixedGameFilter("");
  }, [pricingType]);

  const hydrateFixedPricing = async (gameSlug) => {
    if (!gameSlug) return;
    if (hydratedGamesRef.current.has(gameSlug)) return;
    hydratedGamesRef.current.add(gameSlug);
    setLoadingFixedPrices(true);
    try {
      const items = await fetchItemsForGame(gameSlug);
      if (!items.length) return;
      setOverrides((prev) => {
        const others = prev.filter((o) => o.gameSlug !== gameSlug);
        const hydrated = items.map((item) => {
          const existing = prev.find(
            (o) => o.gameSlug === gameSlug && o.itemSlug === item.itemSlug
          );
          return {
            gameSlug,
            itemSlug: item.itemSlug,
            itemName: item.itemName,
            itemImageId: item.itemImageId,
            fixedPrice: existing?.fixedPrice ?? Number(item.sellingPrice) ?? 0,
            useOverride: existing?.useOverride ?? false,
            inStock: existing?.inStock ?? true,
          };
        });
        return [...others, ...hydrated];
      });
      setFixedItemFilter("");
    } catch (e) {
      hydratedGamesRef.current.delete(gameSlug);
      console.error("Hydration failed", e);
    } finally {
      setLoadingFixedPrices(false);
    }
  };

  useEffect(() => {
    if (pricingMode !== "fixed") return;
    if (!fixedGameFilter) return;
    hydrateFixedPricing(fixedGameFilter);
  }, [pricingMode, fixedGameFilter]);

  const visibleOverrides = useMemo(() => {
    const q = fixedItemFilter.toLowerCase();
    return overrides
      .filter((o) => {
        if (fixedGameFilter && o.gameSlug !== fixedGameFilter) return false;
        if (
          q &&
          !String(o.itemName || "").toLowerCase().includes(q) &&
          !String(o.itemSlug || "").toLowerCase().includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => (a.itemName || a.itemSlug).localeCompare(b.itemName || b.itemSlug));
  }, [overrides, fixedGameFilter, fixedItemFilter]);

  const filteredGames = useMemo(() => {
    return games.filter(
      (g) =>
        g.gameName.toLowerCase().includes(gameSearch.toLowerCase()) ||
        g.gameSlug.toLowerCase().includes(gameSearch.toLowerCase())
    );
  }, [games, gameSearch]);

  const selectedGame = useMemo(() => {
    return games.find((g) => g.gameSlug === fixedGameFilter) || null;
  }, [games, fixedGameFilter]);

  const selectedGameAllInStock = useMemo(() => {
    if (!fixedGameFilter) return false;
    const gameOverrides = overrides.filter((o) => o.gameSlug === fixedGameFilter);
    return gameOverrides.length === 0 || gameOverrides.every((o) => o.inStock);
  }, [overrides, fixedGameFilter]);

  const toggleGameStock = (gameSlug, status) => {
    setOverrides((prev) =>
      prev.map((o) => {
        if (o.gameSlug === gameSlug) return { ...o, inStock: status };
        return o;
      })
    );
  };

  const updateOverrideField = (gameSlug, itemSlug, field, value) => {
    setOverrides((prev) =>
      prev.map((o) =>
        o.gameSlug === gameSlug && o.itemSlug === itemSlug ? { ...o, [field]: value } : o
      )
    );
  };

  const updateOverridePrice = (i, value) => {
    setOverrides((prev) =>
      prev.map((o, index) =>
        index === i ? { ...o, fixedPrice: Math.max(0, Number(value) || 0) } : o
      )
    );
  };

  const updateSlab = (i, key, value) => {
    setSlabs((prev) =>
      prev.map((s, index) =>
        index === i ? { ...s, [key]: Math.max(0, Number(value) || 0) } : s
      )
    );
  };

  const addSlab = () => setSlabs([...slabs, { min: 0, max: 0, percent: 0 }]);
  const deleteSlab = (i) => setSlabs(slabs.filter((_, idx) => idx !== i));
  const canSave =
    !savingPricing &&
    ((pricingMode === "percent" && slabs.length > 0) ||
      (pricingMode === "fixed" && overrides.length > 0));

  return (
    <div className={`space-y-3.5 sm:space-y-4 pb-16 ${pricingMode === "percent" ? "max-w-2xl sm:max-w-3xl" : "max-w-full"}`}>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] truncate flex items-center gap-2">
            <Coins size={18} className="text-[var(--accent)] shrink-0" />
            Pricing Rules
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
            Configure tiered percentage markup slabs or custom fixed product prices
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className={`h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all outline-none shrink-0 cursor-pointer ${
            canSave
              ? "bg-[var(--accent)] text-black shadow-sm hover:brightness-105 active:scale-95"
              : "bg-[var(--foreground)]/[0.05] text-[var(--muted)]/40 cursor-not-allowed border border-[var(--border)]"
          }`}
        >
          {savingPricing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          <span>{savingPricing ? "Saving..." : "Save Pricing"}</span>
        </button>
      </div>

      {/* ================= CONTROLS ROW ================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/60">
        {/* MODE SWITCHER */}
        <div className="flex p-0.5 rounded-lg bg-[var(--foreground)]/[0.04] border border-[var(--border)]/60">
          {[
            { id: "percent", label: "Markup Slabs", icon: <Percent size={12} /> },
            { id: "fixed", label: "Fixed Prices", icon: <Coins size={12} /> },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPricingMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                pricingMode === m.id
                  ? "bg-[var(--accent)] text-black shadow-sm font-extrabold"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ROLE SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[var(--muted)] hidden sm:inline">Target Role:</span>
          <div className="flex p-0.5 rounded-lg bg-[var(--foreground)]/[0.04] border border-[var(--border)]/60">
            {[
              { id: "user", label: "User" },
              { id: "admin", label: "Admin" },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setPricingType(role.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                  pricingType === role.id
                    ? "bg-[var(--foreground)]/[0.12] text-[var(--foreground)] font-extrabold border border-[var(--border)]/80 shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= CONTENT BODY ================= */}
      <AnimatePresence mode="wait">
        {pricingMode === "percent" ? (
          <motion.div
            key="markup"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-2.5"
          >
            {/* Section Header with Add Button */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Percent size={13} className="text-[var(--accent)]" />
                  Markup Ranges ({slabs.length})
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase">
                  {pricingType}
                </span>
              </div>

              <button
                type="button"
                onClick={addSlab}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-black text-xs font-extrabold hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Range</span>
              </button>
            </div>

            {/* Slabs Table Card */}
            <div className="p-2.5 sm:p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 space-y-2">
              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <div className="col-span-4">Min Amount</div>
                <div className="col-span-4">Max Amount</div>
                <div className="col-span-3">Markup</div>
                <div className="col-span-1 text-center"></div>
              </div>

              {/* Rows */}
              <div className="space-y-1.5">
                {slabs.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-12 gap-1.5 sm:gap-2.5 items-center p-2 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.015] hover:bg-[var(--foreground)]/[0.035] transition-colors"
                  >
                    {/* Min */}
                    <div className="col-span-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] font-mono pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={s.min}
                          onChange={(e) => updateSlab(i, "min", e.target.value)}
                          className="w-full h-8 pl-6 pr-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-bold text-xs outline-none focus:border-[var(--accent)]/50 transition-all font-mono"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Max */}
                    <div className="col-span-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] font-mono pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={s.max}
                          onChange={(e) => updateSlab(i, "max", e.target.value)}
                          className="w-full h-8 pl-6 pr-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-bold text-xs outline-none focus:border-[var(--accent)]/50 transition-all font-mono"
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    {/* Markup % */}
                    <div className="col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          value={s.percent}
                          onChange={(e) => updateSlab(i, "percent", e.target.value)}
                          className="w-full h-8 pl-2.5 pr-6 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] font-black text-xs outline-none focus:border-[var(--accent)] transition-all font-mono"
                          placeholder="5"
                        />
                        <Percent
                          size={11}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--accent)] pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => deleteSlab(i)}
                        className="p-1 rounded-lg text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove Range"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!slabs.length && (
                <div className="py-10 text-center border border-dashed border-[var(--border)] rounded-xl">
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    No markup ranges defined. Click &quot;Add Range&quot; to configure.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="fixed"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {/* GAME SELECTION DROPDOWN & CONTROLS BAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Game Dropdown Container */}
              <div className="relative flex-1" ref={gameDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsGameDropdownOpen(!isGameDropdownOpen)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 hover:bg-[var(--card)] flex items-center justify-between gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Gamepad2 size={16} className="text-[var(--accent)] shrink-0" />
                    <div className="text-left min-w-0">
                      {selectedGame ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-[var(--foreground)] truncate">
                            {selectedGame.gameName}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--muted)]/60 truncate hidden sm:inline">
                            ({selectedGame.gameSlug})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-[var(--muted)]">
                          Select a game to configure fixed pricing...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--foreground)]/[0.04] text-[var(--muted)]">
                      {filteredGames.length} Games
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[var(--muted)] transition-transform duration-200 ${
                        isGameDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu Popover */}
                <AnimatePresence>
                  {isGameDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-1.5 z-50 p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl space-y-2 max-h-[380px] flex flex-col"
                    >
                      {/* Search in Dropdown */}
                      <div className="relative shrink-0">
                        <Search
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder="Search games..."
                          value={gameSearch}
                          onChange={(e) => setGameSearch(e.target.value)}
                          autoFocus
                          className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs font-semibold outline-none focus:border-[var(--accent)]/50 transition-all placeholder:text-[var(--muted)]/50"
                        />
                        {gameSearch && (
                          <button
                            type="button"
                            onClick={() => setGameSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Games List in Dropdown */}
                      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                        {filteredGames.map((g) => {
                          const isSelected = fixedGameFilter === g.gameSlug;
                          const gameOverrides = overrides.filter((o) => o.gameSlug === g.gameSlug);
                          const allInStock =
                            gameOverrides.length === 0 || gameOverrides.every((o) => o.inStock);

                          return (
                            <div
                              key={g.gameSlug}
                              onClick={() => {
                                setFixedGameFilter(g.gameSlug);
                                setIsGameDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                                isSelected
                                  ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--foreground)]"
                                  : "bg-transparent border-transparent hover:bg-[var(--foreground)]/[0.03] text-[var(--foreground)]/80"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-bold uppercase truncate leading-tight">
                                  {g.gameName}
                                </p>
                                <p className="text-[10px] font-mono text-[var(--muted)]/60 truncate mt-0.5">
                                  {g.gameSlug}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Game Stock Switch */}
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={allInStock}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGameStock(g.gameSlug, !allInStock);
                                  }}
                                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 outline-none ${
                                    allInStock ? "bg-emerald-500" : "bg-[var(--foreground)]/15"
                                  }`}
                                  title={allInStock ? "All items in stock" : "All items out of stock"}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 my-auto ${
                                      allInStock ? "translate-x-3.5" : "translate-x-0.5"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {filteredGames.length === 0 && (
                          <div className="py-6 text-center text-xs text-[var(--muted)]">
                            No games match your search
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Items Filter (when game selected) */}
              {fixedGameFilter && (
                <div className="relative sm:w-64 shrink-0">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search items by name/slug..."
                    value={fixedItemFilter}
                    onChange={(e) => setFixedItemFilter(e.target.value)}
                    className="w-full h-10 pl-8 pr-7 rounded-xl bg-[var(--card)]/80 border border-[var(--border)] text-xs font-semibold focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/50"
                  />
                  {fixedItemFilter && (
                    <button
                      type="button"
                      onClick={() => setFixedItemFilter("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active Game Info & Master Stock Bar */}
            {selectedGame && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--foreground)]/[0.025] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-extrabold text-[var(--foreground)] truncate">
                    {selectedGame.gameName}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted)] truncate">
                    ({visibleOverrides.length} items configured)
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-[var(--muted)]">Master Stock:</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selectedGameAllInStock}
                    onClick={() => toggleGameStock(selectedGame.gameSlug, !selectedGameAllInStock)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 outline-none ${
                      selectedGameAllInStock ? "bg-emerald-500" : "bg-[var(--foreground)]/15"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 my-auto ${
                        selectedGameAllInStock ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Items Grid */}
            {!fixedGameFilter ? (
              <div className="py-14 flex flex-col items-center justify-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--card)]/30 p-6 text-center">
                <Gamepad2 size={32} className="mb-2 text-[var(--muted)]/40" />
                <p className="text-xs font-bold text-[var(--muted)]">Please select a game from the dropdown</p>
                <p className="text-[11px] text-[var(--muted)]/60 mt-0.5">
                  Choose a game to inspect its product catalog, toggle item stock, and set fixed prices
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                <AnimatePresence mode="popLayout">
                  {loadingFixedPrices ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-[var(--accent)] mb-2" />
                      <p className="text-xs font-semibold text-[var(--muted)]">Loading prices...</p>
                    </div>
                  ) : (
                    visibleOverrides.map((o) => (
                      <div
                        key={o.itemSlug}
                        className="p-2 sm:p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] transition-all space-y-1.5 sm:space-y-2 flex flex-col justify-between"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] sm:text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                              {o.itemName || o.itemSlug}
                            </p>
                            <p className="text-[9px] sm:text-[10px] font-mono text-[var(--muted)]/60 truncate mt-0.5">
                              {o.itemSlug}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            {/* Stock Toggle */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={o.inStock}
                              onClick={() =>
                                updateOverrideField(o.gameSlug, o.itemSlug, "inStock", !o.inStock)
                              }
                              className={`relative inline-flex h-3.5 w-6 sm:h-4 sm:w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 outline-none ${
                                o.inStock ? "bg-emerald-500" : "bg-[var(--foreground)]/15"
                              }`}
                              title={o.inStock ? "In Stock" : "Out of Stock"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 transform rounded-full bg-white shadow-xs transition duration-200 my-auto ${
                                  o.inStock ? "translate-x-3 sm:translate-x-3.5" : "translate-x-0.5"
                                }`}
                              />
                            </button>

                            {/* Override Toggle */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={o.useOverride}
                              onClick={() =>
                                updateOverrideField(
                                  o.gameSlug,
                                  o.itemSlug,
                                  "useOverride",
                                  !o.useOverride
                                )
                              }
                              className={`relative inline-flex h-3.5 w-6 sm:h-4 sm:w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 outline-none ${
                                o.useOverride ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/15"
                              }`}
                              title={o.useOverride ? "Override Enabled" : "Override Disabled"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 transform rounded-full bg-white shadow-xs transition duration-200 my-auto ${
                                  o.useOverride ? "translate-x-3 sm:translate-x-3.5" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Price Input Row */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[var(--border)]/40">
                          <span className="text-[9px] sm:text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider truncate">
                            Fixed Price
                          </span>
                          <div className="relative w-18 sm:w-24 shrink-0">
                            <span className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] font-mono pointer-events-none">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={o.fixedPrice}
                              onChange={(e) => {
                                if (!o.useOverride)
                                  updateOverrideField(o.gameSlug, o.itemSlug, "useOverride", true);
                                const idx = overrides.findIndex(
                                  (x) => x.gameSlug === o.gameSlug && x.itemSlug === o.itemSlug
                                );
                                updateOverridePrice(idx, e.target.value);
                              }}
                              className="w-full h-6.5 sm:h-7.5 pl-4 sm:pl-5 pr-1.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-bold text-xs tabular-nums outline-none focus:border-[var(--accent)]/50 transition-all text-right font-mono"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </AnimatePresence>
                {visibleOverrides.length === 0 && !loadingFixedPrices && (
                  <div className="col-span-full py-10 text-center text-xs text-[var(--muted)]">
                    No items found matching filter
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
