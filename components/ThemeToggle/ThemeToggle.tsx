"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiMoon, FiSun, FiActivity, FiDroplet, FiZap, FiTarget, FiCommand, FiGrid } from "react-icons/fi";

const themes = [
  { id: "dark", icon: <FiMoon />, label: "Dark", color: "#9333ea" },
  { id: "light", icon: <FiSun />, label: "Light", color: "#f59e0b" },
  { id: "monochrome", icon: <FiGrid />, label: "OLED", color: "#ffffff" },
  { id: "cyber", icon: <FiZap />, label: "Cyber", color: "#00ffff" },
  { id: "sakura", icon: <FiActivity />, label: "Sakura", color: "#ff4d94" },
  { id: "violet", icon: <FiDroplet />, label: "Violet", color: "#a855f7" },
  { id: "midnight", icon: <FiActivity />, label: "Deepest", color: "#8b5cf6" },
  { id: "crimson", icon: <FiCommand />, label: "Crimson", color: "#dc2626" },
  { id: "mint", icon: <FiTarget />, label: "Neo Mint", color: "#10b981" },
  { id: "royal", icon: <FiActivity />, label: "Royal Gold", color: "#d4af37" },
  { id: "nordic", icon: <FiDroplet />, label: "Nordic", color: "#64748b" },
  { id: "mocha", icon: <FiActivity />, label: "Mocha", color: "#92400e" },
  { id: "candy", icon: <FiDroplet />, label: "Candy", color: "#ec4899" },
  { id: "ocean", icon: <FiGrid />, label: "Ocean", color: "#0ea5e9" },
  { id: "forest", icon: <FiTarget />, label: "Forest", color: "#22c55e" },
  { id: "tropical", icon: <FiDroplet />, label: "Teal", color: "#14b8a6" },
  { id: "retro", icon: <FiZap />, label: "Retro", color: "#ff006e" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--card)] transition-all backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-sm" style={{ color: currentTheme.color }}>{currentTheme.icon}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-[100] backdrop-blur-xl"
          >
            <div className="p-2 flex flex-col gap-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--muted)]">
                Select Theme
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  className={`
                    flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all
                    ${theme === t.id 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'hover:bg-[var(--accent)]/10 text-[var(--foreground)]'}
                  `}
                >
                  <span className="text-base" style={{ color: theme === t.id ? '#fff' : t.color }}>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

