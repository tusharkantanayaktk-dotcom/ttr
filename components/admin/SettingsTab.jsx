"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Sliders,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    MAINTENANCE_MODE: false,
    STOP_ACCEPTING_ORDERS: false,
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
      if (data.success) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    if (saving) return;

    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);

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
        body: JSON.stringify({ settings: newSettings }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `${key.replace(/_/g, " ")} updated successfully!` });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setSettings(settings);
        setMessage({ type: "error", text: data.message || "Failed to update settings" });
      }
    } catch (err) {
      setSettings(settings);
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-[var(--muted)] text-xs font-semibold animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3.5 sm:space-y-4 pb-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Store Settings</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Manage store availability and order acceptance</p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all outline-none cursor-pointer"
          title="Refresh Settings"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="space-y-2.5">
        {/* Maintenance Mode */}
        <div
          onClick={() => handleToggle("MAINTENANCE_MODE")}
          className={`p-3 sm:p-3.5 bg-[var(--card)]/60 hover:bg-[var(--card)] border rounded-xl transition-all cursor-pointer group ${
            settings.MAINTENANCE_MODE ? "border-amber-500/40 bg-amber-500/[0.04]" : "border-[var(--border)]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Activity size={18} className={`shrink-0 transition-colors ${settings.MAINTENANCE_MODE ? "text-amber-500" : "text-[var(--accent)]"}`} />
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                  Maintenance Mode
                </p>
                <p className="text-[11px] text-[var(--muted)]/80 mt-0.5 leading-snug">
                  Close website for visitors. Only administrators can access.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.MAINTENANCE_MODE}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle("MAINTENANCE_MODE");
              }}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ${
                settings.MAINTENANCE_MODE ? "bg-amber-500" : "bg-[var(--foreground)]/15"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-auto ${
                  settings.MAINTENANCE_MODE ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {settings.MAINTENANCE_MODE && (
            <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex items-center gap-2 text-[11px] font-medium text-amber-500">
              <AlertTriangle className="shrink-0" size={13} />
              <span>Active: Visitors cannot view products or place orders.</span>
            </div>
          )}
        </div>

        {/* Pause Orders */}
        <div
          onClick={() => handleToggle("STOP_ACCEPTING_ORDERS")}
          className={`p-3 sm:p-3.5 bg-[var(--card)]/60 hover:bg-[var(--card)] border rounded-xl transition-all cursor-pointer group ${
            settings.STOP_ACCEPTING_ORDERS ? "border-amber-500/40 bg-amber-500/[0.04]" : "border-[var(--border)]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <AlertTriangle size={18} className={`shrink-0 transition-colors ${settings.STOP_ACCEPTING_ORDERS ? "text-amber-500" : "text-[var(--accent)]"}`} />
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                  Pause New Orders
                </p>
                <p className="text-[11px] text-[var(--muted)]/80 mt-0.5 leading-snug">
                  Temporarily stop accepting checkout orders if servers or providers are busy.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.STOP_ACCEPTING_ORDERS}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle("STOP_ACCEPTING_ORDERS");
              }}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ${
                settings.STOP_ACCEPTING_ORDERS ? "bg-amber-500" : "bg-[var(--foreground)]/15"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-auto ${
                  settings.STOP_ACCEPTING_ORDERS ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {settings.STOP_ACCEPTING_ORDERS && (
            <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex items-center gap-2 text-[11px] font-medium text-amber-500">
              <AlertTriangle className="shrink-0" size={13} />
              <span>Active: Customer checkouts and order placements are currently paused.</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Feedback */}
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
            {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
