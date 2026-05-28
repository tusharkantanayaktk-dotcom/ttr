"use client";

import { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle, FiCheckCircle, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
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
  };

  const handleEdit = (item) => {
    setNewItem({ ...item });
    setEditingItemId(item.id);
    // Scroll to form (optional UX improvement)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
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
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          ⚡ Flash Sale Configuration
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Enable or disable the flash sale, set the expiration timer, and manage the items.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6 p-6 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl">
          {/* General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
              <div>
                <p className="font-bold text-sm">Enable Flash Sale</p>
                <p className="text-xs text-[var(--muted)]">Show on homepage</p>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${config.enabled ? "bg-amber-500" : "bg-gray-700"}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? "translate-x-6" : ""}`} />
              </button>
            </div>

            <div className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
              <p className="font-bold text-sm mb-2">End Time</p>
              <input
                type="datetime-local"
                value={formatDateForInput(config.endTime)}
                onChange={handleDateChange}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <hr className="border-[var(--border)]" />

          {/* Current Items */}
          <div>
            <h3 className="font-bold text-lg mb-3">Flash Sale Items ({config.items.length})</h3>
            
            <div className="space-y-3 mb-6">
              {config.items.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                  <div className="flex gap-4 items-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-black" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[var(--background)] flex items-center justify-center text-xs text-[var(--muted)]">No Img</div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm">{item.name} <span className="text-[10px] bg-amber-500 text-black px-1.5 rounded ml-2">{item.badge}</span></h4>
                      <p className="text-xs text-[var(--muted)]">{item.game} | Slug: {item.slug}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold">{item.price}</span>
                        <span className="text-xs line-through text-[var(--muted)]">{item.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 hover:bg-blue-500/10 p-2 rounded-lg transition-colors">
                      <FiEdit />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
              {config.items.length === 0 && (
                <p className="text-sm text-[var(--muted)] text-center py-4 bg-[var(--card)] rounded-xl border border-[var(--border)] border-dashed">No items added yet.</p>
              )}
            </div>

            {/* Add/Edit Item Form */}
            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] mt-4">
              <h4 className="font-bold text-sm mb-4">{editingItemId ? "Edit Item" : "Add New Item"}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input type="text" placeholder="Item Name (e.g. Weekly Pass)" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
                <input type="text" placeholder="Game Name (e.g. Mobile Legends)" value={newItem.game} onChange={e => setNewItem({...newItem, game: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
                <input type="text" placeholder="Discounted Price (e.g. ₹149)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
                <input type="text" placeholder="Original Price (e.g. ₹170)" value={newItem.originalPrice} onChange={e => setNewItem({...newItem, originalPrice: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
                <input type="text" placeholder="Link Slug (e.g. mobile-legends270)" value={newItem.slug} onChange={e => setNewItem({...newItem, slug: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
                <input type="text" placeholder="Image URL (e.g. /game-assets/1.jpg)" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
                <input type="text" placeholder="Badge (e.g. Hot Deal)" value={newItem.badge} onChange={e => setNewItem({...newItem, badge: e.target.value})} className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={addItem} className="flex-1 flex items-center justify-center gap-2 bg-[var(--background)] border border-[var(--border)] hover:border-amber-500 hover:text-amber-500 py-2 rounded-lg text-sm font-bold transition-colors">
                  {editingItemId ? <><FiSave /> Update Item</> : <><FiPlus /> Add Item</>}
                </button>
                {editingItemId && (
                  <button onClick={cancelEdit} className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] hover:border-red-500 hover:text-red-500 rounded-lg text-sm font-bold transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            Save Flash Sale Config
          </button>
        </div>
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
