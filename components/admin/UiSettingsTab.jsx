"use client";

import { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle, FiCheckCircle, FiSliders, FiRefreshCw } from "react-icons/fi";
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
        // Only set values that exist, otherwise fallback to defaults (true)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--muted)] text-sm font-medium animate-pulse">Loading UI Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">UI Settings</h2>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2.5">
            <FiSliders size={14} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--muted)]">
              {Object.keys(config).length} Controls
            </span>
          </div>
          <button
            onClick={fetchSettings}
            className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none"
          >
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Story Slider Toggle */}
        <div className="flex items-center justify-between p-4 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
          <div>
            <p className="font-bold text-sm text-[var(--foreground)]">Story Bubbles</p>
            <p className="text-xs text-[var(--muted)] mt-0.5 max-w-[250px] sm:max-w-md">Show or hide the top story bubbles on the homepage.</p>
          </div>
          <button
            onClick={() => setConfig(prev => ({ ...prev, showStorySlider: !prev.showStorySlider }))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.showStorySlider ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${config.showStorySlider ? "translate-x-6" : "bg-white"}`} />
          </button>
        </div>

        {/* Bottom Nav Toggle */}
        <div className="flex items-center justify-between p-4 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
          <div>
            <p className="font-bold text-sm text-[var(--foreground)]">Mobile Bottom Bar</p>
            <p className="text-xs text-[var(--muted)] mt-0.5 max-w-[250px] sm:max-w-md">Show or hide the bottom navigation menu on mobile phones.</p>
          </div>
          <button
            onClick={() => setConfig(prev => ({ ...prev, showBottomNav: !prev.showBottomNav }))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.showBottomNav ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${config.showBottomNav ? "translate-x-6" : "bg-white"}`} />
          </button>
        </div>

        {/* WhatsApp Popup Toggle */}
        <div className="flex items-center justify-between p-4 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
          <div>
            <p className="font-bold text-sm text-[var(--foreground)]">WhatsApp Chat Button</p>
            <p className="text-xs text-[var(--muted)] mt-0.5 max-w-[250px] sm:max-w-md">Show or hide the floating WhatsApp chat icon at the bottom right.</p>
          </div>
          <button
            onClick={() => setConfig(prev => ({ ...prev, showWhatsAppPopup: !prev.showWhatsAppPopup }))}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.showWhatsAppPopup ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${config.showWhatsAppPopup ? "translate-x-6" : "bg-white"}`} />
          </button>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-xl hover:brightness-105 active:scale-95 transition-all shadow-md shadow-[var(--accent)]/15"
        >
          {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave size={15} />}
          Save Design Settings
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
