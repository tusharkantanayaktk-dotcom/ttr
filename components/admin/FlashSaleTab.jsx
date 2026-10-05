"use client";

import { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle, FiCheckCircle, FiPlus, FiTrash2, FiEdit, FiZap, FiRefreshCw, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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
        const id = Date.now().toString();
        finalConfig.items = [...finalConfig.items, { id, ...newItem }];
        setConfig(finalConfig);
        setNewItem({
          name: "",
          game: "",
          image: "",
          price: "",
          originalPrice: "",
          slug: "",
          badge: "Hot Deal"
        });
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
    const d = new Date(e.target.value);
    setConfig(prev => ({ ...prev, endTime: d.toISOString() }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--muted)] text-sm font-medium animate-pulse">Loading Flash Sale Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Flash Sale</h2>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (showAddForm && !editingItemId) {
                setShowAddForm(false);
              } else {
                cancelEdit();
                setShowAddForm(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              showAddForm
                ? "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]"
                : "bg-[var(--accent)] text-black shadow-sm"
            }`}
          >
            {showAddForm ? <FiX size={14} /> : <FiPlus size={14} />}
            <span>{showAddForm ? "Close Form" : "Add Item"}</span>
          </button>

          <div className="px-3.5 py-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2">
            <FiZap size={14} className="text-[var(--accent)]" />
            <span className="text-xs font-semibold text-[var(--muted)]">
              {config.items?.length || 0} Items
            </span>
          </div>

          <button
            onClick={fetchSettings}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none"
            title="Refresh Flash Sale"
          >
            <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
            <div>
              <p className="font-bold text-sm text-[var(--foreground)]">Enable Flash Sale</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Show on homepage</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative w-12 h-6 shrink-0 rounded-full transition-colors ${config.enabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform duration-200 ${config.enabled ? "translate-x-6" : "bg-white"}`} />
            </button>
          </div>

          <div className="p-3.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3">
            <p className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)] shrink-0">End Time</p>
            <input
              type="datetime-local"
              value={formatDateForInput(config.endTime)}
              onChange={handleDateChange}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-all font-mono"
            />
          </div>
        </div>

        {/* Current Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wider">
              Flash Sale Items ({config.items.length})
            </h3>
            {!showAddForm && (
              <button
                onClick={() => {
                  cancelEdit();
                  setShowAddForm(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium transition-all"
              >
                <FiPlus size={13} />
                <span>Add Item</span>
              </button>
            )}
          </div>

          {/* Add/Edit Item Form - Shown only on click */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)]">
                      {editingItemId ? "Edit Item" : "Add New Item"}
                    </h4>
                    <button
                      onClick={cancelEdit}
                      className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      title="Cancel"
                    >
                      <FiX size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    <input type="text" placeholder="Item Name (e.g. Weekly Pass)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                    <input type="text" placeholder="Game Name (e.g. Mobile Legends)" value={newItem.game} onChange={e => setNewItem({...newItem, game: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                    <input type="text" placeholder="Discounted Price (e.g. ₹149)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                    <input type="text" placeholder="Original Price (e.g. ₹170)" value={newItem.originalPrice} onChange={e => setNewItem({...newItem, originalPrice: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                    <input type="text" placeholder="Link Slug (e.g. mobile-legends114)" value={newItem.slug} onChange={e => setNewItem({...newItem, slug: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                    <input type="text" placeholder="Image URL (e.g. /game-assets/1.jpg)" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                    <input type="text" placeholder="Badge (e.g. Hot Deal)" value={newItem.badge} onChange={e => setNewItem({...newItem, badge: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={addItem} className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--accent)] text-black py-2 rounded-xl text-xs font-bold transition-all hover:brightness-105 active:scale-95">
                      {editingItemId ? <><FiSave size={13} /> Update Item</> : <><FiPlus size={13} /> Add Item</>}
                    </button>
                    <button onClick={cancelEdit} className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:border-rose-500 hover:text-rose-500 rounded-xl text-xs font-bold transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {config.items.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl hover:border-[var(--border)]/80 transition-colors">
                <div className="flex gap-3 items-center min-w-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-black border border-[var(--border)] shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted)] shrink-0">No Img</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs text-[var(--foreground)] truncate">{item.name}</h4>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 px-1.5 py-0.2 rounded shrink-0">{item.badge}</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] truncate">{item.game} · <span className="font-mono opacity-70">{item.slug}</span></p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-emerald-500">{item.price}</span>
                      <span className="text-[10px] line-through text-[var(--muted)]">{item.originalPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors" title="Edit">
                    <FiEdit size={14} />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {config.items.length === 0 && (
            <p className="text-xs text-[var(--muted)] text-center py-6 bg-[var(--foreground)]/[0.01] rounded-xl border border-[var(--border)] border-dashed mb-5">No flash sale items configured yet.</p>
          )}
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md shadow-[var(--accent)]/15"
        >
          {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave size={15} />}
          Save Flash Sale Config
        </button>
      </div>

      {/* Message Area */}
      <div className="h-10 pt-4 border-t border-[var(--border)]">
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-center gap-2 text-sm font-medium ${message.type === "success" ? "text-green-500" : "text-red-500"}`}
            >
              {message.type === "success" ? <FiCheckCircle /> : <FiAlertTriangle />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
