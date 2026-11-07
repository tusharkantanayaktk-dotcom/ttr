"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  RefreshCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  X,
  ChevronDown,
  Layers,
  AlertTriangle,
  Tag,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Gamepad2,
  ImageIcon,
  Edit3,
  Link as LinkIcon,
  Trash2
} from "lucide-react";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

export default function ProductCatalogTab() {
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [selectedGameSlug, setSelectedGameSlug] = useState("");
  const [itemsByGame, setItemsByGame] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);

  // Global Stock Config: outOfStockGames (slugs), outOfStockItems ("gameSlug::itemSlug")
  const [stockConfig, setStockConfig] = useState({
    outOfStockGames: [],
    outOfStockItems: [],
  });

  const [initialConfig, setInitialConfig] = useState({
    outOfStockGames: [],
    outOfStockItems: [],
  });

  // Custom Game Images: { [gameSlug]: imageUrl }
  const [customGameImages, setCustomGameImages] = useState({});
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [savingImage, setSavingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Filters & Search
  const [gameSearch, setGameSearch] = useState("");
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // "all", "inStock", "outOfStock"

  const gameDropdownRef = useRef(null);

  // Close dropdown on outside click
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

  // Initial load: Fetch Games, Global Stock & Custom Game Images
  useEffect(() => {
    fetchGames();
    fetchStockConfig();
    fetchCustomGameImages();
  }, []);

  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      const res = await fetch(`${API_BASE}/games/list`);
      const json = await res.json();
      if (json.success && json.data.games) {
        const list = json.data.games;
        setGames(list);
        if (list.length > 0 && !selectedGameSlug) {
          setSelectedGameSlug(list[0].gameSlug);
        }
      }
    } catch (err) {
      console.error("Failed to fetch games list:", err);
      setMessage({ type: "error", text: "Failed to load game catalog" });
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchStockConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/catalog/stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const cfg = {
          outOfStockGames: json.data.outOfStockGames || [],
          outOfStockItems: json.data.outOfStockItems || [],
        };
        setStockConfig(cfg);
        setInitialConfig(cfg);
      }
    } catch (err) {
      console.error("Failed to fetch catalog stock:", err);
    }
  };

  const fetchCustomGameImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/catalog/game-image", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCustomGameImages(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch custom game images:", err);
    }
  };

  // Fetch items for the currently selected game
  useEffect(() => {
    if (!selectedGameSlug) return;
    if (itemsByGame[selectedGameSlug]) return;

    (async () => {
      setLoadingItems(true);
      try {
        const res = await fetch(`${API_BASE}/games/${selectedGameSlug}/items`);
        const json = await res.json();
        if (json.success) {
          const fetchedItems = json.data.items || [];
          setItemsByGame((prev) => ({ ...prev, [selectedGameSlug]: fetchedItems }));
        }
      } catch (err) {
        console.error("Failed to load items for game:", err);
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [selectedGameSlug, itemsByGame]);

  const selectedGame = useMemo(() => {
    return games.find((g) => g.gameSlug === selectedGameSlug) || null;
  }, [games, selectedGameSlug]);

  // Effective game image & custom overrides
  const getGameImage = (g) => {
    if (!g) return null;
    return customGameImages[g.gameSlug] || g.gameImageId?.image || null;
  };

  const currentSelectedImage = useMemo(() => {
    return (
      customGameImages[selectedGameSlug] ||
      selectedGame?.gameImageId?.image ||
      ""
    );
  }, [customGameImages, selectedGameSlug, selectedGame]);

  const hasCustomImage = useMemo(() => {
    return Boolean(customGameImages[selectedGameSlug]);
  }, [customGameImages, selectedGameSlug]);

  // Sync editor input whenever selected game or custom image changes
  useEffect(() => {
    if (!selectedGameSlug) return;
    const custom = customGameImages[selectedGameSlug];
    setImageUrlInput(custom !== undefined ? custom : (selectedGame?.gameImageId?.image || ""));
    setImageLoadError(false);
  }, [selectedGameSlug, customGameImages, selectedGame]);

  const handleSaveGameImage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedGameSlug || savingImage) return;

    try {
      setSavingImage(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/catalog/game-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameSlug: selectedGameSlug,
          imageUrl: imageUrlInput.trim(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCustomGameImages(json.data);
        setMessage({
          type: "success",
          text: imageUrlInput.trim()
            ? `Game image link saved for "${selectedGame?.gameName || selectedGameSlug}"`
            : `Game image reverted to default for "${selectedGame?.gameName || selectedGameSlug}"`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to save game image" });
      }
    } catch (err) {
      console.error("Error saving game image:", err);
      setMessage({ type: "error", text: "Network error saving game image" });
    } finally {
      setSavingImage(false);
    }
  };

  const handleRemoveGameImage = async () => {
    if (!selectedGameSlug || savingImage) return;
    setImageUrlInput("");
    try {
      setSavingImage(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/catalog/game-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameSlug: selectedGameSlug,
          imageUrl: "",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCustomGameImages(json.data);
        setMessage({
          type: "success",
          text: `Game image reverted to default for "${selectedGame?.gameName || selectedGameSlug}"`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to revert game image" });
      }
    } catch (err) {
      console.error("Error removing custom game image:", err);
      setMessage({ type: "error", text: "Network error removing game image" });
    } finally {
      setSavingImage(false);
    }
  };

  const currentItems = useMemo(() => {
    return itemsByGame[selectedGameSlug] || [];
  }, [itemsByGame, selectedGameSlug]);

  // Game stock state
  const isSelectedGameOutOfStock = useMemo(() => {
    return stockConfig.outOfStockGames.includes(selectedGameSlug);
  }, [stockConfig.outOfStockGames, selectedGameSlug]);

  // Item stock checker
  const isItemOutOfStock = (itemSlug) => {
    if (isSelectedGameOutOfStock) return true;
    const key = `${selectedGameSlug}::${itemSlug}`;
    return stockConfig.outOfStockItems.includes(key);
  };

  // Toggle single game stock
  const toggleGameStock = (gameSlug) => {
    setStockConfig((prev) => {
      const isOOS = prev.outOfStockGames.includes(gameSlug);
      const newOOSGames = isOOS
        ? prev.outOfStockGames.filter((s) => s !== gameSlug)
        : [...prev.outOfStockGames, gameSlug];
      return { ...prev, outOfStockGames: newOOSGames };
    });
  };

  // Toggle single item stock
  const toggleItemStock = (itemSlug) => {
    const key = `${selectedGameSlug}::${itemSlug}`;
    setStockConfig((prev) => {
      const isOOS = prev.outOfStockItems.includes(key);
      const newOOSItems = isOOS
        ? prev.outOfStockItems.filter((k) => k !== key)
        : [...prev.outOfStockItems, key];
      return { ...prev, outOfStockItems: newOOSItems };
    });
  };

  // Batch toggle all items of current game
  const markAllItemsInStock = () => {
    const prefix = `${selectedGameSlug}::`;
    setStockConfig((prev) => ({
      ...prev,
      outOfStockGames: prev.outOfStockGames.filter((s) => s !== selectedGameSlug),
      outOfStockItems: prev.outOfStockItems.filter((k) => !k.startsWith(prefix)),
    }));
  };

  const markAllItemsOutOfStock = () => {
    const newKeys = currentItems.map((item) => `${selectedGameSlug}::${item.itemSlug}`);
    setStockConfig((prev) => {
      const set = new Set([...prev.outOfStockItems, ...newKeys]);
      return {
        ...prev,
        outOfStockItems: Array.from(set),
      };
    });
  };

  // Has unsaved changes?
  const hasChanges = useMemo(() => {
    const sortedCurrentGames = [...stockConfig.outOfStockGames].sort().join(",");
    const sortedInitialGames = [...initialConfig.outOfStockGames].sort().join(",");
    const sortedCurrentItems = [...stockConfig.outOfStockItems].sort().join(",");
    const sortedInitialItems = [...initialConfig.outOfStockItems].sort().join(",");

    return (
      sortedCurrentGames !== sortedInitialGames ||
      sortedCurrentItems !== sortedInitialItems
    );
  }, [stockConfig, initialConfig]);

  // Save changes to DB
  const handleSave = async () => {
    if (saving) return;
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/catalog/stock", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stockConfig),
      });

      const json = await res.json();
      if (json.success) {
        setInitialConfig(stockConfig);
        setMessage({
          type: "success",
          text: "Product catalog stock updated successfully! Changes apply to all users.",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to save stock changes" });
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: "error", text: "Network error occurred while saving" });
    } finally {
      setSaving(false);
    }
  };

  // Filtered games in dropdown search
  const filteredGames = useMemo(() => {
    if (!gameSearch.trim()) return games;
    const q = gameSearch.toLowerCase();
    return games.filter(
      (g) =>
        g.gameName?.toLowerCase().includes(q) ||
        g.gameSlug?.toLowerCase().includes(q)
    );
  }, [games, gameSearch]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      if (itemSearch.trim()) {
        const q = itemSearch.toLowerCase();
        const matches =
          item.itemName?.toLowerCase().includes(q) ||
          item.itemSlug?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      const isOOS = isItemOutOfStock(item.itemSlug);
      if (stockFilter === "inStock" && isOOS) return false;
      if (stockFilter === "outOfStock" && !isOOS) return false;

      return true;
    });
  }, [currentItems, itemSearch, stockFilter, stockConfig, selectedGameSlug, isSelectedGameOutOfStock]);

  // Item counts for current game
  const counts = useMemo(() => {
    const total = currentItems.length;
    let outOfStock = 0;
    if (isSelectedGameOutOfStock) {
      outOfStock = total;
    } else {
      currentItems.forEach((item) => {
        const key = `${selectedGameSlug}::${item.itemSlug}`;
        if (stockConfig.outOfStockItems.includes(key)) {
          outOfStock++;
        }
      });
    }
    const inStock = total - outOfStock;
    return { total, inStock, outOfStock };
  }, [currentItems, stockConfig, selectedGameSlug, isSelectedGameOutOfStock]);

  if (loadingGames && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">
          Loading product catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-16">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 sm:p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
                <Package size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] truncate">
                Product Catalog &amp; Stock
              </h2>
              {hasChanges && (
                <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse shrink-0">
                  Unsaved
                </span>
              )}
            </div>

            {/* Mobile Actions in Header */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  fetchGames();
                  fetchStockConfig();
                  fetchCustomGameImages();
                }}
                className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] cursor-pointer"
                title="Refresh"
              >
                <RefreshCcw size={14} />
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--accent)] shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>Save</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--muted)]">
            Manage global product availability across all user types.
          </p>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 text-xs text-[var(--muted)] font-medium">
            <span>
              <strong className="text-[var(--foreground)]">
                {games.length - stockConfig.outOfStockGames.length}
              </strong>
              /{games.length} Games Active
            </span>
            <span className="opacity-40">·</span>
            <span>
              <strong className="text-rose-400">
                {stockConfig.outOfStockItems.length}
              </strong> Items OOS
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchGames();
              fetchStockConfig();
              fetchCustomGameImages();
            }}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
            title="Refresh Catalog & Stock"
          >
            <RefreshCcw size={15} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[var(--accent)]/20 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= ALERTS ================= */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN UNIFIED SURFACE ================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 shadow-sm">
        
        {/* ================= TOP CONTROLS: GAME PICKER ================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
          
          {/* Game Dropdown */}
          <div className="relative flex-1 max-w-xl" ref={gameDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                Select Game
              </label>
              <button
                type="button"
                onClick={() => setIsImageEditorOpen(!isImageEditorOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/25 transition-all cursor-pointer"
                title="Edit or add game-level cover image link"
              >
                <ImageIcon size={12} />
                <span>{hasCustomImage ? "Edit Game Image" : "Add Game Image Link"}</span>
                {hasCustomImage && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Custom image active" />
                )}
              </button>
            </div>
            <div
              onClick={() => setIsGameDropdownOpen(!isGameDropdownOpen)}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]/60 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsImageEditorOpen((prev) => !prev);
                  }}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to edit or add game image link"
                >
                  {currentSelectedImage ? (
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[var(--border)]">
                      <Image
                        src={currentSelectedImage}
                        alt={selectedGame?.gameName || "Game"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                      <Gamepad2 size={16} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-white">
                    <Edit3 size={11} />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                      {selectedGame?.gameName || "Select a Game"}
                    </h3>
                    {hasCustomImage && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Custom Image
                      </span>
                    )}
                    {isSelectedGameOutOfStock && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--muted)] truncate font-mono">
                    {selectedGame?.gameSlug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-[var(--muted)]">
                  {games.length} Games
                </span>
                <ChevronDown
                  size={14}
                  className={`text-[var(--muted)] transition-transform duration-200 ${
                    isGameDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isGameDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-2 space-y-2 max-h-96 flex flex-col"
                >
                  {/* Search inside dropdown */}
                  <div className="relative shrink-0">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    />
                    <input
                      type="text"
                      value={gameSearch}
                      onChange={(e) => setGameSearch(e.target.value)}
                      placeholder="Search game by name..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                    {filteredGames.map((g) => {
                      const isSelected = g.gameSlug === selectedGameSlug;
                      const isOOS = stockConfig.outOfStockGames.includes(g.gameSlug);

                      return (
                        <button
                          key={g.gameSlug}
                          type="button"
                          onClick={() => {
                            setSelectedGameSlug(g.gameSlug);
                            setIsGameDropdownOpen(false);
                            setGameSearch("");
                          }}
                          className={`w-full flex items-center justify-between gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--foreground)]"
                              : "hover:bg-[var(--foreground)]/[0.04] text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getGameImage(g) ? (
                              <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-[var(--border)]">
                                <Image
                                  src={getGameImage(g)}
                                  alt={g.gameName || "Game"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-[var(--foreground)]/10 flex items-center justify-center shrink-0">
                                <Gamepad2 size={12} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold truncate">{g.gameName}</p>
                                {customGameImages[g.gameSlug] && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Custom image" />
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--muted)] truncate font-mono">
                                {g.gameSlug}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isOOS ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Sold Out
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                In Stock
                              </span>
                            )}
                            {isSelected && <Check size={14} className="text-[var(--accent)]" />}
                          </div>
                        </button>
                      );
                    })}

                    {filteredGames.length === 0 && (
                      <p className="text-xs text-[var(--muted)] text-center py-6">
                        No games matching &ldquo;{gameSearch}&rdquo;
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Whole Game Stock Switch & Batch Actions */}
          <div className="flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Whole Game Stock Toggle */}
            <div className="flex items-center justify-between gap-3 p-2.5 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex-1 min-[480px]:flex-none">
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-[var(--foreground)] truncate">
                  Game Availability
                </p>
                <p className="text-[10px] text-[var(--muted)] truncate">
                  {isSelectedGameOutOfStock
                    ? "Game is OUT OF STOCK"
                    : "Game is ACTIVE in store"}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!isSelectedGameOutOfStock}
                onClick={() => toggleGameStock(selectedGameSlug)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ${
                  !isSelectedGameOutOfStock ? "bg-emerald-500" : "bg-rose-500"
                }`}
                title={
                  !isSelectedGameOutOfStock
                    ? "Click to mark whole game OUT OF STOCK"
                    : "Click to mark whole game IN STOCK"
                }
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-auto ${
                    !isSelectedGameOutOfStock ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Batch Item Buttons */}
            <div className="grid grid-cols-2 gap-1.5 shrink-0">
              <button
                type="button"
                onClick={markAllItemsInStock}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer text-center whitespace-nowrap"
                title="Mark all items of this game in stock"
              >
                All In Stock
              </button>
              <button
                type="button"
                onClick={markAllItemsOutOfStock}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer text-center whitespace-nowrap"
                title="Mark all items of this game out of stock"
              >
                All Out of Stock
              </button>
            </div>
          </div>
        </div>

        {/* ================= INLINE GAME IMAGE EDITOR (GAME LEVEL) ================= */}
        <AnimatePresence>
          {isImageEditorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 sm:p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.03] space-y-3"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--accent)]/15 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
                    <ImageIcon size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[var(--foreground)]">
                        Game Image Link (Game Level)
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--foreground)]/10 text-[var(--muted)]">
                        {selectedGame?.gameName} ({selectedGameSlug})
                      </span>
                      {hasCustomImage && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Custom Link Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--muted)]">
                      Directly add or edit this game&apos;s cover image URL. Updates across Homepage, Games list, Details page, and Admin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsImageEditorOpen(false)}
                  className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-colors cursor-pointer"
                  title="Close image editor"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Live Preview Box */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] flex items-center justify-center shadow-xs shrink-0">
                    {(imageUrlInput.trim() || currentSelectedImage) && !imageLoadError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrlInput.trim() || currentSelectedImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageLoadError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[var(--muted)] p-1 text-center">
                        {imageLoadError ? (
                          <AlertCircle size={16} className="text-rose-400" />
                        ) : (
                          <Gamepad2 size={18} className="text-[var(--accent)] opacity-70" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] leading-tight">
                    <span className="font-bold text-[var(--foreground)] block">Preview</span>
                    {imageLoadError ? (
                      <span className="text-rose-400 font-semibold">Broken Link</span>
                    ) : (imageUrlInput.trim() || currentSelectedImage) ? (
                      <span className="text-emerald-400 font-semibold">Active</span>
                    ) : (
                      <span>No image</span>
                    )}
                  </div>
                </div>

                {/* Input & Action Buttons */}
                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        <LinkIcon size={12} />
                      </span>
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => {
                          setImageUrlInput(e.target.value);
                          setImageLoadError(false);
                        }}
                        placeholder="Paste image link e.g. https://... or /game-assets/..."
                        className="w-full pl-7 pr-7 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] font-mono outline-none transition-colors"
                      />
                      {imageUrlInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrlInput("");
                            setImageLoadError(false);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                          title="Clear input"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveGameImage}
                      disabled={savingImage || imageUrlInput.trim() === (customGameImages[selectedGameSlug] || "")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--accent)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      {savingImage ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Save size={13} />
                      )}
                      <span>Save Link</span>
                    </button>

                    {hasCustomImage && (
                      <button
                        type="button"
                        onClick={handleRemoveGameImage}
                        disabled={savingImage}
                        title="Remove custom link and revert to default"
                        className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 size={12} />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--muted)]">
                    Tip: Direct URL to any PNG, JPG, or WEBP image. Leave blank and click Reset to restore provider image.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning if Whole Game is Out of Stock */}
        {isSelectedGameOutOfStock && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">
                This whole game is currently marked Out of Stock.
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Customers on the storefront cannot purchase any items for {selectedGame?.gameName || "this game"}. Toggle &ldquo;Game Availability&rdquo; above to re-enable it.
              </p>
            </div>
          </div>
        )}

        {/* ================= ITEMS FILTER & SEARCH ROW ================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--background)] border border-[var(--border)] overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setStockFilter("all")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                stockFilter === "all"
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span>All <span className="hidden min-[400px]:inline">Items</span></span>
              <span className="text-[10px] opacity-75 font-mono">({counts.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter("inStock")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                stockFilter === "inStock"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-emerald-400/80 hover:text-emerald-400"
              }`}
            >
              <span>In Stock</span>
              <span className="text-[10px] opacity-75 font-mono">({counts.inStock})</span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter("outOfStock")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                stockFilter === "outOfStock"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-rose-400/80 hover:text-rose-400"
              }`}
            >
              <span>Out of Stock</span>
              <span className="text-[10px] opacity-75 font-mono">({counts.outOfStock})</span>
            </button>
          </div>

          {/* Search Items */}
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Search items by name or slug..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
            />
          </div>
        </div>

        {/* ================= ITEMS GRID ================= */}
        {loadingItems ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            <p className="text-xs text-[var(--muted)]">Loading game items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center border border-dashed border-[var(--border)] rounded-2xl text-center p-6">
            <Package size={32} className="text-[var(--muted)]/40 mb-2" />
            <p className="text-xs font-bold text-[var(--foreground)]">No matching items found</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              {itemSearch ? "Try clearing your search query." : "No items configured for this filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredItems.map((item) => {
              const isOOS = isItemOutOfStock(item.itemSlug);

              return (
                <div
                  key={item.itemSlug}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                    isOOS
                      ? "bg-rose-500/[0.04] border-rose-500/30 opacity-85 hover:opacity-100"
                      : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--accent)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.itemImageId?.image ? (
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[var(--border)]">
                          <Image
                            src={item.itemImageId.image}
                            alt={item.itemName || "Item"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-center shrink-0">
                          <Tag size={15} className="text-[var(--muted)]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--foreground)] truncate leading-snug">
                          {item.itemName}
                        </h4>
                        <p className="text-[10px] text-[var(--muted)] font-mono truncate">
                          {item.itemSlug}
                        </p>
                      </div>
                    </div>

                    {/* Base Price Badge */}
                    <span className="text-[11px] font-black text-[var(--foreground)] font-mono px-2 py-0.5 rounded bg-[var(--foreground)]/[0.04] border border-[var(--border)]/60 shrink-0">
                      ₹{item.sellingPrice}
                    </span>
                  </div>

                  {/* Stock Status Pill Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/60">
                    <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                      Stock Status:
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleItemStock(item.itemSlug)}
                      disabled={isSelectedGameOutOfStock}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isSelectedGameOutOfStock
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-not-allowed opacity-70"
                          : isOOS
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/40 hover:bg-rose-500/25 active:scale-95"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 active:scale-95"
                      }`}
                      title={
                        isSelectedGameOutOfStock
                          ? "Entire game is marked out of stock"
                          : isOOS
                          ? "Item is OUT OF STOCK. Click to mark IN STOCK"
                          : "Item is IN STOCK. Click to mark OUT OF STOCK"
                      }
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOOS ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                        }`}
                      />
                      <span>{isOOS ? "Sold Out" : "In Stock"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
