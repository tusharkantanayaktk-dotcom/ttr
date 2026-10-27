"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Eye,
  EyeOff,
  RefreshCcw,
  Gamepad2,
  Link as LinkIcon,
  ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function BannersTab({ banners = [], onRefresh }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    bannerImage: "",
    bannerTitle: "",
    bannerSlug: "",
    bannerLink: "",
    bannerSummary: "",
    gameId: "",
    isShow: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= ADD / UPDATE ================= */

  const addBanner = async () => {
    if (!form.bannerImage.trim() || !form.bannerTitle.trim() || !form.bannerSlug.trim()) {
      setStatusMessage({ type: "error", text: "Please fill Title, Slug, and Image URL" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          gameId: form.gameId
            ? form.gameId.split(",").map((g) => g.trim()).filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Banner created successfully!" });
        resetForm();
        setShowAddForm(false);
        if (onRefresh) onRefresh();
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to create banner" });
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Network error occurred" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({
      bannerImage: b.bannerImage || "",
      bannerTitle: b.bannerTitle || "",
      bannerSlug: b.bannerSlug || "",
      bannerLink: b.bannerLink || "",
      bannerSummary: b.bannerSummary || "",
      gameId: Array.isArray(b.gameId) ? b.gameId.join(", ") : b.gameId || "",
      isShow: b.isShow ?? true,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateBanner = async () => {
    if (!form.bannerSlug.trim()) {
      setStatusMessage({ type: "error", text: "Banner slug is required" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners/editbanner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          gameId: form.gameId
            ? form.gameId.split(",").map((g) => g.trim()).filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: "Banner updated successfully!" });
        resetForm();
        setShowAddForm(false);
        if (onRefresh) onRefresh();
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
      } else {
        setStatusMessage({ type: "error", text: data.message || "Failed to update banner" });
        setTimeout(() => setStatusMessage({ type: "", text: "" }), 3500);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Network error occurred" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShow = async (banner) => {
    if (!banner?.bannerSlug) return;
    setTogglingId(banner._id);
    try {
      const res = await fetch("/api/admin/banners/editbanner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bannerSlug: banner.bannerSlug,
          isShow: !banner.isShow,
        }),
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Toggle visibility failed", err);
    } finally {
      setTogglingId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      bannerImage: "",
      bannerTitle: "",
      bannerSlug: "",
      bannerLink: "",
      bannerSummary: "",
      gameId: "",
      isShow: true,
    });
  };

  const formatDisplaySlug = (slug) => {
    if (!slug) return "";
    return slug
      .replace(/^https?:\/\//i, "")
      .replace(/^\//, "");
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER SECTION ================= */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] truncate flex items-center gap-2">
            <ImageIcon size={18} className="text-[var(--accent)] shrink-0" />
            Website Banners
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">
            Manage homepage carousel slides, hero banners, and promotional links
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (showAddForm && !editingId) {
                setShowAddForm(false);
              } else {
                resetForm();
                setShowAddForm(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-black text-xs font-extrabold transition-all hover:brightness-105 active:scale-95 shadow-sm cursor-pointer"
          >
            {showAddForm ? <X size={13} /> : <Plus size={13} strokeWidth={2.5} />}
            <span>{showAddForm ? "Close Form" : "Add Banner"}</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
            title="Refresh Banners"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* ================= STATUS NOTIFICATION ================= */}
      <AnimatePresence>
        {statusMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-xl border ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FORM CARD ================= */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                    {editingId ? <Edit3 size={15} /> : <Plus size={15} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                      {editingId ? "Edit Website Banner" : "Create New Banner"}
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      {editingId ? "Update banner details and slide visibility" : "Add slide to the homepage carousel"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* Form Inputs */}
                <div className="lg:col-span-7 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Banner Title</label>
                      <input
                        value={form.bannerTitle}
                        onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                        className="w-full h-8.5 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                        placeholder="e.g. Weekend Flash Sale"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Unique Slug</label>
                      <input
                        value={form.bannerSlug}
                        onChange={(e) => setForm({ ...form, bannerSlug: e.target.value })}
                        disabled={!!editingId}
                        className="w-full h-8.5 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all disabled:opacity-50 font-mono placeholder:text-[var(--muted)]/40"
                        placeholder="e.g. weekend-flash-sale"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Image URL</label>
                    <input
                      value={form.bannerImage}
                      onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                      className="w-full h-8.5 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all font-mono placeholder:text-[var(--muted)]/40"
                      placeholder="e.g. https://... or /assets/banner.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Banner Link (Click Action)</label>
                      <input
                        value={form.bannerLink}
                        onChange={(e) => setForm({ ...form, bannerLink: e.target.value })}
                        className="w-full h-8.5 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all font-mono placeholder:text-[var(--muted)]/40"
                        placeholder="e.g. /games/mobile-legends"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Associated Game IDs</label>
                      <input
                        value={form.gameId}
                        onChange={(e) => setForm({ ...form, gameId: e.target.value })}
                        className="w-full h-8.5 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
                        placeholder="e.g. mlbb, freefire"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Short Summary (Optional)</label>
                    <textarea
                      value={form.bannerSummary}
                      onChange={(e) => setForm({ ...form, bannerSummary: e.target.value })}
                      className="w-full min-h-[64px] bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl p-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none resize-none transition-all placeholder:text-[var(--muted)]/40"
                      placeholder="Brief promotion details..."
                    />
                  </div>

                  {/* Visibility Toggle and Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* iOS Switch for Visibility */}
                    <div
                      onClick={() => setForm({ ...form, isShow: !form.isShow })}
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.isShow}
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, isShow: !form.isShow });
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ${
                          form.isShow ? "bg-emerald-500" : "bg-[var(--foreground)]/15"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out my-auto ${
                            form.isShow ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {form.isShow ? "Visible on site" : "Hidden from site"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setShowAddForm(false);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={editingId ? updateBanner : addBanner}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-extrabold hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                        <span>{editingId ? "Update Banner" : "Add Banner"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 flex flex-col">
                  <label className="text-[11px] font-semibold text-[var(--muted)] mb-1 block">Live Slide Preview</label>
                  <div className="flex-1 min-h-[160px] relative rounded-xl overflow-hidden border border-[var(--border)] bg-black/40 flex flex-col justify-end p-3">
                    <BannerCardImage src={form.bannerImage} alt={form.bannerTitle} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-0.5">
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block ${
                          form.isShow ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {form.isShow ? "Visible" : "Hidden"}
                      </span>
                      <h4 className="text-white text-sm font-extrabold leading-tight drop-shadow truncate">
                        {form.bannerTitle || "Banner Title Preview"}
                      </h4>
                      <p className="text-white/60 text-[10px] font-mono truncate">
                        {form.bannerLink || "/games/..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= LIST SECTION ================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
            Banner List ({banners.length})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {banners.map((b, idx) => (
              <motion.div
                key={b._id || b.bannerSlug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/70 hover:bg-[var(--card)] transition-all hover:border-[var(--accent)]/40 hover:shadow-md flex flex-col"
              >
                {/* 16:9 Banner Image Area */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                  <BannerCardImage src={b.bannerImage} alt={b.bannerTitle} />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90 transition-opacity" />

                  {/* Status Badge */}
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
                    {b.isShow ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[7px] sm:text-[8px] font-black text-emerald-400 uppercase border border-emerald-500/30 backdrop-blur-md">
                        Visible
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-[7px] sm:text-[8px] font-black text-rose-400 uppercase border border-rose-500/30 backdrop-blur-md">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Title Overlaid on Image */}
                  <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2 sm:left-2.5 sm:right-2.5 z-10">
                    <p className="text-[11px] sm:text-xs font-extrabold text-white truncate drop-shadow-sm leading-tight">
                      {b.bannerTitle}
                    </p>
                  </div>
                </div>

                {/* Footer Details & Clean Actions */}
                <div className="p-1.5 sm:p-2.5 flex items-center justify-between gap-1 border-t border-[var(--border)]/60 bg-[var(--card)]">
                  <div className="flex items-center gap-1 min-w-0 text-[9px] sm:text-[10px] text-[var(--accent)] font-semibold truncate">
                    <LinkIcon size={9} className="shrink-0 opacity-70" />
                    <span className="truncate font-mono">
                      {formatDisplaySlug(b.bannerSlug)}
                    </span>
                  </div>

                  {/* Action Buttons: Clean borderless icons */}
                  <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleShow(b)}
                      disabled={togglingId === b._id}
                      title={b.isShow ? "Hide banner" : "Show banner"}
                      className={`p-1 sm:p-1.5 rounded-md transition-colors cursor-pointer ${
                        b.isShow
                          ? "text-emerald-500 hover:bg-emerald-500/10"
                          : "text-rose-500 hover:bg-rose-500/10"
                      }`}
                    >
                      {togglingId === b._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : b.isShow ? (
                        <Eye size={12} />
                      ) : (
                        <EyeOff size={12} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(b)}
                      title="Edit banner"
                      className="p-1 sm:p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                    >
                      <Edit3 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {banners.length === 0 && (
            <div className="col-span-full py-10 text-center text-xs text-[var(--muted)] bg-[var(--card)]/30 rounded-xl border border-[var(--border)] border-dashed">
              No banners found. Click &quot;Add Banner&quot; above to create your first slide.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BannerCardImage({ src, alt }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col items-center justify-center p-3 text-center">
        <ImageIcon size={22} className="text-white/20 mb-1" />
        <span className="text-[10px] font-bold text-white/40 truncate max-w-[85%]">
          {alt || "No Banner Image"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Banner"}
      onError={() => setError(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}
