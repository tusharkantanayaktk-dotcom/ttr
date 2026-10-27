"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  RefreshCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Loader2,
  Search,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SeoTab() {
  const [settings, setSettings] = useState({
    SEO_TITLE: "",
    SEO_DESCRIPTION: "",
    SEO_KEYWORDS: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [keywordInput, setKeywordInput] = useState("");

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
      if (data.success) {
        setSettings({
          SEO_TITLE: data.data.SEO_TITLE || "",
          SEO_DESCRIPTION: data.data.SEO_DESCRIPTION || "",
          SEO_KEYWORDS: Array.isArray(data.data.SEO_KEYWORDS) ? data.data.SEO_KEYWORDS : [],
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
      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "SEO Settings updated successfully!" });
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

  const addKeyword = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const kw = keywordInput.trim();
      if (kw && settings.SEO_KEYWORDS.length < 20 && !settings.SEO_KEYWORDS.includes(kw)) {
        setSettings(prev => ({
          ...prev,
          SEO_KEYWORDS: [...prev.SEO_KEYWORDS, kw]
        }));
        setKeywordInput("");
      }
    }
  };

  const removeKeyword = (kw) => {
    setSettings(prev => ({
      ...prev,
      SEO_KEYWORDS: prev.SEO_KEYWORDS.filter(k => k !== kw)
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">Loading SEO settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">SEO & Google</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <Globe size={13} className="text-[var(--accent)]" />
            <span>{settings.SEO_KEYWORDS?.length || 0}/20 Keywords</span>
          </div>
          <button
            onClick={fetchSettings}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
            title="Refresh"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= GOOGLE SEARCH PREVIEW ================= */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] space-y-1">
        <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
          <Search size={11} className="text-[var(--accent)]" />
          <span>Google Search Preview</span>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-[var(--muted)] font-mono truncate">
            https://yourdomain.com
          </p>
          <h4 className="text-sm font-bold text-blue-500 hover:underline truncate cursor-pointer mt-0.5">
            {settings.SEO_TITLE || "Website Title - Instant Game Top Up"}
          </h4>
          <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5 leading-relaxed">
            {settings.SEO_DESCRIPTION || "Add your website description below to customize how your store appears in Google and search engines."}
          </p>
        </div>
      </div>

      {/* ================= FORM CONTROLS ================= */}
      <div className="space-y-3">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-0.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              Website Title (Google Title)
            </label>
            <span className="text-[10px] font-mono text-[var(--muted)]/60">
              {settings.SEO_TITLE?.length || 0} chars
            </span>
          </div>
          <input 
            type="text" 
            value={settings.SEO_TITLE}
            onChange={(e) => setSettings(prev => ({...prev, SEO_TITLE: e.target.value}))}
            className="w-full bg-[var(--card)]/60 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 transition-all"
            placeholder="e.g. Tronics Store - Instant Game Top Up"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-0.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              Website Description (Google Description)
            </label>
            <span className="text-[10px] font-mono text-[var(--muted)]/60">
              {settings.SEO_DESCRIPTION?.length || 0} chars
            </span>
          </div>
          <textarea 
            value={settings.SEO_DESCRIPTION}
            onChange={(e) => setSettings(prev => ({...prev, SEO_DESCRIPTION: e.target.value}))}
            rows={3}
            className="w-full bg-[var(--card)]/60 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 transition-all resize-y"
            placeholder="e.g. Fast, cheap and safe top-up service for mobile games..."
          />
        </div>

        {/* Keywords */}
        <div className="space-y-1">
          <div className="flex justify-between items-center px-0.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <Tag size={11} className="text-[var(--accent)]" />
              <span>Search Keywords</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
              {settings.SEO_KEYWORDS.length}/20
            </span>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={addKeyword}
              disabled={settings.SEO_KEYWORDS.length >= 20}
              className="flex-1 bg-[var(--card)]/60 border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 disabled:opacity-50 transition-all"
              placeholder="Type keyword and press Enter..."
            />
            <button 
              type="button"
              onClick={addKeyword}
              disabled={settings.SEO_KEYWORDS.length >= 20 || !keywordInput.trim()}
              className="px-3.5 py-2.5 bg-[var(--accent)] text-black font-extrabold uppercase text-xs rounded-xl disabled:opacity-40 hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Plus size={13} strokeWidth={3} />
              <span>Add</span>
            </button>
          </div>
          
          {/* Keyword tags */}
          {settings.SEO_KEYWORDS.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {settings.SEO_KEYWORDS.map(kw => (
                <span key={kw} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)]">
                  <span>{kw}</span>
                  <button 
                    type="button"
                    onClick={() => removeKeyword(kw)} 
                    className="text-[var(--muted)] hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Save button */}
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-extrabold uppercase tracking-wider text-xs py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? "Saving Changes..." : "Save SEO Settings"}</span>
        </button>
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
