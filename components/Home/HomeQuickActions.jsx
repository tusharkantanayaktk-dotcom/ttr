"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  Trophy,
  ShieldCheck,
  Gamepad2,
  Layers,
} from "lucide-react";

const QUICK_ACTIONS = [
  { href: "/region", icon: Globe, label: "Region", glow: "rgba(59, 130, 246, 0.2)" },
  { href: "/services", icon: Layers, label: "Services", glow: "rgba(16, 185, 129, 0.2)" },
  { href: "/games", icon: Gamepad2, label: "Games", glow: "rgba(245, 158, 11, 0.2)" },
  { href: "/games/membership/silver-membership", icon: ShieldCheck, label: "Member", glow: "rgba(139, 92, 246, 0.2)" },
  { href: "/leaderboard", icon: Trophy, label: "Leader", glow: "rgba(239, 68, 68, 0.2)" },
];

export default function HomeQuickActions() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  return (
    <section className="w-full px-4 py-8 md:py-12 select-none">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-5 gap-4 md:gap-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {QUICK_ACTIONS.map((action, idx) => (
            <QuickItem
              key={idx}
              {...action}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function QuickItem({ href, icon: Icon, label, glow }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex-1"
    >
      <Link
        href={href}
        className="flex flex-col items-center gap-3 group"
      >
        <div className="relative">
          {/* SOFT AMBIENT GLOW */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-2xl scale-150 pointer-events-none"
            style={{ backgroundColor: glow }}
          />

          <div className="
            relative h-12 w-12 md:h-16 md:w-16 flex items-center justify-center 
            rounded-2xl md:rounded-[1.5rem] 
            bg-[var(--card)] border border-[var(--border)]/30 backdrop-blur-xl 
            transition-all duration-500 overflow-hidden
            group-hover:border-[var(--accent)]/40 group-hover:bg-[var(--accent)]/5 
            shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 block
          ">
            {/* REFRACTION EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <Icon
              size={24}
              className="text-[var(--foreground)] opacity-60 group-hover:text-[var(--accent)] group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"
            />

            {/* SUBTLE CORNER ACCENT */}
            <div className="absolute top-0 right-0 p-[1px]">
              <div className="w-2 h-2 border-t border-r border-[var(--accent)]/0 group-hover:border-[var(--accent)]/40 transition-all rounded-tr-[4px]" />
            </div>
          </div>
        </div>

        <span className="
          text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] 
          text-[var(--muted)] group-hover:text-[var(--foreground)] 
          transition-colors duration-300 text-center truncate w-full
        ">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
