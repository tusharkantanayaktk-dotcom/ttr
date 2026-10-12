"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const active = stored === "light" ? "light" : "dark";
    setTheme(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-8 h-8 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--card)] transition-colors backdrop-blur-sm cursor-pointer overflow-hidden"
      title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
      aria-label={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-sm flex items-center justify-center"
          style={{ color: theme === "dark" ? "#38bdf8" : "#2563eb" }}
        >
          {theme === "dark" ? <FiMoon /> : <FiSun />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
