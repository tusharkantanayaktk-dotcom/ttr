"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Clock,
  Plus,
  X,
  Save,
  RefreshCcw,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ImageIcon
} from "lucide-react";

export default function FlashSaleTab() {
  const [config, setConfig] = useState({
    enabled: false,
    endTime: "",
    items: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingItemId, setEditingItemId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    game: "",
    image: "",
    price: "",
    originalPrice: "",
    slug: "",
    badge: "Hot Deal"
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.FLASH_SALE_CONFIG) {
        setConfig({
          enabled: data.data.FLASH_SALE_CONFIG.enabled || false,
          endTime: data.data.FLASH_SALE_CONFIG.endTime || "",
          items: data.data.FLASH_SALE_CONFIG.items || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      let finalConfig = { ...config };
      
      // Auto-add item if they forgot to click "Add Item" but filled the form
      if (newItem.name && newItem.price && newItem.slug) {
        if (editingItemId) {
          finalConfig.items = finalConfig.items.map(item => item.id === editingItemId ? { ...item, ...newItem } : item);
          setEditingItemId(null);
        } else {
          const id = Date.now().toString();
          finalConfig.items = [...finalConfig.items, { id, ...newItem }];
        }
        setNewItem({
          name: "",
          game: "",
          image: "",
          price: "",
          originalPrice: "",
          slug: "",
          badge: "Hot Deal"
        });
        setConfig(finalConfig);
      }

      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: { FLASH_SALE_CONFIG: finalConfig } }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Flash Sale updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem.name || !newItem.price || !newItem.slug) {
      alert("Please fill at least name, price, and link slug.");
      return;
    }

    if (editingItemId) {
      setConfig(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === editingItemId ? { ...item, ...newItem } : item)
      }));
      setEditingItemId(null);
    } else {
      const id = Date.now().toString();
      setConfig(prev => ({
        ...prev,
        items: [...prev.items, { id, ...newItem }]
      }));
    }

    setNewItem({
      name: "",
      game: "",
      image: "",
      price: "",
      originalPrice: "",
      slug: "",
      badge: "Hot Deal"
    });
    setShowAddForm(false);
  };

  const handleEdit = (item) => {
    setNewItem({ ...item });
    setEditingItemId(item.id);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setShowAddForm(false);
    setNewItem({
      name: "",
      game: "",
      image: "",
      price: "",
      originalPrice: "",
      slug: "",
      badge: "Hot Deal"
    });
  };

  const removeItem = (id) => {
    setConfig(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
    if (editingItemId === id) {
      cancelEdit();
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const handleDateChange = (e) => {
    if (!e.target.value) {
      setConfig(prev => ({ ...prev, endTime: "" }));
      return;
    }
    const d = new Date(e.target.value);
    setConfig(prev => ({ ...prev, endTime: d.toISOString() }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">Loading Flash Sale Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] truncate">
            Flash Sale
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Limited-time deals with live countdown timer
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            <Zap size={13} className="fill-[var(--accent)]" />
            <span>{config.items?.length || 0} Deals</span>
          </div>

          <button
            onClick={fetchSettings}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
            title="Refresh Flash Sale"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* ================= GENERAL SETTINGS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Enable Toggle Card */}
          <div
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Zap size={16} className={`shrink-0 transition-colors ${config.enabled ? "text-amber-400 fill-amber-400" : "text-[var(--muted)]"}`} />
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                  Enable Flash Sale
                </p>
                <p className="text-[11px] text-[var(--muted)]/80 mt-0.5 leading-snug truncate">
                  Show banner on homepage
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={config.enabled}
              onClick={(e) => {
                e.stopPropagation();
                setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ${
                config.enabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/15"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-auto ${
                  config.enabled ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* End Time Card */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--card)]/60 border border-[var(--border)] rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <Clock size={16} className="text-[var(--accent)] shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
                  Countdown End Time
                </p>
                <p className="text-[11px] text-[var(--muted)]/80 mt-0.5 leading-snug truncate">
                  Deals expire at
                </p>
              </div>
            </div>

            <input
              type="datetime-local"
              value={formatDateForInput(config.endTime)}
              onChange={handleDateChange}
              className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-all font-mono shrink-0 cursor-pointer"
            />
          </div>
        </div>

        {/* ================= SALE ITEMS SECTION ================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="font-extrabold text-xs text-[var(--foreground)] uppercase tracking-wider">
              Sale Items ({config.items.length})
            </h3>
            <button
              onClick={() => {
                if (showAddForm && !editingItemId) {
                  setShowAddForm(false);
                } else {
                  cancelEdit();
                  setShowAddForm(true);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-black font-extrabold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              {showAddForm ? <X size={12} /> : <Plus size={12} strokeWidth={3} />}
              <span>{showAddForm ? "Close Form" : "Add Item"}</span>
            </button>
          </div>

          {/* Add/Edit Item Form Accordion */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--foreground)]">
                      {editingItemId ? "Edit Deal Item" : "Add New Deal Item"}
                    </h4>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Weekly Diamond Pass"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Game Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile Legends"
                        value={newItem.game}
                        onChange={e => setNewItem({ ...newItem, game: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Discounted Price</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹149"
                        value={newItem.price}
                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Original Price</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹170"
                        value={newItem.originalPrice}
                        onChange={e => setNewItem({ ...newItem, originalPrice: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Link Slug</label>
                      <input
                        type="text"
                        placeholder="e.g. mobile-legends"
                        value={newItem.slug}
                        onChange={e => setNewItem({ ...newItem, slug: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Badge Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Hot Deal, 50% OFF"
                        value={newItem.badge}
                        onChange={e => setNewItem({ ...newItem, badge: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Image URL</label>
                      <input
                        type="text"
                        placeholder="e.g. /game-assets/1.jpg or https://..."
                        value={newItem.image}
                        onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={addItem}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--accent)] text-black py-2 rounded-xl text-xs font-extrabold transition-all hover:brightness-105 active:scale-95 cursor-pointer"
                    >
                      {editingItemId ? <><Save size={13} /> Update Deal</> : <><Plus size={13} strokeWidth={2.5} /> Add Deal</>}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:border-rose-500 hover:text-rose-500 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {config.items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] rounded-xl transition-all group"
              >
                <div className="flex gap-2.5 items-center min-w-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 object-cover rounded-lg bg-black/40 border border-[var(--border)]/60 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: item.image ? "none" : "flex" }}
                    className="w-11 h-11 rounded-lg bg-[var(--card)] border border-[var(--border)] items-center justify-center text-[var(--muted)] shrink-0"
                  >
                    <Zap size={16} className="text-amber-400" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-[var(--foreground)] truncate">
                        {item.name}
                      </h4>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 px-1.5 py-0.2 rounded shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--muted)]/80 truncate mt-0.5">
                      {item.game} <span className="opacity-40">·</span> <span className="font-mono text-[10px] opacity-70">{item.slug}</span>
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-emerald-500">{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-[10px] line-through text-[var(--muted)]/60">{item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                    title="Edit Deal"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Deal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {config.items.length === 0 && (
            <p className="text-xs text-[var(--muted)] text-center py-6 bg-[var(--card)]/30 rounded-xl border border-[var(--border)] border-dashed">
              No flash sale items configured yet.
            </p>
          )}
        </div>

        {/* ================= SAVE BUTTON ================= */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-extrabold uppercase tracking-wider text-xs py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? "Saving Changes..." : "Save Flash Sale Config"}</span>
        </button>
      </div>

      {/* ================= NOTIFICATION MESSAGE ================= */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
