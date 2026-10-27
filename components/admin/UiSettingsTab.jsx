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
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UiSettingsTab() {
  const [config, setConfig] = useState({
    showStorySlider: true,
    showBottomNav: true,
    showWhatsAppPopup: true,
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
        });
      }
    } catch (err) {
      console.error("Failed to fetch UI settings", err);
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
        body: JSON.stringify({ settings: { UI_SETTINGS_CONFIG: config } }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "UI Settings updated successfully!" });
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

  const settingsList = [
    {
      key: "showStorySlider",
      title: "Story Bubbles",
      desc: "Show or hide the top story bubbles on the homepage.",
      icon: <Sparkles size={16} className="text-[var(--accent)] shrink-0" />,
    },
    {
      key: "showBottomNav",
      title: "Mobile Bottom Bar",
      desc: "Show or hide the bottom navigation menu on mobile phones.",
      icon: <Smartphone size={16} className="text-[var(--accent)] shrink-0" />,
    },
    {
      key: "showWhatsAppPopup",
      title: "WhatsApp Chat Button",
      desc: "Show or hide the floating WhatsApp chat icon at the bottom right.",
      icon: <MessageCircle size={16} className="text-[var(--accent)] shrink-0" />,
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

  return (
    <div className="max-w-2xl space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">UI Settings</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <Sliders size={13} className="text-[var(--accent)]" />
            <span>{settingsList.length} Controls</span>
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

      {/* ================= CONTROLS LIST ================= */}
      <div className="space-y-2.5">
        {settingsList.map((item) => {
          const isActive = Boolean(config[item.key]);
          return (
            <div
              key={item.key}
              onClick={() => setConfig((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
              className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)] rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {item.icon}
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]/80 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
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
          );
        })}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-extrabold uppercase tracking-wider text-xs py-3 rounded-xl hover:brightness-105 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? "Saving Changes..." : "Save Design Settings"}</span>
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
