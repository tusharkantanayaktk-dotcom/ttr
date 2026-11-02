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
  Tag,
  Sparkles,
  BarChart2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SeoTab() {
  const [settings, setSettings] = useState({
    SEO_TITLE: "",
    SEO_DESCRIPTION: "",
    SEO_KEYWORDS: [],
    GOOGLE_ANALYTICS_ID: "",
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
          GOOGLE_ANALYTICS_ID: data.data.GOOGLE_ANALYTICS_ID || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (saving) return;

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
        setMessage({ type: "success", text: "SEO and Search settings saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update settings" });
      }
    } catch (err) {
      console.error("SEO save error:", err);
      setMessage({ type: "error", text: "Something went wrong while saving" });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const kw = keywordInput.trim();
      if (kw && settings.SEO_KEYWORDS.length < 20 && !settings.SEO_KEYWORDS.includes(kw)) {
        setSettings((prev) => ({
          ...prev,
          SEO_KEYWORDS: [...prev.SEO_KEYWORDS, kw],
        }));
        setKeywordInput("");
      }
    }
  };

  const removeKeyword = (kw) => {
    setSettings((prev) => ({
      ...prev,
      SEO_KEYWORDS: prev.SEO_KEYWORDS.filter((k) => k !== kw),
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

  const titleLength = settings.SEO_TITLE?.length || 0;
  const descLength = settings.SEO_DESCRIPTION?.length || 0;

  return (
    <div className="w-full space-y-5 pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Globe size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              SEO &amp; Search Indexing
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Customize how your gaming storefront appears on Google, social media search cards, and meta tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--muted)]">
            <Tag size={13} className="text-[var(--accent)]" />
            <span>{settings.SEO_KEYWORDS?.length || 0}/20 Keywords</span>
          </div>

          <button
            type="button"
            onClick={fetchSettings}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
            title="Refresh settings"
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

      <form onSubmit={handleSave}>
        {/* ================= UNIFIED MAIN SURFACE ================= */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-7 space-y-7 shadow-sm">
          {/* SECTION 1: METAS + LIVE SERP PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
                <Search size={18} className="text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Meta Tags &amp; Descriptions</h3>
              </div>

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Website Meta Title (Google Title)
                </label>
                <span
                  className={`text-[11px] font-mono font-medium ${
                    titleLength > 60 ? "text-amber-400" : "text-[var(--muted)]"
                  }`}
                >
                  {titleLength}/60 chars
                </span>
              </div>
              <input
                type="text"
                value={settings.SEO_TITLE}
                onChange={(e) => setSettings((prev) => ({ ...prev, SEO_TITLE: e.target.value }))}
                placeholder="e.g. Tronics Store – MLBB Diamond Top Up | Instant & Secure"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs sm:text-sm text-[var(--foreground)] outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">
                Keep between 50-60 characters for best display on mobile search results.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Search Snippet Description
                </label>
                <span
                  className={`text-[11px] font-mono font-medium ${
                    descLength > 160 ? "text-amber-400" : "text-[var(--muted)]"
                  }`}
                >
                  {descLength}/160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={settings.SEO_DESCRIPTION}
                onChange={(e) => setSettings((prev) => ({ ...prev, SEO_DESCRIPTION: e.target.value }))}
                placeholder="e.g. Fast, secure Mobile Legends top-ups with instant automated delivery, 24/7 customer support, and safe payments."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs sm:text-sm text-[var(--foreground)] outline-none transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-[var(--muted)]">
                Summary displayed under your page link in search results (aim for 120-160 characters).
              </p>
            </div>

            {/* Google Analytics ID */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                <BarChart2 size={14} className="text-[var(--accent)]" />
                <span>Google Analytics Measurement ID (Optional)</span>
              </label>
              <input
                type="text"
                value={settings.GOOGLE_ANALYTICS_ID}
                onChange={(e) => setSettings((prev) => ({ ...prev, GOOGLE_ANALYTICS_ID: e.target.value }))}
                placeholder="e.g. G-RBPY9YC6V6"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] font-mono outline-none transition-colors"
              />
              <p className="text-[11px] text-[var(--muted)]">
                Connect your Google Analytics 4 stream to track visitors and order conversion live.
              </p>
            </div>
          </div>

          {/* Right Column: Real-time Google SERP Preview Card (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Google Search Live Preview
                  </h3>
                </div>
                <span className="text-[10px] text-[var(--muted)] font-medium">Desktop &amp; Mobile</span>
              </div>

              {/* Realistic Search Box */}
              <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-[10px] font-black text-[var(--accent)]">
                    T
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[11px] font-bold text-[var(--foreground)] truncate">Tronics Store</span>
                    <span className="text-[10px] text-[var(--muted)] font-mono truncate">
                      https://tronics.store &rsaquo; mlbb
                    </span>
                  </div>
                </div>

                <div className="min-w-0 pt-1">
                  <h4 className="text-sm sm:text-base font-bold text-sky-400 hover:underline cursor-pointer truncate">
                    {settings.SEO_TITLE || "Website Title - Instant Game Top Up"}
                  </h4>
                  <p className="text-xs text-[var(--muted)] line-clamp-3 mt-1 leading-relaxed">
                    {settings.SEO_DESCRIPTION ||
                      "Add your website description to see how search engines display your gaming top-up store to organic search customers."}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/15 text-[11px] text-[var(--muted)] leading-relaxed space-y-1">
                <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[var(--accent)]" />
                  <span>Pro Tip for Rankings</span>
                </div>
                <p>
                  Include your primary game title (*e.g. MLBB Diamonds, BGMI UC*) near the beginning of the title for maximum search click-through rate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full h-[1px] bg-[var(--border)] opacity-60" />

        {/* SECTION 2: SEARCH KEYWORDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-pink-400" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Meta Keywords Index</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              {settings.SEO_KEYWORDS.length} / 20 Tags
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={addKeyword}
                  placeholder="Type a search keyword (e.g. mlbb cheap recharge, weekly diamond pass) and press Enter"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] text-xs text-[var(--foreground)] outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={addKeyword}
                disabled={!keywordInput.trim() || settings.SEO_KEYWORDS.length >= 20}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-40 transition-all cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Keyword Chips */}
            {settings.SEO_KEYWORDS.length === 0 ? (
              <div className="py-6 text-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--muted)]">
                No search keywords added yet. Add tags above to target search queries.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {settings.SEO_KEYWORDS.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors group"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-[var(--muted)] hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove keyword"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
    </div>
  );
}
