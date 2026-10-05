"use client";

import { useState, useEffect } from "react";
import { FiSettings, FiAlertTriangle, FiCheckCircle, FiActivity, FiRefreshCw } from "react-icons/fi";
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
                setSettings(prev => ({ ...prev, ...data.data }));
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
                // Revert state on failure
                setSettings(settings);
                setMessage({ type: "error", text: data.message || "Failed to update settings" });
            }
        } catch (err) {
            // Revert state on error
            setSettings(settings);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--muted)] text-sm font-medium animate-pulse">Loading settings...</p>
            </div>
        );
    }

    return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Store Settings</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Manage store availability and order acceptance</p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none"
          title="Refresh Settings"
        >
          <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="space-y-3">
        {/* Maintenance Mode */}
        <div className={`p-4 bg-[var(--foreground)]/[0.02] border rounded-xl transition-colors ${settings.MAINTENANCE_MODE ? "border-amber-500/40 bg-amber-500/[0.03]" : "border-[var(--border)]"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${settings.MAINTENANCE_MODE ? "bg-amber-500/15 border-amber-500/30 text-amber-500" : "bg-[var(--foreground)]/[0.04] border-[var(--border)] text-[var(--muted)]"}`}>
                <FiActivity size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[var(--foreground)]">Maintenance Mode</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Close website for visitors. Only administrators can access.</p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("MAINTENANCE_MODE")}
              disabled={saving}
              className={`relative w-12 h-6 shrink-0 rounded-full transition-colors ${
                settings.MAINTENANCE_MODE ? "bg-amber-500" : "bg-[var(--foreground)]/20"
              } ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${
                  settings.MAINTENANCE_MODE ? "translate-x-6 bg-black" : "bg-white"
                }`}
              />
            </button>
          </div>

          {settings.MAINTENANCE_MODE && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-xs text-amber-500">
              <FiAlertTriangle className="shrink-0" size={13} />
              <span>Active: Visitors cannot view products or place orders.</span>
            </div>
          )}
        </div>

        {/* Pause Orders */}
        <div className={`p-4 bg-[var(--foreground)]/[0.02] border rounded-xl transition-colors ${settings.STOP_ACCEPTING_ORDERS ? "border-amber-500/40 bg-amber-500/[0.03]" : "border-[var(--border)]"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${settings.STOP_ACCEPTING_ORDERS ? "bg-amber-500/15 border-amber-500/30 text-amber-500" : "bg-[var(--foreground)]/[0.04] border-[var(--border)] text-[var(--muted)]"}`}>
                <FiAlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[var(--foreground)]">Pause New Orders</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Temporarily stop accepting checkout orders if servers or providers are busy.</p>
              </div>
            </div>

            <button
              onClick={() => handleToggle("STOP_ACCEPTING_ORDERS")}
              disabled={saving}
              className={`relative w-12 h-6 shrink-0 rounded-full transition-colors ${
                settings.STOP_ACCEPTING_ORDERS ? "bg-amber-500" : "bg-[var(--foreground)]/20"
              } ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${
                  settings.STOP_ACCEPTING_ORDERS ? "translate-x-6 bg-black" : "bg-white"
                }`}
              />
            </button>
          </div>

          {settings.STOP_ACCEPTING_ORDERS && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-xs text-amber-500">
              <FiAlertTriangle className="shrink-0" size={13} />
              <span>Active: Customer checkouts and order placements are currently paused.</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Feedback */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 text-xs font-semibold p-3 rounded-lg border ${
              message.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}
          >
            {message.type === "success" ? <FiCheckCircle size={14} /> : <FiAlertTriangle size={14} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
