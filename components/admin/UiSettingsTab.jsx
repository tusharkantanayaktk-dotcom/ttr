"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  RefreshCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  MessageCircle,
  Users,
  Loader2,
  Eye,
  LayoutTemplate
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UiSettingsTab() {
  const [config, setConfig] = useState({
    showStorySlider: true,
    showBottomNav: true,
    showWhatsAppPopup: true,
    showCommunityPopup: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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
      if (data.success && data.data.UI_SETTINGS_CONFIG) {
        setConfig({
          showStorySlider: data.data.UI_SETTINGS_CONFIG.showStorySlider ?? true,
          showBottomNav: data.data.UI_SETTINGS_CONFIG.showBottomNav ?? true,
          showWhatsAppPopup: data.data.UI_SETTINGS_CONFIG.showWhatsAppPopup ?? true,
          showCommunityPopup: data.data.UI_SETTINGS_CONFIG.showCommunityPopup ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch UI settings", err);
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
        body: JSON.stringify({ settings: { UI_SETTINGS_CONFIG: config } }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Themes & Design settings updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong while saving" });
    } finally {
      setSaving(false);
    }
  };

  const settingsList = [
    {
      key: "showStorySlider",
      title: "Story Bubbles",
      desc: "Show or hide top story bubbles highlighting games and events on the storefront.",
      icon: <Sparkles size={18} className="text-amber-400 shrink-0" />,
      badge: "Homepage",
    },
    {
      key: "showBottomNav",
      title: "Mobile Bottom Bar",
      desc: "Fixed navigation bar dock displayed at the bottom on mobile devices.",
      icon: <Smartphone size={18} className="text-[var(--accent)] shrink-0" />,
      badge: "Mobile UI",
    },
    {
      key: "showWhatsAppPopup",
      title: "WhatsApp Chat Floating Pill",
      desc: "Floating customer chat icon hovering at the bottom right of the screen.",
      icon: <MessageCircle size={18} className="text-emerald-400 shrink-0" />,
      badge: "Support",
    },
    {
      key: "showCommunityPopup",
      title: "Community Modal Popup",
      desc: "Modal dialogue inviting first-time store visitors to join the official WhatsApp channel.",
      icon: <Users size={18} className="text-sky-400 shrink-0" />,
      badge: "Marketing",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">Loading UI Settings...</p>
      </div>
    );
  }

  const enabledCount = Object.values(config).filter(Boolean).length;

  return (
    <div className="w-full space-y-5 pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Sliders size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              Themes &amp; Design Settings
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Control the visibility of storefront UI components, mobile bottom dock, and community popups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--muted)]">
            <Eye size={13} className="text-[var(--accent)]" />
            <span>{enabledCount} of {settingsList.length} Active</span>
          </div>

          <button
            type="button"
            onClick={fetchSettings}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
            title="Refresh"
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

      {/* ================= 2-COLUMN GRID FOR CONTROLS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsList.map((item) => {
          const isActive = Boolean(config[item.key]);
          return (
            <div
              key={item.key}
              onClick={() => setConfig((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 group shadow-sm ${
                isActive
                  ? "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/50"
                  : "bg-[var(--card)]/40 border-[var(--border)]/60 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--background)] border border-[var(--border)] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* iOS-Style Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfig((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ${
                    isActive ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/15"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-auto ${
                      isActive ? "translate-x-5.5 ml-0" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
