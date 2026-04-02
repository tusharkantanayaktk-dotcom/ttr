"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaGamepad } from "react-icons/fa6";
import {
  FiInstagram,
  FiMessageSquare,
  FiHome,
  FiGlobe,
  FiInfo,
  FiLock,
  FiFileText,
  FiMail,
  FiShield,
  FiZap,
  FiClock,
} from "react-icons/fi";

/* ===================== ENV & CONSTANTS ===================== */

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "MewJi";
const BRAND_DESCRIPTION = process.env.NEXT_PUBLIC_BRAND_DESCRIPTION || "Fast and secure gaming top-ups.";

const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL;

const MADE_BY_NAME = "TK";
const MADE_BY_URL = "https://wa.me/9178521537";
const COPYRIGHT_NAME = "TRONICS STORE";

const FOOTER_LINKS = [
  {
    title: "Links",
    links: [
      { label: "Home", href: "/", icon: FiHome },
      { label: "Region", href: "/region", icon: FiGlobe },
      { label: "Games", href: "/games", icon: FaGamepad },
      { label: "About", href: "/about", icon: FiInfo },
    ],
  },
  {
    title: "Support",
    links: [

      { label: "Privacy", href: "/privacy-policy", icon: FiLock },
      { label: "Terms", href: "/terms-and-conditions", icon: FiFileText },
      { label: "Refund", href: "/refund-policy", icon: FiShield },
      { label: "Contact", href: "/contact", icon: FiMail },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: FiInstagram },
  { label: "WhatsApp", href: WHATSAPP_URL, icon: FiMessageSquare },
];

const TRUST_BADGES = [
  { icon: FiShield, label: "SECURE", desc: "Military Grade" },
  { icon: FiZap, label: "INSTANT", desc: "Auto-Delivery" },
  { icon: FiClock, label: "24/7", desc: "Support Link" },
];

/* ===================== COMPONENT ===================== */

export default function Footer() {
  return (
    <footer className="relative bg-[var(--background)] border-t border-[var(--border)] pt-16 pb-24 lg:pb-12 overflow-hidden">
      {/* --- PREMIUM BACKGROUND DECOR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `radial-gradient(var(--muted) 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--accent)] opacity-[0.04] blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--accent)] opacity-[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* --- TOP SECTION: BRAND & TRUST --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <Link href="/" className="inline-block group">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-br from-[var(--accent)] via-[var(--foreground)] to-[var(--accent)] bg-clip-text text-transparent drop-shadow-sm transition-all duration-500 group-hover:scale-[1.02] origin-left">
                  {BRAND_NAME}
                </h2>
              </Link>
              <p className="text-xs md:text-sm text-[var(--muted)] font-medium max-w-sm leading-relaxed opacity-80">
                {BRAND_DESCRIPTION}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-sm hover:shadow-[0_10px_20px_-5px_var(--accent)]/30"
                  title={label}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Columns: Links & Trust */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-5">
                <div className="flex items-center gap-2">
                   <div className="w-1 h-3 rounded-full bg-[var(--accent)] opacity-40" />
                   <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] opacity-60">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-300 group py-0.5"
                      >
                        <span className="w-0 group-hover:w-3 h-[2px] bg-[var(--accent)] rounded-full transition-all mr-0 group-hover:mr-2" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Premium Trust Cards */}
            <div className="hidden sm:block space-y-5">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-3 rounded-full bg-[var(--accent)] opacity-40" />
                 <h3 className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] opacity-60">
                  Trust
                </h3>
              </div>
              <div className="space-y-2.5">
                {TRUST_BADGES.map((badge, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--card)]/50 border border-[var(--border)]/60 hover:border-[var(--accent)]/30 hover:bg-[var(--card)] transition-all duration-300 group/badge cursor-default">
                    <badge.icon size={13} className="text-[var(--accent)] group-hover/badge:scale-110 transition-transform" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-[var(--foreground)] tracking-wide uppercase">{badge.label}</span>
                      <span className="text-[8px] font-bold text-[var(--muted)] opacity-50 uppercase tracking-tighter">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: INFO & MADE BY --- */}
        <div className="pt-8 border-t border-[var(--border)]/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
            <span className="opacity-60">&copy; {new Date().getFullYear()} {COPYRIGHT_NAME}</span>
            <div className="hidden md:block w-1 h-1 rounded-full bg-[var(--border)]" />
            <span className="hidden md:inline opacity-60">All Rights Reserved</span>
          </div>

          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
            <span className="opacity-50">ENGINEERED BY</span>
            <a
              href={MADE_BY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 font-black transition-all border-b-2 border-red-500/20 hover:border-red-500 italic px-1 hover:-translate-y-0.5"
            >
              {MADE_BY_NAME}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
