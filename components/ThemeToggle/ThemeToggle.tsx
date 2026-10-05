"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiSun, FiZap, FiCommand, FiHeart } from "react-icons/fi";

const themes = [
  { id: "dark", icon: <FiMoon />, label: "Dark OLED", color: "#38bdf8" },
  { id: "light", icon: <FiSun />, label: "Light Minimal", color: "#2563eb" },
  { id: "cyber", icon: <FiZap />, label: "Cyberpunk", color: "#00ffff" },
  { id: "crimson", icon: <FiCommand />, label: "Crimson Red", color: "#ef4444" },
  { id: "sakura", icon: <FiHeart />, label: "Sakura Pastel", color: "#ec4899" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const valid = themes.some((t) => t.id === stored);
    const active = valid && stored ? stored : "dark";
    setTheme(active);
    document.documentElement.setAttribute("data-theme", active);
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
    <button
      onClick={cycleTheme}
      className="relative w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--card)] transition-colors backdrop-blur-sm cursor-pointer overflow-hidden"
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
    </button>
  );
}

