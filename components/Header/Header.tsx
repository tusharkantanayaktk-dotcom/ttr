"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import {
  ShoppingBag,
  Trophy,
  Gamepad2,
  Globe,
  LayoutDashboard,
  Headphones,
  Crown,
  LogOut,
  X,
  Plus,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
const logo = "/logo.svg";
import Skeleton from "../Skeleton";
import PWAHeaderButton from "../PWA/PWAHeaderButton";
import SearchModal from "./SearchModal";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          if (data.user?.phone && !localStorage.getItem("phone")) {
            localStorage.setItem("phone", data.user.phone);
          }
        } else {
          localStorage.removeItem("token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("phone");
    localStorage.removeItem("email");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setUser(null);
    window.location.href = "/";
  };

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    let lastState = window.scrollY > 20;
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== lastState) {
        lastState = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= GLOBAL SEARCH SHORTCUT ================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    if (userMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [userMenuOpen]);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && userMenuOpen) {
        // We handle closure via backdrop or button, but keeping it for safety
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  /* ================= ANIMATION VARIANTS ================= */
  const headerVariants = {
    hidden: { y: -100 },
    visible: {
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={`fixed top-0 left-0 w-full ${userMenuOpen ? 'z-[1000]' : 'z-[80]'} transition-colors duration-500`}
      style={{
        backgroundColor: scrolled ? "var(--card)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      {/* Tactical Glow Line (only when scrolled) */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent z-10"
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 h-13 relative">

        {/* LOGO SECTION */}
        <div className="flex items-center">
          <Link href="/" className="relative flex items-center gap-2">
            <div className="relative z-10 flex items-center">
              <Image
                src={logo}
                alt="Tronics Logo"
                width={36}
                height={36}
                priority
                unoptimized
                className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(0,200,255,0.45)]"
              />
            </div>
          </Link>
        </div>

        {/* DESKTOP NAV - CENTERED */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {[
            { name: "Games", href: "/games", icon: Gamepad2 },
            { name: "Regions", href: "/region", icon: Globe }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--foreground)]"
            >
              <item.icon className="text-lg text-[var(--accent)]" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
          <ThemeToggle />

          <div className="h-6 w-[1px] bg-[var(--border)] mx-0.5 hidden sm:block" />

          {/* USER PROFILE / LOGIN */}
          <div className="relative mr-2">
            {loading ? (
              <Skeleton variant="circle" className="w-9 h-9 border-none" />
            ) : (
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                }}
                className={`
                  flex items-center justify-center w-9 h-9 rounded-full transition-colors
                  ${userMenuOpen ? 'ring-2 ring-[var(--accent)]' : ''}
                `}
              >
                <div className="w-full h-full rounded-full bg-[var(--accent)] flex items-center justify-center overflow-hidden">
                  {user?.avatar && !avatarError ? (
                    <img
                      src={user.avatar}
                      alt="User Avatar"
                      className="object-cover w-full h-full"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-white text-[12px] font-black uppercase">
                      {(user?.name || user?.username || user?.email || "U")[0]}
                    </span>
                  )}
                </div>
              </button>
            )}


            {/* USER SLIDER (SIDEBAR) */}
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  {/* Backdrop Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setUserMenuOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1000]"
                  />

                  {/* Sidebar Slider - Theme Adaptive (White for Light Theme, Dark for Dark Theme) */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 280 }}
                    style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                    className="fixed right-0 top-0 h-[100dvh] w-[88vw] max-w-[315px] bg-[var(--card)] text-[var(--foreground)] border-l border-[var(--border)] z-[1001] flex flex-col shadow-2xl"
                  >
                    {/* Top Header Bar */}
                    <div 
                      style={{ backgroundColor: "var(--card)" }}
                      className="px-3.5 py-2.5 flex items-center justify-between border-b border-[var(--border)] shrink-0 bg-[var(--card)]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Account</span>
                      </div>
                      <motion.button
                        onClick={() => setUserMenuOpen(false)}
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-6 h-6 rounded-md bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-all cursor-pointer"
                      >
                        <X size={14} />
                      </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-2.5 custom-scrollbar flex flex-col gap-2.5">
                      {!user ? (
                        <div className="flex flex-col items-center justify-center text-center py-5 my-auto">
                          {/* Guest Icon */}
                          <div className="relative mb-3 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--foreground)]/[0.04] to-transparent text-[var(--accent)] rounded-2xl flex items-center justify-center border border-[var(--accent)]/30 relative z-10">
                              <UserIcon size={22} />
                            </div>
                          </div>

                          <h3 className="text-[var(--foreground)] font-bold text-sm mb-1">
                            Welcome
                          </h3>
                          <p className="text-[10px] text-[var(--muted)] mb-4 max-w-[210px] leading-relaxed">
                            Sign in to access your wallet, orders, and special discounts.
                          </p>

                          {/* Quick Links Grid */}
                          <div className="grid grid-cols-2 gap-2 w-full mb-2.5">
                            {[
                              { label: "Games", desc: "All Games", icon: Gamepad2, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10", href: "/games" },
                              { label: "Regions", desc: "Select Region", icon: Globe, color: "text-sky-600 dark:text-sky-400 bg-sky-500/10", href: "/region" }
                            ].map((link) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="flex flex-col items-start p-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.04] text-[var(--foreground)] transition-all group">
                                  <div className={`w-6 h-6 rounded-md ${link.color} flex items-center justify-center mb-1 group-hover:scale-105 transition-transform`}>
                                    <link.icon size={13} />
                                  </div>
                                  <span className="text-[10.5px] font-bold tracking-tight leading-none">{link.label}</span>
                                  <span className="text-[8.5px] text-[var(--muted)] font-mono mt-0.5">{link.desc}</span>
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* Download / Install App */}
                          <div className="w-full mb-2.5 border border-[var(--border)] rounded-lg bg-[var(--foreground)]/[0.02]">
                            <PWAHeaderButton variant="sidebar" onAction={() => setUserMenuOpen(false)} />
                          </div>

                          <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full">
                            <motion.button
                              className="w-full py-2 bg-[var(--accent)] text-black font-black uppercase tracking-widest text-xs rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>Sign In</span>
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {/* USER PROFILE INFO - COMPACT */}
                          <div className="flex items-center gap-2.5 py-0.5">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <div className="w-8 h-8 rounded-lg overflow-hidden p-[1.5px] bg-gradient-to-tr from-[var(--accent)] via-blue-500 to-indigo-500">
                                <div className="w-full h-full rounded-[0.38rem] overflow-hidden bg-[var(--foreground)]/[0.06] flex items-center justify-center">
                                  {user?.avatar && !avatarError ? (
                                    <img
                                      src={user.avatar}
                                      alt="Avatar"
                                      className="object-cover w-full h-full"
                                      onError={() => setAvatarError(true)}
                                    />
                                  ) : (
                                    <span className="text-[var(--accent)] font-black text-xs uppercase">
                                      {user.name?.charAt(0) || "U"}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[var(--card)] ring-1 ring-emerald-400/40" />
                            </div>

                            {/* Identity Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-[var(--foreground)] tracking-tight truncate">
                                  {user.name}
                                </h4>
                                <span className={`
                                  text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded inline-flex items-center gap-0.5
                                  ${user.userType === "owner" 
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" 
                                    : user.userType === "admin"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                    : "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"}
                                `}>
                                  {user.userType === "owner" ? "👑 OWNER" : user.userType === "admin" ? "⚡ RESELLER" : "MEMBER"}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-[var(--muted)] truncate font-medium mt-0.5">
                                {user.email}
                              </p>
                            </div>

                            {/* Logout Button */}
                            <button
                              onClick={handleLogout}
                              className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shrink-0 border border-rose-500/20 active:scale-95 shadow-sm cursor-pointer"
                              title="Sign Out"
                            >
                              <LogOut size={13} />
                            </button>
                          </div>

                          {/* WALLET SECTION - COMPACT */}
                          <div className="py-2 px-3 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Wallet</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                              <div className="text-base font-black text-[var(--foreground)] tracking-tight leading-tight mt-0.5">
                                ₹{user.wallet?.toFixed(1) || "0.0"}
                              </div>
                            </div>
                            <Link
                              href="/dashboard/wallet"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <button
                                className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-black font-extrabold text-[10px] tracking-wide flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                              >
                                <Plus size={12} />
                                <span>Top Up</span>
                              </button>
                            </Link>
                          </div>

                          {/* NAVIGATION LIST (NO ICON BORDERS & SLIGHT COMPACT) */}
                          <div className="pt-0.5 flex flex-col divide-y divide-[var(--border)]">
                            {/* Primary Navigation */}
                            <div className="space-y-0.5 pb-1.5">
                              {[
                                { label: "Orders", desc: "Purchase history", icon: ShoppingBag, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", href: "/dashboard/order" },
                                { label: "Leaderboard", desc: "Top spenders", icon: Trophy, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10", href: "/leaderboard" },
                                { label: "Games", desc: "Browse catalog", icon: Gamepad2, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10", href: "/games" },
                                { label: "Regions", desc: "Server locations", icon: Globe, color: "text-sky-600 dark:text-sky-400 bg-sky-500/10", href: "/region" },
                              ].map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}>
                                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--foreground)]/[0.05] transition-all group">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}>
                                        <item.icon size={14} />
                                      </div>
                                      <div>
                                        <div className="text-xs font-semibold text-[var(--foreground)] leading-none group-hover:text-[var(--accent)] transition-colors">
                                          {item.label}
                                        </div>
                                        <div className="text-[9px] text-[var(--muted)] font-medium mt-0.5">
                                          {item.desc}
                                        </div>
                                      </div>
                                    </div>
                                    <ChevronRight size={13} className="text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                </Link>
                              ))}
                            </div>

                            {/* Secondary Navigation */}
                            <div className="space-y-0.5 pt-1.5">
                              {[
                                { label: "Dashboard", desc: "Account overview", icon: LayoutDashboard, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10", href: "/dashboard" },
                                { label: "Help & Support", desc: "24/7 assistance", icon: Headphones, color: "text-rose-600 dark:text-rose-400 bg-rose-500/10", href: "/dashboard/query" },
                              ].map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}>
                                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[var(--foreground)]/[0.05] transition-all group">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center transition-transform group-hover:scale-105 shrink-0`}>
                                        <item.icon size={14} />
                                      </div>
                                      <div>
                                        <div className="text-xs font-semibold text-[var(--foreground)] leading-none group-hover:text-[var(--accent)] transition-colors">
                                          {item.label}
                                        </div>
                                        <div className="text-[9px] text-[var(--muted)] font-medium mt-0.5">
                                          {item.desc}
                                        </div>
                                      </div>
                                    </div>
                                    <ChevronRight size={13} className="text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                </Link>
                              ))}
                              <PWAHeaderButton variant="sidebar" onAction={() => setUserMenuOpen(false)} />
                            </div>
                          </div>

                          {/* OWNER PANEL */}
                          {user.userType === "owner" && (
                            <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)} className="mt-0.5">
                              <div
                                className="w-full py-2 px-2.5 rounded-lg bg-amber-500/[0.08] hover:bg-amber-500/[0.14] border border-amber-500/25 transition-all flex items-center justify-between group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                    <Crown size={14} />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">Owner Panel</span>
                                    <span className="text-[9px] text-amber-600/80 dark:text-amber-400/70 font-medium">Manage platform</span>
                                  </div>
                                </div>
                                <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  ADMIN
                                </span>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                    </div>

                    {/* Simple Footer */}
                    <div 
                      style={{ backgroundColor: "var(--card)" }}
                      className="py-2 px-3.5 border-t border-[var(--border)] shrink-0 flex items-center justify-between bg-[var(--card)]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        <span className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">TRONICS STORE</span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--muted)]">© 2026</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* SEARCH MODAL */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
