"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "@/public/logo.png";
import { FaGamepad } from "react-icons/fa6";
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
    <footer className="relative bg-[var(--background)] border-t border-[var(--border)] pt-6 pb-20 lg:pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* --- TOP SECTION: BRAND & LINKS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-5">

          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-3">
            <div className="space-y-1.5">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <Image
                  src={logo}
                  alt={BRAND_NAME}
                  width={28}
                  height={28}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
                />
                <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">
                  {BRAND_NAME}
                </h2>
              </Link>
              <p className="text-xs text-[var(--muted)] font-medium max-w-sm leading-relaxed">
                {BRAND_DESCRIPTION}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:text-black hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-sm"
                  title={label}
                >
                  <Icon size={14} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Columns: Links & Trust */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-3 rounded-full bg-[var(--accent)]" />
                  <h3 className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Premium Trust Cards */}
            <div className="hidden sm:block space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-3 rounded-full bg-[var(--accent)]" />
                <h3 className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">
                  Trust
                </h3>
              </div>
              <div className="space-y-1.5">
                {TRUST_BADGES.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] transition-colors group/badge cursor-default">
                    <badge.icon size={13} className="text-[var(--accent)] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[var(--foreground)] tracking-wide uppercase">{badge.label}</span>
                      <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-tight">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: INFO --- */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] sm:text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
            <span>&copy; {new Date().getFullYear()} {COPYRIGHT_NAME}</span>
            <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span>All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
