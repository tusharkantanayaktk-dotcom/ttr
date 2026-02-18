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

export default function HomeQuickActions() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <section className="w-full px-2 py-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        {/* TOP ROW – 5 ITEMS */}
        <motion.div
          className="grid grid-cols-5 gap-0.5 md:gap-4 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          <QuickItem
            href="/region"
            icon={Globe}
            label="Region"
            variants={itemVariants}
          />
          <QuickItem
            href="/services"
            icon={Layers}
            label="Services"
            variants={itemVariants}
          />
          <QuickItem
            href="/games"
            icon={Gamepad2}
            label="Games"
            variants={itemVariants}
          />
          <QuickItem
            href="/games/membership/silver-membership"
            icon={ShieldCheck}
            label="Member"
            variants={itemVariants}
          />
          <QuickItem
            href="/leaderboard"
            icon={Trophy}
            label="Leader"
            variants={itemVariants}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ================= SUB COMPONENT ================= */

function QuickItem({
  href,
  icon: Icon,
  label,
  variants
}) {
  return (
    <motion.div variants={variants}>
      <Link
        href={href}
        className="flex flex-col items-center gap-1.5 md:gap-3 group px-0.5"
      >
        {/* Icon Container */}
        <div className="relative">
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-2xl bg-[var(--accent)] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 scale-125" />

          <div className="h-10 w-10 xs:h-12 xs:w-12 md:h-14 md:w-14 flex items-center justify-center rounded-2xl md:rounded-[1.25rem] 
                        bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)]/50
                        relative transition-all duration-500 
                        group-hover:border-[var(--accent)]/50 group-hover:bg-[var(--accent)]/10
                        group-hover:-translate-y-1 shadow-sm">
            <Icon className="h-5 w-5 md:h-7 md:w-7 text-[var(--accent)] transition-all duration-500 group-hover:scale-110" />

            {/* Corner Accent for premium feel */}
            <div className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-tr-[4px]" />
          </div>
        </div>

        {/* Label */}
        <span className="text-[9px] xs:text-[10px] md:text-[13px] font-bold text-center leading-tight 
                       text-[var(--foreground)]/80 transition-all duration-300 
                       group-hover:text-[var(--accent)] tracking-tighter sm:tracking-normal">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
