"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaGamepad } from "react-icons/fa6";
import {
  FiInstagram,
  FiMessageSquare,
  FiYoutube,
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
const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL;

const MADE_BY_NAME = "TK";
const MADE_BY_URL = "https://wa.me/9178521537";
const COPYRIGHT_NAME = "TK";

const FOOTER_LINKS = [
  {
    title: "Links",
    links: [
      { label: "Home", href: "/", icon: FiHome },
      { label: "Region", href: "/region", icon: FiGlobe },
      { label: "Games", href: "/games", icon: FaGamepad },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About", href: "/about", icon: FiInfo },
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
  { label: "YouTube", href: YOUTUBE_URL, icon: FiYoutube },
];

const TRUST_BADGES = [
  { icon: FiShield, label: "SECURE", desc: "Military Grade" },
  { icon: FiZap, label: "INSTANT", desc: "Auto-Delivery" },
  { icon: FiClock, label: "24/7", desc: "Support Link" },
];

/* ===================== COMPONENT ===================== */

export default function Footer() {
  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)] pt-12 pb-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* --- TOP ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">

          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-block group">
              <h2 className="text-2xl font-bold tracking-tighter">
                <span className="text-[var(--accent)]">{BRAND_NAME.slice(0, 4)}</span>
                <span className="text-[var(--foreground)]">{BRAND_NAME.slice(4)}</span>
              </h2>
            </Link>

            <p className="text-[var(--muted)] text-xs font-medium opacity-80 max-w-xs">
              {BRAND_DESCRIPTION}
            </p>

            {/* TRUST BADGES - ONE LINE */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
              {TRUST_BADGES.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--card)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
                    <badge.icon size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-widest text-[var(--foreground)] leading-none">{badge.label}</p>
                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase opacity-50 mt-1">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] opacity-40">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-all group"
                      >
                        <span className="w-0 group-hover:w-2 h-px bg-[var(--accent)] transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* SOCIALS */}
          <div className="lg:col-span-3">
            <h3 className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-[0.2em] opacity-40 mb-4">
              Community
            </h3>
            <div className="flex gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all"
                  title={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
            <span>&copy; {new Date().getFullYear()} {COPYRIGHT_NAME} SYSTEM</span>
            <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--accent)]/5 text-[var(--accent)]">
              Operational <div className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
            <span>By</span>
            <a
              href={MADE_BY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)] border-b border-[var(--accent)]/20"
            >
              {MADE_BY_NAME}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
