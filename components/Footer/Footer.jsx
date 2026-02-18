"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
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
} from "react-icons/fi";

/* ===================== ENV ===================== */

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "MewJi";
const BRAND_DESCRIPTION =
  process.env.NEXT_PUBLIC_BRAND_DESCRIPTION ||
  "Fast, secure MLBB top-ups with instant delivery.";

const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL;
const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL;

const TRUSTPILOT_URL =
  process.env.NEXT_PUBLIC_TRUSTPILOT_URL ||
  "https://www.trustpilot.com/evaluate/meowjiofficial.com";

const MADE_BY_NAME = "TK";
const MADE_BY_URL = "https://wa.me/9178521537";
const COPYRIGHT_NAME = "TK";

/* ===================== DERIVED ===================== */

const BRAND = {
  primary: BRAND_NAME.slice(0, 4),
  secondary: BRAND_NAME.slice(4),
  description: BRAND_DESCRIPTION,
};

const FOOTER_LINKS = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/", icon: FiHome },
      { label: "Region", href: "/region", icon: FiGlobe },
      { label: "Games", href: "/games", icon: FaGamepad },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About Us", href: "/about", icon: FiInfo },
      { label: "Privacy Policy", href: "/privacy-policy", icon: FiLock },
      { label: "Terms & Conditions", href: "/terms-and-conditions", icon: FiFileText },
      { label: "Refund Policy", href: "/refund-policy", icon: FiShield },
      { label: "Contact Us", href: "/contact", icon: FiMail },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: FiInstagram },
  { label: "WhatsApp", href: WHATSAPP_URL, icon: FiMessageSquare },
  { label: "YouTube", href: YOUTUBE_URL, icon: FiYoutube },
];

/* ===================== COMPONENT ===================== */

export default function Footer() {
  const [accentColor, setAccentColor] = useState("#000000");

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    if (color) setAccentColor(color);
  }, []);

  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)] relative overflow-hidden">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--accent)]/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* BRAND BLOCK */}
          <div className="md:col-span-2 lg:col-span-2 space-y-3">
            <h2 className="text-xl font-bold tracking-tight">
              <span className="text-[var(--accent)]">{BRAND.primary}</span>
              <span className="text-[var(--foreground)]">{BRAND.secondary}</span>
            </h2>

            <p className="text-[var(--muted)] text-xs leading-relaxed max-w-xs">
              {BRAND.description}
            </p>

            {/* TRUSTPILOT QR */}
            <div className="flex items-center gap-3 mt-4">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-[var(--border)]">
                <QRCodeCanvas
                  value={TRUSTPILOT_URL}
                  size={48}
                  bgColor="#ffffff"
                  fgColor={accentColor}
                  level="H"
                />
              </div>
              <div className="flex flex-col text-[10px]">
                <span className="font-semibold text-[var(--foreground)]">Trustpilot</span>
                <span className="text-[var(--muted)]">Scan to review</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC SECTIONS - SIDE BY SIDE */}
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-1.5">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-all hover:translate-x-1 duration-200"
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* SOCIALS */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Follow Us
            </h3>
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="
                    w-8 h-8 flex items-center justify-center
                    rounded-lg bg-[var(--card)]
                    border border-[var(--border)]
                    text-[var(--muted)] hover:text-[var(--accent)]
                    hover:border-[var(--accent)] hover:scale-110
                    transition-all duration-300
                  "
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA BAR */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-[var(--muted)]">
          <div className="flex items-center gap-1 opacity-80 uppercase tracking-widest">
            <span>&copy; {new Date().getFullYear()} {COPYRIGHT_NAME}.</span>
          </div>

          <div className="flex items-center gap-1.5 group">
            <span>Made with</span>
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.4, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <FaHeart className="text-red-500" size={12} />
            </motion.span>
            <span>by</span>
            <a
              href={MADE_BY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] font-bold hover:underline tracking-widest uppercase bg-[var(--accent)]/10 px-2 py-0.5 rounded shadow-sm"
            >
              {MADE_BY_NAME}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
