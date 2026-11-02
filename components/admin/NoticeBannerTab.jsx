"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Zap,
  ShieldCheck,
  Clock,
  Gift,
  Star,
  Info,
  AlertCircle,
  Bell,
  RefreshCcw,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2
} from "lucide-react";

const ICON_MAP = {
  MessageCircle,
  Zap,
  ShieldCheck,
  Clock,
  Gift,
  Star,
  Info,
  AlertCircle
};

export default function NoticeBannerTab() {
  const [config, setConfig] = useState({
    enabled: false,
    notices: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newNotice, setNewNotice] = useState({
    icon: "MessageCircle",
    color: "var(--accent)",
    title: "",
    desc: "",
    cta: "Join Now",
    link: ""
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
      if (data.success && data.data.NOTICE_BANNER_CONFIG) {
        setConfig({
          enabled: data.data.NOTICE_BANNER_CONFIG.enabled || false,
          notices: data.data.NOTICE_BANNER_CONFIG.notices || [],
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
      
      // Auto-add if filling form without clicking Add
      if (newNotice.title && newNotice.desc) {
        if (editingId) {
          finalConfig.notices = finalConfig.notices.map(n => n.id === editingId ? { ...n, ...newNotice } : n);
          setEditingId(null);
        } else {
          const id = Date.now().toString();
          finalConfig.notices = [...finalConfig.notices, { id, ...newNotice }];
        }
        setNewNotice({ icon: "MessageCircle", color: "var(--accent)", title: "", desc: "", cta: "Join Now", link: "" });
        setConfig(finalConfig);
      }

      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: { NOTICE_BANNER_CONFIG: finalConfig } }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Notice Banner updated successfully!" });
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

  const addNotice = () => {
    if (!newNotice.title || !newNotice.desc) {
      alert("Please fill at least the title and description.");
      return;
    }

    if (editingId) {
      setConfig(prev => ({
        ...prev,
        notices: prev.notices.map(n => n.id === editingId ? { ...n, ...newNotice } : n)
      }));
      setEditingId(null);
    } else {
      const id = Date.now().toString();
      setConfig(prev => ({
        ...prev,
        notices: [...prev.notices, { id, ...newNotice }]
      }));
    }

    setNewNotice({
      icon: "MessageCircle",
      color: "var(--accent)",
      title: "",
      desc: "",
      cta: "Join Now",
      link: ""
    });
    setShowAddForm(false);
  };

  const handleEdit = (notice) => {
    setNewNotice({ ...notice });
    setEditingId(notice.id);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setNewNotice({
      icon: "MessageCircle",
      color: "var(--accent)",
      title: "",
      desc: "",
      cta: "Join Now",
      link: ""
    });
  };

  const removeNotice = (id) => {
    setConfig(prev => ({
      ...prev,
      notices: prev.notices.filter(n => n.id !== id)
    }));
    if (editingId === id) cancelEdit();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">Loading Banner Config...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Bell size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              Top Notice Bar
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Display important announcements, server alerts, or event tickers across the top of every page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--muted)]">
            <Bell size={13} className="text-[var(--accent)]" />
            <span>{config.notices?.length || 0} Notices</span>
          </div>

          <button
            type="button"
            onClick={fetchSettings}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
            title="Refresh Notice Banner"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
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

      <div className="space-y-3">
        {/* General Settings */}
        <div
          onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
          className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Bell size={16} className="text-[var(--accent)] shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                Enable Notice Banner
              </p>
              <p className="text-[11px] text-[var(--muted)]/80 mt-0.5 leading-snug">
                Show the broadcast banner at the top of the site
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
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-auto ${
                config.enabled ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Current Notices */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="font-extrabold text-xs text-[var(--foreground)] uppercase tracking-wider">
              Rotating Notices ({config.notices.length})
            </h3>
            <button
              onClick={() => {
                if (showAddForm && !editingId) {
                  setShowAddForm(false);
                } else {
                  cancelEdit();
                  setShowAddForm(true);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-black font-extrabold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              {showAddForm ? <X size={12} /> : <Plus size={12} strokeWidth={3} />}
              <span>{showAddForm ? "Close Form" : "New Notice"}</span>
            </button>
          </div>

          {/* Add/Edit Notice Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--foreground)]">
                      {editingId ? "Edit Notice" : "Add New Notice"}
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
                    <input 
                      type="text" 
                      placeholder="Title (e.g. Official Community)" 
                      value={newNotice.title} 
                      onChange={e => setNewNotice({...newNotice, title: e.target.value})} 
                      className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40" 
                    />
                    <input 
                      type="text" 
                      placeholder="Description" 
                      value={newNotice.desc} 
                      onChange={e => setNewNotice({...newNotice, desc: e.target.value})} 
                      className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40" 
                    />
                    <input 
                      type="text" 
                      placeholder="CTA Text (e.g. Join Now)" 
                      value={newNotice.cta} 
                      onChange={e => setNewNotice({...newNotice, cta: e.target.value})} 
                      className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40" 
                    />
                    <input 
                      type="text" 
                      placeholder="Link URL" 
                      value={newNotice.link} 
                      onChange={e => setNewNotice({...newNotice, link: e.target.value})} 
                      className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all placeholder:text-[var(--muted)]/40" 
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={addNotice} 
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--accent)] text-black py-2 rounded-xl text-xs font-extrabold transition-all hover:brightness-105 active:scale-95 cursor-pointer"
                    >
                      {editingId ? <><Save size={13} /> Update Notice</> : <><Plus size={13} strokeWidth={2.5} /> Add Notice</>}
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

          {/* Notices List */}
          <div className="space-y-2">
            {config.notices.map(notice => {
              const Icon = ICON_MAP[notice.icon] || MessageCircle;
              return (
                <div key={notice.id} className="flex items-center justify-between gap-3 p-3 bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] rounded-xl transition-all">
                  <div className="flex gap-3 items-center min-w-0">
                    <Icon size={18} className="text-[var(--accent)] shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[var(--foreground)] truncate">{notice.title}</h4>
                      <p className="text-[11px] text-[var(--muted)]/80 truncate leading-snug">{notice.desc}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9px] bg-[var(--foreground)]/[0.04] px-1.5 py-0.5 rounded text-[var(--foreground)] font-semibold border border-[var(--border)]/60">CTA: {notice.cta}</span>
                        <span className="text-[9px] bg-[var(--foreground)]/[0.04] px-1.5 py-0.5 rounded text-[var(--muted)] truncate max-w-[150px] font-mono border border-[var(--border)]/60">Link: {notice.link}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(notice)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => removeNotice(notice.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {config.notices.length === 0 && (
            <p className="text-xs text-[var(--muted)] text-center py-6 bg-[var(--card)]/30 rounded-xl border border-[var(--border)] border-dashed">No notices added yet.</p>
          )}
        </div>
      </div>

      {/* Message Area */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-rose-500/10 border-rose-500/30 text-rose-500"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
