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
  {
    href: "/region",
    icon: Globe,
    label: "Region",
    color: "#3b82f6", // Blue
    bg: "rgba(59, 130, 246, 0.1)"
  },
  {
    href: "/services",
    icon: Layers,
    label: "Services",
    color: "#10b981", // Green
    bg: "rgba(16, 185, 129, 0.1)"
  },
  {
    href: "/games",
    icon: Gamepad2,
    label: "Games",
    color: "#f59e0b", // Amber
    bg: "rgba(245, 158, 11, 0.1)"
  },
  {
    href: "/games/membership/silver-membership",
    icon: ShieldCheck,
    label: "Member",
    color: "#8b5cf6", // Violet
    bg: "rgba(139, 92, 246, 0.1)"
  },
  {
    href: "/leaderboard",
    icon: Trophy,
    label: "Leader",
    color: "#ef4444", // Red
    bg: "rgba(239, 68, 68, 0.1)"
  },
];

export default function HomeQuickActions() {
  return (
    <section className="w-full px-4 py-8 md:py-16 select-none bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-5 md:flex md:flex-wrap md:justify-center gap-2 sm:gap-6 md:gap-16">
          {QUICK_ACTIONS.map((action, idx) => (
            <QuickItem
              key={idx}
              {...action}
              delay={idx * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickItem({ href, icon: Icon, label, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay
      }}
      className="flex-1"
    >
      <Link
        href={href}
        className="flex flex-col items-center gap-4 group"
      >
        <div className="relative">
          {/* DYNAMIC VIBRANT GLOW */}
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl scale-125 pointer-events-none"
            style={{ backgroundColor: color }}
          />

          <div
            className="
              relative h-12 w-12 md:h-20 md:w-20 flex items-center justify-center 
              rounded-2xl md:rounded-[2rem] 
              bg-card border border-foreground/[0.05] backdrop-blur-xl 
              transition-all duration-500 overflow-hidden
              group-hover:border-transparent group-hover:bg-white
              shadow-lg group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] group-hover:-translate-y-2
            "
            style={{
              color: color,
            }}
          >
            {/* HOVER COLOR OVERLAY */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundColor: bg }}
            />

            {/* REFRACTION SHINE */}
            <div className="absolute inset-x-0 h-1/2 top-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            <Icon
              size={28}
              strokeWidth={2.5}
              className="relative z-10 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6 sm:size-32" style={{ width: 'unset', height: 'unset' }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="
            text-[10px] md:text-xs font-black italic uppercase tracking-[0.2em] 
            text-muted group-hover:text-foreground 
            transition-colors duration-300 text-center truncate w-full
          ">
            {label}
          </span>
          <div
            className="h-1 w-0 group-hover:w-4 transition-all duration-300 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
