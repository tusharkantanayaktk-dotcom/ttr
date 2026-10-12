"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { FiPlus, FiChevronDown, FiUser, FiLayout, FiSettings, FiLifeBuoy, FiLogOut, FiBarChart2, FiHome, FiGrid, FiLayers, FiGlobe, FiX, FiChevronRight, FiSearch } from "react-icons/fi";
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
        if (data.success) setUser(data.user);
        else localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
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
            { name: "Games", href: "/games", icon: FiGrid },
            { name: "Regions", href: "/region", icon: FiGlobe }
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
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--foreground)] text-xs"
            title="Search games & items (Ctrl+K)"
          >
            <FiSearch size={14} className="text-[var(--accent)]" />
            <span className="hidden md:inline font-medium">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono rounded bg-[var(--foreground)]/[0.06] border border-[var(--border)] text-[var(--muted)]">
              ⌘K
            </kbd>
          </button>

          {/* PWA Download Button */}
          <PWAHeaderButton />

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
                  />

                  {/* Sidebar Slider */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 280 }}
                    className="fixed right-0 top-0 h-[100dvh] w-[88vw] max-w-[310px] bg-[var(--card)]/95 backdrop-blur-2xl border-l border-[var(--border)] z-[1001] flex flex-col"
                  >
                    {/* Top Header Bar */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)] shrink-0 bg-[var(--foreground)]/[0.01]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)]/90">Account</span>
                      </div>
                      <motion.button
                        onClick={() => setUserMenuOpen(false)}
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-all"
                      >
                        <FiX size={14} />
                      </motion.button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3.5 py-3 custom-scrollbar flex flex-col gap-3">
                      {!user ? (
                        <div className="flex flex-col items-center justify-center text-center py-6 my-auto">
                          {/* Guest Icon */}
                          <div className="relative mb-4 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--card)] to-[var(--foreground)]/[0.04] text-[var(--accent)] rounded-2xl flex items-center justify-center border border-[var(--accent)]/30 relative z-10">
                              <FiUser size={24} />
                            </div>
                          </div>

                          <h3 className="text-[var(--foreground)] font-bold text-sm mb-1">
                            Welcome
                          </h3>
                          <p className="text-[11px] text-[var(--muted)] mb-5 max-w-[210px] leading-relaxed">
                            Sign in to access your wallet, orders, and special discounts.
                          </p>

                          {/* Quick Links Grid */}
                          <div className="grid grid-cols-2 gap-2 w-full mb-4">
                            {[
                              { label: "Games", desc: "All Games", icon: FiGrid, href: "/games" },
                              { label: "Regions", desc: "Select Region", icon: FiGlobe, href: "/region" }
                            ].map((link) => (
                              <Link key={link.label} href={link.href} onClick={() => setUserMenuOpen(false)}>
                                <div className="flex flex-col items-start p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.04] text-[var(--foreground)] transition-all group">
                                  <link.icon size={15} className="text-[var(--accent)] mb-1.5 group-hover:scale-110 transition-transform" />
                                  <span className="text-[11px] font-bold tracking-tight leading-none">{link.label}</span>
                                  <span className="text-[9px] text-[var(--muted)] font-mono mt-0.5">{link.desc}</span>
                                </div>
                              </Link>
                            ))}
                          </div>

                          <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full">
                            <motion.button
                              className="w-full py-2.5 bg-[var(--accent)] text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>Sign In</span>
                            </motion.button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {/* USER PROFILE INFO */}
                          <div className="flex items-center gap-3 py-1">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <div className="w-9 h-9 rounded-lg overflow-hidden p-[1.5px] bg-gradient-to-tr from-[var(--accent)] via-blue-500 to-indigo-500">
                                <div className="w-full h-full rounded-[0.45rem] overflow-hidden bg-[var(--card)] flex items-center justify-center">
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
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--card)] ring-1 ring-emerald-400/40" />
                            </div>

                            {/* Identity Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-[var(--foreground)] tracking-tight truncate">
                                {user.name}
                              </h4>
                              <p className="text-[10px] text-[var(--muted)] truncate font-medium mt-0.5 opacity-80">
                                {user.email}
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className={`
                                  text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border inline-flex items-center gap-1
                                  ${user.userType === "owner" 
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                    : user.userType === "admin"
                                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                    : "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20"}
                                `}>
                                  {user.userType === "owner" ? "👑 OWNER" : user.userType === "admin" ? "⚡ RESELLER" : "MEMBER"}
                                </span>
                              </div>
                            </div>

                            {/* Logout Button */}
                            <button
                              onClick={handleLogout}
                              className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shrink-0 border border-rose-500/20 active:scale-95 shadow-sm"
                              title="Sign Out"
                            >
                              <FiLogOut size={14} />
                            </button>
                          </div>

                          {/* WALLET SECTION - CLEAN FLOATING DESIGN */}
                          <div className="py-2.5 px-3 rounded-2xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/70 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Wallet</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                              <div className="text-xl font-black text-[var(--foreground)] tracking-tight mt-0.5">
                                ₹{user.wallet?.toFixed(1) || "0.0"}
                              </div>
                            </div>
                            <Link
                              href="/dashboard/wallet"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <button
                                className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-black font-extrabold text-[11px] tracking-wide flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-sm"
                              >
                                <FiPlus size={13} />
                                <span>Top Up</span>
                              </button>
                            </Link>
                          </div>

                          {/* NAVIGATION LIST (CLEAN, BORDERLESS & PREMIUM) */}
                          <div className="pt-1 flex flex-col divide-y divide-[var(--border)]/40">
                            {/* Primary Navigation */}
                            <div className="space-y-0.5 pb-2">
                              {[
                                { label: "Orders", desc: "Purchase history", icon: FiSettings, href: "/dashboard/order" },
                                { label: "Leaderboard", desc: "Top spenders", icon: FiBarChart2, href: "/leaderboard" },
                                { label: "Games", desc: "Browse catalog", icon: FiGrid, href: "/games" },
                                { label: "Regions", desc: "Server locations", icon: FiGlobe, href: "/region" },
                              ].map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}>
                                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--foreground)]/[0.04] transition-all group">
                                    <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.03] group-hover:bg-[var(--accent)]/10 text-[var(--muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                                        <item.icon size={14} />
                                      </div>
                                      <div>
                                        <div className="text-xs font-semibold text-[var(--foreground)] leading-none group-hover:text-[var(--accent)] transition-colors">
                                          {item.label}
                                        </div>
                                        <div className="text-[10px] text-[var(--muted)] font-medium mt-0.5">
                                          {item.desc}
                                        </div>
                                      </div>
                                    </div>
                                    <FiChevronRight size={13} className="text-[var(--muted)]/50 group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                </Link>
                              ))}
                            </div>

                            {/* Secondary Navigation */}
                            <div className="space-y-0.5 pt-2">
                              {[
                                { label: "Dashboard", icon: FiLayout, href: "/dashboard" },
                                { label: "Help & Support", icon: FiLifeBuoy, href: "/dashboard/query" },
                              ].map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)}>
                                  <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--foreground)]/[0.04] transition-all group">
                                    <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.03] group-hover:bg-[var(--accent)]/10 text-[var(--muted)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                                        <item.icon size={14} />
                                      </div>
                                      <span className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                                        {item.label}
                                      </span>
                                    </div>
                                    <FiChevronRight size={13} className="text-[var(--muted)]/50 group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* OWNER PANEL - SUBTLE GOLD ACCENT */}
                          {user.userType === "owner" && (
                            <Link href="/owner-panal" onClick={() => setUserMenuOpen(false)} className="mt-1">
                              <div
                                className="w-full py-2.5 px-3 rounded-xl bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-500/20 text-[var(--foreground)] transition-all flex items-center justify-between group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FiSettings size={13} />
                                  </div>
                                  <span className="text-xs font-bold text-amber-400">Owner Panel</span>
                                </div>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                                  ADMIN
                                </span>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                    </div>

                    {/* Simple Footer */}
                    <div className="py-2.5 px-4 border-t border-[var(--border)] shrink-0 flex items-center justify-between bg-[var(--foreground)]/[0.01]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        <span className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">TRONICS STORE</span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--muted)]/60">© 2026</span>
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
