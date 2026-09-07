"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiSun, FiActivity, FiDroplet, FiZap, FiTarget, FiCommand, FiGrid } from "react-icons/fi";

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

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === theme);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme.id);
    localStorage.setItem("theme", nextTheme.id);
    document.documentElement.setAttribute("data-theme", nextTheme.id);
  };

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <motion.button
      onClick={cycleTheme}
      className="relative w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--card)] transition-all backdrop-blur-sm cursor-pointer overflow-hidden"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      title={`Theme: ${currentTheme.label} (Click to switch)`}
      aria-label={`Current theme: ${currentTheme.label}. Click to switch theme.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentTheme.id}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-sm flex items-center justify-center"
          style={{ color: currentTheme.color }}
        >
          {currentTheme.icon}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

