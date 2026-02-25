"use client";

import { useState, useEffect } from "react";
import { FiSettings, FiAlertTriangle, FiCheckCircle, FiSave, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsTab() {
    const [settings, setSettings] = useState({
        MAINTENANCE_MODE: false,
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

    const handleToggle = (key) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const saveSettings = async () => {
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
                setMessage({ type: "success", text: "Settings updated successfully!" });
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
                <p className="text-[var(--muted)] text-sm font-medium animate-pulse">Loading System Configurations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FiSettings className="text-[var(--accent)]" />
                    System Settings
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                    Configure global application behavior and maintenance controls.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Maintenance Mode Card */}
                <div className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500 p-6
          ${settings.MAINTENANCE_MODE
                        ? "bg-amber-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                        : "bg-[var(--background)]/50 border-[var(--border)]"}
        `}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                ${settings.MAINTENANCE_MODE ? "bg-amber-500 text-black" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"}
              `}>
                                <FiActivity size={24} className={settings.MAINTENANCE_MODE ? "animate-pulse" : ""} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Maintenance Mode</h3>
                                <p className="text-sm text-[var(--muted)] max-w-md mt-1 leading-relaxed">
                                    When enabled, all public pages will redirect to a maintenance screen.
                                    Only authorized admins can still access the platform.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`text-xs font-bold uppercase tracking-widest ${settings.MAINTENANCE_MODE ? "text-amber-500" : "text-[var(--muted)]"}`}>
                                {settings.MAINTENANCE_MODE ? "Active" : "Inactive"}
                            </span>

                            <button
                                onClick={() => handleToggle("MAINTENANCE_MODE")}
                                className={`
                  relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none
                  ${settings.MAINTENANCE_MODE ? "bg-amber-500" : "bg-gray-700"}
                `}
                            >
                                <div className={`
                  absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
                  ${settings.MAINTENANCE_MODE ? "left-8" : "left-1"}
                `} />
                            </button>
                        </div>
                    </div>

                    {settings.MAINTENANCE_MODE && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium"
                        >
                            <FiAlertTriangle className="shrink-0 text-base" />
                            <span>Warning: Enabling maintenance mode will disrupt service for all regular users. Use with caution.</span>
                        </motion.div>
                    )}
                </div>

                {/* More settings can be added here */}
            </div>

            {/* Save Button */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                    <div className="h-10">
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

                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="
                    flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--accent)] text-black 
                    font-bold hover:brightness-110 active:scale-95 transition-all
                    disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]
                "
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <FiSave />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
