"use client";

import { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
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
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          🎨 UI Settings
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Globally toggle the visibility of specific UI components across the platform.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6 p-6 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl">
          
          {/* Story Slider Toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <div>
              <p className="font-bold text-sm">Show Story Slider</p>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-[250px] sm:max-w-md">Displays the Instagram-style rounded bubbles on the homepage (Live, Top, Hot, Best).</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, showStorySlider: !prev.showStorySlider }))}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.showStorySlider ? "bg-amber-500" : "bg-gray-700"}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${config.showStorySlider ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {/* Bottom Nav Toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <div>
              <p className="font-bold text-sm">Show Bottom Navigation Bar</p>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-[250px] sm:max-w-md">Displays the fixed bottom menu (Home, Games, Orders, etc.) on mobile devices.</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, showBottomNav: !prev.showBottomNav }))}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.showBottomNav ? "bg-amber-500" : "bg-gray-700"}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${config.showBottomNav ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {/* WhatsApp Popup Toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
            <div>
              <p className="font-bold text-sm">Show WhatsApp / Social Popup</p>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-[250px] sm:max-w-md">Displays the floating chat widget on the bottom right of the screen.</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, showWhatsAppPopup: !prev.showWhatsAppPopup }))}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.showWhatsAppPopup ? "bg-amber-500" : "bg-gray-700"}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${config.showWhatsAppPopup ? "translate-x-6" : ""}`} />
            </button>
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            Save UI Settings
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
