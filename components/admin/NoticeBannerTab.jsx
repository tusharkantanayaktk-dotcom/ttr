"use client";

import { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle, FiCheckCircle, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, ShieldCheck, Clock, Gift, Star, Info, AlertCircle, Bell, RefreshCcw } from "lucide-react";

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

  const [newNotice, setNewNotice] = useState({
    icon: "MessageCircle",
    color: "#var(--accent)",
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
        setNewNotice({ icon: "MessageCircle", color: "#var(--accent)", title: "", desc: "", cta: "Join Now", link: "" });
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
  };

  const handleEdit = (notice) => {
    setNewNotice({ ...notice });
    setEditingId(notice.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--muted)] text-sm font-medium animate-pulse">Loading Banner Config...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Notice Banner</h2>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
            <Bell size={14} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--muted)]">
              {config.notices?.length || 0} Notices
            </span>
          </div>
          <button
            onClick={fetchConfig}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="flex items-center justify-between p-3.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
          <div>
            <p className="font-bold text-sm text-[var(--foreground)]">Enable Notice Banner</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Show the broadcast banner at the top of the site</p>
          </div>
          <button
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative w-12 h-6 shrink-0 rounded-full transition-colors ${config.enabled ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform duration-200 ${config.enabled ? "translate-x-6" : "bg-white"}`} />
          </button>
        </div>

        {/* Current Notices */}
        <div>
          <h3 className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wider mb-3">Rotating Notices ({config.notices.length})</h3>
          
          <div className="space-y-2.5 mb-5">
            {config.notices.map(notice => {
              const Icon = ICON_MAP[notice.icon] || MessageCircle;
              return (
                <div key={notice.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0 text-[var(--accent)]">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[var(--foreground)] truncate">{notice.title}</h4>
                      <p className="text-[11px] text-[var(--muted)] truncate">{notice.desc}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] bg-[var(--foreground)]/[0.05] px-1.5 py-0.5 rounded text-[var(--muted)] font-semibold">CTA: {notice.cta}</span>
                        <span className="text-[9px] bg-[var(--foreground)]/[0.05] px-1.5 py-0.5 rounded text-[var(--muted)] truncate max-w-[180px] font-mono">Link: {notice.link}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                    <button onClick={() => handleEdit(notice)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors" title="Edit">
                      <FiEdit size={14} />
                    </button>
                    <button onClick={() => removeNotice(notice.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {config.notices.length === 0 && (
              <p className="text-xs text-[var(--muted)] text-center py-6 bg-[var(--foreground)]/[0.01] rounded-xl border border-[var(--border)] border-dashed">No notices added yet.</p>
            )}
          </div>

          {/* Add/Edit Notice Form */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.01] space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--foreground)]">{editingId ? "Edit Notice" : "Add New Notice"}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input type="text" placeholder="Title (e.g. Official Community)" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
              <input type="text" placeholder="Description" value={newNotice.desc} onChange={e => setNewNotice({...newNotice, desc: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
              <input type="text" placeholder="CTA Text (e.g. Join Now)" value={newNotice.cta} onChange={e => setNewNotice({...newNotice, cta: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
              <input type="text" placeholder="Link URL" value={newNotice.link} onChange={e => setNewNotice({...newNotice, link: e.target.value})} className="bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs focus:border-[var(--accent)] outline-none transition-all" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={addNotice} className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] py-2 rounded-xl text-xs font-bold transition-colors">
                {editingId ? <><FiSave size={13} /> Update Notice</> : <><FiPlus size={13} /> Add Notice</>}
              </button>
              {editingId && (
                <button onClick={cancelEdit} className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] hover:border-rose-500 hover:text-rose-500 rounded-xl text-xs font-bold transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md shadow-[var(--accent)]/15"
        >
          {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave size={15} />}
          Save Notice Banner Config
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
