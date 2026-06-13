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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Pricing Config</h2>

            {/* SAVE BUTTON */}
            <button
              onClick={onSave}
              disabled={!canSave}
              className={`
                  h-10 px-6 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all outline-none shrink-0
                  ${canSave
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/10 hover:brightness-110 active:scale-95"
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

          <div className="flex flex-wrap items-center gap-3">
            {/* MODE SWITCHER */}
            <div className="flex p-1 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              {[
                { id: "percent", label: "Markup", icon: <Percent size={10} /> },
                { id: "fixed", label: "Fixed", icon: <Coins size={10} /> }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPricingMode(m.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${pricingMode === m.id
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {/* ROLE SELECTOR */}
            <div className="flex p-1 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              {["user", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setPricingType(role)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${pricingType === role
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>

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
                  className="p-4 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                        <Percent size={18} />
                      </div>
                      <h3 className="text-base font-bold text-[var(--foreground)]">Markup Ranges</h3>
                    </div>
                    <button
                      onClick={addSlab}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all outline-none"
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
                  <div className="lg:col-span-1 space-y-3">
                    <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/5 flex flex-col h-[600px]">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                          <Gamepad2 size={14} className="text-[var(--accent)]" />
                          Games
                        </h3>
                      </div>

                      <div className="relative mb-3">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/50" size={12} />
                        <input
                          type="text"
                          placeholder="Search games..."
                          value={gameSearch}
                          onChange={(e) => setGameSearch(e.target.value)}
                          className="w-full h-9 pl-9 pr-4 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[10px] font-bold outline-none focus:border-[var(--accent)]/40 transition-all"
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
                              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${isActive
                                ? "bg-[var(--accent)]/10 border-[var(--accent)]/30"
                                : "bg-transparent border-transparent hover:bg-[var(--foreground)]/[0.03]"
                                }`}
                            >
                              <div className="min-w-0">
                                <p className={`text-[11px] font-black uppercase truncate tracking-tight ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/70"}`}>
                                  {g.gameName}
                                </p>
                                <p className="text-[9px] font-bold text-[var(--muted)]/50 truncate">
                                  {g.gameSlug}
                                </p>
                              </div>

                              <div className="flex flex-col items-center gap-1 ml-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGameStock(g.gameSlug, !allInStock);
                                  }}
                                  className={`w-8 h-4 rounded-full relative transition-all duration-300 ${allInStock ? 'bg-emerald-500' : 'bg-[var(--foreground)]/[0.1]'}`}
                                >
                                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${allInStock ? 'translate-x-4' : 'translate-x-0'}`} />
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
                  <div className="lg:col-span-3 space-y-6">
                    {!fixedGameFilter ? (
                      <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-3xl opacity-30">
                        <Gamepad2 size={40} className="mb-4 text-[var(--muted)]" />
                        <p className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Select a game to manage pricing</p>
                      </div>
                    ) : (
                      <>
                        {/* SEARCH HEADER */}
                        <div className="bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)]">
                          <div className="relative w-full">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/50" size={14} />
                            <input
                              type="text"
                              placeholder="Search items..."
                              value={fixedItemFilter}
                              onChange={(e) => setFixedItemFilter(e.target.value)}
                              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold outline-none focus:border-[var(--accent)]/40 transition-all"
                            />
                          </div>
                        </div>

                        {/* ITEMS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                  className="group p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-all"
                                >
                                  {/* ITEM HEADER */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="min-w-0">
                                      <p className="text-[12px] font-black text-[var(--foreground)] truncate leading-tight">
                                        {o.itemName || o.itemSlug}
                                      </p>
                                      <p className="text-[8px] font-bold text-[var(--muted)]/50 tracking-wider">
                                        {o.itemSlug}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {/* STOCK TOGGLE */}
                                      <div className="flex flex-col items-center gap-1">
                                        <div
                                          onClick={() => updateOverrideField(o.gameSlug, o.itemSlug, "inStock", !o.inStock)}
                                          className={`w-7 h-3.5 rounded-full relative cursor-pointer transition-all duration-300 ${o.inStock ? 'bg-emerald-500' : 'bg-[var(--foreground)]/[0.1]'}`}
                                        >
                                          <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${o.inStock ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-[7px] font-black text-[var(--muted)]/60 uppercase tracking-tighter">In Stock</span>
                                      </div>

                                      {/* OVERRIDE TOGGLE */}
                                      <div className="flex flex-col items-center gap-1">
                                        <div
                                          onClick={() => updateOverrideField(o.gameSlug, o.itemSlug, "useOverride", !o.useOverride)}
                                          className={`w-7 h-3.5 rounded-full relative cursor-pointer transition-all duration-300 ${o.useOverride ? 'bg-[var(--accent)]' : 'bg-[var(--foreground)]/[0.1]'}`}
                                        >
                                          <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${o.useOverride ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-[7px] font-black text-[var(--muted)]/60 uppercase tracking-tighter whitespace-nowrap">Override</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* PRICE INPUT — always editable; typing auto-enables Override */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                      <label className="text-[8px] font-black text-[var(--muted)]/60 uppercase tracking-widest leading-none">Base Selling Price (INR)</label>
                                      {o.useOverride && (
                                        <span className="text-[7px] font-black text-[var(--accent)] uppercase animate-pulse leading-none">Fixed</span>
                                      )}
                                    </div>
                                    <div className="relative">
                                      <IndianRupee size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${o.useOverride ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                                      <input
                                        type="number"
                                        value={o.fixedPrice}
                                        onChange={(e) => {
                                          // Auto-enable override when user starts typing
                                          if (!o.useOverride) {
                                            updateOverrideField(o.gameSlug, o.itemSlug, "useOverride", true);
                                          }
                                          const idx = overrides.findIndex(
                                            (x) => x.gameSlug === o.gameSlug && x.itemSlug === o.itemSlug
                                          );
                                          updateOverridePrice(idx, e.target.value);
                                        }}
                                        className="w-full h-10 pl-9 pr-4 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-black text-base tabular-nums outline-none transition-all focus:border-[var(--accent)]/50 focus:bg-[var(--accent)]/[0.02]"
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
