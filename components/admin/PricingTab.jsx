"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Coins,
  Settings2,
  Trash2,
  RefreshCcw,
  Gamepad2,
  Save,
  ChevronDown,
  Info,
  Shield,
  IndianRupee,
  Loader2,
  Package
} from "lucide-react";
import { FiSearch } from "react-icons/fi";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

export default function PricingTab({
  pricingType,
  setPricingType,
  slabs,
  setSlabs,
  overrides,
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
  // useRef so we never get stale closures or re-render loops
  const hydratedGamesRef = useRef(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        if (json.success) setGames(json.data.games);
      } catch (e) {
        console.error("Game fetch failed", e);
      }
    })();
  }, []);

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
    // Skip if already hydrated — preserves any in-progress price edits
    if (hydratedGamesRef.current.has(gameSlug)) return;
    // Mark immediately to prevent double-fetch
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
      // On error, allow retry by removing from hydrated set
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
    return overrides.filter((o) => {
      if (fixedGameFilter && o.gameSlug !== fixedGameFilter) return false;
      if (q && !String(o.itemName || "").toLowerCase().includes(q) && !String(o.itemSlug || "").toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => (a.itemName || a.itemSlug).localeCompare(b.itemName || b.itemSlug));
  }, [overrides, fixedGameFilter, fixedItemFilter]);

  const filteredGames = useMemo(() => {
    return games.filter(g =>
      g.gameName.toLowerCase().includes(gameSearch.toLowerCase()) ||
      g.gameSlug.toLowerCase().includes(gameSearch.toLowerCase())
    );
  }, [games, gameSearch]);

  const toggleGameStock = (gameSlug, status) => {
    setOverrides(prev => prev.map(o => {
      if (o.gameSlug === gameSlug) return { ...o, inStock: status };
      return o;
    }));
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
      prev.map((o, index) => index === i ? { ...o, fixedPrice: Math.max(0, Number(value) || 0) } : o)
    );
  };

  const updateSlab = (i, key, value) => {
    setSlabs((prev) => 
      prev.map((s, index) => index === i ? { ...s, [key]: Math.max(0, Number(value) || 0) } : s)
    );
  };

  const addSlab = () => setSlabs([...slabs, { min: 0, max: 0, percent: 0 }]);
  const deleteSlab = (i) => setSlabs(slabs.filter((_, idx) => idx !== i));
  const canSave = !savingPricing && ((pricingMode === "percent" && slabs.length) || (pricingMode === "fixed" && overrides.length));

    return (
      <div className="space-y-6 pb-20 max-w-full overflow-x-hidden">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Pricing</h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* MODE SWITCHER */}
            <div className="flex p-1 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
              {[
                { id: "percent", label: "Markup", icon: <Percent size={12} /> },
                { id: "fixed", label: "Fixed", icon: <Coins size={12} /> }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPricingMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${pricingMode === m.id
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {/* ROLE SELECTOR */}
            <div className="flex p-1 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
              {["user", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setPricingType(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${pricingType === role
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={onSave}
              disabled={!canSave}
              className={`
                  h-9 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all outline-none shrink-0
                  ${canSave
                  ? "bg-[var(--accent)] text-white shadow-sm hover:brightness-110 active:scale-95"
                  : "bg-[var(--foreground)]/[0.05] text-[var(--muted)]/40 cursor-not-allowed"}
                `}
            >
              {savingPricing ? (
                <RefreshCcw size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {savingPricing ? "Saving" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-6">
            <AnimatePresence mode="wait">
              {pricingMode === "percent" ? (
                <motion.div
                  key="markup"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                        <Percent size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--foreground)]">Markup Ranges</h3>
                    </div>
                    <button
                      onClick={addSlab}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all outline-none"
                    >
                      + Add New Range
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 px-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      <div className="col-span-4">Min (₹)</div>
                      <div className="col-span-4">Max (₹)</div>
                      <div className="col-span-3">Markup</div>
                      <div className="col-span-1"></div>
                    </div>

                    {slabs.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-12 gap-2 items-center p-2 sm:p-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.01] hover:bg-[var(--foreground)]/[0.03] transition-colors"
                      >
                        <div className="col-span-4">
                          <input
                            type="number"
                            value={s.min}
                            onChange={(e) => updateSlab(i, "min", e.target.value)}
                            className="w-full h-8 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-semibold text-xs sm:text-sm outline-none focus:border-[var(--accent)]/50 transition-all font-mono"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            value={s.max}
                            onChange={(e) => updateSlab(i, "max", e.target.value)}
                            className="w-full h-8 sm:h-10 px-2 sm:px-4 rounded-lg sm:rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-semibold text-xs sm:text-sm outline-none focus:border-[var(--accent)]/50 transition-all font-mono"
                            placeholder="1000"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <input
                              type="number"
                              value={s.percent}
                              onChange={(e) => updateSlab(i, "percent", e.target.value)}
                              className="w-full h-8 sm:h-10 px-2 sm:px-4 pr-6 sm:pr-8 rounded-lg sm:rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] font-bold text-xs sm:text-sm outline-none transition-all placeholder:text-[var(--accent)]/40"
                              placeholder="5"
                            />
                            <Percent size={10} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[var(--accent)]/50" />
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => deleteSlab(i)}
                            className="text-[var(--muted)] hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {!slabs.length && (
                      <div className="py-16 text-center border border-dashed border-[var(--border)] rounded-2xl">
                        <p className="text-xs font-medium text-[var(--muted)]">No markup ranges defined.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="fixed"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                >
                  {/* LEFT SIDEBAR: GAMES LIST */}
                  <div className="lg:col-span-1 space-y-2">
                    <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm flex flex-col h-[260px] sm:h-[300px] lg:h-[500px]">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-1.5">
                          <Gamepad2 size={13} className="text-[var(--accent)]" />
                          Games ({filteredGames.length})
                        </h3>
                      </div>

                      <div className="relative mb-2">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]/50" size={12} />
                        <input
                          type="text"
                          placeholder="Search games..."
                          value={gameSearch}
                          onChange={(e) => setGameSearch(e.target.value)}
                          className="w-full h-8 pl-8 pr-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[10px] font-bold outline-none focus:border-[var(--accent)]/40 transition-all"
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                        {filteredGames.map((g) => {
                          const isActive = fixedGameFilter === g.gameSlug;
                          const gameOverrides = overrides.filter(o => o.gameSlug === g.gameSlug);
                          const allInStock = gameOverrides.length === 0 || gameOverrides.every(o => o.inStock);

                          return (
                            <div
                              key={g.gameSlug}
                              onClick={() => setFixedGameFilter(g.gameSlug)}
                              className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${isActive
                                ? "bg-[var(--accent)]/10 border-[var(--accent)]/30"
                                : "bg-transparent border-transparent hover:bg-[var(--foreground)]/[0.03]"
                                }`}
                            >
                              <div className="min-w-0">
                                <p className={`text-[11px] font-black uppercase truncate tracking-tight ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/70"}`}>
                                  {g.gameName}
                                </p>
                                <p className="text-[8.5px] font-bold text-[var(--muted)]/50 truncate">
                                  {g.gameSlug}
                                </p>
                              </div>

                              <div className="flex flex-col items-center gap-0.5 ml-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGameStock(g.gameSlug, !allInStock);
                                  }}
                                  className={`w-7 h-3.5 rounded-full relative transition-all duration-300 ${allInStock ? 'bg-emerald-500' : 'bg-[var(--foreground)]/[0.1]'}`}
                                >
                                  <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${allInStock ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-[7px] font-black text-[var(--muted)]/40 uppercase tracking-tighter">Stock</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT CONTENT: ITEMS GRID */}
                  <div className="lg:col-span-3 space-y-3">
                    {!fixedGameFilter ? (
                      <div className="h-[180px] sm:h-[240px] lg:h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl opacity-40">
                        <Gamepad2 size={32} className="mb-2 text-[var(--muted)]" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Select a game to manage pricing</p>
                      </div>
                    ) : (
                      <>
                        {/* SEARCH INPUT */}
                        <div className="relative w-full">
                          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/50" size={14} />
                          <input
                            type="text"
                            placeholder="Search items by name or slug..."
                            value={fixedItemFilter}
                            onChange={(e) => setFixedItemFilter(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-semibold focus:border-[var(--accent)]/50 transition-all outline-none"
                          />
                        </div>

                        {/* ITEMS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          <AnimatePresence mode="popLayout">
                            {loadingFixedPrices ? (
                              <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-40">
                                <Loader2 size={24} className="animate-spin text-[var(--accent)] mb-3" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Hydrating Prices...</p>
                              </div>
                            ) : (
                              visibleOverrides.map((o, idx) => (
                                <motion.div
                                  key={o.itemSlug}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                                  className="p-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.01] hover:bg-[var(--foreground)]/[0.03] hover:border-[var(--accent)]/30 transition-all space-y-2.5"
                                >
                                  {/* ITEM HEADER */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                                        {o.itemName || o.itemSlug}
                                      </p>
                                      <p className="text-[9px] font-mono text-[var(--muted)]/50 truncate">
                                        {o.itemSlug}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {/* STOCK TOGGLE */}
                                      <div className="flex items-center gap-1">
                                        <div
                                          onClick={() => updateOverrideField(o.gameSlug, o.itemSlug, "inStock", !o.inStock)}
                                          className={`w-7 h-3.5 rounded-full relative cursor-pointer transition-all ${o.inStock ? 'bg-emerald-500' : 'bg-[var(--foreground)]/15'}`}
                                          title="In Stock"
                                        >
                                          <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${o.inStock ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                        </div>
                                      </div>

                                      {/* OVERRIDE TOGGLE */}
                                      <div className="flex items-center gap-1">
                                        <div
                                          onClick={() => updateOverrideField(o.gameSlug, o.itemSlug, "useOverride", !o.useOverride)}
                                          className={`w-7 h-3.5 rounded-full relative cursor-pointer transition-all ${o.useOverride ? 'bg-[var(--accent)]' : 'bg-[var(--foreground)]/15'}`}
                                          title="Enable Fixed Price Override"
                                        >
                                          <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${o.useOverride ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* PRICE INPUT ROW */}
                                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/30">
                                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                                      Price (₹)
                                    </span>
                                    <div className="relative w-28 sm:w-32">
                                      <IndianRupee size={11} className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${o.useOverride ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                                      <input
                                        type="number"
                                        value={o.fixedPrice}
                                        onChange={(e) => {
                                          if (!o.useOverride) updateOverrideField(o.gameSlug, o.itemSlug, "useOverride", true);
                                          const idx = overrides.findIndex((x) => x.gameSlug === o.gameSlug && x.itemSlug === o.itemSlug);
                                          updateOverridePrice(idx, e.target.value);
                                        }}
                                        className="w-full h-8 pl-6 pr-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-bold text-xs tabular-nums outline-none focus:border-[var(--accent)]/50 transition-all text-right"
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
