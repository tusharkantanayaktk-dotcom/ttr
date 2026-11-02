"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Sliders,
  Loader2,
  ShieldAlert,
  Power,
  Store,
  Check
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
        setMessage({
          type: "success",
          text: `${key.replace(/_/g, " ")} is now ${newValue ? "ENABLED" : "DISABLED"}!`,
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3500);
      } else {
        setSettings(settings);
        setMessage({ type: "error", text: data.message || "Failed to update settings" });
      }
    } catch (err) {
      setSettings(settings);
      setMessage({ type: "error", text: "Something went wrong while updating setting" });
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

  const isAllNormal = !settings.MAINTENANCE_MODE && !settings.STOP_ACCEPTING_ORDERS;

  return (
    <div className="w-full space-y-5 pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Store size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              Store Availability &amp; Emergency Controls
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Manage store availability, emergency maintenance lockdown, and instant order pause controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isAllNormal
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAllNormal ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAllNormal ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span>{isAllNormal ? "Store Open (Normal)" : "Alerts Active"}</span>
          </div>

          <button
            onClick={fetchSettings}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all cursor-pointer"
            title="Refresh Settings"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
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
              <AlertTriangle size={16} className="shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 2-COLUMN CONTROLS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maintenance Mode */}
        <div
          onClick={() => handleToggle("MAINTENANCE_MODE")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 group shadow-sm ${
            settings.MAINTENANCE_MODE
              ? "bg-amber-500/[0.06] border-amber-500/40 shadow-amber-500/5"
              : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border transition-colors ${
                  settings.MAINTENANCE_MODE
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                    : "bg-[var(--background)] border-[var(--border)] text-[var(--accent)] group-hover:scale-105"
                }`}
              >
                <Power size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  Maintenance Downtime
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    settings.MAINTENANCE_MODE ? "text-amber-400" : "text-[var(--muted)]"
                  }`}
                >
                  {settings.MAINTENANCE_MODE ? "SITE CLOSED" : "SITE ONLINE"}
                </span>
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
                  settings.MAINTENANCE_MODE ? "translate-x-5.5 ml-0" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Close the storefront for visitors with a maintenance splash screen. Logged-in owners can still view and manage the panel.
          </p>

          {settings.MAINTENANCE_MODE && (
            <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2 text-xs font-semibold text-amber-400">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Public access is blocked. Only admins can bypass.</span>
            </div>
          )}
        </div>

        {/* Pause Orders */}
        <div
          onClick={() => handleToggle("STOP_ACCEPTING_ORDERS")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 group shadow-sm ${
            settings.STOP_ACCEPTING_ORDERS
              ? "bg-rose-500/[0.06] border-rose-500/40 shadow-rose-500/5"
              : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border transition-colors ${
                  settings.STOP_ACCEPTING_ORDERS
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-400"
                    : "bg-[var(--background)] border-[var(--border)] text-[var(--accent)] group-hover:scale-105"
                }`}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  Pause Checkout &amp; Orders
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    settings.STOP_ACCEPTING_ORDERS ? "text-rose-400" : "text-[var(--muted)]"
                  }`}
                >
                  {settings.STOP_ACCEPTING_ORDERS ? "CHECKOUTS PAUSED" : "ACCEPTING ORDERS"}
                </span>
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
                settings.STOP_ACCEPTING_ORDERS ? "bg-rose-500" : "bg-[var(--foreground)]/15"
              } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-auto ${
                  settings.STOP_ACCEPTING_ORDERS ? "translate-x-5.5 ml-0" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Temporarily pause customer checkouts if publisher APIs or payment gateways are undergoing maintenance. Browsing stays enabled.
          </p>

          {settings.STOP_ACCEPTING_ORDERS && (
            <div className="pt-2 border-t border-rose-500/20 flex items-center gap-2 text-xs font-semibold text-rose-400">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Checkout button displays "Orders temporarily paused".</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
