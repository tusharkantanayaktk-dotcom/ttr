"use client";

import { useState, useEffect } from "react";
import { FiSave, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function SeoTab() {
  const [settings, setSettings] = useState({
    SEO_TITLE: "",
    SEO_DESCRIPTION: "",
    SEO_KEYWORDS: [],
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
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
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
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "SEO Settings updated successfully!" });
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

  const addKeyword = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const kw = keywordInput.trim();
      if (kw && settings.SEO_KEYWORDS.length < 20 && !settings.SEO_KEYWORDS.includes(kw)) {
        setSettings(prev => ({
          ...prev,
          SEO_KEYWORDS: [...prev.SEO_KEYWORDS, kw]
        }));
        setKeywordInput("");
      }
    }
  };

  const removeKeyword = (kw) => {
    setSettings(prev => ({
      ...prev,
      SEO_KEYWORDS: prev.SEO_KEYWORDS.filter(k => k !== kw)
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--muted)] text-sm font-medium animate-pulse">Loading SEO Configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          SEO Settings
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Configure title, description, and keywords for better search engine rankings. 
          Fallbacks will be used if fields are left empty.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4 p-3 sm:p-4 bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title</label>
            <input 
              type="text" 
              value={settings.SEO_TITLE}
              onChange={(e) => setSettings(prev => ({...prev, SEO_TITLE: e.target.value}))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              placeholder="e.g. Tronics Store - MLBB Diamond Top Up"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
            <textarea 
              value={settings.SEO_DESCRIPTION}
              onChange={(e) => setSettings(prev => ({...prev, SEO_DESCRIPTION: e.target.value}))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] min-h-[100px]"
              placeholder="e.g. Fast and secure top-up platform..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Keywords (Up to 20) - {settings.SEO_KEYWORDS.length}/20
            </label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                disabled={settings.SEO_KEYWORDS.length >= 20}
                className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
                placeholder="Type a keyword and press Enter"
              />
              <button 
                onClick={addKeyword}
                disabled={settings.SEO_KEYWORDS.length >= 20}
                className="px-4 py-2 bg-[var(--accent)] text-black font-bold rounded-lg text-sm disabled:opacity-50"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {settings.SEO_KEYWORDS.map(kw => (
                <div key={kw} className="bg-[var(--card)] border border-[var(--border)] px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  <span>{kw}</span>
                  <button onClick={() => removeKeyword(kw)} className="text-[var(--muted)] hover:text-red-500">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[var(--accent)] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FiSave />}
            Save SEO Settings
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
